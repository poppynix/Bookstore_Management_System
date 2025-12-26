import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// 1. Accept global props for Cart and User
function CustomerDashboard({ user, cart, addToCart, removeFromCart, clearCart }) {
  const [activeTab, setActiveTab] = useState('browse');
  const [books, setBooks] = useState([]);
  // Note: We removed the local 'cart' state because we use 'props.cart' now
  
  const [orders, setOrders] = useState([]);
  const [searchType, setSearchType] = useState('title');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [editProfile, setEditProfile] = useState(false);
  
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    password: ''
  });

  const [checkoutData, setCheckoutData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  // Initialize data
  useEffect(() => {
    // Mock books (Same as before)
    const mockBooks = [
      { isbn: '978-0-123456-47-2', title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', publisher: 'MIT Press', year: 2009, price: 89.99, category: 'Science', stock: 15 },
      { isbn: '978-0-134685-99-1', title: 'Clean Code', author: 'Robert C. Martin', publisher: 'Prentice Hall', year: 2008, price: 45.99, category: 'Science', stock: 20 },
      { isbn: '978-0-596007-12-4', title: 'The Art of Computer Programming', author: 'Donald Knuth', publisher: 'Addison-Wesley', year: 2011, price: 199.99, category: 'Science', stock: 8 },
      { isbn: '978-1-449355-73-9', title: 'Learning Python', author: 'Mark Lutz', publisher: "O'Reilly Media", year: 2013, price: 64.99, category: 'Science', stock: 25 },
      { isbn: '978-0-321573-51-3', title: 'The Pragmatic Programmer', author: 'Andrew Hunt', publisher: 'Addison-Wesley', year: 2019, price: 49.99, category: 'Science', stock: 12 }
    ];
    setBooks(mockBooks);
    setFilteredBooks(mockBooks);

    // Mock past orders
    const mockOrders = [
      {
        id: 1,
        orderDate: '2025-01-10',
        totalPrice: 135.98,
        items: [
          { isbn: '978-0-123456-47-2', title: 'Introduction to Algorithms', quantity: 1, price: 89.99 },
          { isbn: '978-0-134685-99-1', title: 'Clean Code', quantity: 1, price: 45.99 }
        ]
      }
    ];
    setOrders(mockOrders);
  }, []); // We removed the cart loading logic here because App.js handles it

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setFilteredBooks(books);
      return;
    }
    const results = books.filter(book => {
      const value = book[searchType]?.toString().toLowerCase() || '';
      return value.includes(searchTerm.toLowerCase());
    });
    setFilteredBooks(results);
  };

  const getCartTotal = () => {
    // Calculate total using the global cart prop
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = (e) => {
    e.preventDefault();
    
    if (checkoutData.cardNumber.length !== 16) {
      alert('Please enter a valid 16-digit card number');
      return;
    }

    const newOrder = {
      id: orders.length + 1,
      orderDate: new Date().toISOString().split('T')[0],
      totalPrice: getCartTotal(),
      items: cart.map(item => ({
        isbn: item.isbn,
        title: item.title,
        quantity: item.quantity,
        price: item.price
      }))
    };

    setOrders([newOrder, ...orders]);
    
    // 2. Call the global function to clear the cart in App.js
    clearCart(); 
    
    setShowCheckout(false);
    setCheckoutData({ cardNumber: '', expiryDate: '', cvv: '' });
    alert('Order placed successfully!');
    setActiveTab('orders');
  };

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    const updatedUser = { ...user, ...profileData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setEditProfile(false);
    alert('Profile updated successfully!');
  };

  // Render Browse Books
  const renderBrowseBooks = () => (
    <div>
      <div className="card">
        <h3>Browse Books</h3>
        <form className="search-bar" onSubmit={handleSearch}>
          <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
            <option value="title">Title</option>
            <option value="isbn">ISBN</option>
            <option value="author">Author</option>
            <option value="category">Category</option>
          </select>
          <input
            type="text"
            placeholder={`Search by ${searchType}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">Search</button>
          <button type="button" className="btn-secondary" onClick={() => { setSearchTerm(''); setFilteredBooks(books); }}>Clear</button>
        </form>
      </div>

      <div className="grid">
        {filteredBooks.length === 0 ? (
          <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>No books found.</p>
        ) : (
          filteredBooks.map(book => (
            <div key={book.isbn} className="book-card">
              <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '1rem' }}>📖</div>
              <h4>{book.title}</h4>
              <p><strong>Author:</strong> {book.author}</p>
              <p className="price">${book.price}</p>
              {/* 3. Use the global addToCart function */}
              <button className="btn" onClick={() => addToCart(book)} style={{ marginTop: '1rem' }}>
                Add to Cart
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Render Shopping Cart
  const renderShoppingCart = () => (
    <div>
      <div className="card">
        <h3>Shopping Cart</h3>
        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p>Your cart is empty</p>
            <button className="btn" onClick={() => setActiveTab('browse')}>Browse Books</button>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Book Title</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Subtotal</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map(item => (
                    <tr key={item.isbn}>
                      <td>{item.title}</td>
                      <td>${item.price}</td>
                      <td>{item.quantity}</td>
                      <td>${(item.price * item.quantity).toFixed(2)}</td>
                      <td>
                        {/* 4. Use global remove function */}
                        <button className="btn-danger" onClick={() => removeFromCart(item.isbn)}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="cart-total">Total: ${getCartTotal().toFixed(2)}</div>
            <div style={{ textAlign: 'right', marginTop: '1rem' }}>
              <button className="btn-success" onClick={() => setShowCheckout(true)}>Proceed to Checkout</button>
            </div>
          </>
        )}
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', maxWidth: '500px', width: '90%' }}>
            <h3>Checkout</h3>
            <form onSubmit={handleCheckout}>
              <div className="form-group">
                <label>Credit Card Number *</label>
                <input type="text" maxLength="16" value={checkoutData.cardNumber} onChange={(e) => setCheckoutData({...checkoutData, cardNumber: e.target.value.replace(/\D/g, '')})} required />
              </div>
              <div className="form-group">
                <label>Expiry Date (MM/YY) *</label>
                <input type="text" maxLength="5" value={checkoutData.expiryDate} onChange={(e) => setCheckoutData({...checkoutData, expiryDate: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>CVV *</label>
                <input type="text" maxLength="3" value={checkoutData.cvv} onChange={(e) => setCheckoutData({...checkoutData, cvv: e.target.value.replace(/\D/g, '')})} required />
              </div>
              <div style={{ marginTop: '1.5rem', fontWeight: 'bold' }}>Total: ${getCartTotal().toFixed(2)}</div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn-success" style={{ flex: 1 }}>Complete Purchase</button>
                <button type="button" className="btn-secondary" onClick={() => setShowCheckout(false)} style={{ flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  // Render Order History and Profile (Kept largely the same)
  const renderOrderHistory = () => (
    <div className="card">
      <h3>Order History</h3>
      {orders.length === 0 ? <p>No orders yet</p> : orders.map(order => (
        <div key={order.id} style={{ border: '1px solid #ddd', padding: '1rem', marginBottom: '1rem' }}>
          <h4>Order #{order.id} - ${order.totalPrice.toFixed(2)}</h4>
          <p>Date: {order.orderDate}</p>
        </div>
      ))}
    </div>
  );

  const renderProfile = () => (
    <div className="card">
      <h3>My Profile</h3>
      {!editProfile ? (
        <div>
          <p><strong>Name:</strong> {profileData.firstName} {profileData.lastName}</p>
          <p><strong>Email:</strong> {profileData.email}</p>
          <button className="btn" onClick={() => setEditProfile(true)}>Edit Profile</button>
        </div>
      ) : (
        <form onSubmit={handleProfileUpdate}>
          <div className="form-group"><label>First Name</label><input value={profileData.firstName} onChange={(e) => setProfileData({...profileData, firstName: e.target.value})} /></div>
          <div className="form-group"><label>Last Name</label><input value={profileData.lastName} onChange={(e) => setProfileData({...profileData, lastName: e.target.value})} /></div>
          <button type="submit" className="btn">Save</button>
        </form>
      )}
    </div>
  );

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h2>Customer Panel</h2>
        <nav>
          <button className={activeTab === 'browse' ? 'active' : ''} onClick={() => setActiveTab('browse')}>📚 Browse</button>
          <button className={activeTab === 'cart' ? 'active' : ''} onClick={() => setActiveTab('cart')}>🛒 Cart ({cart.length})</button>
          <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>📦 Orders</button>
          <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>👤 Profile</button>
        </nav>
      </aside>
      <main className="main-content">
        {activeTab === 'browse' && renderBrowseBooks()}
        {activeTab === 'cart' && renderShoppingCart()}
        {activeTab === 'orders' && renderOrderHistory()}
        {activeTab === 'profile' && renderProfile()}
      </main>
    </div>
  );
}

export default CustomerDashboard;