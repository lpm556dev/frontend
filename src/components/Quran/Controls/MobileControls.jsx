import React from 'react';
import SearchBar from './SearchBar';

const MobileControls = ({
  selectedSurah,
  handleSurahChange,
  surahList,
  selectedAyat,
  handleAyatChange,
  ayatOptions,
  currentHal,
  handlePageChange,
  currentJuz,
  handleJuzChange,
  searchText,
  handleSearchChange,
  handleSearch
}) => {
  return (
    <div className="bg-blue-100 sm:hidden">
      {/* Search Bar at the top matching the screenshot */}
      <div className="container mx-auto py-2 px-3">
        <div className="w-full mb-2">
          <SearchBar 
            value={searchText}
            onChange={handleSearchChange}
            onSubmit={handleSearch}
          />
        </div>
        
        {/* Surah and Ayat selectors in the same row */}
        <div className="flex items-center mb-2">
          <div className="w-3/4 pr-1">
            <select
              value={selectedSurah}
              onChange={handleSurahChange}
              className="block w-full appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
              aria-label="Select Surah"
            >
              <option value="">Pilih Surat</option>
              {surahList.map(surah => (
                <option key={surah.no_surat} value={surah.no_surat}>
                  {surah.no_surat}. {surah.nm_surat}
                </option>
              ))}
            </select>
          </div>
          
          <div className="w-1/4 pl-1">
            <select
              value={selectedAyat}
              onChange={handleAyatChange}
              disabled={!selectedSurah}
              className="block w-full appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-2 rounded leading-tight focus:outline-none focus:bg-white focus:border-blue-500 disabled:bg-gray-200 disabled:text-gray-500"
              aria-label="Select Ayat"
            >
              <option value="">Ayat</option>
              {ayatOptions.map(ayat => (
                <option key={ayat.value} value={ayat.value}>
                  {ayat.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Halaman and Juz selectors in one row */}
        <div className="flex items-center mb-1">
          <div className="w-1/2 pr-1">
            <select
              value={currentHal}
              onChange={handlePageChange}
              className="block w-full appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
              aria-label="Select Page"
            >
              <option value="">Halaman</option>
              {Array.from({ length: 604 }, (_, i) => (
                <option key={i+1} value={i+1}>{i+1}</option>
              ))}
            </select>
          </div>
          
          <div className="w-1/2 pl-1">
            <select
              value={currentJuz}
              onChange={handleJuzChange}
              className="block w-full appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
              aria-label="Select Juz"
            >
              <option value="">Juz</option>
              {Array.from({ length: 30 }, (_, i) => (
                <option key={i+1} value={i+1}>{i+1}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileControls;