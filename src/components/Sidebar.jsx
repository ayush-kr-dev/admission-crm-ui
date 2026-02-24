import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Building2, Grid3X3,
  Users, GraduationCap, LogOut
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Nav items by role
  const navItems = [
  {
    to: '/dashboard', label: 'Dashboard',
    icon: <LayoutDashboard size={18} />,
    roles: ['admin', 'management']   
  },
  {
    to: '/masters', label: 'Masters Setup',
    icon: <Building2 size={18} />,
    roles: ['admin']
  },
  {
    to: '/seat-matrix', label: 'Seat Matrix',
    icon: <Grid3X3 size={18} />,
    roles: ['admin', 'admission_officer']
  },
  {
    to: '/applicants', label: 'Applicants',
    icon: <Users size={18} />,
    roles: ['admin', 'admission_officer']
  },
  {
    to: '/admissions', label: 'Admissions',
    icon: <GraduationCap size={18} />,
    roles: ['admin', 'admission_officer']
  },
];

  return (
    <div className="w-64 h-screen bg-gray-900 text-white flex flex-col fixed left-0 top-0">

      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold text-white">🎓 Admission CRM</h1>
        <p className="text-xs text-gray-400 mt-1 capitalize">{user?.role?.replace('_', ' ')}</p>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems
          .filter(item => item.roles.includes(user?.role))
          .map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all
                 ${isActive
                   ? 'bg-blue-600 text-white font-medium'
                   : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                 }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))
        }
      </nav>

      {/* User info + Logout */}
      <div className="p-4 border-t border-gray-700">
        <p className="text-sm text-gray-300 font-medium">{user?.name}</p>
        <p className="text-xs text-gray-500 mb-3">{user?.email}</p>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
