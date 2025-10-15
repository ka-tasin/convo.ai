import type { FC } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContextObject";

const Navbar: FC = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-gradient-to-r h-[10vh] from-purple-600 to-blue-600 shadow-2xl border-b border-purple-400/30 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center shadow-lg border border-white/30 backdrop-blur-sm">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <Link
              to="/"
              className="text-white text-xl font-bold hover:text-purple-100 transition-colors duration-200"
            >
              Convo.AI
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-2">
            <Link
              to="/"
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 backdrop-blur-sm border ${
                isActive("/")
                  ? "bg-white/25 text-white shadow-inner shadow-white/20 border-white/40"
                  : "text-white/90 hover:bg-white/15 hover:text-white border-white/20 hover:border-white/30 hover:shadow-lg hover:shadow-white/10"
              }`}
            >
              Home
            </Link>
            <Link
              to="/chat"
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 backdrop-blur-sm border ${
                isActive("/chat")
                  ? "bg-white/25 text-white shadow-inner shadow-white/20 border-white/40"
                  : "text-white/90 hover:bg-white/15 hover:text-white border-white/20 hover:border-white/30 hover:shadow-lg hover:shadow-white/10"
              }`}
            >
              Chat
            </Link>

            {user ? (
              <>
                <Link
                  to="/profile"
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 backdrop-blur-sm border ${
                    isActive("/profile")
                      ? "bg-white/25 text-white shadow-inner shadow-white/20 border-white/40"
                      : "text-white/90 hover:bg-white/15 hover:text-white border-white/20 hover:border-white/30 hover:shadow-lg hover:shadow-white/10"
                  }`}
                >
                  Profile
                </Link>

                {/* User Info */}
                <div className="ml-2 pl-4 border-l border-white/30 flex items-center space-x-3">
                  <span className="text-white/90 text-sm bg-white/15 px-4 py-2 rounded-xl border border-white/30 backdrop-blur-sm shadow-lg">
                    👋 {user.username}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-white/90 hover:bg-red-400/30 hover:text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border border-white/20 hover:border-red-300/40 backdrop-blur-sm hover:shadow-lg hover:shadow-red-400/10"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-white/90 hover:bg-white/15 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border border-white/25 hover:border-white/40 backdrop-blur-sm hover:shadow-lg hover:shadow-white/10"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-purple-600 hover:bg-purple-50 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-xl hover:shadow-2xl border border-white hover:border-purple-200 hover:shadow-purple-500/25"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-white hover:bg-white/15 p-2.5 rounded-xl border border-white/25 backdrop-blur-sm transition-all duration-200 hover:shadow-lg hover:shadow-white/10"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <svg
                className="h-6 w-6"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className="md:hidden bg-gradient-to-b from-purple-600 to-blue-600/95 backdrop-blur-sm border-b border-purple-400/30 shadow-2xl"
        id="mobile-menu"
      >
        <div className="px-3 pt-3 pb-4 space-y-2 sm:px-4">
          <Link
            to="/"
            className={`text-white block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 border backdrop-blur-sm ${
              isActive("/")
                ? "bg-white/25 border-white/40 shadow-inner shadow-white/20"
                : "hover:bg-white/15 border-white/25 hover:border-white/40 hover:shadow-lg hover:shadow-white/10"
            }`}
          >
            Home
          </Link>
          <Link
            to="/chat"
            className={`text-white block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 border backdrop-blur-sm ${
              isActive("/chat")
                ? "bg-white/25 border-white/40 shadow-inner shadow-white/20"
                : "hover:bg-white/15 border-white/25 hover:border-white/40 hover:shadow-lg hover:shadow-white/10"
            }`}
          >
            Chat
          </Link>

          {user ? (
            <>
              <Link
                to="/profile"
                className={`text-white block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 border backdrop-blur-sm ${
                  isActive("/profile")
                    ? "bg-white/25 border-white/40 shadow-inner shadow-white/20"
                    : "hover:bg-white/15 border-white/25 hover:border-white/40 hover:shadow-lg hover:shadow-white/10"
                }`}
              >
                Profile
              </Link>
              <div className="px-4 py-3 text-white/80 text-sm border-t border-white/30 mt-3 pt-4 backdrop-blur-sm bg-white/10 rounded-xl">
                👋 Welcome back, <strong>{user.username}</strong>
              </div>
              <button
                onClick={handleLogout}
                className="text-white hover:bg-red-400/30 block w-full text-left px-4 py-3 rounded-xl text-base font-medium mt-2 border border-white/25 hover:border-red-300/40 transition-all duration-200 backdrop-blur-sm hover:shadow-lg hover:shadow-red-400/10"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-white hover:bg-white/15 block px-4 py-3 rounded-xl text-base font-medium border border-white/25 hover:border-white/40 transition-all duration-200 backdrop-blur-sm hover:shadow-lg hover:shadow-white/10"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-white text-purple-600 hover:bg-purple-50 block px-4 py-3 rounded-xl text-base font-semibold text-center mt-2 shadow-xl border border-white hover:border-purple-200 transition-all duration-200 hover:shadow-2xl hover:shadow-purple-500/25"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
