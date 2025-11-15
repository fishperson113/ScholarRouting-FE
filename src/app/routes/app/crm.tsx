import { ContentLayout } from '@/components/layouts';
import { Authorization, ROLES } from '@/lib/authorization';

export const CrmRoute = () => {
  return (
    <Authorization
      allowedRoles={[ROLES.ADMIN]}
      forbiddenFallback={
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
            <p className="mt-2 text-gray-600">
              You don't have permission to access this page.
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Only administrators can view this content.
            </p>
          </div>
        </div>
      }
    >
      <ContentLayout title="CRM Dashboard">
        <div className="space-y-6">
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-xl font-semibold">Welcome to CRM Dashboard</h2>
            <p className="mt-2 text-gray-600">
              This page is only accessible to administrators.
            </p>
          </div>

          {/* Example CRM content */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg bg-blue-50 p-6">
              <h3 className="font-semibold text-blue-900">Total Users</h3>
              <p className="mt-2 text-3xl font-bold text-blue-600">1,234</p>
            </div>
            
            <div className="rounded-lg bg-green-50 p-6">
              <h3 className="font-semibold text-green-900">Active Scholarships</h3>
              <p className="mt-2 text-3xl font-bold text-green-600">567</p>
            </div>
            
            <div className="rounded-lg bg-purple-50 p-6">
              <h3 className="font-semibold text-purple-900">Applications</h3>
              <p className="mt-2 text-3xl font-bold text-purple-600">8,901</p>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold">Recent Activity</h3>
            <div className="space-y-3">
              <div className="border-b pb-3">
                <p className="text-sm text-gray-600">New user registration</p>
                <p className="text-xs text-gray-400">2 minutes ago</p>
              </div>
              <div className="border-b pb-3">
                <p className="text-sm text-gray-600">Scholarship application submitted</p>
                <p className="text-xs text-gray-400">15 minutes ago</p>
              </div>
              <div className="pb-3">
                <p className="text-sm text-gray-600">Profile updated</p>
                <p className="text-xs text-gray-400">1 hour ago</p>
              </div>
            </div>
          </div>
        </div>
      </ContentLayout>
    </Authorization>
  );
};

export default CrmRoute;
