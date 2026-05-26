import React from 'react';
import { AlertTriangle } from 'lucide-react';

export function ConfirmModal({
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDanger = false
}: {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      
      {/* Modal Box */}
      <div className="relative bg-card border border-border shadow-2xl rounded-2xl w-full max-w-sm overflow-hidden p-6 text-center">
        
        {/* Warning Icon */}
        <div className={`mx-auto w-12 h-12 mb-4 rounded-full flex items-center justify-center ${isDanger ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-500' : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-500'}`}>
          <AlertTriangle size={24} />
        </div>
        
        {/* Text Content */}
        <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-6 whitespace-pre-wrap">{message}</p>
        
        {/* Action Buttons */}
        <div className="flex gap-3 w-full">
          <button 
            onClick={onCancel} 
            className="flex-1 px-4 py-2.5 bg-muted hover:bg-border text-foreground font-bold rounded-xl transition-colors"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm} 
            className={`flex-1 px-4 py-2.5 font-bold rounded-xl transition-colors text-white shadow-sm ${isDanger ? 'bg-red-500 hover:bg-red-600' : 'bg-orange-500 hover:bg-orange-600'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}