import React, { useState, useMemo, useEffect } from 'react';
import { INITIAL_SEATS } from './constants';
import { Seat } from './types';
import { DataService } from './services/dataService';
import Dashboard from './components/Dashboard';
import SeatDetail from './components/SeatDetail';
import AdminPanel from './components/AdminPanel';
import AdminLogin from './components/AdminLogin';

type ViewMode = 'DASHBOARD' | 'SEAT_DETAIL' | 'ADMIN_PANEL';

const App: React.FC = () => {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);
  const [isPermissionDenied, setIsPermissionDenied] = useState(false);
  
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('DASHBOARD');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const loadData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const latestData = await DataService.fetchLatestData();
      setSeats(latestData);
      setLastSynced(new Date());
      setDbError(null);
      setIsPermissionDenied(false);
    } catch (e: any) {
      if (e.message === 'PERMISSION_DENIED') {
        setIsPermissionDenied(true);
        setDbError("ফায়ারবেস পারমিশন ডিনাইড (৪0৩)");
        setSeats(DataService.getLocalBackup());
      } else {
        setDbError("ডাটাবেস কানেকশন ত্রুটি");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const interval = setInterval(() => {
      if (!isSyncing && !showLoginModal) {
        loadData(true);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const selectedSeat = useMemo(() => 
    seats.find(s => s.id === selectedSeatId) || null
  , [seats, selectedSeatId]);

  const handleSeatSelect = (id: string) => {
    setSelectedSeatId(id);
    setViewMode('SEAT_DETAIL');
  };

  const updateVotes = async (seatId: string, centerId: number, votes: Record<string, number>, invalidVotes: number) => {
    const updatedSeats = seats.map(seat => {
      if (seat.id !== seatId) return seat;
      return {
        ...seat,
        centers: seat.centers.map(center => {
          if (center.centerId !== centerId) return center;
          return { ...center, votes, invalidVotes, isReported: true };
        })
      };
    });

    setSeats(updatedSeats);
    setIsSyncing(true);
    try {
      const success = await DataService.saveData(updatedSeats);
      if (success) {
        setLastSynced(new Date());
        setDbError(null);
        setIsPermissionDenied(false);
      } else {
        setDbError("সিঙ্ক্রোনাইজেশন ফেইল হয়েছে");
      }
    } catch (e: any) {
      if (e.message === 'PERMISSION_DENIED') {
        setIsPermissionDenied(true);
        setDbError("সেভ করার অনুমতি নেই");
      }
    }
    setIsSyncing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Government_Seal_of_Bangladesh.svg/1024px-Government_Seal_of_Bangladesh.svg.png" className="w-12 h-12 mb-4 opacity-50" alt="Seal" />
        <h2 className="text-xl font-bold text-gray-700 font-['Hind_Siliguri']">নির্বাচন ডাটাবেস লোড হচ্ছে...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {isPermissionDenied && (
        <div className="bg-red-600 text-white px-4 py-2 text-center text-sm font-bold flex flex-col sm:flex-row items-center justify-center gap-2">
          <span>⚠️ ফায়ারবেস পারমিশন এরর: ডাটাবেস বর্তমানে লক করা আছে।</span>
          <a 
            href="https://console.firebase.google.com/project/election-2026-bc16b/firestore/rules" 
            target="_blank" 
            className="underline hover:text-red-100"
          >
            ফায়ারস্টোর রুলস আপডেট করুন (Allow Read/Write: if true)
          </a>
        </div>
      )}

      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => {
                setViewMode('DASHBOARD');
                setSelectedSeatId(null);
            }}
          >
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-0.5 shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Government_Seal_of_Bangladesh.svg/1024px-Government_Seal_of_Bangladesh.svg.png" 
                alt="BD Government Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-xl font-bold text-gray-800 hidden sm:block">নির্বাচন-২০২৬</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Live Update Status Grouped Together with Text */}
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                <div className="relative flex h-2.5 w-2.5">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isSyncing ? 'bg-blue-400' : (isPermissionDenied ? 'bg-orange-400' : 'bg-green-400')}`}></span>
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isSyncing ? 'bg-blue-500' : (isPermissionDenied ? 'bg-orange-500' : 'bg-green-500')}`}></span>
                </div>
                <span className={`text-[11px] font-bold uppercase tracking-wider ${isSyncing ? 'text-blue-600' : (isPermissionDenied ? 'text-orange-600' : 'text-gray-500')}`}>
                    {isSyncing ? 'সিঙ্ক্রোনাইজ হচ্ছে' : (isPermissionDenied ? 'অফলাইন মোড' : 'লাইভ আপডেট')}
                </span>
                {dbError && !isPermissionDenied && (
                  <span className="hidden lg:inline-block ml-2 px-2 py-0.5 bg-red-50 text-red-500 text-[10px] font-black rounded border border-red-100">
                    {dbError}
                  </span>
                )}
            </div>

            {/* Login/Admin Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3 pl-3 border-l border-gray-200">
              {isLoggedIn ? (
                <>
                  <button 
                    onClick={() => setViewMode('ADMIN_PANEL')}
                    className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-all ${viewMode === 'ADMIN_PANEL' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                  >
                    অ্যাডমিন
                  </button>
                  <button onClick={() => setIsLoggedIn(false)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setShowLoginModal(true)}
                  className="flex items-center space-x-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-100 active:scale-95"
                >
                  <span>লগইন</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-8 flex-grow w-full">
        {viewMode === 'DASHBOARD' && (
          <>
            <div className="flex justify-end mb-4">
                <button 
                    onClick={() => loadData()}
                    disabled={isSyncing}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-white border rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 shadow-sm transition-all active:scale-95"
                >
                    <svg className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>রিফ্রেশ</span>
                </button>
            </div>
            <Dashboard seats={seats} onSeatSelect={handleSeatSelect} />
          </>
        )}
        
        {viewMode === 'SEAT_DETAIL' && selectedSeat && (
          <SeatDetail 
            seat={selectedSeat} 
            isLoggedIn={isLoggedIn}
            onBack={() => setViewMode('DASHBOARD')} 
            onUpdateVotes={updateVotes}
            onRequestLogin={() => setShowLoginModal(true)}
          />
        )}

        {viewMode === 'ADMIN_PANEL' && (
          <AdminPanel 
            seats={seats} 
            onBack={() => setViewMode('DASHBOARD')}
          />
        )}
      </main>

      <footer className="bg-white border-t mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-gray-500 text-sm md:text-base font-medium">
                © তথ্য ও যোগাযোগ প্রযুক্তি অধিদপ্তর ও জেলা প্রশাসন, টাঙ্গাইল
            </p>
            {lastSynced && (
              <span className="text-[10px] text-gray-400 mt-2 block font-bold">
                সর্বশেষ ডাটা সিঙ্ক: {lastSynced.toLocaleTimeString('bn-BD')}
              </span>
            )}
        </div>
      </footer>

      {showLoginModal && (
        <AdminLogin 
          onLogin={(success) => {
            if (success) {
                setIsLoggedIn(true);
                setShowLoginModal(false);
            }
          }}
          onClose={() => setShowLoginModal(false)}
        />
      )}
    </div>
  );
};

export default App;