import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // TODO: Replace with actual API call when backend is ready
    // Mock login logic
    if (!formData.username || !formData.password) {
      setError('Please enter both username and password');
      return;
    }

    // Mock user data
    const mockUser = {
      id: formData.username === 'admin' ? 1 : 2,
      username: formData.username,
      role: formData.username === 'admin' ? 'admin' : 'customer',
      firstName: formData.username === 'admin' ? 'Admin' : 'John',
      lastName: formData.username === 'admin' ? 'User' : 'Doe',
      email: `${formData.username}@example.com`
    };

    // Save to localStorage
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('token', 'mock-jwt-token-' + Date.now());

    // Redirect based on role
    if (mockUser.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/customer');
    }
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
          <li><Link to="/register">Register</Link></li>
        </ul>
      </nav>

      {/* Login Form */}
      <div className="form-container">
        <h2>Login to Your Account</h2>
        
        {error && (
          <div className="alert alert-error">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="btn">Login</button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1rem' }}>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>

        <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
          <p style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>
            <strong>Test Credentials:</strong><br />
            Admin: username = "admin", password = any<br />
            Customer: username = any other, password = any
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;