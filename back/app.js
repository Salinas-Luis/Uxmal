const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const supabase = require('./config/db');

const userRoutes = require('./routes/userRoutes');
const classRoutes = require('./routes/classRoutes');
const assignmentRoutes = require('./routes/assigmentRoutes'); 
const postRoutes = require('./routes/postRoutes');
const PostModel = require('./model/postModel');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const { authenticateToken } = require('./middleware/authMiddleware');

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(session({
    secret: 'keyboard cat', 
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, 
        httpOnly: true, 
        maxAge: 3600000 
    }
}));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../front/views'));

app.use('/public', express.static(path.join(__dirname, '../front/public')));

app.use('/api/auth', userRoutes);
app.use('/api/classes', authenticateToken, classRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/posts', postRoutes);


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../front/views/index.html'));
});

app.get('/login', (req, res) => {
    res.render('login'); 
});

app.get('/registro', (req, res) => {
    res.render('register'); 
});

app.get('/dashboard', authenticateToken, async (req, res) => {
    try {
        const user = req.user || req.session?.user;

        if (!user) {
            return res.redirect('/login'); 
        }

        const { data: clases, error } = await supabase
            .from('inscripciones')
            .select(`
                clase_id,
                clases (
                    id,
                    nombre_clase,
                    seccion,
                    codigo_acceso,
                    portada_url,
                    profesor_id,
                    profesor:usuarios!profesor_id ( nombre, apellido )
                )
            `)
            .eq('estudiante_id', user.id);

        if (error) throw error;

        const listaClases = clases.map(item => ({
            ...item.clases,
            isProfesor: item.clases.profesor_id === user.id
        }));

        res.render('dashboard', { 
            user: user, 
            clases: listaClases || [] 
        });

    } catch (error) {
        console.error("Error en Dashboard:", error);
        res.render('dashboard', { 
            user: req.user || req.session?.user || {}, 
            clases: [] 
        });
    }
});

app.get('/clase/:id', authenticateToken, async (req, res) => {
    try {
        const claseId = req.params.id;
        const user = req.user || req.session?.user || {}; 

        const { data: clase } = await supabase.from('clases').select('*').eq('id', claseId).single();
        
        const { data: posts, error } = await PostModel.getByClass(claseId);
        if (error) throw error;

        const { data: rolData } = await supabase
            .from('inscripciones')
            .select('rol_en_clase')
            .eq('clase_id', claseId)
            .eq('estudiante_id', user.id)
            .single();

        const isProfesor = rolData?.rol_en_clase === 'profesor';

        let classPerformance = null;
        if (isProfesor) {
            const { data: tareas } = await supabase
                .from('tareas')
                .select('id, fecha_entrega, puntos_maximos')
                .eq('clase_id', claseId);

            const { data: estudiantes } = await supabase
                .from('inscripciones')
                .select('usuarios(id)')
                .eq('clase_id', claseId)
                .eq('rol_en_clase', 'estudiante');

            if (tareas && tareas.length > 0 && estudiantes && estudiantes.length > 0) {
                const { data: entregas } = await supabase
                    .from('entregas')
                    .select('tarea_id, estudiante_id, fecha_envio, calificacion')
                    .in('tarea_id', tareas.map(t => t.id));

                const totalEstudiantes = estudiantes.length;
                const totalTareas = tareas.length;
                const totalEntregas = entregas ? entregas.length : 0;
                
                let entregadasAtiempo = 0;
                let entregadasTarde = 0;
                let noEntregadas = 0;
                let totalCalificaciones = 0;
                let countCalificadas = 0;

                const entregasMap = new Map();
                entregas?.forEach(e => {
                    const key = `${e.tarea_id}-${e.estudiante_id}`;
                    entregasMap.set(key, e);
                });

                tareas.forEach(tarea => {
                    estudiantes.forEach(est => {
                        const key = `${tarea.id}-${est.usuarios.id}`;
                        const entrega = entregasMap.get(key);
                        
                        if (!entrega) {
                            noEntregadas++;
                        } else {
                            const entregaDate = new Date(entrega.fecha_envio);
                            const deadlineDate = new Date(tarea.fecha_entrega);
                            
                            if (entregaDate <= deadlineDate) {
                                entregadasAtiempo++;
                            } else {
                                entregadasTarde++;
                            }
                            
                            if (entrega.calificacion !== null && entrega.calificacion !== undefined) {
                                totalCalificaciones += entrega.calificacion;
                                countCalificadas++;
                            }
                        }
                    });
                });

                classPerformance = {
                    totalEstudiantes,
                    totalTareas,
                    totalEntregas,
                    entregadasAtiempo,
                    entregadasTarde,
                    noEntregadas,
                    porcentajeEntrega: totalTareas * totalEstudiantes > 0 
                        ? ((totalEntregas / (totalTareas * totalEstudiantes)) * 100).toFixed(1) 
                        : 0,
                    promedioCalificacion: countCalificadas > 0 
                        ? (totalCalificaciones / countCalificadas).toFixed(2) 
                        : 0,
                    tareasSinCalificar: totalEntregas - countCalificadas
                };
            }
        }

        res.render('clase', { clase, posts: posts || [], user, isProfesor, classPerformance });
    } catch (error) {
        console.error("Error al cargar la clase:", error);
        res.status(500).send("Error al cargar la clase");
    }
});

