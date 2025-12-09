import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Ranking from './pages/Ranking';
import TeacherPanel from './pages/TeacherPanel';
import News from './pages/News';
import StudentAnalysis from './pages/StudentAnalysis';
import Resources from './pages/Resources';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/ranking" 
            element={
              <ProtectedRoute>
                <Ranking />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/teacher" 
            element={
              <ProtectedRoute requireRole="teacher">
                <TeacherPanel />
              </ProtectedRoute>
            } 
          />

<Route path="/teacher/student/:email" element={
  <ProtectedRoute requireRole="teacher">
    <StudentAnalysis />
  </ProtectedRoute>
} />

<Route path="/resources" element={
  <ProtectedRoute>
    <Resources />
  </ProtectedRoute>
} />

          
      <Route 
  path="/news" 
  element={
    <ProtectedRoute>
      <News />
    </ProtectedRoute>
  } 
/>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;