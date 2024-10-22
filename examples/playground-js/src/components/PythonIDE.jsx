import React, { useState, useRef, useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/themes/prism-tomorrow.css';

export function CodeIDE(props) {
  const { dataChannel } = props;
  const [code, setCode] = useState('# Write your Python code here\nprint("Hello, World!")');
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState('python');
  const editorRef = useRef(null);
  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);
  const editorWrapperRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);

  useEffect(() => {
    highlightCode();
    updateLineNumbers();
  }, [code, language]);

  useEffect(() => {
    syncScroll();
  }, [scrollTop]);

  const highlightCode = () => {
    if (editorRef.current) {
      editorRef.current.innerHTML = Prism.highlight(code, Prism.languages[language], language);
    }
  };

  const updateLineNumbers = () => {
    if (lineNumbersRef.current) {
      const lines = code.split('\n');
      const lineNumbers = Array.from({ length: lines.length }, (_, i) => `${i + 1}`);
      lineNumbersRef.current.innerHTML = lineNumbers.join('<br/>');
    }
  };

  const syncScroll = () => {
    if (editorRef.current) {
      editorRef.current.scrollTop = scrollTop;
    }
    if (lineNumbersRef.current) {
      lineNumbersRef.current.style.transform = `translateY(-${scrollTop}px)`;
    }
  };

  const handleScroll = (event) => {
    setScrollTop(event.target.scrollTop);
  };

  const handleCodeChange = (event) => {
    const newCode = event.target.value;
    const cursorPos = event.target.selectionStart;
    setCode(newCode);
    
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.selectionStart = cursorPos;
        textareaRef.current.selectionEnd = cursorPos;
      }
    });
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      const start = event.target.selectionStart;
      const end = event.target.selectionEnd;
      const newCode = code.substring(0, start) + '    ' + code.substring(end);
      setCode(newCode);
      
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + 4;
          textareaRef.current.selectionEnd = start + 4;
        }
      });
    }
  };

  const executeCode = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "no-cors"
        },
        body: JSON.stringify({ code: code, language: language }),
      });

      if (!response.ok) {
        throw new Error("Failed to execute code.");
      }

      const data = await response.json();
      setOutput(data.output);
    } catch (error) {
      console.error("Error executing code:", error);
      setOutput("Error executing code.");
    }
  };

  const handleRunCode = () => {
    dataChannel.send(`Please evaluate the candidate's ${language} code, and decide whether to give a hint or be silent and let them debug. Here is the code: \n\n${code}`);
    executeCode();
  };

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#F7FAFC', padding: '16px' }}>
      <div style={{ width: '50%', paddingRight: '8px', position: 'relative', display: 'flex', flexDirection: 'column' }}>
        <div ref={editorWrapperRef} style={{ display: 'flex', flexGrow: 1, overflow: 'hidden', borderRadius: '8px' }}>
          <div style={{
            minWidth: '40px',
            backgroundColor: '#1e1e1e',
            borderTopLeftRadius: '8px',
            borderBottomLeftRadius: '8px',
            paddingTop: '16px',
            paddingRight: '8px',
            textAlign: 'right',
            fontFamily: 'monospace',
            fontSize: '14px',
            lineHeight: '1.5',
            color: '#858585',
            userSelect: 'none',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div
              ref={lineNumbersRef}
              style={{ 
                position: 'absolute',
                top: '16px',
                right: '8px',
                left: '0',
                textAlign: 'right',
                pointerEvents: 'none',
                transformOrigin: '50% 0',
              }}
            />
          </div>
          <div style={{ flexGrow: 1, position: 'relative', overflow: 'hidden' }}>
            <textarea
              ref={textareaRef}
              value={code}
              onChange={handleCodeChange}
              onKeyDown={handleKeyDown}
              onScroll={handleScroll}
              spellCheck="false"
              style={{
                width: '100%',
                height: '100%',
                margin: 0,
                padding: '16px 16px 16px 8px',
                fontFamily: 'monospace',
                fontSize: '14px',
                lineHeight: '1.5',
                backgroundColor: 'transparent',
                color: 'transparent',
                caretColor: 'white',
                borderTopRightRadius: '8px',
                borderBottomRightRadius: '8px',
                resize: 'none',
                outline: 'none',
                whiteSpace: 'pre-wrap',
                overflowWrap: 'break-word',
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: 1,
                boxSizing: 'border-box',
                overflow: 'auto',
              }}
            />
            <pre
              ref={editorRef}
              style={{
                width: '100%',
                height: '100%',
                margin: 0,
                padding: '16px 16px 16px 8px',
                fontFamily: 'monospace',
                fontSize: '14px',
                lineHeight: '1.5',
                backgroundColor: '#2d2d2d',
                color: '#ccc',
                borderTopRightRadius: '8px',
                borderBottomRightRadius: '8px',
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
                overflowWrap: 'break-word',
                boxSizing: 'border-box',
              }}
              aria-hidden="true"
            />
          </div>
        </div>
        <select 
          value={language} 
          onChange={handleLanguageChange}
          style={{
            position: 'absolute',
            top: '8px',
            right: '16px',
            padding: '4px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            backgroundColor: 'rgba(45, 45, 45, 0.7)',
            color: '#ccc',
            fontSize: '12px',
            zIndex: 2,
          }}
        >
          <option value="python">Python 3</option>
          <option value="java" disabled title="Coming soon!">Java</option>
          <option value="javascript" disabled title="Coming soon!">JavaScript</option>
          <option value="typescript" disabled title="Coming soon!">TypeScript</option>
        </select>
      </div>
      <div style={{ width: '50%', paddingLeft: '8px', display: 'flex', flexDirection: 'column' }}>
        <button
          style={{
            marginBottom: '8px',
            backgroundColor: '#38A169',
            color: 'white',
            fontWeight: 'bold',
            padding: '8px 16px',
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer',
          }}
          onClick={handleRunCode}
        >
          Run Code
        </button>
        <textarea
          style={{
            flexGrow: 1,
            width: '100%',
            padding: '16px',
            fontFamily: 'monospace',
            fontSize: '14px',
            backgroundColor: '#000000',
            color: '#38A169',
            borderRadius: '8px',
            resize: 'none',
            outline: 'none',
            boxSizing: 'border-box',
          }}
          value={output}
          readOnly
          placeholder="Output will appear here..."
        />
      </div>
    </div>
  );
}

export default CodeIDE;