import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Sun, Moon, LogOut, User, LayoutDashboard } from 'lucide-react';
import { AuthService } from '../../firebase/services/auth.service.js';

const Navbar = () => {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    // Add your logout logic here
    AuthService.logout();
    navigate('/login');
  };
  const [user, setUser] = useState(() => {
    const currentUser = AuthService.getCurrentUser();
    return currentUser || { email: 'user@example.com' }; // Fallback value
  });

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      onClick: () => {
        navigate('/');
        setDrawerOpen(false);
      },
    },
    {
      text: 'Logout',
      icon: <LogOut className="w-5 h-5" />,
      onClick: () => {
        handleLogout();
        setDrawerOpen(false);
      },
    },
  ];

  const drawer = (
    <div className="w-64 h-full bg-white dark:bg-gray-800">
      <div className="p-4 flex items-center gap-3 border-b border-gray-200 dark:border-gray-700">
        <User className="w-5 h-5" />
        <span className="text-sm font-medium truncate">{user.email}</span>
      </div>
      <nav className="p-2">
        {menuItems.map((item) => (
          <button
            key={item.text}
            onClick={item.onClick}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            {item.icon}
            <span>{item.text}</span>
          </button>
        ))}
      </nav>
    </div>
  );

  return (
    <>
      <header className="bg-white bg-opacity-0 dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setDrawerOpen(true)}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">
                Dashboard
              </h1>
            </div>

            <div className="hidden lg:flex lg:items-center lg:gap-4">
              <span className="text-sm ">
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity lg:hidden ${
          drawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setDrawerOpen(false)}
      >
        <div
          className={`fixed inset-y-0 left-0 transform transition-transform duration-300 ease-in-out ${
            drawerOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {drawer}
        </div>
      </div>
    </>
  );
};

export default Navbar;
