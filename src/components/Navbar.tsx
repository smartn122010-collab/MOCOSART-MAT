import React, { useState } from 'react';
import { 
  GraduationCap, 
  Menu, 
  X, 
  User as UserIcon, 
  LayoutDashboard, 
  ShieldCheck, 
  Info, 
  FileText,
  Shield,
  RefreshCw,
  ChevronDown,
  LogIn,
  LogOut,
  Sparkles
} from 'lucide-react';
import { UserProfile, CompanyInfo, isUserAdmin } from '../types';

interface NavbarProps {
  currentUser: UserProfile | null;
  companyInfo: CompanyInfo;
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenAuth: () => void;
  onOpenAboutUs: () => void;
  onOpenPolicy: (type: 'terms' | 'privacy' | 'refund') => void;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  companyInfo,
  currentView,
  onNavigate,
  onOpenAuth,
  onOpenAboutUs,
  onOpenPolicy,
  onSignOut
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto rounded-2xl glass-panel px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-sm">
        {/* Brand Logo */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 text-left cursor-pointer group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-sm shadow-emerald-700/20 group-hover:scale-105 transition-transform">
            <GraduationCap className="h-5 w-5 text-emerald-100" />
          </div>
          <div>
            <span className="font-serif text-xl font-bold tracking-tight text-slate-900 block leading-tight">
              MOCOSART
            </span>
            <span className="text-[10px] uppercase font-semibold text-emerald-700 tracking-wider block">
              Learning Hub
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
          <button
            onClick={() => onNavigate('home')}
            className={`px-3.5 py-1.5 rounded-xl text-xs lg:text-sm font-medium transition-all cursor-pointer ${
              currentView === 'home'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                : 'text-slate-700 hover:text-emerald-800 hover:bg-emerald-50/60'
            }`}
          >
            Home
          </button>

          <button
            onClick={onOpenAboutUs}
            className="px-3.5 py-1.5 rounded-xl text-xs lg:text-sm font-medium text-slate-700 hover:text-emerald-800 hover:bg-emerald-50/60 transition-all cursor-pointer inline-flex items-center gap-1"
          >
            <Info className="w-3.5 h-3.5 text-emerald-600" />
            <span>About Us</span>
          </button>

          {/* Policies Dropdown Menu */}
          <div className="relative group">
            <button
              onClick={() => onOpenPolicy('terms')}
              className="px-3.5 py-1.5 rounded-xl text-xs lg:text-sm font-medium text-slate-700 hover:text-emerald-800 hover:bg-emerald-50/60 transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span>Policies</span>
              <ChevronDown className="w-3 h-3 text-slate-400 group-hover:rotate-180 transition-transform" />
            </button>
            <div className="absolute left-0 mt-1 w-56 py-1.5 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 hidden group-hover:block z-50 animate-in fade-in">
              <button
                onClick={() => onOpenPolicy('terms')}
                className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Terms & Conditions</span>
              </button>
              <button
                onClick={() => onOpenPolicy('privacy')}
                className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Privacy Policy</span>
              </button>
              <button
                onClick={() => onOpenPolicy('refund')}
                className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Refund Conditions</span>
              </button>
            </div>
          </div>

          {currentUser && (
            <button
              onClick={() => onNavigate('dashboard')}
              className={`px-3.5 py-1.5 rounded-xl text-xs lg:text-sm font-medium transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                currentView.startsWith('user-') || currentView === 'dashboard'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-emerald-800 hover:bg-emerald-100/70'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Learner Dashboard</span>
            </button>
          )}

          {isUserAdmin(currentUser?.email) && (
            <button
              onClick={() => onNavigate('admin-dashboard')}
              className={`px-3.5 py-1.5 rounded-xl text-xs lg:text-sm font-medium transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                currentView.startsWith('admin-')
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Admin Panel</span>
            </button>
          )}
        </nav>

        {/* Right Action (Get Started / Profile / Auth) */}
        <div className="hidden md:flex items-center gap-2.5">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('user-profile')}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-white/60 hover:bg-white border border-slate-200/80 transition-all cursor-pointer"
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName}
                    className="w-7 h-7 rounded-lg object-cover ring-1 ring-emerald-500/30"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                    {currentUser.displayName?.charAt(0) || 'U'}
                  </div>
                )}
                <span className="text-xs font-semibold text-slate-800 max-w-[100px] truncate">
                  {currentUser.displayName}
                </span>
              </button>

              <button
                onClick={onSignOut}
                title="Sign Out"
                className="p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              id="nav-get-started-btn"
              onClick={onOpenAuth}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs lg:text-sm font-medium shadow-md shadow-emerald-700/20 active:scale-95 transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Get Started</span>
            </button>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          {currentUser && (
            <button
              onClick={() => onNavigate('user-profile')}
              className="p-1 rounded-lg border border-slate-200"
            >
              {currentUser.photoURL ? (
                <img src={currentUser.photoURL} alt="" className="w-6 h-6 rounded-md object-cover" />
              ) : (
                <UserIcon className="w-5 h-5 text-slate-700" />
              )}
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 p-4 rounded-2xl glass-panel border border-white/90 shadow-xl space-y-2 animate-in fade-in slide-in-from-top-2">
          <button
            onClick={() => {
              onNavigate('home');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-800 hover:bg-emerald-50 hover:text-emerald-800"
          >
            Home
          </button>

          <button
            onClick={() => {
              onOpenAboutUs();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-800 hover:bg-emerald-50 hover:text-emerald-800 flex items-center gap-2"
          >
            <Info className="w-4 h-4 text-emerald-600" />
            <span>About Us & Founders</span>
          </button>

          <div className="pt-2 pb-1 border-t border-slate-100 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 block">
              Official Policies
            </span>
            <button
              onClick={() => {
                onOpenPolicy('terms');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center gap-2"
            >
              <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Terms & Conditions</span>
            </button>
            <button
              onClick={() => {
                onOpenPolicy('privacy');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center gap-2"
            >
              <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Privacy Policy</span>
            </button>
            <button
              onClick={() => {
                onOpenPolicy('refund');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Refund Conditions</span>
            </button>
          </div>

          {currentUser && (
            <>
              <button
                onClick={() => {
                  onNavigate('dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium bg-emerald-600 text-white flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Learner Dashboard</span>
              </button>

              <button
                onClick={() => {
                  onNavigate('user-courses');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-sm text-slate-700 hover:bg-emerald-50 pl-6"
              >
                Explore Courses
              </button>

              <button
                onClick={() => {
                  onNavigate('user-exams');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-sm text-slate-700 hover:bg-emerald-50 pl-6"
              >
                Exam Registration
              </button>

              <button
                onClick={() => {
                  onNavigate('user-certificates');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-sm text-slate-700 hover:bg-emerald-50 pl-6"
              >
                My Certificates
              </button>

              {isUserAdmin(currentUser.email) && (
                <button
                  onClick={() => {
                    onNavigate('admin-dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium bg-slate-900 text-white flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Admin Panel</span>
                </button>
              )}
            </>
          )}

          <div className="pt-2 border-t border-slate-200">
            {currentUser ? (
              <button
                onClick={() => {
                  onSignOut();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out ({currentUser.displayName})</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onOpenAuth();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 text-white font-medium text-sm text-center block"
              >
                Sign In / Get Started
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
