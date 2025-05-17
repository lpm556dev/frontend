const BASE_URL = 'https://api.quran.kemenag.go.id/v1';

export const getSurahList = async() => {
    const response = await fetch(`${BASE_URL}/surah`);
    const data = await response.json();
    return data.data;
};

export const getSurahDetail = async(surahId) => {
    const response = await fetch(`${BASE_URL}/surah/${surahId}`);
    const data = await response.json();
    return data.data;
};

export const getAyat = async(surahId) => {
    const response = await fetch(`${BASE_URL}/ayatweb/${surahId}/0/0/300`);
    const data = await response.json();
    return data.data;
};

export const getTafsir = async(surahId, ayatNumber) => {
    const response = await fetch(`${BASE_URL}/tafsir/${surahId}/${ayatNumber}`);
    const data = await response.json();
    return data.data;
};