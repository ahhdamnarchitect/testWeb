(function () {
  'use strict';

  function init() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    var video = document.getElementById('heroVideo');
    var heroSection = document.getElementById('hero');
    var hud = document.getElementById('hud');
    var soundToggle = document.getElementById('soundToggle');
    var spacebarHint = document.getElementById('spacebarHint');

    if (!video || !heroSection) return;

    // --- Video: scrub by scroll (pin hero so scroll “drives” the video) ---
    var videoSections = [{ section: heroSection, video: video }];
    var v2 = document.getElementById('video2');
    var v3 = document.getElementById('video3');
    if (v2 && document.getElementById('videoEl2')) videoSections.push({ section: v2, video: document.getElementById('videoEl2') });
    if (v3 && document.getElementById('videoEl3')) videoSections.push({ section: v3, video: document.getElementById('videoEl3') });

    videoSections.forEach(function (item) {
      if (!item.section || !item.video) return;
      item.video.muted = true;
      item.video.play().catch(function () {});
      ScrollTrigger.create({
        trigger: item.section,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        pin: true,
        pinSpacing: true,
        onUpdate: function (self) {
          if (item.video.duration && isFinite(item.video.duration)) {
            item.video.currentTime = self.progress * item.video.duration;
          }
        }
      });
    });

  // --- Spacebar: scrub main hero video while held ---
  var spaceInterval = null;
  function startSpacebarScrub() {
    if (spaceInterval) return;
    spaceInterval = setInterval(function () {
      if (video.duration && isFinite(video.duration)) {
        video.currentTime = Math.min(video.duration, video.currentTime + 0.08);
      }
    }, 16);
  }
  function stopSpacebarScrub() {
    clearInterval(spaceInterval);
    spaceInterval = null;
  }
  document.addEventListener('keydown', function (e) {
    if (e.code !== 'Space' || e.repeat) return;
    e.preventDefault();
    startSpacebarScrub();
  });
  document.addEventListener('keyup', function (e) {
    if (e.code === 'Space') {
      e.preventDefault();
      stopSpacebarScrub();
    }
  });

  // --- Sound toggle (controls hero video; other videos stay muted) ---
  var muted = true;
  function updateSoundLabel() {
    if (soundToggle) soundToggle.textContent = muted ? 'Sound On' : 'Sound Off';
    video.muted = muted;
  }
  if (soundToggle) {
    soundToggle.addEventListener('click', function () {
      muted = !muted;
      updateSoundLabel();
      try { localStorage.setItem('reissued-muted', muted ? '1' : '0'); } catch (err) {}
    });
  }
  try { muted = localStorage.getItem('reissued-muted') === '1'; } catch (err) {}
  updateSoundLabel();

  // --- Watch full film: scroll to hero ---
  var watchFilm = document.getElementById('watchFullFilm');
  if (watchFilm) {
    watchFilm.addEventListener('click', function (e) {
      e.preventDefault();
      heroSection.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // --- Share: Web Share API or copy URL ---
  var shareBtn = document.getElementById('shareBtn');
  if (shareBtn) {
    shareBtn.addEventListener('click', function () {
      var url = window.location.href;
      var title = document.title || 'Re-issued';
      if (navigator.share && navigator.canShare && navigator.canShare({ title: title, url: url })) {
        navigator.share({ title: title, url: url }).catch(function () { copyUrl(url); });
      } else {
        copyUrl(url);
      }
    });
  }
  function copyUrl(url) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () {
        if (shareBtn) shareBtn.textContent = 'Copied!';
        setTimeout(function () { if (shareBtn) shareBtn.textContent = 'Share'; }, 1500);
      });
    } else {
      if (shareBtn) shareBtn.textContent = 'Share';
    }
  }

  // --- Top: scroll to top ---
  var topLink = document.getElementById('topLink');
  if (topLink) {
    topLink.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // --- HUD: dark on light sections (stacks, copy, SVG text; light on hero/video) ---
  var sectionsForDarkHud = ['stack1', 'stack2', 'stack3', 'stack4', 'stack5', 'stack6', 'stack7', 'stack8', 'copy', 'svg1', 'svg2'];
  function updateHudTheme() {
    if (!hud) return;
    var sectionEls = document.querySelectorAll('[data-section]');
    var currentSection = '';
    var viewMid = window.innerHeight * 0.5;
    sectionEls.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top <= viewMid && r.bottom >= viewMid) currentSection = el.getAttribute('data-section');
    });
    if (sectionsForDarkHud.indexOf(currentSection) !== -1) hud.classList.add('hud-dark');
    else hud.classList.remove('hud-dark');
  }
  ScrollTrigger.addEventListener('refresh', updateHudTheme);
  window.addEventListener('scroll', updateHudTheme);
  updateHudTheme();

  // --- Parallax image stacks (pin section, scroll-driven motion) ---
  document.querySelectorAll('.section-stack').forEach(function (section) {
    var stack = section.querySelector('.stack');
    if (!stack) return;
    var imgs = stack.querySelectorAll('.stack-img');
    // Pin this section for the scroll range so scrolling “drives” the animation
    ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: '+=100%',
      pin: true,
      pinSpacing: true
    });
    imgs.forEach(function (img, i) {
      var fromY = 80 + i * 40;
      var fromScale = 0.85;
      gsap.fromTo(img, { opacity: 0, y: fromY, scale: fromScale }, {
        opacity: 1,
        y: 0,
        scale: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=100%',
          scrub: true
        }
      });
    });
  });

  // --- SVG text sections: pin and scroll-driven title + cards ---
  document.querySelectorAll('.section-svg-text').forEach(function (section) {
    var svgText = section.querySelector('.svg-title');
    var cards = section.querySelectorAll('.svg-card');
    ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: '+=80%',
      pin: true,
      pinSpacing: true
    });
    if (svgText) {
      gsap.fromTo(svgText, { opacity: 0.2, scale: 0.95 }, {
        opacity: 1,
        scale: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=80%',
          scrub: true
        }
      });
    }
    cards.forEach(function (card, i) {
      gsap.fromTo(card, { opacity: 0, y: 80 + i * 20, scale: 0.9 }, {
        opacity: 1,
        y: 0,
        scale: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=80%',
          scrub: true
        }
      });
    });
  });

  // --- Copy block: pin and fade in on scroll ---
  var copySection = document.getElementById('copy');
  if (copySection) {
    var copyInner = copySection.querySelector('.copy-inner');
    if (copyInner) {
      ScrollTrigger.create({
        trigger: copySection,
        start: 'top top',
        end: '+=60%',
        pin: true,
        pinSpacing: true
      });
      gsap.fromTo(copyInner, { opacity: 0, y: 60 }, {
        opacity: 1,
        y: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: copySection,
          start: 'top top',
          end: '+=60%',
          scrub: true
        }
      });
    }
  }

  // --- Hint: hide after first scroll ---
  if (spacebarHint) {
    ScrollTrigger.create({
      trigger: heroSection,
      start: 'top top',
      end: 'bottom top',
      onUpdate: function (self) {
        spacebarHint.style.opacity = self.progress > 0.1 ? '0' : '0.9';
      }
    });
  }

  // Recalculate ScrollTrigger after images (and fonts) load
  window.addEventListener('load', function () {
    ScrollTrigger.refresh();
  });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
