import React from 'react';
import * as Icons from 'lucide-react';

interface ExpressionPickerProps {
  sampleJson: Record<string, any>;
  onSelectVariable: (expression: string) => void;
}

export const ExpressionPicker: React.FC<ExpressionPickerProps> = ({
  sampleJson,
  onSelectVariable,
}) => {
  // Recursively render JSON keys as clickable badge pills
  const renderTree = (obj: any, currentPath: string = '') => {
    if (obj == null || typeof obj !== 'object') return null;

    return (
      <div className="pl-3 space-y-1 border-l border-white/10 my-1">
        {Object.entries(obj).map(([key, val]) => {
          const fullPath = currentPath ? `${currentPath}.${key}` : key;
          const isObj = typeof val === 'object' && val !== null;
          const exprStr = `{{ $json.${fullPath} }}`;

          return (
            <div key={fullPath} className="text-xs">
              <div className="flex items-center gap-1.5 group py-0.5">
                <button
                  onClick={() => onSelectVariable(exprStr)}
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#1A1D2B] hover:bg-[#FF5C49]/20 hover:border-[#FF5C49]/50 border border-white/5 transition-all text-left font-mono text-[11px] text-gray-200 hover:text-white"
                  title={`Insert ${exprStr}`}
                >
                  <Icons.PlusCircle className="w-3 h-3 text-[#FF5C49] opacity-70 group-hover:opacity-100" />
                  <span className="text-[#FF5C49] font-bold">{key}</span>
                  {!isObj && (
                    <span className="text-gray-400 font-normal truncate max-w-[120px]">
                      : {String(val)}
                    </span>
                  )}
                </button>
              </div>

              {isObj && renderTree(val, fullPath)}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-3 bg-[#161824] border border-white/10 rounded-xl space-y-2 select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-300">
          <Icons.Variable className="w-3.5 h-3.5 text-[#FF5C49]" />
          <span>Click to Insert Expression</span>
        </div>
        <span className="text-[10px] font-mono text-gray-400">Predecessor Output</span>
      </div>

      <div className="max-h-48 overflow-y-auto custom-scrollbar pt-1">
        {sampleJson && Object.keys(sampleJson).length > 0 ? (
          renderTree(sampleJson)
        ) : (
          <div className="text-[11px] text-gray-400 italic py-2">
            Run predecessor nodes to view live output fields.
          </div>
        )}
      </div>

      {/* Helper Shortcut Pills */}
      <div className="pt-2 border-t border-white/5 flex flex-wrap gap-1">
        <button
          onClick={() => onSelectVariable('{{ $now }}')}
          className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[10px] font-mono text-amber-300 border border-white/10"
        >
          + $now
        </button>
        <button
          onClick={() => onSelectVariable('{{ $uuid() }}')}
          className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[10px] font-mono text-indigo-300 border border-white/10"
        >
          + $uuid()
        </button>
        <button
          onClick={() => onSelectVariable('{{ $env.MONGODB_URI }}')}
          className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[10px] font-mono text-cyan-300 border border-white/10"
        >
          + $env.MONGODB_URI
        </button>
      </div>
    </div>
  );
};
