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