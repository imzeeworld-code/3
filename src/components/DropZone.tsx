import { useRef, useState } from 'react';
import type { Language } from '@/lib/syntax';
import { detectLanguage } from '@/lib/syntax';
import type { FileTab } from '@/lib/syntax';

interface DropZoneProps {
  onFilesLoaded: (files: Omit<FileTab, 'modified'>[]) => void;
  onToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  children: React.ReactNode;
}

export default function DropZone({ onFilesLoaded, onToast, children }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);
  
  const processFiles = async (fileList: FileList) => {
    const results: Omit<FileTab, 'modified'>[] = [];
    
    for (const file of Array.from(fileList)) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      const allowed = ['html', 'htm', 'css', 'js', 'ts', 'tsx', 'jsx', 'json', 'md', 'txt'];
      
      if (!allowed.includes(ext || '')) {
        onToast(`Skipping ${file.name} — unsupported type`, 'info');
        continue;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        onToast(`${file.name} is too large (max 5MB)`, 'error');
        continue;
      }
      
      try {
        const content = await file.text();
        results.push({
          id: `drop-${Date.now()}-${file.name}`,
          name: file.name,
          language: detectLanguage(file.name) as Language,
          content,
        });
      } catch {
        onToast(`Failed to read ${file.name}`, 'error');
      }
    }
    
    if (results.length > 0) {
      onFilesLoaded(results);
      onToast(`Loaded ${results.length} file(s)`, 'success');
    }
  };
  
  return (
    <div
      style={{ position: 'relative', width: '100%', height: '100%' }}
      onDragEnter={(e) => {
        e.preventDefault();
        dragCounter.current++;
        if (e.dataTransfer.items.length > 0) setIsDragging(true);
      }}
      onDragLeave={() => {
        dragCounter.current--;
        if (dragCounter.current === 0) setIsDragging(false);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        dragCounter.current = 0;
        setIsDragging(false);
        processFiles(e.dataTransfer.files);
      }}
    >
      {children}
      {isDragging && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'hsl(217 91% 60% / 0.15)',
          border: '2px dashed hsl(var(--primary))',
          borderRadius: '4px',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <div style={{
            background: 'hsl(var(--card))',
            border: '1px solid hsl(var(--primary))',
            borderRadius: '8px',
            padding: '16px 24px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>📄</div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: 'hsl(var(--foreground))' }}>
              Drop files to open
            </div>
            <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>
              HTML, CSS, JS, TS, JSON, MD
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
