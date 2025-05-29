import React from 'react';
import { Trophy, Github } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Trophy className="w-6 h-6 mr-2" />
            <span className="text-lg font-bold">FJJ BRASILEIRÃO SÉRIE A</span>
          </div>
          
          <div className="text-sm text-gray-200">
            © {currentYear} FJJ Brasileirão. Todos os direitos reservados.
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center gap-4">
            <a 
              href="#" 
              className="text-gray-200 hover:text-white transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;