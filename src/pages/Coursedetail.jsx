import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getCourseById, enrollInCourse } from '../services/courseService'; // Using your original imports
import { useAuth } from '../Context/AuthContext'; // Using your original imports

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { currentUser, fetchUserProfile } = useAuth(); // Using your original AuthContext usage
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        // **********************************************
        // LOGIC PRESERVED FROM YOUR ORIGINAL CODE
        // **********************************************
        const data = await getCourseById(courseId);
        setCourse(data);

        // Check if user is enrolled based on currentUser.enrolledCourses
        const enrolled = currentUser?.enrolledCourses?.includes(courseId);
        setIsEnrolled(enrolled || false);
      } catch (err) {
        setError('Failed to load course details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();

    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, [courseId, currentUser, getCourseById]); // Added getCourseById to dependency array for completeness

  const handleEnroll = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    try {
      setEnrolling(true);
      const token = localStorage.getItem('token');
      await enrollInCourse(courseId, token);
      await fetchUserProfile(token);
      setIsEnrolled(true);
      setEnrolling(false);
    } catch (error) {
      console.error("Error enrolling:", error);
      setEnrolling(false);
      setError("Failed to enroll in course."); // Added error setting for enrollment
    }
  }

  // Animation variants for content sections
  const contentSectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 to-primary-700 flex items-center justify-center font-sans text-primary-100">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 to-primary-700 flex items-center justify-center font-sans text-primary-100">
        <div className="text-center max-w-md mx-auto p-10 bg-white rounded-3xl shadow-4xl border border-primary-200">
          <svg className="w-20 h-20 text-accent-500 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h2 className="text-3xl font-bold text-secondary-900 mb-4">Oops! Something went wrong</h2>
          <p className="text-secondary-700 mb-8">{error || 'Course not found'}</p>
          <Link
            to="/courses"
            className="inline-block px-8 py-4 bg-certi-gradient-purple text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
          >
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen bg-gradient-to-br from-primary-900 to-primary-700 font-sans text-secondary-100"
    >
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-700 to-primary-900 text-white py-20 md:py-28 relative overflow-hidden">
        {/* Background blobs for dynamism */}
        <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-primary-500 rounded-full mix-blend-screen opacity-20 animate-pulse-bg"></div>
        <div className="absolute bottom-1/3 right-1/4 w-60 h-60 bg-accent-500 rounded-full mix-blend-screen opacity-20 animate-pulse-bg animation-delay-1000"></div>

        <div className="container mx-auto px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-6xl mx-auto"
          >
            <div className="flex flex-col lg:flex-row gap-12 items-center">
              <div className="lg:w-2/3 text-center lg:text-left">
                <h1 className="text-4xl   text-white md:text-6xl font-extrabold mb-5 leading-tight">{course.title}</h1>
                <p className="text-primary-100 text-xl md:text-2xl mb-8 leading-relaxed">{course.description}</p>

                <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-10">
                  <div className="bg-primary-600/30 backdrop-blur-sm px-5 py-3 rounded-full flex items-center text-primary-100 font-medium text-lg">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>{course.duration}</span>
                  </div>
                  <div className="bg-primary-600/30 backdrop-blur-sm px-5 py-3 rounded-full flex items-center text-primary-100 font-medium text-lg">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                    </svg>
                    <span>{course.lessonCount} lessons</span>
                  </div>
                  <div className="bg-primary-600/30 backdrop-blur-sm px-5 py-3 rounded-full flex items-center text-primary-100 font-medium text-lg">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                    </svg>
                    <span>{course.level}</span>
                  </div>
                </div>

                {isEnrolled ? (
                  <Link
                    to={`/courses/${courseId}/learn`}
                    className="inline-block"
                  >
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)' }}
                      whileTap={{ scale: 0.95 }}
                      className="px-10 py-4 bg-white text-primary-600 font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-xl tracking-wide uppercase"
                    >
                      Continue Learning
                    </motion.button>
                  </Link>
                ) : (
                  <>
                    {currentUser?.role !== 'admin' ? (
                      <motion.button
                        whileHover={{ scale: 1.05, boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleEnroll}
                        disabled={enrolling}
                        className="px-10 py-4 bg-certi-gradient-purple text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-xl tracking-wide uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {enrolling ? (
                          <>
                            <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></span>
                            Enrolling...
                          </>
                        ) : (
                          'Enroll Now'
                        )}
                      </motion.button>
                    ) : (
                      <p className="text-primary-200 font-medium text-lg">Admins cannot enroll in courses.</p>
                    )}
                  </>
                )}
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="lg:w-1/3 relative flex justify-center"
              >
                <div className="relative w-full max-w-xs md:max-w-sm aspect-square rounded-3xl overflow-hidden shadow-4xl border-4 border-primary-400">
                  <img
                    src={course.thumbnail || 'https://placehold.co/600x400/A775E5/FBF8FF?text=Course+Thumbnail'}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Subtle overlay for visual depth */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                </div>
                {/* Decorative blobs */}
                <div className="absolute -top-8 -left-8 w-24 h-24 bg-accent-400 rounded-full mix-blend-screen opacity-20 blur-xl animate-pulse-bg"></div>
                <div className="absolute -bottom-8 -right-8 w-28 h-28 bg-primary-400 rounded-full mix-blend-screen opacity-20 blur-xl animate-pulse-bg animation-delay-1000"></div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Course Content - Tabs & Details */}
      <div className="container mx-auto px-8 py-16">
        <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-4xl border border-primary-200 p-8 md:p-12">
          {/* Tabs */}
          <div className="mb-10 border-b border-secondary-200">
            <div className="flex overflow-x-auto hide-scrollbar">
              {['overview', 'curriculum', 'instructor', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 font-bold text-lg transition-all duration-300 whitespace-nowrap relative group ${
                    activeTab === tab
                      ? 'text-primary-600 border-b-4 border-primary-600'
                      : 'text-secondary-600 hover:text-primary-600'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-t-full"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                variants={contentSectionVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <h2 className="text-3xl font-bold text-secondary-900 mb-6">About This Course</h2>
                <p className="text-secondary-700 text-lg mb-8 leading-relaxed">{course.longDescription || course.description}</p>

                <div className="bg-primary-50 rounded-2xl shadow-lg p-8 mb-10 border border-primary-100">
                  <h3 className="text-2xl font-bold text-secondary-800 mb-5">What You'll Learn</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {course.outcomes?.map((outcome, index) => (
                      <div key={index} className="flex items-start">
                        <svg className="w-6 h-6 text-primary-500 mt-1 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 12l2 2 4-4m6.782-6.162a4.5 4.5 0 00-1.946-.806 4.5 4.5 0 01-4.438 0 4.5 4.5 0 00-1.946.806 4.5 4.5 0 01-3.138 3.138 4.5 4.5 0 00-.806 1.946 4.5 4.5 0 010 4.438 4.5 4.5 0 00.806 1.946 4.5 4.5 0 013.138 3.138 4.5 4.5 0 001.946.806 4.5 4.5 0 014.438 0 4.5 4.5 0 001.946-.806 4.5 4.5 0 013.138-3.138 4.5 4.5 0 00.806-1.946 4.5 4.5 0 010-4.438 4.5 4.5 0 00-.806-1.946 4.5 4.5 0 01-3.138-3.138z" />
                        </svg>
                        <span className="text-secondary-700 text-lg">{outcome}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-primary-50 rounded-2xl shadow-lg p-8 border border-primary-100">
                  <h3 className="text-2xl font-bold text-secondary-800 mb-5">Requirements</h3>
                  <ul className="space-y-3">
                    {course.requirements?.map((requirement, index) => (
                      <li key={index} className="flex items-start">
                        <svg className="w-6 h-6 text-primary-500 mt-1 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                        <span className="text-secondary-700 text-lg">{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}

            {activeTab === 'curriculum' && (
              <motion.div
                key="curriculum"
                variants={contentSectionVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <h2 className="text-3xl font-bold text-secondary-900 mb-6">Course Curriculum</h2>
                <p className="text-secondary-700 text-lg mb-8">
                  <span className="font-semibold">{course.lessonCount} lessons</span> • <span className="font-semibold">{course.duration}</span> total length
                </p>

                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-primary-100">
                  {course.sections?.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="border-b border-primary-100 last:border-b-0">
                      <div className="p-6 bg-primary-50 flex justify-between items-center">
                        <h3 className="font-bold text-xl text-secondary-800">
                          Section {sectionIndex + 1}: {section.title}
                        </h3>
                        <span className="text-base text-secondary-600">{section.duration}</span>
                      </div>
                      <div>
                        {section.lessons.map((lesson, lessonIndex) => (
                          <div
                            key={lessonIndex}
                            className="p-5 border-t border-secondary-100 flex justify-between items-center hover:bg-primary-50 transition-colors duration-300"
                          >
                            <div className="flex items-center">
                              {lesson.type === 'video' ? (
                                <svg className="w-6 h-6 text-primary-500 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                              ) : lesson.type === 'quiz' ? (
                                <svg className="w-6 h-6 text-accent-500 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                              ) : (
                                <svg className="w-6 h-6 text-primary-400 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                              )}
                              <span className="text-secondary-700 text-lg">{lesson.title}</span>
                            </div>
                            <span className="text-base text-secondary-500">{lesson.duration}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {!isEnrolled && (
                  <div className="mt-10 text-center">
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)' }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleEnroll}
                      disabled={enrolling}
                      className="px-10 py-5 bg-certi-gradient-purple text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-xl tracking-wide uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {enrolling ? (
                        <>
                          <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></span>
                          Enrolling...
                        </>
                      ) : (
                        'Enroll Now'
                      )}
                    </motion.button>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'instructor' && (
              <motion.div
                key="instructor"
                variants={contentSectionVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <h2 className="text-3xl font-bold text-secondary-900 mb-8">Meet Your Instructor</h2>

                <div className="bg-primary-50 rounded-2xl shadow-lg p-8 border border-primary-100">
                  <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                    <div className="md:w-1/4 flex-shrink-0">
                      <img
                        src={course.instructor?.avatar || 'https://placehold.co/150x150/A775E5/FBF8FF?text=Instructor'}
                        alt={course.instructor?.name || 'Instructor Avatar'}
                        className="w-40 h-40 rounded-full object-cover mx-auto md:mx-0 border-4 border-primary-500 shadow-md"
                      />
                    </div>
                    <div className="md:w-3/4 text-center md:text-left">
                      <h3 className="text-3xl font-bold text-secondary-900 mb-2">{course.instructor?.name || 'Instructor Name'}</h3>
                      <p className="text-primary-600 font-semibold text-xl mb-5">{course.instructor?.title || 'Instructor Title'}</p>
                      <p className="text-secondary-700 text-lg mb-6 leading-relaxed">{course.instructor?.bio || 'Instructor bio information would go here. This would include their background, expertise, and teaching experience. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'}</p>

                      <div className="flex justify-center md:justify-start items-center space-x-6">
                        {/* Social media icons - using Lucide React for modern icons */}
                        {/* You would need to install lucide-react: npm install lucide-react */}
                        {/* For this example, I'll use placeholder SVGs */}
                        {['twitter', 'linkedin', 'github'].map(platform => (
                          <a
                            key={platform}
                            href="#"
                            className="text-secondary-500 hover:text-primary-600 transition-colors duration-300 transform hover:scale-110"
                          >
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              {platform === 'twitter' && <path d="M22.46 6c-.8.36-1.64.6-2.52.7.92-.55 1.62-1.4 1.96-2.4-.87.52-1.83.9-2.85 1.1-.82-.88-2-1.43-3.3-1.43-2.5 0-4.55 2.05-4.55 4.55 0 .35.04.68.12 1-.38-.02-.75-.08-1.12-.18-3.78-.19-7.13-2.02-9.37-4.75-.4.68-.63 1.47-.63 2.3 0 1.58.8 2.97 2.02 3.78-.74-.02-1.44-.23-2.05-.56v.05c0 2.2 1.56 4.03 3.63 4.45-.38.1-.78.15-1.18.15-.29 0-.58-.03-.86-.08.58 1.8 2.26 3.1 4.25 3.13-1.55 1.22-3.5 1.95-5.63 1.95-.36 0-.7-.02-1.05-.06 2 1.28 4.38 2.04 6.9 2.04 8.28 0 12.83-6.86 12.83-12.83 0-.2-.01-.4-.02-.6.88-.63 1.64-1.42 2.25-2.32z" />}
                              {platform === 'linkedin' && <path d="M20.447 20.452h-3.554v-5.564c0-1.31-.028-2.993-1.829-2.993-1.831 0-2.112 1.432-2.112 2.909v5.648h-3.554v-11.99h3.411v1.565h.05c.472-.89 1.625-1.829 3.369-1.829 3.606 0 4.275 2.37 4.275 5.46v6.294zM4.653 6.275c-1.196 0-2.163-.96-2.163-2.148 0-1.188.967-2.148 2.163-2.148 1.196 0 2.163.96 2.163 2.148 0 1.188-.967 2.148-2.163 2.148zm1.777 14.177h-3.554v-11.99h3.554v11.99z" />}
                              {platform === 'github' && <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.799 8.205 11.385.6.113.82-.258.82-.577 0-.285-.011-1.04-.016-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.334-1.756-1.334-1.756-1.09-.745.083-.73.083-.73 1.205.085 1.838 1.238 1.838 1.238 1.07 1.835 2.809 1.305 3.492.998.108-.775.419-1.305.762-1.605-2.665-.3-5.466-1.333-5.466-5.93 0-1.31.465-2.382 1.235-3.22-.12-.3-.535-1.52.117-3.176 0 0 1-.322 3.3-.123 1.02-.283 2.09-.425 3.17-.425 1.08 0 2.15.142 3.17.425 2.3-.2 3.3.123 3.3.123.653 1.656.248 2.876.12 3.176.77.838 1.235 1.91 1.235 3.22 0 4.61-2.809 5.625-5.475 5.922.43.369.812 1.101.812 2.222 0 1.606-.015 2.897-.015 3.28 0 .319.219.69.825.575C20.565 21.801 24 17.309 24 12 24 5.373 18.627 0 12 0z" />}
                            </svg>
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'reviews' && (
              <motion.div
                key="reviews"
                variants={contentSectionVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-bold text-secondary-900">Student Reviews</h2>
                  <div className="flex items-center">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className="w-6 h-6 text-yellow-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                      ))}
                    </div>
                    <span className="ml-3 text-secondary-800 font-bold text-xl">4.8 out of 5</span>
                  </div>
                </div>

                <div className="space-y-8">
                  {[1, 2, 3].map((review) => (
                    <div key={review} className="bg-primary-50 rounded-2xl shadow-lg p-8 border border-primary-100">
                      <div className="flex justify-between mb-5">
                        <div className="flex items-center">
                          <img
                            src={`https://randomuser.me/api/portraits/men/${review + 10}.jpg`}
                            alt="Reviewer"
                            className="w-14 h-14 rounded-full mr-4 border-2 border-primary-300 object-cover"
                          />
                          <div>
                            <h4 className="font-bold text-xl text-secondary-900">John Doe {review}</h4>
                            <p className="text-sm text-secondary-500">2 weeks ago</p>
                          </div>
                        </div>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`w-5 h-5 ${star <= 5 ? 'text-yellow-400' : 'text-secondary-300'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                            </svg>
                          ))}
                        </div>
                      </div>
                      <h5 className="font-bold text-xl text-secondary-900 mb-3">Excellent Course! Highly Recommended.</h5>
                      <p className="text-secondary-700 leading-relaxed text-lg">This course exceeded my expectations. The content was well-structured, the instructor was knowledgeable, and the practical exercises were incredibly helpful. I feel much more confident in blockchain development now!</p>
                    </div>
                  ))}
                </div>

                <div className="mt-10 text-center">
                  <button className="px-8 py-4 bg-primary-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-lg hover:bg-primary-600">
                    Load More Reviews
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Related Courses */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            viewport={{ once: true, amount: 0.3 }}
            className="mt-16"
          >
            <h2 className="text-3xl font-bold text-secondary-900 mb-8">Related Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { id: 'related-1', title: 'Web3 Security Fundamentals', thumbnail: 'https://placehold.co/400x200/C9A7F0/4F2D78?text=Web3+Security' },
                { id: 'related-2', title: 'Decentralized Finance (DeFi) Explained', thumbnail: 'https://placehold.co/400x200/A775E5/4F2D78?text=DeFi+Course' },
                { id: 'related-3', title: 'Introduction to NFTs', thumbnail: 'https://placehold.co/400x200/8C5CC4/4F2D78?text=NFT+Intro' },
              ].map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * item.id }} // Staggered animation
                  viewport={{ once: true, amount: 0.3 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-primary-100"
                >
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="font-bold text-xl text-secondary-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-secondary-600 mb-4 line-clamp-2">Brief description of the related course goes here, enticing the user to click and learn more about this exciting topic.</p>
                    <Link
                      to={`/courses/${item.id}`}
                      className="text-primary-600 font-semibold hover:text-primary-800 transition-colors duration-300 flex items-center group"
                    >
                      View Course
                      <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseDetail;
