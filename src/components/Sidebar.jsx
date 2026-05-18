import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authcontext';

const navItems = [
  { path: '/dashboard', icon: 'dashboard',      label: 'Dashboard'   },
  { path: '/review',    icon: 'rate_review',    label: 'Review'      },
  { path: '/issues',    icon: 'report_problem', label: 'Issues'      },
  { path: '/insights',  icon: 'auto_awesome',   label: 'AI Insights' },
  { path: '/settings',  icon: 'settings',       label: 'Settings'    },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <aside className="fixed left-0 top-0 h-screen flex flex-col p-4 z-50 bg-[#f6f2f6] w-64 rounded-r-[3rem] font-['Plus_Jakarta_Sans'] text-sm font-medium shadow-xl">

      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-8">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6750a5] to-[#bba2fd] flex items-center justify-center text-white shadow-lg">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: '20px' }}>auto_awesome</span>
        </div>
        <div>
          <h1 className="text-lg font-black text-[#6750a5]">WebInsight</h1>
          <p className="text-xs opacity-60">Design Review</p>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 space-y-1 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 px-6 py-4 rounded-full transition-all duration-300 active:scale-95 ${
                isActive
                  ? 'bg-gradient-to-br from-[#6750a5] to-[#bba2fd] text-white shadow-lg'
                  : 'text-[#323236] hover:bg-[#f0edf1] hover:translate-x-1'
              }`
            }
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User card + logout */}
      <div className="mt-auto px-2 space-y-2">
        {/* User info */}
        <div className="bg-[#eae7ec] rounded-3xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6750a5] to-[#bba2fd] flex items-center justify-center text-white font-bold text-sm shrink-0">
            {initials}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-sm font-bold truncate">{user?.name || 'User'}</p>
            <p className="text-xs opacity-60 truncate">{user?.email || ''}</p>
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-6 py-3 rounded-full text-[#605e63] hover:bg-[#f0edf1] hover:text-[#a8364b] transition-all duration-300 text-sm font-medium">
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>logout</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}