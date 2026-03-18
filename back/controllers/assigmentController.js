const AssignmentModel = require('../model/assigmentModel');
const supabase = require('../config/db');

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