import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "./api";
import "../styles/RetailerDashboard.css";

const RetailerDashboard = () => {
  const availableProducts = [
    { id: 1, name: "Organic Tomatoes", price: "$2.50/kg", supplier: "Green Fields Farm" },
    { id: 2, name: "Bell Peppers", price: "$3.00/kg", supplier: "Sunshine Acres" },
    { id: 3, name: "Carrots", price: "$1.80/kg", supplier: "Riverbend Farm" },
    { id: 4, name: "Banana", price: "$2.80/kg", supplier: "Riverbend Farm" },
  ];

  const [cart, setCart] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]); // Retailer -> Distributor orders
  const [customerOrders, setCustomerOrders] = useState([]); // Customer -> Retailer orders 🌟 NEW STATE
  const [activeTab, setActiveTab] = useState("products"); 
  const [addedProductId, setAddedProductId] = useState(null); 
  const navigate = useNavigate();

  // Function to safely get orders from local storage
  const getOrdersFromStorage = (key) => {
    return JSON.parse(localStorage.getItem(key) || "[]");
  };
  const handleLogout = () => {
      logoutUser();
      navigate("/login");
    };
  // =========================================================
  // FIX: Load BOTH Retailer Orders and Customer Orders
  // =========================================================
  useEffect(() => {
    const loadAllOrders = () => {
        // Load Retailer -> Distributor Orders
        setOrderHistory(getOrdersFromStorage("retailerOrders"));
        // Load Customer -> Retailer Orders
        setCustomerOrders(getOrdersFromStorage("customerOrders"));
    };

    loadAllOrders();

    // Listener for changes made by Distributor OR Customer
    const handleStorageChange = (e) => {
        if (e.key === 'retailerOrders' || e.key === 'customerOrders') {
            loadAllOrders();
        }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup the listener
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []); 

  // =========================================================
  // NEW: Function to manage Customer Order status
  // =========================================================
  const updateCustomerOrderStatus = (orderId, newStatus) => {
    const currentOrders = getOrdersFromStorage("customerOrders");
        
    const updatedOrders = currentOrders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
    );

    localStorage.setItem("customerOrders", JSON.stringify(updatedOrders));
    setCustomerOrders(updatedOrders); 
    
    // Optional: Alert for feedback
    alert(`Customer Order ${orderId} status updated to ${newStatus}`);
  };


  const addToCart = (product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }

    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 1500);
  };

  const placeOrder = () => {
    if (cart.length === 0) return;

    const newOrder = {
      id: Date.now(), 
      items: [...cart],
      date: new Date().toISOString().split("T")[0],
      status: "Pending",
      total: cart.reduce(
        (sum, item) =>
          sum + parseFloat(item.price.replace("$", "")) * item.quantity,
        0
      ),
      distributorId: "DIST-001" 
    };

    // Write to shared storage (retailerOrders)
    const existingOrders = getOrdersFromStorage("retailerOrders");
    const updatedOrders = [newOrder, ...existingOrders]; 
    localStorage.setItem("retailerOrders", JSON.stringify(updatedOrders));

    setOrderHistory(updatedOrders);
    setCart([]);
    alert(`Order #${newOrder.id} placed successfully!`);
    setActiveTab("history"); 
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  // Helper function for status styling (includes customer statuses)
  const getStatusClass = (status) => {
    switch (status) {
        case 'Pending': return 'status-pending';
        case 'Processing': return 'status-processing'; // Distributor status
        case 'Shipped': return 'status-shipped';
        case 'Delivered': return 'status-delivered';
        case 'Ready for Pickup': return 'status-ready'; // Customer status
        default: return '';
    }
  };

  return (
    <div className="retailer-dashboard">
      <h1>Retailer Dashboard</h1>
      <p>Welcome! Manage customer orders and restock inventory.</p>
      <button className="btn-logout" onClick={handleLogout}>
          Logout
      </button>
      {/* Tabs */}
      <div className="tabs">
        <button
          className={activeTab === "products" ? "active" : ""}
          onClick={() => setActiveTab("products")}
        >
          Browse Products (Distributor)
        </button>
        {/* 🌟 NEW TAB FOR CUSTOMER ORDERS */}
        <button
          className={activeTab === "customer-orders" ? "active" : ""} 
          onClick={() => setActiveTab("customer-orders")}
        >
          Customer Orders ({customerOrders.length})
        </button>
        <button
          className={activeTab === "cart" ? "active" : ""}
          onClick={() => setActiveTab("cart")}
        >
          My Distributor Cart ({cart.length})
        </button>
        <button
          className={activeTab === "history" ? "active" : ""}
          onClick={() => setActiveTab("history")}
        >
          Distributor History
        </button>
      </div>

      {/* Products Tab (remains the same) */}
      {activeTab === "products" && (
        <div className="products-grid">
          <h2>Available Products</h2>
          <div className="products-list">
            {availableProducts.map((product) => (
              <div key={product.id} className="product-card">
                <h3>{product.name}</h3>
                <p>{product.price}</p>
                <p>Supplier: {product.supplier}</p>
                <button
                  onClick={() => addToCart(product)}
                  disabled={addedProductId === product.id}
                >
                  {addedProductId === product.id ? "Added!" : "Add to Cart"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cart Tab (remains the same) */}
      {activeTab === "cart" && (
        <div className="cart-section">
          <h2>Shopping Cart</h2>
          {cart.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <>
              {/* ... (Cart items JSX) ... */}
              <div className="cart-items">
                {cart.map((item) => (
                  <div key={item.id} className="cart-item">
                    <span>{item.name} x {item.quantity}</span>
                    <span>${(parseFloat(item.price.replace("$", "")) * item.quantity).toFixed(2)}</span>
                    <button onClick={() => removeFromCart(item.id)}>Remove</button>
                  </div>
                ))}
              </div>
              <div className="cart-total">
                Total: ${cart.reduce((sum, item) => sum + parseFloat(item.price.replace("$", "")) * item.quantity, 0).toFixed(2)}
              </div>
              <button className="place-order-btn" onClick={placeOrder}>
                Place Order
              </button>
            </>
          )}
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* 🌟 NEW: Customer Orders Tab */}
      {/* --------------------------------------------------------- */}
      {activeTab === "customer-orders" && (
        <div className="orders-section">
          <h2>Incoming Customer Orders</h2>
          {customerOrders.length === 0 ? (
            <p className="no-orders">No customer orders yet. Time to market!</p>
          ) : (
            <div className="orders-list">
              {customerOrders.map((order) => (
                <div key={order.id} className="order-card customer-order-card">
                  <div className="order-header">
                    <strong>Order ID: {order.id}</strong>
                    <span className={`order-status ${getStatusClass(order.status)}`}>
                        {order.status}
                    </span>
                  </div>
                  <p>
                    <strong>Customer:</strong> {order.customerName}
                  </p>
                  <p>
                    <strong>Date:</strong> {order.date}
                  </p>
                  <p>
                    <strong>Total:</strong> ${order.total.toFixed(2)}
                  </p>
                  <ul>
                    {order.items.map((item, index) => (
                      <li key={index}>
                        {item.name} x {item.quantity}
                      </li>
                    ))}
                  </ul>
                  <div className="order-actions">
                    {order.status === "Pending" && (
                      <button 
                        className="btn-action" 
                        onClick={() => updateCustomerOrderStatus(order.id, "Ready for Pickup")}
                      >
                        Prepare Order
                      </button>
                    )}
                    {(order.status === "Ready for Pickup" || order.status === "Processing") && (
                      <button 
                        className="btn-action status-delivered" 
                        onClick={() => updateCustomerOrderStatus(order.id, "Delivered")}
                      >
                        Mark Delivered
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}


      {/* Distributor Order History Tab (remains the same) */}
      {activeTab === "history" && (
        <div className="order-history">
          <h2>My Distributor Order History</h2>
          {orderHistory.length === 0 ? (
            <p>No orders yet.</p>
          ) : (
            orderHistory.map((order) => (
              <div key={order.id} className="order-card">
                <p><strong>Date:</strong> {order.date}</p>
                <p>
                  <strong>Status:</strong> 
                  <span className={`order-status ${getStatusClass(order.status)}`}>
                    {order.status}
                  </span>
                </p>
                <ul>
                  {order.items.map((item) => (
                    <li key={item.id}>{item.name} x {item.quantity}</li>
                  ))}
                </ul>
                <p><strong>Total:</strong> ${order.total.toFixed(2)}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default RetailerDashboard;