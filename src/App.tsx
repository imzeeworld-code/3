import { useState, useEffect } from 'react';
import IDE from '@/pages/IDE';
import GitHubConnect from '@/pages/GitHubConnect';

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.hash || '#ide');

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(window.location.hash || '#ide');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {currentPath === '#connect' ? (
        <div style={{ height: '100%', width: '100%', overflowY: 'auto', background: 'hsl(var(--background))' }}>
          <div style={{ padding: '12px', display: 'flex', gap: '8px', borderBottom: '1px solid hsl(var(--border))' }}>
            <button 
              onClick={() => window.location.hash = '#ide'}
              style={{ padding: '6px 12px', background: 'hsl(var(--secondary))', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
            >
              ← Back to IDE
            </button>
          </div>
          <GitHubConnect />
        </div>
      ) : (
        <IDE />
      )}
    </div>
  );
}

export default App;
