import { Mail, Phone, Linkedin } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#5D2C91] text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-16">
          
          {/* Column 1 - Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src="/Logo_white.png" 
                alt="ScholarshipRouting Logo" 
                className="h-12 w-12 object-contain"
              />
              <div>
                <h3 className="text-xl font-bold">ScholarshipRouting</h3>
                <p className="text-purple-200 text-xs">Your Gateway to Global Education</p>
              </div>
            </div>
            <p className="text-purple-100 text-sm leading-relaxed">
              Empowering students worldwide to discover and secure postgraduate scholarships 
              through AI-powered matching and comprehensive support.
            </p>
          </div>

          {/* Column 2 - Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <a 
                  href="/" 
                  className="text-purple-100 hover:text-yellow-300 transition-colors duration-200 text-sm"
                >
                  Home
                </a>
              </li>
              <li>
                <a 
                  href="/scholarships" 
                  className="text-purple-100 hover:text-yellow-300 transition-colors duration-200 text-sm"
                >
                  Find Scholarships
                </a>
              </li>
              <li>
                <a 
                  href="/success-stories" 
                  className="text-purple-100 hover:text-yellow-300 transition-colors duration-200 text-sm"
                >
                  Success Stories
                </a>
              </li>
              <li>
                <a 
                  href="/about" 
                  className="text-purple-100 hover:text-yellow-300 transition-colors duration-200 text-sm"
                >
                  About Us
                </a>
              </li>
              <li>
                <a 
                  href="/blog" 
                  className="text-purple-100 hover:text-yellow-300 transition-colors duration-200 text-sm"
                >
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3 - Support & Legal */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Support & Legal</h4>
            <ul className="space-y-3">
              <li>
                <a 
                  href="/privacy" 
                  className="text-purple-100 hover:text-yellow-300 transition-colors duration-200 text-sm"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a 
                  href="/terms" 
                  className="text-purple-100 hover:text-yellow-300 transition-colors duration-200 text-sm"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a 
                  href="/faq" 
                  className="text-purple-100 hover:text-yellow-300 transition-colors duration-200 text-sm"
                >
                  FAQs
                </a>
              </li>
              <li>
                <a 
                  href="/help" 
                  className="text-purple-100 hover:text-yellow-300 transition-colors duration-200 text-sm"
                >
                  Help Center
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4 - Contact & Social */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Contact Us</h4>
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-purple-200 flex-shrink-0" />
                <a 
                  href="mailto:admin@scholarshiprouting.com" 
                  className="text-purple-100 hover:text-yellow-300 transition-colors duration-200 text-sm"
                >
                  admin@scholarshiprouting.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-purple-200 flex-shrink-0" />
                <a 
                  href="tel:+84551234567" 
                  className="text-purple-100 hover:text-yellow-300 transition-colors duration-200 text-sm"
                >
                  0555234567 (Dương Đắc Ngọc)
                </a>
              </div>
            </div>

            {/* Social Media Icons */}
            <div>
              <h5 className="text-xs font-semibold uppercase tracking-wider mb-3">Follow Us</h5>
              <div className="flex gap-4">
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-100 hover:text-yellow-300 transition-colors duration-200"
                  aria-label="Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-100 hover:text-yellow-300 transition-colors duration-200"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-100 hover:text-yellow-300 transition-colors duration-200"
                  aria-label="Twitter"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-100 hover:text-yellow-300 transition-colors duration-200"
                  aria-label="Instagram"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Newsletter Subscribe */}
            <div className="mt-6">
              <h5 className="text-xs font-semibold uppercase tracking-wider mb-3">Stay Updated</h5>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 text-sm bg-purple-800 border border-purple-600 rounded-md text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-transparent"
                />
                <button className="px-4 py-2 bg-yellow-400 text-purple-900 text-sm font-semibold rounded-md hover:bg-yellow-300 transition-colors duration-200">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar - Copyright */}
      <div className="bg-[#4A2270] border-t border-purple-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-purple-200 text-sm">
            © {currentYear} ScholarshipRouting. All rights reserved. Designed with ❤️ for students worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
};
