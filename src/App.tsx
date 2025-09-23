import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navigation } from './components/layout/navigation';
import { LandingPage } from './pages/landing';
import { LoginPage } from './pages/auth/login';
import { StudentDashboard } from './pages/student/dashboard';
import { StudentProfile } from './pages/student/profile';
import { ActivityDetail } from './pages/student/activity-detail';
import { CareerRecommendations } from './pages/student/career-recommendations';
import { Internships } from './pages/student/internships';
import { Applications } from './pages/student/applications';
import { AddActivityWizard } from './components/student/add-activity-wizard';
import { JudgeModePage } from './pages/demo/judge-mode';
import { MentorDashboard } from './pages/mentor/dashboard';
import { ReviewQueue } from './pages/mentor/review-queue';
import { ReviewDetail } from './pages/mentor/review-detail';
import { Announcements } from './pages/mentor/announcements';
import { Batches } from './pages/mentor/batches';
import { auth } from './lib/api';
import { User } from './types';
import { Button } from './components/ui/button';

// Admin imports
import { AdminDashboard } from './pages/admin/dashboard';
import { Institutions } from './pages/admin/institutions';
import AdminUsers from './pages/admin/users';
import { FraudAlerts } from './pages/admin/fraud-alerts';
import { Models } from './pages/admin/models';
import { Reports } from './pages/admin/reports';
import { AuditLogs } from './pages/admin/audit-logs';
import SystemSettings  from './pages/admin/settings';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [addActivityOpen, setAddActivityOpen] = useState(false);

  useEffect(() => {
    const currentUser = auth.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    auth.logout();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Navigation user={user} onLogout={handleLogout} />
        
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
            <Route path="/demo" element={<JudgeModePage />} />
            
            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                user ? (
                  user.role === 'student' ? (
                    <>
                      <StudentDashboard user={user} />
                      <AddActivityWizard 
                        isOpen={addActivityOpen}
                        onClose={() => setAddActivityOpen(false)}
                        studentId={user.id}
                      />
                    </>
                  ) : user.role === 'mentor' ? (
                    <MentorDashboard user={user} />
                  ) : (
                    user.role === 'admin' ? (
                      <AdminDashboard user={user} />
                    ) : (
                      <div className="text-center py-16">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard
                        </h2>
                        <p className="text-slate-600">
                          Welcome, {user.name}! Your {user.role} dashboard is under construction.
                        </p>
                      </div>
                    )
                  )
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            
            {/* Placeholder routes for other pages */}
            <Route
              path="/profile"
              element={
                user ? (
                  user.role === 'student' ? (
                    <StudentProfile user={user} />
                  ) : (
                    <div className="text-center py-16">
                      <h2 className="text-2xl font-bold text-slate-900 mb-4">Profile</h2>
                      <p className="text-slate-600">Profile page coming soon!</p>
                    </div>
                  )
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            
            {/* Student Routes */}
            <Route
              path="/student/activities/new"
              element={
                user && user.role === 'student' ? (
                  <>
                    <div className="text-center py-16">
                      <h2 className="text-2xl font-bold text-slate-900 mb-4">Add New Activity</h2>
                      <Button onClick={() => setAddActivityOpen(true)}>
                        Open Activity Wizard
                      </Button>
                    </div>
                    <AddActivityWizard 
                      isOpen={addActivityOpen}
                      onClose={() => setAddActivityOpen(false)}
                      studentId={user.id}
                    />
                  </>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            
            <Route
              path="/student/activities/:id"
              element={
                user && user.role === 'student' ? (
                  <ActivityDetail />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            
            <Route
              path="/student/career"
              element={
                user && user.role === 'student' ? (
                  <CareerRecommendations user={user} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            
            <Route
              path="/student/internships"
              element={
                user && user.role === 'student' ? (
                  <Internships user={user} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            
            <Route
              path="/student/applications"
              element={
                user && user.role === 'student' ? (
                  <Applications user={user} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            
            {/* Mentor Routes */}
            <Route
              path="/mentor/queue"
              element={
                user && user.role === 'mentor' ? (
                  <ReviewQueue user={user} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            
            <Route
              path="/mentor/review/:id"
              element={
                user && user.role === 'mentor' ? (
                  <ReviewDetail user={user} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            
            <Route
              path="/mentor/announcements"
              element={
                user && user.role === 'mentor' ? (
                  <Announcements user={user} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            
            <Route
              path="/mentor/batches"
              element={
                user && user.role === 'mentor' ? (
                  <Batches user={user} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            
            {/* Admin Routes */}
            <Route
              path="/admin/institutions"
              element={
                user && user.role === 'admin' ? (
                  <Institutions user={user} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            
            <Route
              path="/admin/users"
              element={
                user && user.role === 'admin' ? (
                  <AdminUsers user={user} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            
            <Route
              path="/admin/fraud-alerts"
              element={
                user && user.role === 'admin' ? (
                  <FraudAlerts user={user} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            
            <Route
              path="/admin/models"
              element={
                user && user.role === 'admin' ? (
                  <Models user={user} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            
            <Route
              path="/admin/reports"
              element={
                user && user.role === 'admin' ? (
                  <Reports user={user} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            
            <Route
              path="/admin/audit-logs"
              element={
                user && user.role === 'admin' ? (
                  <AuditLogs user={user} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            
            <Route
              path="/admin/settings"
              element={
                user && user.role === 'admin' ? (
                  <SystemSettings user={user} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            
            <Route
              path="/activities/*"
              element={
                user ? (
                  user.role === 'student' ? (
                    <Navigate to="/student/activities/new" />
                  ) : user.role === 'mentor' ? (
                    <Navigate to="/mentor/queue" />
                  ) : (
                    <div className="text-center py-16">
                      <h2 className="text-2xl font-bold text-slate-900 mb-4">Activities</h2>
                      <p className="text-slate-600">Activities management coming soon!</p>
                    </div>
                  )
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            
            <Route
              path="/career"
              element={
                user ? (
                  user.role === 'student' ? (
                    <Navigate to="/student/career" />
                  ) : (
                    <div className="text-center py-16">
                      <h2 className="text-2xl font-bold text-slate-900 mb-4">Career Recommendations</h2>
                      <p className="text-slate-600">Career insights coming soon!</p>
                    </div>
                  )
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;