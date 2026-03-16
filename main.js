(function () {
  'use strict';

  gsap.registerPlugin(ScrollTrigger);

  const video = document.getElementById('heroVideo');
  const heroSection = document.getElementById('hero');
  const hud = document.getElementById('hud');
  const soundToggle = document.getElementById('soundToggle');
  const spacebarHint = document.getElementById('spacebarHint');

  if (!video || !heroSection) return;

  // --- Video: scrub by scroll ---
  video.muted = true;
  video.play().catch(function () {});

  ScrollTrigger.create({
    trigger: heroSection,
    start: 'top top',
    end: 'bottom top',
    scrub: true,
    onUpdate: function (self) {
      if (video.duration && isFinite(video.duration)) {
        video.currentTime = self.progress * video.duration;
      }
    }
  });

  // --- Spacebar: scrub video while held ---
  let spaceInterval = null;
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

  // --- Sound toggle ---
  var muted = true;
  function updateSoundLabel() {
    soundToggle.textContent = muted ? 'Sound On' : 'Sound Off';
    video.muted = muted;
  }
  soundToggle.addEventListener('click', function () {
    muted = !muted;
    updateSoundLabel();
    try {
      localStorage.setItem('reissued-muted', muted ? '1' : '0');
    } catch (err) {}
  });
  try {
    muted = localStorage.getItem('reissued-muted') === '1';
  } catch (err) {}
  updateSoundLabel();

  // --- HUD: dark on light sections (stacks, copy, SVG text) ---
  var sectionsForDarkHud = ['stack1', 'stack2', 'stack3', 'stack4', 'copy', 'svg1', 'svg2'];
  function updateHudTheme() {
    var sectionEls = document.querySelectorAll('[data-section]');
    var currentSection = '';
    var viewMid = window.innerHeight * 0.5;
    sectionEls.forEach(function (el) {
      var r = el.getBoundingClientRect();
      var mid = r.top + r.height / 2;
      if (r.top <= viewMid && r.bottom >= viewMid) currentSection = el.getAttribute('data-section');
    });
    if (sectionsForDarkHud.indexOf(currentSection) !== -1) {
      hud.classList.add('hud-dark');
    } else {
      hud.classList.remove('hud-dark');
    }
  }
  ScrollTrigger.addEventListener('refresh', updateHudTheme);
  window.addEventListener('scroll', updateHudTheme);
  updateHudTheme();

  // --- Parallax image stacks ---
  document.querySelectorAll('.stack').forEach(function (stack, idx) {
    var imgs = stack.querySelectorAll('.stack-img');
    var start = (idx + 1) * 0.08;
    var end = start + 0.5;
    imgs.forEach(function (img, i) {
      gsap.fromTo(img, { opacity: 0, y: 60 + i * 20 }, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: stack,
          start: 'top 80%',
          end: 'top 20%',
          scrub: true
        }
      });
    });
  });

  // --- SVG text sections: title + cards ---
  document.querySelectorAll('.section-svg-text').forEach(function (section) {
    var svgText = section.querySelector('.svg-title');
    var cards = section.querySelectorAll('.svg-card');
    if (svgText) {
      gsap.fromTo(svgText, { opacity: 0.3 }, {
        opacity: 1,
        scrollTrigger: {
          trigger: section,
          start: 'top 70%',
          end: 'center center',
          scrub: true
        }
      });
    }
    cards.forEach(function (card, i) {
      gsap.fromTo(card, { opacity: 0, y: 50 }, {
        opacity: 1,
        y: 0,
        delay: i * 0.1,
        scrollTrigger: {
          trigger: section,
          start: 'top 60%',
          end: 'center 30%',
          scrub: true
        }
      });
    });
  });

  // --- Copy block: fade in ---
  var copySection = document.getElementById('copy');
  if (copySection) {
    gsap.fromTo(copySection.querySelector('.copy-inner'), { opacity: 0, y: 30 }, {
      opacity: 1,
      y: 0,
      scrollTrigger: {
        trigger: copySection,
        start: 'top 75%',
        end: 'top 35%',
        scrub: true
      }
    });
  }

  // --- Hint: hide after first scroll ---
  ScrollTrigger.create({
    trigger: heroSection,
    start: 'top top',
    end: 'bottom top',
    onUpdate: function (self) {
      if (self.progress > 0.1 && spacebarHint) spacebarHint.style.opacity = '0';
    }
  });
})();
