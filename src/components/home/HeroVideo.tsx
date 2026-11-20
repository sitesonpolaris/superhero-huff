"use client";

import { useEffect, useRef, useState } from "react";

const VIDEO_HTML = `<video autoplay muted loop playsinline preload="metadata" poster="/video/hero-poster.webp" aria-hidden="true" tabindex="-1" class="absolute inset-0 h-full w-full object-cover object-center">
  <source src="/video/hero-mobile.mp4" type="video/mp4" media="(max-width: 860px)">
  <source src="/video/hero-desktop.mp4" type="video/mp4">
</video>`;

/**
 * Muted looping hero. Markup is raw HTML so `muted` is present on first paint (iOS autoplay).
 * Pause button satisfies WCAG 2.2.2; starts paused under reduced motion; pauses off-screen.
 */
export function HeroVideo() {
  const wrap = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(true);
  const userPaused = useRef(false);

  useEffect(() => {
    const v = wrap.current?.querySelector("video");
    if (!v) return;
    v.muted = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      userPaused.current = true;
      v.removeAttribute("autoplay");
      v.pause();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPlaying(false);
    }
    const io = new IntersectionObserver(([e]) => {
      if (userPaused.current) return;
      if (e.isIntersecting) v.play().catch(() => setPlaying(false));
      else v.pause();
    });
    io.observe(v);
    const onPlay = () => setPlaying(true);
    // Off-screen pauses keep the "playing" state; only a user pause flips the button.
    const onPause = () => userPaused.current && setPlaying(false);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    return () => {
      io.disconnect();
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
    };
  }, []);

  function toggle() {
    const v = wrap.current?.querySelector("video");
    if (!v) return;
    if (v.paused) {
      userPaused.current = false;
      v.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      userPaused.current = true;
      v.pause();
      setPlaying(false);
    }
  }

  return (
    <>
      <div ref={wrap} className="absolute inset-0" dangerouslySetInnerHTML={{ __html: VIDEO_HTML }} />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause background video" : "Play background video"}
        className="absolute bottom-5 right-4 z-20 grid size-11 place-items-center border-2 border-white/80 bg-ink/60 text-white backdrop-blur-sm hover:bg-yellow hover:text-ink sm:bottom-8 sm:right-8"
      >
        {playing ? (
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
            <rect x="2" y="1" width="3.5" height="12" fill="currentColor" />
            <rect x="8.5" y="1" width="3.5" height="12" fill="currentColor" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
            <path d="M3 1l10 6-10 6z" fill="currentColor" />
          </svg>
        )}
      </button>
    </>
  );
}
