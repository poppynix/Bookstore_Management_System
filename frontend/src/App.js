import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
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
  
  // Initialize Books (Mock Data)
  const [books, setBooks] = useState([
    { isbn: '978-0-123456-47-2', title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', publisher: 'MIT Press', year: 2009, price: 89.99, category: 'Science', stock: 15, threshold: 5 },
    { isbn: '978-0-134685-99-1', title: 'Clean Code', author: 'Robert C. Martin', publisher: 'Prentice Hall', year: 2008, price: 45.99, category: 'Science', stock: 20, threshold: 10 },
    { isbn: '978-0-596007-12-4', title: 'The Art of Computer Programming', author: 'Donald Knuth', publisher: 'Addison-Wesley', year: 2011, price: 199.99, category: 'Science', stock: 8, threshold: 5 },
    { isbn: '978-1-449355-73-9', title: 'Learning Python', author: 'Mark Lutz', publisher: "O'Reilly Media", year: 2013, price: 64.99, category: 'Science', stock: 25 },
    { isbn: '978-0-321573-51-3', title: 'The Pragmatic Programmer', author: 'Andrew Hunt', publisher: 'Addison-Wesley', year: 2019, price: 49.99, category: 'Science', stock: 12 }
  ]);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // --- 2. Cart Functions ---
  const addToCart = (book) => {
    if (book.stock <= 0) return alert("Out of Stock!");
    
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

  // --- 3. Book Management Functions (For Admin) ---
  const addBook = (newBook) => {
    setBooks([...books, newBook]);
  };

  const updateBook = (updatedBook) => {
    setBooks(books.map(b => b.isbn === updatedBook.isbn ? updatedBook : b));
  };

  const deleteBook = (isbn) => {
    setBooks(books.filter(b => b.isbn !== isbn));
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
          {/* Pass 'books' to Home so customers see the same list */}
          <Route path="/" element={<Home books={books} addToCart={addToCart} />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<Cart cartItems={cart} removeFromCart={removeFromCart} checkout={clearCart} />} />

          {/* Pass Book Functions to Admin Dashboard */}
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
          
          {/* Pass Books to Customer Dashboard for searching */}
          <Route 
            path="/customer/*" 
            element={
              <ProtectedRoute requiredRole="customer">
                <CustomerDashboard 
                  user={user} 
                  books={books} // <--- Pass Global Books here
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