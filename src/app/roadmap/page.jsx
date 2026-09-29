"use client";

import Navbar from "@/components/landing/Navbar";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import RoadmapService from "@/services/RoadmapService";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FaCalendar,
  FaCheckCircle,
  FaClock,
  FaCode,
  FaGraduationCap,
  FaSpinner,
  FaTrophy,
  FaUser,
} from "react-icons/fa";

export default function RoadmapPage() {
  const { user, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const isDark = theme === "dark";

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [formData, setFormData] = useState({
    technology: "",
    persona: "",
    proficiency: "",
    dailyHours: "",
    timeline: ""
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  const [unlockedWeek, setUnlockedWeek] = useState(1);
  const [currentRoadmapId, setCurrentRoadmapId] = useState(null);
  const [savedRoadmaps, setSavedRoadmaps] = useState([]);
  const [isLoadingRoadmaps, setIsLoadingRoadmaps] = useState(true);
  const [showQuestionnaireModal, setShowQuestionnaireModal] = useState(false);

  const questions = [
    {
      id: "technology",
      question: "Which programming language or framework do you want to master?",
      icon: <FaCode />,
      options: [
        { value: "html+css", label: "HTML + CSS", emoji: "🎨" },
        { value: "javascript", label: "JavaScript", emoji: "🟨" },
        { value: "reactjs", label: "React.js", emoji: "⚛️" },
        { value: "nodejs", label: "Node.js", emoji: "🟢" },
        { value: "python", label: "Python", emoji: "🐍" },
        { value: "java", label: "Java", emoji: "☕" },
        { value: "c++", label: "C++", emoji: "⚙️" }
      ]
    },
    {
      id: "persona",
      question: "What is your current role or learning objective?",
      icon: <FaUser />,
      options: [
        { value: "Student", label: "Student", desc: "Learning for college exams or projects", emoji: "🎓" },
        { value: "Professional", label: "Professional", desc: "Upskilling for career growth", emoji: "💼" },
        { value: "Teacher", label: "Teacher", desc: "Creating educational content", emoji: "👨‍🏫" }
      ]
    },
    {
      id: "proficiency",
      question: "How would you describe your current experience?",
      icon: <FaGraduationCap />,
      options: [
        { value: "Beginner", label: "Beginner", desc: "No prior knowledge", emoji: "🌱" },
        { value: "Intermediate", label: "Intermediate", desc: "Understand basics", emoji: "🌿" },
        { value: "Advanced", label: "Advanced", desc: "Comfortable with logic", emoji: "🌳" }
      ]
    },
    {
      id: "dailyHours",
      question: "How many hours per day can you dedicate?",
      icon: <FaClock />,
      options: [
        { value: "1 hour", label: "1 hour", emoji: "⏰" },
        { value: "2 hours", label: "2 hours", emoji: "⏱️" },
        { value: "3 hours", label: "3 hours", emoji: "⏲️" },
        { value: "5+ hours", label: "5+ hours", emoji: "🕐" }
      ]
    },
    {
      id: "timeline",
      question: "What is your goal for completing this roadmap?",
      icon: <FaCalendar />,
      options: [
        { value: "1 Month", label: "1 Month", desc: "Fast-track", emoji: "⚡" },
        { value: "2 Months", label: "2 Months", desc: "Standard pace", emoji: "📅" },
        { value: "3+ Months", label: "3+ Months", desc: "Deep-dive", emoji: "📆" }
      ]
    }
  ];

  useEffect(() => {
    let isMounted = true;

    const loadRoadmaps = async () => {
      console.log('🔍 Loading roadmaps - User state:', user);

      // Don't try to load if user is not available yet
      if (!user?.uid) {
        console.log('⚠️ No user.uid available yet, skipping Firebase load');
        if (isMounted) {
          setIsLoadingRoadmaps(false);
          setSavedRoadmaps([]);
        }
        return;
      }

      if (isMounted) {
        setIsLoadingRoadmaps(true);
      }

      console.log('🔍 Loading roadmaps for user:', user.uid);
      console.log('👤 User object:', JSON.stringify(user, null, 2));

      // Add a small delay to ensure Firestore is ready
      await new Promise(resolve => setTimeout(resolve, 500));

      try {
        console.log('📡 Fetching roadmaps from Firebase...');
        const result = await RoadmapService.getUserRoadmaps(user.uid);

        console.log('📦 Firebase result:', result);

        if (isMounted) {
          if (result.success) {
            setSavedRoadmaps(result.roadmaps);
            console.log(`✅ Loaded ${result.roadmaps.length} roadmaps from Firebase`, result.roadmaps);
          } else {
            console.warn('⚠️ Failed to load roadmaps:', result.error);
            setSavedRoadmaps([]);
          }
        }
      } catch (error) {
        console.error('❌ Error loading from Firebase:', error);
        if (isMounted) {
          setSavedRoadmaps([]);
        }
      } finally {
        if (isMounted) {
          setIsLoadingRoadmaps(false);
        }
      }
    };

    loadRoadmaps();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [user?.uid]); // Only depend on user.uid, not entire user object

  // Refresh roadmaps when page becomes visible (user navigates back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user?.uid) {
        console.log('🔄 Page visible, refreshing roadmaps...');
        refreshRoadmaps();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user?.uid]);

  const handleAnswer = (value) => {
    const currentQ = questions[currentQuestion];
    setFormData(prev => ({ ...prev, [currentQ.id]: value }));

    if (currentQuestion < questions.length - 1) {
      setTimeout(() => setCurrentQuestion(prev => prev + 1), 300);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const generateRoadmap = async () => {
    setIsGenerating(true);

    try {
      const response = await fetch("/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error("Failed to generate roadmap");

      const data = await response.json();

      // Add userData to roadmap for week page compatibility
      const roadmapWithUserData = {
        ...data.roadmap,
        userData: formData
      };

      // Create roadmap ID immediately
      const roadmapId = user?.uid ? `${user.uid}_${Date.now()}` : `local_${Date.now()}`;

      // Save to localStorage first
      localStorage.setItem("currentRoadmap", JSON.stringify(roadmapWithUserData));
      localStorage.setItem("unlockedWeek", "1");
      localStorage.setItem("currentRoadmapId", roadmapId);

      setRoadmap(roadmapWithUserData);
      setUnlockedWeek(1);
      setCurrentRoadmapId(roadmapId);

      // Close modal and navigate immediately
      setShowQuestionnaireModal(false);
      setIsGenerating(false);

      // Navigate to the roadmap overview page
      router.push(`/roadmap/${roadmapId}`);

      // Save to Firebase in the background if user is logged in
      if (user?.uid) {
        RoadmapService.saveRoadmap(user.uid, data.roadmap, formData)
          .then((result) => {
            if (result.success) {
              console.log('✅ Roadmap saved to Firebase:', result.roadmapId);

              // Update the roadmap ID if needed
              localStorage.setItem("currentRoadmapId", result.roadmapId);
              setCurrentRoadmapId(result.roadmapId);

              // Reload roadmaps list in background
              RoadmapService.getUserRoadmaps(user.uid).then((roadmapsResult) => {
                if (roadmapsResult.success) {
                  setSavedRoadmaps(roadmapsResult.roadmaps);
                }
              });
            } else {
              console.error('⚠️ Failed to save to Firebase:', result.error);
              // Roadmap is still saved locally, so user can continue
            }
          })
          .catch((error) => {
            console.error('❌ Error saving to Firebase:', error);
            // Roadmap is still saved locally, so user can continue
          });
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to generate roadmap. Please try again.");
      setIsGenerating(false);
    }
  };

  const selectRoadmap = (roadmapData) => {
    // Ensure userData exists for week page compatibility
    const roadmapWithUserData = {
      ...roadmapData,
      userData: roadmapData.userData || {
        technology: roadmapData.technology,
        persona: roadmapData.persona,
        proficiency: roadmapData.proficiency,
        dailyHours: roadmapData.dailyHours,
        timeline: roadmapData.timeline
      }
    };

    // Save to localStorage for the roadmap overview and week pages to access
    localStorage.setItem("currentRoadmap", JSON.stringify(roadmapWithUserData));
    localStorage.setItem("unlockedWeek", String(roadmapData.unlockedWeek || 1));
    localStorage.setItem("currentRoadmapId", roadmapData.id);

    // Navigate to the roadmap overview page
    router.push(`/roadmap/${roadmapData.id}`);
  };

  const createNewRoadmap = () => {
    setShowQuestionnaireModal(true);
    setCurrentQuestion(0);
    setFormData({ technology: "", persona: "", proficiency: "", dailyHours: "", timeline: "" });
  };

  const closeModal = () => {
    setShowQuestionnaireModal(false);
    setCurrentQuestion(0);
  };

  const refreshRoadmaps = async () => {
    if (!user?.uid) {
      alert('Please log in to load your roadmaps');
      return;
    }

    setIsLoadingRoadmaps(true);
    console.log('🔄 Manual refresh triggered for user:', user.uid);

    try {
      const result = await RoadmapService.getUserRoadmaps(user.uid);

      if (result.success) {
        setSavedRoadmaps(result.roadmaps);
        console.log(`✅ Refreshed: ${result.roadmaps.length} roadmaps loaded`);
      } else {
        console.error('Failed to refresh:', result.error);
        alert(`Failed to load roadmaps: ${result.error}`);
      }
    } catch (error) {
      console.error('Error refreshing:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoadingRoadmaps(false);
    }
  };

  // Loading state - wait for auth to load
  if (authLoading || isLoadingRoadmaps) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: isDark ? "#0B0B0F" : "#f5f5f5" }}>
        <div className="text-center">
          <FaSpinner className="text-6xl text-[#FF5A1F] animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2" style={{ color: isDark ? "#EDEDED" : "#1a1a1a" }}>
            {authLoading ? 'Loading...' : 'Loading your roadmaps...'}
          </h2>
        </div>
      </div>
    );
  }

  // Always show dashboard
  return (
    <>
      <div className="min-h-screen" style={{ backgroundColor: isDark ? "#0B0B0F" : "#f5f5f5" }}>
        <Navbar />
        <div className="max-w-6xl mt-30 mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: isDark ? "#EDEDED" : "#1a1a1a" }}>
              Your Learning <span className="text-[#FF5A1F]">Roadmaps</span>
            </h1>
            <p className="text-gray-500 text-lg mb-4">
              {savedRoadmaps.length > 0
                ? "Continue your journey or start a new one"
                : "Create your first personalized learning roadmap"}
            </p>

            {/* Refresh Button */}
            {user?.uid && (
              <button
                onClick={refreshRoadmaps}
                disabled={isLoadingRoadmaps}
                className="px-4 py-2 rounded-lg text-sm bg-gray-700 hover:bg-gray-600 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingRoadmaps ? '🔄 Loading...' : '🔄 Refresh Roadmaps'}
              </button>
            )}


          </div>

          {/* Roadmap Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {savedRoadmaps.map((roadmapData) => {
              const progress = roadmapData.progress?.percentComplete || 0;
              const techEmojis = {
                'html+css': '🎨',
                'javascript': '🟨',
                'reactjs': '⚛️',
                'nodejs': '🟢',
                'python': '🐍',
                'java': '☕',
                'c++': '⚙️'
              };

              return (
                <div
                  key={roadmapData.id}
                  onClick={() => selectRoadmap(roadmapData)}
                  className="group cursor-pointer p-6 rounded-2xl backdrop-blur-sm border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                  style={{
                    backgroundColor: isDark ? "rgba(26, 28, 34, 0.8)" : "rgba(255, 255, 255, 0.9)",
                    borderColor: progress === 100 ? "#10b981" : progress > 0 ? "#FF5A1F" : "#2a2e3a"
                  }}
                >
                  {/* Technology Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl">{techEmojis[roadmapData.technology] || '💻'}</span>
                      <div>
                        <h3 className="font-bold text-lg capitalize" style={{ color: isDark ? "#EDEDED" : "#1a1a1a" }}>
                          {roadmapData.technology.replace('+', ' + ')}
                        </h3>
                        <p className="text-xs text-gray-500">{roadmapData.proficiency}</p>
                      </div>
                    </div>
                    {progress === 100 && (
                      <FaTrophy className="text-2xl text-yellow-500" />
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Progress</span>
                      <span className="font-bold text-[#FF5A1F]">{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#FF5A1F] to-[#d93d0b] transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center">
                      <div className="text-xl font-bold text-[#FF5A1F]">
                        {roadmapData.progress?.completedWeeks || 0}
                      </div>
                      <div className="text-xs text-gray-500">Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-[#FF5A1F]">
                        {roadmapData.progress?.currentWeek || 1}
                      </div>
                      <div className="text-xs text-gray-500">Current</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-[#FF5A1F]">
                        {roadmapData.progress?.totalWeeks || 0}
                      </div>
                      <div className="text-xs text-gray-500">Total</div>
                    </div>
                  </div>

                  {/* Timeline & Hours */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <FaCalendar /> {roadmapData.timeline}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaClock /> {roadmapData.dailyHours}
                    </span>
                  </div>

                  {/* Continue Button */}
                  <button
                    className="w-full py-2 rounded-lg font-medium text-sm bg-gradient-to-r from-[#FF5A1F] to-[#d93d0b] text-white transition-all group-hover:shadow-lg"
                  >
                    {progress === 100 ? '🎉 Review' : progress > 0 ? '▶ Continue' : '🚀 Start'}
                  </button>
                </div>
              );
            })}

            {/* Create New Roadmap Card */}
            <div
              onClick={createNewRoadmap}
              className="group cursor-pointer p-6 rounded-2xl backdrop-blur-sm border-2 border-dashed transition-all duration-300 hover:scale-105 hover:border-[#FF5A1F] flex flex-col items-center justify-center min-h-[300px]"
              style={{
                backgroundColor: isDark ? "rgba(26, 28, 34, 0.4)" : "rgba(255, 255, 255, 0.5)",
                borderColor: "#2a2e3a"
              }}
            >
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">➕</div>
              <h3 className="font-bold text-xl mb-2" style={{ color: isDark ? "#EDEDED" : "#1a1a1a" }}>
                Create New Roadmap
              </h3>
              <p className="text-gray-500 text-sm text-center">
                Start learning something new
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Questionnaire Modal */}
      {showQuestionnaireModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div
            className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl"
            style={{ backgroundColor: isDark ? "#1a1c22" : "#ffffff" }}
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-[#FF5A1F] hover:bg-gray-700/50 transition-all z-10"
            >
              ✕
            </button>

            {/* Modal Content */}
            <div className="p-8">
              {isGenerating ? (
                <div className="text-center py-12">
                  <FaSpinner className="text-6xl text-[#FF5A1F] animate-spin mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2" style={{ color: isDark ? "#EDEDED" : "#1a1a1a" }}>
                    🤖 Generating Your Personalized Roadmap...
                  </h2>
                  <p className="text-gray-500">This may take a few seconds</p>
                </div>
              ) : (
                <>
                  {/* Progress Bar */}
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-500">Question {currentQuestion + 1} of {questions.length}</span>
                      <span className="text-sm font-medium text-[#FF5A1F]">{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#FF5A1F] to-[#d93d0b] transition-all duration-300"
                        style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Question */}
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="text-3xl text-[#FF5A1F]">
                        {questions[currentQuestion].icon}
                      </div>
                      <h2 className="text-2xl font-bold" style={{ color: isDark ? "#EDEDED" : "#1a1a1a" }}>
                        {questions[currentQuestion].question}
                      </h2>
                    </div>

                    {/* Options */}
                    <div className="space-y-3">
                      {questions[currentQuestion].options.map((option) => {
                        const isSelected = formData[questions[currentQuestion].id] === option.value;
                        return (
                          <button
                            key={option.value}
                            onClick={() => handleAnswer(option.value)}
                            className={`w-full p-4 rounded-xl text-left transition-all duration-200 border-2 ${isSelected
                                ? 'border-[#FF5A1F] bg-[#FF5A1F]/10 scale-105'
                                : 'border-gray-700 hover:border-[#FF5A1F]/50 hover:scale-102'
                              }`}
                            style={{ backgroundColor: isDark ? (isSelected ? "rgba(255, 90, 31, 0.1)" : "#0f1117") : (isSelected ? "rgba(255, 90, 31, 0.1)" : "#f9f9f9") }}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{option.emoji}</span>
                              <div className="flex-1">
                                <div className="font-semibold" style={{ color: isDark ? "#EDEDED" : "#1a1a1a" }}>
                                  {option.label}
                                </div>
                                {option.desc && (
                                  <div className="text-sm text-gray-500 mt-1">{option.desc}</div>
                                )}
                              </div>
                              {isSelected && (
                                <FaCheckCircle className="text-[#FF5A1F] text-xl" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex gap-3">
                    {currentQuestion > 0 && (
                      <button
                        onClick={handlePrevious}
                        className="px-6 py-3 rounded-lg font-medium text-gray-400 hover:text-white hover:bg-gray-700 transition-all"
                      >
                        ← Previous
                      </button>
                    )}

                    {currentQuestion === questions.length - 1 && formData[questions[currentQuestion].id] && (
                      <button
                        onClick={generateRoadmap}
                        disabled={isGenerating}
                        className="ml-auto px-8 py-3 rounded-lg font-medium bg-gradient-to-r from-[#FF5A1F] to-[#d93d0b] text-white hover:shadow-lg transition-all disabled:opacity-50"
                      >
                        Generate My Roadmap 🚀
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

