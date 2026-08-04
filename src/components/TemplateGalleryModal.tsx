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
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-6">
      <div className="bg-[#12141C] border border-white/10 rounded-2xl w-full max-w-3xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#161824]">
          <div className="flex items-center gap-2.5">
            <Icons.LayoutTemplate className="w-5 h-5 text-[#FF5C49]" />
            <div>
              <h3 className="text-sm font-semibold text-white">Starter Workflow Templates</h3>
              <p className="text-[11px] text-gray-400">Instantly launch production-ready DAG automation pipelines</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
          >
            <Icons.X className="w-4 h-4" />
          </button>
        </div>

        {/* Templates Grid */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar bg-[#0D0E12]">
          {STARTER_TEMPLATES.map((tmpl) => (
            <div
              key={tmpl.id}
              className="p-5 rounded-2xl bg-[#161824] border border-white/10 hover:border-[#FF5C49]/50 transition-all space-y-3 group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#FF5C49] font-bold">
                    {tmpl.category}
                  </span>
                  <h4 className="text-sm font-bold text-white group-hover:text-[#FF5C49] transition-colors mt-0.5">
                    {tmpl.name}
                  </h4>
                </div>
                <button
                  onClick={() => {
                    onSelectTemplate(tmpl);
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#FF5C49] hover:bg-[#FF453A] text-white shadow-md transition-all active:scale-95"
                >
                  Use Template
                  <Icons.ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed">
                {tmpl.description}
              </p>

              <div className="pt-2 border-t border-white/5 flex items-center gap-2 text-[11px] font-mono text-gray-400">
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
