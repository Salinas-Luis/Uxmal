const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    // Obtener el token de las cookies
    const token = req.cookies?.token;

    if (!token) {
        // Si no hay token, intentar obtener el usuario de la sesión para compatibilidad
        if (!req.session?.user) {
            return res.redirect('/login');
        }
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_clave_secreta');
        req.user = decoded;
        next();
    } catch (err) {
        console.error("Token inválido:", err);
        res.clearCookie('token');
        res.redirect('/login');
    }
};

module.exports = { authenticateToken };
