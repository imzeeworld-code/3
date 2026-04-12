import { useState } from 'react';
import type { Language } from '@/lib/syntax';
import { detectLanguage, DEFAULT_TEMPLATES } from '@/lib/syntax';

interface NewFileModalProps {
  onClose: () => void;
  onCreate: (name: string, language: Language, content: string) => void;
}

const PRESETS = [
  { name: 'index.html', label: 'HTML Page', icon: 'H', color: '#e34c26' },
  { name: 'styles.css', label: 'Stylesheet', icon: 'C', color: '#264de4' },
  { name: 'app.js', label: 'JavaScript', icon: 'J', color: '#f7df1e' },
  { name: 'app.ts', label: 'TypeScript', icon: 'T', color: '#3178c6' },
  { name: 'data.json', label: 'JSON Data', icon: '{}', color: '#cbcb41' },
  { name: 'README.md', label: 'Markdown', icon: 'M', color: '#083fa1' },
];

export default function NewFileModal({ onClose, onCreate }: NewFileModalProps) {
  const [name, setName] = useState('');
  
  const handleCreate = (preset?: typeof PRESETS[0]) => {
    const finalName = preset ? preset.name : name.trim();
    if (!finalName) return;
    const lang = detectLanguage(finalName);
    const content = DEFAULT_TEMPLATES[lang] || '';
    onCreate(finalName, lang, content);
    onClose();
  };
  
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <div className="modal-title">New File</div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'hsl(var(--muted-foreground))', cursor: 'pointer', fontSize: '18px', padding: '0 4px' }}
          >
            ×
          </button>
        </div>
        <div className="modal-subtitle">Choose a preset or enter a custom filename</div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
          {PRESETS.map(p => (
            <button
              key={p.name}
              onClick={() => handleCreate(p)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                background: 'hsl(var(--muted))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                cursor: 'pointer',
                color: 'hsl(var(--foreground))',
                textAlign: 'left',
                transition: 'all 0.15s',
                fontFamily: 'inherit',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = p.color)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'hsl(var(--border))')}
            >
              <span style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                background: p.color + '22',
                color: p.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: '800',
                flexShrink: 0,
                fontFamily: 'var(--app-font-mono)',
              }}>
                {p.icon}
              </span>
              <div>
                <div style={{ fontSize: '12px', fontWeight: '600' }}>{p.label}</div>
                <div style={{ fontSize: '10px', color: 'hsl(var(--muted-foreground))' }}>{p.name}</div>
              </div>
            </button>
          ))}
        </div>
        
        <div style={{ borderTop: '1px solid hsl(var(--border))', paddingTop: '12px' }}>
          <label style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', marginBottom: '6px', display: 'block' }}>
            Custom filename
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              className="modal-input"
              style={{ marginBottom: 0, flex: 1 }}
              placeholder="my-component.html"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              autoFocus
            />
            <button
              className="modal-btn primary"
              onClick={() => handleCreate()}
              disabled={!name.trim()}
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
