(() => {
  'use strict';

  const reader = document.getElementById('reader-toggle');
  const body = document.body;
  const applyTheme = (night) => {
    body.dataset.readerTheme = night ? 'night' : 'day';
    reader.setAttribute('aria-pressed', String(night));
    reader.setAttribute('aria-label', night ? 'Switch to light mode' : 'Switch to dark mode');
    reader.querySelector('path').setAttribute('d', night
      ? 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5'
      : 'M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z');
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) themeColor.content = night ? '#25282b' : '#f3f5f7';
  };
  if (reader) {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
    applyTheme(systemTheme.matches);
    systemTheme.addEventListener('change', (event) => applyTheme(event.matches));
    reader.hidden = false;
    reader.addEventListener('click', () => {
      const nextNight = body.dataset.readerTheme !== 'night';
      applyTheme(nextNight);
    });
  }

  const imagination = document.getElementById('imagination-dialog');
  const openImagination = document.getElementById('imagination-open');
  const lyricsScroll = document.getElementById('lyrics-scroll');
  const lyricsPlay = document.getElementById('lyrics-play');
  const lyricsReplay = document.getElementById('lyrics-replay');
  const lyricsStatus = document.getElementById('lyrics-status');
  if (imagination && openImagination && typeof imagination.showModal === 'function') {
    let scrolling = false;
    let animation = 0;
    let lastFrame = 0;
    let scrollPosition = 0;
    const setScrolling = (active, message) => {
      scrolling = active;
      lyricsPlay.setAttribute('aria-pressed', String(active));
      lyricsPlay.setAttribute('aria-label', active ? 'Pause scrolling lyrics' : 'Play scrolling lyrics');
      lyricsPlay.querySelector('span').textContent = active ? 'Pause' : 'Play';
      lyricsPlay.querySelector('path').setAttribute('d', active ? 'M4 3h4v14H4ZM12 3h4v14h-4Z' : 'M5 3 17 10 5 17Z');
      lyricsStatus.textContent = message || (active ? 'Scrolling' : 'Paused');
      if (!active) cancelAnimationFrame(animation);
    };
    const step = (now) => {
      if (!scrolling || !imagination.open) return;
      if (lastFrame) {
        scrollPosition += Math.min(now - lastFrame, 100) * 0.012;
        lyricsScroll.scrollTop = scrollPosition;
      }
      lastFrame = now;
      const end = lyricsScroll.scrollHeight - lyricsScroll.clientHeight;
      if (lyricsScroll.scrollTop >= end - 1) {
        setScrolling(false, 'Finished');
        return;
      }
      animation = requestAnimationFrame(step);
    };
    const play = (restart) => {
      cancelAnimationFrame(animation);
      if (restart || lyricsScroll.scrollTop >= lyricsScroll.scrollHeight - lyricsScroll.clientHeight - 1) lyricsScroll.scrollTop = 0;
      scrollPosition = lyricsScroll.scrollTop;
      lastFrame = 0;
      setScrolling(true);
      animation = requestAnimationFrame(step);
    };
    openImagination.hidden = false;
    lyricsPlay.parentElement.hidden = false;
    openImagination.addEventListener('click', () => {
      imagination.showModal();
      lyricsScroll.scrollTop = 0;
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) play(true);
      else setScrolling(false, 'Ready');
    });
    lyricsPlay.addEventListener('click', () => scrolling ? setScrolling(false) : play(false));
    lyricsReplay.addEventListener('click', () => play(true));
    imagination.addEventListener('close', () => setScrolling(false, 'Ready'));
    lyricsScroll.addEventListener('wheel', () => setScrolling(false), { passive: true });
    lyricsScroll.addEventListener('touchstart', () => setScrolling(false), { passive: true });
    lyricsScroll.addEventListener('keydown', (event) => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) setScrolling(false);
    });
    document.addEventListener('visibilitychange', () => { if (document.hidden) setScrolling(false); });
    imagination.addEventListener('click', (event) => {
      if (event.target !== imagination) return;
      const bounds = imagination.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
        imagination.close();
      }
    });
  }

  const visitors = document.querySelector('.personal-visitors');
  if (visitors) {
    const styleCounter = () => {
      const label = visitors.querySelector('.mapmyvisitors-visitors');
      if (!label) return;
      const count = label.textContent.match(/^\s*([\d,\s]+)\s+Total Pageviews\s*$/i);
      if (count) label.textContent = count[1].trim() + ' pageviews · all time';
    };
    new MutationObserver(styleCounter).observe(visitors, { childList: true, characterData: true, subtree: true });
    styleCounter();
  }

  const hello = document.getElementById('cat-hello');
  const trail = document.getElementById('cat-paw-trail');
  const response = document.getElementById('cat-response');
  if (hello && trail && response) {
    hello.parentElement.hidden = false;
    const replies = ['Hello, human.', 'Purr.', 'Thanks for stopping by.'];
    let visits = 0;
    hello.addEventListener('click', () => {
      const paw = document.createElement('span');
      paw.className = 'cat-paw';
      paw.style.setProperty('--paw-angle', visits % 2 ? '14deg' : '-14deg');
      paw.appendChild(hello.querySelector('svg').cloneNode(true));
      trail.appendChild(paw);
      if (trail.children.length > 5) trail.firstElementChild.remove();
      response.textContent = replies[visits % replies.length];
      visits += 1;
    });
  }
})();
