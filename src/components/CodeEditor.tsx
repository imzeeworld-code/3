import { useRef, useCallback, useState } from 'react';
import { highlightCode, getAutocompleteSuggestions, getIndentation, type Language } from '@/lib/syntax';

interface CodeEditorProps {
  value: string;
  language: Language;
  onChange: (value: string) => void;
  showLineNumbers?: boolean;
}

interface AutocompleteState {
  visible: boolean;
  items: string[];
  selectedIndex: number;
  top: number;
  left: number;
}

export default function CodeEditor({ value, language, onChange, showLineNumbers = true }: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const lineNumRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  const [autocomplete, setAutocomplete] = useState<AutocompleteState>({
    visible: false,
    items: [],
    selectedIndex: 0,
    top: 0,
    left: 0,
  });
  
  const syncScroll = useCallback(() => {
    const ta = textareaRef.current;
    const hl = highlightRef.current;
    const ln = lineNumRef.current;
    if (!ta || !hl) return;
    hl.scrollTop = ta.scrollTop;
    hl.scrollLeft = ta.scrollLeft;
    if (ln) ln.scrollTop = ta.scrollTop;
  }, []);
  
  const getCaretCoordinates = useCallback((pos: number): { top: number; left: number } => {
    const ta = textareaRef.current;
    if (!ta) return { top: 0, left: 0 };
    
    const text = ta.value.substring(0, pos);
    const lines = text.split('\n');
    const lineNum = lines.length - 1;
    const charNum = lines[lines.length - 1].length;
    
    const lineH = 13 * 1.6;
    const charW = 7.8;
    const padding = 12 + (showLineNumbers ? 52 : 0);
    
    return {
      top: lineNum * lineH + padding - ta.scrollTop,
      left: charNum * charW + padding - ta.scrollLeft,
    };
  }, [showLineNumbers]);
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const ta = e.currentTarget;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    
    if (autocomplete.visible) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setAutocomplete(prev => ({
          ...prev,
          selectedIndex: Math.min(prev.selectedIndex + 1, prev.items.length - 1),
        }));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setAutocomplete(prev => ({
          ...prev,
          selectedIndex: Math.max(prev.selectedIndex - 1, 0),
        }));
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        applyAutocomplete(autocomplete.items[autocomplete.selectedIndex]);
        return;
      }
      if (e.key === 'Escape') {
        setAutocomplete(prev => ({ ...prev, visible: false }));
        return;
      }
    }
    
    if (e.key === 'Tab') {
      e.preventDefault();
      const spaces = '  ';
      const newVal = value.substring(0, start) + spaces + value.substring(end);
      onChange(newVal);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + spaces.length;
      });
      return;
    }
    
    if (e.key === 'Enter') {
      e.preventDefault();
      const indent = getIndentation(value, start);
      const insert = '\n' + indent;
      const newVal = value.substring(0, start) + insert + value.substring(end);
      onChange(newVal);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + insert.length;
      });
      return;
    }
    
    const pairs: Record<string, string> = { '{': '}', '(': ')', '[': ']', '"': '"', "'": "'", '`': '`' };
    if (pairs[e.key] && start === end) {
      e.preventDefault();
      const open = e.key;
      const close = pairs[open];
      const newVal = value.substring(0, start) + open + close + value.substring(end);
      onChange(newVal);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 1;
      });
      return;
    }
    
    if (e.key === 'Backspace' && start === end && start > 0) {
      const before = value[start - 1];
      const after = value[start];
      if (pairs[before] === after) {
        e.preventDefault();
        const newVal = value.substring(0, start - 1) + value.substring(start + 1);
        onChange(newVal);
        requestAnimationFrame(() => {
          ta.selectionStart = ta.selectionEnd = start - 1;
        });
        return;
      }
    }
    
    if ((e.metaKey || e.ctrlKey) && e.key === '/') {
      e.preventDefault();
      toggleComment(start, end);
      return;
    }
  }, [value, onChange, autocomplete]);
  
  const applyAutocomplete = useCallback((item: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    
    const pos = ta.selectionStart;
    const textBefore = value.substring(0, pos);
    const lastWord = textBefore.match(/[\w.-]*$/)?.[0] || '';
    const newStart = pos - lastWord.length;
    const newVal = value.substring(0, newStart) + item + value.substring(pos);
    onChange(newVal);
    
    setAutocomplete(prev => ({ ...prev, visible: false }));
    
    requestAnimationFrame(() => {
      if (ta) {
        ta.selectionStart = ta.selectionEnd = newStart + item.length;
        ta.focus();
      }
    });
  }, [value, onChange]);
  
  const toggleComment = useCallback((start: number, end: number) => {
    const lines = value.split('\n');
    let lineStart = 0;
    let firstLine = 0;
    let lastLine = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const lineEnd = lineStart + lines[i].length;
      if (lineStart <= start && start <= lineEnd) firstLine = i;
      if (lineStart <= end && end <= lineEnd) lastLine = i;
      if (i === lastLine) break;
      lineStart += lines[i].length + 1;
    }
    
    const commentPrefix = language === 'css' ? null : '// ';
    const isCommented = lines.slice(firstLine, lastLine + 1).every(l => l.trimStart().startsWith(commentPrefix || '/* '));
    
    const newLines = lines.map((line, i) => {
      if (i < firstLine || i > lastLine) return line;
      if (language === 'css') {
        return isCommented ? line.replace(/^(\s*)\/\* ?(.+?) ?\*\/$/, '$1$2') : line.replace(/^(\s*)(.+)$/, '$1/* $2 */');
      }
      return isCommented ? line.replace(/^(\s*)\/\/ ?/, '$1') : line.replace(/^(\s*)/, '$1// ');
    });
    
    onChange(newLines.join('\n'));
  }, [value, onChange, language]);
  
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    onChange(newVal);
    
    const pos = e.target.selectionStart;
    const suggestions = getAutocompleteSuggestions(newVal, pos, language);
    
    if (suggestions.length > 0) {
      const coords = getCaretCoordinates(pos);
      setAutocomplete({
        visible: true,
        items: suggestions,
        selectedIndex: 0,
        top: coords.top + 20,
        left: coords.left,
      });
    } else {
      setAutocomplete(prev => ({ ...prev, visible: false }));
    }
  }, [onChange, language, getCaretCoordinates]);
  
  const lineCount = value.split('\n').length;
  
  const highlighted = highlightCode(value, language);
  
  return (
    <div
      ref={wrapperRef}
      className={`code-editor-wrapper ${showLineNumbers ? 'has-line-numbers' : ''}`}
      onClick={() => textareaRef.current?.focus()}
    >
      {showLineNumbers && (
        <div ref={lineNumRef} className="line-numbers">
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
      )}
      
      <div
        ref={highlightRef}
        className="code-highlight-layer"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: highlighted + '\n\u200b' }}
      />
      
      <textarea
        ref={textareaRef}
        className="code-textarea"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onScroll={syncScroll}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        data-gramm="false"
        style={{ fontFamily: 'var(--app-font-mono)' }}
      />
      
      {autocomplete.visible && autocomplete.items.length > 0 && (
        <div
          className="autocomplete-dropdown"
          style={{
            position: 'absolute',
            top: autocomplete.top,
            left: autocomplete.left,
            zIndex: 100,
          }}
        >
          {autocomplete.items.map((item, i) => (
            <div
              key={item}
              className={`autocomplete-item ${i === autocomplete.selectedIndex ? 'active' : ''}`}
              onMouseDown={(e) => {
                e.preventDefault();
                applyAutocomplete(item);
              }}
            >
              <span className="autocomplete-type">{language.slice(0, 2).toUpperCase()}</span>
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
