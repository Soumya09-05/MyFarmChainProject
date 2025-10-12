import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProductsPage from "./pages/farmer-dashboard/ProductsPage";
import AddProductPage from "./pages/farmer-dashboard/AddProductPage";
import DistributorDashboard from "./pages/DistributorDashboard";
import RetailerDashboard from "./pages/RetailerDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ProductDetail from "./pages/ProductDetail";
import Unauthorized from "./pages/Unauthorized";
import EditProductPage from "./pages/farmer-dashboard/EditProductPage";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "null");
    setUser(userData);

    const storedProducts = JSON.parse(localStorage.getItem("products") || "[]");
    setProducts(storedProducts);
  }, []);

  const addProduct = (newProduct) => {
    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    localStorage.setItem("products", JSON.stringify(updatedProducts));
  };

  const deleteProduct = (productId) => {
    const updatedProducts = products.filter(
      (product) => product.id !== productId
    );
    setProducts(updatedProducts);
    localStorage.setItem("products", JSON.stringify(updatedProducts));
  };

  return (
    <Router>
      <Routes>
        {/* Default Route → Redirect to Login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Public Routes */}
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register setUser={setUser} />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route
          path="/edit-product/:id"
          element={
            <EditProductPage products={products} setProducts={setProducts} />
          }
        />

        {/* Protected Routes */}
        <Route
          path="/farmer-dashboard"
          element={
            <PrivateRoute allowedRoles={["farmer"]}>
              <ProductsPage
                products={products}
                onDeleteProduct={deleteProduct}
              />
            </PrivateRoute>
          }
        />
        <Route
          path="/add-product"
          element={
            <PrivateRoute allowedRoles={["farmer"]}>
              <AddProductPage addProduct={addProduct} />
            </PrivateRoute>
          }
        />
        <Route
          path="/distributor-dashboard"
          element={
            <PrivateRoute allowedRoles={["distributor"]}>
              <DistributorDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/retailer-dashboard"
          element={
            <PrivateRoute allowedRoles={["retailer"]}>
              <RetailerDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/customer-dashboard"
          element={
            <PrivateRoute allowedRoles={["customer"]}>
              <CustomerDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin-dashboard"
          element={
            <PrivateRoute user={user} allowedRoles={["admin"]}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
