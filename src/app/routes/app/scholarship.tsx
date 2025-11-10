import { ContentLayout } from '@/components/layouts';

const ScholarshipRoute = () => {
  return (
    <ContentLayout title="Scholarships">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Available Scholarships</h1>
        <p>Browse and search for scholarships that match your profile.</p>
        {/* Add your scholarship list component here */}
      </div>
    </ContentLayout>
  );
};

export default ScholarshipRoute;