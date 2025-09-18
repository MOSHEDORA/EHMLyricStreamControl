
import fs from 'fs';
import path from 'path';
import { DOMParser } from 'xmldom';

export interface BibleBook {
  id: string;
  name: string;
  chapters: BibleChapter[];
}

export interface BibleChapter {
  number: string;
  verses: BibleVerse[];
}

export interface BibleVerse {
  number: string;
  text: string;
}

export interface BibleVersion {
  id: string;
  name: string;
  language: string;
  books: BibleBook[];
}

class BibleParser {
  private bibles: Map<string, BibleVersion> = new Map();
  private biblesDir: string;

  constructor() {
    this.biblesDir = path.join(process.cwd(), 'Bibles');
    this.loadBibles();
  }

  public reloadBibles() {
    console.log('Reloading Bible files...');
    this.bibles.clear();
    this.loadBibles();
  }

  private loadBibles() {
    if (!fs.existsSync(this.biblesDir)) {
      console.log('Bibles directory not found');
      return;
    }

    const files = fs.readdirSync(this.biblesDir);
    const xmlFiles = files.filter(file => file.endsWith('.xml'));

    for (const file of xmlFiles) {
      try {
        const filePath = path.join(this.biblesDir, file);
        const xmlContent = fs.readFileSync(filePath, 'utf8');
        const bible = this.parseXMLBible(xmlContent, file);
        if (bible) {
          this.bibles.set(bible.id, bible);
          console.log(`Loaded Bible: ${bible.name} (${bible.language})`);
        }
      } catch (error) {
        console.error(`Error loading ${file}:`, error);
      }
    }
  }

  private parseXMLBible(xmlContent: string, filename: string): BibleVersion | null {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlContent, 'text/xml');
      
      // Check for parsing errors
      const parserError = doc.getElementsByTagName('parsererror')[0];
      if (parserError) {
        console.error(`XML parsing error in ${filename}:`, parserError.textContent);
        return null;
      }
      
      const root = doc.documentElement;
      if (!root) {
        console.error(`No root element found in ${filename}`);
        return null;
      }

      // Try different ways to get the title/name
      let name = filename.replace('.xml', '');
      const titleElement = root.getElementsByTagName('title')[0] || 
                          root.getElementsByTagName('name')[0] ||
                          root.getElementsByTagName('TITLE')[0] ||
                          root.getElementsByTagName('NAME')[0];
      
      if (titleElement?.textContent) {
        name = titleElement.textContent.trim();
      }

      const language = this.detectLanguage(name, xmlContent);
      console.log(`Parsing Bible: ${name} (${language}) from ${filename}`);
      
      const books: BibleBook[] = [];
      
      // Try different XML structures for books
      let bookElements = root.getElementsByTagName('book');
      if (bookElements.length === 0) {
        bookElements = root.getElementsByTagName('BIBLEBOOK');
      }
      if (bookElements.length === 0) {
        bookElements = root.getElementsByTagName('Book');
      }
      if (bookElements.length === 0) {
        bookElements = root.getElementsByTagName('BOOK');
      }
      
      console.log(`Found ${bookElements.length} books in ${filename}`);
      
      for (let i = 0; i < bookElements.length; i++) {
        const bookElement = bookElements[i];
        const book = this.parseBook(bookElement);
        if (book) {
          books.push(book);
        }
      }

      console.log(`Successfully parsed ${books.length} books from ${filename}`);
      
