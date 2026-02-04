import React, { useState, useMemo, useEffect } from 'react';
import { INITIAL_SEATS } from './constants';
import { Seat } from './types';
<<<<<<< HEAD
=======
import { DataService } from './services/dataService';
>>>>>>> 8039d9f (Update project files)
import Dashboard from './components/Dashboard';
import SeatDetail from './components/SeatDetail';
import AdminPanel from './components/AdminPanel';
import AdminLogin from './components/AdminLogin';

type ViewMode = 'DASHBOARD' | 'SEAT_DETAIL' | 'ADMIN_PANEL';

<<<<<<< HEAD
const STORAGE_KEY = 'election_data_2026';

const App: React.FC = () => {
  // Initialize seats from localStorage or use initial constants
  const [seats, setSeats] = useState<Seat[]>(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (e) {
        console.error("Failed to parse saved election data", e);
        return INITIAL_SEATS;
      }
    }
    return INITIAL_SEATS;
  });

=======
const App: React.FC = () => {
  const [seats, setSeats] = useState<Seat[]>(INITIAL_SEATS);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  
>>>>>>> 8039d9f (Update project files)
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('DASHBOARD');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

<<<<<<< HEAD
  // Persistence effect: Save seats to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seats));
  }, [seats]);
=======
  // অ্যাপ লোড হওয়ার সময় ডাটাবেস থেকে ডাটা আনা
  useEffect(() => {
    const loadInitialData = async () => {
      setIsSyncing(true);
      const latestData = await DataService.fetchLatestData();
      setSeats(latestData);
      setLastSynced(new Date());
      setIsSyncing(false);
    };
    loadInitialData();
    
    // প্রতি ২ মিনিট পর পর অটো রিফ্রেশ (Optional)
    const interval = setInterval(loadInitialData, 120000);
    return () => clearInterval(interval);
  }, []);
>>>>>>> 8039d9f (Update project files)

  const selectedSeat = useMemo(() => 
    seats.find(s => s.id === selectedSeatId) || null
  , [seats, selectedSeatId]);

<<<<<<< HEAD
  const updateVotes = (seatId: string, centerId: number, votes: Record<string, number>, invalidVotes: number) => {
    setSeats(prevSeats => prevSeats.map(seat => {
=======
  const updateVotes = async (seatId: string, centerId: number, votes: Record<string, number>, invalidVotes: number) => {
    const updatedSeats = seats.map(seat => {
>>>>>>> 8039d9f (Update project files)
      if (seat.id !== seatId) return seat;
      return {
        ...seat,
        centers: seat.centers.map(center => {
          if (center.centerId !== centerId) return center;
          return { ...center, votes, invalidVotes, isReported: true };
        })
      };
<<<<<<< HEAD
    }));
  };

  const resetData = () => {
    if (window.confirm('আপনি কি নিশ্চিত যে আপনি সকল তথ্য মুছে ফেলে রিসেট করতে চান? এই কাজ আর ফিরিয়ে নেওয়া যাবে না।')) {
      setSeats(INITIAL_SEATS);
      localStorage.removeItem(STORAGE_KEY);
=======
    });

    setSeats(updatedSeats);
    setIsSyncing(true);
    const success = await DataService.saveData(updatedSeats);
    if (success) setLastSynced(new Date());
    setIsSyncing(false);
  };

  const resetData = async () => {
    if (window.confirm('আপনি কি নিশ্চিত যে আপনি সকল তথ্য মুছে ফেলে রিসেট করতে চান?')) {
      setSeats(INITIAL_SEATS);
      setIsSyncing(true);
      await DataService.saveData(INITIAL_SEATS);
      setLastSynced(new Date());
      setIsSyncing(false);
>>>>>>> 8039d9f (Update project files)
      alert('সকল তথ্য রিসেট করা হয়েছে।');
    }
  };

<<<<<<< HEAD
=======
  const handleManualRefresh = async () => {
    setIsSyncing(true);
    const data = await DataService.fetchLatestData();
    setSeats(data);
    setLastSynced(new Date());
    setIsSyncing(false);
  };

>>>>>>> 8039d9f (Update project files)
  const handleSeatSelect = (id: string) => {
    setSelectedSeatId(id);
    setViewMode('SEAT_DETAIL');
  };

  const openAdminPanel = () => {
    if (isLoggedIn) {
      setViewMode('ADMIN_PANEL');
      setSelectedSeatId(null);
    } else {
      setShowLoginModal(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navigation Header */}
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
          
          <div className="flex items-center space-x-2 sm:space-x-6">
<<<<<<< HEAD
=======
            <div className="flex items-center space-x-3 pr-4 border-r mr-2">
                <div className={`flex items-center space-x-1.5 px-2 py-1 rounded-full ${isSyncing ? 'bg-blue-50' : 'bg-green-50'}`}>
                    <svg className={`w-3.5 h-3.5 ${isSyncing ? 'text-blue-500 animate-spin' : 'text-green-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                    </svg>
                    <span className={`text-[10px] font-bold uppercase ${isSyncing ? 'text-blue-600' : 'text-green-600'}`}>
                        {isSyncing ? 'সিঙ্ক্রোনাইজ হচ্ছে' : 'আপডেটেড'}
                    </span>
                </div>
            </div>

>>>>>>> 8039d9f (Update project files)
            <div className="hidden md:flex items-center space-x-2">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">লাইভ আপডেট</span>
            </div>

            {isLoggedIn ? (
              <div className="flex items-center space-x-3">
                <button 
                  onClick={openAdminPanel}
                  className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-all ${viewMode === 'ADMIN_PANEL' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                >
                  অ্যাডমিন প্যানেল
                </button>
                <button 
                  onClick={() => setIsLoggedIn(false)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="লগআউট"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowLoginModal(true)}
                className="flex items-center space-x-2 px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>লগইন</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-8 flex-grow w-full">
        {viewMode === 'DASHBOARD' && (
<<<<<<< HEAD
          <Dashboard seats={seats} onSeatSelect={handleSeatSelect} />
=======
          <>
            <div className="flex justify-end mb-4">
                <button 
                    onClick={handleManualRefresh}
                    disabled={isSyncing}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-white border rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
                >
                    <svg className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>ডাটা রিফ্রেশ করুন</span>
                </button>
            </div>
            <Dashboard seats={seats} onSeatSelect={handleSeatSelect} />
          </>
>>>>>>> 8039d9f (Update project files)
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
            onResetData={resetData}
          />
        )}
      </main>
<<<<<<< HEAD
=======

>>>>>>> 8039d9f (Update project files)
      {/* Footer Section */}
      <footer className="bg-white border-t mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-gray-500 text-sm md:text-base font-medium">
                © তথ্য ও যোগাযোগ প্রযুক্তি অধিদপ্তর, টাঙ্গাইল ও জেলা প্রশাসন, টাঙ্গাইল
            </p>
            <div className="mt-2 flex items-center justify-center space-x-2 opacity-50">
                <div className="w-6 h-6 rounded-full overflow-hidden grayscale">
                   <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Government_Seal_of_Bangladesh.svg/1024px-Government_Seal_of_Bangladesh.svg.png" alt="Govt Logo" className="w-full h-full object-contain" />
                </div>
<<<<<<< HEAD
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">সরকারি নির্বাচন পোর্টাল (সংরক্ষিত ডেটাবেস সক্রিয়)</span>
=======
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    সেন্ট্রাল ডাটাবেস পোর্টাল {lastSynced ? `| সর্বশেষ সিঙ্ক: ${lastSynced.toLocaleTimeString()}` : ''}
                </span>
>>>>>>> 8039d9f (Update project files)
            </div>
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