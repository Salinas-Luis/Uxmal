const jwt = require('jsonwebtoken');
const supabase = require('../config/db');

const authenticateToken = async (req, res, next) => {
    const token = req.cookies?.token;

    if (!token) {
        if (!req.session?.user) {
            return res.redirect('/login');
        }
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_clave_secreta');
        
        const { data: userData, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', decoded.id)
            .single();

        if (error || !userData) {
            throw new Error('Usuario no encontrado');
        }

        req.user = userData;
        next();
    } catch (err) {
        console.error("Token inválido o error al obtener usuario:", err);
        res.clearCookie('token');
        res.redirect('/login');
    }
};

module.exports = { authenticateToken };
