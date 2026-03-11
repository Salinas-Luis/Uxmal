const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const supabase = require('./config/db');

const userRoutes = require('./routes/userRoutes');
const classRoutes = require('./routes/classRoutes');
const assignmentRoutes = require('./routes/assigmentRoutes'); 
const postRoutes = require('./routes/postRoutes');
const session = require('express-session');

const app = express();

app.use(cors());
app.use(express.json()); 
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
app.use('/api/classes', classRoutes);
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

app.get('/dashboard', async (req, res) => {
    try {
        const user = req.session?.user;

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
                    codigo_acceso
                )
            `)
            .eq('estudiante_id', user.id);

        if (error) throw error;

        const listaClases = clases.map(item => item.clases);

        res.render('dashboard', { 
            user: user, 
            clases: listaClases || [] 
        });

    } catch (error) {
        console.error("Error en Dashboard:", error);
        res.render('dashboard', { 
            user: req.session?.user || {}, 
            clases: [] 
        });
    }
});

app.get('/clase/:id', async (req, res) => {
    try {
        const claseId = req.params.id;
        const user = req.session?.user || {}; 

        const { data: clase } = await supabase.from('clases').select('*').eq('id', claseId).single();
        
        const { data: posts } = await supabase
            .from('anuncios')
            .select(`*, usuarios:autor_id(nombre, apellido)`) 
            .eq('clase_id', claseId)
            .order('fecha_publicacion', { ascending: false });

        const postsFormateados = (posts || []).map(p => ({
            ...p,
            autor_nombre: p.usuarios ? `${p.usuarios.nombre} ${p.usuarios.apellido}` : 'Usuario'
        }));

        res.render('clase', { clase, posts: postsFormateados, user });
    } catch (error) {
        res.status(500).send("Error al cargar la clase");
    }
});

app.get('/clase/:id/tareas', async (req, res) => {
    try {
        const claseId = req.params.id;
        const user = req.session?.user || {};
        const { data: clase } = await supabase.from('clases').select('*').eq('id', claseId).single();
        
        const { data: tareas } = await supabase
            .from('tareas')
            .select('*')
            .eq('clase_id', claseId)
            .order('fecha_creacion', { ascending: false });

        res.render('tareas', { clase, tareas: tareas || [], user });
    } catch (error) {
        res.status(500).send("Error al cargar tareas");
    }
});

app.get('/tarea/:id', async (req, res) => {
    try {
        const tareaId = req.params.id;
        const user = req.session?.user || { id: null };

        const { data: tarea } = await supabase
            .from('tareas')
            .select('*, clases(nombre_clase, profesor_id)')
            .eq('id', tareaId)
            .single();

        const { data: entrega } = await supabase
            .from('entregas')
            .select('*')
            .eq('tarea_id', tareaId)
            .eq('estudiante_id', user.id)
            .single();

        res.render('detalle_tarea', { tarea, entrega, user });
    } catch (error) {
        res.status(500).send("Error al cargar detalle de tarea");
    }
});

app.get('/tarea/:id/revision', async (req, res) => {
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
app.get('/clase/:id/personas', async (req, res) => {
    try {
        const claseId = req.params.id;
        const user = req.session?.user || {};

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

        res.render('personas', { 
            clase, 
            profesores, 
            alumnos, 
            user 
        });

    } catch (error) {
        console.error("Error en Personas:", error);
        res.status(500).send("Error al cargar la lista de personas");
    }
});
app.get('/perfil', (req, res) => {
    res.render('perfil', { user: req.session?.user || {} });
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
app.listen(PORT, () => {
    console.log(`Uxmal corriendo en http://localhost:${PORT}`);
});