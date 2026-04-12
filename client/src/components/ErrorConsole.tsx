import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, Info, Trash2 } from 'lucide-react';

interface ConsoleMessage {
  id: string;
  type: 'log' | 'error' | 'warn' | 'info';
  message: string;
  timestamp: number;
}

interface ErrorConsoleProps {
  iframeRef: React.RefObject<HTMLIFrameElement>;
}

export default function ErrorConsole({ iframeRef }: ErrorConsoleProps) {
  const [messages, setMessages] = useState<ConsoleMessage[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (!iframeRef.current) return;

    const iframe = iframeRef.current;
    let messageId = 0;

    const setupConsoleCapture = () => {
      try {
        const iframeWindow = iframe.contentWindow as any;
        if (!iframeWindow) return;

        const originalLog = iframeWindow.console?.log || console.log;
        const originalError = iframeWindow.console?.error || console.error;
        const originalWarn = iframeWindow.console?.warn || console.warn;
        const originalInfo = iframeWindow.console?.info || console.info;

        const addMessage = (type: ConsoleMessage['type'], args: any[]) => {
          const message = args.map(arg => {
            if (typeof arg === 'object') {
              try {
                return JSON.stringify(arg, null, 2);
              } catch {
                return String(arg);
              }
            }
            return String(arg);
          }).join(' ');

          setMessages(prev => [
            ...prev,
            {
              id: `msg-${messageId++}`,
              type,
              message,
              timestamp: Date.now(),
            },
          ]);
        };

        if (iframeWindow.console) {
          iframeWindow.console.log = (...args: any[]) => {
            addMessage('log', args);
            originalLog.apply(iframeWindow.console, args);
          };

          iframeWindow.console.error = (...args: any[]) => {
            addMessage('error', args);
            originalError.apply(iframeWindow.console, args);
          };

          iframeWindow.console.warn = (...args: any[]) => {
            addMessage('warn', args);
            originalWarn.apply(iframeWindow.console, args);
          };

          iframeWindow.console.info = (...args: any[]) => {
            addMessage('info', args);
            originalInfo.apply(iframeWindow.console, args);
          };
        }

        // Capture runtime errors
        if (iframeWindow.addEventListener) {
          iframeWindow.addEventListener('error', (event: any) => {
            addMessage('error', [
              `${event.error?.name || 'Error'}: ${event.message}`,
              `at ${event.filename}:${event.lineno}:${event.colno}`,
            ]);
          });
        }
      } catch (e) {
        console.error('Failed to setup console capture:', e);
      }
    };

    // Wait for iframe to load
    const onLoad = () => {
      setMessages([]);
      setupConsoleCapture();
    };

    iframe.addEventListener('load', onLoad);
    if ((iframe.contentWindow as any)?.document?.readyState === 'complete') {
      setupConsoleCapture();
    }

    return () => {
      iframe.removeEventListener('load', onLoad);
    };
  }, [iframeRef]);

  const getMessageIcon = (type: ConsoleMessage['type']) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warn':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return <span className="w-4 h-4 text-gray-500">›</span>;
    }
  };

  const getMessageColor = (type: ConsoleMessage['type']) => {
    switch (type) {
      case 'error':
        return 'text-red-400';
      case 'warn':
        return 'text-yellow-400';
      case 'info':
        return 'text-blue-400';
      default:
        return 'text-gray-300';
    }
  };

  return (
    <div className="bg-gray-900 border-t border-gray-800 flex flex-col h-32 flex-shrink-0">
      {/* Console Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 transition-colors"
      >
        {isOpen ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronUp className="w-4 h-4" />
        )}
        <span className="text-sm font-semibold">Console</span>
        <span className="text-xs text-gray-500 ml-auto">
          {messages.length} message{messages.length !== 1 ? 's' : ''}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMessages([]);
          }}
          className="ml-2 p-1 hover:bg-gray-600 rounded transition-colors"
          title="Clear console"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </button>

      {/* Console Messages */}
      {isOpen && (
        <div className="flex-1 overflow-auto bg-gray-950 text-xs font-mono">
          {messages.length === 0 ? (
            <div className="p-3 text-gray-500">Console is empty</div>
          ) : (
            messages.map(msg => (
              <div
                key={msg.id}
                className="px-3 py-1 border-b border-gray-800 flex gap-2 items-start hover:bg-gray-900 transition-colors"
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getMessageIcon(msg.type)}
                </div>
                <div className={`flex-1 break-words ${getMessageColor(msg.type)}`}>
                  {msg.message}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
