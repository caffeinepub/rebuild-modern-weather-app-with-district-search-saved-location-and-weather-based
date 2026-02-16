import { useState, useEffect, useCallback } from 'react';
import type { RadarFrame } from '../lib/rainviewer';

export function useRadarPlayback(frames: RadarFrame[], initialFrameIndex?: number) {
  const [currentFrameIndex, setCurrentFrameIndex] = useState(initialFrameIndex ?? 0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Auto-play animation
  useEffect(() => {
    if (!isPlaying || frames.length === 0) return;

    const interval = setInterval(() => {
      setCurrentFrameIndex((prev) => {
        if (prev >= frames.length - 1) {
          return 0; // Loop back to start
        }
        return prev + 1;
      });
    }, 500); // 500ms per frame

    return () => clearInterval(interval);
  }, [isPlaying, frames.length]);

  // Reset when frames change
  useEffect(() => {
    if (frames.length > 0) {
      // Use provided initial index or default to 0
      const targetIndex = initialFrameIndex !== undefined ? initialFrameIndex : 0;
      setCurrentFrameIndex(Math.min(targetIndex, frames.length - 1));
    }
  }, [frames, initialFrameIndex]);

  const play = useCallback(() => setIsPlaying(true), []);
  const pause = useCallback(() => setIsPlaying(false), []);
  const setFrameIndex = useCallback((index: number) => {
    setCurrentFrameIndex(index);
    setIsPlaying(false);
  }, []);

  const getCurrentFrame = useCallback(() => {
    return frames[currentFrameIndex] || null;
  }, [frames, currentFrameIndex]);

  const getFrameLabel = useCallback((index: number) => {
    const frame = frames[index];
    if (!frame) return '';
    
    const date = new Date(frame.time * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [frames]);

  const isPastFrame = useCallback((index: number) => {
    const frame = frames[index];
    if (!frame) return true;
    return frame.time <= Date.now() / 1000;
  }, [frames]);

  return {
    currentFrameIndex,
    isPlaying,
    play,
    pause,
    setFrameIndex,
    getCurrentFrame,
    getFrameLabel,
    isPastFrame,
  };
}