      return {
        id: filename.replace('.xml', ''),
        name,
        language,
        books
      };
    } catch (error) {
      console.error(`Error parsing XML file ${filename}:`, error);
      return null;
    }
  }

  private parseBook(bookElement: Element): BibleBook | null {
    try {
      // Try different attribute names for book name
      let bookName = bookElement.getAttribute('bname') || 
                    bookElement.getAttribute('name') ||
                    bookElement.getAttribute('BNAME') ||
                    bookElement.getAttribute('NAME') ||
                    bookElement.getAttribute('bsname') ||
                    bookElement.getAttribute('BSNAME');
      
      // If no attribute, try child elements
      if (!bookName) {
        const nameElement = bookElement.getElementsByTagName('name')[0] ||
                           bookElement.getElementsByTagName('NAME')[0] ||
                           bookElement.getElementsByTagName('title')[0] ||
                           bookElement.getElementsByTagName('TITLE')[0] ||
                           bookElement.getElementsByTagName('bname')[0] ||
                           bookElement.getElementsByTagName('BNAME')[0];
        bookName = nameElement?.textContent || nameElement?.getAttribute('value') || null;
      }
      
      // Try different attribute names for book ID/number
      let bookId = bookElement.getAttribute('bnumber') ||
                  bookElement.getAttribute('id') ||
                  bookElement.getAttribute('number') ||
                  bookElement.getAttribute('BNUMBER') ||
                  bookElement.getAttribute('ID') ||
                  bookElement.getAttribute('NUMBER') ||
                  bookElement.getAttribute('bnum') ||
                  bookElement.getAttribute('BNUM');
      
      if (!bookId) {
        // Use index as fallback
        const parentBooks = bookElement.parentNode?.children;
        if (parentBooks) {
          for (let i = 0; i < parentBooks.length; i++) {
            if (parentBooks[i] === bookElement) {
              bookId = (i + 1).toString();
              break;
            }
          }
        }
      }
      
      bookId = bookId || '1';
      
      // If still no book name, use a default book name based on book ID
      if (!bookName || bookName === 'Unknown Book') {
        bookName = this.getDefaultBookName(parseInt(bookId));
      }
      
      bookName = bookName.trim();

      const chapters: BibleChapter[] = [];
      
      // Try different tag names for chapters
      let chapterElements = bookElement.getElementsByTagName('chapter');
      if (chapterElements.length === 0) {
        chapterElements = bookElement.getElementsByTagName('CHAPTER');
      }
      if (chapterElements.length === 0) {
        chapterElements = bookElement.getElementsByTagName('Chapter');
      }

      for (let i = 0; i < chapterElements.length; i++) {
        const chapterElement = chapterElements[i];
        const chapter = this.parseChapter(chapterElement);
        if (chapter) {
          chapters.push(chapter);
        }
      }

      console.log(`Parsed book: ${bookName} (ID: ${bookId}) with ${chapters.length} chapters`);

      return {
        id: bookId,
        name: bookName,
        chapters
      };
    } catch (error) {
      console.error('Error parsing book:', error);
      return null;
    }
  }

  private parseChapter(chapterElement: Element): BibleChapter | null {
    try {
      // Try different attribute names for chapter number
      let chapterNumber = chapterElement.getAttribute('cnumber') ||
                         chapterElement.getAttribute('number') ||
                         chapterElement.getAttribute('CNUMBER') ||
                         chapterElement.getAttribute('NUMBER') ||
                         chapterElement.getAttribute('id') ||
                         chapterElement.getAttribute('ID');

      if (!chapterNumber) {
        // Use index as fallback
        const parentChapters = chapterElement.parentNode?.children;
        if (parentChapters) {
          for (let i = 0; i < parentChapters.length; i++) {
            if (parentChapters[i] === chapterElement) {
              chapterNumber = (i + 1).toString();
              break;
            }
          }
        }
      }
      
      chapterNumber = chapterNumber || '1';

      const verses: BibleVerse[] = [];
      
      // Try different tag names for verses
      let verseElements = chapterElement.getElementsByTagName('verse');
      if (verseElements.length === 0) {
        verseElements = chapterElement.getElementsByTagName('VERS');
      }
      if (verseElements.length === 0) {
        verseElements = chapterElement.getElementsByTagName('Verse');
      }
      if (verseElements.length === 0) {
        verseElements = chapterElement.getElementsByTagName('VERSE');
      }
      if (verseElements.length === 0) {
        verseElements = chapterElement.getElementsByTagName('v');
      }
      if (verseElements.length === 0) {
        verseElements = chapterElement.getElementsByTagName('V');
      }

      for (let i = 0; i < verseElements.length; i++) {
        const verseElement = verseElements[i];
        const verse = this.parseVerse(verseElement);
        if (verse) {
          verses.push(verse);
        }
      }

      return {
        number: chapterNumber,
        verses
      };
    } catch (error) {
      console.error('Error parsing chapter:', error);
      return null;
    }
  }

  private parseVerse(verseElement: Element): BibleVerse | null {
    try {
      // Try different attribute names for verse number
      let verseNumber = verseElement.getAttribute('vnumber') ||
                       verseElement.getAttribute('number') ||
                       verseElement.getAttribute('VNUMBER') ||
                       verseElement.getAttribute('NUMBER') ||
                       verseElement.getAttribute('id') ||
                       verseElement.getAttribute('ID') ||
                       verseElement.getAttribute('n');

      if (!verseNumber) {
        // Use index as fallback
        const parentVerses = verseElement.parentNode?.children;
        if (parentVerses) {
          for (let i = 0; i < parentVerses.length; i++) {
            if (parentVerses[i] === verseElement) {
              verseNumber = (i + 1).toString();
              break;
            }
          }
        }
      }
      
      verseNumber = verseNumber || '1';
      const verseText = verseElement.textContent?.trim() || '';

      // Skip empty verses
      if (!verseText) {
        return null;
      }

      return {
        number: verseNumber,
        text: verseText
      };
    } catch (error) {
      console.error('Error parsing verse:', error);
      return null;
    }
  }

  private getDefaultBookName(bookId: number): string {
    const englishBooks = [
      'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth',
      '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah',
      'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Songs', 'Isaiah', 'Jeremiah',
      'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah',
      'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
      'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians',
      'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
      '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter',
      '1 John', '2 John', '3 John', 'Jude', 'Revelation'
    ];
    
    if (bookId >= 1 && bookId <= englishBooks.length) {
      return englishBooks[bookId - 1];
    }
    
    return `Book ${bookId}`;
  }

  private detectLanguage(name: string, content: string): string {
    const lowerName = name.toLowerCase();
    const lowerContent = content.toLowerCase();
    
    if (lowerName.includes('telugu') || /[\u0C00-\u0C7F]/.test(content)) {
      return 'telugu';
    }
    if (lowerName.includes('english') || lowerName.includes('kjv') || lowerName.includes('esv')) {
      return 'english';
    }
    if (lowerName.includes('hindi') || /[\u0900-\u097F]/.test(content)) {
      return 'hindi';
    }
    
    return 'unknown';
  }

  public getBibles(): BibleVersion[] {
    return Array.from(this.bibles.values());
  }

  public getBible(id: string): BibleVersion | undefined {
    return this.bibles.get(id);
  }

  public getBiblesByLanguage(language: string): BibleVersion[] {
    return Array.from(this.bibles.values()).filter(bible => 
      bible.language === language
    );
  }

  public getVerse(bibleId: string, bookId: string, chapter: string, verse: string): BibleVerse | null {
    const bible = this.bibles.get(bibleId);
    if (!bible) return null;

    const book = bible.books.find(b => b.id === bookId);
    if (!book) return null;

    const chapterObj = book.chapters.find(c => c.number === chapter);
    if (!chapterObj) return null;

    return chapterObj.verses.find(v => v.number === verse) || null;
  }

  public getChapter(bibleId: string, bookId: string, chapterNumber: string): BibleChapter | null {
    const bible = this.bibles.get(bibleId);
    if (!bible) return null;

    const book = bible.books.find(b => b.id === bookId);
    if (!book) return null;

    return book.chapters.find(c => c.number === chapterNumber) || null;
  }
}

export const bibleParser = new BibleParser();
