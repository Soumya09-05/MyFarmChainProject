 import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../styles/editProduct.css";

function EditProductPage({ products, setProducts }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const productToEdit = products.find((p) => p.id.toString() === id);

  const [form, setForm] = useState({
    cropType: "",
    soilType: "",
    pesticides: "",
    harvestDate: "",
    imageFile: null,
    imageUrl: "",
  });

  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    if (productToEdit) {
      setForm({
        cropType: productToEdit.cropType,
        soilType: productToEdit.soilType,
        pesticides: productToEdit.pesticides,
        harvestDate: productToEdit.harvestDate,
        imageFile: null,
        imageUrl: productToEdit.imageUrl,
      });
      setImagePreview(productToEdit.imageUrl);
    }
  }, [productToEdit]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files.length > 0) {
      const file = files[0];
      setForm({ ...form, imageFile: file });
      setImagePreview(URL.createObjectURL(file));
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("cropType", form.cropType);
    formData.append("soilType", form.soilType);
    formData.append("pesticides", form.pesticides);
    formData.append("harvestDate", form.harvestDate);
    if (form.imageFile) formData.append("image", form.imageFile);

    try {
      const res = await fetch(`http://localhost:8082/api/products/edit/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        const updatedProduct = await res.json();
        setProducts((prev) =>
          prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
        );
        alert("Product updated successfully!");
        navigate("/products");
      } else {
        alert("Error updating product");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Error updating product");
    }
  };

  if (!productToEdit) return <div className="add-container">Product not found.</div>;

  return (
    <div className="add-container">
      <h1 className="page-title">Edit Product</h1>
      <form onSubmit={handleSubmit} className="add-form">
        <div>
          <label>Crop Type:</label>
          <input type="text" name="cropType" value={form.cropType} onChange={handleChange} />
        </div>
        <div>
          <label>Soil Type:</label>
          <input type="text" name="soilType" value={form.soilType} onChange={handleChange} />
        </div>
        <div>
          <label>Pesticides:</label>
          <input type="text" name="pesticides" value={form.pesticides} onChange={handleChange} />
        </div>
        <div>
          <label>Harvest Date:</label>
          <input type="date" name="harvestDate" value={form.harvestDate} onChange={handleChange} />
        </div>
        <div>
          <label>Upload Image:</label>
          <input type="file" name="image" accept="image/*" onChange={handleChange} />
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Preview" width="100" />
            </div>
          )}
        </div>
        <div className="form-actions">
          <button type="submit" className="submit-btn">Save Changes</button>
          <button type="button" className="back-btn" onClick={(handleBack) => navigate("/products")}>Back</button>
        </div>
      </form>
    </div>
  );
}

export default EditProductPage;
