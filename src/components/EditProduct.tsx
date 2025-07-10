import React, { useState, useEffect } from 'react';
import { useUserStore } from '../store/userStore';
import api, { imageApi } from '../utils/apiService';
import productService from '../services/productService';
import Spinner from '../components/Spinner';
import { ChevronLeft, ChevronRight, Upload, X, Check, Camera, MapPin, DollarSign, Tag, FileText, Star, Save } from 'lucide-react';

interface Image {
  id: string;
  url: string;
}

interface ItemFormData {
  title: string;
  description: string;
  price: string;
  category: string;
  condition: string;
  school: string;
  images: Image[];
}

interface ProductData {
  id: string;
  title: string;
  description: string;
  price: string;
  category: string;
  condition: string;
  school: string;
  images: Image[];
}

interface ModernItemEditFormProps {
  productData: ProductData;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ModernItemEditForm: React.FC<ModernItemEditFormProps> = ({ 
  productData, 
  onSuccess, 
  onCancel 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const user = useUserStore.getState().user;
  const [formData, setFormData] = useState<ItemFormData>({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: 'new',
    school: user?.campus ?? 'UNN',
    images: []
  });
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize form data with productData
  useEffect(() => {
    if (productData) {
      setFormData({
        title: productData.title || '',
        description: productData.description || '',
        price: productData.price || '',
        category: productData.category || '',
        condition: productData.condition || 'new',
        school: productData.school || user?.campus || 'UNN',
        images: productData.images || []
      });
    }
  }, [productData, user?.campus]);

  // Track changes for auto-save
  useEffect(() => {
    if (productData) {
      const hasChanged = 
        formData.title !== productData.title ||
        formData.description !== productData.description ||
        formData.price !== productData.price ||
        formData.category !== productData.category ||
        formData.condition !== productData.condition ||
        formData.school !== productData.school ||
        JSON.stringify(formData.images) !== JSON.stringify(productData.images);
      
      setHasChanges(hasChanged);
    }
  }, [formData, productData]);

  // Auto-save draft to localStorage
  useEffect(() => {
    if (hasChanges && productData) {
      localStorage.setItem(`itemEditDraft_${productData.id}`, JSON.stringify(formData));
    }
  }, [formData, hasChanges, productData]);

  // Load draft from localStorage on mount
  useEffect(() => {
    if (productData) {
      const savedData = localStorage.getItem(`itemEditDraft_${productData.id}`);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setFormData(parsed);
        } catch (e) {
          console.error('Failed to parse saved draft:', e);
        }
      }
    }
  }, [productData]);

  const steps = [
    { id: 1, title: 'Photos', icon: Camera },
    { id: 2, title: 'Details', icon: FileText },
    { id: 3, title: 'Pricing', icon: DollarSign },
    { id: 4, title: 'Review', icon: Check }
  ];

  const categories = [
    'Electronics', 'Books', 'Clothing', 'Sports', 'Home & Garden', 
    'Beauty', 'Automotive', 'Toys', 'Music', 'Other'
  ];

  interface HandleInputChangeParams {
    field: keyof ItemFormData;
    value: string | Image[];
  }

  interface ValidationErrors {
    [key: string]: string | undefined;
    images?: string;
    title?: string;
    description?: string;
    category?: string;
    price?: string;
  }

