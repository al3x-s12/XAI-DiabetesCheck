import React from 'react';
import { FaGithub, FaInfoCircle } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: '#ffffff',
        color: '#000000',
        paddingTop: '24px',
        paddingBottom: '24px',
        marginTop: '48px',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          paddingLeft: '16px',
          paddingRight: '16px',
        }}
      >
        {/* Hauptbereich */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column', //untereinander
            alignItems: 'center',
            gap: '16px',
          }}
        >
          {/*Beschreibung*/}
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '4px' }}>
              XAI-DiabetesCheck
            </h3>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
              Projektarbeit einer erklärbaren KI in der Diabetes-Risikobewertung
            </p>
          </div>
        </div>

        {/* Fußnote*/}
        <div
          style={{
            marginTop: '24px',
            paddingTop: '24px',
            borderTop: '1px solid #374151',
            textAlign: 'center',
            color: '#9ca3af',
            fontSize: '0.875rem',
          }}
        >
          <p>
            Dieses Tool dient nur zu Forschungs- und Informationszwecken.
            Kein Ersatz für medizinische Beratung.
          </p>
          <p style={{ marginTop: '4px' }}>2026 XAI-DiabetesCheck</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;