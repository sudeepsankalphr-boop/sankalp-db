import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ToastProvider } from './Toast';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const adminLinkClass = ({ isActive }) =>
    `px-2.5 py-1 rounded text-xs font-medium ${isActive ? 'bg-gray-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`;

  return (
    <ToastProvider>
      <div className="flex flex-col h-screen">
        <header className="bg-gray-800 text-white flex items-center justify-between px-6 py-3 flex-shrink-0">
          <span className="text-lg font-bold tracking-wide">Sankalp Database</span>
          <div className="flex items-center gap-4 text-sm">
            {user?.role === 'admin' && (
              <nav className="flex items-center gap-1">
                <span className="text-gray-500 text-xs mr-1">Admin:</span>
                <NavLink to="/admin/clients"   className={adminLinkClass}>Clients</NavLink>
                <NavLink to="/admin/roles"     className={adminLinkClass}>Roles</NavLink>
                <NavLink to="/admin/locations" className={adminLinkClass}>Locations</NavLink>
                <NavLink to="/admin/users"     className={adminLinkClass}>Users</NavLink>
              </nav>
            )}
            <span className="text-gray-300">{user?.name} ({user?.role})</span>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded bg-gray-600 hover:bg-gray-500 text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-white">
          <Outlet />
        </main>
      </div>
    </ToastProvider>
  );
}
