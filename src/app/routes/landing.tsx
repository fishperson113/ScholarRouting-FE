import { Globe, TrendingUp, Users, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useState } from 'react';

import { Head } from '@/components/seo';
import { Button } from '@/components/ui/button';
import { LandingNav } from '@/components/layouts/landing-nav';
import { Footer } from '@/components/layouts/footer';
import { AuthDialog } from '@/components/auth';
import { paths } from '@/config/paths';
import { useUser } from '@/lib/auth';

const LandingRoute = () => {
  const navigate = useNavigate();
  const user = useUser();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const isAuthenticated = !!user.data;

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate(paths.app.scholarships.getHref());
    } else {
      setIsAuthDialogOpen(true);
    }
  };

  const handleBrowseScholarships = () => {
    if (isAuthenticated) {
      navigate(paths.app.scholarships.getHref());
    } else {
      setIsAuthDialogOpen(true);
    }
  };

  return (
    <>
      <Head 
        title="ScholarshipRouting - Find Your Perfect Scholarship" 
        description="Discover postgraduate study abroad scholarships tailored to your profile with AI-powered matching and comprehensive application support." 
      />
      
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        {/* Navigation */}
        <LandingNav />

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full mb-8">
              <span className="text-sm font-medium">🎓 Your Gateway to Global Education</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Find Your Perfect{' '}
              <span className="text-purple-600">Scholarship</span>
            </h1>

            {/* Subheading */}
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
              Discover postgraduate study abroad scholarships tailored to your profile 
              with AI-powered matching and comprehensive application support.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-6 text-lg"
              >
                {isAuthenticated ? 'Browse Scholarships' : 'Get Started'}
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={handleBrowseScholarships}
                className="px-8 py-6 text-lg border-gray-300 hover:bg-gray-50"
              >
                Browse Scholarships
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Stat 1 */}
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Globe className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">400+</div>
                <div className="text-gray-600">Active Scholarships</div>
              </div>

              {/* Stat 2 */}
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">78%</div>
                <div className="text-gray-600">Success Rate</div>
              </div>

              {/* Stat 3 */}
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">15,000+</div>
                <div className="text-gray-600">Students Helped</div>
              </div>

              {/* Stat 4 */}
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">45+</div>
                <div className="text-gray-600">Countries Covered</div>
              </div>
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600">
              Our comprehensive platform guides you through every step of your 
              scholarship journey.
            </p>
          </div>
        </section>

        {/* Footer */}
        <Footer />

        {/* Auth Dialog */}
        <AuthDialog
          isOpen={isAuthDialogOpen}
          onClose={() => setIsAuthDialogOpen(false)}
          defaultMode="register"
        />
      </div>
    </>
  );
};

export default LandingRoute;
