import { useState, useEffect, useCallback } from "react";

interface BibleVerse {
  number: string;
  text: string;
}

interface BibleChapter {
  book: string;
  chapter: string;
  verses: BibleVerse[];
}

export function useBible() {
  const [currentChapter, setCurrentChapter] = useState<BibleChapter | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadChapter = useCallback(async (book: string, chapter: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/tel_new/${book}/${chapter}.htm`);
      if (!response.ok) {
        throw new Error(`Chapter not found: ${book}:${chapter}`);
      }

      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Extract verses from the HTML
      const verses: BibleVerse[] = [];

      // Look for various HTML structures that might contain verses
      const possibleVerseElements = doc.querySelectorAll('p, div, span, td');

      possibleVerseElements.forEach((element) => {
        const text = element.textContent?.trim();
        if (text && text.length > 10) { // Filter out very short elements
          // Try multiple patterns for verse numbers
          const patterns = [
            /^(\d+)\s*[.-]\s*(.+)/, // "1. verse text" or "1 - verse text"
            /^(\d+)\s+(.+)/, // "1 verse text"
            /^\((\d+)\)\s*(.+)/, // "(1) verse text"
            /^v(\d+)\s*[.-]?\s*(.+)/i, // "v1. verse text"
          ];

          let matched = false;
          for (const pattern of patterns) {
            const verseMatch = text.match(pattern);
            if (verseMatch && verseMatch[2].trim().length > 5) {
              verses.push({
                number: verseMatch[1],
                text: verseMatch[2].trim()
              });
              matched = true;
              break;
            }
          }

          // If no pattern matched but text looks like a verse (contains Telugu characters)
          if (!matched && text.length > 20 && /[\u0C00-\u0C7F]/.test(text)) {
            verses.push({
              number: (verses.length + 1).toString(),
              text: text
            });
          }
        }
      });

      // If no verses found, try a simpler approach
      if (verses.length === 0) {
        const bodyText = doc.body?.textContent?.trim();
        if (bodyText) {
          // Split by common delimiters and filter
          const lines = bodyText.split(/[\n\r]+/).filter(line => 
            line.trim().length > 10 && /[\u0C00-\u0C7F]/.test(line)
          );

          lines.forEach((line, index) => {
            const trimmed = line.trim();
            if (trimmed) {
              verses.push({
                number: (index + 1).toString(),
                text: trimmed
              });
            }
          });
        }
      }

      setCurrentChapter({
        book,
        chapter,
        verses
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chapter');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    currentChapter,
    loading,
    error,
    loadChapter
  };
}