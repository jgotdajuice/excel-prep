import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function WelcomePage() {
  const navigate = useNavigate();
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    setHasStarted(localStorage.getItem('hasStarted') === 'true');
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f4f8',
        padding: '24px',
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 2px 16px rgba(0,0,0,0.10)',
          padding: '48px 56px',
          maxWidth: '480px',
          width: '100%',
          textAlign: 'center',
        }}
      >
        {/* App name */}
        <h1
          style={{
            fontSize: '32px',
            fontWeight: 700,
            color: '#1a3a2a',
            margin: '0 0 12px 0',
            letterSpacing: '-0.5px',
          }}
        >
          ExcelPrep
        </h1>

        {/* Brief description */}
        <p
          style={{
            fontSize: '16px',
            color: '#555',
            margin: '0 0 36px 0',
            lineHeight: '1.5',
          }}
        >
          Practice Excel formulas for finance interviews — SUM, VLOOKUP, NPV, IRR, and more.
        </p>

        {/* CTA button */}
        <button
          onClick={() => navigate('/practice')}
          style={{
            backgroundColor: '#1a6b3c',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            padding: '12px 32px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            letterSpacing: '0.2px',
            transition: 'background-color 0.15s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#145530';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1a6b3c';
          }}
        >
          {hasStarted ? 'Continue' : 'Open Spreadsheet'}
        </button>
      </div>
    </div>
  );
}
