import React, { useState, useEffect } from 'react';
import useAuthStore from '../../../stores/authStore';
import toast from 'react-hot-toast';

const AyatItem = ({ 
  ayat, 
  selectedSurah, 
  fontSizeClass = 'medium',
  showTranslation = true 
}) => {
  const [bookmark, setBookmark] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const { user } = useAuthStore();

  // Clean up audio when component unmounts
  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
        audio.removeEventListener('ended', handleAudioEnd);
      }
    };
  }, [audio]);

  const handleAudioEnd = () => {
    setIsPlaying(false);
    setIsLoadingAudio(false);
  };

  const toggleAudio = () => {
    if (isLoadingAudio) return;
    
    if (audio) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
        setIsLoadingAudio(false);
      } else {
        playAudio();
      }
    } else {
      playAudio();
    }
  };

  const playAudio = () => {
    setIsLoadingAudio(true);
    
    // Stop any currently playing audio
    if (audio) {
      audio.pause();
      audio.removeEventListener('ended', handleAudioEnd);
    }

    // Format surah and ayah numbers with leading zeros
    const surahNumber = String(ayat.no_surat).padStart(3, '0');
    const ayahNumber = String(ayat.no_ayat).padStart(3, '0');

    // List of available audio sources with Al-Afasy recitation
    const audioSources = [
      `https://verses.quran.com/Alafasy/mp3/${surahNumber}${ayahNumber}.mp3`,
      `https://download.quranicaudio.com/quran/mishary_rashid_alafasy/${surahNumber}${ayahNumber}.mp3`,
      `https://server.mp3quran.net/afs/${surahNumber}${ayahNumber}.mp3`,
      `https://everyayah.com/data/Alafasy_128kbps/${surahNumber}${ayahNumber}.mp3`
    ];

    let currentSourceIndex = 0;
    let audioError = null;

    const tryNextSource = () => {
      if (currentSourceIndex >= audioSources.length) {
        // All sources failed
        console.error('All audio sources failed:', audioError);
        toast.error('Tidak dapat memutar audio saat ini');
        setIsLoadingAudio(false);
        return;
      }

      const newAudio = new Audio(audioSources[currentSourceIndex]);
      
      // Remove previous event listeners if any
      newAudio.removeEventListener('error', handleAudioError);
      newAudio.removeEventListener('canplaythrough', handleCanPlay);
      
      newAudio.addEventListener('error', handleAudioError);
      newAudio.addEventListener('canplaythrough', handleCanPlay);
      newAudio.addEventListener('ended', handleAudioEnd);

      // Start loading the audio
      newAudio.load();
      
      function handleCanPlay() {
        newAudio.play()
          .then(() => {
            setAudio(newAudio);
            setIsPlaying(true);
            setIsLoadingAudio(false);
          })
          .catch(error => {
            audioError = error;
            currentSourceIndex++;
            tryNextSource();
          });
      }

      function handleAudioError(e) {
        audioError = e;
        currentSourceIndex++;
        tryNextSource();
      }
    };

    // Start trying sources
    tryNextSource();
  };

  // Get appropriate CSS classes based on font size
  const getArabicFontSizeClass = (size) => {
    switch (size) {
      case 'small':
        return 'text-xl';
      case 'medium':
        return 'text-2xl';
      case 'large':
        return 'text-3xl';
      default:
        return 'text-2xl';
    }
  };

  const getTranslationFontSizeClass = (size) => {
    switch (size) {
      case 'small':
        return 'text-xs';
      case 'medium':
        return 'text-sm';
      case 'large':
        return 'text-base';
      default:
        return 'text-sm';
    }
  };

  const renderArabicWithTajwid = (arabicText) => {
    const tajwidRules = [
      // Nun Sukun & Tanwin Rules
      { regex: /نْ[ء]/g, rule: 'izhar', color: '#673AB7' },
      { regex: /نْ[يرملون]/g, rule: 'idgham', color: '#3F51B5' },
      { regex: /نْ[ب]/g, rule: 'iqlab', color: '#8BC34A' },
      { regex: /نْ[^ءيرملونب]/g, rule: 'ikhfa', color: '#FF5722' },
      
      // Mim Sukun Rules
      { regex: /مْ[م]/g, rule: 'idgham-syafawi', color: '#00BCD4' },
      { regex: /مْ[ب]/g, rule: 'ikhfa-syafawi', color: '#9E9E9E' },
      { regex: /مْ[^مب]/g, rule: 'izhar-syafawi', color: '#607D8B' },
      
      // Mad Rules
      { regex: /َا|ِي|ُو/g, rule: 'mad-thabii', color: '#4CAF50' },
      { regex: /ٓ/g, rule: 'mad-lazim', color: '#009688' },
      { regex: /ٰ/g, rule: 'mad-arid', color: '#CDDC39' },
      { regex: /ـَى/g, rule: 'mad-lin', color: '#03A9F4' },
      
      // Other Rules
      { regex: /[قطبجد]ْ/g, rule: 'qalqalah', color: '#FFC107' },
      { regex: /اللّٰهِ|اللّه|الله/g, rule: 'lafadz-allah', color: '#E91E63' },
      { regex: /ّ/g, rule: 'tashdid', color: '#FF9800' },
      { regex: /ـ۠/g, rule: 'ghunnah', color: '#F44336' },
      { regex: /ْ/g, rule: 'sukun', color: '#9C27B0' },
      { regex: /ً|ٍ|ٌ/g, rule: 'tanwin', color: '#2196F3' },
      { regex: /ۜ|ۛ|ۚ|ۖ|ۗ|ۙ|ۘ/g, rule: 'waqf', color: '#795548' },
    ];

    const processedMap = new Map();
    let decoratedText = arabicText;
    let hasMatches = false;
    
    tajwidRules.forEach(({ regex, rule, color }) => {
      decoratedText = decoratedText.replace(regex, (match) => {
        if (processedMap.has(match + rule)) {
          return processedMap.get(match + rule);
        }
        
        hasMatches = true;
        const span = `<span class="tajwid-${rule}" style="color:${color}" title="${getTajwidRuleName(rule)}">${match}</span>`;
        processedMap.set(match + rule, span);
        return span;
      });
    });

    return decoratedText;
  };

  const getTajwidRuleName = (rule) => {
    const ruleNames = {
      'izhar': 'Izhar',
      'idgham': 'Idgham',
      'iqlab': 'Iqlab',
      'ikhfa': 'Ikhfa',
      'idgham-syafawi': 'Idgham Syafawi',
      'ikhfa-syafawi': 'Ikhfa Syafawi',
      'izhar-syafawi': 'Izhar Syafawi',
      'mad-thabii': 'Mad Thabii',
      'mad-lazim': 'Mad Lazim',
      'mad-arid': 'Mad Arid',
      'mad-lin': 'Mad Lin',
      'qalqalah': 'Qalqalah',
      'lafadz-allah': 'Lafadz Allah',
      'tashdid': 'Tashdid',
      'ghunnah': 'Ghunnah',
      'sukun': 'Sukun',
      'tanwin': 'Tanwin',
      'waqf': 'Tanda Waqaf'
    };
    return ruleNames[rule] || rule.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const saveBookmark = async () => {
    if (!user) {
      toast.error('Anda harus login terlebih dahulu');
      return;
    }
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    try {
      const response = await fetch(`${API_URL}/quran/bookmark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user?.userId,
          surah: selectedSurah || ayat.surah_name,
          ayah: ayat.no_ayat,
          page: ayat.no_hal,
          juz: ayat.no_juz
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      toast.success(data.message || 'Bookmark berhasil disimpan');
      setBookmark({
        surah: selectedSurah || ayat.surah_name,
        ayah: ayat.no_ayat,
        page: ayat.no_hal,
        juz: ayat.no_juz
      });
    } catch (error) {
      console.error('Error saving bookmark:', error);
      toast.error('Gagal menyimpan bookmark: ' + error.message);
    }
  };

  return (
    <div className="ayat-item bg-white rounded-lg p-4 shadow-sm mb-4">
      <div className="flex items-start">
        <span className="ayat-number bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 mt-1 text-sm">
          {ayat.no_ayat}
        </span>
        <div className="flex-1">
          {ayat.surah_name && !selectedSurah && (
            <div className="mb-2">
              <span className="text-sm font-medium text-blue-800">{ayat.surah_name}</span>
            </div>
          )}
          
          <div 
            className={`arab ${getArabicFontSizeClass(fontSizeClass)} leading-loose mb-3`} 
            dir="rtl" 
            dangerouslySetInnerHTML={{ __html: renderArabicWithTajwid(ayat.arab) }}
          />
          
          {ayat.tafsir && showTranslation && (
            <p className={`translation mt-2 text-gray-700 ${getTranslationFontSizeClass(fontSizeClass)}`}>
              {ayat.tafsir}
            </p>
          )}
          
          <div className="mt-4 flex gap-2">
            <button 
              onClick={toggleAudio}
              disabled={isLoadingAudio}
              className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isLoadingAudio 
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                  : isPlaying 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {isLoadingAudio ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Memuat...</span>
                </>
              ) : isPlaying ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>Berhenti</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  <span>Dengarkan</span>
                </>
              )}
            </button>
            
            <button 
              onClick={saveBookmark}
              className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                bookmark 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {bookmark ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                  </svg>
                  <span>Tersimpan</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  <span>Simpan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AyatItem;