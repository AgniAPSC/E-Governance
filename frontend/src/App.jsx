import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

// Public pages
import LandingPage   from './pages/LandingPage'
import LoginPage     from './pages/LoginPage'
import RegisterPage  from './pages/RegisterPage'

// Citizen pages
import CitizenDashboard from './pages/citizen/CitizenDashboard'
import SubmitComplaint  from './pages/citizen/SubmitComplaint'
import ComplaintDetail  from './pages/citizen/ComplaintDetail'

// Officer pages
import OfficerDashboard       from './pages/officer/OfficerDashboard'
import OfficerComplaintDetail from './pages/officer/OfficerComplaintDetail'

// Admin pages
import AdminDashboard   from './pages/admin/AdminDashboard'
import AdminDepartments from './pages/admin/AdminDepartments'
import AdminOfficers    from './pages/admin/AdminOfficers'
import AdminReports     from './pages/admin/AdminReports'
import AdminDepartmentComplaints from './pages/admin/AdminDepartmentComplaints'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/"         element={<LandingPage />} />
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Citizen */}
          <Route path="/citizen/dashboard" element={
            <ProtectedRoute role="citizen"><CitizenDashboard /></ProtectedRoute>
          }/>
          <Route path="/citizen/submit" element={
            <ProtectedRoute role="citizen"><SubmitComplaint /></ProtectedRoute>
          }/>
          <Route path="/citizen/complaint/:id" element={
            <ProtectedRoute role="citizen"><ComplaintDetail /></ProtectedRoute>
          }/>

          {/* Officer */}
          <Route path="/officer/dashboard" element={
            <ProtectedRoute role="officer"><OfficerDashboard /></ProtectedRoute>
          }/>
          <Route path="/officer/complaint/:id" element={
            <ProtectedRoute role={['admin', 'officer']}><OfficerComplaintDetail /></ProtectedRoute>
          }/>

          {/* Admin */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
          }/>
          <Route path="/admin/departments" element={
            <ProtectedRoute role="admin"><AdminDepartments /></ProtectedRoute>
          }/>
          <Route path="/admin/departments/:id/complaints" element={
            <ProtectedRoute role="admin"><AdminDepartmentComplaints /></ProtectedRoute>
          }/>
          <Route path="/admin/officers" element={
            <ProtectedRoute role="admin"><AdminOfficers /></ProtectedRoute>
          }/>
          <Route path="/admin/reports" element={
            <ProtectedRoute role="admin"><AdminReports /></ProtectedRoute>
          }/>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
