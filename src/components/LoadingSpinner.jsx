// src/components/LoadingSpinner.jsx
import React from 'react';

export default function LoadingSpinner({ fullScreen = false }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${fullScreen ? 'min-h-screen bg-semantic-app-bg' : 'py-12'}`}>
      <div className="relative w-12 h-12">
        {/* Outer tracking loop ring - using your surface token */}
        <div className="absolute inset-0 rounded-full border-4 border-semantic-surface-primary opacity-40"></div>
        
        {/* Active spinning ring segment - using your green accent token */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-semantic-stock-up animate-spin"></div>
      </div>
      
      {/* Typography token for body scale description layout */}
      <span className="text-text-body-small text-semantic-text-body font-medium animate-pulse tracking-wide uppercase">
        Syncing market prices...
      </span>
    </div>
  );
}
