// backend/index.js
const express = require('express');
const cors = require('cors');
const db = require('./db'); // Import the connection we just made

const app = express();
app.use(express.json());
app.use(cors());

// --- ROUTES ---

// 1. Get All Books (For Home Page)
app.get('/books', (req, res) => {
    const q = "SELECT * FROM books";
    db.query(q, (err, data) => {
        if (err) return res.json(err);
        return res.json(data);
    });
});

// 2. Register User (For Register Page)
app.post('/register', (req, res) => {
    const q = "INSERT INTO customers (`username`, `email`, `password`, `first_name`, `last_name`) VALUES (?)";
    const values = [
        req.body.username,
        req.body.email,
        req.body.password, // In a real app, you should hash this password!
        req.body.firstName,
        req.body.lastName
    ];

    db.query(q, [values], (err, data) => {
        if (err) return res.json(err);
        return res.json("User has been created successfully.");
    });
});

// 3. Login User (For Login Page)
app.post('/login', (req, res) => {
    const q = "SELECT * FROM customers WHERE username = ? AND password = ?";
    db.query(q, [req.body.username, req.body.password], (err, data) => {
        if (err) return res.json(err);
        if (data.length === 0) return res.status(404).json("User not found or wrong password");
        return res.status(200).json(data[0]);
    });
});

// Start the Server
app.listen(8800, () => {
    console.log("Backend server is running on port 8800!");
});