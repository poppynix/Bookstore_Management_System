import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// 1. Accept props from App.js
function AdminDashboard({ user, books, addBook, updateBook, deleteBook }) {
  const [activeTab, setActiveTab] = useState('books');
  // Removed local 'books' state because we use props.books now
  
  const [orders, setOrders] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

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

  // Mock data initialization (Only for Orders/Reports now)
  useEffect(() => {
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
      ],
      topBooks: [
        { title: 'Clean Code', copiesSold: 45 },
        { title: 'Introduction to Algorithms', copiesSold: 38 },
      ]
    });
  }, []);

  const handleBookFormChange = (e) => {
    setBookForm({
      ...bookForm,
      [e.target.name]: e.target.value
    });
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const newBook = { ...bookForm, stock: parseInt(bookForm.stock), threshold: parseInt(bookForm.threshold) };
    
    // Call global function
    addBook(newBook);
    
    setBookForm({ isbn: '', title: '', author: '', publisher: '', year: '', price: '', category: 'Science', stock: '', threshold: '' });
    setShowAddForm(false);
    alert('Book added successfully!');
  };

  const handleEditClick = (book) => {
    setEditingBook(book);
    setBookForm(book);
    setShowAddForm(true);
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    const updatedBook = { ...bookForm, stock: parseInt(bookForm.stock), threshold: parseInt(bookForm.threshold) };
    
    // Call global function
    updateBook(updatedBook);
    
    setEditingBook(null);
    setBookForm({ isbn: '', title: '', author: '', publisher: '', year: '', price: '', category: 'Science', stock: '', threshold: '' });
    setShowAddForm(false);
    alert('Book updated successfully!');
  };

  const handleDeleteClick = (isbn) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      // Call global function
      deleteBook(isbn);
      alert('Book deleted successfully!');
    }
  };

  const handleConfirmOrder = (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'Confirmed' } : o));
      
      // Update stock globally via updateBook prop
      const bookToUpdate = books.find(b => b.isbn === order.isbn);
      if (bookToUpdate) {
         updateBook({
            ...bookToUpdate,
            stock: bookToUpdate.stock + order.quantity
         });
      }
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
            setBookForm({ isbn: '', title: '', author: '', publisher: '', year: '', price: '', category: 'Science', stock: '', threshold: '' });
          }}
        >
          {showAddForm ? 'Cancel' : '+ Add New Book'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={editingBook ? handleUpdateSubmit : handleAddSubmit} style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <h4>{editingBook ? 'Edit Book' : 'Add New Book'}</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group"><label>ISBN *</label><input type="text" name="isbn" value={bookForm.isbn} onChange={handleBookFormChange} disabled={editingBook !== null} required /></div>
            <div className="form-group"><label>Title *</label><input type="text" name="title" value={bookForm.title} onChange={handleBookFormChange} required /></div>
            <div className="form-group"><label>Author *</label><input type="text" name="author" value={bookForm.author} onChange={handleBookFormChange} required /></div>
            <div className="form-group"><label>Publisher *</label><input type="text" name="publisher" value={bookForm.publisher} onChange={handleBookFormChange} required /></div>
            <div className="form-group"><label>Year *</label><input type="number" name="year" value={bookForm.year} onChange={handleBookFormChange} required /></div>
            <div className="form-group"><label>Price *</label><input type="number" step="0.01" name="price" value={bookForm.price} onChange={handleBookFormChange} required /></div>
            <div className="form-group">
                <label>Category *</label>
                <select name="category" value={bookForm.category} onChange={handleBookFormChange}>
                    <option value="Science">Science</option>
                    <option value="Art">Art</option>
                    <option value="Religion">Religion</option>
                    <option value="History">History</option>
                    <option value="Geography">Geography</option>
                </select>
            </div>
            <div className="form-group"><label>Stock *</label><input type="number" name="stock" value={bookForm.stock} onChange={handleBookFormChange} required /></div>
            <div className="form-group"><label>Threshold *</label><input type="number" name="threshold" value={bookForm.threshold} onChange={handleBookFormChange} required /></div>
          </div>
          <button type="submit" className="btn" style={{ marginTop: '1rem' }}>{editingBook ? 'Update Book' : 'Add Book'}</button>
        </form>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ISBN</th>
              <th>Title</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map(book => (
              <tr key={book.isbn}>
                <td>{book.isbn}</td>
                <td>{book.title}</td>
                <td>{book.category}</td>
                <td style={{ color: book.stock <= book.threshold ? '#e74c3c' : '#27ae60', fontWeight: 'bold' }}>
                  {book.stock} {book.stock <= book.threshold && " (Low!)"}
                </td>
                <td>
                  <button className="btn" style={{ marginRight: '0.5rem' }} onClick={() => handleEditClick(book)}>Edit</button>
                  <button className="btn-danger" onClick={() => handleDeleteClick(book.isbn)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderOrdersManagement = () => (
    <div className="card">
      <h3>Manage Orders</h3>
      <div className="table-container">
        <table>
          <thead><tr><th>ID</th><th>Book Title</th><th>Qty</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{order.bookTitle}</td>
                <td>{order.quantity}</td>
                <td>{order.status}</td>
                <td>
                  {order.status === 'Pending' && (
                    <button className="btn-success" onClick={() => handleConfirmOrder(order.id)}>Confirm</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="card">
        <h3>Reports</h3>
        <p>Total Sales: ${reportData.lastMonthSales}</p>
        {/* Simplified for brevity */}
    </div>
  );

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h2>Admin Panel</h2>
        <nav>
          <button className={activeTab === 'books' ? 'active' : ''} onClick={() => setActiveTab('books')}>📚 Books</button>
          <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>📦 Orders</button>
          <button className={activeTab === 'reports' ? 'active' : ''} onClick={() => setActiveTab('reports')}>📊 Reports</button>
        </nav>
      </aside>
      <main className="main-content">
        {activeTab === 'books' && renderBooksManagement()}
        {activeTab === 'orders' && renderOrdersManagement()}
        {activeTab === 'reports' && renderReports()}
      </main>
    </div>
  );
}

export default AdminDashboard;