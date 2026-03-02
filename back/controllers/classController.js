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
        const { codigo_acceso } = req.body;
        const usuario_id = req.session.user.id;

        const { data: clase, error: claseError } = await supabase
            .from('clases')
            .select('id')
            .eq('codigo_acceso', codigo_acceso)
            .single();

        if (claseError || !clase) {
            return res.status(404).json({ error: "Código de clase no encontrado" });
        }

        const { error: joinError } = await supabase
            .from('inscripciones') 
            .insert([{ 
                clase_id: clase.id, 
                estudiante_id: usuario_id, 
                rol_en_clase: 'estudiante' 
            }]);

        if (joinError) throw joinError;

        res.status(200).json({ message: "¡Unido con éxito!" });

    } catch (err) {
        console.error("Error al unirse:", err);
        res.status(500).json({ error: "No se pudo completar la unión a la clase" });
    }
};