import React from 'react'
import { FaHeartbeat, FaBrain } from 'react-icons/fa'

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-diabetes-blue to-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <FaHeartbeat className="text-3xl text-red-300" />
              <FaBrain className="text-2xl text-blue-300" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">XAI-DiabetesCheck</h1>
              <p className="text-blue-100 text-sm md:text-base">
                Erklärbare KI für Diabetes-Risikobewertung
              </p>
            </div>
          </div>
          <div className="hidden md:block text-right">
            <p className="text-sm text-blue-100">10CP Projektarbeit</p>
            <p className="text-xs text-blue-200">Explainable AI in der Medizin</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;