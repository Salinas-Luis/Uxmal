const UserModel = require('../model/userModel');

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
    try {
        const { email, password } = req.body;
        const { data: user, error } = await UserModel.findByEmail(email);

        if (error || !user || user.password !== password) {
            return res.status(401).json({ error: "Credenciales incorrectas" });
        }

        res.json({ 
            message: "Bienvenido a MaxGrade", 
            user: {
                id: user.id,
                nombre: user.nombre,
                apellido: user.apellido,
                email: user.email,
                avatar_url: user.avatar_url
            } 
        });
    } catch (err) {
        res.status(500).json({ error: "Error en el servidor al iniciar sesión" });
    }
};