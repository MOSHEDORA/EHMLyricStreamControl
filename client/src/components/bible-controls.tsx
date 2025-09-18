import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, BookOpen, Send, ChevronUp, ChevronDown, SkipBack, SkipForward, Download, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Dummy component for BibleDownloadManager
const BibleDownloadManager = ({ onDownloadComplete }: { onDownloadComplete: () => void }) => {
  return (
    <div className="border p-4 rounded-md bg-secondary/30">
      <h3 className="text-lg font-semibold mb-3">Bible Download Manager</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Here you can download different Bible versions.
        By default, Telugu and English KJV are available.
        See the Help tab for additional Bible version resources.
      </p>
      <div className="flex flex-wrap gap-2 mb-4">
        {/* Example of available Bibles */}
        <Badge variant="outline">Telugu</Badge>
        <Badge variant="outline">English KJV</Badge>
        <Badge variant="outline">Spanish Reina-Valera</Badge>
        {/* Add more badges for downloaded/available bibles */}
      </div>
      <Button onClick={onDownloadComplete} className="w-full">
        Close Manager
      </Button>
      {/* Placeholder for actual download functionality */}
    </div>
  );
};

interface BibleBook {
  id: string;
  name: string;
  chapters: number;
}

interface BibleVerse {
  number: string;
  text: string;
}

interface BibleChapter {
  book: string;
  chapter: string;
  verses: BibleVerse[];
}

const BIBLE_BOOKS: BibleBook[] = [
  { id: "01", name: "ఆదికాండము", chapters: 50 },
  { id: "02", name: "నిర్గమకాండము", chapters: 40 },
  { id: "03", name: "లేవీయకాండము", chapters: 27 },
  { id: "04", name: "సంఖ్యాకాండము", chapters: 36 },
  { id: "05", name: "ద్వితీయోపదేశకాండము", chapters: 34 },
  { id: "06", name: "యెహోషువ", chapters: 24 },
  { id: "07", name: "న్యాయాధిపతులు", chapters: 21 },
  { id: "08", name: "రూతు", chapters: 4 },
  { id: "09", name: "1 సమూయేలు", chapters: 31 },
  { id: "10", name: "2 సమూయేలు", chapters: 24 },
  { id: "11", name: "1 రాజులు", chapters: 22 },
  { id: "12", name: "2 రాజులు", chapters: 25 },
  { id: "13", name: "1 దినవృత్తాంతములు", chapters: 29 },
  { id: "14", name: "2 దినవృత్తాంతములు", chapters: 36 },
  { id: "15", name: "ఎజ్రా", chapters: 10 },
  { id: "16", name: "నెహెమ్యా", chapters: 13 },
  { id: "17", name: "ఎస్తేరు", chapters: 10 },
  { id: "18", name: "యోబు", chapters: 42 },
  { id: "19", name: "కీర్తనలు", chapters: 150 },
  { id: "20", name: "సామెతలు", chapters: 31 },
  { id: "21", name: "ప్రసంగి", chapters: 12 },
  { id: "22", name: "పరమగీతము", chapters: 8 },
  { id: "23", name: "యెషయా", chapters: 66 },
  { id: "24", name: "యిర్మీయా", chapters: 52 },
  { id: "25", name: "విలాపవాక్యములు", chapters: 5 },
  { id: "26", name: "యెహెజ్కేలు", chapters: 48 },
  { id: "27", name: "దానియేలు", chapters: 12 },
  { id: "28", name: "హోషేయ", chapters: 14 },
  { id: "29", name: "యోవేలు", chapters: 3 },
  { id: "30", name: "ఆమోసు", chapters: 9 },
  { id: "31", name: "ఓబద్యా", chapters: 1 },
  { id: "32", name: "యోనా", chapters: 4 },
  { id: "33", name: "మీకా", chapters: 7 },
  { id: "34", name: "నహూము", chapters: 3 },
  { id: "35", name: "హబక్కూకు", chapters: 3 },
  { id: "36", name: "జెఫన్యా", chapters: 3 },
  { id: "37", name: "హగ్గయి", chapters: 2 },
  { id: "38", name: "జెకర్యా", chapters: 14 },
  { id: "39", name: "మలాకీ", chapters: 4 },
  { id: "40", name: "మత్తయి", chapters: 28 },
  { id: "41", name: "మార్కు", chapters: 16 },
  { id: "42", name: "లూకా", chapters: 24 },
  { id: "43", name: "యోహాను", chapters: 21 },
  { id: "44", name: "అపొస్తుల కార్యములు", chapters: 28 },
  { id: "45", name: "రోమీయులకు", chapters: 16 },
  { id: "46", name: "1 కొరింథీయులకు", chapters: 16 },
  { id: "47", name: "2 కొరింథీయులకు", chapters: 13 },
  { id: "48", name: "గలతీయులకు", chapters: 6 },
  { id: "49", name: "ఎఫెసీయులకు", chapters: 6 },
  { id: "50", name: "ఫిలిప్పీయులకు", chapters: 4 },
  { id: "51", name: "కొలొస్సీయులకు", chapters: 4 },
  { id: "52", name: "1 థెస్సలొనీకీయులకు", chapters: 5 },
  { id: "53", name: "2 థెస్సలొనీకీయులకు", chapters: 3 },
  { id: "54", name: "1 తిమోతికి", chapters: 6 },
  { id: "55", name: "2 తిమోతికి", chapters: 4 },
  { id: "56", name: "తీతుకి", chapters: 3 },
  { id: "57", name: "ఫిలేమోనుకు", chapters: 1 },
  { id: "58", name: "హెబ్రీయులకు", chapters: 13 },
  { id: "59", name: "యాకోబు", chapters: 5 },
  { id: "60", name: "1 పేతురు", chapters: 5 },
  { id: "61", name: "2 పేతురు", chapters: 3 },
  { id: "62", name: "1 యోహాను", chapters: 5 },
  { id: "63", name: "2 యోహాను", chapters: 1 },
  { id: "64", name: "3 యోహాను", chapters: 1 },
  { id: "65", name: "యూదా", chapters: 1 },
  { id: "66", name: "ప్రకటన", chapters: 22 }
];

