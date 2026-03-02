const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    let token = req.header('Authorization');

    if (!token) {
        console.warn('Auth Failure: No token provided');
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Handle "Bearer <token>" format
    if (token.startsWith('Bearer ')) {
        token = token.split(' ')[1];
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        console.warn('Auth Failure: Token invalid or expired');
        res.status(401).json({ message: 'Token is not valid' });
    }
};
