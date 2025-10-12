import { useState, useEffect } from 'react';

function ErrorBoundary({ children }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (error) => {
      console.error('Error caught by boundary:', error);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div style={{ 
        background: '#000', 
        color: '#fff', 
        padding: '2rem', 
        textAlign: 'center',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div>
          <h2>Something went wrong</h2>
          <button 
            onClick={() => {
              setHasError(false);
              window.location.reload();
            }}
            style={{
              background: '#fff',
              color: '#000',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '8px',
              marginTop: '1rem',
              cursor: 'pointer'
            }}
          >
            Reload App
          </button>
        </div>
      </div>
    );
  }

  return children;
}

export default ErrorBoundary;