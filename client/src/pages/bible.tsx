import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Book, Download, Trash2, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import type { BibleBook, BibleChapter, BibleVerse } from "@shared/schema";

export default function Bible() {
  const { toast } = useToast();
  const [selectedBook, setSelectedBook] = useState<string>("");
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const verseRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  // Fetch all books
  const { data: books, isLoading: booksLoading } = useQuery<BibleBook[]>({
    queryKey: ["/api/bible/books"],
    enabled: true,
  });

  // Fetch chapters for selected book
  const { data: chapters, isLoading: chaptersLoading } = useQuery<BibleChapter[]>({
    queryKey: ["/api/bible/books", selectedBook, "chapters"],
    enabled: !!selectedBook,
  });

  // Fetch verses for selected chapter
  const { data: verses, isLoading: versesLoading } = useQuery<BibleVerse[]>({
    queryKey: ["/api/bible/books", selectedBook, "chapters", selectedChapter?.toString(), "verses"],
    enabled: !!selectedBook && selectedChapter !== null,
  });

  // Download Bible data mutation
  const downloadMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/bible/download", { version: "kjv" });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Bible Downloaded Successfully",
        description: `Downloaded ${data.books} books, ${data.chapters} chapters, and ${data.verses} verses`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bible/books"] });
    },
    onError: (error) => {
      toast({
        title: "Download Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Clear Bible data mutation
  const clearMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", "/api/bible/data");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Bible Data Cleared",
        description: "All Bible data has been removed",
      });
      setSelectedBook("");
      setSelectedChapter(null);
      queryClient.invalidateQueries({ queryKey: ["/api/bible/books"] });
    },
    onError: (error) => {
      toast({
        title: "Clear Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Reset selections when book changes
  useEffect(() => {
    setSelectedChapter(null);
    setSelectedVerse(null);
  }, [selectedBook]);

  // Reset verse selection when chapter changes
  useEffect(() => {
    setSelectedVerse(null);
  }, [selectedChapter]);

  // Scroll to selected verse
  useEffect(() => {
    if (selectedVerse && verseRefs.current[selectedVerse]) {
      verseRefs.current[selectedVerse]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [selectedVerse]);

  const selectedBookData = books?.find(book => book.abbrev === selectedBook);
  const selectedChapterData = chapters?.find(chapter => chapter.chapterNumber === selectedChapter);

  const navigateChapter = (direction: "prev" | "next") => {
    if (!chapters || selectedChapter === null) return;
    
    const currentIndex = chapters.findIndex(ch => ch.chapterNumber === selectedChapter);
    if (currentIndex === -1) return;

    const newIndex = direction === "prev" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex >= 0 && newIndex < chapters.length) {
      setSelectedChapter(chapters[newIndex].chapterNumber);
    }
  };

  // Group books by testament
  const groupedBooks = books?.reduce((acc, book) => {
    if (!acc[book.testament]) {
      acc[book.testament] = [];
    }
    acc[book.testament].push(book);
    return acc;
  }, {} as Record<string, BibleBook[]>);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" data-testid="button-back-home">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Control Panel
                </Button>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-2">
                <Book className="h-5 w-5" />
                <h1 className="text-xl font-semibold">Bible</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => downloadMutation.mutate()}
                disabled={downloadMutation.isPending}
                data-testid="button-download-bible"
              >
                <Download className="h-4 w-4 mr-2" />
                {downloadMutation.isPending ? "Downloading..." : "Download Bible"}
              </Button>
              <Button
                variant="outline"
                onClick={() => clearMutation.mutate()}
                disabled={clearMutation.isPending}
                data-testid="button-clear-bible"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Data
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Book Selection Grid */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="h-5 w-5" />
                Bible Books
              </CardTitle>
            </CardHeader>
            <CardContent>
              {booksLoading ? (
                <div className="grid grid-cols-1 gap-2">
                  {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : books && books.length > 0 ? (
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {groupedBooks && Object.entries(groupedBooks).map(([testament, testamentBooks]) => (
                      <div key={testament}>
                        <h3 className="font-semibold text-sm text-muted-foreground mb-2 uppercase tracking-wide">
                          {testament === "OT" ? "Old Testament" : "New Testament"}
                        </h3>
                        <div className="grid grid-cols-1 gap-1 mb-4">
                          {testamentBooks.map((book) => (
                            <Button
                              key={book.id}
                              variant={selectedBook === book.abbrev ? "default" : "ghost"}
                              className="justify-between h-auto p-3"
                              onClick={() => setSelectedBook(book.abbrev)}
                              data-testid={`book-${book.abbrev}`}
                            >
                              <span className="font-medium">{book.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {book.abbrev.toUpperCase()}
                              </Badge>
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8">
                  <Book className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No Bible data available</p>
                  <Button
                    onClick={() => downloadMutation.mutate()}
                    disabled={downloadMutation.isPending}
                    data-testid="button-download-bible-empty"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Bible
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chapter Selection Grid */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>
                  {selectedBookData ? `${selectedBookData.name} - Chapters` : "Select Book First"}
                </span>
                {selectedBookData && (
                  <Badge variant="secondary" data-testid="badge-testament">
                    {selectedBookData.testament}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedBook ? (
                <p className="text-muted-foreground text-center py-8">
                  Select a book first to view chapters
                </p>
              ) : chaptersLoading ? (
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(16)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : chapters && chapters.length > 0 ? (
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateChapter("prev")}
                        disabled={!selectedChapter || chapters.findIndex(ch => ch.chapterNumber === selectedChapter) === 0}
                        data-testid="button-prev-chapter"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateChapter("next")}
                        disabled={!selectedChapter || chapters.findIndex(ch => ch.chapterNumber === selectedChapter) === chapters.length - 1}
                        data-testid="button-next-chapter"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {chapters.map((chapter) => (
                        <Button
                          key={chapter.id}
                          variant={selectedChapter === chapter.chapterNumber ? "default" : "outline"}
                          className="h-12 flex flex-col items-center justify-center"
                          onClick={() => setSelectedChapter(chapter.chapterNumber)}
                          data-testid={`chapter-${chapter.chapterNumber}`}
                        >
                          <span className="font-bold">{chapter.chapterNumber}</span>
                          <span className="text-xs opacity-70">{chapter.verseCount}v</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </ScrollArea>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No chapters found for this book
                </p>
              )}
            </CardContent>
          </Card>

          {/* Chapter View with Verse Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span>
                  {selectedBookData && selectedChapter 
                    ? `${selectedBookData.name} ${selectedChapter}`
                    : "Select Book & Chapter"
                  }
                </span>
                {verses && verses.length > 0 && (
                  <Select 
                    value={selectedVerse?.toString() || ""} 
                    onValueChange={(value) => setSelectedVerse(parseInt(value))}
                  >
                    <SelectTrigger className="w-32" data-testid="select-verse">
                      <SelectValue placeholder="Verse" />
                    </SelectTrigger>
                    <SelectContent>
                      {verses.map((verse) => (
                        <SelectItem key={verse.id} value={verse.verseNumber.toString()}>
                          Verse {verse.verseNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedBook || selectedChapter === null ? (
                <p className="text-muted-foreground text-center py-8">
                  Select a book and chapter to view verses
                </p>
              ) : versesLoading ? (
                <div className="space-y-3">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="h-4 w-8 flex-shrink-0" />
                      <Skeleton className="h-4 flex-1" />
                    </div>
                  ))}
                </div>
              ) : verses && verses.length > 0 ? (
                <ScrollArea className="h-[600px]">
                  <div className="space-y-3">
                    {verses.map((verse) => (
                      <div 
                        key={verse.id} 
                        ref={(el) => verseRefs.current[verse.verseNumber] = el}
                        className={`flex gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                          selectedVerse === verse.verseNumber 
                            ? "bg-primary/10 border-2 border-primary shadow-sm" 
                            : "hover:bg-muted/50 border border-transparent"
                        }`}
                        onClick={() => setSelectedVerse(verse.verseNumber)}
                        data-testid={`verse-${verse.verseNumber}`}
                      >
                        <Badge 
                          variant={selectedVerse === verse.verseNumber ? "default" : "outline"} 
                          className="text-xs min-w-[2rem] justify-center flex-shrink-0"
                        >
                          {verse.verseNumber}
                        </Badge>
                        <p className={`text-sm leading-relaxed ${
                          selectedVerse === verse.verseNumber ? "font-medium" : ""
                        }`}>
                          {verse.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No verses found for this chapter
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}