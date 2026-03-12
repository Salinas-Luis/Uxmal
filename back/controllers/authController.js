const UserModel = require('../model/userModel');
const supabase = require('../config/db');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { nombre, apellido, email, password } = req.body;
        
        const { data, error } = await UserModel.create({ nombre, apellido, email, password });
        
        if (error) return res.status(400).json({ error: error.message });
        
        res.status(201).json({ 
            message: "Usuario registrado con éxito", 
            user: data[0] 
        });
    } catch (err) {
        res.status(500).json({ error: "Error en el servidor al registrar" });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const { data: usuario, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !usuario || usuario.password !== password) { 
            return res.status(401).json({ error: "Credenciales incorrectas" });
        }

        const userData = {
            id: usuario.id,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            email: usuario.email,
        };

        // Crear JWT
        const token = jwt.sign(userData, process.env.JWT_SECRET || 'tu_clave_secreta', {
            expiresIn: '24h'
        });

        // Guardar token en cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 24 horas
        });

        // También guardar en sesión para compatibilidad
        req.session.user = userData;

        req.session.save((err) => {
            if (err) {
                console.error("Error al guardar sesión:", err);
            }
            res.status(200).json({ message: "Login exitoso", user: userData });
        });

    } catch (err) {
        console.error("Error en el catch de login:", err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error al cerrar sesión:", err);
            return res.status(500).send("No se pudo cerrar la sesión");
        }
        res.clearCookie('connect.sid'); 
        res.redirect('/login'); 
    });
};