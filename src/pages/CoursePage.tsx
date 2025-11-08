import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Plus, 
  Calendar, 
  ListTodo, 
  Target,
  Clock,
  TrendingUp,
  Users,
  ChevronRight,
  Edit,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { FadeIn } from '../utils/animations';
import Button from '../components/Button';
import AddTopicModal, { TopicFormData } from '../components/AddTopicModal';
import AddStudyPlanModal, { StudyPlanFormData } from '../components/AddStudyPlanModal';
import { toast } from 'sonner';

interface Topic {
  id: string;
  title: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  resources: string;
  tags: string[];
  completed: boolean;
  createdAt: string;
}

interface StudyPlan {
  id: string;
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
    completed?: boolean;
  }[];
  progress: number;
  createdAt: string;
}

interface Course {
  code: string;
  title: string;
  description: string;
  instructor: string;
  credits: number;
  semester: string;
}

const CoursePage: React.FC = () => {
  const { coursecode } = useParams<{ coursecode: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [isStudyPlanModalOpen, setIsStudyPlanModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'topics' | 'plans'>('topics');

  useEffect(() => {
    // Simulate loading course data
    const loadCourseData = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock course data
        setCourse({
          code: coursecode || 'UNKNOWN',
          title: 'Introduction to Computer Science',
          description: 'Fundamental concepts of computer science and programming',
          instructor: 'Dr. John Doe',
          credits: 3,
          semester: 'Fall 2024'
        });

        // Mock topics
        setTopics([
          {
            id: '1',
            title: 'Introduction to Programming',
            description: 'Basic programming concepts and syntax',
            category: 'Lecture',
            startDate: '2024-01-15',
            endDate: '2024-01-22',
            resources: 'https://example.com/resource1',
            tags: ['programming', 'basics'],
            completed: true,
            createdAt: new Date().toISOString()
          }
        ]);

        // Mock study plans
        setStudyPlans([]);
      } catch (error) {
        console.error('Error loading course data:', error);
        toast.error('Failed to load course data');
      } finally {
        setLoading(false);
      }
    };

    loadCourseData();
  }, [coursecode]);

  const handleAddTopic = async (topicData: TopicFormData) => {
    // Here you would typically make an API call to save the topic
    const newTopic: Topic = {
      id: Date.now().toString(),
      ...topicData,
      completed: false,
      createdAt: new Date().toISOString()
    };
    
    setTopics([...topics, newTopic]);
    toast.success('Topic added successfully!');
  };

  const handleAddStudyPlan = async (studyPlanData: StudyPlanFormData) => {
    // Here you would typically make an API call to save the study plan
    const newStudyPlan: StudyPlan = {
      id: Date.now().toString(),
      ...studyPlanData,
      progress: 0,
      createdAt: new Date().toISOString(),
      milestones: studyPlanData.milestones.map(m => ({ ...m, completed: false }))
    };
    
    setStudyPlans([...studyPlans, newStudyPlan]);
    toast.success('Study plan created successfully!');
  };

  const handleToggleTopicComplete = (topicId: string) => {
    setTopics(topics.map(topic => 
      topic.id === topicId ? { ...topic, completed: !topic.completed } : topic
    ));
  };

  const handleDeleteTopic = (topicId: string) => {
    setTopics(topics.filter(topic => topic.id !== topicId));
    toast.success('Topic deleted');
  };

  const handleDeleteStudyPlan = (planId: string) => {
    setStudyPlans(studyPlans.filter(plan => plan.id !== planId));
    toast.success('Study plan deleted');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Course not found
        </h2>
        <Button onClick={() => navigate('/')}>Go to Dashboard</Button>
      </div>
    );
  }

  const completedTopics = topics.filter(t => t.completed).length;
  const completionRate = topics.length > 0 ? Math.round((completedTopics / topics.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Course Header */}
        <FadeIn direction="up" delay={0.1}>
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-800 dark:to-purple-800 rounded-2xl p-8 mb-8 text-white shadow-lg">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <BookOpen className="w-6 h-6" />
                  <span className="text-sm font-semibold uppercase tracking-wide opacity-90">
                    {course.code}
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-3">
                  {course.title}
                </h1>
                <p className="text-indigo-100 dark:text-indigo-200 mb-4 max-w-2xl">
                  {course.description}
                </p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>{course.instructor}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{course.semester}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4" />
                    <span>{course.credits} Credits</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 md:mt-0 flex flex-col space-y-3">
                <Button
                  onClick={() => setIsTopicModalOpen(true)}
                  variant="accent"
                  icon={<Plus className="w-4 h-4" />}
                >
                  Add Topic
                </Button>
                <Button
                  onClick={() => setIsStudyPlanModalOpen(true)}
                  variant="secondary"
                  icon={<Plus className="w-4 h-4" />}
                >
                  Create Study Plan
                </Button>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Stats Cards */}
        <FadeIn direction="up" delay={0.2}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-lg">
                  <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {topics.length}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Topics</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {completedTopics}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-purple-100 dark:bg-purple-900/50 p-3 rounded-lg">
                  <ListTodo className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {studyPlans.length}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Study Plans</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-teal-100 dark:bg-teal-900/50 p-3 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {completionRate}%
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Progress</p>
            </div>
          </div>
        </FadeIn>

        {/* Tabs */}
        <FadeIn direction="up" delay={0.3}>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab('topics')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 ${
                  activeTab === 'topics'
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <BookOpen className="w-4 h-4" />
                  <span>Topics</span>
                  <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full text-xs">
                    {topics.length}
                  </span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('plans')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 ${
                  activeTab === 'plans'
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <ListTodo className="w-4 h-4" />
                  <span>Study Plans</span>
                  <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full text-xs">
                    {studyPlans.length}
                  </span>
                </div>
              </button>
            </div>

            {/* Topics Tab Content */}
            {activeTab === 'topics' && (
              <div className="p-6">
                {topics.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No topics yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Start organizing your course by adding topics
                    </p>
                    <Button
                      onClick={() => setIsTopicModalOpen(true)}
                      variant="primary"
                      icon={<Plus className="w-4 h-4" />}
                    >
                      Add Your First Topic
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {topics.map((topic, index) => (
                      <div
                        key={topic.id}
                        className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-200"
                        style={{
                          animation: 'fadeIn 0.3s ease-out',
                          animationDelay: `${index * 0.05}s`,
                          animationFillMode: 'backwards'
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <button
                              onClick={() => handleToggleTopicComplete(topic.id)}
                              className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                                topic.completed
                                  ? 'bg-green-500 border-green-500'
                                  : 'border-gray-300 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-400'
                              }`}
                            >
                              {topic.completed && (
                                <CheckCircle2 className="w-3 h-3 text-white" />
                              )}
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className={`font-semibold text-gray-900 dark:text-white ${
                                  topic.completed ? 'line-through opacity-60' : ''
                                }`}>
                                  {topic.title}
                                </h4>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300">
                                  {topic.category}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {topic.description}
                              </p>
                              <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-500">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>
                                    {new Date(topic.startDate).toLocaleDateString()} - {new Date(topic.endDate).toLocaleDateString()}
                                  </span>
                                </div>
                                {topic.tags.length > 0 && (
                                  <div className="flex items-center space-x-1">
                                    {topic.tags.map((tag, i) => (
                                      <span
                                        key={i}
                                        className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded-full"
                                      >
                                        #{tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => handleDeleteTopic(topic.id)}
                              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Study Plans Tab Content */}
            {activeTab === 'plans' && (
              <div className="p-6">
                {studyPlans.length === 0 ? (
                  <div className="text-center py-12">
                    <ListTodo className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No study plans yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Create a study plan to organize your learning
                    </p>
                    <Button
                      onClick={() => setIsStudyPlanModalOpen(true)}
                      variant="primary"
                      icon={<Plus className="w-4 h-4" />}
                    >
                      Create Your First Plan
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {studyPlans.map((plan, index) => (
                      <div
                        key={plan.id}
                        className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-5 border border-indigo-200 dark:border-indigo-800 hover:shadow-md transition-all duration-200"
                        style={{
                          animation: 'fadeIn 0.3s ease-out',
                          animationDelay: `${index * 0.05}s`,
                          animationFillMode: 'backwards'
                        }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                            {plan.title}
                          </h4>
                          <button
                            onClick={() => handleDeleteStudyPlan(plan.id)}
                            className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          {plan.description}
                        </p>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>
                                {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
                              </span>
                            </div>
                            <span className="font-semibold">
                              {plan.progress}% Complete
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${plan.progress}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                              <Target className="w-3 h-3" />
                              <span>{plan.goals.length} Goals</span>
                            </div>
                            <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                              <Clock className="w-3 h-3" />
                              <span>{plan.schedule.length} Sessions</span>
                            </div>
                            <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{plan.milestones.length} Milestones</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </FadeIn>
      </div>

      {/* Modals */}
      <AddTopicModal
        isOpen={isTopicModalOpen}
        onClose={() => setIsTopicModalOpen(false)}
        onSubmit={handleAddTopic}
      />

      <AddStudyPlanModal
        isOpen={isStudyPlanModalOpen}
        onClose={() => setIsStudyPlanModalOpen(false)}
        onSubmit={handleAddStudyPlan}
      />
    </div>
  );
};

export default CoursePage;
