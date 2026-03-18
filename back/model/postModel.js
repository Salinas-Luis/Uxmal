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
        try {
            const [anunciosRes, tareasRes] = await Promise.all([
                supabase
                    .from('anuncios')
                    .select('*, usuarios(nombre, apellido, avatar_url)')
                    .eq('clase_id', claseId),
                supabase
                    .from('tareas')
                    .select('*, usuarios!creador_id(nombre, apellido, avatar_url)') 
                    .eq('clase_id', claseId)
            ]);

            if (anunciosRes.error) throw anunciosRes.error;
            if (tareasRes.error) throw tareasRes.error;

            const anuncios = anunciosRes.data.map(a => ({ 
                ...a, 
                tipo: 'anuncio', 
                fecha_orden: a.fecha_publicacion || a.created_at 
            }));

            const tareas = tareasRes.data.map(t => ({ 
                ...t, 
                tipo: 'tarea', 
                fecha_orden: t.fecha_creacion 
            }));

            const feed = [...anuncios, ...tareas].sort((a, b) => 
                new Date(b.fecha_orden) - new Date(a.fecha_orden)
            );

            return { data: feed, error: null };
        } catch (error) {
            console.error("Error en getByClass:", error);
            return { data: null, error };
        }
    }
}

module.exports = PostModel;