import React, { useMemo } from 'react';
import { Seat } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

interface Props {
  seats: Seat[];
  onSeatSelect: (id: string) => void;
}

const Dashboard: React.FC<Props> = ({ seats, onSeatSelect }) => {
  // Prepare data for the seat-based candidate performance chart
  const chartData = useMemo(() => {
    return seats.map(seat => {
      const data: any = { name: seat.name };
      // প্রার্থীদের ভোট হিসাব
      seat.candidates.forEach(cand => {
        const votes = seat.centers.reduce((sum, center) => sum + (center.votes[cand.id] || 0), 0);
        data[cand.name] = votes;
      });
      // বাতিল ভোট হিসাব (টুলটিপে দেখানোর জন্য)
      data["বাতিল ভোট"] = seat.centers.reduce((sum, center) => sum + (center.invalidVotes || 0), 0);
      return data;
    });
  }, [seats]);

  // Get all unique candidate names and their colors for the chart legend/bars
  const allCandidates = useMemo(() => {
    const map = new Map<string, string>();
    seats.forEach(s => {
      s.candidates.forEach(c => map.set(c.name, c.color));
    });
    return Array.from(map.entries()).map(([name, color]) => ({ name, color }));
  }, [seats]);

  return (
    <div className="space-y-8 pb-12">
      {/* Seat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {seats.map((seat) => {
          const totals = seat.candidates.map(cand => {
            const votes = seat.centers.reduce((sum, center) => sum + (center.votes[cand.id] || 0), 0);
            return { ...cand, totalVotes: votes };
          });
          
          const leader = [...totals].sort((a, b) => b.totalVotes - a.totalVotes)[0];
          const reportedCenters = seat.centers.filter(c => c.isReported).length;
          const reportingProgress = (reportedCenters / seat.centers.length) * 100;

          if (!leader) return null;

          return (
            <div 
              key={seat.id}
              onClick={() => onSeatSelect(seat.id)}
              className="bg-white p-5 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-lg text-gray-800">{seat.name}</h3>
                  <div className="text-right">
                    <span className="text-[10px] block font-bold text-gray-400 uppercase tracking-tighter">কেন্দ্র রিপোর্ট</span>
                    <span className="text-xs font-black text-blue-600">
                      {reportedCenters}/{seat.centers.length}
                    </span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase">বর্তমানে এগিয়ে</p>
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm"
                      style={{ backgroundColor: leader.color }}
                    >
                      {leader.symbol ? leader.symbol[0] : '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 leading-tight truncate">{leader.name}</p>
                      <p className="text-[10px] text-gray-500 font-medium">{leader.party}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline space-x-1">
                    <span className="text-xl font-black text-gray-800">{(leader.totalVotes ?? 0).toLocaleString()}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">ভোট</span>
                  </div>
                </div>
              </div>

              <div className="mt-2 pt-3 border-t border-gray-50">
                <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">ফলাফল প্রাপ্তি</span>
                    <span className="text-[10px] text-blue-600 font-black">{reportingProgress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full transition-all duration-500"
                    style={{ width: `${reportingProgress}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Graphical Comparison Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-xl font-black text-gray-800">আসন ভিত্তিক ফলাফল বিশ্লেষণ</h2>
            <p className="text-xs text-gray-500 font-medium">প্রতিটি আসনে প্রার্থীদের প্রাপ্ত ভোটের তুলনামূলক চিত্র</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">লাইভ আপডেট</span>
          </div>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                fontSize={11} 
                fontWeight="bold" 
                tick={{ fill: '#6B7280' }}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis 
                fontSize={11} 
                tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
                tick={{ fill: '#6B7280' }}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <Tooltip 
                cursor={{ fill: '#F9FAFB' }}
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              />
              {allCandidates.map((cand, index) => (
                <Bar 
                  key={cand.name} 
                  dataKey={cand.name} 
                  stackId="a" 
                  fill={cand.color} 
                  radius={index === allCandidates.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                  barSize={35}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl shadow-lg text-white">
              <h3 className="text-sm font-bold opacity-80 uppercase tracking-widest mb-4">মোট ভোট বিশ্লেষণ</h3>
              <div className="space-y-4">
                  {allCandidates.slice(0, 5).map(cand => {
                      const totalVotes = seats.reduce((sum, seat) => {
                          const candInSeat = seat.candidates.find(c => c.name === cand.name);
                          if (!candInSeat) return sum;
                          return sum + seat.centers.reduce((s, c) => s + (c.votes[candInSeat.id] || 0), 0);
                      }, 0);
                      return (
                          <div key={cand.name}>
                              <div className="flex justify-between text-xs mb-1">
                                  <span className="font-bold">{cand.name}</span>
                                  <span className="font-black">{(totalVotes ?? 0).toLocaleString()}</span>
                              </div>
                              <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden">
                                  <div className="bg-white h-full" style={{ width: '60%' }}></div>
                              </div>
                          </div>
                      );
                  })}
              </div>
          </div>
          
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
             <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-4">আসন ভিত্তিক মোট ভোটার</h3>
             <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={seats.map(s => ({ 
                        name: s.name, 
                        total: s.centers.reduce((sum, c) => sum + (c.totalVoters || 0), 0) 
                    }))}>
                        <XAxis dataKey="name" fontSize={9} fontWeight="bold" />
                        <YAxis hide />
                        <Tooltip />
                        <Bar dataKey="total" fill="#E5E7EB" radius={[4, 4, 0, 0]} barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
             </div>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;