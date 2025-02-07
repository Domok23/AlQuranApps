import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import parse from 'html-react-parser';

function App() {
  const [surah, setSurah] = useState(null);
  const [surahList, setSurahList] = useState([]);
  const [currentSurah, setCurrentSurah] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);

  useEffect(() => {
    // Fetch list of surahs
    const fetchSurahList = async () => {
      try {
        const response = await axios.get('https://equran.id/api/v2/surat');
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
        const response = await axios.get(`https://equran.id/api/v2/surat/${currentSurah}`);
        setSurah(response.data.data);
        setSearchResults(null); // Reset search results when changing surah
      } catch (error) {
        console.error('Error fetching surah:', error);
      }
      setLoading(false);
    };
    fetchSurah();
  }, [currentSurah]);

  const handlePrevSurah = () => {
    if (currentSurah > 1) {
      setCurrentSurah(prev => prev - 1);
    }
  };

  const handleNextSurah = () => {
    if (currentSurah < 114) {
      setCurrentSurah(prev => prev + 1);
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results = [];

    // Search in current surah
    if (surah) {
      // Search in surah details
      if (
        surah.nama.toLowerCase().includes(query) ||
        surah.namaLatin.toLowerCase().includes(query) ||
        surah.arti.toLowerCase().includes(query) ||
        (surah.deskripsi && surah.deskripsi.toLowerCase().includes(query))
      ) {
        results.push({
          type: 'surah',
          surahNumber: surah.nomor,
          content: `Surah ${surah.namaLatin} (${surah.nama})`
        });
      }

      // Search in ayat
      surah.ayat.forEach(ayah => {
        const matchFound = 
          ayah.teksArab.toLowerCase().includes(query) ||
          ayah.teksLatin.toLowerCase().includes(query) ||
          ayah.teksIndonesia.toLowerCase().includes(query);

        if (matchFound) {
          results.push({
            type: 'ayat',
            surahNumber: surah.nomor,
            ayatNumber: ayah.nomorAyat,
            content: ayah.teksIndonesia
          });
        }
      });
    }

    setSearchResults(results);
  };

  // Parse options untuk memastikan class dan style dipertahankan
  const parseOptions = {
    replace: (domNode) => {
      if (domNode.attribs && domNode.attribs.class && domNode.attribs.class.startsWith('color-tajwid-')) {
        return <span className={domNode.attribs.class}>{domNode.children[0].data}</span>;
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-600 text-white py-6 px-4 shadow-lg">
        <h1 className="text-3xl font-bold text-center">Al-Qur'an Digital</h1>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Cari surah, ayat, terjemahan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Search Results */}
        {searchResults && searchResults.length > 0 && (
          <div className="mb-6 bg-white rounded-lg shadow-lg p-4">
            <h2 className="text-xl font-semibold mb-4">Hasil Pencarian</h2>
            <div className="space-y-4">
              {searchResults.map((result, index) => (
                <div key={index} className="border-b pb-4">
                  <div className="flex items-center gap-2">
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {result.type === 'surah' ? 'Surah' : `Ayat ${result.ayatNumber}`}
                    </span>
                    <button
                      onClick={() => setCurrentSurah(result.surahNumber)}
                      className="text-green-600 hover:underline"
                    >
                      Lihat
                    </button>
                  </div>
                  <p className="mt-2 text-gray-600">{result.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {searchResults && searchResults.length === 0 && (
          <div className="mb-6 bg-white rounded-lg shadow-lg p-4">
            <p className="text-center text-gray-500">Tidak ada hasil yang ditemukan</p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handlePrevSurah}
            disabled={currentSurah === 1}
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg disabled:bg-gray-300"
          >
            <ChevronLeftIcon className="h-5 w-5 mr-1" />
            Sebelumnya
          </button>

          <select
            value={currentSurah}
            onChange={(e) => setCurrentSurah(Number(e.target.value))}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {surahList.map((s) => (
              <option key={s.nomor} value={s.nomor}>
                {s.nomor}. {s.namaLatin} ({s.nama})
              </option>
            ))}
          </select>

          <button
            onClick={handleNextSurah}
            disabled={currentSurah === 114}
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg disabled:bg-gray-300"
          >
            Selanjutnya
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
                <h2 className="text-4xl font-bold mb-2 font-arabic">{surah.nama}</h2>
                <p className="text-2xl text-gray-600">{surah.namaLatin}</p>
                <p className="text-gray-500">{surah.arti}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {surah.tempatTurun} • {surah.jumlahAyat} Ayat
                </p>
                {surah.deskripsi && (
                  <div className="mt-4 text-sm text-gray-600 text-left">
                    <h3 className="font-semibold mb-2">Deskripsi:</h3>
                    <div>{parse(surah.deskripsi)}</div>
                  </div>
                )}
              </div>

              <div className="space-y-8">
                {surah.ayat && surah.ayat.map((ayah) => (
                  <div key={ayah.nomorAyat} className="border-b pb-6">
                    <div className="flex justify-between items-center mb-4">
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                        Ayat {ayah.nomorAyat}
                      </span>
                    </div>
                    
                    {/* Arabic Text */}
                    <div className="text-3xl text-right mb-4 font-arabic leading-loose">
                      {parse(ayah.teksArab, parseOptions)}
                    </div>
                    
                    {/* Latin Text */}
                    <p className="text-lg mb-2 text-gray-700 italic">
                      {ayah.teksLatin}
                    </p>
                    
                    {/* Translation */}
                    <p className="text-gray-600">
                      {ayah.teksIndonesia}
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-center text-gray-500">Gagal memuat surah</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;