const AssignmentModel = require('../model/assigmentModel');
const SubmissionModel = require('../model/submissionModel');
const supabase = require('../config/db');
const upload = require('../config/multer');

exports.createAssignment = async (req, res) => {
    try {
        const { titulo, descripcion, puntos_maximos, fecha_entrega, clase_id } = req.body;
        
        if (!req.session || !req.session.user) {
            return res.status(401).json({ error: "No has iniciado sesión" });
        }
        const creador_id = req.session.user.id; 

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

        const { error: dbError } = await AssignmentModel.create({
            titulo,
            descripcion,
            puntos_maximos: parseInt(puntos_maximos) || 100,
            fecha_entrega,
            clase_id,
            creador_id, 
            archivo_guia_url: fileUrl 
        });

        if (dbError) throw dbError;

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
    const { id } = req.params;
    const { error } = await AssignmentModel.delete(id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: "Tarea eliminada correctamente" });
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