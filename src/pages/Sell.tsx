import React, { useState, useEffect } from 'react';
import { useUserStore } from '../store/userStore';
import api, { imageApi } from '../utils/apiService';
import { toast } from 'sonner';
import Spinner from '../components/Spinner';
import { ChevronLeft, ChevronRight, Upload, X, Check, Camera, MapPin, DollarSign, Tag, FileText, Star, Info, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Image {
  id: string;
  url: string;
}

interface ItemFormData {
  title: string;
  description: string;
  price: number;
  sellerAmount?: number; // Optional for seller's price
  category: string;
  condition: string;
  school: string;
  images: Image[];
}

interface ImageUploadState {
  file: File;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  url?: string;
  id?: string;
  error?: string;
  uploadId?: number;
}

const ModernItemListingForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const user = useUserStore.getState().user;
  const [formData, setFormData] = useState<ItemFormData>({
    title: '',
    description: '',
    price: 0,
    category: '',
    condition: 'new',
    sellerAmount: 0,
    school: user?.campus ?? 'UNN',
    images: []
  });
  const [uploadingImages, setUploadingImages] = useState<ImageUploadState[]>([]);
  const [errors, setErrors] = useState<ValidationErrors>({});
  

  // Load from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('itemListingDraft');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(parsed);
      } catch (e) {
        console.error('Failed to parse saved data:', e);
      }
    }
  }, []);

  // Auto-save to localStorage whenever formData changes
  useEffect(() => {
    if (formData.images.length > 0 || Object.values(formData).some(val => val !== '' && val !== 'new' && val !== 'UNN' && val.length !== 0)) {
      localStorage.setItem('itemListingDraft', JSON.stringify(formData));
    }
  }, [formData]);

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

  const handleMultipleImageUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;
    
    const maxImages = 4;
    const currentImageCount = formData.images.length;
    const availableSlots = maxImages - currentImageCount;
    
    if (availableSlots <= 0) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }
    
    const filesToUpload = Array.from(files).slice(0, availableSlots);
    
    // Initialize upload states with unique IDs
    const initialUploadStates: ImageUploadState[] = filesToUpload.map((file, index) => ({
      file,
      status: 'uploading',
      progress: 0,
      uploadId: Date.now() + index
    }));
    
    setUploadingImages(prev => [...prev, ...initialUploadStates]);
    
    // Process uploads concurrently with real progress tracking
    const uploadPromises = filesToUpload.map(async (file, index) => {
      const uploadId = initialUploadStates[index].uploadId;
      
      try {
        const uploadData = new FormData();
        uploadData.append('file', file);
        
        const response = await imageApi.post('/api/seller/upload', uploadData, {
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadingImages(prev => 
                prev.map((state) => 
                  state.uploadId === uploadId 
                    ? { ...state, progress: percentCompleted }
                    : state
                )
              );
            }
          }
        });
        
        if (response.data.success) {
          // Update upload state to success
          setUploadingImages(prev => 
            prev.map(state => 
              state.uploadId === uploadId 
                ? { ...state, status: 'success', progress: 100, url: response.data.url, id: response.data.id }
                : state
            )
          );
          
          return { success: true, id: response.data.id, url: response.data.url };
        } else {
          throw new Error(response.data.message || 'Upload failed');
        }
      } catch (error) {
        console.error('Upload error:', error);
        
        // Update upload state to error
        setUploadingImages(prev => 
          prev.map(state => 
            state.uploadId === uploadId 
              ? { ...state, status: 'error', progress: 0, error: error.message || 'Upload failed' }
              : state
          )
        );
        
        return { success: false, error: error.message || 'Upload failed' };
      }
    });
    
    // Wait for all uploads to complete
    const uploadResults = await Promise.all(uploadPromises);
    
    // Add successful uploads to formData AFTER all uploads are done
    const successfulUploads = uploadResults
      .filter(result => result.success)
      .map(result => ({ id: result.id!, url: result.url! }));
    
    if (successfulUploads.length > 0) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...successfulUploads]
      }));
    }
    
    // Clean up uploading states after a delay
    setTimeout(() => {
      setUploadingImages(prev => 
        prev.filter(state => !initialUploadStates.some(initial => initial.uploadId === state.uploadId))
      );
    }, 2000);
    
    // Show results
    const successCount = uploadResults.filter(r => r.success).length;
    const errorCount = uploadResults.filter(r => !r.success).length;
    
    if (successCount > 0) {
      toast.success(`${successCount} image${successCount > 1 ? 's' : ''} uploaded successfully`);
    }
    
    if (errorCount > 0) {
      toast.error(`${errorCount} image${errorCount > 1 ? 's' : ''} failed to upload`);
    }
  };


  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const removeUploadingImage = (file: File) => {
    setUploadingImages(prev => prev.filter(state => state.file !== file));
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
      const response = await api.post('/api/seller/create-item', formData);
      if (response.data.success) {
        localStorage.removeItem('itemListingDraft');
        toast.success('Item listed successfully!');
        // Reset form
        setFormData({
          title: '',
          description: '',
          price: 0,
          category: '',
          condition: 'new',
          school: 'UNN',
          images: []
        });
        setCurrentStep(1);
      } else {
        toast.error('Failed to list item');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to list item');
    } finally {
      setLoading(false);
    }
  };

  const calculatePayout = (price: number) => {
    if (isNaN(price) || price <= 0) return 0;
    return price - (price * 0.08);
  };

  // Update sellerAmount when price changes
  const handlePriceChange = (value: string) => {
    const numPrice = Number(value);
    const payout = calculatePayout(numPrice);
    
    setFormData(prev => ({
      ...prev,
      price: numPrice,
      sellerAmount: payout  // Set both at once
    }));
  };

  const ToggleButton = ({ options, selected, onChange, label }: {options: {value: string, label: string}[], selected: string, onChange: (option: string) => void, label: string}) => (
    <div className="space-y-2">
      <label className="text-sm font-medium dark:text-gray-300 text-gray-700">{label}</label>
      <div className="flex rounded-lg border border-gray-200 p-1 dark:bg-gray-900 bg-gray-50">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              selected === option.value
                ? 'bg-blue-500 dark:bg-blue-400 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 dark:hover:text-gray-600 hover:text-gray-800'
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
              ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
          }`}
        >
          <div className="text-sm font-medium">{category}</div>
        </button>
      ))}
    </div>
  );

  const InfoBox = ({ title, children, type = 'info' }: { title: string; children: React.ReactNode; type?: 'info' | 'warning' | 'success' }) => {
    const styles = {
      info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300',
      warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300',
      success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300'
    };
    
    const icons = {
      info: Info,
      warning: AlertCircle,
      success: CheckCircle2
    };
    
    const Icon = icons[type];
    
    return (
      <div className={`p-4 rounded-lg border ${styles[type]}`}>
        <div className="flex items-start space-x-2">
          <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium mb-1">{title}</h4>
            <div className="text-sm">{children}</div>
          </div>
        </div>
      </div>
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Camera className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-2">Add Photos</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Upload high-quality photos of your item</p>
            </div>
            
            <InfoBox title="Photo Tips" type="info">
              <ul className="space-y-1">
                <li>• The more photos, the better (up to 4 images)</li>
                <li>• Use good lighting and clear angles</li>
                <li>• Show any flaws or damage honestly</li>
                <li>• Multiple photos increase buyer confidence</li>
              </ul>
            </InfoBox>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {/* Existing images */}
              {formData.images.map((image, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <img src={image.url} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 dark:bg-red-600 text-white rounded-full p-1 shadow-md hover:bg-red-600 dark:hover:bg-red-700 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              
              {/* Uploading images */}
              {uploadingImages.map((uploadState, index) => (
                <div key={`uploading-${index}`} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {uploadState.status === 'uploading' && (
                      <>
                        <Spinner className="h-6 w-6 text-blue-500 dark:text-blue-400 mb-2 animate-spin" />
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Uploading...</div>
                        <div className="w-3/4 bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                          <div 
                            className="bg-blue-500 dark:bg-blue-400 h-1 rounded-full transition-all duration-300"
                            style={{ width: `${uploadState.progress}%` }}
                          />
                        </div>
                      </>
                    )}
                    {uploadState.status === 'success' && (
                      <>
                        <CheckCircle2 className="h-6 w-6 text-green-500 dark:text-green-400 mb-2" />
                        <div className="text-xs text-green-600 dark:text-green-400">Uploaded!</div>
                      </>
                    )}
                    {uploadState.status === 'error' && (
                      <>
                        <AlertCircle className="h-6 w-6 text-red-500 dark:text-red-400 mb-2" />
                        <div className="text-xs text-red-600 dark:text-red-400 mb-1">Upload failed</div>
                        <button
                          onClick={() => removeUploadingImage(uploadState.file)}
                          className="text-xs text-red-500 dark:text-red-400 underline"
                        >
                          Remove
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Upload button */}
              {(formData.images.length + uploadingImages.filter(s => s.status === 'uploading').length) < 4 && (
                <label className="aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                  <Upload className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                  <span className="text-sm text-gray-500 dark:text-gray-400 mt-2">Add Photos</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">Select multiple</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => e.target.files && handleMultipleImageUpload(e.target.files)}
                    className="hidden"
                    disabled={uploadingImages.some(state => state.status === 'uploading')}
                  />
                </label>
              )}
            </div>
            
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              {formData.images.length} / 4 photos uploaded
              {uploadingImages.length > 0 && (
                <span className="ml-2 text-blue-500 dark:text-blue-400">
                  ({uploadingImages.filter(s => s.status === 'uploading').length} uploading...)
                </span>
              )}
            </div>
            
            {errors.images && <p className="text-red-500 dark:text-red-400 text-sm">{errors.images}</p>}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-2">Item Details</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tell buyers about your item</p>
            </div>
            
            <InfoBox title="✍️ Writing Tips" type="info">
              <ul className="space-y-1">
                <li>• Be specific and detailed in your description</li>
                <li>• Mention brand, model, size, and condition</li>
                <li>• Include any flaws or defects</li>
                <li>• Use keywords buyers might search for</li>
              </ul>
            </InfoBox>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="e.g., iPhone 13 Pro Max 128GB - Excellent condition"
                />
                {errors.title && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.title}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Describe your item in detail... Include brand, model, condition, any accessories, etc."
                />
                {errors.description && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.description}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Category</label>
                <CategoryGrid
                  categories={categories}
                  selected={formData.category}
                  onChange={(category) => handleInputChange('category', category)}
                />
                {errors.category && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.category}</p>}
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
              <DollarSign className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-2">Set Your Price</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">What's your item worth?</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price (₦)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">₦</span>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handlePriceChange(e.target.value)}
                    className="w-full pl-8 pr-4 py-4 text-lg rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="0"
                  />
                </div>
                {errors.price && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.price}</p>}
              </div>
              
              {formData.price && Number(formData.price) > 0 && (
                <InfoBox title="💰 Your Payout Breakdown" type="success">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Item Price:</span>
                      <span>₦{Number(formData.price).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Agent Fee (8%):</span>
                      <span>-₦{(Number(formData.price) * 0.08).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-green-700 dark:text-green-400 border-t dark:border-gray-600 pt-2">
                      <span>You'll receive:</span>
                      <span>₦{calculatePayout(formData.price).toLocaleString()}</span>
                    </div>
                  </div>
                </InfoBox>
              )}
              
              <InfoBox title="💡 Pricing Tips" type="info">
                <ul className="space-y-1">
                  <li>• Research similar items to price competitively</li>
                  <li>• Consider the condition and age of your item</li>
                  <li>• Leave room for negotiation</li>
                  <li>• We charge an 8% agent fee on successful sales</li>
                </ul>
              </InfoBox>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Check className="mx-auto h-12 w-12 text-green-500 dark:text-green-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-2">Review & Publish</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Double-check everything looks good</p>
            </div>
            
            <InfoBox title="🚀 Ready to publish?" type="success">
              Once published, your item will be visible to buyers on your campus. You'll receive notifications when someone shows interest.
            </InfoBox>
            
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
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
                  <h4 className="font-medium text-gray-900 dark:text-white">{formData.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{formData.description}</p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full">
                    {formData.category}
                  </span>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs rounded-full">
                    {formData.condition}
                  </span>
                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs rounded-full">
                    {formData.school}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">₦{formData.price.toLocaleString()}</div>
                  <div className="text-sm text-green-600 dark:text-green-400">
                    You'll earn: ₦{calculatePayout(formData.price).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop wrapper */}
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 min-h-screen lg:max-w-2xl lg:my-8 lg:rounded-lg lg:shadow-xl dark:lg:shadow-2xl lg:min-h-0">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 z-10 lg:rounded-t-lg">
          <div className="flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`p-2 rounded-full ${
                currentStep === 1 
                  ? 'text-gray-400 dark:text-gray-600' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">List Item</h1>
            
            <div className="w-10" />
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
                          ? 'bg-blue-500 dark:bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs mt-1 text-gray-600 dark:text-gray-400">{step.title}</span>
                  </div>
                );
              })}
            </div>
            
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 dark:bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 pb-24 lg:pb-4">
          {renderStep()}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 lg:rounded-b-lg">
          <div className="max-w-md mx-auto lg:max-w-none">
            {currentStep < 4 ? (
              <button
                onClick={nextStep}
                disabled={uploadingImages.some(state => state.status === 'uploading')}
                className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center ${
                  uploadingImages.some(state => state.status === 'uploading')
                    ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed text-white'
                    : 'bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700'
                }`}
              >
                {uploadingImages.some(state => state.status === 'uploading') ? (
                  <>
                    <Spinner className="h-5 w-5 mr-2" />
                    <span>Uploading images...</span>
                  </>
                ) : (
                  <>
                    Continue
                    <ChevronRight className="h-5 w-5 ml-1" />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center
                  ${loading 
                    ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' 
                    : 'bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-700 text-white'
                  }
                `}
                aria-busy={loading}
              >
                {loading ? (
                  <>
                    <Spinner className="h-5 w-5 mr-2 animate-spin" />
                    <span className="text-white">Publishing...</span>
                  </>
                ) : (
                  <>
                    <Star className="h-5 w-5 mr-2" />
                    <span>Publish Item</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernItemListingForm;