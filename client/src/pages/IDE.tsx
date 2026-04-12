import { useState, useEffect, useRef } from 'react';
import { RotateCcw, Plus, Trash2, Download } from 'lucide-react';
import CodeEditor from '@/components/CodeEditor';
import ErrorConsole from '@/components/ErrorConsole';
import GitHubIntegration from '@/components/GitHubIntegration';
import BackendConfig from '@/components/BackendConfig';

interface EditorFile {
  id: string;
  name: string;
  language: 'html' | 'css' | 'javascript' | 'json';
  content: string;
}

export default function IDE() {
  const [isLandscape, setIsLandscape] = useState(false);
  const [files, setFiles] = useState<EditorFile[]>([
    { 
      id: '1', 
      name: 'index.html', 
      language: 'html', 
      content: '<!DOCTYPE html>\n<html>\n<head>\n  <title>Web Codding AIDE</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <h1>Welcome to Web Codding AIDE</h1>\n  <p>Start coding in the editor on the left!</p>\n  <script src="script.js"><\/script>\n</body>\n</html>' 
    },
    { 
      id: '2', 
      name: 'style.css', 
      language: 'css', 
      content: 'body {\n  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;\n  margin: 0;\n  padding: 20px;\n  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n  color: white;\n}\n\nh1 {\n  font-size: 2.5rem;\n  margin-bottom: 1rem;\n}\n\np {\n  font-size: 1.1rem;\n  line-height: 1.6;\n}' 
    },
    { 
      id: '3', 
      name: 'script.js', 
      language: 'javascript', 
      content: 'console.log("Web Codding AIDE is ready!");\n\n// Add your JavaScript code here\ndocument.addEventListener("DOMContentLoaded", () => {\n  console.log("DOM loaded successfully");\n});' 
    },
  ]);
  const [activeFileId, setActiveFileId] = useState('1');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Detect landscape orientation
  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.innerHeight < window.innerWidth);
    };

    checkOrientation();
    window.addEventListener('orientationchange', checkOrientation);
    window.addEventListener('resize', checkOrientation);

    return () => {
      window.removeEventListener('orientationchange', checkOrientation);
      window.removeEventListener('resize', checkOrientation);
    };
  }, []);

  // Generate preview HTML
  const generatePreviewHTML = () => {
    const htmlFile = files.find(f => f.name === 'index.html');
    const cssFile = files.find(f => f.name === 'style.css');
    const jsFile = files.find(f => f.name === 'script.js');

    if (!htmlFile) return '';

    let html = htmlFile.content;
    
    // Inject CSS
    if (cssFile) {
      html = html.replace('</head>', `<style>${cssFile.content}</style>\n</head>`);
    }

    // Inject JS
    if (jsFile) {
      html = html.replace('</body>', `<script>${jsFile.content}<\/script>\n</body>`);
    }

    return html;
  };

  // Update iframe preview
  useEffect(() => {
    if (iframeRef.current) {
      const previewHTML = generatePreviewHTML();
      iframeRef.current.srcdoc = previewHTML;
    }
  }, [files]);

  const activeFile = files.find(f => f.id === activeFileId);

  const handleEditorChange = (newContent: string) => {
    setFiles(files.map(f => 
      f.id === activeFileId ? { ...f, content: newContent } : f
    ));
  };

  const downloadProject = () => {
    const previewHTML = generatePreviewHTML();
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/html;charset=utf-8,' + encodeURIComponent(previewHTML));
    element.setAttribute('download', 'index.html');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (!isLandscape) {
    return (
      <div className="fixed inset-0 bg-gray-950 flex items-center justify-center z-50">
        <div className="text-center text-white px-6">
          <RotateCcw className="w-16 h-16 mx-auto mb-6 animate-spin" />
          <h1 className="text-3xl font-bold mb-4">Rotate Your Phone</h1>
          <p className="text-lg text-gray-300 mb-8">
            Web Codding AIDE works best in landscape mode. Please rotate your device to continue.
          </p>
          <div className="text-sm text-gray-400">
            <p>Turn your phone sideways to access the full IDE experience</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-gray-950 text-gray-100 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-3 py-2 flex items-center justify-between flex-shrink-0">
        <h1 className="text-sm font-bold text-white">Web Codding AIDE</h1>
        <div className="flex items-center gap-2">
          <BackendConfig />
          <GitHubIntegration projectHTML={generatePreviewHTML()} />
          <button
            onClick={downloadProject}
            className="p-1.5 hover:bg-gray-800 rounded transition-colors"
            title="Download project"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="bg-gray-900 border-b border-gray-800 flex overflow-x-auto flex-shrink-0 px-2 py-1 gap-1">
        {files.map(file => (
          <div key={file.id} className="flex items-center gap-1">
            <button
              onClick={() => setActiveFileId(file.id)}
              className={`px-2 py-1 text-xs font-medium whitespace-nowrap rounded transition-colors ${
                activeFileId === file.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {file.name}
            </button>
          </div>
        ))}
      </div>

      {/* Main IDE Area */}
      <div className="flex flex-1 overflow-hidden gap-0">
        {/* Editor Panel */}
        <div className="flex-1 flex flex-col bg-gray-950 border-r border-gray-800 overflow-hidden">
          <div className="flex-1 overflow-hidden">
            {activeFile && (
              <CodeEditor
                value={activeFile.content}
                onChange={handleEditorChange}
                language={activeFile.language}
              />
            )}
          </div>
        </div>

        {/* Preview Panel */}
        <div className="flex-1 flex flex-col bg-gray-950 overflow-hidden">
          <div className="bg-gray-900 border-b border-gray-800 px-3 py-1 text-xs text-gray-400 flex-shrink-0">
            Live Preview
          </div>
          <div className="flex-1 overflow-auto">
            <iframe
              ref={iframeRef}
              className="w-full h-full border-none bg-white"
              title="Live Preview"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>
      </div>

      {/* Error Console */}
      <ErrorConsole iframeRef={iframeRef as React.RefObject<HTMLIFrameElement>} />
    </div>
  );
}
