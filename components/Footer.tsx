import React from 'react';
import { FIRM_NAME } from '../constants';
import { Scale } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-950 text-gray-400 py-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0 flex items-center">
             <Scale className="h-6 w-6 text-gold-600 mr-2" />
             <span className="font-serif font-bold text-white text-lg tracking-wider">{FIRM_NAME.toUpperCase()}</span>
          </div>
          
          <div className="text-sm">
            &copy; {new Date().getFullYear()} {FIRM_NAME}. Todos los derechos reservados.
          </div>
        </div>
        <div className="mt-8 text-center text-xs text-gray-600">
           Abogados especialistas en Litigación.
        </div>
      </div>
    </footer>
  );
};

export default Footer;