import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Accept 'books' and 'addToCart' from App.js
function Home({ books, addToCart }) {
  const [searchType, setSearchType] = useState('title');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBooks, setFilteredBooks] = useState([]);

  // Update filtered books whenever the 'books' prop changes or search changes
  useEffect(() => {
    if (!books) return;
    setFilteredBooks(books);
  }, [books]);

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

  return (
    <div className="home-container">
      <div className="hero-section" style={{ textAlign: 'center', padding: '2rem', backgroundColor: '#f4f4f4', marginBottom: '2rem' }}>
        <h1>Welcome to the Online Bookstore</h1>
        <p>Discover your next favorite book today.</p>
      </div>

      <div className="container">
        <h2>Browse Our Collection</h2>
        
        {/* Search Bar */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <form className="search-bar" onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <select 
              value={searchType} 
              onChange={(e) => setSearchType(e.target.value)}
              style={{ padding: '0.5rem' }}
            >
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
              style={{ padding: '0.5rem', width: '300px' }}
            />
            <button type="submit" className="btn">Search</button>
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

        {/* Books Grid */}
        <div className="grid">
          {filteredBooks.length === 0 ? (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
              No books found matching your search.
            </p>
          ) : (
            filteredBooks.map(book => (
              <div key={book.isbn} className="book-card">
                <div style={{ fontSize: '4rem', textAlign: 'center', marginBottom: '1rem' }}>📖</div>
                <h4>{book.title}</h4>
                <p><strong>Author:</strong> {book.author}</p>
                <p><strong>ISBN:</strong> {book.isbn}</p>
                <p><strong>Category:</strong> {book.category}</p>
                <p className="price">${book.price}</p>
                
                <p style={{ color: book.stock > 0 ? '#27ae60' : '#e74c3c', fontWeight: 'bold' }}>
                  {book.stock > 0 ? `In Stock (${book.stock})` : 'Out of Stock'}
                </p>

                {book.stock > 0 && (
                  <button 
                    className="btn" 
                    onClick={() => addToCart(book)}
                    style={{ marginTop: '1rem', width: '100%' }}
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