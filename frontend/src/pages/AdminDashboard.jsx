import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('books');
  const [books, setBooks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const [bookForm, setBookForm] = useState({
    isbn: '',
    title: '',
    author: '',
    publisher: '',
    year: '',
    price: '',
    category: 'Science',
    stock: '',
    threshold: ''
  });

  const [reportData, setReportData] = useState({
    lastMonthSales: 0,
    topCustomers: [],
    topBooks: []
  });

  // Mock data initialization
  useEffect(() => {
    // Mock books
    const mockBooks = [
      { isbn: '978-0-123456-47-2', title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', publisher: 'MIT Press', year: 2009, price: 89.99, category: 'Science', stock: 15, threshold: 5 },
      { isbn: '978-0-134685-99-1', title: 'Clean Code', author: 'Robert C. Martin', publisher: 'Prentice Hall', year: 2008, price: 45.99, category: 'Science', stock: 20, threshold: 10 },
      { isbn: '978-0-596007-12-4', title: 'The Art of Computer Programming', author: 'Donald Knuth', publisher: 'Addison-Wesley', year: 2011, price: 199.99, category: 'Science', stock: 8, threshold: 5 }
    ];
    setBooks(mockBooks);

    // Mock orders
    const mockOrders = [
      { id: 1, isbn: '978-0-123456-47-2', bookTitle: 'Introduction to Algorithms', quantity: 10, status: 'Pending', orderDate: '2025-01-15' },
      { id: 2, isbn: '978-0-596007-12-4', bookTitle: 'The Art of Computer Programming', quantity: 5, status: 'Pending', orderDate: '2025-01-16' }
    ];
    setOrders(mockOrders);

    // Mock report data
    setReportData({
      lastMonthSales: 15420.50,
      topCustomers: [
        { name: 'John Doe', totalSpent: 450.00 },
        { name: 'Jane Smith', totalSpent: 380.00 },
        { name: 'Bob Johnson', totalSpent: 320.00 },
        { name: 'Alice Williams', totalSpent: 290.00 },
        { name: 'Charlie Brown', totalSpent: 250.00 }
      ],
      topBooks: [
        { title: 'Clean Code', copiesSold: 45 },
        { title: 'Introduction to Algorithms', copiesSold: 38 },
        { title: 'The Pragmatic Programmer', copiesSold: 32 },
        { title: 'Learning Python', copiesSold: 28 },
        { title: 'Design Patterns', copiesSold: 25 },
        { title: 'Refactoring', copiesSold: 22 },
        { title: 'Code Complete', copiesSold: 20 },
        { title: 'The Clean Coder', copiesSold: 18 },
        { title: 'Working Effectively with Legacy Code', copiesSold: 15 },
        { title: 'Domain-Driven Design', copiesSold: 12 }
      ]
    });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleBookFormChange = (e) => {
    setBookForm({
      ...bookForm,
      [e.target.name]: e.target.value
    });
  };

  const handleAddBook = (e) => {
    e.preventDefault();
    // TODO: Replace with API call
    const newBook = { ...bookForm, stock: parseInt(bookForm.stock), threshold: parseInt(bookForm.threshold) };
    setBooks([...books, newBook]);
    setBookForm({
      isbn: '',
      title: '',
      author: '',
      publisher: '',
      year: '',
      price: '',
      category: 'Science',
      stock: '',
      threshold: ''
    });
    setShowAddForm(false);
    alert('Book added successfully!');
  };

  const handleEditBook = (book) => {
    setEditingBook(book);
    setBookForm(book);
    setShowAddForm(true);
  };

  const handleUpdateBook = (e) => {
    e.preventDefault();
    // TODO: Replace with API call
    const updatedBooks = books.map(b => 
      b.isbn === editingBook.isbn ? { ...bookForm } : b
    );
    setBooks(updatedBooks);
    setEditingBook(null);
    setBookForm({
      isbn: '',
      title: '',
      author: '',
      publisher: '',
      year: '',
      price: '',
      category: 'Science',
      stock: '',
      threshold: ''
    });
    setShowAddForm(false);
    alert('Book updated successfully!');
  };

  const handleDeleteBook = (isbn) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      // TODO: Replace with API call
      setBooks(books.filter(b => b.isbn !== isbn));
      alert('Book deleted successfully!');
    }
  };

  const handleConfirmOrder = (orderId) => {
    // TODO: Replace with API call
    const order = orders.find(o => o.id === orderId);
    if (order) {
      // Update order status
      setOrders(orders.map(o => 
        o.id === orderId ? { ...o, status: 'Confirmed' } : o
      ));
      
      // Update book stock
      setBooks(books.map(b => 
        b.isbn === order.isbn ? { ...b, stock: b.stock + order.quantity } : b
      ));
      
      alert(`Order #${orderId} confirmed! Stock updated.`);
    }
  };

  // Render Books Management
  const renderBooksManagement = () => (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3>Manage Books</h3>
        <button 
          className="btn" 
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingBook(null);
            setBookForm({
              isbn: '',
              title: '',
              author: '',
              publisher: '',
              year: '',
              price: '',
              category: 'Science',
              stock: '',
              threshold: ''
            });
          }}
        >
          {showAddForm ? 'Cancel' : '+ Add New Book'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={editingBook ? handleUpdateBook : handleAddBook} style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <h4>{editingBook ? 'Edit Book' : 'Add New Book'}</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>ISBN *</label>
              <input
                type="text"
                name="isbn"
                value={bookForm.isbn}
                onChange={handleBookFormChange}
                disabled={editingBook !== null}
                required
              />
            </div>
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                name="title"
                value={bookForm.title}
                onChange={handleBookFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Author *</label>
              <input
                type="text"
                name="author"
                value={bookForm.author}
                onChange={handleBookFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Publisher *</label>
              <input
                type="text"
                name="publisher"
                value={bookForm.publisher}
                onChange={handleBookFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Publication Year *</label>
              <input
                type="number"
                name="year"
                value={bookForm.year}
                onChange={handleBookFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Price ($) *</label>
              <input
                type="number"
                step="0.01"
                name="price"
                value={bookForm.price}
                onChange={handleBookFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Category *</label>
              <select
                name="category"
                value={bookForm.category}
                onChange={handleBookFormChange}
                required
              >
                <option value="Science">Science</option>
                <option value="Art">Art</option>
                <option value="Religion">Religion</option>
                <option value="History">History</option>
                <option value="Geography">Geography</option>
              </select>
            </div>
            <div className="form-group">
              <label>Stock Quantity *</label>
              <input
                type="number"
                name="stock"
                value={bookForm.stock}
                onChange={handleBookFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Stock Threshold *</label>
              <input
                type="number"
                name="threshold"
                value={bookForm.threshold}
                onChange={handleBookFormChange}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn" style={{ marginTop: '1rem' }}>
            {editingBook ? 'Update Book' : 'Add Book'}
          </button>
        </form>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ISBN</th>
              <th>Title</th>
              <th>Author</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Threshold</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map(book => (
              <tr key={book.isbn}>
                <td>{book.isbn}</td>
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td>{book.category}</td>
                <td>${book.price}</td>
                <td style={{ color: book.stock <= book.threshold ? '#e74c3c' : '#27ae60' }}>
                  {book.stock}
                </td>
                <td>{book.threshold}</td>
                <td>
                  <button 
                    className="btn" 
                    style={{ marginRight: '0.5rem', padding: '0.5rem 1rem' }}
                    onClick={() => handleEditBook(book)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn-danger" 
                    style={{ padding: '0.5rem 1rem' }}
                    onClick={() => handleDeleteBook(book.isbn)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Render Orders Management
  const renderOrdersManagement = () => (
    <div className="card">
      <h3>Manage Orders (From Publishers)</h3>
      <p style={{ color: '#7f8c8d', marginBottom: '1.5rem' }}>
        Orders are automatically placed when book stock falls below threshold
      </p>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>ISBN</th>
              <th>Book Title</th>
              <th>Quantity</th>
              <th>Order Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{order.isbn}</td>
                <td>{order.bookTitle}</td>
                <td>{order.quantity}</td>
                <td>{order.orderDate}</td>
                <td>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '4px',
                    backgroundColor: order.status === 'Confirmed' ? '#d4edda' : '#fff3cd',
                    color: order.status === 'Confirmed' ? '#155724' : '#856404'
                  }}>
                    {order.status}
                  </span>
                </td>
                <td>
                  {order.status === 'Pending' && (
                    <button 
                      className="btn-success"
                      style={{ padding: '0.5rem 1rem' }}
                      onClick={() => handleConfirmOrder(order.id)}
                    >
                      Confirm Order
                    </button>
                  )}
                  {order.status === 'Confirmed' && (
                    <span style={{ color: '#27ae60' }}>✓ Completed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Render Reports
  const renderReports = () => (
    <div>
      <div className="card">
        <h3>Sales Reports</h3>
        
        {/* Last Month Sales */}
        <div style={{ marginBottom: '2rem' }}>
          <h4>Total Sales - Last Month</h4>
          <p style={{ fontSize: '2rem', color: '#27ae60', fontWeight: 'bold' }}>
            ${reportData.lastMonthSales.toFixed(2)}
          </p>
        </div>

        {/* Top 5 Customers */}
        <div style={{ marginBottom: '2rem' }}>
          <h4>Top 5 Customers (Last 3 Months)</h4>
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Customer Name</th>
                <th>Total Spent</th>
              </tr>
            </thead>
            <tbody>
              {reportData.topCustomers.map((customer, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{customer.name}</td>
                  <td>${customer.totalSpent.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Top 10 Books */}
        <div>
          <h4>Top 10 Selling Books (Last 3 Months)</h4>
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Book Title</th>
                <th>Copies Sold</th>
              </tr>
            </thead>
            <tbody>
              {reportData.topBooks.map((book, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{book.title}</td>
                  <td>{book.copiesSold}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Additional Report Options */}
      <div className="card">
        <h3>Generate Custom Reports</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <label>Select Date for Sales Report:</label>
            <input type="date" style={{ marginLeft: '1rem', padding: '0.5rem' }} />
            <button className="btn" style={{ marginLeft: '1rem' }}>Generate Report</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/">📚 Online Bookstore - Admin</Link>
        </div>
        <ul className="navbar-menu">
          <li><Link to="/">Home</Link></li>
          <li><button onClick={handleLogout}>Logout ({user?.username})</button></li>
        </ul>
      </nav>

      {/* Dashboard Layout */}
      <div className="dashboard">
        {/* Sidebar */}
        <aside className="sidebar">
          <h2>Admin Panel</h2>
          <nav>
            <button 
              className={activeTab === 'books' ? 'active' : ''}
              onClick={() => setActiveTab('books')}
            >
              📚 Manage Books
            </button>
            <button 
              className={activeTab === 'orders' ? 'active' : ''}
              onClick={() => setActiveTab('orders')}
            >
              📦 Manage Orders
            </button>
            <button 
              className={activeTab === 'reports' ? 'active' : ''}
              onClick={() => setActiveTab('reports')}
            >
              📊 Reports
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {activeTab === 'books' && renderBooksManagement()}
          {activeTab === 'orders' && renderOrdersManagement()}
          {activeTab === 'reports' && renderReports()}
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;