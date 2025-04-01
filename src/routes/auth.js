const express = require('express');
const router = express.Router();
const db = require('../config/database');

// User Registration
router.post('/register', async (req, res) => {
    const { fullname, username, email, phone, address, password, userType, services, experience } = req.body;
    
    try {
        // Check if username or email exists
        const checkQuery = 'SELECT * FROM users WHERE username = ? OR email = ?';
        db.query(checkQuery, [username, email], async (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            
            if (results.length > 0) {
                return res.status(400).json({ error: 'Username or email already exists' });
            }
            
            // Insert new user
            const insertUserQuery = `
                INSERT INTO users (fullname, username, email, phone, address, password, user_type)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            
            db.query(insertUserQuery, 
                [fullname, username, email, phone, address, password, userType], 
                (err, result) => {
                    if (err) {
                        console.error('User insertion error:', err);
                        return res.status(500).json({ error: 'Failed to register user' });
                    }
                    
                    // For service providers, insert their services
                    if (userType === 'provider' && services && services.length > 0) {
                        const userId = result.insertId;
                        const serviceValues = services.map(service => [userId, service, experience]);
                        
                        const insertServicesQuery = `
                            INSERT INTO provider_services (provider_id, service_id, experience)
                            VALUES ?
                        `;
                        
                        db.query(insertServicesQuery, [serviceValues], (err) => {
                            if (err) {
                                console.error('Service insertion error:', err);
                                return res.status(500).json({ error: 'Failed to register services' });
                            }
                            
                            res.json({ 
                                success: true, 
                                message: 'Registration successful',
                                userId: userId
                            });
                        });
                    } else {
                        res.json({ 
                            success: true, 
                            message: 'Registration successful',
                            userId: result.insertId
                        });
                    }
                }
            );
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// User Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        // Direct password comparison
        const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
        db.query(query, [username, password], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ 
                    success: false, 
                    error: 'Internal server error' 
                });
            }
            
            if (results.length === 0) {
                return res.status(401).json({ 
                    success: false, 
                    error: 'Invalid username or password' 
                });
            }
            
            const user = results[0];
            
            // Set session
            req.session.user = {
                id: user.id,
                username: user.username,
                fullname: user.fullname,
                userType: user.user_type
            };
            
            res.json({
                success: true,
                user: {
                    id: user.id,
                    username: user.username,
                    fullname: user.fullname,
                    email: user.email,
                    userType: user.user_type
                }
            });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error' 
        });
    }
});

// User Logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to logout' });
        }
        res.json({ success: true });
    });
});

// Password Reset Request
router.post('/reset-password-request', async (req, res) => {
    const { email } = req.body;
    
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 3600000); // 1 hour from now
    
    const query = `
        UPDATE users 
        SET reset_token = ?, reset_token_expiry = ? 
        WHERE email = ?
    `;
    
    db.query(query, [token, expiry, email], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to process request' });
        }
        // TODO: Send email with reset link
        res.json({ success: true });
    });
});

// Password Reset
router.post('/reset-password', async (req, res) => {
    const { token, password } = req.body;
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const query = `
            UPDATE users 
            SET password = ?, reset_token = NULL, reset_token_expiry = NULL 
            WHERE reset_token = ? AND reset_token_expiry > NOW()
        `;
        
        db.query(query, [hashedPassword, token], (err, result) => {
            if (err || result.affectedRows === 0) {
                return res.status(400).json({ error: 'Invalid or expired token' });
            }
            res.json({ success: true });
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Check Auth Status
router.get('/check', (req, res) => {
    if (req.session.user) {
        res.json({ 
            authenticated: true, 
            user: req.session.user 
        });
    } else {
        res.json({ authenticated: false });
    }
});

module.exports = router;