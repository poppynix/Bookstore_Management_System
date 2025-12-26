import React, { useState } from 'react';

function Cart({ cartItems, removeFromCart, checkout }) {
  const [creditCard, setCreditCard] = useState('');
  const [expiry, setExpiry] = useState('');

  const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = (e) => {
    e.preventDefault();
    if (creditCard.length === 16 && expiry) {
      alert("Transaction Successful! Books will be deducted from stock.");
      checkout(); // Clears the global cart
    } else {
      alert("Invalid Credit Card Information");
    }
  };

  return (
    <div className="cart-container">
      <h2>Your Shopping Cart</h2>
      {cartItems.length === 0 ? <p>Cart is empty</p> : (
        <div>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => (
                <tr key={item.ISBN}>
                  <td>{item.title}</td>
                  <td>${item.price}</td>
                  <td>{item.quantity}</td>
                  <td>
                    <button onClick={() => removeFromCart(item.ISBN)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <h3>Total: ${totalPrice.toFixed(2)}</h3>

          <form onSubmit={handleCheckout} className="checkout-form">
            <h4>Checkout</h4>
            <input 
              type="text" 
              placeholder="Credit Card Number (16 digits)" 
              value={creditCard}
              onChange={(e) => setCreditCard(e.target.value)}
              required
            />
            <input 
              type="month" 
              placeholder="Expiry Date" 
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              required
            />
            <button type="submit">Buy Now</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Cart;