/**
 * RE-ISSUED — Spec-based application script
 * Uses GSAP 3 (replaces TweenMax 1.x from spec)
 */
(function () {
  'use strict';

  var scrollY = 0;
  var spacebarHeld = false;
  var spacebarProgress = 0;
  var spacebarInterval = null;
  var spacebarDownInterval = null;
  var soundOn = true;
  var introVideoScrubComplete = false;

  var introVideo     = document.getElementById('intro-video');
  var progressEl     = document.getElementById('progress');
  var ctaWrapper     = document.getElementById('cta-wrapper');
  var progressWrapper= document.getElementById('progress-wrapper');
  var menuTop        = document.getElementById('menu-top');
  var menuBottom     = document.getElementById('menu-bottom');
  var smokeScreen    = document.getElementById('smoke-screen');
  var videoOverlay   = document.getElementById('video-overlay');
  var closeVideo     = document.getElementById('close-video');
  var watchFilm      = document.getElementById('watch-film');
  var toggleSound    = document.getElementById('toggle-sound');
  var soundState     = document.getElementById('sound-state');
  var shopLink       = document.getElementById('shop-link');
  var topBtn         = document.getElementById('top-btn');
  var noCapsWrap     = document.getElementById('no-caps-wrap');
  var noTrainersWrap = document.getElementById('no-trainers-wrap');
  var shopNowSection = document.getElementById('shop-now');
  var embedContainer = document.getElementById('embed-container');
  var enterSection   = document.getElementById('enter-the-archives');
  var scrollIndicator= document.querySelector('.menu-bottom .scroll');
  var soundIcon      = document.getElementById('sound-icon');

  var SCRUB_INTERVAL_MS = 50;
  var SCRUB_SPEED       = 0.015;
  var SCRUB_DOWN_SPEED  = 0.025;
  var FILM_EMBED_URL    = '';

  function init() {
    if (!introVideo || !progressEl || !progressWrapper) return;

    /* Body overflow is NOT locked — scroll animations work independently from the start */
    document.body.style.overflow = '';

    if (videoOverlay) gsap.set(videoOverlay, { y: '100%' });
    setupIntroVideo();
    setupSpacebar();
    setupScrollHandler();
    setupSoundToggle();
    setupVideoOverlay();
    setupShareLinks();
    setupNavigationLinks();
    animateMenuIn();
  }

  /* ---- INTRO VIDEO ---- */
  function setupIntroVideo() {
    introVideo.pause();
    introVideo.currentTime = 0;
    introVideo.muted = true;
    introVideo.load();
    /* Autoplay as background (muted, so browser allows it) */
    introVideo.play().catch(function () {});
  }

  /* ---- SPACEBAR SCRUB ---- */
  function setupSpacebar() {
    document.addEventListener('keydown', function (e) {
      if (e.keyCode === 32) {
        /* Always prevent page scroll from spacebar */
        e.preventDefault();
        if (!spacebarHeld && !e.repeat) {
          spacebarHeld = true;
          stopSpacebarDown();
          startSpacebarScrub();
        }
      }
    });

    document.addEventListener('keyup', function (e) {
      if (e.keyCode === 32) {
        e.preventDefault();
        spacebarHeld = false;
        stopSpacebarScrub();
        /* Start draining the meter back down when key released */
        if (!introVideoScrubComplete) {
          startSpacebarDown();
        }
      }
    });

    if (ctaWrapper) {
      ctaWrapper.addEventListener('touchstart', function (e) {
        e.preventDefault();
        spacebarHeld = true;
        stopSpacebarDown();
        startSpacebarScrub();
      });
      ctaWrapper.addEventListener('touchend', function () {
        spacebarHeld = false;
        stopSpacebarScrub();
        if (!introVideoScrubComplete) {
          startSpacebarDown();
        }
      });
    }
  }

  function startSpacebarScrub() {
    if (introVideoScrubComplete) return;
    spacebarInterval = setInterval(function () {
      if (introVideo.readyState < 1 || !introVideo.duration || !isFinite(introVideo.duration)) return;
      spacebarProgress = Math.min(spacebarProgress + SCRUB_SPEED, 1);
      introVideo.currentTime = spacebarProgress * introVideo.duration;
      progressEl.style.width = (spacebarProgress * 100) + '%';
      if (spacebarProgress >= 1) {
        introVideoScrubComplete = true;
        stopSpacebarScrub();
        stopSpacebarDown();
        onIntroComplete();
      }
    }, SCRUB_INTERVAL_MS);
  }

  function stopSpacebarScrub() {
    if (spacebarInterval) {
      clearInterval(spacebarInterval);
      spacebarInterval = null;
    }
  }

  /* Drain meter back to 0 when spacebar released */
  function startSpacebarDown() {
    if (spacebarDownInterval) return;
    spacebarDownInterval = setInterval(function () {
      if (spacebarHeld) { stopSpacebarDown(); return; }
      spacebarProgress = Math.max(spacebarProgress - SCRUB_DOWN_SPEED, 0);
      introVideo.currentTime = spacebarProgress * (introVideo.duration || 0);
      progressEl.style.width = (spacebarProgress * 100) + '%';
      if (spacebarProgress <= 0) {
        stopSpacebarDown();
      }
    }, SCRUB_INTERVAL_MS);
  }

  function stopSpacebarDown() {
    if (spacebarDownInterval) {
      clearInterval(spacebarDownInterval);
      spacebarDownInterval = null;
    }
  }

  function onIntroComplete() {
    gsap.to(progressWrapper, {
      duration: 0.5, opacity: 0,
      onComplete: function () { progressWrapper.style.display = 'none'; }
    });
  }

  /* ---- MENU ---- */
  function animateMenuIn() {
    if (menuTop) gsap.to(menuTop, { duration: 1, opacity: 1, y: 0, delay: 0.5, ease: 'power2.out' });
    if (menuBottom) gsap.to(menuBottom, { duration: 1, opacity: 1, y: 0, delay: 0.5, ease: 'power2.out' });
  }

  /* ---- SCROLL HANDLER ---- */
  function setupScrollHandler() {
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function onScroll() {
    scrollY = window.pageYOffset || document.documentElement.scrollTop;
    var winH = window.innerHeight;
    var docH = document.documentElement.scrollHeight;

    if (enterSection) handleEnterArchivesSection(scrollY, winH);
    handleStrikeAnimations(scrollY, winH);
    handleShopNowSection(scrollY, winH, docH);
    updateBodyBackground(scrollY, winH);
  }

  /* ---- ENTER THE ARCHIVES ---- */
  function handleEnterArchivesSection(scrollY, winH) {
    var rect = enterSection.getBoundingClientRect();
    var sectionTop = rect.top + scrollY;
    var progress = (scrollY - sectionTop + winH) / (winH * 2);
    if (progress < 0 || progress > 1.5) return;
    var typeBands = enterSection.querySelectorAll('.type-band .type');
    if (typeBands.length < 3) return;
    gsap.set(typeBands[0], { x: (-30 + progress * 60) + '%' });
    gsap.set(typeBands[1], { x: ( 30 - progress * 60) + '%' });
    gsap.set(typeBands[2], { x: (-20 + progress * 40) + '%' });
  }

  /* ---- STRIKE ANIMATIONS ---- */
  function handleStrikeAnimations(scrollY, winH) {
    var noCapsStrike    = document.querySelector('#no-caps-wrap .strike');
    var noTrainersStrike= document.querySelector('#no-trainers-wrap .strike');

    if (noCapsWrap && noCapsStrike) {
      var s = noCapsWrap.offsetTop;
      var e = noCapsWrap.offsetTop + winH * 1.8;
      var p = Math.min(1, Math.max(0, (scrollY - s) / (e - s)));
      gsap.set(noCapsStrike, { width: (p * 120) + '%' });
    }
    if (noTrainersWrap && noTrainersStrike) {
      var s2 = noTrainersWrap.offsetTop;
      var e2 = noTrainersWrap.offsetTop + winH * 1.8;
      var p2 = Math.min(1, Math.max(0, (scrollY - s2) / (e2 - s2)));
      gsap.set(noTrainersStrike, { width: (p2 * 120) + '%' });
    }
  }

  /* ---- SHOP NOW ---- */
  function handleShopNowSection(scrollY, winH, docH) {
    if (!shopNowSection || !menuBottom) return;
    var shopNowTop = shopNowSection.getBoundingClientRect().top + scrollY;

    if (scrollY + winH >= shopNowTop + winH * 0.5) {
      menuBottom.classList.add('bottom');
    } else {
      menuBottom.classList.remove('bottom');
    }

    var types = shopNowSection.querySelectorAll('.type-band .type');
    if (types.length < 2) return;
    var sectionStart = shopNowTop - winH;
    var sectionEnd   = shopNowTop + winH;
    var rawProgress  = (scrollY - sectionStart) / (sectionEnd - sectionStart);
    var progress     = Math.max(0, Math.min(1, rawProgress));
    var maxTranslate = winH * 2.66;
    gsap.set(types[0], { x: -progress * maxTranslate });
    gsap.set(types[1], { x:  progress * maxTranslate });
  }

  /* ---- BACKGROUND COLOUR ---- */
  function updateBodyBackground(scrollY, winH) {
    if (!noCapsWrap || !noTrainersWrap || !shopNowSection) return;
    var noCapsTop     = noCapsWrap.offsetTop;
    var noCapsBottom  = noCapsTop + noCapsWrap.offsetHeight;
    var trainersTop   = noTrainersWrap.offsetTop;
    var trainersBottom= trainersTop + noTrainersWrap.offsetHeight;
    var shopTop       = shopNowSection.offsetTop;

    if (scrollY < noCapsTop) {
      document.body.style.background = 'rgb(10, 10, 10)';
    } else if (scrollY >= noCapsTop && scrollY < noCapsBottom) {
      document.body.style.background = 'rgb(128, 128, 128)';
    } else if (scrollY >= trainersTop && scrollY < trainersBottom) {
      document.body.style.background = 'rgb(39, 39, 39)';
    } else if (scrollY >= shopTop) {
      document.body.style.background = 'rgb(10, 10, 10)';
    }
  }

  /* ---- SOUND TOGGLE ---- */
  function setupSoundToggle() {
    if (!toggleSound || !soundState || !introVideo) return;
    function updateSound() {
      soundState.textContent = soundOn ? 'On' : 'Off';
      introVideo.muted = !soundOn;
      if (soundIcon) soundIcon.style.opacity = soundOn ? '1' : '0.4';
      var bars = soundIcon ? soundIcon.querySelectorAll('.bar') : [];
      if (bars.length) {
        gsap.to(bars, {
          duration: 0.3, scaleY: soundOn ? 1 : 0.1,
          stagger: soundOn ? 0.1 : 0.05, ease: 'power2.out'
        });
      }
    }
    toggleSound.addEventListener('click', function () {
      soundOn = !soundOn;
      updateSound();
      try { localStorage.setItem('reissued-sound', soundOn ? '1' : '0'); } catch (e) {}
    });
    try { soundOn = localStorage.getItem('reissued-sound') !== '0'; } catch (e) {}
    updateSound();
  }

  /* ---- VIDEO OVERLAY ---- */
  function setupVideoOverlay() {
    if (!watchFilm || !videoOverlay || !closeVideo || !embedContainer) return;
    watchFilm.addEventListener('click', openVideoOverlay);
    closeVideo.addEventListener('click', closeVideoOverlay);
    function openVideoOverlay() {
      if (FILM_EMBED_URL) {
        embedContainer.innerHTML = '<iframe src="' + FILM_EMBED_URL + '" allow="autoplay; fullscreen" allowfullscreen></iframe>';
      } else {
        var src = introVideo.querySelector ? introVideo.querySelector('source') : null;
        embedContainer.innerHTML = '<video src="' + (src ? src.src : introVideo.currentSrc) + '" controls autoplay style="width:100%;height:100%;object-fit:contain;"></video>';
      }
      gsap.to(videoOverlay, { duration: 0.6, y: '0%', ease: 'power3.out' });
      videoOverlay.classList.add('open');
      introVideo.pause();
    }
    function closeVideoOverlay() {
      gsap.to(videoOverlay, {
        duration: 0.5, y: '100%', ease: 'power3.in',
        onComplete: function () {
          embedContainer.innerHTML = '';
          videoOverlay.classList.remove('open');
          if (introVideo) introVideo.play().catch(function () {});
        }
      });
    }
  }

  /* ---- SHARE LINKS ---- */
  function setupShareLinks() {
    var shareUrl  = encodeURIComponent(window.location.href);
    var shareText = encodeURIComponent('Check this out');
    var twitter   = document.getElementById('twitter-share');
    var facebook  = document.getElementById('facebook-share');
    if (twitter)  { twitter.href  = 'https://twitter.com/intent/tweet?url=' + shareUrl + '&text=' + shareText; twitter.target  = '_blank'; }
    if (facebook) { facebook.href = 'https://www.facebook.com/sharer/sharer.php?u=' + shareUrl; facebook.target = '_blank'; }
  }

  /* ---- NAVIGATION ---- */
  function setupNavigationLinks() {
    if (topBtn) {
      topBtn.addEventListener('click', function (e) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
    if (scrollIndicator) {
      scrollIndicator.addEventListener('click', function () {
        window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
      });
    }
  }

  /* ---- SMOKE TRANSITION ---- */
  function smokeTransition(callback) {
    if (!smokeScreen) return;
    gsap.to(smokeScreen, {
      duration: 0.3, opacity: 1, pointerEvents: 'all',
      onComplete: function () {
        if (callback) callback();
        gsap.to(smokeScreen, {
          duration: 0.4, opacity: 0, delay: 0.1,
          onComplete: function () { smokeScreen.style.pointerEvents = 'none'; }
        });
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
