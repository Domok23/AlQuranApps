import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

function App() {
  const [surah, setSurah] = useState(null);
  const [surahList, setSurahList] = useState([]);
  const [currentSurah, setCurrentSurah] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch list of surahs
    const fetchSurahList = async () => {
      try {
        const response = await axios.get('https://api.alquran.cloud/v1/surah');
        setSurahList(response.data.data);
      } catch (error) {
        console.error('Error fetching surah list:', error);
      }
    };
    fetchSurahList();
  }, []);

  useEffect(() => {
    // Fetch specific surah
    const fetchSurah = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`https://api.alquran.cloud/v1/surah/${currentSurah}`);
        setSurah(response.data.data);
      } catch (error) {
        console.error('Error fetching surah:', error);
      }
      setLoading(false);
    };
    fetchSurah();
  }, [currentSurah]);

  const handlePrevSurah = () => {
    if (currentSurah > 1) {
      setCurrentSurah((prev) => prev - 1);
    }
  };

  const handleNextSurah = () => {
    if (currentSurah < 114) {
      setCurrentSurah((prev) => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-600 text-white py-6 px-4 shadow-lg">
        <h1 className="text-3xl font-bold text-center">Al-Qur'an Digital</h1>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Navigation */}
        <div className="flex justify-between items-center mb-6">
          <button onClick={handlePrevSurah} disabled={currentSurah === 1} className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg disabled:bg-gray-300">
            <ChevronLeftIcon className="h-5 w-5 mr-1" />
            Previous
          </button>

          <select value={currentSurah} onChange={(e) => setCurrentSurah(Number(e.target.value))} className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
            {surahList.map((s) => (
              <option key={s.number} value={s.number}>
                {s.number}. {s.englishName} ({s.name})
              </option>
            ))}
          </select>

          <button onClick={handleNextSurah} disabled={currentSurah === 114} className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg disabled:bg-gray-300">
            Next
            <ChevronRightIcon className="h-5 w-5 ml-1" />
          </button>
        </div>

        {/* Surah Content */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {loading ? (
            <div className="space-y-4">
              <Skeleton height={40} />
              <Skeleton count={5} />
            </div>
          ) : surah ? (
            <>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">{surah.name}</h2>
                <p className="text-xl text-gray-600">{surah.englishName}</p>
                <p className="text-gray-500">{surah.englishNameTranslation}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {surah.revelationType} • {surah.numberOfAyahs} Verses
                </p>
              </div>

              <div className="space-y-6">
                {surah.ayahs.map((ayah) => (
                  <div key={ayah.number} className="border-b pb-4">
                    <p className="text-2xl text-right mb-2 font-arabic">{ayah.text}</p>
                    <p className="text-sm text-gray-500">Verse {ayah.numberInSurah}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-center text-gray-500">Failed to load surah</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
