import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './styles/preloader.css';
import { useState, useEffect } from 'react';
import AdminUsers from './pages/AdminUsers.jsx';

import Preloader from './components/PreLoaded.jsx';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Courses from './pages/Courses';
import CourseDetail from './pages/Coursedetail';
import CourseLearning from './pages/CourseLearning';
import Quiz from './pages/Quiz';
import Certificate from './pages/Certificate';
import { AuthProvider, useAuth } from './Context/AuthContext';
import PrivateRoute from './components/Auth/PrivateRoute';
import AdminRoute from './components/Auth/AdminRoute'; // New admin route component
import HackathonOrganizerRoute from './components/Auth/HackathonOrganizerRoute'; // New hackathon organizer route component
import InternshipOrganizerRoute from './components/Auth/InternshipOrganizerRoute'; // New internship organizer route component
import Profile from './pages/Profile';
import Login from './components/Auth/Login.jsx';
import Signup from './components/Auth/Signup';
import CoursePanel from './pages/CoursePanel';
import AdminLayout from './components/AdminLayout'; // New admin layout
import HackathonOrganizerLayout from './components/HackathonOrganizerLayout';
import AdminCourses from './pages/AdminCourse'; // Admin courses list
import CourseForm from './pages/CourseForm'; // Admin course form
import HackathonList from './pages/hackathon/HackathonList';
import HackathonDetail from './pages/hackathon/HackathonDetail';
import CreateHackathon from './pages/hackathon/CreateHackathon';
import SubmitProject from './pages/hackathon/SubmitProject';
import Layout from './Layout.jsx';
import TeamManagement from './pages/hackathon/TeamManagment.jsx';
import MyHackathons from './pages/hackathon/MyHackathons.jsx';
import Participants from './pages/hackathon/Participants.jsx';
import OrganizerSubmissions from './pages/hackathon/OrganizerSubmissions.jsx';
import OrganizerCertificates from './pages/hackathon/OrganizerCertificates.jsx';
import PendingInvitations from './pages/hackathon/PendingInvitations.jsx';
import HackathonCertificate from './pages/hackathon/HackathonCertificate.jsx';
import CreateInternship from './pages/internship/CreateInternship';
import InternshipOrganizerSubmissions from './pages/internship/OrganizerSubmissions';
import InternshipOrganizerCertificates from './pages/internship/OrganizerCertificates';
import InternshipPendingInvitations from './pages/internship/PendingInvitations';
import InternshipCertificate from './pages/internship/InternshipCertificate';
import MyInternships from './pages/internship/MyInternships';
import InternshipDetail from './pages/internship/InternshipDetail';
import InternshipOrganizerLayout from './components/InternshipOrganizerLayout';
import InternshipOverview from './pages/internship/InternshipOverview';
import InternshipAnalytics from './pages/internship/InternshipAnalytics';
import PublicProfile from './pages/PublicProfile.jsx';
import RecruiterRoute from './components/Auth/RecruiterRoute.jsx';
import RecruiterLayout from './components/RecruiterLayout.jsx';
import CandidateDirectory from './pages/recruiter/CandidateDirectory.jsx';
import RecruiterAnalytics from './pages/recruiter/RecruiterAnalytics.jsx';
import Assessments from './pages/recruiter/Assessments.jsx';
import WorkspaceEmptyRoute from './components/WorkspaceEmptyRoute.jsx';

import './App.css';

function OrganizerAwareChrome({ footer = false }) {
  const { pathname } = useLocation();
  const { currentUser } = useAuth();
  const isWorkspace = pathname.startsWith('/recruiter') || pathname.startsWith('/admin') ||
    pathname.startsWith('/organizer') ||
    (currentUser?.role === 'internship' && pathname.startsWith('/internships'));
  if (isWorkspace) return null;
  return footer ? <Footer /> : <><Navbar /><div style={{ height: '1px' }} /></>;
}

