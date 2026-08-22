import { useCallback, useEffect, useRef } from 'react';
import { trackVideoWatchMinute } from '@/services/userEventApi';

export function useVideoWatchTracking(title: string, isActive: boolean) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastSentMinuteRef = useRef(0);

  useEffect(() => {
    lastSentMinuteRef.current = 0;
  }, [title, isActive]);

  const syncWatchProgress = useCallback(() => {
    const video = videoRef.current;
    if (!video || !title.trim()) return;

    const watchedMinutes = Math.floor(video.currentTime / 60);
    if (watchedMinutes <= lastSentMinuteRef.current) return;

    for (let minute = lastSentMinuteRef.current + 1; minute <= watchedMinutes; minute += 1) {
      trackVideoWatchMinute(title, minute);
    }
    lastSentMinuteRef.current = watchedMinutes;
  }, [title]);

  const flushWatchProgress = useCallback(() => {
    syncWatchProgress();
  }, [syncWatchProgress]);

  useEffect(() => {
    if (!isActive) return;

    const onHide = () => flushWatchProgress();
    window.addEventListener('pagehide', onHide);
    document.addEventListener('visibilitychange', onHide);

    return () => {
      window.removeEventListener('pagehide', onHide);
      document.removeEventListener('visibilitychange', onHide);
      flushWatchProgress();
    };
  }, [isActive, flushWatchProgress]);

  return {
    videoRef,
    onTimeUpdate: syncWatchProgress,
    onEnded: flushWatchProgress,
    onClose: flushWatchProgress,
  };
}
