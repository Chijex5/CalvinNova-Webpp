import React, { useState } from 'react';
import { BookOpen, Calendar, Target, CheckCircle2, ChevronRight, ChevronLeft, Clock, ListChecks } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';

interface AddStudyPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (studyPlanData: StudyPlanFormData) => Promise<void>;
}

export interface StudyPlanFormData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  goals: string[];
  schedule: {
    day: string;
    startTime: string;
    endTime: string;
    topic: string;
  }[];
  milestones: {
    title: string;
    dueDate: string;
    description: string;
  }[];
}

const AddStudyPlanModal: React.FC<AddStudyPlanModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<StudyPlanFormData>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    goals: [],
    schedule: [],
    milestones: []
  });
  const [goalInput, setGoalInput] = useState('');
  const [scheduleInput, setScheduleInput] = useState({
    day: '',
    startTime: '',
    endTime: '',
    topic: ''
  });
  const [milestoneInput, setMilestoneInput] = useState({
    title: '',
    dueDate: '',
    description: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalSteps = 4;

  const handleInputChange = (field: keyof StudyPlanFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [field]: e.target.value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleAddGoal = () => {
    if (goalInput.trim() && !formData.goals.includes(goalInput.trim())) {
      setFormData({ ...formData, goals: [...formData.goals, goalInput.trim()] });
      setGoalInput('');
    }
  };

  const handleRemoveGoal = (goalToRemove: string) => {
    setFormData({ 
      ...formData, 
      goals: formData.goals.filter(goal => goal !== goalToRemove) 
    });
  };

  const handleAddSchedule = () => {
    if (scheduleInput.day && scheduleInput.startTime && scheduleInput.endTime && scheduleInput.topic) {
      setFormData({ 
        ...formData, 
        schedule: [...formData.schedule, { ...scheduleInput }] 
      });
      setScheduleInput({
        day: '',
        startTime: '',
        endTime: '',
        topic: ''
      });
    }
  };

  const handleRemoveSchedule = (index: number) => {
    setFormData({ 
      ...formData, 
      schedule: formData.schedule.filter((_, i) => i !== index) 
    });
  };

  const handleAddMilestone = () => {
    if (milestoneInput.title && milestoneInput.dueDate) {
      setFormData({ 
        ...formData, 
        milestones: [...formData.milestones, { ...milestoneInput }] 
      });
      setMilestoneInput({
        title: '',
        dueDate: '',
        description: ''
      });
    }
  };

  const handleRemoveMilestone = (index: number) => {
    setFormData({ 
      ...formData, 
      milestones: formData.milestones.filter((_, i) => i !== index) 
    });
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.title.trim()) {
        newErrors.title = 'Title is required';
      }
      if (!formData.description.trim()) {
        newErrors.description = 'Description is required';
      }
      if (!formData.startDate) {
        newErrors.startDate = 'Start date is required';
      }
      if (!formData.endDate) {
        newErrors.endDate = 'End date is required';
      }
      if (formData.endDate && formData.startDate && new Date(formData.endDate) < new Date(formData.startDate)) {
        newErrors.endDate = 'End date must be after start date';
      }
    } else if (step === 2) {
      if (formData.goals.length === 0) {
        newErrors.goals = 'At least one goal is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      // Reset form on success
      setFormData({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        goals: [],
        schedule: [],
        milestones: []
      });
      setCurrentStep(1);
      onClose();
    } catch (error) {
      console.error('Error submitting study plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const renderProgressBar = () => (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        {[1, 2, 3, 4].map((step) => (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                  step < currentStep
                    ? 'bg-green-500 dark:bg-green-600 text-white'
                    : step === currentStep
                    ? 'bg-indigo-600 dark:bg-indigo-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}
              >
                {step < currentStep ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-semibold">{step}</span>
                )}
              </div>
              <span className="text-xs mt-1 text-gray-600 dark:text-gray-400 hidden sm:block">
                {step === 1 && 'Basic Info'}
                {step === 2 && 'Goals'}
                {step === 3 && 'Schedule'}
                {step === 4 && 'Milestones'}
              </span>
            </div>
            {step < totalSteps && (
              <div
                className={`flex-1 h-1 mx-2 rounded transition-all duration-300 ${
                  step < currentStep
                    ? 'bg-green-500 dark:bg-green-600'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 mb-3">
        <BookOpen className="w-5 h-5" />
        <h4 className="font-semibold text-sm">Study Plan Information</h4>
      </div>

      <Input
        id="plan-title"
        label="Study Plan Title"
        placeholder="e.g., Final Exam Preparation"
        value={formData.title}
        onChange={handleInputChange('title')}
        required
        error={errors.title}
      />

      <div>
        <label htmlFor="plan-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="plan-description"
          placeholder="Describe your study plan"
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          id="plan-start-date"
          label="Start Date"
          type="date"
          value={formData.startDate}
          onChange={handleInputChange('startDate')}
          required
          error={errors.startDate}
        />

        <Input
          id="plan-end-date"
          label="End Date"
          type="date"
          value={formData.endDate}
          onChange={handleInputChange('endDate')}
          required
          error={errors.endDate}
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 mb-3">
        <Target className="w-5 h-5" />
        <h4 className="font-semibold text-sm">Study Goals</h4>
      </div>

      <div>
        <label htmlFor="goal-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Add Goals <span className="text-red-500">*</span>
        </label>
        <div className="flex space-x-2">
          <input
            id="goal-input"
            type="text"
            placeholder="Enter a study goal"
            value={goalInput}
            onChange={(e) => setGoalInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddGoal();
              }
            }}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          <button
            type="button"
            onClick={handleAddGoal}
            className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors"
          >
            Add
          </button>
        </div>
        {errors.goals && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.goals}</p>
        )}
      </div>

      {formData.goals.length > 0 && (
        <div className="space-y-2 mt-4">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Your Goals:</p>
          {formData.goals.map((goal, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg transition-all duration-200 hover:bg-indigo-100 dark:hover:bg-indigo-900/30"
            >
              <span className="text-sm text-gray-700 dark:text-gray-300">{goal}</span>
              <button
                type="button"
                onClick={() => handleRemoveGoal(goal)}
                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 mb-3">
        <Clock className="w-5 h-5" />
        <h4 className="font-semibold text-sm">Study Schedule</h4>
      </div>

      <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Day
            </label>
            <select
              value={scheduleInput.day}
              onChange={(e) => setScheduleInput({ ...scheduleInput, day: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">Select day</option>
              {daysOfWeek.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Topic
            </label>
            <input
              type="text"
              placeholder="What to study"
              value={scheduleInput.topic}
              onChange={(e) => setScheduleInput({ ...scheduleInput, topic: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Time
            </label>
            <input
              type="time"
              value={scheduleInput.startTime}
              onChange={(e) => setScheduleInput({ ...scheduleInput, startTime: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Time
            </label>
            <input
              type="time"
              value={scheduleInput.endTime}
              onChange={(e) => setScheduleInput({ ...scheduleInput, endTime: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddSchedule}
          className="w-full px-4 py-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors text-sm"
        >
          Add to Schedule
        </button>
      </div>

      {formData.schedule.length > 0 && (
        <div className="space-y-2 mt-4">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Your Schedule:</p>
          {formData.schedule.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg transition-all duration-200 hover:bg-indigo-100 dark:hover:bg-indigo-900/30"
            >
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-medium">{item.day}</span> - {item.topic} ({item.startTime} - {item.endTime})
              </div>
              <button
                type="button"
                onClick={() => handleRemoveSchedule(index)}
                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 mb-3">
        <ListChecks className="w-5 h-5" />
        <h4 className="font-semibold text-sm">Milestones</h4>
      </div>

      <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Milestone Title
          </label>
          <input
            type="text"
            placeholder="e.g., Complete Chapter 5"
            value={milestoneInput.title}
            onChange={(e) => setMilestoneInput({ ...milestoneInput, title: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Due Date
          </label>
          <input
            type="date"
            value={milestoneInput.dueDate}
            onChange={(e) => setMilestoneInput({ ...milestoneInput, dueDate: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description (Optional)
          </label>
          <textarea
            placeholder="Additional details"
            value={milestoneInput.description}
            onChange={(e) => setMilestoneInput({ ...milestoneInput, description: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
          />
        </div>

        <button
          type="button"
          onClick={handleAddMilestone}
          className="w-full px-4 py-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors text-sm"
        >
          Add Milestone
        </button>
      </div>

      {formData.milestones.length > 0 && (
        <div className="space-y-2 mt-4">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Your Milestones:</p>
          {formData.milestones.map((milestone, index) => (
            <div
              key={index}
              className="flex items-start justify-between p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg transition-all duration-200 hover:bg-indigo-100 dark:hover:bg-indigo-900/30"
            >
              <div className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                <div className="font-medium">{milestone.title}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Due: {new Date(milestone.dueDate).toLocaleDateString()}
                </div>
                {milestone.description && (
                  <div className="text-xs mt-1">{milestone.description}</div>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleRemoveMilestone(index)}
                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors ml-2"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Study Plan" maxWidth="lg">
      {renderProgressBar()}
      
      <div className="min-h-[400px]">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
      </div>

      <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={currentStep === 1 ? onClose : handlePrevious}
          disabled={loading}
          icon={currentStep !== 1 ? <ChevronLeft className="w-4 h-4" /> : undefined}
        >
          {currentStep === 1 ? 'Cancel' : 'Previous'}
        </Button>
        
        {currentStep < totalSteps ? (
          <Button
            type="button"
            variant="primary"
            onClick={handleNext}
            icon={<ChevronRight className="w-4 h-4" />}
          >
            Next
          </Button>
        ) : (
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            loading={loading}
            loadingText="Creating..."
          >
            Create Plan
          </Button>
        )}
      </div>
    </Modal>
  );
};

export default AddStudyPlanModal;
