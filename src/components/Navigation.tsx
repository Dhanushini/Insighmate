import React from 'react';
import { Home } from 'lucide-react';

interface Module {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
}

interface NavigationProps {
  modules: Module[];
  activeModule: string;
  setActiveModule: (moduleId: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ modules, activeModule, setActiveModule }) => {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-16 z-40" role="navigation" aria-label="Main navigation">
      <div className="container-responsive">
        <div className="flex space-x-1 overflow-x-auto py-2 sm:py-4 scrollbar-hide">
          <button
            onClick={() => setActiveModule('home')}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              activeModule === 'home'
                ? 'bg-blue-100 text-blue-700 border-2 border-blue-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-2 border-transparent'
            }`}
            aria-label="Go to home page"
            aria-current={activeModule === 'home' ? 'page' : undefined}
          >
            <Home className="w-4 h-4 mr-1 sm:mr-2" />
            Home
          </button>
          
          {modules.map((module) => {
            const IconComponent = module.icon;
            return (
              <button
                key={module.id}
                onClick={() => setActiveModule(module.id)}
                className={`flex items-center px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap ${
                  activeModule === module.id
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-2 border-transparent'
                }`}
                aria-label={`Access ${module.name}`}
                aria-current={activeModule === module.id ? 'page' : undefined}
              >
                <IconComponent className="w-4 h-4 mr-1 sm:mr-2" />
                {module.name}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;