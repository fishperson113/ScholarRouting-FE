import { ContentLayout } from '@/components/layouts';

const DeadlineRoute = () => {
  return (
    <ContentLayout title="Deadlines">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Upcoming Deadlines</h1>
        <p>Keep track of important scholarship application deadlines.</p>
        {/* Add your deadline calendar/list component here */}
      </div>
    </ContentLayout>
  );
};

export default DeadlineRoute;