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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 select-none">
      <div className="bg-[#12141C] border border-white/10 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#161824]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Icons.Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">JavaScript Transformation Editor</h3>
              <p className="text-[11px] text-gray-400">Write custom ES6 transformation logic over incoming item payload</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleFormatCode}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 border border-white/10 transition-all flex items-center gap-1.5"
            >
              <Icons.Wand2 className="w-3.5 h-3.5 text-indigo-400" />
              Format
            </button>
            <button
              onClick={handleRunCode}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-black shadow-md transition-all flex items-center gap-1.5"
            >
              <Icons.Play className="w-3.5 h-3.5 fill-black" />
              Test Run
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
            >
              <Icons.X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Editor Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Code Textarea & Cheatsheet */}
          <div className="flex-1 flex flex-col border-r border-white/10 bg-[#0D0E12]">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="// Write JavaScript transformation script here..."
              className="flex-1 bg-transparent p-5 text-xs font-mono text-emerald-400 focus:outline-none leading-relaxed resize-none custom-scrollbar"
              spellCheck={false}
            />

            {/* Cheatsheet Bar */}
            <div className="p-3 bg-[#161824] border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400 font-mono">
              <span>Globals: <code className="text-[#FF5C49]">$json</code>, <code className="text-indigo-400">$node</code>, <code className="text-cyan-400">$env</code></span>
              <span>Returns: Object or Array</span>
            </div>
          </div>

          {/* Right: Test Execution Preview Panel */}
          <div className="w-96 bg-[#12141C] flex flex-col p-4 space-y-4 overflow-y-auto custom-scrollbar select-text">
            <div>
              <span className="text-xs font-semibold text-gray-300 block mb-1.5">
                Input Payload (<code className="text-[#FF5C49]">$json</code>)
              </span>
              <pre className="p-3 rounded-xl bg-[#1A1D2B] border border-white/10 text-xs font-mono text-gray-300 overflow-x-auto max-h-40">
                {JSON.stringify(sampleInput, null, 2)}
              </pre>
            </div>

            <div className="flex-1 space-y-1.5">
              <span className="text-xs font-semibold text-gray-300 block">
                Test Output Result
              </span>
              {testError ? (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
                  <Icons.AlertCircle className="w-4 h-4 mb-1" />
                  {testError}
                </div>
              ) : testOutput !== null ? (
                <pre className="p-3 rounded-xl bg-[#1A1D2B] border border-white/10 text-xs font-mono text-emerald-400 overflow-x-auto max-h-60 leading-relaxed">
                  {JSON.stringify(testOutput, null, 2)}
                </pre>
              ) : (
                <div className="p-6 rounded-xl bg-[#161824] border border-dashed border-white/10 text-center text-xs text-gray-400">
                  Click "Test Run" to evaluate your code.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#161824] flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs text-gray-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSaveCode(code);
              onClose();
            }}
            className="px-4 py-1.5 text-xs font-semibold bg-[#FF5C49] hover:bg-[#FF453A] text-white rounded-lg transition-all shadow-md"
          >
            Save Code Changes
          </button>
        </div>
      </div>
    </div>
  );
};
