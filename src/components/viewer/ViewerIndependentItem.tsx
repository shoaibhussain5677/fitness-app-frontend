import React from 'react';
import type { IndependentItem } from '../../types';
import { themeColors } from '../../lib/utils';

export function ViewerIndependentItem({ item }: { item: IndependentItem }) {
  if (item.type === 'Header') {
    return <div id={item.id} className="pt-4 pb-2 border-b border-border section-anchor"><h3 className="text-xl font-bold text-foreground">{item.title}</h3></div>;
  }
  if (item.type === 'Note') {
    const c = themeColors[item.color || 'orange'] || themeColors.orange;
    return (
      <div id={item.id} className={`section-anchor bg-card rounded-2xl border border-card-border shadow-sm p-6 flex gap-4 ${c.bg}`}>
        {item.icon && <span className="text-3xl flex-shrink-0">{item.icon}</span>}
        <div>
          {item.title && <h3 className={`font-bold text-lg mb-1 ${c.text}`}>{item.title}</h3>}
          {item.description && <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">{item.description}</p>}
        </div>
      </div>
    );
  }
  if (item.type === 'Highlights') {
    return (
      <div id={item.id} className={`section-anchor grid gap-3 ${item.highlightLayout === '3x1' ? 'grid-cols-3' : item.highlightLayout === '1x2' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {item.highlights?.map(h => (
          <div key={h.id} className="bg-card border border-card-border shadow-sm rounded-xl p-4 flex flex-col items-center text-center">
            {h.icon && <span className="text-2xl mb-2">{h.icon}</span>}
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{h.name}</span>
            <span className="text-base font-bold text-foreground mt-1">{h.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}