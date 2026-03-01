const ClassModel = require('../model/classModel');

exports.createClass = async (req, res) => {
    try {
        const { nombre_clase, seccion, materia, profesor_id } = req.body;
        
        const { data: nuevaClase, error: errorClase } = await ClassModel.create({ 
            nombre_clase, seccion, materia, profesor_id 
        });
        
        if (errorClase) return res.status(400).json({ error: errorClase.message });

        await supabase
            .from('inscripciones')
            .insert([{ 
                clase_id: nuevaClase[0].id, 
                estudiante_id: profesor_id, 
                rol_en_clase: 'profesor' 
            }]);

        res.status(201).json({ message: "Clase creada", clase: nuevaClase[0] });
    } catch (err) {
        res.status(500).json({ error: "Error al crear clase" });
    }
};

exports.joinClass = async (req, res) => {
    try {
        const { codigo_acceso, estudiante_id } = req.body;
        const { data: clase, error: errClase } = await ClassModel.findByCode(codigo_acceso);
        
        if (!clase) return res.status(404).json({ error: "Código de clase no válido" });

        const { data, error } = await ClassModel.join(clase.id, estudiante_id);
        if (error) return res.status(400).json({ error: "Ya estás inscrito en esta clase" });

        res.json({ message: "Te has unido a la clase", clase });
    } catch (err) {
        res.status(500).json({ error: "Error al unirse" });
    }
};