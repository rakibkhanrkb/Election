import React from 'react';
import { Seat } from '../types';

interface Props {
  seats: Seat[];
  onBack: () => void;
  onResetData?: () => void;
}

const AdminPanel: React.FC<Props> = ({ seats, onBack, onResetData }) => {
  const handlePrint = (seat: Seat) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const candidateTotals = seat.candidates.map(cand => ({
      ...cand,
      votes: seat.centers.reduce((sum, center) => sum + (center.votes[cand.id] || 0), 0)
    })).sort((a, b) => b.votes - a.votes);

    const invalidVotes = seat.centers.reduce((sum, center) => sum + (center.invalidVotes || 0), 0);
    const totalVotes = candidateTotals.reduce((s, c) => s + c.votes, 0) + invalidVotes;

    let html = `
      <html>
        <head>
          <title>নির্বাচন ফলাফল রিপোর্ট - ${seat.name}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;700&display=swap');
            body { font-family: 'Hind Siliguri', sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            h1 { margin: 0; color: #1e40af; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f8fafc; font-weight: bold; }
            .total-row { font-weight: bold; background: #f1f5f9; }
            .invalid-row { color: #dc2626; font-style: italic; }
            .footer { margin-top: 50px; text-align: right; font-size: 0.8em; color: #666; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Government_Seal_of_Bangladesh.svg/100px-Government_Seal_of_Bangladesh.svg.png" style="width:60px; height:60px; margin-bottom:10px;">
            <h1>নির্বাচন ফলাফল রিপোর্ট-২০২৬</h1>
            <h2>আসন: ${seat.name}</h2>
            <p>তারিখ: ${new Date().toLocaleDateString('bn-BD')} | সময়: ${new Date().toLocaleTimeString('bn-BD')}</p>
          </div>

          <h3>প্রার্থীদের ফলাফল সারসংক্ষেপ</h3>
          <table>
            <thead>
              <tr>
                <th>প্রার্থীর নাম</th>
                <th>দল/প্রতীক</th>
                <th>প্রাপ্ত ভোট</th>
                <th>শতাংশ</th>
              </tr>
            </thead>
            <tbody>
              ${candidateTotals.map(c => `
                <tr>
                  <td>${c.name}</td>
                  <td>${c.party} (${c.symbol})</td>
                  <td>${c.votes.toLocaleString()}</td>
                  <td>${totalVotes > 0 ? ((c.votes / totalVotes) * 100).toFixed(2) : '0'}%</td>
                </tr>
              `).join('')}
              <tr class="invalid-row">
                <td colspan="2">বাতিল ভোট</td>
                <td colspan="2">${invalidVotes.toLocaleString()}</td>
              </tr>
              <tr class="total-row">
                <td colspan="2">মোট সংগৃহীত ভোট (বাতিলসহ)</td>
                <td colspan="2">${totalVotes.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <h3 style="margin-top: 40px;">কেন্দ্র ভিত্তিক বিস্তারিত ফলাফল</h3>
          <table>
            <thead>
              <tr>
                <th>কেন্দ্রের নাম</th>
                <th>মোট ভোটার</th>
                ${seat.candidates.map(c => `<th>${c.symbol}</th>`).join('')}
                <th>বাতিল</th>
                <th>মোট কাস্ট</th>
              </tr>
            </thead>
            <tbody>
              ${seat.centers.filter(c => c.isReported).map(center => {
                const centerTotal = Object.values(center.votes).reduce((a, b) => a + b, 0) + (center.invalidVotes || 0);
                return `
                  <tr>
                    <td>${center.centerName}</td>
                    <td>${center.totalVoters.toLocaleString()}</td>
                    ${seat.candidates.map(cand => `<td>${center.votes[cand.id] || 0}</td>`).join('')}
                    <td>${center.invalidVotes || 0}</td>
                    <td>${centerTotal.toLocaleString()}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>রিপোর্ট জেনারেট করেছেন: অ্যাডমিন প্যানেল (Local Database Active)</p>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-2xl shadow-sm border gap-4">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
             <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
             </svg>
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">অ্যাডমিন কন্ট্রোল প্যানেল</h2>
            <p className="text-sm text-gray-500 font-medium">সকল তথ্য ব্রাউজার ডাটাবেসে সংরক্ষিত আছে</p>
          </div>
        </div>

        {onResetData && (
          <button 
            onClick={onResetData}
            className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-all text-xs border border-red-100"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>সকল ডেটা রিসেট করুন</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {seats.map(seat => {
          const reported = seat.centers.filter(c => c.isReported).length;
          return (
            <div key={seat.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-800">{seat.name}</h3>
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase">
                      {reported}/{seat.centers.length} কেন্দ্র রিপোর্ট করা হয়েছে
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {seat.candidates.slice(0, 4).map(c => {
                       const v = seat.centers.reduce((s, center) => s + (center.votes[c.id] || 0), 0);
                       return (
                         <div key={c.id} className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1 truncate">{c.name}</p>
                            <p className="text-lg font-black text-gray-800">{v.toLocaleString()}</p>
                         </div>
                       )
                    })}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => handlePrint(seat)}
                    className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all text-sm w-full md:w-auto justify-center"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    <span>রিপোর্ট প্রিন্ট করুন</span>
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default AdminPanel;