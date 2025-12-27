import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8800';

function CustomerDashboard({ user, cart, addToCart, removeFromCart, clearCart }) {
  const [activeTab, setActiveTab] = useState('browse');
  const [books, setBooks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [searchType, setSearchType] = useState('title');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [editProfile, setEditProfile] = useState(false);
  

  // Profile data state initialized with user props
  const [profileData, setProfileData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.shipping_address || ''
  });

  const [checkoutData, setCheckoutData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  // Fetch real books from backend on load
  useEffect(() => {
    fetchBooks();
    // In a real app, you would also fetch real order history here
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await axios.get(`${API_URL}/books`);
      setBooks(res.data);
      setFilteredBooks(res.data);
    } catch (err) {
      console.error("Error fetching books:", err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setFilteredBooks(books);
      return;
    }
    const results = books.filter(book => {
      // Logic to search by title, author_name, or isbn
      const fieldToSearch = searchType === 'author' ? 'author_name' : searchType;
      const value = book[fieldToSearch]?.toString().toLowerCase() || '';
      return value.includes(searchTerm.toLowerCase());
    });
    setFilteredBooks(results);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    
    if (checkoutData.cardNumber.length !== 16) {
      alert('Please enter a valid 16-digit card number');
      return;
    }

    // Prepare order for history display
    const newOrder = {
      id: orders.length + 1,
      orderDate: new Date().toISOString().split('T')[0],
      totalPrice: getCartTotal(),
      items: [...cart]
    };

    // Logic: In a real system, you would send this to /api/orders
    setOrders([newOrder, ...orders]);
    clearCart(); 
    setShowCheckout(false);
    setCheckoutData({ cardNumber: '', expiryDate: '', cvv: '' });
    alert('Order placed successfully!');
    setActiveTab('orders');
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      // Update backend database
      await axios.put(`${API_URL}/api/customers/${user.username}`, profileData);
      
      // Update local storage so the session stays updated
      const updatedUser = { ...user, ...profileData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setEditProfile(false);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error("Profile update failed:", err);
      alert("Error saving profile changes.");
    }
  };

  const renderBrowseBooks = () => (
    <div>
      <div className="card">
        <h3>Browse Library</h3>
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
          <button type="submit" className="btn">Search</button>
          <button type="button" className="btn-secondary" onClick={() => { setSearchTerm(''); setFilteredBooks(books); }}>Clear</button>
        </form>
      </div>

      <div className="grid">
        {filteredBooks.map(book => (
          <div key={book.isbn} className="book-card">
            <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '1rem' }}>📖</div>
            <h4>{book.title}</h4>
            <p><strong>Author:</strong> {book.author_name}</p>
            <p><strong>Category:</strong> {book.category}</p>
            <p className="price">${book.price}</p>
            <button 
              className="btn" 
              onClick={() => addToCart(book)} 
              disabled={book.stock_quantity <= 0}
              style={{ marginTop: '1rem', width: '100%' }}
            >
              {book.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderShoppingCart = () => (
    <div className="card">
      <h3>Your Cart</h3>
      {cart.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Your cart is empty.</p>
          <button className="btn" onClick={() => setActiveTab('browse')}>Go Shopping</button>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Price</th>
                  <th>Qty</th>
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
                      <button className="btn-danger" onClick={() => removeFromCart(item.isbn)}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="cart-total">Total: ${getCartTotal().toFixed(2)}</div>
          <button className="btn-success" onClick={() => setShowCheckout(true)} style={{ float: 'right', marginTop: '1rem' }}>Proceed to Checkout</button>
        </>
      )}
    </div>
  );

  const renderOrderHistory = () => (
    <div className="card">
      <h3>Past Orders</h3>
      {orders.length === 0 ? <p>You haven't placed any orders yet.</p> : orders.map(order => (
        <div key={order.id} className="order-item" style={{ border: '1px solid #eee', padding: '1rem', marginBottom: '1rem', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <strong>Order #{order.id}</strong>
            <span>{order.orderDate}</span>
          </div>
          <p>Total Amount: ${order.totalPrice.toFixed(2)}</p>
          <ul style={{ fontSize: '0.9rem', color: '#666' }}>
            {order.items.map((item, idx) => <li key={idx}>{item.title} (x{item.quantity})</li>)}
          </ul>
        </div>
      ))}
    </div>
  );

  const renderProfile = () => (
    <div className="card">
      <h3>Account Settings</h3>
      {!editProfile ? (
        <div className="profile-view">
          <p><strong>First Name:</strong> {profileData.firstName}</p>
          <p><strong>Last Name:</strong> {profileData.lastName}</p>
          <p><strong>Email:</strong> {profileData.email}</p>
          <p><strong>Phone:</strong> {profileData.phone || 'Not provided'}</p>
          <p><strong>Shipping Address:</strong> {profileData.address || 'Not provided'}</p>
          <button className="btn" onClick={() => setEditProfile(true)} style={{ marginTop: '1rem' }}>Edit Profile Information</button>
        </div>
      ) : (
        <form onSubmit={handleProfileUpdate} className="edit-form">
          <div className="form-group"><label>First Name</label><input type="text" value={profileData.firstName} onChange={(e) => setProfileData({...profileData, firstName: e.target.value})} required /></div>
          <div className="form-group"><label>Last Name</label><input type="text" value={profileData.lastName} onChange={(e) => setProfileData({...profileData, lastName: e.target.value})} required /></div>
          <div className="form-group"><label>Email Address</label><input type="email" value={profileData.email} onChange={(e) => setProfileData({...profileData, email: e.target.value})} required /></div>
          <div className="form-group"><label>Phone Number</label><input type="text" value={profileData.phone} onChange={(e) => setProfileData({...profileData, phone: e.target.value})} /></div>
          <div className="form-group"><label>Shipping Address</label><textarea value={profileData.address} onChange={(e) => setProfileData({...profileData, address: e.target.value})} /></div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" className="btn">Save Changes</button>
            <button type="button" className="btn-secondary" onClick={() => setEditProfile(false)}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="user-info">
          <h3>Welcome, {user?.first_name || 'User'}!</h3>
        </div>
        <nav>
          <button className={activeTab === 'browse' ? 'active' : ''} onClick={() => setActiveTab('browse')}>📚 Browse Library</button>
          <button className={activeTab === 'cart' ? 'active' : ''} onClick={() => setActiveTab('cart')}>🛒 Shopping Cart ({cart.length})</button>
          <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>📦 Order History</button>
          <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>👤 My Profile</button>
        </nav>
      </aside>

      <main className="main-content">
        {activeTab === 'browse' && renderBrowseBooks()}
        {activeTab === 'cart' && renderShoppingCart()}
        {activeTab === 'orders' && renderOrderHistory()}
        {activeTab === 'profile' && renderProfile()}
      </main>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="modal-overlay">
          <div className="modal-content card">
            <h3>💳 Payment Information</h3>
            <form onSubmit={handleCheckout}>
              <div className="form-group">
                <label>Card Number</label>
                <input type="text" maxLength="16" placeholder="1234 5678 9101 1121" value={checkoutData.cardNumber} onChange={(e) => setCheckoutData({...checkoutData, cardNumber: e.target.value.replace(/\D/g, '')})} required />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}><label>Expiry</label><input type="text" placeholder="MM/YY" maxLength="5" value={checkoutData.expiryDate} onChange={(e) => setCheckoutData({...checkoutData, expiryDate: e.target.value})} required /></div>
                <div className="form-group" style={{ flex: 1 }}><label>CVV</label><input type="password" maxLength="3" placeholder="123" value={checkoutData.cvv} onChange={(e) => setCheckoutData({...checkoutData, cvv: e.target.value.replace(/\D/g, '')})} required /></div>
              </div>
              <div style={{ fontSize: '1.2rem', margin: '1rem 0' }}>Total: <strong>${getCartTotal().toFixed(2)}</strong></div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn-success" style={{ flex: 2 }}>Confirm Order</button>
                <button type="button" className="btn-secondary" onClick={() => setShowCheckout(false)} style={{ flex: 1 }}>Back</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerDashboard;