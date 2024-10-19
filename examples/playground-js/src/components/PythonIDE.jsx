import React, { useState, useRef, useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/themes/prism-tomorrow.css';

export function PythonIDE(props) {
  const { dataChannel } = props;
  const [code, setCode] = useState('# Write your Python code here\nprint("Hello, World!")');
  const [output, setOutput] = useState('');
  const editorRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    highlightCode();
  }, [code]);

  const highlightCode = () => {
    if (editorRef.current) {
      editorRef.current.innerHTML = Prism.highlight(code, Prism.languages.python, 'python');
    }
  };

  const handleCodeChange = (event) => {
    const newCode = event.target.value;
    setCode(newCode);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      const start = event.target.selectionStart;
      const end = event.target.selectionEnd;
      const newCode = code.substring(0, start) + '    ' + code.substring(end);
      setCode(newCode);
      event.target.setSelectionRange(start + 4, start + 4);
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
        body: JSON.stringify({ code: code }),
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
    dataChannel.send(`Please evaluate the candidate's code, and decide whether to give a hint or be silent and let them debug. Here is the code: \n\n${code}`);
    executeCode();
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#F7FAFC', padding: '16px' }}>
      {/* Left side - Code Editor with Syntax Highlighting */}
      <div style={{ width: '50%', paddingRight: '8px', position: 'relative' }}>
        <textarea
          ref={textareaRef}
          value={code}
          onChange={handleCodeChange}
          onKeyDown={handleKeyDown}
          style={{
            width: '100%',
            height: '100%',
            margin: 0,
            padding: '16px',
            fontFamily: 'monospace',
            fontSize: '14px',
            lineHeight: '1.5',
            backgroundColor: 'transparent',
            color: 'transparent',
            caretColor: 'white',
            borderRadius: '8px',
            resize: 'none',
            outline: 'none',
            whiteSpace: 'pre-wrap',
            overflowWrap: 'break-word',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 1,
          }}
        />
        <pre
          ref={editorRef}
          style={{
            width: '100%',
            height: '100%',
            margin: 0,
            padding: '16px',
            fontFamily: 'monospace',
            fontSize: '14px',
            lineHeight: '1.5',
            backgroundColor: '#2d2d2d',
            color: '#ccc',
            borderRadius: '8px',
            overflow: 'auto',
            whiteSpace: 'pre-wrap',
            overflowWrap: 'break-word',
          }}
          aria-hidden="true"
        />
      </div>

      {/* Right side - Terminal and Run Button */}
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