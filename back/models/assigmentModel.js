const supabase = require('../config/db');

class AssignmentModel {

    static async create(assignmentData) {
        const { data, error } = await supabase
            .from('tareas')
            .insert([
                {
                    clase_id: assignmentData.clase_id,
                    titulo: assignmentData.titulo,
                    instrucciones: assignmentData.instrucciones,
                    puntos_maximos: assignmentData.puntos_maximos || 100,
                    fecha_entrega: assignmentData.fecha_entrega,
                    archivo_guia_url: assignmentData.archivo_guia_url 
                }
            ])
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


    static async getById(id) {
        const { data, error } = await supabase
            .from('tareas')
            .select('*')
            .eq('id', id)
            .single();
        
        return { data, error };
    }

    static async delete(id) {
        const { error } = await supabase
            .from('tareas')
            .delete()
            .eq('id', id);
        
        return { error };
    }
}

module.exports = AssignmentModel;