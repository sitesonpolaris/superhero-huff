"use client";

import { useEffect } from "react";

/** Scroll reveals for [data-reveal] elements, including ones that stream in later. */
export function SiteMotion() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = new WeakSet<Element>();
    const io =
      !reduce && "IntersectionObserver" in window
        ? new IntersectionObserver(
            (entries) => {
              for (const e of entries) {
                if (e.isIntersecting) {
                  e.target.classList.add("is-in");
                  io?.unobserve(e.target);
                }
              }
            },
            { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
          )
        : null;
    const scan = () => {
      document.querySelectorAll("[data-reveal]:not(.is-in)").forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        if (io) io.observe(el);
        else el.classList.add("is-in");
      });
    };
    scan();
    let raf = 0;
    const mo = new MutationObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(scan);
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io?.disconnect();
      mo.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);
  return null;
}
