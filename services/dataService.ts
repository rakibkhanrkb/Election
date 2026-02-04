import { Seat } from '../types';
import { INITIAL_SEATS } from '../constants';

/**
 * Firebase Firestore REST API Configuration
 * Project ID: election-2026-bc16b
 */
const PROJECT_ID = 'election-2026-bc16b';
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
const DOCUMENT_PATH = 'results/tangail';
const API_URL = `${BASE_URL}/${DOCUMENT_PATH}`;
const STORAGE_KEY = 'election_data_2026_local_backup';

export const DataService = {
  /**
   * ফায়ারবেস থেকে ডাটা লোড করা
   */
  async fetchLatestData(): Promise<Seat[]> {
    try {
      const response = await fetch(`${API_URL}?t=${Date.now()}`);
      
      if (response.status === 404) {
        console.warn('Database document not found, initializing...');
        await this.saveData(INITIAL_SEATS);
        return INITIAL_SEATS;
      }

      if (response.status === 403) {
        // এই এররটি থ্রো করা হচ্ছে যাতে UI-তে ধরা যায়
        throw new Error('PERMISSION_DENIED');
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API_ERROR: ${response.status}`);
      }

      const firebaseData = await response.json();
      
      if (firebaseData.fields && firebaseData.fields.payload && firebaseData.fields.payload.stringValue) {
        try {
          const seats = JSON.parse(firebaseData.fields.payload.stringValue);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(seats));
          return seats;
        } catch (e) {
          console.error('JSON Parse Error from Firebase:', e);
          return this.getLocalBackup();
        }
      }

      return this.getLocalBackup();
    } catch (error: any) {
      if (error.message === 'PERMISSION_DENIED') {
        throw error; // App.tsx-এ হ্যান্ডেল করার জন্য
      }
      console.error('Firebase Connectivity Issue:', error);
      return this.getLocalBackup();
    }
  },

  /**
   * ফায়ারবেসে ডাটা সেভ করা
   */
  async saveData(seats: Seat[]): Promise<boolean> {
    const stringifiedData = JSON.stringify(seats);
    localStorage.setItem(STORAGE_KEY, stringifiedData);
    
    const payload = {
      fields: {
        payload: {
          stringValue: stringifiedData
        }
      }
    };

    try {
      // Firestore REST API-তে PATCH ব্যবহার করলে অবশ্যই updateMask দিতে হয়
      const response = await fetch(`${API_URL}?updateMask.fieldPaths=payload`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.status === 403) {
        throw new Error('PERMISSION_DENIED');
      }

      if (!response.ok) {
        // যদি PATCH কাজ না করে (নতুন প্রজেক্ট হলে), POST দিয়ে ট্রাই করুন
        const postResponse = await fetch(`${BASE_URL}/results?documentId=tangail`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!postResponse.ok) {
          const err = await postResponse.text();
          console.error('Save failed on both methods:', err);
          return false;
        }
      }

      console.log('Data successfully synced with Firebase');
      return true;
    } catch (error: any) {
      if (error.message === 'PERMISSION_DENIED') {
        throw error;
      }
      console.error('Cloud Sync Failed:', error);
      return false;
    }
  },

  getLocalBackup(): Seat[] {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (e) {
        return INITIAL_SEATS;
      }
    }
    return INITIAL_SEATS;
  }
};