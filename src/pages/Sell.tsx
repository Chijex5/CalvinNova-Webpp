import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/Input';
import { PlusIcon, XIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
const Sell = () => {
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const {
    addProduct
  } = useProducts();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: '',
    school: ''
  });
  const [images, setImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  if (!user) {
    return <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Please Login</h2>
        <p className="mb-6">You need to be logged in to sell items.</p>
      </div>;
  }
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const {
      name,
      value
    } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error when field is modified
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  const handleAddImage = () => {
    // For demo purposes, add a placeholder image
    const placeholderImages = ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80', 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1160&q=80'];
    if (images.length < 3) {
      setImages([...images, placeholderImages[images.length]]);
    }
  };
  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.price.trim()) newErrors.price = 'Price is required';else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.condition) newErrors.condition = 'Condition is required';
    if (!formData.school) newErrors.school = 'School is required';
    if (images.length === 0) newErrors.images = 'At least one image is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    // Add new product
    addProduct({
      title: formData.title,
      description: formData.description,
      price: Number(formData.price),
      category: formData.category,
      condition: formData.condition,
      images: images,
      school: formData.school,
      sellerId: user.id,
      createdAt: new Date().toISOString()
    });
    // Navigate to marketplace
    navigate('/marketplace');
  };
  return <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Sell an Item</h1>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Item Details</h2>
            <Input id="title" label="Title" placeholder="What are you selling?" value={formData.title} onChange={handleChange} required error={errors.title} name="title" />
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea id="description" name="description" rows={4} placeholder="Describe your item (condition, features, etc.)" value={formData.description} onChange={handleChange} className={`w-full px-3 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`} required />
              {errors.description && <p className="mt-1 text-sm text-red-600">
                  {errors.description}
                </p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input id="price" label="Price ($)" type="number" placeholder="0.00" value={formData.price} onChange={handleChange} required error={errors.price} name="price" />
              <div className="mb-4">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select id="category" name="category" value={formData.category} onChange={handleChange} className={`w-full px-3 py-2 border ${errors.category ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`} required>
                  <option value="">Select a category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Books">Books & Textbooks</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Appliances">Appliances</option>
                  <option value="Sports">Sports & Outdoors</option>
                  <option value="Other">Other</option>
                </select>
                {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
                  Condition <span className="text-red-500">*</span>
                </label>
                <select id="condition" name="condition" value={formData.condition} onChange={handleChange} className={`w-full px-3 py-2 border ${errors.condition ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`} required>
                  <option value="">Select condition</option>
                  <option value="New">New</option>
                  <option value="Like New">Like New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
                {errors.condition && <p className="mt-1 text-sm text-red-600">
                    {errors.condition}
                  </p>}
              </div>
              <div className="mb-4">
                <label htmlFor="school" className="block text-sm font-medium text-gray-700 mb-1">
                  School <span className="text-red-500">*</span>
                </label>
                <select id="school" name="school" value={formData.school} onChange={handleChange} className={`w-full px-3 py-2 border ${errors.school ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`} required>
                  <option value="">Select your school</option>
                  <option value="University of California, Berkeley">
                    University of California, Berkeley
                  </option>
                  <option value="Stanford University">
                    Stanford University
                  </option>
                  <option value="UCLA">UCLA</option>
                  <option value="MIT">MIT</option>
                  <option value="Harvard University">Harvard University</option>
                  <option value="University of Michigan">
                    University of Michigan
                  </option>
                </select>
                {errors.school && <p className="mt-1 text-sm text-red-600">{errors.school}</p>}
              </div>
            </div>
          </div>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Photos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {images.map((image, index) => <div key={index} className="relative border border-gray-200 rounded-md overflow-hidden h-40">
                  <img src={image} alt={`Item photo ${index + 1}`} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => handleRemoveImage(index)} className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100" aria-label="Remove image">
                    <XIcon size={16} className="text-gray-700" />
                  </button>
                </div>)}
              {images.length < 3 && <button type="button" onClick={handleAddImage} className="border-2 border-dashed border-gray-300 rounded-md h-40 flex flex-col items-center justify-center hover:bg-gray-50">
                  <PlusIcon size={24} className="text-gray-400" />
                  <span className="mt-2 text-sm text-gray-500">Add Photo</span>
                </button>}
            </div>
            {errors.images && <p className="mt-1 text-sm text-red-600">{errors.images}</p>}
            <p className="mt-2 text-sm text-gray-500">
              Add up to 3 photos of your item
            </p>
          </div>
          <div className="border-t border-gray-200 pt-6">
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <Button variant="secondary" type="button" onClick={() => navigate('/marketplace')}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                List Item for Sale
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>;
};
export default Sell;