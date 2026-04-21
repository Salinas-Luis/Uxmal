const RubricModel = require('../model/rubricModel');
const supabase = require('../config/db');

exports.createRubric = async (req, res) => {
    try {
        const { tarea_id, criterio, descripcion, puntos_maximos, orden } = req.body;
        const user = req.user || req.session?.user;

        if (!user) {
            return res.status(401).json({ error: "Sesión expirada o no iniciada" });
        }

        const { data: tarea } = await supabase
            .from('tareas')
            .select('clase_id, creador_id')
            .eq('id', tarea_id)
            .single();

        if (!tarea) {
            return res.status(404).json({ error: "Tarea no encontrada" });
        }

        const { data: clase } = await supabase
            .from('clases')
            .select('profesor_id')
            .eq('id', tarea.clase_id)
            .single();

        if (!clase || clase.profesor_id !== user.id) {
            return res.status(403).json({ error: "No tienes permiso para agregar rubricas" });
        }

        const { data, error } = await RubricModel.create({
            tarea_id,
            criterio,
            descripcion,
            puntos_maximos,
            orden
        });

        if (error) throw error;

        res.status(201).json(data[0]);
    } catch (err) {
        console.error("Error al crear rubrica:", err);
        res.status(500).json({ error: "No se pudo crear la rubrica" });
    }
};

exports.getRubricsByTask = async (req, res) => {
    try {
        const { tareaId } = req.params;

        const { data, error } = await RubricModel.getByTaskId(tareaId);

        if (error) throw error;

        res.json(data || []);
    } catch (err) {
        console.error("Error al obtener rubricas:", err);
        res.status(500).json({ error: "No se pudieron obtener las rubricas" });
    }
};

exports.updateRubric = async (req, res) => {
    try {
        const { id } = req.params;
        const { criterio, descripcion, puntos_maximos, orden } = req.body;
        const user = req.user || req.session?.user;

        if (!user) {
            return res.status(401).json({ error: "Sesión expirada o no iniciada" });
        }

        const { data: rubrica } = await RubricModel.getById(id);
        if (!rubrica) {
            return res.status(404).json({ error: "Rubrica no encontrada" });
        }

        const { data: tarea } = await supabase
            .from('tareas')
            .select('clase_id')
            .eq('id', rubrica.tarea_id)
            .single();

        const { data: clase } = await supabase
            .from('clases')
            .select('profesor_id')
            .eq('id', tarea.clase_id)
            .single();

        if (!clase || clase.profesor_id !== user.id) {
            return res.status(403).json({ error: "No tienes permiso para editar esta rubrica" });
        }

        const { data, error } = await RubricModel.update(id, {
            criterio,
            descripcion,
            puntos_maximos,
            orden
        });

        if (error) throw error;

        res.json(data[0]);
    } catch (err) {
        console.error("Error al actualizar rubrica:", err);
        res.status(500).json({ error: "No se pudo actualizar la rubrica" });
    }
};

exports.deleteRubric = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user || req.session?.user;

        if (!user) {
            return res.status(401).json({ error: "Sesión expirada o no iniciada" });
        }

        const { data: rubrica } = await RubricModel.getById(id);
        if (!rubrica) {
            return res.status(404).json({ error: "Rubrica no encontrada" });
        }

        const { data: tarea } = await supabase
            .from('tareas')
            .select('clase_id')
            .eq('id', rubrica.tarea_id)
            .single();

        const { data: clase } = await supabase
            .from('clases')
            .select('profesor_id')
            .eq('id', tarea.clase_id)
            .single();

        if (!clase || clase.profesor_id !== user.id) {
            return res.status(403).json({ error: "No tienes permiso para eliminar esta rubrica" });
        }

        const { error } = await RubricModel.delete(id);

        if (error) throw error;

        res.json({ message: "Rubrica eliminada correctamente" });
    } catch (err) {
        console.error("Error al eliminar rubrica:", err);
        res.status(500).json({ error: "No se pudo eliminar la rubrica" });
    }
};

exports.getSubmissionGrades = async (req, res) => {
    try {
        const { entregaId } = req.params;

        const { data, error } = await RubricModel.getSubmissionGrades(entregaId);

        if (error) throw error;

        res.json(data || []);
    } catch (err) {
        console.error("Error al obtener calificaciones:", err);
        res.status(500).json({ error: "No se pudieron obtener las calificaciones" });
    }
};

exports.gradeSubmissionRubrics = async (req, res) => {
    try {
        const { entregaId } = req.params;
        const { calificaciones } = req.body; 
        const user = req.user || req.session?.user;

        if (!user) {
            return res.status(401).json({ error: "Sesión expirada o no iniciada" });
        }

        const { data: entrega } = await supabase
            .from('entregas')
            .select('tarea_id')
            .eq('id', entregaId)
            .single();

        if (!entrega) {
            return res.status(404).json({ error: "Entrega no encontrada" });
        }

        const { data: tarea } = await supabase
            .from('tareas')
            .select('clase_id')
            .eq('id', entrega.tarea_id)
            .single();

        const { data: clase } = await supabase
            .from('clases')
            .select('profesor_id')
            .eq('id', tarea.clase_id)
            .single();

        if (!clase || clase.profesor_id !== user.id) {
            return res.status(403).json({ error: "No tienes permiso para calificar" });
        }

        for (const calificacion of calificaciones) {
            await RubricModel.gradeRubric(
                entregaId,
                calificacion.rubrica_id,
                calificacion.puntos_obtenidos
            );
        }

        res.json({ message: "Calificaciones guardadas correctamente" });
    } catch (err) {
        console.error("Error al guardar calificaciones:", err);
        res.status(500).json({ error: "No se pudieron guardar las calificaciones" });
    }
};
