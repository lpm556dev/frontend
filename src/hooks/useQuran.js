import { useState, useEffect } from 'react';
import { quranApi } from '../services/ApiQuran';

const useQuran = () => {
    // State for Quran data
    const [surahList, setSurahList] = useState([]);
    const [selectedSurah, setSelectedSurah] = useState("");
    const [selectedAyat, setSelectedAyat] = useState("");
    const [quranContent, setQuranContent] = useState([]);
    const [surahDetails, setSurahDetails] = useState(null);

    // UI states - initially set as empty strings to show placeholder text
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchText, setSearchText] = useState("");
    const [currentHal, setCurrentHal] = useState("");
    const [currentJuz, setCurrentJuz] = useState("");
    const [showScrollTop, setShowScrollTop] = useState(false);

    // Fetch list of surahs on hook initialization
    useEffect(() => {
        fetchSurahList();
    }, []);

    // Fetch surah list from the API
    const fetchSurahList = async() => {
        setLoading(true);
        setError(null);

        try {
            const data = await quranApi.getSurahList();
            setSurahList(data);
        } catch (error) {
            console.error(error);
            setError('Failed to fetch surah list');
        } finally {
            setLoading(false);
        }
    };

    // Fetch surah details including metadata
    const fetchSurahDetails = async(surahId) => {
        setLoading(true);
        setError(null);

        try {
            const data = await quranApi.getSurahDetails(surahId);
            setSurahDetails(data);

            // Update juz and page information
            if (data.ayahs && data.ayahs.length > 0) {
                setCurrentJuz(data.ayahs[0].no_juz ? data.ayahs[0].no_juz.toString() : "");
                setCurrentHal(data.ayahs[0].no_hal ? data.ayahs[0].no_hal.toString() : "");
            }
        } catch (error) {
            console.error(error);
            setError('Failed to fetch surah details');
        } finally {
            setLoading(false);
        }
    };

    // Fetch specific ayat or range of ayat
    const fetchAyat = async(surahId, ayatId = null) => {
        setLoading(true);
        setError(null);

        try {
            const data = await quranApi.getAyat(surahId, ayatId);

            // Format the data for display
            setQuranContent(data);

            // Update juz and page if data is available
            if (data && data.length > 0) {
                setCurrentJuz(data[0].no_juz ? data[0].no_juz.toString() : "");
                setCurrentHal(data[0].no_hal ? data[0].no_hal.toString() : "");
            }

            // Scroll to top after loading new content
            window.scrollTo(0, 0);
        } catch (error) {
            console.error(error);
            setError('Failed to fetch Quranic verses');
        } finally {
            setLoading(false);
        }
    };

    // Fetch ayahs by page number
    const fetchByPage = async(pageId) => {
        setLoading(true);
        setError(null);

        try {
            const data = await quranApi.getPageVerses(pageId);
            setQuranContent(data);

            // Clear surah and ayat selections as we're now viewing by page
            setSelectedSurah("");
            setSelectedAyat("");

            // Update current page
            setCurrentHal(pageId.toString());

            // Update juz if first ayah has juz information
            if (data && data.length > 0) {
                setCurrentJuz(data[0].no_juz ? data[0].no_juz.toString() : "");
            }

            // Update page title to show first surah on this page
            if (data && data.length > 0 && data[0].surah_name) {
                setSurahDetails({
                    nm_surat: data[0].surah_name,
                    arti_surat: `Halaman ${pageId}`
                });
            } else {
                setSurahDetails({
                    nm_surat: `Halaman ${pageId}`,
                    arti_surat: ""
                });
            }

            // Scroll to top after loading new content
            window.scrollTo(0, 0);
        } catch (error) {
            console.error(error);
            setError('Failed to load page data');
        } finally {
            setLoading(false);
        }
    };

    // Fetch verses by juz
    const fetchJuz = async(juzId) => {
        setLoading(true);
        setError(null);

        try {
            const data = await quranApi.getJuzVerses(juzId);
            setQuranContent(data);

            // Update the current juz
            setCurrentJuz(juzId.toString());

            // Clear surah and ayat selections as we're now viewing by juz
            setSelectedSurah("");
            setSelectedAyat("");

            // Update the first page from returned data
            if (data && data.length > 0) {
                setCurrentHal(data[0].no_hal ? data[0].no_hal.toString() : "");
            }

            // Update page title to show juz number
            setSurahDetails({
                nm_surat: `Juz ${juzId}`,
                arti_surat: data && data.length > 0 ?
                    `Dimulai dari ${data[0].surah_name || ''}` : ""
            });

            // Scroll to top after loading new content
            window.scrollTo(0, 0);
        } catch (error) {
            console.error(error);
            setError('Failed to load juz data');
        } finally {
            setLoading(false);
        }
    };

    // Search the Quran for specific text
    const searchQuran = async(searchQuery) => {
        if (!searchQuery.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const data = await quranApi.searchQuran(searchQuery);
            setQuranContent(data);

            // Update page title to show search results
            setSurahDetails({
                nm_surat: `Hasil Pencarian`,
                arti_surat: `"${searchQuery}" (${data.length} hasil)`
            });

            // Scroll to top after loading new content
            window.scrollTo(0, 0);
        } catch (error) {
            console.error(error);
            setError('Failed to complete search');
        } finally {
            setLoading(false);
        }
    };

    // Generate ayat options based on selected surah
    const generateAyatOptions = () => {
        if (!selectedSurah) return [];

        const surah = surahList.find(s => s.no_surat === parseInt(selectedSurah));
        if (!surah) return [];

        const ayatOptions = [];
        for (let i = 1; i <= surah.jml_ayat; i++) {
            ayatOptions.push({ value: i.toString(), label: i.toString() });
        }
        return ayatOptions;
    };

    // Handle surah selection change
    const handleSurahChange = (e) => {
        const surahId = e.target.value;
        setSelectedSurah(surahId);
        setSelectedAyat("");

        if (surahId) {
            // Fetch surah details
            fetchSurahDetails(surahId);
            // Fetch all ayahs of the surah
            fetchAyat(surahId);
        } else {
            // Clear content if no surah is selected
            setQuranContent([]);
            setSurahDetails(null);
        }
    };

    // Handle ayat selection change
    const handleAyatChange = (e) => {
        const ayatId = e.target.value;
        setSelectedAyat(ayatId);

        if (selectedSurah && ayatId) {
            // Fetch specific ayat
            fetchAyat(selectedSurah, ayatId);
        } else if (selectedSurah) {
            // If no specific ayat is selected, fetch all ayahs of the surah
            fetchAyat(selectedSurah);
        }
    };

    // Handle juz selection
    const handleJuzChange = (e) => {
        const juzId = e.target.value;
        if (!juzId) return;

        setCurrentJuz(juzId); // Store as string to maintain empty state
        fetchJuz(juzId);
    };

    // Handle page selection
    const handlePageChange = (e) => {
        const pageId = e.target.value;
        if (!pageId) return;

        setCurrentHal(pageId); // Store as string to maintain empty state
        fetchByPage(pageId);
    };

    // Navigate to previous page
    const goToPreviousPage = () => {
        const current = parseInt(currentHal) || 1;
        if (current > 1) {
            const prevPage = current - 1;
            setCurrentHal(prevPage.toString());
            fetchByPage(prevPage.toString());
        }
    };

    // Navigate to next page
    const goToNextPage = () => {
        const current = parseInt(currentHal) || 1;
        if (current < 604) {
            const nextPage = current + 1;
            setCurrentHal(nextPage.toString());
            fetchByPage(nextPage.toString());
        }
    };

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchText(e.target.value);
    };

    // Handle search submission
    const handleSearch = (e) => {
        e.preventDefault();
        if (searchText.trim()) {
            searchQuran(searchText);
        }
    };

    // Scroll to top function
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    // Check if the current content is at the last item (surah, page or juz)
    const isAtEndOfContent = () => {
        if (!quranContent || quranContent.length === 0) return false;

        // Get the last item in current content
        const lastItem = quranContent[quranContent.length - 1];

        if (selectedSurah && surahDetails) {
            // For surah view, check if we're at the last ayat
            return lastItem.no_ayat === surahDetails.jml_ayat;
        } else if (currentHal) {
            // For page view, check if this is the last ayat on the page
            return quranContent.filter(item =>
                item.no_hal === lastItem.no_hal &&
                item.no_ayat > lastItem.no_ayat
            ).length === 0;
        } else if (currentJuz) {
            // For juz view, check if this is the last ayat in the juz
            return quranContent.filter(item =>
                item.no_juz === lastItem.no_juz &&
                (item.no_surat > lastItem.no_surat ||
                    (item.no_surat === lastItem.no_surat && item.no_ayat > lastItem.no_ayat))
            ).length === 0;
        }

        return false;
    };

    // Check if the current content is at the first item (surah, page or juz)
    const isAtStartOfContent = () => {
        if (!quranContent || quranContent.length === 0) return false;

        // Get the first item in current content
        const firstItem = quranContent[0];

        if (selectedSurah && surahDetails) {
            // For surah view, check if we're at the first ayat
            return firstItem.no_ayat === 1;
        } else if (currentHal) {
            // For page view, check if this is the first page
            return parseInt(currentHal) === 1;
        } else if (currentJuz) {
            // For juz view, check if this is the first juz
            return parseInt(currentJuz) === 1;
        }

        return false;
    };

    // Determine the next content to navigate to
    const getNextContent = () => {
        if (selectedSurah) {
            // For surah view, get the next surah
            const currentSurahId = parseInt(selectedSurah);
            const nextSurahId = currentSurahId + 1;

            const nextSurah = surahList.find(s => s.no_surat === nextSurahId);
            if (nextSurah) {
                return {
                    type: 'surah',
                    item: {
                        id: nextSurahId,
                        name: nextSurah.nm_surat,
                        number: nextSurahId
                    }
                };
            }
        } else if (currentHal) {
            // For page view, get the next page
            const pageNum = parseInt(currentHal);
            if (pageNum < 604) { // 604 is the total number of pages in standard Quran
                return {
                    type: 'page',
                    item: {
                        number: pageNum + 1
                    }
                };
            }
        } else if (currentJuz) {
            // For juz view, get the next juz
            const juzNum = parseInt(currentJuz);
            if (juzNum < 30) { // 30 is the total number of juz in Quran
                return {
                    type: 'juz',
                    item: {
                        number: juzNum + 1
                    }
                };
            }
        }

        return null;
    };

    // Determine the previous content to navigate to
    const getPreviousContent = () => {
        if (selectedSurah) {
            // For surah view, get the previous surah
            const currentSurahId = parseInt(selectedSurah);
            const prevSurahId = currentSurahId - 1;

            const prevSurah = surahList.find(s => s.no_surat === prevSurahId);
            if (prevSurah) {
                return {
                    type: 'surah',
                    item: {
                        id: prevSurahId,
                        name: prevSurah.nm_surat,
                        number: prevSurahId
                    }
                };
            }
        } else if (currentHal) {
            // For page view, get the previous page
            const pageNum = parseInt(currentHal);
            if (pageNum > 1) {
                return {
                    type: 'page',
                    item: {
                        number: pageNum - 1
                    }
                };
            }
        } else if (currentJuz) {
            // For juz view, get the previous juz
            const juzNum = parseInt(currentJuz);
            if (juzNum > 1) {
                return {
                    type: 'juz',
                    item: {
                        number: juzNum - 1
                    }
                };
            }
        }

        return null;
    };

    // Handle navigation to next content (surah, page, juz)
    const handleContinueToNext = () => {
        const nextContent = getNextContent();
        if (!nextContent) return;

        // Navigate based on content type
        switch (nextContent.type) {
            case 'surah':
                setSelectedSurah(nextContent.item.id.toString());
                setSelectedAyat("");
                fetchSurahDetails(nextContent.item.id);
                fetchAyat(nextContent.item.id);
                break;
            case 'page':
                fetchByPage(nextContent.item.number);
                break;
            case 'juz':
                fetchJuz(nextContent.item.number);
                break;
            default:
                break;
        }
    };

    // Handle navigation to previous content (surah, page, juz)
    const handleGoBackToPrevious = () => {
        const previousContent = getPreviousContent();
        if (!previousContent) return;

        // Navigate based on content type
        switch (previousContent.type) {
            case 'surah':
                setSelectedSurah(previousContent.item.id.toString());
                setSelectedAyat("");
                fetchSurahDetails(previousContent.item.id);
                fetchAyat(previousContent.item.id);
                break;
            case 'page':
                fetchByPage(previousContent.item.number);
                break;
            case 'juz':
                fetchJuz(previousContent.item.number);
                break;
            default:
                break;
        }
    };

    return {
        // State
        surahList,
        selectedSurah,
        selectedAyat,
        quranContent,
        surahDetails,
        loading,
        error,
        searchText,
        currentHal,
        currentJuz,
        showScrollTop,

        // Methods
        fetchSurahList,
        fetchSurahDetails,
        fetchAyat,
        fetchByPage,
        fetchJuz,
        searchQuran,
        generateAyatOptions,
        handleSurahChange,
        handleAyatChange,
        handleJuzChange,
        handlePageChange,
        goToPreviousPage,
        goToNextPage,
        handleSearchChange,
        handleSearch,
        scrollToTop,
        setShowScrollTop,

        // Continue functionality
        isAtEndOfContent,
        getNextContent,
        handleContinueToNext,
        isAtStartOfContent,
        getPreviousContent,
        handleGoBackToPrevious
    };
};

export default useQuran;