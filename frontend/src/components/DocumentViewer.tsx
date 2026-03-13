import React, { useState } from 'react';
import { LegalDocument, Clause } from '../data/sampleDocument';
interface DocumentViewerProps {
  document: LegalDocument;
}
export function DocumentViewer({ document }: DocumentViewerProps) {
  const [hoveredClause, setHoveredClause] = useState<string | null>(null);
  const getRiskStyles = (level: string) => {
    switch (level) {
      case 'high':
        return 'border-l-risk-high bg-risk-highBg';
      case 'medium':
        return 'border-l-risk-medium bg-risk-mediumBg';
      case 'low':
        return 'border-l-risk-low bg-risk-lowBg';
      default:
        return 'border-l-transparent';
    }
  };
  const getRiskTooltipColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-slate-800 text-rose-300';
      case 'medium':
        return 'bg-slate-800 text-amber-300';
      case 'low':
        return 'bg-slate-800 text-slate-300';
      default:
        return 'bg-slate-800 text-white';
    }
  };
  return (
    <div className="max-w-4xl mx-auto py-12 px-8 pb-32">
      {/* Document Header */}
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">
          {document.title}
        </h1>
        <div className="flex items-center justify-center gap-4 text-sm text-slate-500">
          <span>
            Between:{' '}
            <strong className="text-slate-700 font-medium">
              {document.parties.join(' & ')}
            </strong>
          </span>
          <span>•</span>
          <span>
            Effective Date:{' '}
            <strong className="text-slate-700 font-medium">
              {document.effectiveDate}
            </strong>
          </span>
        </div>
      </div>

      {/* Document Body */}
      <div className="space-y-6 text-slate-800 leading-relaxed text-[15px]">
        {document.clauses.map((clause) =>
        <div
          key={clause.id}
          className={`relative p-4 -mx-4 rounded-r-lg border-l-[4px] transition-colors duration-200 ${getRiskStyles(clause.riskLevel)}`}
          onMouseEnter={() => setHoveredClause(clause.id)}
          onMouseLeave={() => setHoveredClause(null)}>

            {hoveredClause === clause.id && clause.riskLevel !== 'none' &&
          <div
            className={`absolute -top-3 left-4 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider shadow-sm z-10 ${getRiskTooltipColor(clause.riskLevel)}`}>

                {clause.riskLevel} risk
              </div>
          }

            <div className="flex gap-3">
              <span className="font-bold text-slate-900 shrink-0">
                {clause.number}
              </span>
              <div>
                <span className="font-bold text-slate-900 mr-2">
                  {clause.title}.
                </span>
                <span className="text-slate-700">{clause.text}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>);

}