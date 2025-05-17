import React from 'react';

const ContentHeader = ({ surahDetails, surahList, selectedSurah, currentJuz, currentHal }) => {
  return (
    <div className="text-center mb-8">
      <h2 className="text-3xl font-bold mb-2 uppercase">
        {surahDetails ? surahDetails.nm_surat : 
          (surahList.find(s => s.no_surat === parseInt(selectedSurah))?.nm_surat || 'Surah')}
      </h2>
      {surahDetails && (
        <p className="text-lg text-gray-700 mb-2">{surahDetails.arti_surat}</p>
      )}
      <p className="text-sm text-gray-600">
        Juz {currentJuz || '-'} • Halaman {currentHal || '-'}
      </p>
    </div>
  );
};

export default ContentHeader;