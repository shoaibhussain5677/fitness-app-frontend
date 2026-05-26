import React from 'react';
import { X } from 'lucide-react';

export function BaseModal({ 
  title, 
  onClose, 
  children,
  maxWidthClass = "max-w-3xl"
}: { 
  title: string | React.ReactNode; 
  onClose: () => void; 
  children: React.ReactNode;
  maxWidthClass?: string;
}) {
  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 sm:p-6 animate-in fade-in zoom-in-95 duration-200">
      {/* Dark overlay background that closes the modal when clicked */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose} 
      />
      
      {/* Modal Container */}
      <div className={`relative bg-background border border-border shadow-2xl rounded-2xl w-full ${maxWidthClass} max-h-[90vh] flex flex-col overflow-hidden`}>
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 md:p-6 border-b border-border bg-card">
          <h2 className="text-xl md:text-2xl font-extrabold text-foreground">{title}</h2>
          <button 
            onClick={onClose} 
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors focus:outline-none"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 md:p-6 overflow-y-auto hide-scrollbar flex-1 bg-background">
          {children}
        </div>

      </div>
    </div>
  );
}