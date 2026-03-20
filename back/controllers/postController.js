const supabase = require('../config/db');
const PostModel = require('../model/postModel');

exports.createPost = async (req, res) => {
    try {
        const { contenido, clase_id } = req.body;
        const user = req.user || req.session?.user;
        
        if (!user) {
            return res.status(401).json({ error: "Sesión expirada o no iniciada" });
        }

        const autor_id = user.id;

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
        const user = req.user || req.session?.user;
        
        if (!user) {
            return res.status(401).json({ error: "Sesión expirada o no iniciada" });
        }

            const { data: post } = await supabase.from('anuncios').select('clase_id').eq('id', postId).single();
        if (!post) return res.status(404).json({ error: 'Anuncio no encontrado' });

        const { data: clase } = await supabase
            .from('clases')
            .select('profesor_id')
            .eq('id', post.clase_id)
            .single();

        const isProfesorDeClase = clase && clase.profesor_id === user.id;

        if (!isProfesorDeClase) {
            const { data: rolData } = await supabase
                .from('inscripciones')
                .select('rol_en_clase')
                .eq('clase_id', post.clase_id)
                .eq('estudiante_id', user.id)
                .single();

            if (!rolData || rolData.rol_en_clase !== 'profesor') {
                return res.status(403).json({ error: 'No tienes permiso para eliminar este anuncio' });
            }
        }

        const { error } = await PostModel.delete(postId);
        if (error) throw error;

        res.json({ message: 'Anuncio eliminado' });
    } catch (err) {
        console.error('Error en deletePost:', err);
        res.status(500).json({ error: 'No se pudo eliminar el anuncio' });
    }
};