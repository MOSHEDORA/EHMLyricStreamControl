import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Save, 
  Trash2, 
  Edit, 
  Play,
  Plus,
  Music,
  User,
  Tags
} from "lucide-react";
import type { SavedSong } from "@shared/schema";

interface SavedSongsProps {
  currentTitle: string;
  currentLyrics: string;
  onSongSelect: (title: string, lyrics: string) => void;
}

export function SavedSongs({ currentTitle, currentLyrics, onSongSelect }: SavedSongsProps) {
  const [songs, setSongs] = useState<SavedSong[]>([]);
  const [filteredSongs, setFilteredSongs] = useState<SavedSong[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState<SavedSong | null>(null);
  
  // Form states for save/edit dialogs
  const [formTitle, setFormTitle] = useState("");
  const [formLyrics, setFormLyrics] = useState("");
  const [formArtist, setFormArtist] = useState("");
  const [formTags, setFormTags] = useState("");

  const { toast } = useToast();

  // Fetch songs from the API
  const fetchSongs = async (search?: string) => {
    try {
      setIsLoading(true);
      const url = new URL('/api/songs', window.location.origin);
      if (search) {
        url.searchParams.set('search', search);
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch songs');
      }
      
      const data = await response.json();
      setSongs(data.songs);
      setFilteredSongs(data.songs);
    } catch (error) {
      console.error('Error fetching songs:', error);
      toast({
        title: "Error",
        description: "Failed to load saved songs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  // Filter songs based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSongs(songs);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = songs.filter(song =>
      song.title.toLowerCase().includes(query) ||
      song.lyrics.toLowerCase().includes(query) ||
      song.artist?.toLowerCase().includes(query) ||
      song.tags.some(tag => tag.toLowerCase().includes(query))
    );
    setFilteredSongs(filtered);
  }, [searchQuery, songs]);

  const handleSaveSong = async () => {
    if (!formTitle.trim() || !formLyrics.trim()) {
      toast({
        title: "Error",
        description: "Title and lyrics are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const tags = formTags.split(',').map(tag => tag.trim()).filter(Boolean);
      
      const response = await fetch('/api/songs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formTitle.trim(),
          lyrics: formLyrics.trim(),
          artist: formArtist.trim() || undefined,
          tags: tags,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save song');
      }

      const data = await response.json();
      setSongs(prev => [...prev, data.song]);
      setSaveDialogOpen(false);
      setFormTitle("");
      setFormLyrics("");
      setFormArtist("");
      setFormTags("");

      toast({
        title: "Success",
        description: "Song saved successfully",
      });
    } catch (error) {
      console.error('Error saving song:', error);
      toast({
        title: "Error",
        description: "Failed to save song",
        variant: "destructive",
      });
    }
  };

  const handleEditSong = async () => {
    if (!selectedSong || !formTitle.trim() || !formLyrics.trim()) {
      toast({
        title: "Error",
        description: "Title and lyrics are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const tags = formTags.split(',').map(tag => tag.trim()).filter(Boolean);
      
      const response = await fetch(`/api/songs/${selectedSong.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formTitle.trim(),
          lyrics: formLyrics.trim(),
          artist: formArtist.trim() || undefined,
          tags: tags,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update song');
      }

      const data = await response.json();
      setSongs(prev => prev.map(song => song.id === selectedSong.id ? data.song : song));
      setEditDialogOpen(false);
      setSelectedSong(null);

      toast({
        title: "Success",
        description: "Song updated successfully",
      });
    } catch (error) {
      console.error('Error updating song:', error);
      toast({
        title: "Error",
        description: "Failed to update song",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSong = async (songId: string, songTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${songTitle}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/songs/${songId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete song');
      }

      setSongs(prev => prev.filter(song => song.id !== songId));

      toast({
        title: "Success",
        description: "Song deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting song:', error);
      toast({
        title: "Error",
        description: "Failed to delete song",
        variant: "destructive",
      });
    }
  };

  const openSaveDialog = () => {
    setFormTitle(currentTitle);
    setFormLyrics(currentLyrics);
    setFormArtist("");
    setFormTags("");
    setSaveDialogOpen(true);
  };

  const openEditDialog = (song: SavedSong) => {
    setSelectedSong(song);
    setFormTitle(song.title);
    setFormLyrics(song.lyrics);
    setFormArtist(song.artist || "");
    setFormTags(song.tags.join(", "));
    setEditDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Music className="h-5 w-5 mr-2 text-primary" />
            Saved Songs
          </span>
          <div className="flex space-x-2">
            <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openSaveDialog}
                  disabled={!currentTitle || !currentLyrics}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Current
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                  <DialogTitle>Save Song</DialogTitle>
                  <DialogDescription>
                    Save the current song to your collection for easy access later.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="save-title" className="text-right">
                      Title
                    </Label>
                    <Input
                      id="save-title"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="col-span-3"
                      placeholder="Song title"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="save-artist" className="text-right">
                      Artist
                    </Label>
                    <Input
                      id="save-artist"
                      value={formArtist}
                      onChange={(e) => setFormArtist(e.target.value)}
                      className="col-span-3"
                      placeholder="Artist (optional)"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="save-tags" className="text-right">
                      Tags
                    </Label>
                    <Input
                      id="save-tags"
                      value={formTags}
                      onChange={(e) => setFormTags(e.target.value)}
                      className="col-span-3"
                      placeholder="worship, hymn, contemporary (comma-separated)"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="save-lyrics" className="text-right pt-2">
                      Lyrics
                    </Label>
                    <Textarea
                      id="save-lyrics"
                      value={formLyrics}
                      onChange={(e) => setFormLyrics(e.target.value)}
                      className="col-span-3 min-h-[200px]"
                      placeholder="Song lyrics..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveSong}>Save Song</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search songs by title, lyrics, artist, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Songs List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-4">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading songs...</p>
            </div>
          ) : filteredSongs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? (
                <div>
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No songs found for "{searchQuery}"</p>
                </div>
              ) : (
                <div>
                  <Music className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No saved songs yet</p>
                  <p className="text-sm mt-1">Save your first song to get started!</p>
                </div>
              )}
            </div>
          ) : (
            filteredSongs.map((song) => (
              <Card key={song.id} className="p-3 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{song.title}</h4>
                    {song.artist && (
                      <p className="text-sm text-muted-foreground flex items-center mt-1">
                        <User className="h-3 w-3 mr-1" />
                        {song.artist}
                      </p>
                    )}
                    {song.tags.length > 0 && (
                      <div className="flex items-center flex-wrap gap-1 mt-1">
                        <Tags className="h-3 w-3 text-muted-foreground" />
                        {song.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="text-xs bg-muted px-2 py-0.5 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {song.lyrics.split('\n').slice(0, 2).join(' ').substring(0, 100)}
                      {song.lyrics.length > 100 ? '...' : ''}
                    </p>
                  </div>
                  <div className="flex space-x-1 ml-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onSongSelect(song.title, song.lyrics)}
                      title="Load this song"
                    >
                      <Play className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(song)}
                      title="Edit song"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteSong(song.id, song.title)}
                      title="Delete song"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>Edit Song</DialogTitle>
              <DialogDescription>
                Make changes to your saved song.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-title" className="text-right">
                  Title
                </Label>
                <Input
                  id="edit-title"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="col-span-3"
                  placeholder="Song title"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-artist" className="text-right">
                  Artist
                </Label>
                <Input
                  id="edit-artist"
                  value={formArtist}
                  onChange={(e) => setFormArtist(e.target.value)}
                  className="col-span-3"
                  placeholder="Artist (optional)"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-tags" className="text-right">
                  Tags
                </Label>
                <Input
                  id="edit-tags"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  className="col-span-3"
                  placeholder="worship, hymn, contemporary (comma-separated)"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="edit-lyrics" className="text-right pt-2">
                  Lyrics
                </Label>
                <Textarea
                  id="edit-lyrics"
                  value={formLyrics}
                  onChange={(e) => setFormLyrics(e.target.value)}
                  className="col-span-3 min-h-[200px]"
                  placeholder="Song lyrics..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditSong}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}