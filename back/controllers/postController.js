const PostModel = require('../model/postModel');

exports.createPost = async (req, res) => {
    try {
        const { contenido, clase_id } = req.body;
        if (!req.session || !req.session.user) {
            return res.status(401).json({ error: "Sesión expirada o no iniciada" });
        }

        const autor_id = req.session.user.id;

        const { data, error } = await PostModel.create({
            contenido,
            clase_id,
            autor_id
        });

        if (error) {
            console.error("Error de Supabase:", error);
            throw error;
        }

        res.status(201).json(data[0]);
    } catch (err) {
        console.error("Error en createPost:", err);
        res.status(500).json({ error: "No se pudo publicar el anuncio", detalle: err.message });
    }
};