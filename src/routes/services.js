const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all service providers by type
router.get('/providers/:type', async (req, res) => {
    const { type } = req.params;
    const query = `
        SELECT u.*, ps.service_type, ps.experience 
        FROM users u 
        JOIN provider_services ps ON u.id = ps.user_id 
        WHERE u.user_type = 'provider' AND ps.service_type = ?
    `;

    db.query(query, [type], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

// Book a service
router.post('/book', async (req, res) => {
    const { 
        provider_id, 
        customer_id, 
        service_type, 
        booking_date, 
        booking_time, 
        notes 
    } = req.body;

    const query = `
        INSERT INTO bookings (
            provider_id, 
            customer_id, 
            service_type, 
            booking_date, 
            booking_time, 
            notes,
            status
        ) VALUES (?, ?, ?, ?, ?, ?, 'pending')
    `;

    db.query(query, [
        provider_id,
        customer_id,
        service_type,
        booking_date,
        booking_time,
        notes
    ], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to create booking' });
        }
        res.json({ 
            success: true, 
            booking_id: result.insertId 
        });
    });
});

// Get provider's bookings
router.get('/bookings/provider/:id', async (req, res) => {
    const { id } = req.params;
    const query = `
        SELECT b.*, u.fullname as customer_name, u.email as customer_email 
        FROM bookings b
        JOIN users u ON b.customer_id = u.id
        WHERE b.provider_id = ?
        ORDER BY b.booking_date DESC
    `;

    db.query(query, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

// Get customer's bookings
router.get('/bookings/customer/:id', async (req, res) => {
    const { id } = req.params;
    const query = `
        SELECT b.*, u.fullname as provider_name, u.email as provider_email 
        FROM bookings b
        JOIN users u ON b.provider_id = u.id
        WHERE b.customer_id = ?
        ORDER BY b.booking_date DESC
    `;

    db.query(query, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

// Update booking status
router.put('/booking/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    const query = `
        UPDATE bookings 
        SET status = ?
        WHERE id = ?
    `;

    db.query(query, [status, id], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to update booking' });
        }
        res.json({ success: true });
    });
});

// Get provider ratings
router.get('/provider/:id/ratings', async (req, res) => {
    const { id } = req.params;
    const query = `
        SELECT r.*, u.fullname as customer_name 
        FROM ratings r
        JOIN users u ON r.customer_id = u.id
        WHERE r.provider_id = ?
        ORDER BY r.created_at DESC
    `;

    db.query(query, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

// Add rating for provider
router.post('/rating', async (req, res) => {
    const { 
        provider_id, 
        customer_id, 
        booking_id, 
        rating, 
        review 
    } = req.body;

    const query = `
        INSERT INTO ratings (
            provider_id,
            customer_id,
            booking_id,
            rating,
            review
        ) VALUES (?, ?, ?, ?, ?)
    `;

    db.query(query, [
        provider_id,
        customer_id,
        booking_id,
        rating,
        review
    ], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to add rating' });
        }
        res.json({ success: true });
    });
});

module.exports = router;