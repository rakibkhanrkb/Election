import React, { useState, useMemo } from 'react';
import { INITIAL_SEATS } from './constants';
import { Seat } from './types';
import Dashboard from './components/Dashboard';
import SeatDetail from './components/SeatDetail';
import AdminPanel from './components/AdminPanel';
import AdminLogin from './components/AdminLogin';

type ViewMode = 'DASHBOARD' | 'SEAT_DETAIL' | 'ADMIN_PANEL';

const App: React.FC = () => {
  const [seats, setSeats] = useState<Seat[]>(INITIAL_SEATS);
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('DASHBOARD');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const selectedSeat = useMemo(() => 
    seats.find(s => s.id === selectedSeatId) || null
  , [seats, selectedSeatId]);

  const updateVotes = (seatId: string, centerId: number, votes: Record<string, number>, invalidVotes: number) => {
    setSeats(prevSeats => prevSeats.map(seat => {
      if (seat.id !== seatId) return seat;
      return {
        ...seat,
        centers: seat.centers.map(center => {
          if (center.centerId !== centerId) return center;
          return { ...center, votes, invalidVotes, isReported: true };
        })
      };
    }));
  };

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
          <Dashboard seats={seats} onSeatSelect={handleSeatSelect} />
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
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">সরকারি নির্বাচন পোর্টাল</span>
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