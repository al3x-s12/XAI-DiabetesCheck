import React from 'react'
import { FaHeartbeat, FaBrain } from 'react-icons/fa'

const Header = () => {
  return (
    <header
      style={{
        backgroundColor: '#ffffff',           // diabetes-blue / blue-600
        color: '#000000',
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '24px 16px',               // py-6 (24px) + px-4 (16px)
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Linke Seite: Titel & Untertitel */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
                XAI-DiabetesCheck
              </h1>
              <p style={{ color: '#000000', fontSize: '1rem' }}>
                Erklärbare KI für Diabetes-Risikobewertung
              </p>
            </div>
          </div>

          {/* Rechte Seite: Projektinfo (immer sichtbar) */}
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: '#000000', fontSize: '0.875rem', fontWeight: 'bold' }}>
              10 CP Projektarbeit
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;