import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import axios from 'axios';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import Cart from './pages/Cart';
import './App.css';

// API Base URL - Change this to your Node.js backend
const API_URL = 'http://localhost:8800';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user) return <Navigate to="/login" />;
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/" />;
  return children;
};

function App() {
  // --- 1. Global State ---
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem('cart') || '[]'));
  const [books, setBooks] = useState([]);

  // --- 2. Fetch Books from Node.js Backend ---
  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      console.log('Fetching books from Node.js backend...');
      // CHANGED: Now using Node.js backend on port 8800
      const res = await axios.get(`${API_URL}/books`);
      console.log('Books fetched:', res.data);
      setBooks(res.data);
    } catch (err) {
      console.error("Error fetching books:", err);
      alert("Failed to fetch books. Make sure backend is running on port 8800");
    }
  };

  // Cart Persistence
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // --- 3. Cart Functions ---
  const addToCart = (book) => {
    if (book.stock_quantity <= 0) return alert("Out of Stock!");
    
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.isbn === book.isbn);
      if (existing) {
        return prevCart.map((item) =>
          item.isbn === book.isbn ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...book, quantity: 1 }];
    });
    alert("Added to cart!");
  };

  const removeFromCart = (isbn) => {
    setCart(cart.filter((item) => item.isbn !== isbn));
  };

  const clearCart = () => setCart([]);

  // --- 4. Book Management Functions ---
  
  // Add Book - You'll need to create this endpoint in backend
  const addBook = async (newBook) => {
    try {
      await axios.post(`${API_URL}/api/books`, newBook);
      alert("Book added successfully!");
      fetchBooks();
    } catch (err) {
      console.error("Error adding book:", err);
      alert("Failed to add book");
    }
  };

  // Update Book
const updateBook = async (bookData) => {
  console.log("App.js: Preparing to send PUT request for ISBN:", bookData.isbn);
  
  try {
    // 1. Send the data to the backend
    const response = await axios.put(`http://localhost:8800/api/books/${bookData.isbn}`, bookData);
    
    console.log("App.js: Server responded with status:", response.status);
    console.log("App.js: Server message:", response.data);

    // 2. Re-fetch the books so the UI updates
    const res = await axios.get("http://localhost:8800/books");
    setBooks(res.data);
    
    alert("Update Successful!");
  } catch (err) {
    // This will catch Network errors or SQL errors
    console.error("App.js: UPDATE ERROR DETAILS:", err.response ? err.response.data : err.message);
    alert("Update failed. Check browser console for details.");
  }
};

  // Delete Book
  const deleteBook = async (isbn) => {
    try {
      await axios.delete(`${API_URL}/api/books/${isbn}`);
      alert("Book deleted successfully!");
      fetchBooks();
    } catch (err) {
      console.error("Error deleting book:", err);
      alert("Failed to delete book");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <BrowserRouter>
      {/* Global Navbar */}
      <nav className="navbar" style={{ padding: '1rem', background: '#333', color: '#fff', display: 'flex', gap: '20px', alignItems: 'center' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.2rem' }}>📚 Bookstore</Link>
        
        {!user ? (
          <>
            <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>Login</Link>
            <Link to="/register" style={{ color: 'white', textDecoration: 'none' }}>Register</Link>
          </>
        ) : (
          <>
            {user.role === 'admin' && <Link to="/admin" style={{ color: 'white', textDecoration: 'none' }}>Admin Panel</Link>}
            {user.role === 'customer' && <Link to="/customer" style={{ color: 'white', textDecoration: 'none' }}>My Dashboard</Link>}
            <button onClick={handleLogout} style={{ marginLeft: 'auto', padding: '5px 10px', cursor: 'pointer' }}>Logout</button>
          </>
        )}
        
        <Link to="/cart" style={{ color: 'white', textDecoration: 'none', marginLeft: !user ? 'auto' : '20px' }}>
          🛒 Cart ({cart.reduce((acc, item) => acc + item.quantity, 0)})
        </Link>
      </nav>

      <div className="container" style={{ padding: '20px' }}>
        <Routes>
          <Route path="/" element={<Home books={books} addToCart={addToCart} />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<Cart cartItems={cart} removeFromCart={removeFromCart} checkout={clearCart} />} />

          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard 
                  user={user} 
                  books={books} 
                  addBook={addBook} 
                  updateBook={updateBook} 
                  deleteBook={deleteBook} 
                />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/customer/*" 
            element={
              <ProtectedRoute requiredRole="customer">
                <CustomerDashboard 
                  user={user} 
                  books={books} 
                  cart={cart} 
                  addToCart={addToCart} 
                  removeFromCart={removeFromCart} 
                  clearCart={clearCart} 
                />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;