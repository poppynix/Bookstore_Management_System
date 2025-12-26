import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import axios from 'axios'; // Import Axios for API calls
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import Cart from './pages/Cart';
import './App.css';

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
  const [books, setBooks] = useState([]); // Start with empty array, fetch later

  // --- 2. Fetch Books from PHP Backend ---
  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      // connecting to the PHP backend
      const res = await axios.get('http://localhost/bookstore_database/books.php');
      setBooks(res.data);
    } catch (err) {
      console.error("Error fetching books:", err);
    }
  };

  // Cart Persistence
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // --- 3. Cart Functions (Frontend Logic) ---
  const addToCart = (book) => {
    // Check stock from the real database data
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

  // --- 4. Book Management Functions (Connected to Backend) ---
  
  // Add Book
  const addBook = async (newBook) => {
    try {
      await axios.post('http://localhost/bookstore_database/books.php', newBook);
      alert("Book added successfully!");
      fetchBooks(); // Refresh the list
    } catch (err) {
      console.error("Error adding book:", err);
      alert("Failed to add book");
    }
  };

  // Update Book
  const updateBook = async (updatedBook) => {
    try {
      // PHP expects the ISBN in the URL for updates
      await axios.put(`http://localhost/bookstore_database/books.php?isbn=${updatedBook.isbn}`, updatedBook);
      alert("Book updated successfully!");
      fetchBooks(); // Refresh the list
    } catch (err) {
      console.error("Error updating book:", err);
      alert("Failed to update book");
    }
  };

  // Delete Book
  const deleteBook = async (isbn) => {
    try {
      await axios.delete(`http://localhost/bookstore_database/books.php?isbn=${isbn}`);
      alert("Book deleted successfully!");
      fetchBooks(); // Refresh the list
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