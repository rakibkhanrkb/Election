import React, { useState } from 'react';
import { Seat, CenterResult } from '../types';
import VoteInput from './VoteInput';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface Props {
  seat: Seat;
  isLoggedIn: boolean;
  onBack: () => void;
  onUpdateVotes: (seatId: string, centerId: number, votes: Record<string, number>, invalidVotes: number) => void;
  onRequestLogin: () => void;
}

const SeatDetail: React.FC<Props> = ({ seat, isLoggedIn, onBack, onUpdateVotes, onRequestLogin }) => {
  const [editingCenter, setEditingCenter] = useState<CenterResult | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCenters = seat.centers.filter(c => 
    c.centerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.centerId.toString() === searchTerm
  );

  const candidateTotals = seat.candidates.map(cand => ({
    ...cand,
    votes: seat.centers.reduce((sum, center) => sum + (center.votes[cand.id] || 0), 0)
  })).sort((a, b) => b.votes - a.votes);

  const totalInvalidVotes = seat.centers.reduce((sum, c) => sum + (c.invalidVotes || 0), 0);
  const totalVotesCast = candidateTotals.reduce((sum, c) => sum + c.votes, 0) + totalInvalidVotes;
  const seatTotalVoters = seat.centers.reduce((sum, center) => sum + (center.totalVoters || 0), 0);
  const reportingProgress = (seat.centers.filter(c => c.isReported).length / seat.centers.length) * 100;

  const handleCenterClick = (center: CenterResult) => {
    if (!isLoggedIn) {
        onRequestLogin();
    } else {
        setEditingCenter(center);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row items-center justify-between bg-white p-4 rounded-xl shadow-sm border gap-4">
        <div className="flex items-center space-x-4 w-full md:w-auto">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{seat.name}</h2>
            <p className="text-sm text-gray-500">মোট ভোটার: <span className="font-bold text-gray-700">{(seatTotalVoters ?? 0).toLocaleString()}</span></p>
          </div>
        </div>
        
        <div className="flex flex-col items-center md:items-end w-full md:w-auto">
            <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-black text-blue-600">{(totalVotesCast ?? 0).toLocaleString()}</span>
                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">ভোট প্রাপ্ত</span>
            </div>
            <div className="w-full md:w-48 bg-gray-100 h-1.5 rounded-full mt-1 overflow-hidden">
                <div className="bg-blue-500 h-full transition-all duration-1000" style={{width: `${reportingProgress}%`}}></div>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">কেন্দ্রের ফলাফল প্রাপ্তি: {reportingProgress.toFixed(1)}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="bg-[#489FC4] text-white p-4 flex justify-between items-center">
              <h3 className="font-bold">প্রার্থীদের ফলাফল</h3>
              <span className="text-xs opacity-80">বাতিল ভোট সহ</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 border-b">
                  <tr>
                    <th className="px-4 py-3 font-semibold">ক্রম</th>
                    <th className="px-4 py-3 font-semibold text-center">ছবি</th>
                    <th className="px-4 py-3 font-semibold">প্রার্থীর নাম</th>
                    <th className="px-4 py-3 font-semibold">দল/স্বতন্ত্র</th>
                    <th className="px-4 py-3 font-semibold text-center">প্রতীক</th>
                    <th className="px-4 py-3 font-semibold text-right">প্রাপ্ত ভোট</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {candidateTotals.map((cand, idx) => (
                    <tr key={cand.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 font-medium text-gray-500">{idx + 1}</td>
                      <td className="px-4 py-4 text-center">
                        <img 
                          src={cand.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${cand.name}`} 
                          alt={cand.name}
                          className="w-10 h-10 rounded-lg object-cover bg-gray-100 mx-auto border border-gray-200"
                        />
                      </td>
                      <td className="px-4 py-4 font-bold text-gray-800">{cand.name}</td>
                      <td className="px-4 py-4 text-gray-600">{cand.party}</td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-block px-3 py-1 bg-gray-100 rounded-full font-bold text-gray-700 border border-gray-200">
                          {cand.symbol}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right font-black text-lg">
                        {(cand.votes ?? 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {/* বাতিল ভোটের সারি */}
                  <tr className="bg-red-50/30">
                    <td colSpan={5} className="px-4 py-3 font-bold text-red-600 text-right">মোট বাতিল ভোট:</td>
                    <td className="px-4 py-3 text-right font-black text-red-600 text-lg">{(totalInvalidVotes ?? 0).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col">
            <div className="p-4 border-b bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-gray-700">ভোট কেন্দ্রসমূহ ({seat.centers.length}টি)</h3>
                {!isLoggedIn && (
                  <span className="text-[10px] text-orange-500 font-bold bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    লক করা
                  </span>
                )}
              </div>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="কেন্দ্রের নাম খুঁজুন..."
                  className="pl-8 pr-4 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <div className="overflow-y-auto max-h-[500px] p-4 bg-gray-50">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredCenters.map((center) => (
                  <div 
                    key={center.centerId}
                    onClick={() => handleCenterClick(center)}
                    className={`p-3 border rounded-xl cursor-pointer transition-all hover:scale-[1.02] shadow-sm relative group ${center.isReported ? 'bg-white border-green-500 ring-1 ring-green-100' : 'bg-white border-gray-200'}`}
                  >
                    {!isLoggedIn && (
                       <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl backdrop-blur-[1px] z-10">
                          <span className="bg-gray-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center">
                             <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                             </svg>
                             লগইন করুন
                          </span>
                       </div>
                    )}
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                           <span className="text-[10px] font-bold text-gray-400 uppercase">আইডি: {center.centerId}</span>
                           <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full font-bold">ভোটার: {(center.totalVoters ?? 0).toLocaleString()}</span>
                        </div>
                        <h4 className="font-semibold text-gray-800 text-sm mt-1 truncate" title={center.centerName}>{center.centerName}</h4>
                      </div>
                      {center.isReported ? (
                        <div className="flex items-center text-green-600 text-[10px] font-bold ml-2 flex-shrink-0">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          সংগৃহীত
                        </div>
                      ) : (
                        <span className="bg-gray-100 text-gray-400 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter ml-2 flex-shrink-0">অপেক্ষমাণ</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border sticky top-24">
            <h3 className="font-bold mb-6 text-gray-700 border-b pb-2 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
              ভোটের শতাংশ
            </h3>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      ...candidateTotals.filter(c => c.votes > 0),
                      { name: 'বাতিল ভোট', votes: totalInvalidVotes, color: '#EF4444' }
                    ]}
                    dataKey="votes"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={55}
                    paddingAngle={5}
                  >
                    {[...candidateTotals, {color: '#EF4444'}].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => (value ? value.toLocaleString() : '০') + ' ভোট'} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 space-y-3">
              {candidateTotals.map((cand) => (
                <div key={cand.id} className="flex items-center text-xs">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: cand.color }} />
                  <span className="flex-1 text-gray-600 truncate">{cand.name}</span>
                  <span className="font-bold">
                    {totalVotesCast > 0 ? ((cand.votes / totalVotesCast) * 100).toFixed(1) : '0'}%
                  </span>
                </div>
              ))}
              <div className="flex items-center text-xs pt-2 border-t mt-2">
                  <div className="w-3 h-3 rounded-full mr-2 bg-red-500" />
                  <span className="flex-1 text-red-600 font-bold">বাতিল ভোট</span>
                  <span className="font-bold text-red-600">
                    {totalVotesCast > 0 ? ((totalInvalidVotes / totalVotesCast) * 100).toFixed(1) : '0'}%
                  </span>
              </div>
            </div>
            
            <div className="mt-8 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500 font-semibold uppercase">ভোট প্রদানের হার</span>
                    <span className="text-sm font-bold text-gray-800">{seatTotalVoters > 0 ? ((totalVotesCast / seatTotalVoters) * 100).toFixed(2) : '0'}%</span>
                </div>
                <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                    <div className="bg-orange-400 h-full" style={{width: `${(totalVotesCast / seatTotalVoters) * 100}%`}}></div>
                </div>
            </div>
          </div>
        </div>
      </div>

      {editingCenter && (
        <VoteInput 
          center={editingCenter}
          candidates={seat.candidates}
          onClose={() => setEditingCenter(null)}
          onSave={(votes, invalidVotes) => {
            onUpdateVotes(seat.id, editingCenter.centerId, votes, invalidVotes);
            setEditingCenter(null);
          }}
        />
      )}
    </div>
  );
};

export default SeatDetail;