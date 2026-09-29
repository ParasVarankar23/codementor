'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import RoadmapService from '@/services/RoadmapService';
import { 
  FaArrowLeft, 
  FaCheckCircle, 
  FaClock, 
  FaCode, 
  FaLightbulb, 
  FaRocket, 
  FaStar,
  FaPlay,
  FaBook,
  FaFire,
  FaCalendar,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';

export default function WeekDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [weekData, setWeekData] = useState(null);
  const [roadmapData, setRoadmapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [expandedDay, setExpandedDay] = useState(null);
  const [expandedTopic, setExpandedTopic] = useState({});
  const [isCompletingWeek, setIsCompletingWeek] = useState(false);

  useEffect(() => {
    const storedRoadmap = localStorage.getItem('currentRoadmap');
    if (storedRoadmap) {
      const roadmap = JSON.parse(storedRoadmap);
      setRoadmapData(roadmap);
      
      const week = roadmap.weeks.find(w => w.week === parseInt(params.weekNumber));
      if (week) {
        setWeekData(week);
      }
      
      const currentUnlocked = parseInt(localStorage.getItem('unlockedWeek') || '1', 10);
      if (parseInt(params.weekNumber, 10) < currentUnlocked) {
        setIsCompleted(true);
      }
    }
    setLoading(false);
  }, [params.weekNumber]);

  const handleCompleteWeek = async () => {
    setIsCompletingWeek(true);
    
    const currentUnlocked = parseInt(localStorage.getItem('unlockedWeek') || '1', 10);
    const thisWeek = parseInt(params.weekNumber, 10);
    const roadmapId = localStorage.getItem('currentRoadmapId');
    
    // Update localStorage
    if (thisWeek >= currentUnlocked) {
      const nextWeek = thisWeek + 1;
      localStorage.setItem('unlockedWeek', nextWeek.toString());
      
      // Update Firebase if user is logged in and roadmap exists
      if (roadmapId && roadmapId !== 'local_' + roadmapId.split('_')[1]) {
        try {
          console.log('📝 Updating week completion in Firebase...');
          
          // Mark current week as complete
          const completeResult = await RoadmapService.completeWeek(roadmapId, thisWeek);
          
          if (completeResult.success) {
            console.log(`✅ Week ${thisWeek} marked as complete`);
            
            // Unlock next week if not the last week
            if (nextWeek <= roadmapData.weeks.length) {
              const unlockResult = await RoadmapService.unlockWeek(roadmapId, nextWeek);
              if (unlockResult.success) {
                console.log(`✅ Week ${nextWeek} unlocked`);
              }
            }
            
            // Update local roadmap data with new progress
            if (completeResult.percentComplete !== undefined) {
              const updatedRoadmap = {
                ...roadmapData,
                progress: {
                  ...roadmapData.progress,
                  percentComplete: completeResult.percentComplete,
                  completedWeeks: (roadmapData.progress?.completedWeeks || 0) + 1,
                  currentWeek: nextWeek
                },
                unlockedWeek: nextWeek
              };
              localStorage.setItem('currentRoadmap', JSON.stringify(updatedRoadmap));
            }
          }
        } catch (error) {
          console.error('❌ Error updating Firebase:', error);
          // Continue anyway, local storage is updated
        }
      }
    }
    
    // Mark as completed locally
    setIsCompleted(true);
    setIsCompletingWeek(false);
    
    // Navigate back to roadmap after a short delay
    setTimeout(() => {
      router.push('/roadmap');
    }, 1500);
  };

  const generateDayByDayBreakdown = (week, userData) => {
    const daysPerWeek = 7;
    const hoursPerDay = parseInt(userData.dailyHours.replace(/[^0-9]/g, '')) || 1;
    const timeline = userData.timeline;
    const totalTopics = week.topics ? week.topics.length : 0;

    const intensityFactor = hoursPerDay * (
      timeline === '1 Month' ? 4 :
      timeline === '2 Months' ? 8 : 12
    );

    let topicsPerDay;
    if (intensityFactor <= 20) {
      topicsPerDay = Math.ceil(totalTopics / 3);
    } else if (intensityFactor <= 40) {
      topicsPerDay = Math.ceil(totalTopics / 4);
    } else if (intensityFactor <= 80) {
      topicsPerDay = Math.ceil(totalTopics / 5);
    } else {
      topicsPerDay = Math.ceil(totalTopics / 7);
    }

    const days = [];
    let topicIndex = 0;

    for (let day = 1; day <= daysPerWeek; day++) {
      const remainingTopics = totalTopics - topicIndex;
      const remainingDays = daysPerWeek - day + 1;

      let currentDayTopics = Math.min(
        topicsPerDay,
        Math.ceil(remainingTopics / remainingDays)
      );

      const dayTopics = week.topics ? week.topics.slice(topicIndex, topicIndex + currentDayTopics) : [];
      topicIndex += currentDayTopics;

      let studyTime = hoursPerDay;
      if (dayTopics.length === 0) {
        studyTime = Math.min(1, hoursPerDay);
      }

      days.push({
        day: day,
        dayName: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][day - 1],
        topics: dayTopics,
        studyHours: studyTime,
        isRestDay: dayTopics.length === 0,
        intensity: intensityFactor <= 40 ? 'High' : intensityFactor <= 80 ? 'Medium' : 'Deep'
      });

      if (topicIndex >= totalTopics) {
        for (let restDay = day + 1; restDay <= daysPerWeek; restDay++) {
          days.push({
            day: restDay,
            dayName: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][restDay - 1],
            topics: [],
            studyHours: Math.min(1, hoursPerDay),
            isRestDay: true,
            intensity: 'Review'
          });
        }
        break;
      }
    }

    return days;
  };

  const toggleDay = (dayNumber) => {
    setExpandedDay(expandedDay === dayNumber ? null : dayNumber);
  };

  const toggleTopic = (dayNumber, topicIndex) => {
    const key = `${dayNumber}-${topicIndex}`;
    setExpandedTopic(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: isDark ? '#0B0B0F' : '#f5f5f5' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#FF5A1F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading week details...</p>
        </div>
      </div>
    );
  }

  if (!weekData || !roadmapData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: isDark ? '#0B0B0F' : '#f5f5f5' }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ color: isDark ? '#EDEDED' : '#1a1a1a' }}>Week not found</h1>
          <button 
            onClick={() => router.push('/roadmap')}
            className="px-6 py-3 bg-[#FF5A1F] text-white rounded-xl hover:bg-[#d93d0b] transition-all"
          >
            Go Back to Roadmap
          </button>
        </div>
      </div>
    );
  }

  const days = generateDayByDayBreakdown(weekData, roadmapData.userData);

  return (
    <div className="min-h-screen" style={{ backgroundColor: isDark ? '#0B0B0F' : '#f5f5f5' }}>
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-lg border-b" style={{ 
        backgroundColor: isDark ? 'rgba(11, 11, 15, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        borderColor: isDark ? '#1a1c22' : '#e5e7eb'
      }}>
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => router.push('/roadmap')}
              className="flex items-center gap-2 text-gray-500 hover:text-[#FF5A1F] transition-colors"
            >
              <FaArrowLeft />
              <span className="font-medium">Back to Roadmap</span>
            </button>
            
            {isCompleted && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 text-green-500 text-sm font-bold">
                <FaCheckCircle />
                Completed
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden" style={{ backgroundColor: isDark ? '#1a1c22' : '#ffffff' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#FF5A1F] rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl"></div>
        </div>
        
        <div className="relative max-w-5xl mx-auto px-4 py-12">
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FF5A1F] to-[#d93d0b] flex items-center justify-center text-white text-3xl font-bold shadow-2xl">
                {weekData.week}
              </div>
            </div>
            
            <div className="flex-1">
              <div className="text-sm font-semibold text-[#FF5A1F] mb-2">WEEK {weekData.week}</div>
              <h1 className="text-4xl font-bold mb-4" style={{ color: isDark ? '#EDEDED' : '#1a1a1a' }}>
                {weekData.title}
              </h1>
              <p className="text-lg text-gray-500 mb-6">
                {weekData.focus || 'Master the fundamentals and build practical skills'}
              </p>
              
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ backgroundColor: isDark ? '#0B0B0F' : '#f5f5f5' }}>
                  <FaClock className="text-[#FF5A1F]" />
                  <span className="text-sm font-medium" style={{ color: isDark ? '#EDEDED' : '#1a1a1a' }}>
                    {weekData.estimatedHours}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ backgroundColor: isDark ? '#0B0B0F' : '#f5f5f5' }}>
                  <FaBook className="text-blue-500" />
                  <span className="text-sm font-medium" style={{ color: isDark ? '#EDEDED' : '#1a1a1a' }}>
                    {weekData.topics?.length || 0} Topics
                  </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ backgroundColor: isDark ? '#0B0B0F' : '#f5f5f5' }}>
                  <FaFire className="text-orange-500" />
                  <span className="text-sm font-medium" style={{ color: isDark ? '#EDEDED' : '#1a1a1a' }}>
                    {roadmapData.userData.dailyHours}/day
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Day by Day Timeline */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6" style={{ color: isDark ? '#EDEDED' : '#1a1a1a' }}>
            7-Day Learning Plan
          </h2>
          
          <div className="space-y-4">
            {days.map((day) => {
              const isExpanded = expandedDay === day.day;
              
              return (
                <div 
                  key={day.day} 
                  className="rounded-2xl overflow-hidden border transition-all duration-300"
                  style={{ 
                    backgroundColor: isDark ? '#1a1c22' : '#ffffff',
                    borderColor: isExpanded ? '#FF5A1F' : (isDark ? '#2a2c32' : '#e5e7eb')
                  }}
                >
                  {/* Day Header */}
                  <button
                    onClick={() => toggleDay(day.day)}
                    className="w-full p-6 flex items-center justify-between hover:bg-opacity-50 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white ${
                        day.isRestDay 
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                          : 'bg-gradient-to-br from-[#FF5A1F] to-[#d93d0b]'
                      }`}>
                        {day.day}
                      </div>
                      
                      <div className="text-left">
                        <h3 className="text-lg font-bold" style={{ color: isDark ? '#EDEDED' : '#1a1a1a' }}>
                          {day.dayName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {day.isRestDay 
                            ? '🎯 Review & Practice' 
                            : `${day.topics.length} topics • ${day.studyHours}h • ${day.intensity} intensity`
                          }
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-gray-500">
                      {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                    </div>
                  </button>

                  {/* Day Content */}
                  {isExpanded && (
                    <div className="px-6 pb-6 space-y-4">
                      {day.isRestDay ? (
                        <div className="p-6 rounded-xl bg-blue-500/10 border border-blue-500/20">
                          <div className="flex items-start gap-3">
                            <FaLightbulb className="text-blue-500 text-xl mt-1" />
                            <div>
                              <h4 className="font-bold text-blue-500 mb-2">Rest & Review Day</h4>
                              <p className="text-gray-500 text-sm leading-relaxed">
                                Take this time to review what you've learned this week. Practice with small exercises, 
                                revisit challenging concepts, and let the knowledge settle in. Recommended study time: {day.studyHours}h
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {day.topics.map((topic, idx) => {
                            const isDetailedTopic = typeof topic === 'object';
                            const topicKey = `${day.day}-${idx}`;
                            const isTopicExpanded = expandedTopic[topicKey];
                            
                            if (isDetailedTopic) {
                              return (
                                <div 
                                  key={idx} 
                                  className="rounded-xl border overflow-hidden"
                                  style={{ 
                                    backgroundColor: isDark ? '#0B0B0F' : '#f9fafb',
                                    borderColor: isDark ? '#2a2c32' : '#e5e7eb'
                                  }}
                                >
                                  <button
                                    onClick={() => toggleTopic(day.day, idx)}
                                    className="w-full p-4 flex items-center justify-between hover:bg-opacity-50 transition-all"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-lg bg-[#FF5A1F]/20 flex items-center justify-center">
                                        <FaCode className="text-[#FF5A1F] text-sm" />
                                      </div>
                                      <span className="font-semibold text-left" style={{ color: isDark ? '#EDEDED' : '#1a1a1a' }}>
                                        {topic.name}
                                      </span>
                                    </div>
                                    <div className="text-gray-500 text-sm">
                                      {isTopicExpanded ? <FaChevronUp /> : <FaChevronDown />}
                                    </div>
                                  </button>

                                  {isTopicExpanded && (
                                    <div className="px-4 pb-4 space-y-4">
                                      {/* Explanation */}
                                      <div>
                                        <div className="flex items-center gap-2 mb-2">
                                          <FaLightbulb className="text-yellow-500 text-sm" />
                                          <span className="text-xs font-bold text-gray-500 uppercase">What you'll learn</span>
                                        </div>
                                        <p className="text-sm text-gray-500 leading-relaxed pl-6">
                                          {topic.explanation}
                                        </p>
                                      </div>

                                      {/* Code Example */}
                                      {topic.codeExample && (
                                        <div>
                                          <div className="flex items-center gap-2 mb-2">
                                            <FaCode className="text-green-500 text-sm" />
                                            <span className="text-xs font-bold text-gray-500 uppercase">Code Example</span>
                                          </div>
                                          <pre className="p-4 rounded-lg overflow-x-auto text-sm font-mono" style={{ 
                                            backgroundColor: isDark ? '#000000' : '#1a1c22',
                                            border: `1px solid ${isDark ? '#2a2c32' : '#e5e7eb'}`
                                          }}>
                                            <code className="text-green-400">{topic.codeExample}</code>
                                          </pre>
                                        </div>
                                      )}

                                      {/* Code Explanation */}
                                      {topic.codeExplanation && (
                                        <div>
                                          <div className="flex items-center gap-2 mb-2">
                                            <FaBook className="text-blue-500 text-sm" />
                                            <span className="text-xs font-bold text-gray-500 uppercase">How it works</span>
                                          </div>
                                          <p className="text-sm text-gray-500 leading-relaxed pl-6">
                                            {topic.codeExplanation}
                                          </p>
                                        </div>
                                      )}

                                      {/* Practice Button */}
                                      <button
                                        onClick={() => {
                                          // Store the topic data in localStorage for the demo page
                                          const practiceData = {
                                            code: topic.codeExample || '',
                                            topicName: topic.name,
                                            explanation: topic.explanation,
                                            codeExplanation: topic.codeExplanation,
                                            language: roadmapData.userData.technology.toLowerCase()
                                          };
                                          localStorage.setItem('practiceCode', JSON.stringify(practiceData));
                                          router.push('/learning-mode');
                                        }}
                                        className="w-full mt-2 px-4 py-3 bg-gradient-to-r from-[#FF5A1F] to-[#d93d0b] text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                      >
                                        <FaPlay />
                                        Practice in Code Editor
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            } else {
                              return (
                                <div 
                                  key={idx} 
                                  className="p-4 rounded-xl border flex items-center gap-3"
                                  style={{ 
                                    backgroundColor: isDark ? '#0B0B0F' : '#f9fafb',
                                    borderColor: isDark ? '#2a2c32' : '#e5e7eb'
                                  }}
                                >
                                  <div className="w-8 h-8 rounded-lg bg-[#FF5A1F]/20 flex items-center justify-center">
                                    <FaBook className="text-[#FF5A1F] text-sm" />
                                  </div>
                                  <span className="font-medium" style={{ color: isDark ? '#EDEDED' : '#1a1a1a' }}>
                                    {topic}
                                  </span>
                                </div>
                              );
                            }
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Complete Week Button */}
        <div className="flex justify-center py-12">
          {isCompleted ? (
            <button
              onClick={() => router.push('/roadmap')}
              className="px-8 py-4 bg-green-500/20 text-green-500 border-2 border-green-500/50 font-bold rounded-2xl hover:bg-green-500/30 transition-all flex items-center gap-3"
            >
              <FaCheckCircle className="text-xl" />
              <span>Week Completed • Back to Roadmap</span>
            </button>
          ) : (
            <button
              onClick={handleCompleteWeek}
              disabled={isCompletingWeek}
              className="px-8 py-4 bg-gradient-to-r from-[#FF5A1F] to-[#d93d0b] text-white font-bold rounded-2xl hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isCompletingWeek ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving Progress...</span>
                </>
              ) : (
                <>
                  <span>Mark Week as Complete</span>
                  <FaRocket className="text-xl" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
