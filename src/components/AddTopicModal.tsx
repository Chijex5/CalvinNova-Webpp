import React, { useState } from 'react';
import { BookOpen, FileText, Calendar, Tag } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';

interface AddTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (topicData: TopicFormData) => Promise<void>;
}

export interface TopicFormData {
  title: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  resources: string;
  tags: string[];
}

const AddTopicModal: React.FC<AddTopicModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TopicFormData>({
    title: '',
    description: '',
    category: '',
    startDate: '',
    endDate: '',
    resources: '',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof TopicFormData, string>>>({});

  const handleInputChange = (field: keyof TopicFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [field]: e.target.value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({ 
      ...formData, 
      tags: formData.tags.filter(tag => tag !== tagToRemove) 
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof TopicFormData, string>> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (formData.endDate && formData.startDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      // Reset form on success
      setFormData({
        title: '',
        description: '',
        category: '',
        startDate: '',
        endDate: '',
        resources: '',
        tags: []
      });
      setTagInput('');
      onClose();
    } catch (error) {
      console.error('Error submitting topic:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'Lecture',
    'Lab',
    'Assignment',
    'Project',
    'Exam Prep',
    'Reading',
    'Other'
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Topic" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Topic Information Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 mb-3">
            <BookOpen className="w-5 h-5" />
            <h4 className="font-semibold text-sm">Topic Information</h4>
          </div>

          <Input
            id="topic-title"
            label="Topic Title"
            placeholder="Enter topic title"
            value={formData.title}
            onChange={handleInputChange('title')}
            required
            error={errors.title}
          />

          <div>
            <label htmlFor="topic-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="topic-description"
              placeholder="Describe what this topic covers"
              value={formData.description}
              onChange={handleInputChange('description')}
              rows={3}
              className={`w-full px-3 py-2 border ${
                errors.description 
                  ? 'border-red-500 dark:border-red-400' 
                  : 'border-gray-300 dark:border-gray-600'
              } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
            )}
          </div>

          <div>
            <label htmlFor="topic-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="topic-category"
              value={formData.category}
              onChange={handleInputChange('category')}
              className={`w-full px-3 py-2 border ${
                errors.category 
                  ? 'border-red-500 dark:border-red-400' 
                  : 'border-gray-300 dark:border-gray-600'
              } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.category}</p>
            )}
          </div>
        </div>

        {/* Timeline Section */}
        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 mb-3">
            <Calendar className="w-5 h-5" />
            <h4 className="font-semibold text-sm">Timeline</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="topic-start-date"
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={handleInputChange('startDate')}
              required
              error={errors.startDate}
            />

            <Input
              id="topic-end-date"
              label="End Date"
              type="date"
              value={formData.endDate}
              onChange={handleInputChange('endDate')}
              error={errors.endDate}
            />
          </div>
        </div>

        {/* Resources Section */}
        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 mb-3">
            <FileText className="w-5 h-5" />
            <h4 className="font-semibold text-sm">Resources</h4>
          </div>

          <div>
            <label htmlFor="topic-resources" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Resources/Links
            </label>
            <textarea
              id="topic-resources"
              placeholder="Add links to resources (one per line)"
              value={formData.resources}
              onChange={handleInputChange('resources')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Separate multiple URLs with a new line
            </p>
          </div>
        </div>

        {/* Tags Section */}
        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 mb-3">
            <Tag className="w-5 h-5" />
            <h4 className="font-semibold text-sm">Tags</h4>
          </div>

          <div>
            <label htmlFor="topic-tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Add Tags
            </label>
            <div className="flex space-x-2">
              <input
                id="topic-tags"
                type="text"
                placeholder="Add a tag and press Add"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors"
              >
                Add
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 transition-all duration-200 hover:bg-indigo-200 dark:hover:bg-indigo-900"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 hover:text-indigo-600 dark:hover:text-indigo-200"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            loadingText="Creating..."
          >
            Create Topic
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddTopicModal;
