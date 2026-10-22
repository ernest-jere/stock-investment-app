import React from 'react';

export default function FundAccountCard({ primaryBalance, availableBalance, onFundClick }) {
  return (
    <div className="bg-surface text-text-surface p-6 rounded-2xl shadow-key max-w-sm">
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-text-muted text-body-sm uppercase tracking-wider">Primary Account</p>
          <h2 className="text-headline-1 font-bold">{primaryBalance}</h2>
        </div>
        <span className="p-2 bg-surface-second rounded-full text-xl">🔒</span>
      </div>
      
      <div className="border-t border-text-muted/20 pt-4 flex justify-between items-center">
        <div>
          <p className="text-text-muted text-body-sm">Available Account</p>
          <p className="text-headline-3 font-semibold">{availableBalance}</p>
        </div>
        <button 
          onClick={onFundClick}
          className="bg-text-surface text-surface-second font-bold px-4 py-2 rounded-xl transition hover:opacity-90"
        >
          Fund Account
        </button>
      </div>
    </div>
  );
}
