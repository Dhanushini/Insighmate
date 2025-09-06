import React from 'react';
import { Volume2, Eye, Menu } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200" role="banner">
      <div className="container-responsive">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center">
            <Menu className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mr-2 sm:mr-3" />
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Insightmate</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              className="p-2 sm:p-3 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Voice assistance settings"
            >
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;