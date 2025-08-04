import React, { useState } from 'react';
import { Star, X, ThumbsUp, MessageSquare, Clock, Smile } from 'lucide-react';

interface RatingModalProps {
  onClose: () => void;
  sellerName: string;
  onSubmit: (rating: number, feedback: string, categories: string[]) => void;
}

const RatingModal: React.FC<RatingModalProps> = ({
  onClose,
  sellerName,
  onSubmit
}) => {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [feedback, setFeedback] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const categories = [{
    icon: <Clock className="w-4 h-4" />,
    label: 'Response Time'
  }, {
    icon: <ThumbsUp className="w-4 h-4" />,
    label: 'Product Quality'
  }, {
    icon: <MessageSquare className="w-4 h-4" />,
    label: 'Communication'
  }, {
    icon: <Smile className="w-4 h-4" />,
    label: 'Friendliness'
  }];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(rating, feedback, selectedCategories);
    setSubmitted(true);
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-xl dark:shadow-gray-900/25 transform transition-all animate-fade-in border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ThumbsUp className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Thank You for Your Feedback!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your feedback helps us improve our service.
            </p>
            <button 
              onClick={onClose} 
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-xl dark:shadow-gray-900/25 transform transition-all animate-fade-in border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {`Rate Your Experience With ${sellerName}`}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {`How was your experience with ${sellerName}?`}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex justify-center space-x-2 mb-6">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => setRating(star)}
              className="transform transition-transform hover:scale-110"
            >
              <Star 
                className={`w-8 h-8 ${
                  star <= (hoveredRating || rating) 
                    ? 'fill-yellow-400 text-yellow-400 dark:fill-yellow-500 dark:text-yellow-500' 
                    : 'text-gray-300 dark:text-gray-600'
                } transition-colors`} 
              />
            </button>
          ))}
        </div>

        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            What went well?
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {categories.map(({ icon, label }) => (
              <button
                key={label}
                onClick={() => toggleCategory(label)}
                className={`flex items-center space-x-2 p-2 rounded-lg border transition-colors ${
                  selectedCategories.includes(label)
                    ? 'border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                    : 'border-gray-200 dark:border-gray-600 hover:border-blue-600 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/50 text-gray-700 dark:text-gray-300'
                }`}
              >
                {icon}
                <span className="text-sm">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label 
            htmlFor="feedback" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Additional Comments (Optional)
          </label>
          <textarea
            id="feedback"
            rows={3}
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            placeholder="Tell us more about your experience..."
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-opacity-50 transition-shadow"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={rating === 0}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              rating === 0
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 dark:bg-blue-600 text-white hover:bg-blue-700 dark:hover:bg-blue-700 shadow-md hover:shadow-lg dark:hover:shadow-gray-900/25'
            }`}
          >
            Submit Feedback
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;