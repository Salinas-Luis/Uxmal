const supabase = require('../config/db');

class PostModel {
    static async create(postData) {
        const { data, error } = await supabase
            .from('anuncios')
            .insert([{
                clase_id: postData.clase_id,
                autor_id: postData.autor_id,
                contenido: postData.contenido,
                fecha_publicacion: new Date() 
            }])
            .select();
        return { data, error };
    }

    static async delete(postId) {
        const { data, error } = await supabase
            .from('anuncios')
            .delete()
            .eq('id', postId);
        return { data, error };
    }

static async getByClass(claseId) {
    try {
        const [anunciosRes, tareasRes] = await Promise.all([
            supabase
                .from('anuncios')
                .select('*, autor:usuarios!autor_id(nombre, apellido, avatar_url)')
                .eq('clase_id', claseId),
            
            supabase
                .from('tareas')
                .select('*, autor:usuarios!creador_id(nombre, apellido, avatar_url)')
                .eq('clase_id', claseId)
        ]);

        const anuncios = (anunciosRes.data || []).map(a => ({
            ...a,
            tipo: 'anuncio',
            fecha_orden: a.fecha_publicacion || a.created_at 
        }));

        const tareas = (tareasRes.data || []).map(t => ({
            ...t,
            tipo: 'tarea',
            fecha_orden: t.fecha_creacion || t.created_at 
        }));

        return { 
            data: [...anuncios, ...tareas].sort((a, b) => new Date(b.fecha_orden) - new Date(a.fecha_orden)), 
            error: null 
        };
    } catch (error) {
        return { data: null, error };
    }
}
}

module.exports = PostModel;