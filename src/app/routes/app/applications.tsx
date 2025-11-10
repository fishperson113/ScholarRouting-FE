import { ContentLayout } from '@/components/layouts';

const ApplicationsRoute = () => {
  return (
    <ContentLayout title="My Applications">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">My Applications</h1>
        <p>Track the status of your scholarship applications.</p>
        {/* Add your applications list component here */}
      </div>
    </ContentLayout>
  );
};

export default ApplicationsRoute;