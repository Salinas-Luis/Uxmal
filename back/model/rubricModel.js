const supabase = require('../config/db');

class RubricModel {
    static async create(rubricData) {
        const { data, error } = await supabase
            .from('rubricas')
            .insert([{
                tarea_id: rubricData.tarea_id,
                criterio: rubricData.criterio,
                descripcion: rubricData.descripcion || '',
                puntos_maximos: rubricData.puntos_maximos,
                orden: rubricData.orden || 0
            }])
            .select();
        return { data, error };
    }

    static async getByTaskId(tareaId) {
        const { data, error } = await supabase
            .from('rubricas')
            .select('*')
            .eq('tarea_id', tareaId)
            .order('orden', { ascending: true });
        return { data, error };
    }

    static async getById(id) {
        const { data, error } = await supabase
            .from('rubricas')
            .select('*')
            .eq('id', id)
            .single();
        return { data, error };
    }

    static async update(id, rubricData) {
        const { data, error } = await supabase
            .from('rubricas')
            .update({
                criterio: rubricData.criterio,
                descripcion: rubricData.descripcion,
                puntos_maximos: rubricData.puntos_maximos,
                orden: rubricData.orden
            })
            .eq('id', id)
            .select();
        return { data, error };
    }

    static async delete(id) {
        const { error } = await supabase
            .from('rubricas')
            .delete()
            .eq('id', id);
        return { error };
    }

    static async gradeRubric(entregaId, rubricaId, puntosObtenidos) {
        const { data, error } = await supabase
            .from('calificaciones_rubrica')
            .upsert({
                entrega_id: entregaId,
                rubrica_id: rubricaId,
                puntos_obtenidos: puntosObtenidos
            }, { onConflict: 'entrega_id,rubrica_id' })
            .select();
        return { data, error };
    }

    static async getSubmissionGrades(entregaId) {
        const { data, error } = await supabase
            .from('calificaciones_rubrica')
            .select(`
                *,
                rubricas (id, criterio, descripcion, puntos_maximos)
            `)
            .eq('entrega_id', entregaId)
            .order('rubricas.orden', { ascending: true });
        return { data, error };
    }

    static async deleteSubmissionGrades(entregaId) {
        const { error } = await supabase
            .from('calificaciones_rubrica')
            .delete()
            .eq('entrega_id', entregaId);
        return { error };
    }
}

module.exports = RubricModel;
