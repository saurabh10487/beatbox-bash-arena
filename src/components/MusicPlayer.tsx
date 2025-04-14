
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Repeat, Shuffle } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

// Define sample albums
const albums = [
  {
    id: 1,
    title: "Beatbox Classics",
    artist: "Beat Master",
    coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8bXVzaWN8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60",
    tracks: [
      { id: 101, title: "Classic Beat 1", duration: 118 },
      { id: 102, title: "Rhythm Flow", duration: 132 },
      { id: 103, title: "Beat Drop", duration: 97 },
    ]
  },
  {
    id: 2,
    title: "Urban Beats",
    artist: "DJ Pulse",
    coverUrl: "https://images.unsplash.com/photo-1445985543470-41fba5c3144a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8bXVzaWN8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60",
    tracks: [
      { id: 201, title: "Street Vibes", duration: 145 },
      { id: 202, title: "City Rhythm", duration: 126 },
      { id: 203, title: "Urban Flow", duration: 138 },
    ]
  },
  {
    id: 3,
    title: "Electronic Fusion",
    artist: "Synth Wave",
    coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8bXVzaWN8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60",
    tracks: [
      { id: 301, title: "Digital Dreams", duration: 162 },
      { id: 302, title: "Electronic Pulse", duration: 143 },
      { id: 303, title: "Synth Harmony", duration: 128 },
    ]
  }
];

