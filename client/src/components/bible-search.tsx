
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, BookOpen } from "lucide-react";

interface BibleBook {
  id: string;
  name: string;
  chapters: number;
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

interface BibleSearchProps {
  onVerseSelect: (book: string, chapter: string, verse?: string) => void;
}

export function BibleSearch({ onVerseSelect }: BibleSearchProps) {
  const [selectedBook, setSelectedBook] = useState<string>("");
  const [selectedChapter, setSelectedChapter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredBooks, setFilteredBooks] = useState<BibleBook[]>(BIBLE_BOOKS);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = BIBLE_BOOKS.filter(book =>
        book.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.id === searchQuery
      );
      setFilteredBooks(filtered);
    } else {
      setFilteredBooks(BIBLE_BOOKS);
    }
  }, [searchQuery]);

  const handleBookSelect = (bookId: string) => {
    setSelectedBook(bookId);
    setSelectedChapter("");
  };

  const handleChapterSelect = (chapter: string) => {
    setSelectedChapter(chapter);
    if (selectedBook) {
      onVerseSelect(selectedBook, chapter);
    }
  };

  const selectedBookData = BIBLE_BOOKS.find(book => book.id === selectedBook);
  const chapters = selectedBookData ? Array.from({ length: selectedBookData.chapters }, (_, i) => i + 1) : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BookOpen className="h-5 w-5 mr-2 text-primary" />
          Bible Search
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search books by name or number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Book Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Book:</label>
          <Select value={selectedBook} onValueChange={handleBookSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Select a book" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {filteredBooks.map((book) => (
                <SelectItem key={book.id} value={book.id}>
                  {book.id}. {book.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Chapter Selection */}
        {selectedBook && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Chapter:</label>
            <Select value={selectedChapter} onValueChange={handleChapterSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select a chapter" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {chapters.map((chapter) => (
                  <SelectItem key={chapter} value={chapter.toString()}>
                    Chapter {chapter}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Quick Access Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedBook("19");
              setSelectedChapter("23");
              onVerseSelect("19", "23");
            }}
          >
            Psalm 23
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedBook("43");
              setSelectedChapter("3");
              onVerseSelect("43", "3");
            }}
          >
            John 3
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
