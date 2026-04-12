import { useState, useRef, useCallback, useEffect } from 'react';
import CodeEditor from '@/components/CodeEditor';
import PreviewPanel from '@/components/PreviewPanel';
import GitHubModal from '@/components/GitHubModal';
import RotateOverlay from '@/components/RotateOverlay';
import ToastContainer from '@/components/ToastContainer';
import NewFileModal from '@/components/NewFileModal';
import DropZone from '@/components/DropZone';
import { useOrientation } from '@/hooks/useOrientation';
import { useToast } from '@/hooks/useToast';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { FileTab, Language } from '@/lib/syntax';
import { findErrors, getLanguageColor, detectLanguage, DEFAULT_TEMPLATES } from '@/lib/syntax';
import { downloadCurrentFile, downloadFullProject } from '@/lib/download';

const INIT_TABS: FileTab[] = [
  {
    id: 'init-html',
    name: 'index.html',
    language: 'html',
    content: DEFAULT_TEMPLATES.html,
    modified: false,
  },
];

export default function IDE() {
  const { isLandscape, isMobile } = useOrientation();
  const { toasts, addToast, removeToast } = useToast();
  
  const [tabs, setTabs] = useLocalStorage<FileTab[]>('aide_tabs', INIT_TABS);
  const [activeTabId, setActiveTabId] = useLocalStorage<string>('aide_active', 'init-html');
  const [splitRatio, setSplitRatio] = useLocalStorage<number>('aide_split', 50);
  const [showGitHub, setShowGitHub] = useState(false);
  const [showNewFile, setShowNewFile] = useState(false);
  const [showConsole, setShowConsole] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [fontSize, setFontSize] = useState(13);
  
  const splitContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const lastSplitRef = useRef(splitRatio);
  
  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];
  
  const errors = activeTab ? findErrors(activeTab.content, activeTab.language) : [];
  
  const updateTab = useCallback((id: string, content: string) => {
    setTabs(prev => prev.map(t => t.id === id ? { ...t, content, modified: true } : t));
  }, [setTabs]);
  
  const addTab = useCallback((name: string, language: Language, content: string) => {
    const id = `tab-${Date.now()}`;
    const newTab: FileTab = { id, name, language, content, modified: false };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(id);
  }, [setTabs, setActiveTabId]);
  
  const closeTab = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTabs(prev => {
      const next = prev.filter(t => t.id !== id);
      if (next.length === 0) return INIT_TABS;
      return next;
    });
    if (activeTabId === id) {
      const remaining = tabs.filter(t => t.id !== id);
      if (remaining.length > 0) setActiveTabId(remaining[remaining.length - 1].id);
    }
  }, [activeTabId, tabs, setTabs, setActiveTabId]);
  
  const handleDividerMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    
    const onMove = (me: MouseEvent) => {
      if (!isDraggingRef.current || !splitContainerRef.current) return;
      const rect = splitContainerRef.current.getBoundingClientRect();
      const ratio = Math.min(80, Math.max(20, ((me.clientX - rect.left) / rect.width) * 100));
      setSplitRatio(ratio);
      lastSplitRef.current = ratio;
    };
    
    const onUp = () => {
      isDraggingRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [setSplitRatio]);
  
  const handleDividerTouchStart = useCallback((e: React.TouchEvent) => {
    const startX = e.touches[0].clientX;
    const startRatio = lastSplitRef.current;
    
    const onMove = (te: TouchEvent) => {
      if (!splitContainerRef.current) return;
      const rect = splitContainerRef.current.getBoundingClientRect();
      const dx = te.touches[0].clientX - startX;
      const ratio = Math.min(80, Math.max(20, startRatio + (dx / rect.width) * 100));
      setSplitRatio(ratio);
      lastSplitRef.current = ratio;
    };
    
    const onEnd = () => {
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);
    };
    
    document.addEventListener('touchmove', onMove, { passive: true });
    document.addEventListener('touchend', onEnd);
  }, [setSplitRatio]);
  
  const handleLoadFile = useCallback((tab: Omit<FileTab, 'modified'>) => {
    const existing = tabs.find(t => t.name === tab.name);
    if (existing) {
      setTabs(prev => prev.map(t => t.id === existing.id ? { ...t, content: tab.content, modified: true } : t));
      setActiveTabId(existing.id);
    } else {
      const newTab = { ...tab, modified: false };
      setTabs(prev => [...prev, newTab]);
      setActiveTabId(tab.id);
    }
  }, [tabs, setTabs, setActiveTabId]);
  
  const handleDropFiles = useCallback((files: Omit<FileTab, 'modified'>[]) => {
    files.forEach(f => handleLoadFile(f));
  }, [handleLoadFile]);
  
  const handleDownloadCurrent = () => {
    if (activeTab) downloadCurrentFile(activeTab);
  };
  
  const handleDownloadFull = () => {
    downloadFullProject(tabs);
    addToast('Downloaded full project as HTML', 'success');
  };
  
  const handleUploadFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.html,.css,.js,.ts,.tsx,.jsx,.json,.md,.txt';
    input.multiple = true;
    input.onchange = async () => {
      if (!input.files) return;
      const results: Omit<FileTab, 'modified'>[] = [];
      for (const file of Array.from(input.files)) {
        const content = await file.text();
        results.push({
          id: `upload-${Date.now()}-${file.name}`,
          name: file.name,
          language: detectLanguage(file.name),
          content,
        });
      }
      handleDropFiles(results);
    };
    input.click();
  };
  
  const wordCount = activeTab ? activeTab.content.split(/\s+/).filter(Boolean).length : 0;
  const lineCount = activeTab ? activeTab.content.split('\n').length : 0;
  const charCount = activeTab ? activeTab.content.length : 0;
  const langColor = activeTab ? getLanguageColor(activeTab.language) : '#fff';
  
  const showRotate = isMobile && !isLandscape;
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%', overflow: 'hidden', background: 'hsl(222 18% 10%)' }}>
      {showRotate && <RotateOverlay />}
      
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      {showGitHub && (
        <GitHubModal
          onClose={() => setShowGitHub(false)}
          onLoadFile={handleLoadFile}
          tabs={tabs}
          onToast={addToast}
        />
      )}
      
      {showNewFile && (
        <NewFileModal
          onClose={() => setShowNewFile(false)}
          onCreate={addTab}
        />
      )}
      
      <div className="toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '4px' }}>
          <div style={{
            width: '22px', height: '22px', borderRadius: '5px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', fontWeight: '800', color: 'white', flexShrink: 0,
          }}>
            W
          </div>
          <span style={{ fontSize: '12px', fontWeight: '700', color: 'hsl(var(--foreground))', whiteSpace: 'nowrap' }}>
            Web Coding AIDE
          </span>
        </div>
        
        <div className="toolbar-separator" />
        
        <button className="toolbar-btn" onClick={() => setShowNewFile(true)} title="New file">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="12" y1="12" x2="12" y2="18"/>
            <line x1="9" y1="15" x2="15" y2="15"/>
          </svg>
          New
        </button>
        
        <button className="toolbar-btn" onClick={handleUploadFile} title="Open file">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Open
        </button>
        
        <div className="toolbar-separator" />
        
        <button className="toolbar-btn" onClick={handleDownloadCurrent} title="Download current file">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          {activeTab?.name || 'File'}
        </button>
        
        <button className="toolbar-btn success" onClick={handleDownloadFull} title="Download full project as HTML">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2H2v20h20V12"/>
            <path d="M12 2l10 10"/>
            <path d="M12 12l4 4-8 0"/>
          </svg>
          Download HTML
        </button>
        
        <div className="toolbar-separator" />
        
        <button
          className="toolbar-btn"
          onClick={() => setShowGitHub(true)}
          title="GitHub integration"
          style={{ color: 'hsl(var(--accent))' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.38.6.11.82-.26.82-.57v-2.23c-3.34.73-4.04-1.61-4.04-1.61-.55-1.4-1.34-1.77-1.34-1.77-1.09-.74.08-.73.08-.73 1.21.08 1.85 1.24 1.85 1.24 1.07 1.84 2.81 1.31 3.5 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4c1.02.005 2.04.14 3 .4 2.28-1.55 3.29-1.23 3.29-1.23.66 1.65.24 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.62-2.81 5.64-5.49 5.94.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.82.57C20.57 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          GitHub
        </button>
        
        <div className="toolbar-separator" />
        
        <button
          className={`toolbar-btn ${autoRefresh ? 'active' : ''}`}
          onClick={() => setAutoRefresh(p => !p)}
          title="Toggle auto-refresh"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          {autoRefresh ? 'Auto' : 'Manual'}
        </button>
        
        <button
          className={`toolbar-btn ${showConsole ? 'active' : ''}`}
          onClick={() => setShowConsole(p => !p)}
          title="Toggle console"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="4 17 10 11 4 5"/>
            <line x1="12" y1="19" x2="20" y2="19"/>
          </svg>
          Console
          {errors.length > 0 && (
            <span style={{
              background: 'hsl(var(--destructive))',
              color: 'white',
              borderRadius: '10px',
              padding: '0 5px',
              fontSize: '9px',
              fontWeight: '700',
              marginLeft: '2px',
            }}>
              {errors.length}
            </span>
          )}
        </button>
        
        <div className="toolbar-separator" />
        
        <button
          className="toolbar-btn"
          onClick={() => setFontSize(s => Math.max(10, s - 1))}
          title="Decrease font size"
        >
          A-
        </button>
        <button
          className="toolbar-btn"
          onClick={() => setFontSize(s => Math.min(20, s + 1))}
          title="Increase font size"
        >
          A+
        </button>
        <button
          className={`toolbar-btn ${showLineNumbers ? 'active' : ''}`}
          onClick={() => setShowLineNumbers(p => !p)}
          title="Toggle line numbers"
        >
          #
        </button>
      </div>
      
      <div className="tab-bar">
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`tab-item ${tab.id === activeTabId ? 'active' : ''}`}
            onClick={() => setActiveTabId(tab.id)}
          >
            <span style={{
              width: '8px', height: '8px', borderRadius: '2px',
              background: getLanguageColor(tab.language),
              flexShrink: 0, display: 'inline-block',
            }} />
            {tab.name}
            {tab.modified && <span style={{ color: 'hsl(38 92% 60%)', fontSize: '14px', lineHeight: 1 }}>●</span>}
            <button
              className="tab-close"
              onClick={(e) => closeTab(tab.id, e)}
              title="Close tab"
            >
              ×
            </button>
          </div>
        ))}
        <div className="tab-add" onClick={() => setShowNewFile(true)} title="New file">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </div>
      </div>
      
      <DropZone onFilesLoaded={handleDropFiles} onToast={addToast}>
        <div
          ref={splitContainerRef}
          className="split-container"
          style={{ flex: 1, minHeight: 0 }}
        >
          <div
            className="editor-panel"
            style={{ width: `${splitRatio}%` }}
          >
            <div className="panel-header">
              <span className="panel-header-title">
                <span style={{
                  display: 'inline-block',
                  width: '8px', height: '8px',
                  borderRadius: '2px',
                  background: langColor,
                  marginRight: '6px',
                  verticalAlign: 'middle',
                }} />
                {activeTab?.name || 'Editor'}
              </span>
              <div className="panel-header-actions">
                <span style={{ fontSize: '10px', color: 'hsl(var(--muted-foreground))' }}>
                  {activeTab?.language?.toUpperCase()}
                </span>
              </div>
            </div>
            
            <div style={{ flex: 1, overflow: 'hidden', fontSize: `${fontSize}px` }}>
              {activeTab && (
                <CodeEditor
                  key={activeTab.id}
                  value={activeTab.content}
                  language={activeTab.language}
                  onChange={(content) => updateTab(activeTab.id, content)}
                  showLineNumbers={showLineNumbers}
                />
              )}
            </div>
            
            {showConsole && (
              <div className="console-panel">
                <div style={{
                  fontSize: '10px',
                  fontWeight: '700',
                  color: 'hsl(var(--muted-foreground))',
                  marginBottom: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}>
                  <span>CONSOLE</span>
                  {errors.length > 0 && (
                    <span style={{ color: 'hsl(var(--destructive))' }}>
                      {errors.length} issue{errors.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                {errors.length === 0 ? (
                  <div className="console-line success">No issues found ✓</div>
                ) : (
                  errors.map((err, i) => (
                    <div key={i} className={`console-line ${err.type}`}>
                      [{err.type.toUpperCase()}] Line {err.line}: {err.message}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          
          <div
            className="split-divider"
            onMouseDown={handleDividerMouseDown}
            onTouchStart={handleDividerTouchStart}
            title="Drag to resize panels"
          />
          
          <div
            className="preview-panel"
            style={{ flex: 1, minWidth: 0 }}
          >
            <div className="panel-header">
              <span className="panel-header-title">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px', display: 'inline', verticalAlign: 'middle' }}>
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                  <line x1="8" y1="21" x2="16" y2="21"/>
                  <line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
                Live Preview
              </span>
              <div className="panel-header-actions">
                {!autoRefresh && (
                  <button
                    className="panel-icon-btn"
                    title="Refresh preview"
                    style={{ color: 'hsl(var(--primary))', width: 'auto', padding: '0 6px', fontSize: '10px' }}
                  >
                    Refresh
                  </button>
                )}
              </div>
            </div>
            
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <PreviewPanel tabs={tabs} autoRefresh={autoRefresh} />
            </div>
          </div>
        </div>
      </DropZone>
      
      <div className="status-bar">
        <div className="status-bar-left">
          <span className="status-item" style={{ color: langColor, fontWeight: '700' }}>
            {activeTab?.language?.toUpperCase() || 'HTML'}
          </span>
          <span className="status-item">Ln {lineCount}</span>
          <span className="status-item">Col –</span>
          {activeTab?.modified && (
            <span className="status-item" style={{ color: 'hsl(38 92% 70%)' }}>● Modified</span>
          )}
          {errors.length > 0 && (
            <span className="status-item" style={{ color: 'hsl(0 72% 75%)' }}>
              ⚠ {errors.length} issue{errors.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="status-bar-right">
          <span className="status-item">{charCount} chars</span>
          <span className="status-item">UTF-8</span>
          <span className="status-item" style={{ fontWeight: '700', color: '#a5f3fc' }}>
            Web Coding AIDE
          </span>
        </div>
      </div>
    </div>
  );
}
