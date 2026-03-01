const express = require('express');
const cors = require('cors');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const classRoutes = require('./routes/classRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const postRoutes = require('./routes/postRoutes');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json()); 

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../front/views'));

app.use('/public', express.static(path.join(__dirname, '../front/public')));
app.use('/api/auth', userRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/posts', postRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../front/public/index.html'));
});
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../front/views/login')); 
});
app.get('/registro', (req, res) => {
    res.render('registro'); 
});
app.get('/clase/:id', async (req, res) => {
    const claseId = req.params.id;
    const user = req.session.user; 

    const { data: clase } = await supabase.from('clases').select('*').eq('id', claseId).single();
    
    const { data: posts } = await supabase
        .from('anuncios')
        .select(`*, usuarios(nombre, apellido)`)
        .eq('clase_id', claseId)
        .order('fecha_creacion', { ascending: false });

    const postsFormateados = posts.map(p => ({
        ...p,
        autor_nombre: `${p.usuarios.nombre} ${p.usuarios.apellido}`
    }));

    res.render('clase', { 
        clase, 
        posts: postsFormateados, 
        user 
    });
});
app.get('/clase/:id/tareas', async (req, res) => {
    const claseId = req.params.id;
    const user = req.session.user;
    const { data: clase } = await supabase.from('clases').select('*').eq('id', claseId).single();
    
    const { data: tareas } = await supabase
        .from('tareas')
        .select('*')
        .eq('clase_id', claseId)
        .order('fecha_creacion', { ascending: false });

    res.render('tareas', { clase, tareas: tareas || [], user });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(` Uxmal corriendo en http://localhost:${PORT}`);
});