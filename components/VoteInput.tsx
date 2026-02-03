import React, { useState } from 'react';
import { CenterResult, Candidate } from '../types';

interface Props {
  center: CenterResult;
  candidates: Candidate[];
  onClose: () => void;
  onSave: (votes: Record<string, number>, invalidVotes: number) => void;
}

const VoteInput: React.FC<Props> = ({ center, candidates, onClose, onSave }) => {
  const [votes, setVotes] = useState<Record<string, number>>(center.votes);
  const [invalidVotes, setInvalidVotes] = useState<number>(center.invalidVotes || 0);

  const handleVoteChange = (candId: string, value: string) => {
    const num = Math.max(0, parseInt(value) || 0);
    setVotes(prev => ({ ...prev, [candId]: num }));
  };

  const candidateVotesSum: number = (Object.values(votes) as number[]).reduce((a: number, b: number): number => a + b, 0);
  const totalVotesEntered = candidateVotesSum + invalidVotes;
  const isOverLimit = totalVotesEntered > center.totalVoters;
  const votePercentage = center.totalVoters > 0 ? (totalVotesEntered / center.totalVoters) * 100 : 0;

  const getProgressColor = () => {
    if (isOverLimit) return 'bg-red-500';
    if (votePercentage > 80) return 'bg-green-500';
    if (votePercentage > 50) return 'bg-blue-500';
    return 'bg-orange-400';
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-5 border-b flex justify-between items-center bg-gray-50">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-800 leading-tight">{center.centerName}</h3>
            <div className="flex items-center space-x-2 mt-1">
                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">কেন্দ্র আইডি: {center.centerId}</span>
                <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-bold">মোট ভোটার: {(center.totalVoters ?? 0).toLocaleString()}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors ml-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[50vh] overflow-y-auto">
          {candidates.map((cand) => (
            <div key={cand.id} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-xl border border-transparent hover:border-blue-200 transition-colors">
              <img 
                src={cand.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${cand.name}`}
                alt={cand.name}
                className="w-12 h-12 rounded-lg object-cover bg-white border border-gray-200 shadow-sm"
              />
              <div className="flex-1 min-w-0">
                <label className="block text-xs font-bold text-gray-700 truncate">{cand.name}</label>
                <p className="text-[10px] text-gray-400 font-medium">{cand.party} ({cand.symbol})</p>
              </div>
              <input 
                type="number"
                min="0"
                className={`w-20 px-2 py-1.5 border rounded-lg text-right focus:ring-2 outline-none font-bold text-sm ${isOverLimit ? 'border-red-300 bg-red-50 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500'}`}
                value={votes[cand.id]}
                onChange={(e) => handleVoteChange(cand.id, e.target.value)}
              />
            </div>
          ))}

          {/* বাতিল ভোট ইনপুট বক্স */}
          <div className="flex items-center space-x-3 bg-red-50 p-3 rounded-xl border border-red-100 mt-4">
              <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center text-red-500 shadow-sm border border-red-200">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-xs font-bold text-red-700">বাতিল ভোট</label>
                <p className="text-[10px] text-red-400 font-medium">অকার্যকর ব্যালট সংখ্যা</p>
              </div>
              <input 
                type="number"
                min="0"
                className={`w-20 px-2 py-1.5 border rounded-lg text-right focus:ring-2 outline-none font-bold text-sm border-red-300 bg-white focus:ring-red-500`}
                value={invalidVotes}
                onChange={(e) => setInvalidVotes(Math.max(0, parseInt(e.target.value) || 0))}
              />
          </div>
        </div>

        <div className="p-5 bg-gray-50 border-t">
          <div className="mb-4">
            <div className="flex justify-between items-end mb-1.5">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-500 uppercase">ভোট কাস্টিং হার</span>
                {isOverLimit && (
                  <span className="text-[10px] text-red-500 font-bold flex items-center animate-pulse">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    ভোটার সংখ্যা ছাড়িয়ে গেছে!
                  </span>
                )}
              </div>
              <div className="text-right">
                <span className={`text-xl font-black ${isOverLimit ? 'text-red-600' : 'text-blue-600'}`}>
                  {votePercentage.toFixed(2)}%
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${getProgressColor()}`}
                style={{ width: `${Math.min(100, votePercentage)}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-gray-400 mt-1 text-right">
                মোট ভোট (বাতিলসহ): <b>{(totalVotesEntered ?? 0).toLocaleString()}</b> / {(center.totalVoters ?? 0).toLocaleString()}
            </p>
          </div>

          <div className="flex space-x-3">
            <button 
                onClick={onClose}
                className="flex-1 py-2.5 text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition-colors text-sm"
            >
                বাতিল
            </button>
            <button 
                disabled={isOverLimit}
                onClick={() => onSave(votes, invalidVotes)}
                className={`flex-1 py-2.5 text-white font-bold rounded-xl transition-all shadow-lg text-sm ${isOverLimit ? 'bg-gray-300 cursor-not-allowed shadow-none' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}
            >
                সংরক্ষণ করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoteInput;