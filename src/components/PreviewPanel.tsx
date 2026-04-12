import { useRef, useEffect, useState, useCallback } from 'react';
import { buildPreviewDocument, type FileTab } from '@/lib/syntax';

interface PreviewPanelProps {
  tabs: FileTab[];
  autoRefresh?: boolean;
}

export default function PreviewPanel({ tabs, autoRefresh = true }: PreviewPanelProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [isLoading, setIsLoading] = useState(false);
  
  const refresh = useCallback(() => {
    setIsLoading(true);
    setLastRefresh(Date.now());
    setTimeout(() => setIsLoading(false), 300);
  }, []);
  
  useEffect(() => {
    if (!autoRefresh) return;
    
    const timer = setTimeout(() => {
      const iframe = iframeRef.current;
      if (!iframe) return;
      
      const doc = buildPreviewDocument(tabs);
      const blob = new Blob([doc], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      const prevUrl = iframe.src;
      iframe.src = url;
      
      if (prevUrl && prevUrl.startsWith('blob:')) {
        URL.revokeObjectURL(prevUrl);
      }
      
      setIsLoading(false);
    }, 600);
    
    return () => clearTimeout(timer);
  }, [tabs, autoRefresh, lastRefresh]);
  
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    
    const doc = buildPreviewDocument(tabs);
    const blob = new Blob([doc], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    iframe.src = url;
    
    return () => URL.revokeObjectURL(url);
  }, []);
  
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#fff' }}>
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
          zIndex: 10,
          animation: 'progress-bar 0.6s ease',
        }} />
      )}
      <iframe
        ref={iframeRef}
        className="preview-frame"
        title="Preview"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
        style={{ width: '100%', height: '100%', border: 'none' }}
      />
    </div>
  );
}