app.get('/clase/:id/tareas', authenticateToken, async (req, res) => {
    try {
        const claseId = req.params.id;
        const user = req.user || req.session?.user || {};
        const { data: clase } = await supabase.from('clases').select('*').eq('id', claseId).single();
        
        const { data: tareas } = await supabase
            .from('tareas')
            .select('*')
            .eq('clase_id', claseId)
            .order('fecha_creacion', { ascending: false });

        const { data: rolData } = await supabase
            .from('inscripciones')
            .select('rol_en_clase')
            .eq('clase_id', claseId)
            .eq('estudiante_id', user.id)
            .single();

        const isProfesor = rolData?.rol_en_clase === 'profesor';

        res.render('tareas', { clase, tareas: tareas || [], user, isProfesor });
    } catch (error) {
        res.status(500).send("Error al cargar tareas");
    }
});

app.get('/tarea/:id', authenticateToken, async (req, res) => {
    try {
        const tareaId = req.params.id;
        const user = req.user || req.session?.user || { id: null };

        const { data: tarea } = await supabase
            .from('tareas')
            .select('*, clases(nombre_clase, profesor:usuarios!profesor_id(nombre, apellido))')
            .eq('id', tareaId)
            .single();

        const { data: rolData } = await supabase
            .from('inscripciones')
            .select('rol_en_clase')
            .eq('clase_id', tarea.clase_id)
            .eq('estudiante_id', user.id)
            .single();

        const rol = rolData ? rolData.rol_en_clase : 'estudiante';

        let entregas = null;
        let entrega = null;
        let alumnosConEstado = null;

        if (rol === 'profesor') {
            const { data: allEntregas } = await supabase
                .from('entregas')
                .select('*, estudiante:usuarios(nombre, apellido)')
                .eq('tarea_id', tareaId);
            entregas = allEntregas || [];

            const { data: inscritos } = await supabase
                .from('inscripciones')
                .select('usuarios(*)')
                .eq('clase_id', tarea.clase_id)
                .eq('rol_en_clase', 'estudiante');

            alumnosConEstado = (inscritos || []).map(ins => {
                const entrega = (entregas || []).find(e => e.estudiante_id === ins.usuarios.id);
                return {
                    ...ins.usuarios,
                    entrega: entrega || null
                };
            });
        } else {
            const { data: userEntrega } = await supabase
                .from('entregas')
                .select('*')
                .eq('tarea_id', tareaId)
                .eq('estudiante_id', user.id)
                .single();
            entrega = userEntrega;
        }

        res.render('detalle_tarea', { tarea, entrega, entregas, alumnosConEstado, rol, user });
    } catch (error) {
        console.error("Error al cargar tarea:", error);
        res.status(500).send("Error al cargar la tarea");
    }
});

app.get('/tarea/:id/revision', authenticateToken, async (req, res) => {
    try {
        const tareaId = req.params.id;
        const { data: tarea } = await supabase.from('tareas').select('*').eq('id', tareaId).single();

        const { data: inscritos } = await supabase
            .from('inscripciones')
            .select('usuarios(*)')
            .eq('clase_id', tarea.clase_id)
            .eq('rol_en_clase', 'estudiante');

        const { data: entregas } = await supabase
            .from('entregas')
            .select('*')
            .eq('tarea_id', tareaId);

        const alumnosConEstado = (inscritos || []).map(ins => {
            const entrega = (entregas || []).find(e => e.estudiante_id === ins.usuarios.id);
            return {
                ...ins.usuarios,
                entrega: entrega || null,
                puntos_maximos_tarea: tarea.puntos_maximos
            };
        });

        res.render('ver_entregas', { tarea, alumnos: alumnosConEstado });
    } catch (error) {
        res.status(500).send("Error en la revisión");
    }
});
app.get('/clase/:id/personas', authenticateToken, async (req, res) => {
    try {
        const claseId = req.params.id;
        const user = req.user || req.session?.user || {};

        const { data: clase } = await supabase
            .from('clases')
            .select('*')
            .eq('id', claseId)
            .single();

        const { data: inscritos, error } = await supabase
            .from('inscripciones')
            .select(`
                rol_en_clase,
                usuarios (
                    id,
                    nombre,
                    apellido,
                    avatar_url
                )
            `)
            .eq('clase_id', claseId);

        if (error) throw error;

        const profesores = inscritos.filter(i => i.rol_en_clase === 'profesor');
        const alumnos = inscritos.filter(i => i.rol_en_clase === 'estudiante');

        const rolUsuarioEnClase = inscritos.find(i => i.usuarios.id === user.id)?.rol_en_clase;
        const isProfesor = rolUsuarioEnClase === 'profesor';

        res.render('personas', { 
            clase, 
            profesores, 
            alumnos, 
            user, 
            isProfesor
        });

    } catch (error) {
        console.error("Error en Personas:", error);
        res.status(500).send("Error al cargar la lista de personas");
    }
});
app.get('/perfil', authenticateToken, (req, res) => {
    res.render('perfil', { user: req.user || req.session?.user || {} });
});
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error al cerrar sesión:", err);
            return res.redirect('/dashboard');
        }
        res.clearCookie('connect.sid');
        res.redirect('/login'); 
    });
});
const PORT = process.env.PORT || 3000;
app.listen("https://uxmal-6t33.vercel.app", () => {
    console.log(`Uxmal corriendo en https://uxmal-6t33.vercel.app`);
});