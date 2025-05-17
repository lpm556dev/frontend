// Generate options for select inputs
export const generateOptions = (length, startFrom = 1, prefix = '') => {
    return Array.from({ length }, (_, i) => ({
        value: (i + startFrom).toString(),
        label: prefix ? `${prefix} ${i + startFrom}` : (i + startFrom).toString()
    }));
};

// Format Arabic text for better display
export const formatArabicText = (text) => {
    if (!text) return '';
    // Add any specific formatting needed for Arabic text
    return text;
};

// Get surah name by ID
export const getSurahNameById = (surahList, id) => {
    const surah = surahList.find(s => s.no_surat === parseInt(id));
    return surah ? surah.nm_surat : '';
};

// Parse juz or page number safely
export const safeParseInt = (value, defaultValue = 1) => {
    const parsed = parseInt(value);
    return isNaN(parsed) ? defaultValue : parsed;
};