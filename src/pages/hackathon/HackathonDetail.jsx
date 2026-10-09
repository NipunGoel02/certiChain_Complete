// pages/hackathon/HackathonDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const HackathonDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hackathon, setHackathon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchHackathon = async () => {
      try {
        setLoading(true);
        // **********************************************
        // RESTORING YOUR ORIGINAL LOGIC FOR DATA FETCHING
        // **********************************************
        const response = await axios.get(`https://nft-project-2y3b.onrender.com/api/hackathons/${id}`);
        setHackathon(response.data);

        // Check if user is registered
        const token = localStorage.getItem('token');
        const userResponse = await axios.get('https://nft-project-2y3b.onrender.com/api/auth/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        // Debug logs (kept for reference, can be removed in production)
        console.log('Hackathon participants:', response.data.participants);
        console.log('Current user ID:', userResponse.data._id);
        
        const userId = userResponse.data._id;
        const userRole = userResponse.data.role;
        setUserRole(userRole);
        
        const participants = response.data.participants || [];
        const registered = participants.some(p => {
          if (typeof p === 'string') {
            return p === userId;
          } else if (p && typeof p === 'object' && p._id) {
            return p._id === userId;
          }
          return false; // Added default return for safety
        });
        console.log('Is user registered:', registered);
        setIsRegistered(registered);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching hackathon:', error);
        setError('Failed to load hackathon details');
        setLoading(false);
      }
    };

    fetchHackathon();
  }, [id]);

  const handleRegister = async () => {
    try {
      // **********************************************
      // LOGIC PRESERVED FROM YOUR ORIGINAL CODE
      // **********************************************
      const token = localStorage.getItem('token');
      await axios.post(`https://nft-project-2y3b.onrender.com/api/hackathons/${id}/register`, null, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setIsRegistered(true);
      alert('Successfully registered for the hackathon!'); // Reverted to alert as per original
    } catch (error) {
      if (error.response && error.response.status === 400 && error.response.data.message === 'User already registered') {
        alert('You are already registered for this hackathon.'); // Reverted to alert as per original
        setIsRegistered(true);
      } else {
        console.error('Error registering for hackathon:', error);
        alert('Failed to register for hackathon. Please try again.'); // Reverted to alert as per original
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const tabContentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 to-primary-700 flex justify-center items-center font-sans">
        <div className="relative w-24 h-24">
          <div className="absolute top-0 left-0 w-full h-full border-8 border-primary-200 rounded-full animate-ping"></div>
          <div className="absolute top-0 left-0 w-full h-full border-8 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error || !hackathon) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 to-primary-700 flex justify-center items-center font-sans">
        <div className="container mx-auto px-8 py-16">
          <div className="bg-white rounded-3xl shadow-4xl p-10 max-w-2xl mx-auto border border-primary-200 text-center">
            <svg className="w-20 h-20 text-accent-500 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h2 className="text-3xl font-bold text-secondary-900 mb-4">Oops! Something went wrong</h2>
            <p className="text-secondary-700 mb-8">{error || 'Hackathon not found'}</p>
            <Link
              to="/hackathons"
              className="inline-block px-8 py-4 bg-certi-gradient-purple text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
            >
              Back to Hackathons
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-br from-primary-900 to-primary-700 font-sans text-secondary-100"
    >
      {/* Hero/Banner Section */}
      <div className="h-80 md:h-[500px] bg-certi-gradient-dark-purple relative overflow-hidden flex items-center justify-center">
        {hackathon.banner ? (
          <img src={hackathon.banner} alt={hackathon.title} className="w-full h-full object-cover opacity-80" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-5xl md:text-7xl font-extrabold text-white px-6 text-center z-10 drop-shadow-lg">
              {hackathon.title}
            </h1>
            {/* Abstract background shapes */}
            <div className="absolute inset-0">
              <svg className="w-full h-full text-primary-500 opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="currentColor" />
                <path d="M0,0 L100,0 L50,100 Z" fill="currentColor" />
                <circle cx="80" cy="20" r="15" fill="currentColor" />
                <circle cx="20" cy="80" r="10" fill="currentColor" />
              </svg>
            </div>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary-900 to-transparent"></div> {/* Deeper gradient overlay */}
      </div>

      {/* Main Content Area - Overlapping the banner */}
      <div className="container mx-auto px-8 -mt-24 relative z-20"> {/* Increased negative margin and z-index */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="bg-white rounded-3xl shadow-4xl overflow-hidden border border-primary-200 p-10 md:p-16"
        >
          {/* Main Title and Action Buttons */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-8">
            <div className="flex-1">
              <div className="flex items-center mb-5">
                <span className={`px-5 py-2 rounded-full text-base font-semibold mr-5 shadow-md uppercase tracking-wide ${
                  hackathon.status === 'active' ? 'bg-primary-100 text-primary-800' :
                  hackathon.status === 'upcoming' ? 'bg-accent-100 text-accent-800' :
                  'bg-secondary-100 text-secondary-800'
                }`}>
                  {hackathon.status.charAt(0).toUpperCase() + hackathon.status.slice(1)}
                </span>
                <span className="text-secondary-600 text-lg flex items-center">
                  <svg className="w-5 h-5 mr-2 text-primary-500" fill="currentColor" viewBox="0 0 24 24"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                  <span className="font-bold">{hackathon.participants?.length || 0}</span> Participants
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold text-secondary-900 mb-5 leading-tight">{hackathon.title}</h1>
              <p className="text-secondary-700 text-xl max-w-5xl leading-relaxed">{hackathon.description}</p>
            </div>

            <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-4">
              {isRegistered ? (
                <>
                  <Link
                    to={`/hackathons/${id}/submit`}
                    className="bg-certi-gradient-purple text-white font-bold py-4 px-8 rounded-full text-center shadow-lg hover:shadow-xl transition-all duration-300 text-lg uppercase transform hover:scale-105"
                  >
                    Submit Project
                  </Link>
                  {hackathon.isTeamEvent && (
                    <Link
                      to={`/hackathons/${id}/team`}
                      className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-4 px-8 rounded-full text-center shadow-md hover:shadow-lg transition-all duration-300 text-lg uppercase transform hover:scale-105"
                    >
                      Manage Team
                    </Link>
                  )}
                </>
              ) : (
                <button
                  onClick={handleRegister}
                  className="bg-certi-gradient-purple text-white font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 w-full text-lg uppercase transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={hackathon.status !== 'upcoming' && hackathon.status !== 'active' || userRole === 'admin' || userRole === 'hackathon organizer'}
                  title={userRole === 'admin' || userRole === 'hackathon organizer' ? 'Admins and Hackathon Organizers cannot register' : ''}
                >
                  Register for Hackathon
                </button>
              )}
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="border-b border-secondary-200 mt-12 mb-10">
            <nav className="flex space-x-8 overflow-x-auto hide-scrollbar">
              {['overview', 'timeline', 'rules', 'prizes', 'judging'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-4 font-bold text-lg whitespace-nowrap transition-all duration-300 relative group ${
                    activeTab === tab
                      ? 'border-primary-600 text-primary-700'
                      : 'border-transparent text-secondary-600 hover:text-primary-600'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1).replace(/([A-Z])/g, ' $1').trim()}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeHackathonTabIndicator"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-t-full"
                    />
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="space-y-10"
              >
                <h2 className="text-3xl md:text-4xl font-extrabold text-secondary-900 mb-6">About This Hackathon</h2>
                <p className="text-secondary-700 text-lg leading-relaxed">{hackathon.longDescription}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <motion.div variants={cardVariants} initial="hidden" animate="visible" className="bg-primary-50 rounded-2xl p-8 shadow-lg border border-primary-100">
                    <h3 className="font-bold text-xl text-secondary-900 mb-5 flex items-center">
                      <svg className="w-6 h-6 mr-3 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      Key Dates
                    </h3>
                    <div className="space-y-4 text-secondary-700">
                      <div>
                        <p className="text-sm text-secondary-500">Registration Start</p>
                        <p className="font-medium text-lg">{formatDate(hackathon.startDate)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-secondary-500">Submission Deadline</p>
                        <p className="font-medium text-lg">{formatDate(hackathon.submissionDeadline)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-secondary-500">Event End</p>
                        <p className="font-medium text-lg">{formatDate(hackathon.endDate)}</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div variants={cardVariants} initial="hidden" animate="visible" className="bg-primary-50 rounded-2xl p-8 shadow-lg border border-primary-100">
                    <h3 className="font-bold text-xl text-secondary-900 mb-5 flex items-center">
                      <svg className="w-6 h-6 mr-3 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                        Team Info
                      </h3>
                      <div className="space-y-4 text-secondary-700">
                        <div>
                          <p className="text-sm text-secondary-500">Team Event</p>
                          <p className="font-medium text-lg">{hackathon.isTeamEvent ? 'Yes' : 'No'}</p>
                        </div>
                        {hackathon.isTeamEvent && (
                          <>
                            <div>
                              <p className="text-sm text-secondary-500">Min Team Size</p>
                              <p className="font-medium text-lg">{hackathon.minTeamSize}</p>
                            </div>
                            <div>
                              <p className="text-sm text-secondary-500">Max Team Size</p>
                              <p className="font-medium text-lg">{hackathon.maxTeamSize}</p>
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>

                    <motion.div variants={cardVariants} initial="hidden" animate="visible" className="bg-primary-50 rounded-2xl p-8 shadow-lg border border-primary-100">
                      <h3 className="font-bold text-xl text-secondary-900 mb-5 flex items-center">
                        <svg className="w-6 h-6 mr-3 text-primary-600" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Participation
                      </h3>
                      <div className="space-y-4 text-secondary-700">
                        <div>
                          <p className="text-sm text-secondary-500">Current Participants</p>
                          <p className="font-medium text-lg">{hackathon.participants?.length || 0}</p>
                        </div>
                        <div>
                          <p className="text-sm text-secondary-500">Total Submissions</p>
                          <p className="font-medium text-lg">{hackathon.submissions?.length || 0}</p>
                        </div>
                        <div>
                          <p className="text-sm text-secondary-500">Status</p>
                          <p className="font-medium text-lg capitalize">{hackathon.status}</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'timeline' && (
                <motion.div
                  key="timeline"
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="bg-white p-10 rounded-2xl shadow-lg border border-primary-100"
                >
                  <h3 className="text-3xl font-bold text-secondary-900 mb-8">Event Timeline</h3>

                  <div className="relative border-l-4 border-primary-200 pl-10 ml-6 space-y-12">
                    <div className="relative">
                      <div className="absolute -left-8 -top-2 h-8 w-8 rounded-full border-4 border-primary-500 bg-white flex items-center justify-center shadow-md">
                        <div className="h-4 w-4 rounded-full bg-primary-500"></div>
                      </div>
                      <h4 className="text-xl font-bold text-secondary-900">Registration Opens</h4>
                      <p className="text-secondary-700 text-lg">{formatDate(hackathon.startDate)}</p>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-8 -top-2 h-8 w-8 rounded-full border-4 border-primary-500 bg-white flex items-center justify-center shadow-md">
                        <div className="h-4 w-4 rounded-full bg-primary-500"></div>
                      </div>
                      <h4 className="text-xl font-bold text-secondary-900">Submission Deadline</h4>
                      <p className="text-secondary-700 text-lg">{formatDate(hackathon.submissionDeadline)}</p>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-8 -top-2 h-8 w-8 rounded-full border-4 border-primary-500 bg-white flex items-center justify-center shadow-md">
                        <div className="h-4 w-4 rounded-full bg-primary-500"></div>
                      </div>
                      <h4 className="text-xl font-bold text-secondary-900">Judging Period</h4>
                      <p className="text-secondary-700 text-lg">
                        {formatDate(hackathon.submissionDeadline)} - {formatDate(hackathon.endDate)}
                      </p>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-8 -top-2 h-8 w-8 rounded-full border-4 border-primary-500 bg-white flex items-center justify-center shadow-md">
                        <div className="h-4 w-4 rounded-full bg-primary-500"></div>
                      </div>
                      <h4 className="text-xl font-bold text-secondary-900">Results Announcement</h4>
                      <p className="text-secondary-700 text-lg">{formatDate(hackathon.endDate)}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'rules' && (
                <motion.div
                  key="rules"
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="bg-white p-10 rounded-2xl shadow-lg border border-primary-100"
                >
                  <h3 className="text-3xl font-bold text-secondary-900 mb-8">Rules & Guidelines</h3>

                  <ul className="space-y-4 list-disc pl-8 text-secondary-700 text-lg">
                    {hackathon.rules?.map((rule, index) => (
                      <li key={index}>{rule}</li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {activeTab === 'prizes' && (
                <motion.div
                  key="prizes"
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="bg-white p-10 rounded-2xl shadow-lg border border-primary-100"
                >
                  <h3 className="text-3xl font-bold text-secondary-900 mb-8">Prizes</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {hackathon.prizes?.map((prize, index) => (
                      <div key={index} className="bg-primary-50 p-8 rounded-2xl shadow-md border border-primary-100 text-center">
                        <h4 className="font-bold text-primary-800 text-2xl mb-3">{prize.rank}</h4>
                        <p className="text-secondary-700 text-lg mb-3">{prize.prize}</p>
                        {prize.amount > 0 && (
                          <p className="text-primary-600 font-extrabold text-3xl">${prize.amount}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'judging' && (
                <motion.div
                  key="judging"
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="bg-white p-10 rounded-2xl shadow-lg border border-primary-100"
                >
                  <h3 className="text-3xl font-bold text-secondary-900 mb-8">Judging Criteria</h3>

                  <div className="space-y-6">
                    {hackathon.judgingCriteria?.map((criteria, index) => (
                      <div key={index} className="border-b border-secondary-100 pb-6 last:border-b-0 last:pb-0">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-bold text-xl text-secondary-900">{criteria.name}</h4>
                          <span className="bg-primary-100 text-primary-800 px-3 py-1.5 rounded-full text-sm font-semibold">
                            {criteria.weightage}/10
                          </span>
                        </div>
                        {criteria.description && (
                          <p className="text-secondary-700 text-lg leading-relaxed">{criteria.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default HackathonDetails;
