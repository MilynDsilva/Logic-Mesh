import React, { useState } from 'react';
import * as Icons from 'lucide-react';

interface CodeEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode: string;
  onSaveCode: (code: string) => void;
  sampleInput?: Record<string, any>;
}

export const CodeEditorModal: React.FC<CodeEditorModalProps> = ({
  isOpen,
  onClose,
  initialCode,
  onSaveCode,
  sampleInput = { ticketId: 'TCK-9021', customer: 'Acme Corp', priority: 'HIGH' },
}) => {
  const [code, setCode] = useState(initialCode);
  const [testOutput, setTestOutput] = useState<any>(null);
  const [testError, setTestError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRunCode = () => {
    setTestError(null);
    setTestOutput(null);
    try {
      const fn = new Function('$json', '$node', '$env', code);
      const result = fn(sampleInput, {}, { API_KEY: 'lm_demo_key' });
      setTestOutput(result);
    } catch (err: any) {
      setTestError(err.message || 'Syntax Error in JavaScript code');
    }
  };

  const handleFormatCode = () => {
    try {
      const lines = code.split('\n').map((line) => line.trimEnd());
      setCode(lines.join('\n'));
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-6 select-none">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Icons.Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-heading">JavaScript Transformation Editor</h3>
              <p className="text-[11px] text-slate-500">Write custom ES6 transformation logic over incoming item payload</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleFormatCode}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Icons.Wand2 className="w-3.5 h-3.5 text-blue-600" />
              Format
            </button>
            <button
              onClick={handleRunCode}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Icons.Play className="w-3.5 h-3.5 fill-white" />
              Test Run
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-all"
            >
              <Icons.X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Editor Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Code Textarea & Cheatsheet */}
          <div className="flex-1 flex flex-col border-r border-slate-200 bg-slate-900">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="// Write JavaScript transformation script here..."
              className="flex-1 bg-transparent p-5 text-xs font-mono text-emerald-400 focus:outline-none leading-relaxed resize-none custom-scrollbar"
              spellCheck={false}
            />

            {/* Cheatsheet Bar */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Globals: <code className="text-amber-400 font-bold">$json</code>, <code className="text-blue-400 font-bold">$node</code>, <code className="text-emerald-400 font-bold">$env</code></span>
              <span>Returns: Object or Array</span>
            </div>
          </div>

          {/* Right: Test Execution Preview Panel */}
          <div className="w-96 bg-slate-50/50 flex flex-col p-4 space-y-4 overflow-y-auto custom-scrollbar select-text">
            <div>
              <span className="text-xs font-bold text-slate-700 block mb-1.5 font-heading">
                Input Payload (<code className="text-blue-600 font-mono font-bold">$json</code>)
              </span>
              <pre className="p-3 rounded-2xl bg-white border border-slate-200 text-xs font-mono text-slate-800 overflow-x-auto max-h-40 shadow-2xs">
                {JSON.stringify(sampleInput, null, 2)}
              </pre>
            </div>

            <div className="flex-1 space-y-1.5">
              <span className="text-xs font-bold text-slate-700 block font-heading">
                Test Output Result
              </span>
              {testError ? (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-mono shadow-2xs">
                  <Icons.AlertCircle className="w-4 h-4 mb-1 text-rose-600" />
                  {testError}
                </div>
              ) : testOutput !== null ? (
                <pre className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto max-h-60 leading-relaxed shadow-2xs">
                  {JSON.stringify(testOutput, null, 2)}
                </pre>
              ) : (
                <div className="p-6 rounded-2xl bg-white border border-dashed border-slate-200 text-center text-xs text-slate-500 shadow-2xs">
                  Click "Test Run" to evaluate your code.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSaveCode(code);
              onClose();
            }}
            className="px-4 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
          >
            Save Code Changes
          </button>
        </div>
      </div>
    </div>
  );
};