  const handleInputChange = (field: keyof ItemFormData, value: string | Image[]): void => {
    setFormData((prev: ItemFormData) => ({ ...prev, [field]: value }));
    if (errors[field as keyof ValidationErrors]) {
      setErrors((prev: ValidationErrors) => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    
    setIsUploading(true);
    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      
      const response = await imageApi.post('/api/seller/upload', uploadData);
      
      if (response.data.success) {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, { id: response.data.id, url: response.data.url }]
        }));
      } else {
        alert('Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateStep = (step: number) => {
    const newErrors: ValidationErrors = {};
    
    switch (step) {
      case 1:
        if (formData.images.length === 0) {
          newErrors.images = 'At least one photo is required';
        }
        break;
      case 2:
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.category) newErrors.category = 'Category is required';
        break;
      case 3:
        if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
          newErrors.price = 'Valid price is required';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    
    try {
      setLoading(true);
      const updateData = {
        ...formData,
        id: productData.id
      };
      
      const response = await productService.updateProduct(productData.id, updateData);
      
      if (response.data.success) {
        // Clear draft from localStorage
        localStorage.removeItem(`itemEditDraft_${productData.id}`);
        alert('Item updated successfully!');
        onSuccess?.();
      } else {
        alert('Failed to update item');
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update item');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      const confirmCancel = window.confirm('You have unsaved changes. Are you sure you want to cancel?');
      if (!confirmCancel) return;
    }
    
    // Clear draft
    localStorage.removeItem(`itemEditDraft_${productData.id}`);
    onCancel?.();
  };

  const ToggleButton = ({ options, selected, onChange, label }: {options: {value: string, label: string}[], selected: string, onChange: (option: string) => void, label: string}) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="flex rounded-lg border border-gray-200 p-1 bg-gray-50">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              selected === option.value
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );

  const CategoryGrid: React.FC<{categories: string[], selected: string, onChange: (category: string) => void}> = ({ categories, selected, onChange }) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => onChange(category)}
          className={`p-3 rounded-lg border-2 transition-all ${
            selected === category
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="text-sm font-medium">{category}</div>
        </button>
      ))}
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Camera className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mt-2">Edit Photos</h3>
              <p className="text-sm text-gray-500">Update your item photos</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {formData.images.map((image, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img src={image.url} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow-md"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              
              {formData.images.length < 5 && (
                <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
                  <Upload className="h-8 w-8 text-gray-400" />
                  <span className="text-sm text-gray-500 mt-2">Add Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              )}
            </div>
            
            {errors.images && <p className="text-red-500 text-sm">{errors.images}</p>}
            {isUploading && <p className="text-blue-500 text-sm">Uploading...</p>}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mt-2">Edit Details</h3>
              <p className="text-sm text-gray-500">Update your item information</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="What are you selling?"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your item in detail..."
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Category</label>
                <CategoryGrid
                  categories={categories}
                  selected={formData.category}
                  onChange={(category) => handleInputChange('category', category)}
                />
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
              </div>
              
              <ToggleButton
                label="Condition"
                options={[
                  { value: 'new', label: 'New' },
                  { value: 'used', label: 'Used' }
                ]}
                selected={formData.condition}
                onChange={(condition) => handleInputChange('condition', condition)}
              />
              
              <ToggleButton
                label="School"
                options={[
                  { value: 'UNN', label: 'UNN' },
                  { value: 'UNEC', label: 'UNEC' }
                ]}
                selected={formData.school}
                onChange={(school) => handleInputChange('school', school)}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mt-2">Update Price</h3>
              <p className="text-sm text-gray-500">Adjust your item price</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price (₦)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">₦</span>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    className="w-full pl-8 pr-4 py-4 text-lg rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">💡 Pricing Tips</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Research similar items to price competitively</li>
                  <li>• Consider the condition and age of your item</li>
                  <li>• Leave room for negotiation</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Check className="mx-auto h-12 w-12 text-green-500" />
              <h3 className="text-lg font-medium text-gray-900 mt-2">Review Changes</h3>
              <p className="text-sm text-gray-500">Confirm your updates</p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                {formData.images.slice(0, 2).map((image, index) => (
                  <img
                    key={index}
                    src={image.url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ))}
              </div>
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900">{formData.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{formData.description}</p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {formData.category}
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    {formData.condition}
                  </span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                    {formData.school}
                  </span>
                </div>
                
                <div className="text-lg font-semibold text-gray-900">₦{formData.price}</div>
              </div>
            </div>
            
            {hasChanges && (
              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <span className="font-medium">Changes detected:</span> Your updates will be saved when you continue.
                </p>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10">
        <div className="flex items-center justify-between">
          <button
            onClick={currentStep === 1 ? handleCancel : prevStep}
            className="p-2 rounded-full text-gray-600 hover:bg-gray-100"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          
          <h1 className="text-lg font-semibold">Edit Item</h1>
          
          <button
            onClick={handleCancel}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      currentStep >= step.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs mt-1 text-gray-600">{step.title}</span>
                </div>
              );
            })}
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pb-24">
        {renderStep()}
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-md mx-auto">
          {currentStep < 4 ? (
            <button
              onClick={nextStep}
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center"
            >
              Continue
              <ChevronRight className="h-5 w-5 ml-1" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading || !hasChanges}
              className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center
                ${loading || !hasChanges 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
                }
              `}
              aria-busy={loading}
            >
              {loading ? (
                <>
                  <Spinner className="h-5 w-5 mr-2" />
                  <span className="text-white">Updating...</span>
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  <span>{hasChanges ? 'Save Changes' : 'No Changes'}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModernItemEditForm;