import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import Login         from './pages/Login';
import Dashboard     from './pages/Dashboard';
import Masters       from './pages/masters/Masters';
import SeatMatrix    from './pages/seatMatrix/SeatMatrix';
import Applicants    from './pages/applicants/Applicants';
import ApplicantForm from './pages/applicants/ApplicantForm';
import Admissions    from './pages/admissions/Admissions';

// Smart home redirect based on role
const HomeRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admission_officer') return <Navigate to="/applicants" replace />;
  return <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>

          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Smart home redirect */}
          <Route path="/" element={<HomeRedirect />} />

          {/* Dashboard — Admin + Management ONLY */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['admin', 'management']}>
              <Layout><Dashboard /></Layout>
            </ProtectedRoute>
          }/>

          {/* Admin only */}
          <Route path="/masters" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout><Masters /></Layout>
            </ProtectedRoute>
          }/>

          {/* Admin + Admission Officer */}
          <Route path="/seat-matrix" element={
            <ProtectedRoute allowedRoles={['admin', 'admission_officer']}>
              <Layout><SeatMatrix /></Layout>
            </ProtectedRoute>
          }/>

          <Route path="/applicants" element={
            <ProtectedRoute allowedRoles={['admin', 'admission_officer']}>
              <Layout><Applicants /></Layout>
            </ProtectedRoute>
          }/>

          <Route path="/applicants/new" element={
            <ProtectedRoute allowedRoles={['admin', 'admission_officer']}>
              <Layout><ApplicantForm /></Layout>
            </ProtectedRoute>
          }/>

          <Route path="/admissions" element={
            <ProtectedRoute allowedRoles={['admin', 'admission_officer']}>
              <Layout><Admissions /></Layout>
            </ProtectedRoute>
          }/>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
