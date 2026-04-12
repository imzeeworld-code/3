import type { FileTab } from './syntax';
import { buildPreviewDocument } from './syntax';

export function downloadFile(filename: string, content: string, mimeType = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadCurrentFile(tab: FileTab): void {
  const mimeTypes: Record<string, string> = {
    html: 'text/html',
    css: 'text/css',
    javascript: 'text/javascript',
    typescript: 'text/typescript',
    json: 'application/json',
    markdown: 'text/markdown',
  };
  
  downloadFile(tab.name, tab.content, mimeTypes[tab.language] || 'text/plain');
}

export function downloadFullProject(tabs: FileTab[]): void {
  const htmlTab = tabs.find(t => t.language === 'html');
  
  if (!htmlTab) {
    const content = buildPreviewDocument(tabs);
    downloadFile('index.html', content, 'text/html');
    return;
  }
  
  const fullDoc = buildPreviewDocument(tabs);
  downloadFile(htmlTab.name || 'index.html', fullDoc, 'text/html');
}

export function downloadAsZip(tabs: FileTab[]): void {
  const content = tabs.map(tab => {
    return `=== ${tab.name} ===\n${tab.content}\n`;
  }).join('\n\n');
  
  downloadFile('web-coding-aide-project.txt', content, 'text/plain');
}

export function getMimeType(language: string): string {
  const types: Record<string, string> = {
    html: 'text/html',
    css: 'text/css',
    javascript: 'text/javascript',
    typescript: 'text/typescript',
    json: 'application/json',
    markdown: 'text/markdown',
  };
  return types[language] || 'text/plain';
}
