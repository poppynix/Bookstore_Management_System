import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Home() {
  const [books, setBooks] = useState([]);
  const [searchType, setSearchType] = useState('title');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBooks, setFilteredBooks] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  // Mock data - Replace with API call when backend is ready
  useEffect(() => {
    const mockBooks = [
      { isbn: '978-0-123456-47-2', title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', publisher: 'MIT Press', year: 2009, price: 89.99, category: 'Science', stock: 15 },
      { isbn: '978-0-134685-99-1', title: 'Clean Code', author: 'Robert C. Martin', publisher: 'Prentice Hall', year: 2008, price: 45.99, category: 'Science', stock: 20 },
      { isbn: '978-0-596007-12-4', title: 'The Art of Computer Programming', author: 'Donald Knuth', publisher: 'Addison-Wesley', year: 2011, price: 199.99, category: 'Science', stock: 8 },
      { isbn: '978-1-449355-73-9', title: 'Learning Python', author: 'Mark Lutz', publisher: "O'Reilly Media", year: 2013, price: 64.99, category: 'Science', stock: 25 },
      { isbn: '978-0-321573-51-3', title: 'The Pragmatic Programmer', author: 'Andrew Hunt', publisher: 'Addison-Wesley', year: 2019, price: 49.99, category: 'Science', stock: 12 },
      { isbn: '978-0-262033-84-8', title: 'Artificial Intelligence', author: 'Stuart Russell', publisher: 'MIT Press', year: 2020, price: 95.00, category: 'Science', stock: 10 },
      { isbn: '978-1-593279-50-9', title: 'The Art of War', author: 'Sun Tzu', publisher: 'Penguin Classics', year: 2005, price: 12.99, category: 'History', stock: 30 },
      { isbn: '978-0-143039-43-0', title: 'A Brief History of Time', author: 'Stephen Hawking', publisher: 'Bantam Books', year: 1998, price: 18.99, category: 'Science', stock: 18 },
      { isbn: '978-0-307387-89-9', title: 'Sapiens', author: 'Yuval Noah Harari', publisher: 'Harper', year: 2015, price: 24.99, category: 'History', stock: 22 },
      { isbn: '978-0-452284-23-4', title: '1984', author: 'George Orwell', publisher: 'Signet Classic', year: 1950, price: 15.99, category: 'Art', stock: 40 }
    ];
    setBooks(mockBooks);
    setFilteredBooks(mockBooks);
  }, []);

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

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const addToCart = (book) => {
    if (!user) {
      alert('Please login to add items to cart');
      navigate('/login');
      return;
    }

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.isbn === book.isbn);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...book, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`${book.title} added to cart!`);
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/">📚 Online Bookstore</Link>
        </div>
        <ul className="navbar-menu">
          <li><Link to="/">Home</Link></li>
          {!user ? (
            <>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
            </>
          ) : (
            <>
              <li><Link to={user.role === 'admin' ? '/admin' : '/customer'}>Dashboard</Link></li>
              <li><button onClick={handleLogout}>Logout ({user.username})</button></li>
            </>
          )}
        </ul>
      </nav>

      {/* Main Content */}
      <div className="container">
        <h1 style={{ marginBottom: '2rem', color: '#2c3e50' }}>Browse Our Collection</h1>

        {/* Search Bar */}
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

        {/* Books Grid */}
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
                <p><strong>Year:</strong> {book.year}</p>
                <p><strong>Category:</strong> {book.category}</p>
                <p className="price">${book.price}</p>
                <p style={{ color: book.stock > 0 ? '#27ae60' : '#e74c3c' }}>
                  {book.stock > 0 ? `In Stock (${book.stock})` : 'Out of Stock'}
                </p>
                {user && user.role === 'customer' && book.stock > 0 && (
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
    </div>
  );
}

export default Home;