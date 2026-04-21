const AssignmentModel = require('../model/assigmentModel');
const SubmissionModel = require('../model/submissionModel');
const RubricModel = require('../model/rubricModel');
const supabase = require('../config/db');
const upload = require('../config/multer');

exports.createAssignment = async (req, res) => {
    try {
        const { titulo, descripcion, puntos_maximos, fecha_entrega, clase_id, rubrica_ids } = req.body;
        const user = req.user || req.session?.user;
        
        if (!user) {
            return res.status(401).json({ error: "No has iniciado sesión" });
        }
        const creador_id = user.id; 

        const file = req.file; 
        let fileUrl = null;

        if (file) {
            const fileName = `${Date.now()}_${file.originalname}`;
            const { error: uploadError } = await supabase.storage
                .from('material-clases') 
                .upload(fileName, file.buffer, { contentType: file.mimetype });

            if (uploadError) throw uploadError;

            const { data: publicUrl } = supabase.storage
                .from('material-clases')
                .getPublicUrl(fileName);
            fileUrl = publicUrl.publicUrl;
        }

        const { data: createdAssignment, error: dbError } = await AssignmentModel.create({
            titulo,
            descripcion,
            puntos_maximos: parseInt(puntos_maximos) || 100,
            fecha_entrega,
            clase_id,
            creador_id, 
            archivo_guia_url: fileUrl 
        });

        if (dbError) throw dbError;

        const tareaId = createdAssignment?.[0]?.id;
        let rubricaIds = [];

        if (rubrica_ids) {
            try {
                rubricaIds = Array.isArray(rubrica_ids) ? rubrica_ids : JSON.parse(rubrica_ids);
            } catch (parseError) {
                rubricaIds = typeof rubrica_ids === 'string' ? rubrica_ids.split(',').map(id => id.trim()).filter(Boolean) : [];
            }
        }

        if (tareaId && Array.isArray(rubricaIds) && rubricaIds.length > 0) {
            for (const rubricaId of rubricaIds) {
                await RubricModel.assignRubricToTask(tareaId, rubricaId);
            }
        }

        res.status(201).json({ message: "Tarea creada correctamente" });
    } catch (err) {
        console.error("ERROR CRÍTICO:", err);
        res.status(500).json({ error: "No se pudo crear la tarea" });
    }
};

exports.getAssignmentsByClass = async (req, res) => {
    const { claseId } = req.params;
    const { data, error } = await AssignmentModel.getByClass(claseId);
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
};

exports.deleteAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user || req.session?.user;

        if (!user) {
            return res.status(401).json({ error: "Sesión expirada o no iniciada" });
        }

        const { data: tarea } = await supabase
            .from('tareas')
            .select('clase_id')
            .eq('id', id)
            .single();

        if (!tarea) {
            return res.status(404).json({ error: "Tarea no encontrada" });
        }

        const { data: clase } = await supabase
            .from('clases')
            .select('profesor_id')
            .eq('id', tarea.clase_id)
            .single();

        const isProfesorDeClase = clase && clase.profesor_id === user.id;

        if (!isProfesorDeClase) {
            const { data: rolData } = await supabase
                .from('inscripciones')
                .select('rol_en_clase')
                .eq('clase_id', tarea.clase_id)
                .eq('estudiante_id', user.id)
                .single();

            if (!rolData || rolData.rol_en_clase !== 'profesor') {
                return res.status(403).json({ error: 'No tienes permiso para eliminar esta tarea' });
            }
        }

        const { error } = await AssignmentModel.delete(id);
        if (error) return res.status(400).json({ error: error.message });

        res.json({ message: "Tarea eliminada correctamente" });
    } catch (err) {
        console.error('Error al eliminar tarea:', err);
        res.status(500).json({ error: 'No se pudo eliminar la tarea' });
    }
};

exports.submitSubmission = async (req, res) => {
    try {
        const { tarea_id, estudiante_id, comentario_alumno } = req.body;
        const file = req.file;
        let fileUrl = null;

        if (file) {
            const fileName = `${Date.now()}_${file.originalname}`;
            const { error: uploadError } = await supabase.storage
                .from('entregas')
                .upload(fileName, file.buffer, { contentType: file.mimetype });

            if (uploadError) throw uploadError;

            const { data: publicUrl } = supabase.storage
                .from('entregas')
                .getPublicUrl(fileName);
            fileUrl = publicUrl.publicUrl;
        }

        const { data, error } = await SubmissionModel.submit({
            tarea_id,
            estudiante_id,
            archivo_entrega_url: fileUrl,
            comentario_alumno: comentario_alumno || ''
        });

        if (error) throw error;

        res.status(201).json({ message: "Entrega realizada correctamente" });
    } catch (err) {
        console.error("Error al entregar:", err);
        res.status(500).json({ error: "No se pudo realizar la entrega" });
    }
};

exports.gradeSubmission = async (req, res) => {
    try {
        const { id } = req.params;
        const { calificacion, comentario_profesor } = req.body;

        const { data, error } = await SubmissionModel.grade(id, calificacion, comentario_profesor || '');

        if (error) throw error;

        res.json({ message: "Calificación guardada" });
    } catch (err) {
        console.error("Error al calificar:", err);
        res.status(500).json({ error: "No se pudo guardar la calificación" });
    }
};

exports.cancelSubmission = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user || req.session?.user;

        if (!user) {
            return res.status(401).json({ error: "Sesión expirada o no iniciada" });
        }

        const { data: entrega } = await supabase
            .from('entregas')
            .select('estudiante_id, calificacion')
            .eq('id', id)
            .single();

        if (!entrega) {
            return res.status(404).json({ error: "Entrega no encontrada" });
        }

        if (entrega.estudiante_id !== user.id) {
            return res.status(403).json({ error: "No tienes permiso para anular esta entrega" });
        }

        if (entrega.calificacion !== null && entrega.calificacion !== undefined) {
            return res.status(400).json({ error: "No puedes anular una entrega que ya ha sido calificada" });
        }

        const { error: deleteError } = await supabase
            .from('entregas')
            .delete()
            .eq('id', id);

        if (deleteError) throw deleteError;

        res.json({ message: "Entrega anulada correctamente" });
    } catch (err) {
        console.error("Error al anular entrega:", err);
        res.status(500).json({ error: "No se pudo anular la entrega" });
    }
};