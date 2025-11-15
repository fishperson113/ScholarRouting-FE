import { Outlet, Link, useLocation } from 'react-router';
import { paths } from '@/config/paths';
import { useUser } from '@/lib/auth';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: paths.admin.dashboard.getHref() },
    { name: 'Conversations', path: paths.admin.conversations.getHref() },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen">
      <div className="p-6">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
      </div>
      <nav className="mt-6">
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`block px-6 py-3 hover:bg-gray-800 transition ${
              location.pathname === item.path ? 'bg-gray-800 border-l-4 border-blue-500' : ''
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

const Topbar = () => {
  const user = useUser();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <h2 className="text-xl font-semibold text-gray-800">Admin Dashboard</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user.data?.email}</span>
          <Link
            to={paths.app.root.getHref()}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Back to App
          </Link>
        </div>
      </div>
    </header>
  );
};

export const AdminLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
