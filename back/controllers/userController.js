const supabase = require('../config/db');

exports.updateAvatar = async (req, res) => {
    try {
        const { userId } = req.body;
        const file = req.file; 

        if (!file) {
            return res.status(400).json({ error: "No se subió ningún archivo" });
        }

        const fileName = `avatar_${userId}_${Date.now()}`;

        const { data, error } = await supabase.storage
            .from('avatars')
            .upload(fileName, file.buffer, { 
                contentType: file.mimetype,
                upsert: true
            });

        if (error) throw error;

        const { data: publicUrl } = supabase.storage.from('avatars').getPublicUrl(fileName);
        const url = publicUrl.publicUrl;

        const { error: dbError } = await supabase
            .from('usuarios')
            .update({ avatar_url: url })
            .eq('id', userId);

        if (dbError) throw dbError;

        res.json({ url });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "No se pudo actualizar la foto de perfil" });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const user = req.user || req.session?.user;
        if (!user) {
            return res.status(401).json({ error: "Sesión expirada o no iniciada" });
        }

        const { nombre, apellido, email } = req.body;

        if (!nombre || !apellido || !email) {
            return res.status(400).json({ error: "Todos los campos son requeridos" });
        }

        const { error } = await supabase
            .from('usuarios')
            .update({ nombre, apellido, email })
            .eq('id', user.id);

        if (error) throw error;

        res.json({ message: "Perfil actualizado correctamente" });
    } catch (err) {
        console.error('Error al actualizar perfil:', err);
        res.status(500).json({ error: "No se pudo actualizar el perfil" });
    }
};

exports.deleteAccount = async (req, res) => {
    try {
        const user = req.user || req.session?.user;
        if (!user) {
            return res.status(401).json({ error: "Sesión expirada o no iniciada" });
        }


        await supabase.from('entregas').delete().eq('estudiante_id', user.id);

        await supabase.from('tareas').delete().eq('creador_id', user.id);

        await supabase.from('anuncios').delete().eq('autor_id', user.id);

        await supabase.from('inscripciones').delete().eq('estudiante_id', user.id);

        const { error } = await supabase
            .from('usuarios')
            .delete()
            .eq('id', user.id);

        if (error) throw error;

        req.session.destroy((err) => {
            if (err) console.error('Error al destruir sesión:', err);
        });

        res.json({ message: "Cuenta eliminada correctamente" });
    } catch (err) {
        console.error('Error al eliminar cuenta:', err);
        res.status(500).json({ error: "No se pudo eliminar la cuenta" });
    }
};