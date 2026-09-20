import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../authSlice';
import { 
  Code2, 
  BookOpen, 
  GraduationCap, 
  ShieldCheck, 
  LogOut, 
  Palette, 
  User, 
  CheckCircle2, 
  Flame,
  ChevronDown
} from 'lucide-react';

const THEMES = [
  { id: 'dark', label: 'Dark', bg: 'bg-[#1d232a]' },
  { id: 'night', label: 'Night', bg: 'bg-[#0f172a]' },
  { id: 'synthwave', label: 'Synthwave', bg: 'bg-[#1a103c]' },
  { id: 'dracula', label: 'Dracula', bg: 'bg-[#282a36]' },
  { id: 'cyberpunk', label: 'Cyberpunk', bg: 'bg-[#ffee00]' },
  { id: 'dim', label: 'Dim', bg: 'bg-[#2a303c]' },
  { id: 'luxury', label: 'Luxury', bg: 'bg-[#09090b]' },
  { id: 'nord', label: 'Nord', bg: 'bg-[#2e3440]' },
  { id: 'emerald', label: 'Emerald', bg: 'bg-[#66cc8a]' },
  { id: 'light', label: 'Light', bg: 'bg-[#ffffff]' }
];

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [currentTheme, setCurrentTheme] = useState(
    () => localStorage.getItem('codeforge_theme') || 'dark'
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('codeforge_theme', currentTheme);
  }, [currentTheme]);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const roleBadge = () => {
    if (user?.role === 'admin') {
      return <span className="badge badge-error badge-xs font-semibold uppercase tracking-wider">Admin</span>;
    }
    if (user?.role === 'faculty') {
      return <span className="badge badge-warning badge-xs font-semibold uppercase tracking-wider">Faculty</span>;
    }
    return <span className="badge badge-primary badge-xs font-semibold uppercase tracking-wider">Student</span>;
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-base-100/80 border-b border-base-content/10 transition-colors">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo & Platform Name */}
        <div className="flex items-center gap-8">
          <NavLink to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
              <Code2 className="w-6 h-6 text-primary-content" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                CodeForge
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-widest text-base-content/50 -mt-1">
                IDE & Assessment
              </span>
            </div>
          </NavLink>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-primary/15 text-primary shadow-sm font-semibold'
                    : 'text-base-content/70 hover:text-base-content hover:bg-base-200/60'
                }`
              }
            >
              <BookOpen className="w-4 h-4" />
              <span>Problems</span>
            </NavLink>

            <NavLink
              to="/tests"
              className={({ isActive }) =>
                `px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-primary/15 text-primary shadow-sm font-semibold'
                    : 'text-base-content/70 hover:text-base-content hover:bg-base-200/60'
                }`
              }
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>My Tests</span>
            </NavLink>

            {(user?.role === 'faculty' || user?.role === 'admin') && (
              <NavLink
                to="/faculty"
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-warning/15 text-warning shadow-sm font-semibold'
                      : 'text-base-content/70 hover:text-base-content hover:bg-base-200/60'
                  }`
                }
              >
                <GraduationCap className="w-4 h-4" />
                <span>Faculty</span>
              </NavLink>
            )}

            {user?.role === 'admin' && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-error/15 text-error shadow-sm font-semibold'
                      : 'text-base-content/70 hover:text-base-content hover:bg-base-200/60'
                  }`
                }
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Studio</span>
              </NavLink>
            )}
          </nav>
        </div>

        {/* Right Section: Theme Selector & User Menu */}
        <div className="flex items-center gap-3">
          {/* Theme Switcher Dropdown */}
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-sm btn-square rounded-lg border border-base-content/10 hover:bg-base-200"
              title="Change Theme"
            >
              <Palette className="w-4 h-4 text-base-content/70" />
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content menu menu-sm bg-base-100 rounded-xl z-50 w-44 p-2 shadow-2xl border border-base-content/10 mt-2"
            >
              <li className="menu-title text-xs font-bold uppercase tracking-wider text-base-content/40 px-2 py-1">
                Themes
              </li>
              {THEMES.map((t) => (
                <li key={t.id}>
                  <button
                    onClick={() => setCurrentTheme(t.id)}
                    className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 ${
                      currentTheme === t.id ? 'active font-semibold' : ''
                    }`}
                  >
                    <span>{t.label}</span>
                    <span className={`w-3.5 h-3.5 rounded-full border border-base-content/20 ${t.bg}`} />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* User Profile Dropdown */}
          {user ? (
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="flex items-center gap-2.5 py-1.5 px-3 rounded-xl border border-base-content/10 bg-base-200/50 hover:bg-base-200 transition-all cursor-pointer select-none"
              >
                <div className="w-7 h-7 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                  {user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold leading-tight text-base-content">
                    {user?.firstName || 'Account'}
                  </span>
                  {roleBadge()}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-base-content/50" />
              </div>

              <ul
                tabIndex={0}
                className="dropdown-content menu menu-sm bg-base-100 rounded-xl z-50 w-56 p-2 shadow-2xl border border-base-content/10 mt-2"
              >
                <li className="px-3 py-2 border-b border-base-content/10 mb-1">
                  <div className="flex flex-col p-0 hover:bg-transparent">
                    <span className="text-xs font-bold text-base-content">{user?.firstName}</span>
                    <span className="text-[11px] text-base-content/50 truncate">{user?.emailId}</span>
                  </div>
                </li>
                <li>
                  <NavLink to="/profile" className="rounded-lg py-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-info" />
                    <span>My Profile</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/tests" className="rounded-lg py-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>My Assigned Tests</span>
                  </NavLink>
                </li>
                {(user?.role === 'faculty' || user?.role === 'admin') && (
                  <li>
                    <NavLink to="/faculty" className="rounded-lg py-2 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-warning" />
                      <span>Faculty Dashboard</span>
                    </NavLink>
                  </li>
                )}
                {user?.role === 'admin' && (
                  <li>
                    <NavLink to="/admin" className="rounded-lg py-2 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-error" />
                      <span>Admin Studio</span>
                    </NavLink>
                  </li>
                )}
                <div className="divider my-1"></div>
                <li>
                  <button
                    onClick={handleLogout}
                    className="rounded-lg py-2 text-error hover:bg-error/10 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <NavLink to="/login" className="btn btn-ghost btn-sm">
                Login
              </NavLink>
              <NavLink to="/signup" className="btn btn-primary btn-sm shadow-sm">
                Sign Up
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
