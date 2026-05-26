import React, { useState } from 'react';
import { X } from 'lucide-react';
import { isVideoUrl } from '../../lib/utils';

export function ImageViewer({ images, exerciseName, onClose }: { images: string[], exerciseName: string, onClose: () => void }) {
  const [idx, setIdx] = useState(0);

  if (!images || images.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[600] bg-black/90 flex flex-col items-center justify-center p-4">
      <button onClick={onClose} className="absolute top-4 right-4 text-white p-2 hover:bg-white/20 rounded-full">
        <X size={24}/>
      </button>
      <div className="relative max-w-4xl w-full flex flex-col items-center">
        {isVideoUrl(images[idx]) ? (
          <video src={images[idx]} controls autoPlay loop muted playsInline className="max-w-full max-h-[75vh] rounded-lg shadow-2xl" />
        ) : (
          <img src={images[idx]} alt={exerciseName} className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl" />
        )}
        
        {images.length > 1 && (
          <div className="flex items-center gap-4 mt-6">
            <button onClick={() => setIdx(Math.max(0, idx-1))} disabled={idx===0} className="px-4 py-2 bg-white/20 text-white rounded-lg disabled:opacity-50">Prev</button>
            <span className="text-white font-bold">{idx + 1} / {images.length}</span>
            <button onClick={() => setIdx(Math.min(images.length-1, idx+1))} disabled={idx===images.length-1} className="px-4 py-2 bg-white/20 text-white rounded-lg disabled:opacity-50">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}