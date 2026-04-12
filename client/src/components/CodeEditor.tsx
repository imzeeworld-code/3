import { useEffect, useRef } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { basicSetup } from '@codemirror/basic-setup';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: 'html' | 'css' | 'javascript' | 'json';
}

export default function CodeEditor({ value, onChange, language }: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    const getLanguageExtension = () => {
      switch (language) {
        case 'html':
          return html();
        case 'css':
          return css();
        case 'javascript':
          return javascript();
        case 'json':
          return json();
        default:
          return javascript();
      }
    };

    const state = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        getLanguageExtension(),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString());
          }
        }),
        EditorView.theme({
          '.cm-editor': {
            backgroundColor: '#111827',
            color: '#f3f4f6',
            height: '100%',
            fontSize: '14px',
          },
          '.cm-gutters': {
            backgroundColor: '#0f172a',
            borderRight: '1px solid #1e293b',
          },
          '.cm-activeLineGutter': {
            backgroundColor: '#1e293b',
          },
          '.cm-cursor': {
            borderLeftColor: '#60a5fa',
          },
          '.cm-selectionBackground': {
            backgroundColor: '#1e40af',
          },
          '.cm-matchingBracket': {
            backgroundColor: '#1e40af',
            outline: '1px solid #60a5fa',
          },
        }, { dark: true }),
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [language]);

  // Update editor content when value changes externally
  useEffect(() => {
    if (viewRef.current && viewRef.current.state.doc.toString() !== value) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: value,
        },
      });
    }
  }, [value]);

  return (
    <div
      ref={editorRef}
      className="w-full h-full bg-gray-900 text-gray-100 overflow-hidden"
      style={{ fontFamily: "'Fira Code', 'Courier New', monospace" }}
    />
  );
}
