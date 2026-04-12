export type Language = 'html' | 'css' | 'javascript' | 'typescript' | 'json' | 'markdown';

export interface FileTab {
  id: string;
  name: string;
  language: Language;
  content: string;
  modified: boolean;
}

export function detectLanguage(filename: string): Language {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'html': return 'html';
    case 'css': return 'css';
    case 'js': return 'javascript';
    case 'ts': case 'tsx': case 'jsx': return 'typescript';
    case 'json': return 'json';
    case 'md': case 'markdown': return 'markdown';
    default: return 'html';
  }
}

export function getLanguageColor(lang: Language): string {
  switch (lang) {
    case 'html': return '#e34c26';
    case 'css': return '#264de4';
    case 'javascript': return '#f7df1e';
    case 'typescript': return '#3178c6';
    case 'json': return '#cbcb41';
    case 'markdown': return '#083fa1';
  }
}

export function getLanguageIcon(lang: Language): string {
  switch (lang) {
    case 'html': return 'H';
    case 'css': return 'C';
    case 'javascript': return 'J';
    case 'typescript': return 'T';
    case 'json': return '{}';
    case 'markdown': return 'M';
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function highlightHTML(code: string): string {
  let escaped = escapeHtml(code);
  
  escaped = escaped.replace(
    /(&lt;!--[\s\S]*?--&gt;)/g,
    '<span class="token-comment">$1</span>'
  );
  escaped = escaped.replace(
    /(&lt;!DOCTYPE[^&]*&gt;)/gi,
    '<span class="token-doctype">$1</span>'
  );
  escaped = escaped.replace(
    /(&lt;\/?)([\w-]+)/g,
    '$1<span class="token-tag">$2</span>'
  );
  escaped = escaped.replace(
    / ([\w-]+)=/g,
    ' <span class="token-attribute">$1</span>='
  );
  escaped = escaped.replace(
    /(=)(&quot;[^&]*&quot;|&#39;[^&]*&#39;)/g,
    '$1<span class="token-value">$2</span>'
  );
  
  return escaped;
}

export function highlightCSS(code: string): string {
  let escaped = escapeHtml(code);
  
  escaped = escaped.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="token-comment">$1</span>');
  escaped = escaped.replace(/(@[\w-]+)/g, '<span class="token-at-rule">$1</span>');
  escaped = escaped.replace(/([.#]?[\w-]+\s*)(\{)/g, '<span class="token-selector">$1</span>$2');
  escaped = escaped.replace(/([\w-]+)(\s*:)/g, '<span class="token-property">$1</span>$2');
  escaped = escaped.replace(/:\s*([^;{}]+)/g, ': <span class="token-value">$1</span>');
  
  return escaped;
}

export function highlightJS(code: string): string {
  let escaped = escapeHtml(code);
  
  escaped = escaped.replace(/(\/\/[^\n]*)/g, '<span class="token-comment">$1</span>');
  escaped = escaped.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="token-comment">$1</span>');
  escaped = escaped.replace(
    /\b(const|let|var|function|class|return|if|else|for|while|do|switch|case|break|continue|import|export|from|default|new|this|typeof|instanceof|void|null|undefined|true|false|async|await|try|catch|finally|throw|extends|super|static|get|set|of|in|delete|yield)\b/g,
    '<span class="token-keyword">$1</span>'
  );
  escaped = escaped.replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g, '<span class="token-string">$1</span>');
  escaped = escaped.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="token-number">$1</span>');
  escaped = escaped.replace(/\b([\w$]+)\s*(?=\()/g, '<span class="token-function">$1</span>');
  
  return escaped;
}

export function highlightJSON(code: string): string {
  let escaped = escapeHtml(code);
  
  escaped = escaped.replace(/("(?:[^"\\]|\\.)*")(\s*:)/g, '<span class="token-attribute">$1</span>$2');
  escaped = escaped.replace(/:\s*("(?:[^"\\]|\\.)*")/g, ': <span class="token-string">$1</span>');
  escaped = escaped.replace(/\b(true|false|null)\b/g, '<span class="token-keyword">$1</span>');
  escaped = escaped.replace(/\b(\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\b/g, '<span class="token-number">$1</span>');
  
  return escaped;
}

export function highlightCode(code: string, language: Language): string {
  switch (language) {
    case 'html': return highlightHTML(code);
    case 'css': return highlightCSS(code);
    case 'javascript':
    case 'typescript': return highlightJS(code);
    case 'json': return highlightJSON(code);
    default: return escapeHtml(code);
  }
}

export const DEFAULT_TEMPLATES: Record<Language, string> = {
  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Web App</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0f172a;
      color: #f1f5f9;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .container {
      text-align: center;
      padding: 40px;
    }
    h1 {
      font-size: 2.5rem;
      font-weight: 800;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 16px;
    }
    p {
      font-size: 1.1rem;
      color: #94a3b8;
      margin-bottom: 32px;
    }
    button {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white;
      border: none;
      padding: 12px 28px;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Hello, World!</h1>
    <p>Start building your web app here.</p>
    <button onclick="alert('Web Coding AIDE!')">Click Me</button>
  </div>
</body>
</html>`,
  css: `/* Web Coding AIDE - CSS Template */
:root {
  --primary: #6366f1;
  --bg: #0f172a;
  --text: #f1f5f9;
  --card: #1e293b;
  --border: #334155;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: var(--bg);
  color: var(--text);
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
}

.btn {
  background: var(--primary);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: opacity 0.2s;
}

.btn:hover {
  opacity: 0.9;
}`,
  javascript: `// Web Coding AIDE - JavaScript Template
'use strict';

const app = {
  init() {
    console.log('App initialized!');
    this.setupEventListeners();
  },
  
  setupEventListeners() {
    document.addEventListener('DOMContentLoaded', () => {
      const btn = document.querySelector('.btn');
      if (btn) {
        btn.addEventListener('click', this.handleClick.bind(this));
      }
    });
  },
  
  handleClick(event) {
    console.log('Button clicked!', event.target);
    const output = document.querySelector('#output');
    if (output) {
      output.textContent = 'Hello from JavaScript!';
    }
  },
  
  fetchData: async (url) => {
    try {
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  }
};

app.init();`,
  typescript: `// Web Coding AIDE - TypeScript Template
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

class UserService {
  private baseUrl: string;
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }
  
  async getUser(id: number): Promise<User> {
    const response = await fetch(\`\${this.baseUrl}/users/\${id}\`);
    const result: ApiResponse<User> = await response.json();
    return result.data;
  }
  
  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const response = await fetch(\`\${this.baseUrl}/users/\${id}\`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result: ApiResponse<User> = await response.json();
    return result.data;
  }
}

const service = new UserService('https://api.example.com');
export default service;`,
  json: `{
  "name": "my-web-app",
  "version": "1.0.0",
  "description": "Built with Web Coding AIDE",
  "main": "index.html",
  "scripts": {
    "start": "live-server",
    "build": "webpack --mode production"
  },
  "dependencies": {
    "firebase": "^10.0.0"
  },
  "devDependencies": {
    "webpack": "^5.0.0",
    "live-server": "^1.2.2"
  },
  "keywords": ["web", "app"],
  "author": "",
  "license": "MIT"
}`,
  markdown: `# My Project

Built with **Web Coding AIDE**

## Getting Started

1. Clone the repository
2. Open \`index.html\` in your browser
3. Start coding!

## Features

- Responsive design
- Mobile-first approach
- Clean, modern UI

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript

## License

MIT License
`
};

export function getAutocompleteSuggestions(code: string, cursorPos: number, language: Language): string[] {
  const textBefore = code.substring(0, cursorPos);
  const lastWord = textBefore.match(/[\w.-]*$/)?.[0] || '';
  
  if (lastWord.length < 2) return [];
  
  const htmlTags = ['div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'img', 'input', 'button', 'form', 'ul', 'li', 'ol', 'table', 'tr', 'td', 'th', 'section', 'article', 'header', 'footer', 'nav', 'main', 'aside', 'script', 'style', 'link', 'meta', 'head', 'body', 'html', 'select', 'option', 'textarea', 'label', 'fieldset', 'legend', 'details', 'summary', 'video', 'audio', 'canvas', 'svg'];
  const htmlAttrs = ['class', 'id', 'style', 'href', 'src', 'alt', 'type', 'name', 'value', 'placeholder', 'required', 'disabled', 'readonly', 'checked', 'selected', 'multiple', 'data-', 'aria-', 'role', 'onclick', 'onchange', 'onsubmit', 'target', 'rel', 'method', 'action', 'enctype', 'for', 'tabindex'];
  const cssProps = ['display', 'position', 'width', 'height', 'margin', 'padding', 'color', 'background', 'background-color', 'border', 'border-radius', 'font-size', 'font-weight', 'font-family', 'text-align', 'flex', 'flex-direction', 'justify-content', 'align-items', 'gap', 'grid', 'grid-template-columns', 'transform', 'transition', 'animation', 'z-index', 'overflow', 'opacity', 'box-shadow', 'cursor', 'pointer-events', 'user-select', 'line-height', 'letter-spacing', 'text-decoration'];
  const jsKeywords = ['const', 'let', 'var', 'function', 'class', 'return', 'if', 'else', 'for', 'while', 'async', 'await', 'import', 'export', 'default', 'new', 'this', 'typeof', 'instanceof', 'try', 'catch', 'finally', 'throw', 'document', 'window', 'console', 'Math', 'Array', 'Object', 'Promise', 'fetch', 'addEventListener', 'querySelector', 'querySelectorAll', 'getElementById', 'createElement', 'appendChild', 'removeChild', 'innerHTML', 'textContent', 'classList', 'setAttribute', 'getAttribute', 'JSON', 'localStorage', 'sessionStorage', 'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval'];
  
  let pool: string[] = [];
  
  switch (language) {
    case 'html': pool = [...htmlTags, ...htmlAttrs]; break;
    case 'css': pool = cssProps; break;
    case 'javascript': case 'typescript': pool = jsKeywords; break;
    case 'json': pool = ['true', 'false', 'null']; break;
    default: pool = [];
  }
  
  const lower = lastWord.toLowerCase();
  return pool.filter(s => s.toLowerCase().startsWith(lower) && s !== lastWord).slice(0, 8);
}

export function getIndentation(code: string, cursorPos: number): string {
  const lineStart = code.lastIndexOf('\n', cursorPos - 1) + 1;
  const currentLine = code.substring(lineStart, cursorPos);
  const match = currentLine.match(/^(\s*)/);
  let indent = match ? match[1] : '';
  
  const trimmedLine = currentLine.trim();
  if (trimmedLine.endsWith('{') || trimmedLine.endsWith('(') || trimmedLine.endsWith('[') || trimmedLine.endsWith('>')) {
    indent += '  ';
  }
  
  return indent;
}

export function findErrors(code: string, language: Language): Array<{line: number, message: string, type: 'error' | 'warn'}> {
  const errors: Array<{line: number, message: string, type: 'error' | 'warn'}> = [];
  const lines = code.split('\n');
  
  if (language === 'html') {
    const openTags: string[] = [];
    const selfClosing = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
    
    lines.forEach((line, i) => {
      const openMatches = line.matchAll(/<([\w-]+)(?:\s[^>]*)?\s*(?!\/)>/g);
      for (const m of openMatches) {
        const tag = m[1].toLowerCase();
        if (!selfClosing.has(tag)) openTags.push(tag);
      }
      const closeMatches = line.matchAll(/<\/([\w-]+)>/g);
      for (const m of closeMatches) {
        const tag = m[1].toLowerCase();
        const idx = openTags.lastIndexOf(tag);
        if (idx === -1) {
          errors.push({ line: i + 1, message: `Unexpected closing tag </${tag}>`, type: 'error' });
        } else {
          openTags.splice(idx, 1);
        }
      }
    });
  }
  
  if (language === 'javascript' || language === 'typescript') {
    let braceCount = 0;
    let parenCount = 0;
    
    lines.forEach((line, i) => {
      for (const ch of line) {
        if (ch === '{') braceCount++;
        if (ch === '}') braceCount--;
        if (ch === '(') parenCount++;
        if (ch === ')') parenCount--;
      }
      if (braceCount < 0) {
        errors.push({ line: i + 1, message: 'Unexpected }', type: 'error' });
        braceCount = 0;
      }
    });
    
    if (braceCount > 0) {
      errors.push({ line: lines.length, message: `Missing ${braceCount} closing brace(s)`, type: 'error' });
    }
  }
  
  if (language === 'json') {
    try {
      JSON.parse(code);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Invalid JSON';
      const lineMatch = msg.match(/line (\d+)/i);
      const lineNum = lineMatch ? parseInt(lineMatch[1]) : 1;
      errors.push({ line: lineNum, message: msg, type: 'error' });
    }
  }
  
  return errors;
}

export function buildPreviewDocument(tabs: FileTab[]): string {
  const htmlTab = tabs.find(t => t.language === 'html');
  const cssTab = tabs.find(t => t.language === 'css');
  const jsTab = tabs.find(t => t.language === 'javascript' || t.language === 'typescript');
  
  if (!htmlTab) {
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><p style="font-family:sans-serif;color:#888;padding:20px">Add an HTML file to see the preview.</p></body></html>`;
  }
  
  let doc = htmlTab.content;
  
  if (cssTab && !doc.includes('<style>') && !doc.includes('<link')) {
    doc = doc.replace('</head>', `<style>\n${cssTab.content}\n</style>\n</head>`);
  }
  
  if (jsTab && !doc.includes('<script>') && !doc.includes('<script src')) {
    doc = doc.replace('</body>', `<script>\n${jsTab.content}\n</script>\n</body>`);
  }
  
  return doc;
}
