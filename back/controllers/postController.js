const PostModel = require('../model/postModel');
const supabase = require('../config/db');
exports.createPost = async (req, res) => {
    try {
        const { contenido, clase_id } = req.body;
        const autor_id = req.session.user.id;

        const { data, error } = await supabase
            .from('anuncios')
            .insert([{ 
                contenido, 
                clase_id, 
                autor_id,
                fecha_publicacion: new Date() 
            }])
            .select();

        if (error) throw error;

        res.status(201).json(data[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "No se pudo publicar el anuncio" });
    }
};