const MusicPlayer = () => {
  const [currentAlbum, setCurrentAlbum] = useState(albums[0]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number | null>(null);
  
  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = volume / 100;
      
      // Add event listeners
      audioRef.current.addEventListener('ended', handleTrackEnd);
      audioRef.current.addEventListener('loadedmetadata', () => {
        setDuration(audioRef.current?.duration || 0);
      });
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('ended', handleTrackEnd);
        audioRef.current = null;
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  // For demo purposes, we're not actually loading audio files
  // In a real app, you would set the audio source here
  useEffect(() => {
    if (audioRef.current) {
      // In a real app: audioRef.current.src = trackUrl
      // For demo, we'll just simulate playback
      audioRef.current.duration = currentAlbum.tracks[currentTrackIndex].duration;
      setDuration(currentAlbum.tracks[currentTrackIndex].duration);
      setCurrentTime(0);
      
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Playback error:", e));
      }
    }
  }, [currentAlbum, currentTrackIndex]);
  
  const handleTrackEnd = () => {
    if (repeat) {
      // Repeat current track
      playTrack(currentTrackIndex);
    } else if (shuffle) {
      // Play random track
      const randomIndex = Math.floor(Math.random() * currentAlbum.tracks.length);
      playTrack(randomIndex);
    } else {
      // Play next track
      playTrack((currentTrackIndex + 1) % currentAlbum.tracks.length);
    }
  };
  
  const updateProgress = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      animationRef.current = requestAnimationFrame(updateProgress);
    }
  };
  
  const playPause = () => {
    if (!isPlaying) {
      audioRef.current?.play();
      setIsPlaying(true);
      animationRef.current = requestAnimationFrame(updateProgress);
    } else {
      audioRef.current?.pause();
      setIsPlaying(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
  };
  
  const playTrack = (index: number) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      // In a real app, set the src here
      audioRef.current.play().catch(e => console.error("Playback error:", e));
      animationRef.current = requestAnimationFrame(updateProgress);
    }
  };
  
  const prevTrack = () => {
    const newIndex = currentTrackIndex > 0 ? currentTrackIndex - 1 : currentAlbum.tracks.length - 1;
    playTrack(newIndex);
  };
  
  const nextTrack = () => {
    const newIndex = (currentTrackIndex + 1) % currentAlbum.tracks.length;
    playTrack(newIndex);
  };
  
  const changeAlbum = (albumId: number) => {
    const album = albums.find(a => a.id === albumId);
    if (album) {
      setCurrentAlbum(album);
      setCurrentTrackIndex(0);
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };
  
  const handleTimeChange = (value: number[]) => {
    const newTime = value[0];
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };
  
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };
  
  // Format time in MM:SS
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-beatbox-border overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Album section */}
        <div className="md:w-1/3 p-4 bg-gray-50">
          <h2 className="text-lg font-semibold mb-4">Albums</h2>
          <div className="space-y-4">
            {albums.map(album => (
              <div 
                key={album.id}
                onClick={() => changeAlbum(album.id)}
                className={`
                  flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors
                  ${currentAlbum.id === album.id ? 'bg-beatbox-primary/10' : 'hover:bg-gray-100'}
                `}
              >
                <img 
                  src={album.coverUrl} 
                  alt={album.title}
                  className="w-12 h-12 object-cover rounded-md"
                />
                <div>
                  <div className={`font-medium ${currentAlbum.id === album.id ? 'text-beatbox-primary' : ''}`}>
                    {album.title}
                  </div>
                  <div className="text-xs text-gray-500">{album.artist}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Player section */}
        <div className="md:w-2/3 p-4">
          <div className="flex flex-col h-full">
            {/* Current album info */}
            <div className="flex items-center gap-4 mb-4">
              <img 
                src={currentAlbum.coverUrl} 
                alt={currentAlbum.title}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div>
                <h2 className="text-lg font-semibold">{currentAlbum.title}</h2>
                <p className="text-sm text-gray-500">{currentAlbum.artist}</p>
              </div>
            </div>
            
            {/* Tracklist */}
            <div className="flex-1 overflow-y-auto mb-4">
              <h3 className="text-sm font-medium mb-2 text-gray-500">Tracks</h3>
              <div className="space-y-1">
                {currentAlbum.tracks.map((track, index) => (
                  <div 
                    key={track.id}
                    onClick={() => playTrack(index)}
                    className={`
                      flex items-center justify-between p-2 rounded-md cursor-pointer 
                      ${currentTrackIndex === index 
                        ? 'bg-beatbox-primary/10 text-beatbox-primary' 
                        : 'hover:bg-gray-100'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-5 text-center text-sm">
                        {isPlaying && currentTrackIndex === index 
                          ? '▶️' 
                          : index + 1
                        }
                      </div>
                      <span className="font-medium">{track.title}</span>
                    </div>
                    <span className="text-xs text-gray-500">{formatTime(track.duration)}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Playback controls */}
            <div>
              {/* Progress bar */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono text-gray-500">{formatTime(currentTime)}</span>
                <Slider
                  value={[currentTime]}
                  min={0}
                  max={duration}
                  step={1}
                  onValueChange={handleTimeChange}
                  className="flex-1"
                />
                <span className="text-xs font-mono text-gray-500">{formatTime(duration)}</span>
              </div>
              
              {/* Controls */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setShuffle(!shuffle)}
                    className={`p-2 rounded-full ${shuffle ? 'text-beatbox-primary bg-beatbox-primary/10' : 'text-gray-500 hover:bg-gray-100'}`}
                  >
                    <Shuffle size={16} />
                  </button>
                  <button 
                    onClick={prevTrack}
                    className="p-2 rounded-full text-gray-700 hover:bg-gray-100"
                  >
                    <SkipBack size={16} />
                  </button>
                  <button 
                    onClick={playPause}
                    className="p-3 rounded-full bg-beatbox-primary text-white hover:bg-beatbox-primary/90"
                  >
                    {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                  </button>
                  <button 
                    onClick={nextTrack}
                    className="p-2 rounded-full text-gray-700 hover:bg-gray-100"
                  >
                    <SkipForward size={16} />
                  </button>
                  <button 
                    onClick={() => setRepeat(!repeat)}
                    className={`p-2 rounded-full ${repeat ? 'text-beatbox-primary bg-beatbox-primary/10' : 'text-gray-500 hover:bg-gray-100'}`}
                  >
                    <Repeat size={16} />
                  </button>
                </div>
                
                <div className="flex items-center gap-2 w-24">
                  <Volume2 size={16} className="text-gray-500" />
                  <Slider
                    value={[volume]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={handleVolumeChange}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
