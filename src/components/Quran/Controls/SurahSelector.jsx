import React from 'react';

const SurahSelector = ({ value, onChange, surahList, isMobile }) => {
  return (
    <div className="relative w-full">
      <select
        value={value}
        onChange={onChange}
        className="block w-full h-10 appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
        aria-label="Select Surah"
      >
        <option value="">Pilih Surat</option>
        {surahList.map(surah => (
          <option key={surah.no_surat} value={surah.no_surat}>
            {surah.no_surat}. {surah.nm_surat} {!isMobile && `(${surah.arti_surat})`}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
        </svg>
      </div>
    </div>
  );
};

export default SurahSelector;