interface BibleControlsProps {
  onContentLoad?: (content: string, title: string) => void;
  onVerseSelect?: (verse: BibleVerse, reference: string) => void;
  showLoadButton?: boolean;
  displayMode: 'lyrics' | 'bible';
  setDisplayMode: (mode: 'lyrics' | 'bible') => void;
}

export function BibleControls({ displayMode, setDisplayMode, onContentLoad, onVerseSelect, showLoadButton = false }: BibleControlsProps & { displayMode: 'lyrics' | 'bible', setDisplayMode: (mode: 'lyrics' | 'bible') => void }) {
  const [selectedBook, setSelectedBook] = useState<string>("");
  const [selectedChapter, setSelectedChapter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredBooks, setFilteredBooks] = useState<BibleBook[]>(BIBLE_BOOKS);
  const [currentChapter, setCurrentChapter] = useState<BibleChapter | null>(null);
  const [loading, setLoading] = useState(false);
  const [bibleReference, setBibleReference] = useState("");
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [isAutoSending, setIsAutoSending] = useState(false);
  const [availableBibles, setAvailableBibles] = useState<any[]>([]);
  const [selectedBibles, setSelectedBibles] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['telugu']);
  const [showDownloadManager, setShowDownloadManager] = useState(false);
  const [availableBooks, setAvailableBooks] = useState<BibleBook[]>([]);
  const [playingVerse, setPlayingVerse] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'books' | 'chapters' | 'verses'>('books');
  const [selectedVerse, setSelectedVerse] = useState<string | null>(null);

  const loadAvailableBibles = async () => {
    try {
      const response = await fetch('/api/bibles');
      if (!response.ok) throw new Error('Failed to fetch bibles');
      const bibles = await response.json();
      setAvailableBibles(bibles);

      // Select Telugu and English by default if available
      const teluguBible = bibles.find((b: any) => b.language?.toLowerCase() === 'telugu');
      const englishBible = bibles.find((b: any) => b.language?.toLowerCase() === 'english');

      const defaultSelected = [];
      const defaultLanguages = [];

      if (teluguBible) {
        defaultSelected.push(teluguBible.id);
        defaultLanguages.push('telugu');
      }
      if (englishBible && !defaultSelected.includes(englishBible.id)) {
        defaultSelected.push(englishBible.id);
        defaultLanguages.push('english');
      }

      console.log('Default selected bibles:', defaultSelected);
      console.log('Default selected languages:', defaultLanguages);

      setSelectedBibles(defaultSelected.length > 0 ? defaultSelected : [bibles[0]?.id].filter(Boolean));
      setSelectedLanguages(defaultLanguages.length > 0 ? defaultLanguages : ['telugu']);

      // Fetch books from the API
      if (bibles.length > 0) {
        try {
          const booksResponse = await fetch(`/api/bibles/${bibles[0].id}/books`);
          if (!booksResponse.ok) throw new Error('Failed to fetch books');
          const booksData = await booksResponse.json();
          setAvailableBooks(booksData);
        } catch (err) {
          console.error('Failed to load books:', err);
          setAvailableBooks(BIBLE_BOOKS);
        }
      } else {
        setAvailableBooks(BIBLE_BOOKS);
      }
    } catch (err) {
      console.error('Failed to load Bibles:', err);
      setAvailableBibles([]);
      setSelectedBibles([]);
      setAvailableBooks(BIBLE_BOOKS);
    }
  };

  useEffect(() => {
    loadAvailableBibles();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const booksToFilter = availableBooks.length > 0 ? availableBooks : BIBLE_BOOKS;
      const filtered = booksToFilter.filter(book =>
        book.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.id === searchQuery
      );
      setFilteredBooks(filtered);
    } else {
      setFilteredBooks(availableBooks.length > 0 ? availableBooks : BIBLE_BOOKS);
    }
  }, [searchQuery, availableBooks]);

  const loadChapter = async (book: string, chapter: string, languagesToUse?: string[], biblesToUse?: string[]) => {
    if (loading) return;

    setLoading(true);
    try {
      // Use provided bibles or filter from current state
      const biblesToFilter = biblesToUse || selectedBibles;
      if (biblesToFilter.length === 0) {
        throw new Error('No Bible selected');
      }

      // Filter bibles based on selected languages (use provided languages or current state)
      const languagesToFilter = languagesToUse || selectedLanguages;
      const filteredBibles = biblesToFilter.filter(bibleId => {
        const bible = availableBibles.find(b => b.id === bibleId);
        if (languagesToFilter.length === 0) return true;
        return bible && languagesToFilter.some(lang =>
          bible.language?.toLowerCase() === lang.toLowerCase()
        );
      });

      const allVerses: BibleVerse[] = [];
      const verseMap = new Map<string, { texts: string[], languages: string[], bibleIds: string[] }>();
      const bookNames: string[] = [];

      console.log('Loading chapter with filtered bibles:', filteredBibles);
      console.log('Selected languages:', languagesToFilter);

      // Load from multiple Bible versions if selected
      for (const bibleId of filteredBibles) {
        try {
          console.log(`Loading from Bible: ${bibleId}`);
          const response = await fetch(`/api/bibles/${bibleId}/books/${book}/chapters/${chapter}`);
          if (response.ok) {
            const chapterData = await response.json();
            console.log(`Got chapter data from ${bibleId}:`, chapterData.verses?.length, 'verses');

            // Get book name from this Bible version
            try {
              const booksResponse = await fetch(`/api/bibles/${bibleId}/books`);
              if (booksResponse.ok) {
                const booksData = await booksResponse.json();
                const bookData = booksData.find((b: any) => b.id === book);
                if (bookData && bookData.name) {
                  const bookName = bookData.name.trim();
                  console.log(`Found book name from ${bibleId}:`, bookName);
                  if (bookName && !bookNames.some(name => name === bookName)) {
                    bookNames.push(bookName);
                  }
                }
              }
            } catch (err) {
              console.error(`Failed to fetch book name from ${bibleId}:`, err);
            }

            const bible = availableBibles.find(b => b.id === bibleId);
            const languageName = bible?.language || bibleId;

            chapterData.verses?.forEach((verse: BibleVerse) => {
              if (!verseMap.has(verse.number)) {
                verseMap.set(verse.number, { texts: [], languages: [], bibleIds: [] });
              }
              const verseData = verseMap.get(verse.number)!;
              verseData.texts.push(verse.text);
              verseData.languages.push(languageName.charAt(0).toUpperCase() + languageName.slice(1));
              verseData.bibleIds.push(bibleId);
            });
          } else {
            console.error(`Failed to load chapter from ${bibleId}:`, response.status);
          }
        } catch (err) {
          console.error(`Failed to load from ${bibleId}:`, err);
        }
      }

      console.log('Collected book names:', bookNames);
      console.log('Verse map size:', verseMap.size);

      // Convert map to verses array
      if (verseMap.size > 0) {
        const sortedVerseNumbers = Array.from(verseMap.keys()).sort((a, b) => parseInt(a) - parseInt(b));

        sortedVerseNumbers.forEach(verseNumber => {
          const verseData = verseMap.get(verseNumber)!;

          if (languagesToFilter.length > 1 && verseData.texts.length > 1) {
            // Multi-language display - combine all languages with reference format
            const combinedText = verseData.texts.map((text, index) => {
              // Get appropriate book name based on language
              let bookName;
              const language = verseData.languages[index].toLowerCase();
              const bibleId = verseData.bibleIds[index];

              console.log(`Processing verse ${verseNumber} for language: ${language}, bibleId: ${bibleId}`);

              if (language === 'telugu' || bibleId === 'TeluguBible') {
                // Always use Telugu book name from hardcoded BIBLE_BOOKS for Telugu
                // Convert book number to match BIBLE_BOOKS id format
                const bookId = book.toString().padStart(2, '0');
                bookName = BIBLE_BOOKS.find(b => b.id === bookId)?.name;
                console.log(`Telugu book name lookup - book: ${book}, bookId: ${bookId}, found: ${bookName}`);
                if (!bookName) {
                  bookName = `Book ${book}`;
                }
              } else {
                // For English and other languages, try to get English book name
                const englishBookName = bookNames.find(name => {
                  // Check if this is an English book name (not Telugu)
                  return !BIBLE_BOOKS.find(b => b.name === name);
                });
                bookName = englishBookName || `Book ${book}`;
                console.log(`English book name: ${bookName}`);
              }

              const reference = `${bookName} ${chapter}:${verseNumber} (${verseData.languages[index]})`;
              return `${reference}\n${text}`;
            }).join('\n\n');

            allVerses.push({
              number: verseNumber,
              text: combinedText
            });
          } else {
            // Single language display - use appropriate book name
            const language = verseData.languages[0]?.toLowerCase() || 'english';
            const bibleId = verseData.bibleIds[0];
            let bookName;

            console.log(`Single verse processing - language: ${language}, bibleId: ${bibleId}, book: ${book}`);

            if (language === 'telugu' || bibleId === 'TeluguBible') {
              // Always use Telugu book name from hardcoded BIBLE_BOOKS for Telugu
              // Convert book number to match BIBLE_BOOKS id format
              const bookId = book.toString().padStart(2, '0');
              bookName = BIBLE_BOOKS.find(b => b.id === bookId)?.name;
              console.log(`Telugu book name for single verse - book: ${book}, bookId: ${bookId}, found: ${bookName}`);
              if (!bookName) {
                bookName = `Book ${book}`;
              }
            } else {
              // For English and other languages, use the book name from API
              bookName = bookNames[0] || `Book ${book}`;
              console.log(`Non-Telugu book name for single verse: ${bookName}`);
            }

            allVerses.push({
              number: verseNumber,
              text: verseData.texts[0] || ''
            });
          }
        });
      }

      // Fallback to original method if API fails
      if (allVerses.length === 0) {
        const response = await fetch(`/tel_new/${book}/${chapter}.htm`);
        if (!response.ok) {
          throw new Error(`Chapter not found: ${book}:${chapter}`);
        }

        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        let mainText = doc.body?.textContent?.trim() || '';
        mainText = mainText.replace(/\s+/g, ' ').trim();

        const versePattern = /(?:^|\s)(\d+)\s+/g;
        const matches = [...mainText.matchAll(versePattern)];

        if (matches.length > 0) {
          for (let i = 0; i < matches.length; i++) {
            const match = matches[i];
            const verseNumber = match[1];
            const startPos = match.index! + match[0].indexOf(verseNumber);

            let endPos = mainText.length;
            if (i < matches.length - 1) {
              const nextMatch = matches[i + 1];
              endPos = nextMatch.index!;
            }

            const verseStart = startPos + verseNumber.length;
            let verseText = mainText.slice(verseStart, endPos).trim();
            verseText = verseText.replace(/^\s*[.-]\s*/, '');
            verseText = verseText.replace(/\s+/g, ' ');

            if (verseText && verseText.length > 5) {
              allVerses.push({
                number: verseNumber,
                text: verseText.trim()
              });
            }
          }
        }
      }

      const chapterData = { book, chapter, verses: allVerses };
      setCurrentChapter(chapterData);

      // Create reference with appropriate book names based on selected languages
      let reference = '';
      console.log('Creating reference with book names:', bookNames);
      console.log('Selected languages count:', languagesToFilter.length);
      console.log('Book ID:', book);

      if (languagesToFilter.length > 1) {
        // Multiple languages - use appropriate book names for each language
        const referenceNames = [];

        // Always add Telugu book name first if Telugu is selected
        if (languagesToFilter.includes('telugu')) {
          // Convert book number to match BIBLE_BOOKS id format
          const bookId = book.toString().padStart(2, '0');
          const teluguBookName = BIBLE_BOOKS.find(b => b.id === bookId)?.name;
          console.log('Telugu book name found - book:', book, 'bookId:', bookId, 'name:', teluguBookName);
          if (teluguBookName) {
            referenceNames.push(teluguBookName);
          }
        }

        // Then add English book name if English is selected and available
        if (languagesToFilter.includes('english')) {
          const englishBookName = bookNames.find(name => {
            // Check if this is NOT a Telugu book name (i.e., it's an English name)
            return !BIBLE_BOOKS.find(b => b.name === name);
          });
          console.log('English book name found:', englishBookName);
          if (englishBookName) {
            referenceNames.push(englishBookName);
          }
        }

        reference = `${referenceNames.join(' / ')} ${chapter}`;
      } else if (languagesToFilter.length === 1) {
        // Single language
        const lang = languagesToFilter[0];
        console.log('Single language:', lang);
        if (lang === 'telugu') {
          // Always use Telugu book name from hardcoded BIBLE_BOOKS for Telugu
          // Convert book number to match BIBLE_BOOKS id format
          const bookId = book.toString().padStart(2, '0');
          const teluguBookName = BIBLE_BOOKS.find(b => b.id === bookId)?.name;
          console.log('Telugu book name for single language - book:', book, 'bookId:', bookId, 'name:', teluguBookName);
          reference = `${teluguBookName || `Book ${book}`} ${chapter}`;
        } else {
          // Use book name from API response for non-Telugu languages
          reference = `${bookNames[0] || `Book ${book}`} ${chapter}`;
        }
      } else {
        // Fallback when no language is selected - prefer Telugu names
        const fallbackBookName = BIBLE_BOOKS.find(b => b.id === book)?.name ||
                                availableBooks.find(b => b.id === book)?.name ||
                                `Book ${book}`;
        reference = `${fallbackBookName} ${chapter}`;
      }

      console.log('Final reference:', reference);
      setBibleReference(reference);
      setCurrentView('verses');

    } catch (error) {
      console.error('Failed to load chapter:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookSelect = (bookId: string) => {
    setSelectedBook(bookId);
    setSelectedChapter("");
    setCurrentChapter(null);
    setCurrentVerseIndex(0);
    setCurrentView('chapters');
  };

  const handleChapterSelect = async (chapter: string) => {
    setSelectedChapter(chapter);
    setIsAutoSending(false);
    if (selectedBook) {
      await loadChapter(selectedBook, chapter);
    }
  };

  const handleVerseClick = async (verse: BibleVerse) => {
    if (playingVerse === verse.number) {
      // Stop playing - disable Bible output
      setPlayingVerse(null);
      setSelectedVerse(null);
      if (onContentLoad) {
        onContentLoad('', ''); // Clear content
      }

      // Clear the WebSocket session content
      try {
        await fetch('/api/sessions/default', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lyricsText: '',
            currentLine: 0,
            songTitle: ''
          })
        });
      } catch (error) {
        console.error('Failed to clear session:', error);
      }
    } else {
      setPlayingVerse(verse.number);
      setSelectedVerse(verse.number);
      const reference = `${bibleReference}:${verse.number}`;
      let content = verse.text;
      if (displayMode === 'lyrics') {
        // Output only the number of lines set in displayLines
        const lines = verse.text.split(/\r?\n/);
        // Get displayLines from sessionStorage or default to 1
        let displayLines = 1;
        const session = JSON.parse(sessionStorage.getItem('session') || '{}');
        if (session && session.displayLines) displayLines = session.displayLines;
        content = `${verse.number}\n${lines.slice(0, displayLines).join('\n')}`;
      } else {
        content = verse.text;
      }
      if (onContentLoad) {
        onContentLoad(content, reference);
      }
      try {
        await fetch('/api/sessions/default', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lyricsText: content,
            currentLine: 0,
            songTitle: reference
          })
        });
      } catch (error) {
        console.error('Failed to update session:', error);
      }
    }
  };

  const sendFullChapterToDisplay = async () => {
    if (!currentChapter) return;
    let content = '';
    if (displayMode === 'lyrics') {
      content = currentChapter.verses.map(verse => `${bibleReference}:${verse.number}\n${verse.text}`).join('\n\n');
    } else {
      content = currentChapter.verses.map(verse => verse.text).join('\n\n');
    }
    const title = bibleReference;
    if (onContentLoad) {
      onContentLoad(content, title);
    }
    try {
      await fetch('/api/sessions/default', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lyricsText: content,
          currentLine: 0,
          songTitle: title
        })
      });
    } catch (error) {
      console.error('Failed to update session:', error);
    }
  };

  const handleDownloadComplete = async () => {
    await loadAvailableBibles();
    setShowDownloadManager(false);
  };

  const handleBackNavigation = () => {
    if (currentView === 'verses') {
      setCurrentView('chapters');
      setCurrentChapter(null);
      setSelectedChapter("");
      setSelectedVerse(null);
      setPlayingVerse(null);
    } else if (currentView === 'chapters') {
      setCurrentView('books');
      setSelectedBook("");
      setSelectedChapter("");
      setCurrentChapter(null);
      setSelectedVerse(null);
      setPlayingVerse(null);
    }
  };

  const selectedBookData = (availableBooks.length > 0 ? availableBooks : BIBLE_BOOKS).find(book => book.id === selectedBook);
  const chapters = selectedBookData ? Array.from({ length: selectedBookData.chapters }, (_, i) => i + 1) : [];

  // Get available languages from downloaded Bibles
  const availableLanguages = Array.from(new Set(
    availableBibles.map(bible => {
      const lang = bible.language || 'unknown';
      return lang.charAt(0).toUpperCase() + lang.slice(1).toLowerCase();
    }).filter(lang => lang !== 'Unknown')
  )).sort();

  const toggleLanguage = (language: string) => {
    const newSelection = selectedLanguages.includes(language)
      ? selectedLanguages.filter(l => l !== language)
      : [...selectedLanguages, language];

    console.log('Language toggle:', language, 'New selection:', newSelection);
    setSelectedLanguages(newSelection);

    // Update selected Bibles based on new language selection
    const filteredBibles = availableBibles.filter(bible => {
      if (newSelection.length === 0) return true;
      return newSelection.some(lang =>
        bible.language?.toLowerCase() === lang.toLowerCase()
      );
    });

    console.log('Filtered bibles after language change:', filteredBibles.map(b => `${b.id} (${b.language})`));
    setSelectedBibles(filteredBibles.map(bible => bible.id));

    // Reset verse states
    setCurrentChapter(null);
    setCurrentVerseIndex(0);
    setSelectedVerse(null);
    setPlayingVerse(null);

    // Reload chapter if we're viewing verses
    if (currentView === 'verses' && selectedBook && selectedChapter) {
      const newFilteredBibles = filteredBibles.map(bible => bible.id);
      console.log('About to reload chapter with:', newSelection, newFilteredBibles);
      loadChapter(selectedBook, selectedChapter, newSelection, newFilteredBibles);
    }
  };

  return (
    <div className="space-y-6 p-4">
      {/* Toggle Button for Lyrics/Bible */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex gap-2">
          <button
            className={`px-3 py-1 rounded ${displayMode === 'lyrics' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            onClick={() => setDisplayMode('lyrics')}
          >
            Lyrics
          </button>
          <button
            className={`px-3 py-1 rounded ${displayMode === 'bible' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            onClick={() => setDisplayMode('bible')}
          >
            Bible
          </button>
        </div>
        <div className="flex items-center gap-2">
          {currentView !== 'books' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackNavigation}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDownloadManager(!showDownloadManager)}
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            Manage Versions
          </Button>
        </div>
      </div>

      {showDownloadManager && (
        <BibleDownloadManager onDownloadComplete={handleDownloadComplete} />
      )}

      {/* Language Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Select Languages:</label>
        <div className="flex flex-wrap gap-2">
          {availableLanguages.map((language) => (
            <Badge
              key={language}
              variant={selectedLanguages.includes(language.toLowerCase()) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleLanguage(language.toLowerCase())}
            >
              {language}
            </Badge>
          ))}
        </div>
      </div>

      {/* Bible Version Selection */}
      {currentView === 'books' && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Bible Version:</label>
            <Select value={selectedBibles[0] || ""} onValueChange={(bibleId) => setSelectedBibles([bibleId])}>
              <SelectTrigger>
                <SelectValue placeholder="Select Bible" />
              </SelectTrigger>
              <SelectContent>
                {availableBibles.map((bible) => (
                  <SelectItem key={bible.id} value={bible.id}>
                    {bible.name} ({bible.language})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Search Books:</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      )}

      {/* Navigators above tabs, below URLs */}
      <div className="flex justify-center gap-2 my-2">
        <Button
          variant="outline"
          size="sm"
          disabled={currentView === 'books'}
          onClick={() => {
            if (currentView === 'chapters') handleBackNavigation();
            if (currentView === 'verses') setCurrentView('chapters');
          }}
        >
          Prev
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={currentView === 'verses' || !selectedBook}
          onClick={() => {
            if (currentView === 'books' && selectedBook) setCurrentView('chapters');
            if (currentView === 'chapters' && selectedChapter) setCurrentView('verses');
          }}
        >
          Next
        </Button>
      </div>

      {/* Tabs for navigation */}
      <Tabs value={currentView} onValueChange={v => setCurrentView(v as any)} className="mb-4">
        <TabsList>
          <TabsTrigger value="books">Books</TabsTrigger>
          <TabsTrigger value="chapters" disabled={!selectedBook}>Chapters</TabsTrigger>
          <TabsTrigger value="verses" disabled={!selectedChapter}>Verses</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Books Grid Display */}
      {currentView === 'books' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              All Books
              {selectedLanguages.length > 0 && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({selectedLanguages.map(lang => lang.charAt(0).toUpperCase() + lang.slice(1)).join(', ')})
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 max-h-96 overflow-y-auto">
              {(searchQuery ? filteredBooks : availableBooks.length > 0 ? availableBooks : BIBLE_BOOKS).map((book) => (
                <Button
                  key={book.id}
                  variant={selectedBook === book.id ? "default" : "outline"}
                  size="sm"
                  className="h-auto p-2 text-xs flex flex-col items-center justify-center"
                  onClick={() => handleBookSelect(book.id)}
                >
                  <div className="font-bold">{book.id}</div>
                  <div className="text-center leading-tight mt-1" title={book.name}>
                    {book.name.length > 15 ? `${book.name.substring(0, 15)}...` : book.name}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{book.chapters} ch</div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chapters Grid Display */}
      {currentView === 'chapters' && selectedBookData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedBookData.name} - Chapters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 max-h-96 overflow-y-auto">
              {chapters.map((chapter) => (
                <Button
                  key={chapter}
                  variant={selectedChapter === chapter.toString() ? "default" : "outline"}
                  size="sm"
                  className="h-10 text-sm"
                  onClick={() => handleChapterSelect(chapter.toString())}
                >
                  {chapter}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Verses Grid Display */}
      {currentView === 'verses' && currentChapter && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{bibleReference}</CardTitle>
              <Button onClick={sendFullChapterToDisplay} variant="secondary" size="sm">
                <Send className="h-4 w-4 mr-2" />
                Send Chapter
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
              {currentChapter.verses.map((verse, index) => (
                <div
                  key={verse.number}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-all ${
                    playingVerse === verse.number ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/30'
                  }`}
                  onClick={() => handleVerseClick(verse)}
                >
                  <span className={`px-2 py-1 rounded text-sm font-bold min-w-8 text-center ${
                    playingVerse === verse.number ? 'bg-primary-foreground text-primary' : 'bg-primary text-primary-foreground'
                  }`}>
                    {verse.number}
                  </span>
                  <div className="text-sm leading-relaxed flex-1 whitespace-pre-line">
                    {verse.text}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="text-center py-4">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading chapter...</p>
        </div>
      )}
    </div>
  );
}