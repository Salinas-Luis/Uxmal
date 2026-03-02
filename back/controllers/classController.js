const ClassModel = require('../model/classModel');
const supabase = require('../config/db'); 

const crypto = require('crypto'); 

exports.createClass = async (req, res) => {
    try {
        const { nombre_clase, seccion, materia, profesor_id } = req.body;

        const codigo_acceso = crypto.randomBytes(3).toString('hex'); 

        const { data: nuevaClase, error: errorClase } = await supabase
            .from('clases')
            .insert([{ 
                nombre_clase, 
                seccion, 
                materia, 
                profesor_id, 
                codigo_acceso 
            }])
            .select()
            .single();

        if (errorClase) throw errorClase;

        await supabase
            .from('inscripciones')
            .insert([{ 
                estudiante_id: profesor_id, 
                clase_id: nuevaClase.id, 
                rol_en_clase: 'profesor' 
            }]);

        res.status(201).json(nuevaClase);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "No se pudo crear la clase" });
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