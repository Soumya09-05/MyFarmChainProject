
import React, { useState, useEffect, useCallback } from "react";
import { fileToBase64, analyzeImageWithGemini } from "../api/geminiApi.js"; 
import "../styles/customer.css"; 

// --- MOCK NAVIGATION & AUTH ---

const useNavigate = () => {
  return (path) => {
    console.log(`Navigating to: ${path}`);
    // For demonstration - in a real app, this would use react-router's navigate
    // Since this is a mock, we'll just log and optionally reload to simulate navigation
    if (path === "/login") {
      // Simulate navigation by reloading (for demo purposes)
      setTimeout(() => {
        window.location.href = "/login"; // or window.location.reload() for demo
      }, 100);
    }
  };
};

const logoutUser = () => {
  console.log("Logout initiated: localStorage user cleared.");
  localStorage.removeItem("user");
  localStorage.removeItem("customerOrders"); // Also clear customer orders for clean state
};
// --- UTILITY DATA ---

// Placeholder URL generator for product images
const getPlaceholderUrl = (text) => 
    `https://placehold.co/250x180/4a90e2/ffffff?text=${text.replace(/\s/g, '+')}`;

// Updated Sample Products
const SAMPLE_PRODUCTS = [
  { id: 1, name: "Organic Wheat", price: 25, image: getPlaceholderUrl("Organic+Wheat"), description: "High-quality, organic durum wheat, perfect for baking." },
  { id: 2, name: "Fresh Rice", price: 30, image: getPlaceholderUrl("Fresh+Rice"), description: "Premium long-grain white rice, ready for cooking." },
  { id: 3, name: "Golden Corn", price: 15, image: getPlaceholderUrl("Golden+Corn"), description: "Sweet, non-GMO golden corn kernels, excellent yield." },
  { id: 4, name: "Strawberries", price: 120, image: getPlaceholderUrl("Strawberries"), description: "Fresh, juicy strawberries packed with vitamins." },
  { id: 5, name: "Bananas", price: 40, image: getPlaceholderUrl("Bananas"), description: "Sweet and ripe bananas, perfect for snacking." },
  { id: 6, name: "Pineapple", price: 80, image: getPlaceholderUrl("Pineapple"), description: "Tropical pineapple, sweet and tangy." },
  { id: 7, name: "Tomatoes", price: 35, image: getPlaceholderUrl("Tomatoes"), description: "Fresh red tomatoes, great for salads and cooking." },
  { id: 8, name: "Cucumbers", price: 20, image: getPlaceholderUrl("Cucumbers"), description: "Crisp and fresh cucumbers for salads." },
  { id: 9, name: "Carrots", price: 25, image: getPlaceholderUrl("Carrots"), description: "Organic carrots, rich in vitamin A." },
  { id: 10, name: "Apples", price: 90, image: getPlaceholderUrl("Apples"), description: "Crisp and juicy apples, freshly harvested." },
  { id: 11, name: "Mangoes", price: 150, image: getPlaceholderUrl("Mangoes"), description: "Sweet, ripe mangoes perfect for summer." },
  { id: 12, name: "Grapes", price: 110, image: getPlaceholderUrl("Grapes"), description: "Fresh seedless grapes, delicious and healthy." },
  { id: 13, name: "Lemons", price: 30, image: getPlaceholderUrl("Lemons"), description: "Fresh lemons, perfect for drinks and cooking." },
  { id: 14, name: "Potatoes", price: 25, image: getPlaceholderUrl("Potatoes"), description: "Organic potatoes, ideal for everyday cooking." },
  { id: 15, name: "Onions", price: 20, image: getPlaceholderUrl("Onions"), description: "Fresh onions, perfect for cooking." },
];

// Updated Crop Options
const CROP_OPTIONS = [
  { value: "wheat", label: "Wheat" },
  { value: "rice", label: "Rice" },
  { value: "corn", label: "Corn" },
  { value: "strawberry", label: "Strawberry" },
  { value: "banana", label: "Banana" },
  { value: "pineapple", label: "Pineapple" },
  { value: "tomato", label: "Tomato" },
  { value: "cucumber", label: "Cucumber" },
  { value: "carrot", label: "Carrot" },
  { value: "apple", label: "Apple" },
  { value: "mango", label: "Mango" },
  { value: "grape", label: "Grape" },
  { value: "lemon", label: "Lemon" },
  { value: "potato", label: "Potato" },
  { value: "onion", label: "Onion" },
];


// --- CUSTOM NOTIFICATION COMPONENT (Replaces alert) ---
const Notification = ({ message, type, onClose }) => {
    if (!message) return null;

    const baseClass = "notification";
    const typeClass = type === 'success' ? 'notification-success' : 'notification-error';

    return (
        <div className={`${baseClass} ${typeClass}`}>
            <span>{message}</span>
            <button onClick={onClose} className="notification-close">×</button>
        </div>
    );
};


