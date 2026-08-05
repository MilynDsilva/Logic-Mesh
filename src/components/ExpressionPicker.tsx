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
      <div className="pl-3 space-y-1 border-l border-slate-200 my-1">
        {Object.entries(obj).map(([key, val]) => {
          const fullPath = currentPath ? `${currentPath}.${key}` : key;
          const isObj = typeof val === 'object' && val !== null;
          const exprStr = `{{ $json.${fullPath} }}`;

          return (
            <div key={fullPath} className="text-xs">
              <div className="flex items-center gap-1.5 group py-0.5">
                <button
                  onClick={() => onSelectVariable(exprStr)}
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white hover:bg-blue-50 hover:border-blue-300 border border-slate-200 transition-all text-left font-mono text-[11px] text-slate-800 shadow-2xs cursor-pointer"
                  title={`Insert ${exprStr}`}
                >
                  <Icons.PlusCircle className="w-3 h-3 text-blue-600 opacity-80 group-hover:opacity-100" />
                  <span className="text-blue-600 font-bold">{key}</span>
                  {!isObj && (
                    <span className="text-slate-500 font-normal truncate max-w-[120px]">
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
    <div className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-2 select-none shadow-2xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 font-heading">
          <Icons.Variable className="w-3.5 h-3.5 text-blue-600" />
          <span>Click to Insert Expression</span>
        </div>
        <span className="text-[10px] font-mono text-slate-400 font-semibold">Predecessor Output</span>
      </div>

      <div className="max-h-48 overflow-y-auto custom-scrollbar pt-1">
        {sampleJson && Object.keys(sampleJson).length > 0 ? (
          renderTree(sampleJson)
        ) : (
          <div className="text-[11px] text-slate-500 italic py-2">
            Run predecessor nodes to view live output fields.
          </div>
        )}
      </div>

      {/* Helper Shortcut Pills */}
      <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-1">
        <button
          onClick={() => onSelectVariable('{{ $now }}')}
          className="px-2 py-0.5 rounded-md bg-white hover:bg-amber-50 text-[10px] font-mono text-amber-700 font-bold border border-slate-200 shadow-2xs cursor-pointer"
        >
          + $now
        </button>
        <button
          onClick={() => onSelectVariable('{{ $uuid() }}')}
          className="px-2 py-0.5 rounded-md bg-white hover:bg-indigo-50 text-[10px] font-mono text-indigo-700 font-bold border border-slate-200 shadow-2xs cursor-pointer"
        >
          + $uuid()
        </button>
        <button
          onClick={() => onSelectVariable('{{ $env.MONGODB_URI }}')}
          className="px-2 py-0.5 rounded-md bg-white hover:bg-blue-50 text-[10px] font-mono text-blue-700 font-bold border border-slate-200 shadow-2xs cursor-pointer"
        >
          + $env.MONGODB_URI
        </button>
      </div>
    </div>
  );
};

