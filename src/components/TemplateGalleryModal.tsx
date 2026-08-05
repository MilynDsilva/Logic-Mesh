import React from 'react';
import * as Icons from 'lucide-react';
import { STARTER_TEMPLATES } from '../constants/templates';
import type { TemplateWorkflow } from '../types/workflow';

interface TemplateGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: TemplateWorkflow) => void;
}

export const TemplateGalleryModal: React.FC<TemplateGalleryModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-6 select-none">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Icons.LayoutTemplate className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-heading">Starter Workflow Templates</h3>
              <p className="text-[11px] text-slate-500">Instantly launch production-ready DAG automation pipelines</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-all"
          >
            <Icons.X className="w-4 h-4" />
          </button>
        </div>

        {/* Templates Grid */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar bg-slate-50/50">
          {STARTER_TEMPLATES.map((tmpl) => (
            <div
              key={tmpl.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 transition-all space-y-3 group shadow-2xs"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-blue-600 font-bold">
                    {tmpl.category}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors mt-0.5 font-heading">
                    {tmpl.name}
                  </h4>
                </div>
                <button
                  onClick={() => {
                    onSelectTemplate(tmpl);
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  Use Template
                  <Icons.ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {tmpl.description}
              </p>

              <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-[11px] font-mono text-slate-400 font-medium">
                <span>{tmpl.nodes.length} Nodes</span>
                <span>•</span>
                <span>{tmpl.edges.length} Connections</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