// --- MAIN COMPONENT ---
const CustomerDashboard = () => {
  const navigate = useNavigate();

  // --- STATES ---
  const [user, setUser] = useState({});
  const [activeTab, setActiveTab] = useState("products");
  const [cartItems, setCartItems] = useState([]);
  const [orders, setOrders] = useState([]);

  // AI Analysis
  const [selectedCrop, setSelectedCrop] = useState("wheat");
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null); 
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  
  // Notification
  const [notification, setNotification] = useState({ message: '', type: '' });


  // --- LIFECYCLE: Load User and Orders ---
  useEffect(() => {
    // Mock user load
    const storedUser = JSON.parse(localStorage.getItem("user")) || { name: "Sandeep", role: "Customer" };
    setUser(storedUser);
    
    // Mock order load
    const storedOrders = JSON.parse(localStorage.getItem("customerOrders") || "[]");
    setOrders(storedOrders);

  }, []);

  // --- HANDLERS ---
  const handleLogout = useCallback(() => {
    logoutUser();
    navigate("/login");
  }, [navigate]);
  
  const closeNotification = () => setNotification({ message: '', type: '' });

  const handleAddToCart = (product) => {
    closeNotification();
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setNotification({ message: `${product.name} added to cart!`, type: 'success' });
  };

  const handleRemoveFromCart = (productId) => {
    const itemToRemove = cartItems.find(item => item.id === productId);
    setCartItems(cartItems.filter(item => item.id !== productId));
    setNotification({ message: `${itemToRemove.name} removed from cart.`, type: 'error' });
  };

  const calculateTotal = () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    closeNotification();
    if (cartItems.length === 0) {
      setNotification({ message: "Your cart is empty. Add products to proceed.", type: 'error' });
      return;
    }
    
    const newOrder = { 
        id: `ORD-${Date.now() % 10000}`, 
        date: new Date().toLocaleDateString(),
        total: calculateTotal(),
        status: "Pending", 
        items: cartItems.map(item => ({ name: item.name, quantity: item.quantity, price: item.price }))
    };
    
    // Save to local storage for persistence
    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    localStorage.setItem("customerOrders", JSON.stringify(updatedOrders));

    setCartItems([]);
    setNotification({ message: "Order placed successfully! The retailer has been notified.", type: 'success' });
    setActiveTab("orders");
  };

  const handleImageUpload = async () => {
    closeNotification();
    if (!selectedFile || !selectedCrop) {
      setNotification({ message: "Please select both an image and a crop type!", type: 'error' });
      return;
    }
    
    setLoadingAnalysis(true);
    setAnalysisResult(null);

    try {
      const base64Image = await fileToBase64(selectedFile);
      const result = await analyzeImageWithGemini(selectedCrop, base64Image);
      setAnalysisResult(result);
      setNotification({ message: "AI analysis complete.", type: 'success' });

    } catch (error) {
      console.error("Image analysis failed:", error);
      setNotification({ message: "AI analysis failed. Try again later.", type: 'error' });
      setAnalysisResult({ 
        productName: selectedCrop, 
        freshnessStatus: "N/A", 
        overallQuality: "ERROR", 
        confidence: 0, 
        justification: error.message 
      });
    } finally {
      setLoadingAnalysis(false);
    }
  };

  // --- RENDER ---
  return (
    <div className="dashboard-container">
      <Notification {...notification} onClose={closeNotification} />

      <header className="dashboard-header">
        <h1>Customer Dashboard</h1>
        <div className="header-info">
            <p className="welcome-text">Welcome, <span className="user-name">{user.name || "Customer"}</span></p>
            <button onClick={handleLogout} className="btn-logout">
                <svg xmlns="http://www.w3.org/2000/svg" className="icon-logout" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                Logout
            </button>
        </div>
      </header>
      
      {/* Tabs */}
      <div className="tabs-container">
        <button 
            className={`tab-btn ${activeTab === "products" ? "active" : ""}`} 
            onClick={() => setActiveTab("products")}
        >
            Products
        </button>
        <button 
            className={`tab-btn ${activeTab === "orders" ? "active" : ""}`} 
            onClick={() => setActiveTab("orders")}
        >
            Orders
        </button>
        <button 
            className={`tab-btn ${activeTab === "cart" ? "active" : ""}`} 
            onClick={() => setActiveTab("cart")}
        >
            Cart ({cartItems.length})
        </button>
        <button 
            className={`tab-btn ${activeTab === "ai" ? "active" : ""}`} 
            onClick={() => setActiveTab("ai")}
        >
            AI Quality Check
        </button>
      </div>

      <main className="content-area">
          {/* Products Tab */}
          {activeTab === "products" && (
            <div className="product-grid">
              <h2>Browse Fresh Produce</h2>
              {SAMPLE_PRODUCTS.map((p) => (
                <div className="product-card" key={p.id}>
                  <img src={p.image} alt={p.name} onError={(e) => {e.target.onerror = null; e.target.src=getPlaceholderUrl(p.name)}}/>
                  <div className="card-content">
                      <h3>{p.name}</h3>
                      <p className="description">{p.description}</p>
                      <div className="price-and-action">
                          <p className="price">₹{p.price}<span className="unit">/kg</span></p>
                          <button onClick={() => handleAddToCart(p)} className="btn-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" className="icon-cart" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 12.08a2 2 0 0 0 2 1.92h9.24a2 2 0 0 0 2-1.92L23 6H6"></path></svg>
                            Add to Cart
                          </button>
                      </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="orders-section">
              <h2>Your Order History</h2>
              {orders.length === 0 ? (
                <p className="empty-state">You haven't placed any orders yet. Start shopping!</p>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="order-card">
                    <div className="order-header">
                        <span className="order-id">Order ID: {order.id}</span>
                        <span className={`order-status status-${order.status.toLowerCase()}`}>{order.status}</span>
                    </div>
                    <p className="order-date">Date: {order.date}</p>
                    <ul className="order-items-list">
                      {order.items.map((item, index) => (
                        <li key={index}>
                          {item.name} × {item.quantity} 
                          <span className="item-price-small">₹{(item.price * item.quantity).toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="order-total">Total: <strong>₹{order.total.toFixed(2)}</strong></p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Cart Tab */}
          {activeTab === "cart" && (
            <div className="cart-section">
                <h2>Your Shopping Cart</h2>
              {cartItems.length === 0 ? (
                <p className="empty-state">Your cart is empty.</p>
              ) : (
                <div className="cart-layout">
                    <div className="cart-items-list">
                        {cartItems.map((item) => (
                            <div key={item.id} className="cart-item">
                                <span className="item-details">{item.name} × {item.quantity}</span>
                                <span className="item-total">₹{(item.price * item.quantity).toFixed(2)}</span>
                                <button onClick={() => handleRemoveFromCart(item.id)} className="btn-remove">
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="cart-summary-card">
                        <h3>Order Summary</h3>
                        <div className="summary-row">
                            <span>Subtotal:</span>
                            <strong>₹{calculateTotal().toFixed(2)}</strong>
                        </div>
                        <div className="summary-row total-row">
                            <span>Total:</span>
                            <strong>₹{calculateTotal().toFixed(2)}</strong>
                        </div>
                        <button onClick={handleCheckout} className="btn-checkout">
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
              )}
            </div>
          )}

          {/* AI Quality Check Tab */}
          {activeTab === "ai" && (
            <div className="ai-section">
              <h2>AI Crop Quality Analysis</h2>
              <div className="ai-card">
                  <p className="ai-description">Upload an image of your crop (e.g., wheat, rice) to get an instant quality assessment.</p>
                  
                  <div className="input-group">
                      <label htmlFor="crop-select">Select Crop Type:</label>
                      <select id="crop-select" value={selectedCrop} onChange={(e) => setSelectedCrop(e.target.value)} className="input-select">
                        {CROP_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                  </div>
                  
                  <div className="input-group">
                      <label htmlFor="file-input">Upload Image:</label>
                      <input 
                        id="file-input"
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => setSelectedFile(e.target.files[0])} 
                        className="input-file"
                      />
                  </div>

                  {selectedFile && (
                      <div className="image-preview-container">
                          <img 
                            src={URL.createObjectURL(selectedFile)} 
                            alt="Crop Preview" 
                            className="image-preview"
                          />
                          <p className="file-name">{selectedFile.name}</p>
                      </div>
                  )}

                  <button onClick={handleImageUpload} disabled={loadingAnalysis || !selectedFile} className="btn-predict">
                    {loadingAnalysis ? (
                        <>
                            <span className="spinner"></span> Analyzing...
                        </>
                    ) : (
                        "Upload & Predict Quality"
                    )}
                  </button>

                  {analysisResult && (
                    <div className={`analysis-result-box result-${analysisResult.overallQuality?.toLowerCase() || 'fail'}`}>
                        <h3>{analysisResult.productName || 'Analysis Result'}</h3>
                        <p><strong>Freshness:</strong> <span className={`status-${analysisResult.freshnessStatus?.toLowerCase()}`}>{analysisResult.freshnessStatus || 'N/A'}</span></p>
                        <p><strong>Quality Grade:</strong> <span className="quality-grade">{analysisResult.overallQuality || 'N/A'}</span></p>
                        <p><strong>Confidence:</strong> {((analysisResult.confidence || 0) * 100).toFixed(1)}%</p>
                        <p className="justification">
                            <strong>Justification:</strong> {analysisResult.justification || 'No justification provided.'}
                        </p>
                    </div>
                  )}
              </div>
            </div>
          )}
      </main>
    </div>
  );
};

export default CustomerDashboard;
