
import React, { useState } from 'react';

interface Props {
  onLogin: (success: boolean) => void;
  onClose: () => void;
}

const AdminLogin: React.FC<Props> = ({ onLogin, onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'rakib' && password === 'Ec2026') {
      onLogin(true);
    } else {
      setError('ভুল ইউজার আইডি অথবা পাসওয়ার্ড!');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 text-center bg-gray-50 border-b">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800">অ্যাডমিন লগইন</h2>
          <p className="text-sm text-gray-500 mt-1">তথ্য আপডেট করতে লগইন করুন</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">ইউজার নেম</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="rakib"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">পাসওয়ার্ড</label>
            <input 
              type="password" 
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex space-x-3 pt-2">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors text-sm"
            >
              বাতিল
            </button>
            <button 
              type="submit"
              className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all text-sm"
            >
              লগইন করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
