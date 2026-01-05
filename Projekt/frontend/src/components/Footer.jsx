import React from 'react';
import { FaGithub, FaInfoCircle } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-6 mt-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-semibold">XAI-DiabetesCheck</h3>
            <p className="text-gray-400 text-sm mt-1">
              Ein Projekt zur erklärbaren KI in der Diabetes-Risikobewertung
            </p>
          </div>
          
          <div className="flex space-x-4">
            <a 
              href="#" 
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <FaInfoCircle />
              <span>Impressum</span>
            </a>
            <a 
              href="#" 
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <FaGithub />
              <span>GitHub</span>
            </a>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-700 text-center text-gray-400 text-sm">
          <p>
            ⚕️ Dieses Tool dient nur zu Forschungs- und Informationszwecken. 
            Kein Ersatz für medizinische Beratung.
          </p>
          <p className="mt-1">© 2026 XAI-DiabetesCheck Projekt | 10CP Projektarbeit</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;