function App() {
   const [loading, setLoading] = useState(true);
   
  useEffect(() => {
    // Hide preloader after content loads
    window.addEventListener('load', () => {
      setTimeout(() => setLoading(false), 3000);
    });

        setTimeout(() => setLoading(false), 5000);
  }, []);
  return (
        <>
      {loading && <Preloader />}
<div
  className={`transition-opacity duration-1000 ${loading ? 'opacity-0' : 'opacity-100'}`}
>


    <BrowserRouter>
      <AuthProvider>
        <div className="cc-app">
          <OrganizerAwareChrome />

          <div className="cc-route-content">
            <Routes>
              {/* Public Routes */} 
               <Route element={<Layout />}></Route>
              <Route path="/" element={<Home />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:courseId" element={<CourseDetail />} />
               <Route path="/courses/:courseId/learn" element={<CourseLearning />} />
                  <Route path="/courses/:courseId/quiz" element={<Quiz />} />
                   <Route path="/certificates/:courseId" element={<Certificate />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/public-profile/:id" element={<PublicProfile />} />

              <Route element={<RecruiterRoute />}>
                <Route path="/recruiter" element={<RecruiterLayout />}>
                  <Route index element={<CandidateDirectory />} />
                  <Route path="analytics" element={<RecruiterAnalytics />} />
                  <Route path="assessments" element={<Assessments />} />
                </Route>
              </Route>

              {/* Authenticated User Routes */}
              <Route element={<PrivateRoute />}>
                <Route path="/profile" element={<Profile />} />
                <Route path="/course-panel" element={<CoursePanel />} />
                <Route path="/courses/:courseId/learn" element={<CourseLearning />} />
                <Route path="/courses/:courseId/quiz" element={<Quiz />} />
                <Route path="/certificates/:courseId" element={<Certificate />} />
                {/* Hackathon routes requiring authentication */}
                <Route path="/hackathons/:id/team" element={<TeamManagement />} />

                <Route path="/hackathons/:id/submit" element={<SubmitProject />} />
              </Route>

              {/* Public Hackathon Routes*/}
              <Route element={<HackathonOrganizerRoute />}>
                <Route path="/hackathons/create" element={<CreateHackathon />} />
                <Route path="/organizer" element={<HackathonOrganizerLayout />}>
                  <Route index element={<MyHackathons />} />
                  <Route path="my-hackathons" element={<MyHackathons />} />
                  <Route path="participants" element={<Participants />} />
                  <Route path="submissions" element={<OrganizerSubmissions />} />
                  <Route path="judging" element={<WorkspaceEmptyRoute kind="judging" />} />
                <Route path="certificates" element={<OrganizerCertificates />} />
                <Route path="analytics" element={<WorkspaceEmptyRoute kind="analytics" />} />
              
              </Route>
            </Route>
              <Route path="pending-invitations" element={<PendingInvitations />} />
              <Route path="/hackathons" element={<HackathonList />} />
              <Route path="/hackathons/:id" element={<HackathonDetail />} />
              <Route path="/hackathons/certificate/:hackathonId" element={<HackathonCertificate />} />

              {/* Internship Routes */}
              <Route element={<InternshipOrganizerRoute />}>
                <Route path="/internships" element={<InternshipOrganizerLayout />}>
                  <Route index element={<InternshipOverview />} />
                  <Route path="create" element={<CreateInternship />} />
                  <Route path="my-internships" element={<MyInternships />} />
                  <Route path="organizer/submissions" element={<InternshipOrganizerSubmissions />} />
                  <Route path="organizer/certificates" element={<InternshipOrganizerCertificates />} />
                  <Route path="pending-invitations" element={<InternshipPendingInvitations />} />
                  <Route path="analytics" element={<InternshipAnalytics />} />
                  <Route path="candidates" element={<Navigate to="/internships/my-internships" replace />} />
                  <Route path=":id" element={<InternshipDetail />} />
                </Route>
              </Route>
              <Route path="/internships/certificate/:internshipId" element={<InternshipCertificate />} />

              {/* Admin Routes */}
              <Route element={<AdminRoute />}>
       <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminCourses />} />
                  <Route path="courses" element={<AdminCourses />} />
                  <Route path="courses/new" element={<CourseForm />} />
                  <Route path="courses/edit/:id" element={<CourseForm />} />
                  <Route path="users" element={<AdminUsers />} />



                </Route>
              </Route>
            </Routes>
          </div>

          <OrganizerAwareChrome footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
    </div>
    </>
  );
}

export default App;
