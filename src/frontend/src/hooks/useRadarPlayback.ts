import { useState, useEffect, useCallback, useRef } from 'react';
import type { RadarFrame } from '../lib/rainviewer';

export function useRadarPlayback(
  frames: RadarFrame[], 
  initialFrameIndex?: number
) {
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(isPlaying);
  const framesRef = useRef(frames);

  // Keep ref in sync with state
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Track frames array identity to detect replacements
  useEffect(() => {
    framesRef.current = frames;
  }, [frames]);

  // Auto-play animation with looping and steady frame advancement
  useEffect(() => {
    if (!isPlaying || frames.length === 0) return;

    const interval = setInterval(() => {
      setCurrentFrameIndex((prev) => {
        // Loop back to start after last frame
        if (prev >= frames.length - 1) {
          return 0;
        }
        return prev + 1;
      });
    }, 500); // 500ms per frame for steady playback

    return () => clearInterval(interval);
  }, [isPlaying, frames.length]);

  // Reset and stop playback when frames array changes or initialFrameIndex changes
  useEffect(() => {
    // Stop playing when frames change to avoid confusion
    setIsPlaying(false);
    
    if (frames.length === 0) {
      // No frames available - reset to 0
      setCurrentFrameIndex(0);
      return;
    }
    
    // Use provided initial index or default to 0
    const targetIndex = initialFrameIndex !== undefined ? initialFrameIndex : 0;
    // Clamp index to valid bounds
    setCurrentFrameIndex(Math.max(0, Math.min(targetIndex, frames.length - 1)));
  }, [frames, initialFrameIndex]);

  const play = useCallback(() => {
    if (frames.length > 1) {
      setIsPlaying(true);
    }
  }, [frames.length]);
  
  const pause = useCallback(() => setIsPlaying(false), []);
  
  // User-initiated seek (pauses playback)
  const seekToFrame = useCallback((index: number) => {
    if (frames.length > 0) {
      setCurrentFrameIndex(Math.max(0, Math.min(index, frames.length - 1)));
    }
    setIsPlaying(false);
  }, [frames.length]);

  // Programmatic frame update (does not pause)
  const setFrameIndexSilent = useCallback((index: number) => {
    if (frames.length > 0) {
      setCurrentFrameIndex(Math.max(0, Math.min(index, frames.length - 1)));
    }
  }, [frames.length]);

  const getCurrentFrame = useCallback(() => {
    if (frames.length === 0 || currentFrameIndex >= frames.length) {
      return null;
    }
    return frames[currentFrameIndex] || null;
  }, [frames, currentFrameIndex]);

  const getFrameLabel = useCallback((index: number) => {
    if (frames.length === 0 || index >= frames.length) {
      return '';
    }
    
    const frame = frames[index];
    if (!frame) return '';
    
    const date = new Date(frame.time * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [frames]);

  const previous = useCallback(() => {
    if (currentFrameIndex > 0) {
      seekToFrame(currentFrameIndex - 1);
    }
  }, [currentFrameIndex, seekToFrame]);

  const next = useCallback(() => {
    if (currentFrameIndex < frames.length - 1) {
      seekToFrame(currentFrameIndex + 1);
    }
  }, [currentFrameIndex, frames.length, seekToFrame]);

  return {
    currentFrameIndex,
    isPlaying,
    play,
    pause,
    previous,
    next,
    seekToFrame,
    setFrameIndexSilent,
    getCurrentFrame,
    getFrameLabel,
  };
}
