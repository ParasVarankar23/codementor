'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import RoadmapService from '@/services/RoadmapService';
import { 
  FaArrowLeft, 
  FaCheckCircle, 
  FaClock, 
  FaLock,
  FaPlay,
  FaBook,
  FaFire,
  FaCalendar,
  FaTrophy,
  FaStar,
  FaChartLine
} from 'react-icons/fa';

export default function RoadmapOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [roadmapData, setRoadmapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unlockedWeek, setUnlockedWeek] = useState(1);
  const [hoveredWeek, setHoveredWeek] = useState(null);

  useEffect(() => {
    const loadRoadmap = async () => {
      setLoading(true);
      
      // Try to load from localStorage first
      const storedRoadmap = localStorage.getItem('currentRoadmap');
      const storedRoadmapId = localStorage.getItem('currentRoadmapId');
      const storedUnlocked = localStorage.getItem('unlockedWeek');
      
      if (storedRoadmapId === params.roadmapId && storedRoadmap) {
        const roadmap = JSON.parse(storedRoadmap);
        setRoadmapData(roadmap);
        setUnlockedWeek(parseInt(storedUnlocked || '1', 10));
        setLoading(false);
        return;
      }
      
      // If not in localStorage, try to load from Firebase
      if (params.roadmapId && !params.roadmapId.startsWith('local_')) {
        try {
          const result = await RoadmapService.getRoadmap(params.roadmapId);
          
          if (result.success) {
            setRoadmapData(result.roadmap);
            setUnlockedWeek(result.roadmap.unlockedWeek || 1);
            
            // Save to localStorage for faster access
            localStorage.setItem('currentRoadmap', JSON.stringify(result.roadmap));
            localStorage.setItem('currentRoadmapId', params.roadmapId);
            localStorage.setItem('unlockedWeek', String(result.roadmap.unlockedWeek || 1));
          }
        } catch (error) {
          console.error('Error loading roadmap:', error);
        }
      }
      
      setLoading(false);
    };

    loadRoadmap();
  }, [params.roadmapId]);

  const handleWeekClick = (weekNumber, isLocked) => {
    if (!isLocked) {
      router.push(`/roadmap/week/${weekNumber}`);
    }
  };

  const techEmojis = {
    'html+css': '🎨',
    'javascript': '🟨',
    'reactjs': '⚛️',
    'nodejs': '🟢',
    'python': '🐍',
    'java': '☕',
    'c++': '⚙️'
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: isDark ? '#0B0B0F' : '#f5f5f5' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#FF5A1F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading roadmap...</p>
        </div>
      </div>
    );
  }

  if (!roadmapData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: isDark ? '#0B0B0F' : '#f5f5f5' }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ color: isDark ? '#EDEDED' : '#1a1a1a' }}>Roadmap not found</h1>
          <button 
            onClick={() => router.push('/roadmap')}
            className="px-6 py-3 bg-[#FF5A1F] text-white rounded-xl hover:bg-[#d93d0b] transition-all"
          >
            Go Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const progress = roadmapData.progress?.percentComplete || 0;
  const completedWeeks = roadmapData.completedWeeks || [];

  return (
    <div className="min-h-screen" style={{ backgroundColor: isDark ? '#0B0B0F' : '#f5f5f5' }}>
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-lg border-b" style={{ 
        backgroundColor: isDark ? 'rgba(11, 11, 15, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        borderColor: isDark ? '#1a1c22' : '#e5e7eb'
      }}>
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => router.push('/roadmap')}
              className="flex items-center gap-2 text-gray-500 hover:text-[#FF5A1F] transition-colors"
            >
              <FaArrowLeft />
              <span className="font-medium">Back to Dashboard</span>
            </button>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                Progress: <span className="font-bold text-[#FF5A1F]">{progress}%</span>
              </div>
              {progress === 100 && (
                <FaTrophy className="text-2xl text-yellow-500" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden" style={{ backgroundColor: isDark ? '#1a1c22' : '#ffffff' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#FF5A1F] rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl"></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto px-4 py-12">
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#FF5A1F] to-[#d93d0b] flex items-center justify-center text-white text-5xl shadow-2xl">
                {techEmojis[roadmapData.technology] || '💻'}
              </div>
            </div>
            
            <div className="flex-1">
              <div className="text-sm font-semibold text-[#FF5A1F] mb-2 uppercase">
                {roadmapData.proficiency} • {roadmapData.persona}
              </div>
              <h1 className="text-5xl font-bold mb-4 capitalize" style={{ color: isDark ? '#EDEDED' : '#1a1a1a' }}>
                {roadmapData.technology.replace('+', ' + ')} Roadmap
              </h1>
              <p className="text-lg text-gray-500 mb-6">
                Your personalized {roadmapData.timeline.toLowerCase()} learning journey
              </p>
              
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Overall Progress</span>
                  <span className="font-bold text-[#FF5A1F]">{progress}%</span>
                </div>
                <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#FF5A1F] to-[#d93d0b] transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ backgroundColor: isDark ? '#0B0B0F' : '#f5f5f5' }}>
                  <FaCalendar className="text-[#FF5A1F]" />
                  <span className="text-sm font-medium" style={{ color: isDark ? '#EDEDED' : '#1a1a1a' }}>
                    {roadmapData.timeline}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ backgroundColor: isDark ? '#0B0B0F' : '#f5f5f5' }}>
                  <FaFire className="text-orange-500" />
                  <span className="text-sm font-medium" style={{ color: isDark ? '#EDEDED' : '#1a1a1a' }}>
                    {roadmapData.dailyHours}/day
                  </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ backgroundColor: isDark ? '#0B0B0F' : '#f5f5f5' }}>
                  <FaBook className="text-blue-500" />
                  <span className="text-sm font-medium" style={{ color: isDark ? '#EDEDED' : '#1a1a1a' }}>
                    {roadmapData.weeks?.length || 0} Weeks
                  </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ backgroundColor: isDark ? '#0B0B0F' : '#f5f5f5' }}>
                  <FaChartLine className="text-green-500" />
                  <span className="text-sm font-medium" style={{ color: isDark ? '#EDEDED' : '#1a1a1a' }}>
                    {completedWeeks.length} Completed
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weeks Timeline */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8" style={{ color: isDark ? '#EDEDED' : '#1a1a1a' }}>
          Learning Timeline
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roadmapData.weeks?.map((week) => {
            const isCompleted = completedWeeks.includes(week.week);
            const isUnlocked = week.week <= unlockedWeek;
            const isLocked = !isUnlocked;
            const isCurrent = week.week === unlockedWeek && !isCompleted;
            const isHovered = hoveredWeek === week.week;
            
            return (
              <div
                key={week.week}
                onMouseEnter={() => setHoveredWeek(week.week)}
                onMouseLeave={() => setHoveredWeek(null)}
                onClick={() => handleWeekClick(week.week, isLocked)}
                className={`group relative rounded-2xl p-6 border-2 transition-all duration-300 ${
                  isLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:scale-105 hover:shadow-2xl'
                }`}
                style={{
                  backgroundColor: isDark ? '#1a1c22' : '#ffffff',
                  borderColor: isCompleted ? '#10b981' : isCurrent ? '#FF5A1F' : isLocked ? '#2a2c32' : '#2a2c32'
                }}
              >
                {/* Status Badge */}
                <div className="absolute -top-3 -right-3">
                  {isCompleted ? (
                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                      <FaCheckCircle className="text-white text-xl" />
                    </div>
                  ) : isCurrent ? (
                    <div className="w-12 h-12 rounded-full bg-[#FF5A1F] flex items-center justify-center shadow-lg animate-pulse">
                      <FaPlay className="text-white text-sm" />
                    </div>
                  ) : isLocked ? (
                    <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center shadow-lg">
                      <FaLock className="text-white text-sm" />
                    </div>
                  ) : null}
                </div>

                {/* Week Number */}
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-4 ${
                  isCompleted ? 'bg-gradient-to-br from-green-500 to-green-600' :
                  isCurrent ? 'bg-gradient-to-br from-[#FF5A1F] to-[#d93d0b]' :
                  isLocked ? 'bg-gradient-to-br from-gray-600 to-gray-700' :
                  'bg-gradient-to-br from-blue-500 to-blue-600'
                }`}>
                  {week.week}
                </div>

                {/* Week Title */}
                <h3 className="text-xl font-bold mb-3 line-clamp-2" style={{ color: isDark ? '#EDEDED' : '#1a1a1a' }}>
                  {week.title}
                </h3>

                {/* Week Focus */}
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                  {week.focus || 'Master the fundamentals'}
                </p>

                {/* Week Stats */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-500">
                    <FaClock className="text-[#FF5A1F]" />
                    <span>{week.estimatedHours}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <FaBook className="text-blue-500" />
                    <span>{week.topics?.length || 0} topics</span>
                  </div>
                </div>

                {/* Hover Effect */}
                {isHovered && !isLocked && (
                  <div className="absolute inset-0 rounded-2xl bg-gray-900/50 backdrop-blur-sm border-2 border-[#FF5A1F] flex items-center justify-center">
                    <div className="text-[#FF5A1F] font-bold text-lg">
                      {isCompleted ? 'Review Week' : isCurrent ? 'Continue Learning' : 'Start Week'}
                    </div>
                  </div>
                )}

                {/* Locked Overlay */}
                {isLocked && (
                  <div className="absolute inset-0 rounded-2xl bg-black/50 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center">
                      <FaLock className="text-white text-3xl mx-auto mb-2" />
                      <div className="text-white text-sm font-medium">Complete Week {week.week - 1}</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Completion Message */}
        {progress === 100 && (
          <div className="mt-12 p-8 rounded-3xl bg-gradient-to-r from-green-500/20 to-blue-500/20 border-2 border-green-500/50 text-center">
            <FaTrophy className="text-6xl text-yellow-500 mx-auto mb-4" />
            <h3 className="text-3xl font-bold mb-2" style={{ color: isDark ? '#EDEDED' : '#1a1a1a' }}>
              Congratulations! 🎉
            </h3>
            <p className="text-lg text-gray-500 mb-6">
              You've completed the entire {roadmapData.technology.replace('+', ' + ')} roadmap!
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push('/roadmap')}
                className="px-6 py-3 bg-gradient-to-r from-[#FF5A1F] to-[#d93d0b] text-white font-bold rounded-xl hover:shadow-lg transition-all"
              >
                Start New Roadmap
              </button>
              <button
                onClick={() => handleWeekClick(1, false)}
                className="px-6 py-3 bg-gray-700 text-white font-bold rounded-xl hover:bg-gray-600 transition-all"
              >
                Review Content
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
