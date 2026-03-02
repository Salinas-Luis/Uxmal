const AssignmentModel = require('../model/assigmentModel');
const supabase = require('../config/db');

exports.createAssignment = async (req, res) => {
    try {
        const { clase_id, titulo, instrucciones, puntos_maximos, fecha_entrega } = req.body;
        let archivoUrl = null;

        if (req.file) {
            const file = req.file;
            const fileName = `${Date.now()}_${file.originalname}`;
            
            const { data, error } = await supabase.storage
                .from('material-clases')
                .upload(fileName, file.buffer, {
                    contentType: file.mimetype,
                    upsert: false
                });

            if (error) throw error;

            const { data: publicUrl } = supabase.storage
                .from('material-clases')
                .getPublicUrl(fileName);
            
            archivoUrl = publicUrl.publicUrl;
        }

        const { data, error } = await AssignmentModel.create({
            clase_id,
            titulo,
            instrucciones,
            puntos_maximos,
            fecha_entrega,
            archivo_guia_url: archivoUrl
        });

        if (error) return res.status(400).json({ error: error.message });
        res.status(201).json(data[0]);
    } catch (err) {
        res.status(500).json({ error: "Error al crear tarea con archivo" });
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