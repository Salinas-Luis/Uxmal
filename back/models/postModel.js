const supabase = require('../config/db');

class PostModel {
    static async create(postData) {
        const { data, error } = await supabase
            .from('anuncios')
            .insert([{
                clase_id: postData.clase_id,
                autor_id: postData.autor_id,
                contenido: postData.contenido,
                archivo_adjunto_url: postData.archivo_adjunto_url
            }])
            .select();
        return { data, error };
    }

static async getByClass(claseId) {
    const { data, error } = await supabase
        .from('anuncios')
        .select(`
            *,
            usuarios (nombre, apellido, avatar_url) -- Trae datos del autor siempre
        `)
        .eq('clase_id', claseId);
    return { data, error };
}
}

module.exports = PostModel;