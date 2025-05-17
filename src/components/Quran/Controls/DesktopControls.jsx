import React from 'react';
import SurahSelector from './SurahSelector';
import AyatSelector from './AyatSelector';
import SearchBar from './SearchBar';

const DesktopControls = ({
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
    <div className="bg-blue-100 py-4 hidden sm:block">
      <div className="container mx-auto px-4">
        <div className="flex items-center">
          {/* Surah Selection - Take up more space */}
          <div className="w-1/3 pr-2">
            <select
              value={selectedSurah}
              onChange={handleSurahChange}
              className="block w-full h-10 appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
              aria-label="Select Surah"
            >
              <option value="">Pilih Surat</option>
              {surahList.map(surah => (
                <option key={surah.no_surat} value={surah.no_surat}>
                  {surah.no_surat}. {surah.nm_surat} ({surah.arti_surat})
                </option>
              ))}
            </select>
          </div>
          
          {/* Ayat Selection - Smaller width */}
          <div className="w-1/6 px-1">
            <select
              value={selectedAyat}
              onChange={handleAyatChange}
              disabled={!selectedSurah}
              className="block w-full h-10 appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded leading-tight focus:outline-none focus:bg-white focus:border-blue-500 disabled:bg-gray-200 disabled:text-gray-500"
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
          
          {/* Hal Selection */}
          <div className="w-1/6 px-1">
            <select
              value={currentHal}
              onChange={handlePageChange}
              className="block w-full h-10 appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
              aria-label="Select Page"
            >
              <option value="">Hal</option>
              {Array.from({ length: 604 }, (_, i) => (
                <option key={i+1} value={i+1}>{i+1}</option>
              ))}
            </select>
          </div>
          
          {/* Juz Selection */}
          <div className="w-1/6 px-1">
            <select
              value={currentJuz}
              onChange={handleJuzChange}
              className="block w-full h-10 appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
              aria-label="Select Juz"
            >
              <option value="">Juz</option>
              {Array.from({ length: 30 }, (_, i) => (
                <option key={i+1} value={i+1}>{i+1}</option>
              ))}
            </select>
          </div>
          
          {/* Search Box */}
          <div className="w-1/6 pl-2">
            <SearchBar 
              value={searchText}
              onChange={handleSearchChange}
              onSubmit={handleSearch}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesktopControls;