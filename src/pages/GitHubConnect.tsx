import { useState, useRef } from 'react';
import { fetchRepoInfo, pushFileToGitHub, getFileSha, getGitHubPagesUrl } from '@/lib/github';
import { detectLanguage } from '@/lib/syntax';
import ToastContainer from '@/components/ToastContainer';
import { useToast } from '@/hooks/useToast';

export default function GitHubConnect() {
  const { toasts, addToast, removeToast } = useToast();
  const [token, setToken] = useState(() => localStorage.getItem('gh_token') || '');
  const [repoInput, setRepoInput] = useState('');
  const [branch, setBranch] = useState('main');
  const [files, setFiles] = useState<Array<{ name: string, content: string }>>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [liveUrl, setLiveUrl] = useState('');
  const [view, setView] = useState<'setup' | 'success'>('setup');

  const handleFilePick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.html,.htm,.css,.js,.ts,.tsx,.jsx,.json,.md,.txt,text/*';
    input.multiple = true;
    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (!target.files) return;
      
      const fileList = Array.from(target.files);
      const newFiles: Array<{ name: string, content: string }> = [];
      
      for (const file of fileList) {
        try {
          const content = await file.text();
          newFiles.push({ name: file.name, content });
        } catch (err) {
          addToast(`Failed to read ${file.name}`, 'error');
        }
      }
      
      setFiles(prev => [...prev, ...newFiles]);
      addToast(`Added ${newFiles.length} file(s)`, 'success');
      if (input.parentNode) document.body.removeChild(input);
    };
    
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.appendChild(input);
    input.click();
  };

  const handleGenerate = async () => {
    if (!token || !repoInput || files.length === 0) {
      addToast('Please provide token, repo, and at least one file', 'error');
      return;
    }

    setLoading(true);
    setStatus('Connecting and pushing files...');
    localStorage.setItem('gh_token', token.trim());

    try {
      const repo = repoInput.includes('github.com/') 
        ? repoInput.split('github.com/')[1].split(/[?#]/)[0] 
        : repoInput.trim();
      
      // 1. Verify repo
      const info = await fetchRepoInfo(token, repo);
      const targetBranch = branch || info.default_branch;

      // 2. Push files
      let successCount = 0;
      for (const file of files) {
        setStatus(`Pushing ${file.name}...`);
        const sha = await getFileSha(token, repo, file.name);
        await pushFileToGitHub(token, repo, targetBranch, file.name, file.content, 'Upload via Web Coding AIDE', sha);
        successCount++;
      }

      // 3. Set Live URL
      const url = getGitHubPagesUrl(repo);
      setLiveUrl(url);
      setView('success');
      addToast(`Successfully pushed ${successCount} files!`, 'success');
    } catch (err: any) {
      console.error(err);
      setStatus(`Error: ${err.message}`);
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (view === 'success') {
    return (
      <div className="connect-screen" style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🚀</div>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>Success!</h1>
        <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '30px' }}>
          Your files have been pushed to GitHub. It may take a minute for GitHub Pages to reflect the changes.
        </p>
        <div className="github-url-display" style={{ marginBottom: '30px', fontSize: '16px' }}>
          <a href={liveUrl} target="_blank" rel="noreferrer" style={{ color: 'inherit' }}>{liveUrl}</a>
        </div>
        <button className="modal-btn primary" onClick={() => setView('setup')} style={{ width: '100%' }}>
          Push More Files
        </button>
      </div>
    );
  }

  return (
    <div className="connect-screen" style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>GitHub Live URL Generator</h1>
        <p style={{ fontSize: '14px', color: 'hsl(var(--muted-foreground))' }}>Pick files, add token, and go live!</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>1. Pick Files from Device</label>
        <button className="modal-btn secondary" onClick={handleFilePick} style={{ width: '100%', marginBottom: '10px' }}>
          {files.length > 0 ? `Add More Files (${files.length} selected)` : 'Select Files'}
        </button>
        {files.length > 0 && (
          <div style={{ maxHeight: '100px', overflowY: 'auto', background: 'hsl(var(--muted))', padding: '8px', borderRadius: '6px' }}>
            {files.map((f, i) => (
              <div key={i} style={{ fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}>
                <span>{f.name}</span>
                <span onClick={() => setFiles(files.filter((_, idx) => idx !== i))} style={{ color: 'red', cursor: 'pointer' }}>×</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>2. GitHub Token</label>
        <input 
          type="password" 
          className="modal-input" 
          placeholder="ghp_xxxxxxxxxxxx" 
          value={token}
          onChange={e => setToken(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>3. Repository (owner/repo)</label>
        <input 
          className="modal-input" 
          placeholder="username/my-awesome-project" 
          value={repoInput}
          onChange={e => setRepoInput(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: '30px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>4. Branch (optional)</label>
        <input 
          className="modal-input" 
          placeholder="main" 
          value={branch}
          onChange={e => setBranch(e.target.value)}
        />
      </div>

      <button 
        className="modal-btn primary" 
        onClick={handleGenerate} 
        disabled={loading}
        style={{ width: '100%', height: '44px', fontSize: '16px' }}
      >
        {loading ? 'Processing...' : 'Generate Live URL'}
      </button>

      {status && (
        <div style={{ marginTop: '20px', padding: '12px', background: 'hsl(var(--muted))', borderRadius: '6px', fontSize: '12px', textAlign: 'center' }}>
          {status}
        </div>
      )}
    </div>
  );
}
