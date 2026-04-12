import { useState } from 'react';
import {
  fetchRepoInfo,
  fetchRepoContents,
  fetchFileContent,
  pushFileToGitHub,
  getFileSha,
  extractRepoFromUrl,
  getGitHubPagesUrl,
} from '@/lib/github';
import type { FileTab } from '@/lib/syntax';
import { detectLanguage } from '@/lib/syntax';

interface GitHubModalProps {
  onClose: () => void;
  onLoadFile: (tab: Omit<FileTab, 'modified'>) => void;
  tabs: FileTab[];
  onToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export default function GitHubModal({ onClose, onLoadFile, tabs, onToast }: GitHubModalProps) {
  const [token, setToken] = useState(() => localStorage.getItem('gh_token') || '');
  const [repoInput, setRepoInput] = useState('');
  const [branch, setBranch] = useState('main');
  const [status, setStatus] = useState('');
  const [files, setFiles] = useState<Array<{ name: string; path: string; download_url: string | null; type: string }>>([]);
  const [liveUrl, setLiveUrl] = useState('');
  const [pushing, setPushing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [commitMsg, setCommitMsg] = useState('Update via Web Coding AIDE');
  const [view, setView] = useState<'main' | 'files'>('main');
  
  const saveToken = () => {
    localStorage.setItem('gh_token', token);
    onToast('GitHub token saved', 'success');
  };
  
  const getRepo = () => {
    const fromUrl = extractRepoFromUrl(repoInput);
    return fromUrl || repoInput.trim();
  };
  
  const handleConnect = async () => {
    const repo = getRepo();
    if (!token || !repo) {
      setStatus('Please enter your GitHub token and repository.');
      return;
    }
    
    setLoading(true);
    setStatus('Connecting to GitHub...');
    
    try {
      const info = await fetchRepoInfo(token, repo);
      setBranch(info.default_branch);
      setLiveUrl(getGitHubPagesUrl(repo));
      
      const contents = await fetchRepoContents(token, repo);
      setFiles(contents.filter(f => f.type === 'file'));
      setView('files');
      setStatus(`Connected to ${info.full_name}`);
      onToast(`Connected to ${info.full_name}`, 'success');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Connection failed';
      setStatus(`Error: ${msg}`);
      onToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLoadFile = async (file: { name: string; path: string; download_url: string | null; type: string }) => {
    if (!file.download_url) return;
    
    setLoading(true);
    setStatus(`Loading ${file.name}...`);
    
    try {
      const content = await fetchFileContent(token, file.download_url);
      const lang = detectLanguage(file.name);
      onLoadFile({
        id: `gh-${Date.now()}`,
        name: file.name,
        language: lang,
        content,
      });
      onToast(`Loaded ${file.name}`, 'success');
      onClose();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load file';
      onToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePush = async () => {
    const repo = getRepo();
    if (!token || !repo) {
      onToast('Enter GitHub token and repository first', 'error');
      return;
    }
    
    setPushing(true);
    
    try {
      let successCount = 0;
      
      for (const tab of tabs) {
        setStatus(`Pushing ${tab.name}...`);
        const sha = await getFileSha(token, repo, tab.name);
        await pushFileToGitHub(token, repo, branch, tab.name, tab.content, commitMsg, sha);
        successCount++;
      }
      
      setStatus(`Pushed ${successCount} file(s) successfully!`);
      onToast(`Pushed ${successCount} file(s) to ${repo}`, 'success');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Push failed';
      setStatus(`Error: ${msg}`);
      onToast(msg, 'error');
    } finally {
      setPushing(false);
    }
  };
  
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <div className="modal-title">GitHub Integration</div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'hsl(var(--muted-foreground))', cursor: 'pointer', fontSize: '18px', padding: '0 4px' }}
          >
            ×
          </button>
        </div>
        <div className="modal-subtitle">Push, pull, and manage your GitHub repositories</div>
        
        <div style={{ marginBottom: '8px' }}>
          <label style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', marginBottom: '4px', display: 'block' }}>
            GitHub Personal Access Token
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="password"
              className="modal-input"
              style={{ marginBottom: 0, flex: 1 }}
              placeholder="ghp_xxxxxxxxxxxx"
              value={token}
              onChange={e => setToken(e.target.value)}
            />
            <button className="modal-btn secondary" onClick={saveToken} style={{ whiteSpace: 'nowrap' }}>
              Save
            </button>
          </div>
          <div style={{ fontSize: '10px', color: 'hsl(var(--muted-foreground))', marginTop: '4px' }}>
            Needs repo scope. Never shared — stored in your browser only.
          </div>
        </div>
        
        <div style={{ marginBottom: '8px' }}>
          <label style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', marginBottom: '4px', display: 'block' }}>
            Repository (owner/repo or GitHub URL)
          </label>
          <input
            className="modal-input"
            style={{ marginBottom: 0 }}
            placeholder="username/repo-name"
            value={repoInput}
            onChange={e => setRepoInput(e.target.value)}
          />
        </div>
        
        <div style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', marginBottom: '4px', display: 'block' }}>
            Branch
          </label>
          <input
            className="modal-input"
            style={{ marginBottom: 0 }}
            placeholder="main"
            value={branch}
            onChange={e => setBranch(e.target.value)}
          />
        </div>
        
        {view === 'files' && files.length > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: 'hsl(var(--foreground))', marginBottom: '6px' }}>
              Repository Files
            </div>
            <div style={{ border: '1px solid hsl(var(--border))', borderRadius: '8px', overflow: 'hidden' }}>
              {files.slice(0, 10).map(file => (
                <div
                  key={file.path}
                  style={{
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid hsl(var(--border))',
                    cursor: 'pointer',
                    background: 'hsl(var(--muted))',
                  }}
                  onClick={() => handleLoadFile(file)}
                >
                  <span style={{ fontSize: '12px', fontFamily: 'var(--app-font-mono)', color: 'hsl(var(--foreground))' }}>
                    {file.name}
                  </span>
                  <span style={{ fontSize: '10px', color: 'hsl(var(--primary))' }}>Load</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {liveUrl && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}>
              GitHub Pages URL
            </div>
            <div className="github-url-display">
              <a href={liveUrl} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                {liveUrl}
              </a>
            </div>
          </div>
        )}
        
        <div style={{ marginBottom: '8px' }}>
          <label style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', marginBottom: '4px', display: 'block' }}>
            Commit message
          </label>
          <input
            className="modal-input"
            style={{ marginBottom: 0 }}
            value={commitMsg}
            onChange={e => setCommitMsg(e.target.value)}
          />
        </div>
        
        {status && (
          <div style={{
            padding: '8px 12px',
            background: 'hsl(var(--muted))',
            borderRadius: '6px',
            fontSize: '11px',
            color: status.startsWith('Error') ? 'hsl(var(--destructive))' : 'hsl(142 71% 55%)',
            marginBottom: '12px',
            fontFamily: 'var(--app-font-mono)',
          }}>
            {status}
          </div>
        )}
        
        <div className="modal-btn-row">
          <button className="modal-btn secondary" onClick={onClose}>Cancel</button>
          <button
            className="modal-btn secondary"
            onClick={handleConnect}
            disabled={loading}
          >
            {loading ? '...' : 'Browse Files'}
          </button>
          <button
            className="modal-btn primary"
            onClick={handlePush}
            disabled={pushing || !token || !repoInput}
          >
            {pushing ? 'Pushing...' : `Push ${tabs.length} file(s)`}
          </button>
        </div>
      </div>
    </div>
  );
}
