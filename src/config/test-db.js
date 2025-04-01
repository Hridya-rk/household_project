const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'hrihar#1996',
    database: 'housie_db'
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Successfully connected to database');
    
    // Test query to check users table
    db.query('SELECT * FROM users', (err, results) => {
        if (err) {
            console.error('Query failed:', err);
            return;
        }
        console.log('Users in database:', results);
        db.end();
    });
});