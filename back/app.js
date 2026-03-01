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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(` Uxmal corriendo en http://localhost:${PORT}`);
});