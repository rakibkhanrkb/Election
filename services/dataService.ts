import { Seat } from '../types';
import { INITIAL_SEATS } from '../constants';

// আপনার ডাটাবেস বা API এন্ডপয়েন্ট এখানে দিন
// উদাহরণ: https://your-db-api.com/v1/election-data
const API_URL = 'https://api.mock-database.com/election-2026'; 
const STORAGE_KEY = 'election_data_2026_local_backup';

export const DataService = {
  /**
   * ডাটাবেস থেকে সর্বশেষ ডাটা লোড করা
   */
  async fetchLatestData(): Promise<Seat[]> {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Database connection failed');
      const data = await response.json();
      // সফল হলে লোকাল ব্যাকআপ আপডেট করুন
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return data;
    } catch (error) {
      console.warn('Using local backup as database is offline:', error);
      const savedData = localStorage.getItem(STORAGE_KEY);
      return savedData ? JSON.parse(savedData) : INITIAL_SEATS;
    }
  },

  /**
   * ডাটাবেসে নতুন ডাটা সেভ করা
   */
  async saveData(seats: Seat[]): Promise<boolean> {
    // আগে লোকাল ব্যাকআপে সেভ করুন
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seats));
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(seats),
      });
      return response.ok;
    } catch (error) {
      console.error('Failed to sync with database:', error);
      return false;
    }
  }
};