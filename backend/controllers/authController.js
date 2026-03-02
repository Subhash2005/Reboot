const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

exports.register = async (req, res) => {
    try {
        const { username, email, password, age, phone } = req.body;

        // Check if user exists
        const [existing] = await db.execute('SELECT * FROM users WHERE email = ? OR username = ?', [email, username]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        await db.execute(
            'INSERT INTO users (username, email, password, age, phone, auth_provider) VALUES (?, ?, ?, ?, ?, ?)',
            [username, email, hashedPassword, age, phone, 'local']
        );

        res.status(201).json({ message: 'Account Created Successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const [users] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const user = users[0];

        // Restriction: If user registered with Google, they must login with Google
        if (user.auth_provider === 'google') {
            return res.status(400).json({ message: 'This account uses Google Login. Please login with Google.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.googleAuth = async (req, res) => {
    try {
        const { tokenId } = req.body;
        const client = new OAuth2Client(process.env.GOOGlE_CLIENT_ID);
        const ticket = await client.verifyIdToken({
            idToken: tokenId,
            audience: process.env.GOOGlE_CLIENT_ID
        });

        const { sub: googleId, email, name, picture } = ticket.getPayload();

        // Check if user exists
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);

        let user;
        if (users.length > 0) {
            user = users[0];

            // If user exists and is local, link the Google ID and switch provider
            if (user.auth_provider === 'local') {
                await db.execute(
                    'UPDATE users SET google_id = ?, auth_provider = ?, profile_picture = ? WHERE id = ?',
                    [googleId, 'google', picture || user.profile_picture, user.id]
                );
                // Refresh user object after update
                const [updatedUsers] = await db.execute('SELECT * FROM users WHERE id = ?', [user.id]);
                user = updatedUsers[0];
            }
        } else {
            // Create new Google user
            const baseUsername = name.replace(/\s+/g, '').toLowerCase();
            const username = baseUsername + Math.floor(Math.random() * 100);

            const [result] = await db.execute(
                'INSERT INTO users (username, full_name, email, password, google_id, auth_provider, profile_picture, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [username, name, email, 'GOOGLE_AUTH_NO_PASSWORD', googleId, 'google', picture, 'youth']
            );

            const [newUsers] = await db.execute('SELECT * FROM users WHERE id = ?', [result.insertId]);
            user = newUsers[0];
        }

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(500).json({ message: 'Google Authentication Failed' });
    }
};

exports.forgotPassword = async (req, res) => {
    // Mock forgot password
    res.json({ message: 'Reset link sent to email' });
};

exports.resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        // Check if it's a google user
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length > 0 && users[0].auth_provider === 'google') {
            return res.status(400).json({ message: 'Cannot reset password for Google-linked accounts.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.execute('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ?', [hashedPassword, email]);
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
