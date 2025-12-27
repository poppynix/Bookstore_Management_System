import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8800';

function AdminDashboard({ user, books, addBook, updateBook, deleteBook }) {
  const [activeTab, setActiveTab] = useState('books');
  const [orders, setOrders] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  // 1. Initial State synchronized with Backend Column Names
  const [bookForm, setBookForm] = useState({
    isbn: '',
    title: '',
    author: '', 
    publisher: '',
    p_id: '', 
    pub_year: '', 
    price: '',
    category: 'Science',
    stock_quantity: '', 
    threshold: ''
  });

  const [reportData, setReportData] = useState({
    lastMonthSales: 0,
    lastMonthName: '',
    topCustomers: [],
    topBooks: []
  });

  const [selectedDate, setSelectedDate] = useState('');
  const [dateSales, setDateSales] = useState(null);
  const [selectedISBN, setSelectedISBN] = useState('');
  const [bookOrderCount, setBookOrderCount] = useState(null);

  useEffect(() => {
    fetchReportData();
    fetchPublisherOrders();
  }, []);

  const fetchReportData = async () => {
    try {
      const monthSalesRes = await axios.get(`${API_URL}/api/reports/previous-month-sales`);
      const topCustomersRes = await axios.get(`${API_URL}/api/reports/top-customers`);
      const topBooksRes = await axios.get(`${API_URL}/api/reports/top-books`);
      
      setReportData({
        lastMonthSales: monthSalesRes.data.total_sales || 0,
        lastMonthName: monthSalesRes.data.month || 'N/A',
        topCustomers: topCustomersRes.data || [],
        topBooks: topBooksRes.data || []
      });
    } catch (err) {
      console.error('Error fetching report data:', err);
    }
  };

  const fetchPublisherOrders = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/publisher-orders`);
      setOrders(response.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const handleDateSalesSearch = async () => {
    if (!selectedDate) return alert('Please select a date');
    try {
      const response = await axios.get(`${API_URL}/api/reports/sales-by-date?date=${selectedDate}`);
      setDateSales(response.data);
    } catch (err) {
      alert('Failed to fetch sales data');
    }
  };

  const handleBookOrderCountSearch = async () => {
    if (!selectedISBN) return alert('Please enter an ISBN');
    try {
      const response = await axios.get(`${API_URL}/api/reports/book-order-count/${selectedISBN}`);
      setBookOrderCount(response.data);
    } catch (err) {
      alert('Book not found');
    }
  };

  const handleBookFormChange = (e) => {
    setBookForm({
      ...bookForm,
      [e.target.name]: e.target.value
    });
  };

  const resetForm = () => {
    setBookForm({ 
      isbn: '', title: '', author: '', publisher: '', p_id: '',
      pub_year: '', price: '', category: 'Science', 
      stock_quantity: '', threshold: '' 
    });
    setEditingBook(null);
    setShowAddForm(false);
  };

  const handleEditClick = (book) => {
    setEditingBook(book);
    setBookForm({
      isbn: book.isbn || '',
      title: book.title || '',
      author: book.author_name || '', 
      publisher: book.publisher_name || '',
      p_id: book.p_id || '', 
      pub_year: book.pub_year || '', 
      price: book.price || '',
      category: book.category || 'Science',
      stock_quantity: book.stock_quantity || 0, 
      threshold: book.threshold || 0
    });
    setShowAddForm(true);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const newBook = { 
      ...bookForm, 
      stock_quantity: parseInt(bookForm.stock_quantity), 
      threshold: parseInt(bookForm.threshold),
      pub_year: parseInt(bookForm.pub_year),
      price: parseFloat(bookForm.price)
    };
    addBook(newBook);
    resetForm();
  };

const handleUpdateSubmit = async (e) => {
  e.preventDefault();
  
  // LOG THIS to your browser console (F12) to see what is being sent
  console.log("Sending to backend:", bookForm);

  try {
    await updateBook(bookForm); 
    alert("Check your backend terminal for result!");
    resetForm();
  } catch (err) {
    console.error("Request failed:", err);
  }
};


  const handleConfirmOrder = (orderId) => {
    const order = orders.find(o => o.order_id === orderId);
    if (order) {
      setOrders(orders.map(o => o.order_id === orderId ? { ...o, status: 'Confirmed' } : o));
      const bookToUpdate = books.find(b => b.isbn === order.isbn);
      if (bookToUpdate) {
         updateBook({
            ...bookToUpdate,
            stock_quantity: bookToUpdate.stock_quantity + order.quantity
         });
      }
      alert(`Order #${orderId} confirmed!`);
    }
  };

  const renderBooksManagement = () => (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3>Manage Books</h3>
        <button className="btn" onClick={() => { if(showAddForm) resetForm(); else setShowAddForm(true); }}>
          {showAddForm ? 'Cancel' : '+ Add New Book'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={editingBook ? handleUpdateSubmit : handleAddSubmit} style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <h4>{editingBook ? 'Edit Book' : 'Add New Book'}</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group"><label>ISBN *</label><input type="text" name="isbn" value={bookForm.isbn} onChange={handleBookFormChange} disabled={editingBook !== null} required /></div>
            <div className="form-group"><label>Title *</label><input type="text" name="title" value={bookForm.title} onChange={handleBookFormChange} required /></div>
            <div className="form-group"><label>Author Name</label><input type="text" name="author" value={bookForm.author} onChange={handleBookFormChange} /></div>
            <div className="form-group"><label>Publisher ID (p_id) *</label><input type="number" name="p_id" value={bookForm.p_id} onChange={handleBookFormChange} required /></div>
            <div className="form-group"><label>Year *</label><input type="number" name="pub_year" value={bookForm.pub_year} onChange={handleBookFormChange} required /></div>
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
            <div className="form-group"><label>Stock *</label><input type="number" name="stock_quantity" value={bookForm.stock_quantity} onChange={handleBookFormChange} required /></div>
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
              <th>Publisher</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map(book => (
              <tr key={book.isbn}>
                <td>{book.isbn}</td>
                <td>{book.title}</td>
                <td>{book.publisher_name}</td>
                <td style={{ color: book.stock_quantity <= book.threshold ? '#e74c3c' : '#27ae60', fontWeight: 'bold' }}>
                  {book.stock_quantity} {book.stock_quantity <= book.threshold && " (Low!)"}
                </td>
                <td>
                  <button className="btn" style={{ marginRight: '0.5rem' }} onClick={() => handleEditClick(book)}>Edit</button>
                  <button className="btn-danger" onClick={() => deleteBook(book.isbn)}>Delete</button>
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
      <h3>Manage Publisher Orders</h3>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Book Title</th>
              <th>Publisher</th>
              <th>Qty</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.order_id}>
                <td>#{order.order_id}</td>
                <td>{order.title}</td>
                <td>{order.publisher_name}</td>
                <td>{order.quantity}</td>
                <td>{order.status}</td>
                <td>
                  {order.status === 'Pending' && (
                    <button className="btn-success" onClick={() => handleConfirmOrder(order.order_id)}>Confirm</button>
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
      <h3>📊 Admin Reports</h3>
      
      <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h4>Previous Month Sales</h4>
        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#27ae60' }}>
          {reportData.lastMonthName}: ${Number(reportData.lastMonthSales || 0).toFixed(2)}
        </p>
      </div>

      <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h4>Sales by Date</h4>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)} 
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }} 
          />
          <button className="btn" onClick={handleDateSalesSearch}>Search</button>
        </div>
        {dateSales && (
          <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '4px' }}>
            <p><strong>Total Sales:</strong> ${Number(dateSales.total_sales || 0).toFixed(2)}</p>
            <p><strong>Orders:</strong> {dateSales.order_count}</p>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h4>Top 5 Customers</h4>
        <table style={{ width: '100%' }}>
          <thead><tr><th>Name</th><th>Spent</th></tr></thead>
          <tbody>
            {reportData.topCustomers.map(c => (
              <tr key={c.customer_id}>
                <td>{c.first_name} {c.last_name}</td>
                <td>${Number(c.total_spent).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h4>Top 10 Selling Books</h4>
        <table style={{ width: '100%' }}>
          <thead><tr><th>Title</th><th>Sold</th></tr></thead>
          <tbody>
            {reportData.topBooks.map(b => (
              <tr key={b.isbn}>
                <td>{b.title}</td>
                <td>{b.total_copies_sold}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h4>Book History Search</h4>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <input 
            type="text" 
            placeholder="Enter ISBN" 
            value={selectedISBN} 
            onChange={(e) => setSelectedISBN(e.target.value)} 
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', flex: 1 }} 
          />
          <button className="btn" onClick={handleBookOrderCountSearch}>Search</button>
        </div>
        {bookOrderCount && (
          <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '4px' }}>
            <p><strong>Title:</strong> {bookOrderCount.title}</p>
            <p><strong>Total Quantity Ordered:</strong> {bookOrderCount.total_quantity_ordered || 0}</p>
          </div>
        )}
      </div>
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