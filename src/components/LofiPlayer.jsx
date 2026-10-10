import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, ChevronLeft, ChevronRight } from 'lucide-react';
import './LofiPlayer.css';

const LofiPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [displayVolume, setDisplayVolume] = useState(0.7); // For slider display
  const [previousVolume, setPreviousVolume] = useState(0.7); // Store volume before muting
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [currentChannel, setCurrentChannel] = useState(0);
  const audioRef = useRef(null);
  const fadeIntervalRef = useRef(null);

  const channels = [
    { name: 'Lofi Girl', url: 'https://stream.zeno.fm/0r0xa792kwzuv' },
    { name: 'ChillHop', url: 'https://streams.fluxfm.de/Chillhop/mp3-320/streams.fluxfm.de/' },
    { name: 'Relaxing Beats', url: 'https://stream.zeno.fm/f3wvbbqmdg8uv' }
  ];

  useEffect(() => {
    audioRef.current = new Audio(channels[currentChannel].url);
    audioRef.current.volume = 0; // Start at 0 for fade-in
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current && !isMuted) {
      audioRef.current.volume = volume;
    } else if (audioRef.current && isMuted) {
      audioRef.current.volume = 0;
    }
  }, [volume, isMuted]);

  const fadeIn = (targetVolume) => {
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
    }
    
    let currentVol = 0;
    audioRef.current.volume = 0;
    
    fadeIntervalRef.current = setInterval(() => {
      currentVol += targetVolume / 20; // 20 steps
      if (currentVol >= targetVolume) {
        currentVol = targetVolume;
        clearInterval(fadeIntervalRef.current);
      }
      audioRef.current.volume = currentVol;
    }, 50); // 50ms intervals = 1 second total fade
  };

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
    } else {
      audioRef.current.play().catch(e => console.error("Audio play failed", e));
      if (!isMuted) {
        fadeIn(volume);
      }
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!isMuted) {
      // Muting: store current volume and set display to 0
      setPreviousVolume(volume);
      setDisplayVolume(0);
      setIsMuted(true);
    } else {
      // Unmuting: restore previous volume
      setVolume(previousVolume);
      setDisplayVolume(previousVolume);
      setIsMuted(false);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setDisplayVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
      setPreviousVolume(newVolume);
    }
  };

  const changeChannel = (direction) => {
    const wasPlaying = isPlaying;
    if (audioRef.current) {
      audioRef.current.pause();
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
    }
    
    let newIndex = currentChannel + direction;
    if (newIndex < 0) newIndex = channels.length - 1;
    if (newIndex >= channels.length) newIndex = 0;
    
    audioRef.current = new Audio(channels[newIndex].url);
    audioRef.current.volume = 0;
    setCurrentChannel(newIndex);
    
    if (wasPlaying) {
      audioRef.current.play().catch(e => console.error("Audio play failed", e));
      if (!isMuted) {
        fadeIn(volume);
      }
    }
  };

  return (
    <div className="lofi-player">
      <button onClick={togglePlay} className="control-btn" title={isPlaying ? "Pause" : "Play"}>
        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
      </button>

      <div 
        className="volume-container"
        onMouseEnter={() => setShowVolumeSlider(true)}
        onMouseLeave={() => setShowVolumeSlider(false)}
      >
        <button onClick={toggleMute} className="control-btn" title="Volume">
          {isMuted || displayVolume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
        
        {showVolumeSlider && (
          <div className="volume-slider-vertical">
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={displayVolume}
              onChange={handleVolumeChange}
              className="volume-slider"
              orient="vertical"
            />
          </div>
        )}
      </div>

      <span className="station-name">{channels[currentChannel].name}</span>

      <button 
        onClick={() => changeChannel(-1)} 
        className="control-btn nav-btn" 
        title="Previous Channel"
      >
        <ChevronLeft size={16} />
      </button>

      <button 
        onClick={() => changeChannel(1)} 
        className="control-btn nav-btn" 
        title="Next Channel"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default LofiPlayer;
