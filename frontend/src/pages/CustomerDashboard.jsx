import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState('browse');
  const [books, setBooks] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [searchType, setSearchType] = useState('title');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [editProfile, setEditProfile] = useState(false);
  
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

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
    // Mock books
    const mockBooks = [
      { isbn: '978-0-123456-47-2', title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', publisher: 'MIT Press', year: 2009, price: 89.99, category: 'Science', stock: 15 },
      { isbn: '978-0-134685-99-1', title: 'Clean Code', author: 'Robert C. Martin', publisher: 'Prentice Hall', year: 2008, price: 45.99, category: 'Science', stock: 20 },
      { isbn: '978-0-596007-12-4', title: 'The Art of Computer Programming', author: 'Donald Knuth', publisher: 'Addison-Wesley', year: 2011, price: 199.99, category: 'Science', stock: 8 },
      { isbn: '978-1-449355-73-9', title: 'Learning Python', author: 'Mark Lutz', publisher: "O'Reilly Media", year: 2013, price: 64.99, category: 'Science', stock: 25 },
      { isbn: '978-0-321573-51-3', title: 'The Pragmatic Programmer', author: 'Andrew Hunt', publisher: 'Addison-Wesley', year: 2019, price: 49.99, category: 'Science', stock: 12 }
    ];
    setBooks(mockBooks);
    setFilteredBooks(mockBooks);

    // Load cart from localStorage
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);

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
      },
      {
        id: 2,
        orderDate: '2025-01-05',
        totalPrice: 199.99,
        items: [
          { isbn: '978-0-596007-12-4', title: 'The Art of Computer Programming', quantity: 1, price: 199.99 }
        ]
      }
    ];
    setOrders(mockOrders);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('cart');
    navigate('/login');
  };

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

  const addToCart = (book) => {
    const existingItem = cart.find(item => item.isbn === book.isbn);
    let newCart;

    if (existingItem) {
      newCart = cart.map(item =>
        item.isbn === book.isbn
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      newCart = [...cart, { ...book, quantity: 1 }];
    }

    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    alert(`${book.title} added to cart!`);
  };

  const removeFromCart = (isbn) => {
    const newCart = cart.filter(item => item.isbn !== isbn);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const updateQuantity = (isbn, quantity) => {
    if (quantity < 1) return;
    const newCart = cart.map(item =>
      item.isbn === isbn ? { ...item, quantity: parseInt(quantity) } : item
    );
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = (e) => {
    e.preventDefault();
    
    // Validate credit card (simple validation)
    if (checkoutData.cardNumber.length !== 16) {
      alert('Please enter a valid 16-digit card number');
      return;
    }

    // TODO: Replace with actual API call
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
    setCart([]);
    localStorage.removeItem('cart');
    setShowCheckout(false);
    setCheckoutData({ cardNumber: '', expiryDate: '', cvv: '' });
    alert('Order placed successfully!');
    setActiveTab('orders');
  };

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    // TODO: Replace with actual API call
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
            <option value="publisher">Publisher</option>
          </select>
          <input
            type="text"
            placeholder={`Search by ${searchType}...`}
            value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">Search</button>
          <button 
            type="button" 
            className="btn-secondary"
            onClick={() => {
              setSearchTerm('');
              setFilteredBooks(books);
            }}
          >
            Clear
          </button>
        </form>
      </div>

      <div className="grid">
        {filteredBooks.length === 0 ? (
          <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
            No books found matching your search.
          </p>
        ) : (
          filteredBooks.map(book => (
            <div key={book.isbn} className="book-card">
              <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '1rem' }}>📖</div>
              <h4>{book.title}</h4>
              <p><strong>Author:</strong> {book.author}</p>
              <p><strong>ISBN:</strong> {book.isbn}</p>
              <p><strong>Publisher:</strong> {book.publisher}</p>
              <p><strong>Category:</strong> {book.category}</p>
              <p className="price">${book.price}</p>
              <p style={{ color: book.stock > 0 ? '#27ae60' : '#e74c3c' }}>
                {book.stock > 0 ? `In Stock (${book.stock})` : 'Out of Stock'}
              </p>
              {book.stock > 0 && (
                <button 
                  className="btn" 
                  onClick={() => addToCart(book)}
                  style={{ marginTop: '1rem' }}
                >
                  Add to Cart
                </button>
              )}
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
            <p style={{ fontSize: '1.2rem', color: '#7f8c8d' }}>Your cart is empty</p>
            <button 
              className="btn" 
              onClick={() => setActiveTab('browse')}
              style={{ marginTop: '1rem' }}
            >
              Browse Books
            </button>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Book Title</th>
                    <th>ISBN</th>
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
                      <td>{item.isbn}</td>
                      <td>${item.price}</td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.isbn, e.target.value)}
                          style={{ width: '60px', padding: '0.25rem' }}
                        />
                      </td>
                      <td>${(item.price * item.quantity).toFixed(2)}</td>
                      <td>
                        <button 
                          className="btn-danger"
                          onClick={() => removeFromCart(item.isbn)}
                          style={{ padding: '0.5rem 1rem' }}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="cart-total">
              Total: ${getCartTotal().toFixed(2)}
            </div>

            <div style={{ textAlign: 'right', marginTop: '1rem' }}>
              <button 
                className="btn-success"
                onClick={() => setShowCheckout(true)}
                style={{ padding: '0.75rem 2rem', fontSize: '1.1rem' }}
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h3>Checkout</h3>
            <form onSubmit={handleCheckout}>
              <div className="form-group">
                <label>Credit Card Number *</label>
                <input
                  type="text"
                  maxLength="16"
                  placeholder="Enter 16-digit card number"
                  value={checkoutData.cardNumber}
                  onChange={(e) => setCheckoutData({...checkoutData, cardNumber: e.target.value.replace(/\D/g, '')})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Expiry Date (MM/YY) *</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  maxLength="5"
                  value={checkoutData.expiryDate}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length >= 2) {
                      value = value.slice(0, 2) + '/' + value.slice(2, 4);
                    }
                    setCheckoutData({...checkoutData, expiryDate: value});
                  }}
                  required
                />
              </div>
              <div className="form-group">
                <label>CVV *</label>
                <input
                  type="text"
                  maxLength="3"
                  placeholder="3-digit CVV"
                  value={checkoutData.cvv}
                  onChange={(e) => setCheckoutData({...checkoutData, cvv: e.target.value.replace(/\D/g, '')})}
                  required
                />
              </div>
              <div style={{ marginTop: '1.5rem', fontWeight: 'bold', fontSize: '1.2rem' }}>
                Total Amount: ${getCartTotal().toFixed(2)}
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn-success" style={{ flex: 1 }}>
                  Complete Purchase
                </button>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => {
                    setShowCheckout(false);
                    setCheckoutData({ cardNumber: '', expiryDate: '', cvv: '' });
                  }}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  // Render Order History
  const renderOrderHistory = () => (
    <div className="card">
      <h3>Order History</h3>
      
      {orders.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '2rem', color: '#7f8c8d' }}>
          No orders yet
        </p>
      ) : (
        orders.map(order => (
          <div key={order.id} style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            backgroundColor: '#f8f9fa'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <h4>Order #{order.id}</h4>
                <p style={{ color: '#7f8c8d' }}>Date: {order.orderDate}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#27ae60' }}>
                  ${order.totalPrice.toFixed(2)}
                </p>
              </div>
            </div>
            
            <table style={{ width: '100%', marginTop: '1rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#e9ecef' }}>
                  <th style={{ padding: '0.5rem' }}>Book</th>
                  <th style={{ padding: '0.5rem' }}>ISBN</th>
                  <th style={{ padding: '0.5rem' }}>Quantity</th>
                  <th style={{ padding: '0.5rem' }}>Price</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={index}>
                    <td style={{ padding: '0.5rem' }}>{item.title}</td>
                    <td style={{ padding: '0.5rem' }}>{item.isbn}</td>
                    <td style={{ padding: '0.5rem' }}>{item.quantity}</td>
                    <td style={{ padding: '0.5rem' }}>${item.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );

  // Render Profile
  const renderProfile = () => (
    <div className="card">
      <h3>My Profile</h3>
      
      {!editProfile ? (
        <div>
          <div style={{ marginBottom: '1rem' }}>
            <strong>Username:</strong> {user?.username}
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <strong>Name:</strong> {profileData.firstName} {profileData.lastName}
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <strong>Email:</strong> {profileData.email}
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <strong>Phone:</strong> {profileData.phone}
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <strong>Address:</strong> {profileData.address}
          </div>
          <button 
            className="btn" 
            onClick={() => setEditProfile(true)}
            style={{ marginTop: '1rem' }}
          >
            Edit Profile
          </button>
        </div>
      ) : (
        <form onSubmit={handleProfileUpdate}>
          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              value={profileData.firstName}
              onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              value={profileData.lastName}
              onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({...profileData, email: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Address</label>
            <textarea
              value={profileData.address}
              onChange={(e) => setProfileData({...profileData, address: e.target.value})}
              rows="3"
              required
            />
          </div>
          <div className="form-group">
            <label>New Password (leave blank to keep current)</label>
            <input
              type="password"
              value={profileData.password}
              onChange={(e) => setProfileData({...profileData, password: e.target.value})}
              placeholder="Enter new password"
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" className="btn">Save Changes</button>
            <button 
              type="button" 
              className="btn-secondary"
              onClick={() => setEditProfile(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/">📚 Online Bookstore</Link>
        </div>
        <ul className="navbar-menu">
          <li><Link to="/">Home</Link></li>
          <li>
            <span style={{ position: 'relative' }}>
              Cart
              {cart.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  backgroundColor: '#e74c3c',
                  color: 'white',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem'
                }}>
                  {cart.length}
                </span>
              )}
            </span>
          </li>
          <li><button onClick={handleLogout}>Logout ({user?.username})</button></li>
        </ul>
      </nav>

      {/* Dashboard Layout */}
      <div className="dashboard">
        {/* Sidebar */}
        <aside className="sidebar">
          <h2>Customer Panel</h2>
          <nav>
            <button 
              className={activeTab === 'browse' ? 'active' : ''}
              onClick={() => setActiveTab('browse')}
            >
              📚 Browse Books
            </button>
            <button 
              className={activeTab === 'cart' ? 'active' : ''}
              onClick={() => setActiveTab('cart')}
            >
              🛒 Shopping Cart
              {cart.length > 0 && ` (${cart.length})`}
            </button>
            <button 
              className={activeTab === 'orders' ? 'active' : ''}
              onClick={() => setActiveTab('orders')}
            >
              📦 Order History
            </button>
            <button 
              className={activeTab === 'profile' ? 'active' : ''}
              onClick={() => setActiveTab('profile')}
            >
               👤 My Profile
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {activeTab === 'browse' && renderBrowseBooks()}
          {activeTab === 'cart' && renderShoppingCart()}
          {activeTab === 'orders' && renderOrderHistory()}
          {activeTab === 'profile' && renderProfile()}
        </main>
      </div>
    </div>
  );
}

export default CustomerDashboard;
              