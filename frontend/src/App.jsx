import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, PrivateRoute, useAuth } from './context/AuthContext';

function RootRedirect() {
  const { user } = useAuth();
  return <Navigate to={user?.role === 'admin' ? '/admin/clients' : '/clients'} replace />;
}
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SelectionTrackerPage from './pages/SelectionTrackerPage';
import LocalDatabasePage from './pages/LocalDatabasePage';
import ReportsPage from './pages/ReportsPage';
import Roles from './pages/Roles';
import Candidates from './pages/Candidates';
import CandidateForm from './pages/CandidateForm';
import AdminClients from './pages/admin/AdminClients';
import AdminRoles from './pages/admin/AdminRoles';
import AdminLocations from './pages/admin/AdminLocations';
import AdminUsers from './pages/admin/AdminUsers';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<RootRedirect />} />
            <Route path="clients" element={<Dashboard />} />
            <Route path="selection-tracker" element={<SelectionTrackerPage />} />
            <Route path="local-database" element={<LocalDatabasePage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="clients/:clientId/roles" element={<Roles />} />
            <Route path="clients/:clientId/roles/:roleId/candidates" element={<Candidates />} />
            <Route path="clients/:clientId/roles/:roleId/candidates/add" element={<CandidateForm />} />
            <Route path="clients/:clientId/roles/:roleId/candidates/:candidateId/edit" element={<CandidateForm />} />
            <Route path="admin/clients" element={<PrivateRoute adminRequired><AdminClients /></PrivateRoute>} />
            <Route path="admin/roles" element={<PrivateRoute adminRequired><AdminRoles /></PrivateRoute>} />
            <Route path="admin/locations" element={<PrivateRoute adminRequired><AdminLocations /></PrivateRoute>} />
            <Route path="admin/users" element={<PrivateRoute adminRequired><AdminUsers /></PrivateRoute>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
