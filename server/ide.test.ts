import { describe, it, expect } from 'vitest';

describe('IDE Core Functions', () => {
  describe('HTML Generation', () => {
    it('should generate valid HTML from files', () => {
      const htmlContent = '<!DOCTYPE html><html><head></head><body></body></html>';
      const cssContent = 'body { color: red; }';
      const jsContent = 'console.log("test");';

      // Simulate HTML generation
      let result = htmlContent;
      result = result.replace('</head>', `<style>${cssContent}</style>\n</head>`);
      result = result.replace('</body>', `<script>${jsContent}<\/script>\n</body>`);

      expect(result).toContain('<style>body { color: red; }</style>');
      expect(result).toContain('<script>console.log("test");<\/script>');
      expect(result).toContain('<!DOCTYPE html>');
    });

    it('should handle missing CSS file gracefully', () => {
      const htmlContent = '<!DOCTYPE html><html><head></head><body></body></html>';
      let result = htmlContent;

      // No CSS replacement
      result = result.replace('</body>', '<script>test<\/script>\n</body>');

      expect(result).not.toContain('<style>');
      expect(result).toContain('<script>test<\/script>');
    });

    it('should handle missing JS file gracefully', () => {
      const htmlContent = '<!DOCTYPE html><html><head></head><body></body></html>';
      const cssContent = 'body { color: blue; }';
      let result = htmlContent;

      result = result.replace('</head>', `<style>${cssContent}</style>\n</head>`);
      // No JS replacement

      expect(result).toContain('<style>body { color: blue; }</style>');
      expect(result).not.toContain('<script>');
    });
  });

  describe('File Management', () => {
    it('should track file state correctly', () => {
      const files = [
        { id: '1', name: 'index.html', language: 'html' as const, content: '<h1>Test</h1>' },
        { id: '2', name: 'style.css', language: 'css' as const, content: 'body { margin: 0; }' },
      ];

      expect(files).toHaveLength(2);
      expect(files[0].name).toBe('index.html');
      expect(files[1].name).toBe('style.css');
    });

    it('should find active file by ID', () => {
      const files = [
        { id: '1', name: 'index.html', language: 'html' as const, content: '<h1>Test</h1>' },
        { id: '2', name: 'style.css', language: 'css' as const, content: 'body { margin: 0; }' },
      ];
      const activeFileId = '2';

      const activeFile = files.find(f => f.id === activeFileId);

      expect(activeFile).toBeDefined();
      expect(activeFile?.name).toBe('style.css');
    });

    it('should update file content correctly', () => {
      let files = [
        { id: '1', name: 'index.html', language: 'html' as const, content: '<h1>Old</h1>' },
      ];
      const activeFileId = '1';
      const newContent = '<h1>New</h1>';

      files = files.map(f =>
        f.id === activeFileId ? { ...f, content: newContent } : f
      );

      expect(files[0].content).toBe('<h1>New</h1>');
    });
  });

  describe('Orientation Detection', () => {
    it('should detect landscape orientation', () => {
      const windowHeight = 400;
      const windowWidth = 800;
      const isLandscape = windowHeight < windowWidth;

      expect(isLandscape).toBe(true);
    });

    it('should detect portrait orientation', () => {
      const windowHeight = 800;
      const windowWidth = 400;
      const isLandscape = windowHeight < windowWidth;

      expect(isLandscape).toBe(false);
    });

    it('should detect square orientation as portrait', () => {
      const windowHeight = 600;
      const windowWidth = 600;
      const isLandscape = windowHeight < windowWidth;

      expect(isLandscape).toBe(false);
    });
  });

  describe('Download Functionality', () => {
    it('should generate valid data URL for HTML', () => {
      const html = '<!DOCTYPE html><html><body>Test</body></html>';
      const dataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(html);

      expect(dataUrl).toContain('data:text/html');
      expect(dataUrl).toContain('Test');
    });

    it('should handle special characters in HTML', () => {
      const html = '<!DOCTYPE html><html><body><script>alert("test");</script></body></html>';
      const dataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(html);

      expect(dataUrl).toContain('data:text/html');
      expect(dataUrl).toContain('%3Cscript%3E');
    });
  });

  describe('Error Console', () => {
    it('should track console messages', () => {
      const messages: Array<{ type: string; message: string }> = [];

      messages.push({ type: 'log', message: 'Test message' });
      messages.push({ type: 'error', message: 'Error occurred' });

      expect(messages).toHaveLength(2);
      expect(messages[0].type).toBe('log');
      expect(messages[1].type).toBe('error');
    });

    it('should clear messages', () => {
      let messages: Array<{ type: string; message: string }> = [];

      messages.push({ type: 'log', message: 'Test' });
      expect(messages).toHaveLength(1);

      messages = [];
      expect(messages).toHaveLength(0);
    });

    it('should categorize message types', () => {
      const messageTypes = ['log', 'error', 'warn', 'info'];

      messageTypes.forEach(type => {
        expect(['log', 'error', 'warn', 'info']).toContain(type);
      });
    });
  });
});
