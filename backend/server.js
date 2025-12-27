const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(express.json());
app.use(cors());

// --- EXISTING ROUTES ---

// Get All Books (with joins for Publisher and Author)
app.get('/books', (req, res) => {
    const q = `
        SELECT b.*, p.name as publisher_name, a.a_Name as author_name, a.a_id as a_id
        FROM books b
        LEFT JOIN publishers p ON b.p_id = p.p_id
        LEFT JOIN book_authors x ON x.isbn = b.isbn
        LEFT JOIN authors a ON a.a_id = x.a_id
    `;
    db.query(q, (err, data) => {
        if (err) {
            console.error('Error fetching books:', err);
            return res.status(500).json(err);
        }
        return res.json(data);
    });
});

// Register User
app.post('/register', (req, res) => {
    const q = "INSERT INTO customers (username, password, first_name, last_name, email, phone, shipping_address) VALUES (?, ?, ?, ?, ?, ?, ?)";
    const values = [
        req.body.username,
        req.body.password,
        req.body.firstName,
        req.body.lastName,
        req.body.email,
        req.body.phone || null,
        req.body.shippingAddress || null
    ];

    db.query(q, values, (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json("User has been created successfully.");
    });
});

// Login User
app.post('/login', (req, res) => {
    const q = "SELECT * FROM customers WHERE username = ? AND password = ?";
    db.query(q, [req.body.username, req.body.password], (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.length === 0) return res.status(404).json("User not found");
        return res.status(200).json(data[0]);
    });
});

// --- BOOK MANAGEMENT ROUTES ---

// Add new book
app.post('/api/books', (req, res) => {
    const { isbn, title, p_id, pub_year, price, category, stock_quantity, threshold } = req.body;
    const q = `INSERT INTO books (isbn, title, p_id, pub_year, price, category, stock_quantity, threshold) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    db.query(q, [isbn, title, p_id, pub_year, price, category, stock_quantity, threshold], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Book added successfully' });
    });
});

// UPDATE BOOK AND AUTHOR (Fixed Logic)
app.put("/api/books/:isbn", (req, res) => {
    const isbn = req.params.isbn.trim();
    const { title, author, p_id, pub_year, price, category, stock_quantity, threshold } = req.body;

    console.log("Updating ISBN:", isbn, "with Author Name:", author);

    // 1. Update the Author's name in the 'authors' table by joining with 'book_authors'
    const updateAuthorSql = `
        UPDATE authors a
        INNER JOIN book_authors ba ON a.a_id = ba.a_id
        SET a.a_Name = ?
        WHERE ba.isbn = ?
    `;

    db.query(updateAuthorSql, [author, isbn], (err, authorResult) => {
        if (err) {
            console.error("Author Update Error:", err);
            return res.status(500).json({ error: "Failed to update author name" });
        }

        // 2. Now update the book details in the 'books' table
        const updateBookSql = `
            UPDATE books 
            SET title = ?, p_id = ?, pub_year = ?, price = ?, category = ?, stock_quantity = ?, threshold = ? 
            WHERE isbn = ?
        `;

        const bookValues = [title, Number(p_id), Number(pub_year), Number(price), category, Number(stock_quantity), Number(threshold), isbn];

        db.query(updateBookSql, bookValues, (err, bookResult) => {
            if (err) {
                console.error("Book Update Error:", err);
                return res.status(500).json({ error: err.sqlMessage });
            }

            if (bookResult.affectedRows === 0) {
                return res.status(404).json({ message: "Book not found" });
            }

            console.log("✅ Book and Author successfully updated in DB");
            return res.json({ message: "Update Successful" });
        });
    });
});

// Delete book
app.delete('/api/books/:isbn', (req, res) => {
    const { isbn } = req.params;
    db.query('DELETE FROM books WHERE isbn = ?', [isbn], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Book deleted successfully' });
    });
});

// --- REPORT ROUTES ---

app.get('/api/reports/previous-month-sales', (req, res) => {
    const q = `SELECT SUM(total_price) as total_sales FROM customer_orders WHERE MONTH(o_date) = MONTH(CURRENT_DATE - INTERVAL 1 MONTH) AND YEAR(o_date) = YEAR(CURRENT_DATE - INTERVAL 1 MONTH)`;
    db.query(q, (err, data) => {
        if (err) return res.status(500).json(err);
        res.json({ total_sales: data[0].total_sales || 0 });
    });
});

app.get('/api/reports/sales-by-date', (req, res) => {
    const { date } = req.query;
    const q = `SELECT SUM(total_price) as total_sales, COUNT(*) as order_count FROM customer_orders WHERE DATE(o_date) = ?`;
    db.query(q, [date], (err, data) => {
        if (err) return res.status(500).json(err);
        res.json(data[0]);
    });
});

app.get('/api/reports/top-customers', (req, res) => {
    const q = `SELECT c.first_name, c.last_name, SUM(co.total_price) as total_spent FROM customers c JOIN customer_orders co ON c.c_id = co.c_id GROUP BY c.c_id ORDER BY total_spent DESC LIMIT 5`;
    db.query(q, (err, data) => {
        if (err) return res.status(500).json(err);
        res.json(data);
    });
});

app.get('/api/reports/top-books', (req, res) => {
    const q = `SELECT b.title, SUM(oi.quantity) as total_copies_sold FROM books b JOIN order_items oi ON b.isbn = oi.isbn GROUP BY b.isbn ORDER BY total_copies_sold DESC LIMIT 10`;
    db.query(q, (err, data) => {
        if (err) return res.status(500).json(err);
        res.json(data);
    });
});

app.get('/api/reports/book-order-count/:isbn', (req, res) => {
    const q = `SELECT b.title, SUM(bo.quantity) as total_quantity_ordered FROM books b LEFT JOIN book_orders bo ON b.isbn = bo.isbn WHERE b.isbn = ? GROUP BY b.isbn`;
    db.query(q, [req.params.isbn], (err, data) => {
        if (err) return res.status(500).json(err);
        res.json(data[0]);
    });
});

app.get('/api/admin/publisher-orders', (req, res) => {
    const q = `SELECT bo.o_id as order_id, b.title, p.name as publisher_name, bo.quantity, bo.status FROM book_orders bo JOIN books b ON bo.isbn = b.isbn JOIN publishers p ON b.p_id = p.p_id ORDER BY bo.o_date DESC`;
    db.query(q, (err, data) => {
        if (err) return res.status(500).json(err);
        res.json(data);
    });
});

app.listen(8800, () => {
    console.log("✅ Backend server is running on port 8800!");
});