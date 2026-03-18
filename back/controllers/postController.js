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

exports.deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        if (!req.session || !req.session.user) {
            return res.status(401).json({ error: "Sesión expirada o no iniciada" });
        }

        // Verificar que el usuario es profesor de la clase del anuncio
        const { data: post } = await supabase.from('anuncios').select('clase_id').eq('id', postId).single();
        if (!post) return res.status(404).json({ error: 'Anuncio no encontrado' });

        const { data: rolData } = await supabase
            .from('inscripciones')
            .select('rol_en_clase')
            .eq('clase_id', post.clase_id)
            .eq('estudiante_id', req.session.user.id)
            .single();

        if (!rolData || rolData.rol_en_clase !== 'profesor') {
            return res.status(403).json({ error: 'No tienes permiso para eliminar este anuncio' });
        }

        const { error } = await PostModel.delete(postId);
        if (error) throw error;

        res.json({ message: 'Anuncio eliminado' });
    } catch (err) {
        console.error('Error en deletePost:', err);
        res.status(500).json({ error: 'No se pudo eliminar el anuncio' });
    }
};