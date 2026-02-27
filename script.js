/* ================================================================
   HOWE II COACH — Homepage Interactions
   ================================================================ */

(function () {
  'use strict';

  // ---- Scroll Reveal (IntersectionObserver) ----
  const revealElements = document.querySelectorAll('.reveal');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add('visible'));
  }

  // ---- Header Scroll State ----
  const header = document.getElementById('header');
  let lastScrollY = 0;
  let ticking = false;

  function updateHeader() {
    const scrollY = window.scrollY;
    if (scrollY > 80) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    lastScrollY = scrollY;
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(updateHeader);
      ticking = true;
    }
  });

  // ---- Hero Parallax ----
  if (!prefersReducedMotion) {
    const heroBgImg = document.querySelector('.hero__bg-img');
    if (heroBgImg) {
      let parallaxTicking = false;
      window.addEventListener('scroll', function () {
        if (!parallaxTicking) {
          window.requestAnimationFrame(function () {
            const scrollY = window.scrollY;
            if (scrollY < window.innerHeight * 1.5) {
              heroBgImg.style.transform = 'translateY(' + scrollY * 0.35 + 'px) scale(1.1)';
            }
            parallaxTicking = false;
          });
          parallaxTicking = true;
        }
      });
    }
  }

  // ---- Animated Stat Counters ----
  const statNumbers = document.querySelectorAll('.stat__number');
  let countersAnimated = false;

  function animateCounters() {
    if (countersAnimated) return;
    countersAnimated = true;

    statNumbers.forEach(function (el) {
      const target = parseInt(el.getAttribute('data-target'), 10);
      const duration = 2000;
      const startTime = performance.now();

      function easeOutExpo(t) {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      }

      function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutExpo(progress);
        const current = Math.floor(easedProgress * target);

        el.textContent = current.toLocaleString();

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          el.textContent = target.toLocaleString();
        }
      }

      requestAnimationFrame(updateCounter);
    });
  }

  if (statNumbers.length > 0) {
    const statsObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounters();
            statsObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    statsObserver.observe(document.querySelector('.guide__stats'));
  }

  // ---- Testimonial Carousel ----
  const track = document.getElementById('carouselTrack');
  const dots = document.querySelectorAll('.dot');
  let currentSlide = 0;
  let autoplayInterval;

  function goToSlide(index) {
    currentSlide = index;
    track.style.transform = 'translateX(-' + index * 100 + '%)';
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === index);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      goToSlide(parseInt(this.getAttribute('data-index'), 10));
      resetAutoplay();
    });
  });

  // Touch/swipe support for carousel
  let touchStartX = 0;
  let touchEndX = 0;

  if (track) {
    track.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    track.addEventListener('touchend', function (e) {
      touchEndX = e.changedTouches[0].screenX;
      var diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0 && currentSlide < dots.length - 1) {
          goToSlide(currentSlide + 1);
        } else if (diff < 0 && currentSlide > 0) {
          goToSlide(currentSlide - 1);
        }
        resetAutoplay();
      }
    }, { passive: true });
  }

  function startAutoplay() {
    autoplayInterval = setInterval(function () {
      var nextSlide = (currentSlide + 1) % dots.length;
      goToSlide(nextSlide);
    }, 5000);
  }

  function resetAutoplay() {
    clearInterval(autoplayInterval);
    startAutoplay();
  }

  startAutoplay();

  // ---- Mobile Navigation ----
  const burger = document.getElementById('burger');
  const mobileNav = document.getElementById('mobileNav');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav__link, .mobile-nav__cta');

  burger.addEventListener('click', function () {
    var isOpen = mobileNav.classList.toggle('open');
    burger.classList.toggle('active');
    burger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  mobileNavLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      mobileNav.classList.remove('open');
      burger.classList.remove('active');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // ---- Smooth scroll for all anchor links ----
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;
      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      }
    });
  });

  // ---- Text-window rolling football easter egg ----
  var textWindow = document.querySelector('.text-window');
  if (textWindow && !prefersReducedMotion) {
    var footballImg = new Image();
    footballImg.src = 'images/football.svg';

    function runBallAnimation() {
      var rect = textWindow.getBoundingClientRect();
      var dpr = window.devicePixelRatio || 1;
      var w = rect.width;
      var h = rect.height;

      var canvas = document.createElement('canvas');
      canvas.setAttribute('aria-hidden', 'true');
      canvas.width = Math.ceil(w * dpr);
      canvas.height = Math.ceil(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      textWindow.appendChild(canvas);

      var ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);

      // Match font from computed styles
      var cs = window.getComputedStyle(textWindow);
      var fontSize = parseFloat(cs.fontSize);
      var ballSize = fontSize * 1.35;
      var fontStr = cs.fontWeight + ' ' + fontSize + 'px ' + cs.fontFamily;
      var text = 'YOUR CHILD.';

      // Measure text for vertical centering
      ctx.font = fontStr;
      var metrics = ctx.measureText(text);
      var ascent = metrics.actualBoundingBoxAscent || fontSize * 0.72;
      var textY = (h + ascent) / 2;

      // Hide the HTML text so canvas text replaces it seamlessly
      textWindow.style.color = 'transparent';
      textWindow.style.webkitTextFillColor = 'transparent';

      // Animation parameters
      var duration = 2800;
      var startTime = null;
      var startX = -ballSize * 1.2;
      var endX = w + ballSize * 1.2;
      var totalDist = endX - startX;

      // Calculate rotations so ball rolls naturally (distance = circumference × rotations)
      var circumference = Math.PI * ballSize;
      var totalRotations = totalDist / circumference;

      function easeInOut(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      }

      function draw(timestamp) {
        if (!startTime) startTime = timestamp;
        var elapsed = timestamp - startTime;
        var t = Math.min(elapsed / duration, 1);
        var p = easeInOut(t);

        ctx.save();
        ctx.clearRect(0, 0, w, h);

        // Apply letter-spacing if the browser supports it
        if ('letterSpacing' in ctx) {
          ctx.letterSpacing = cs.letterSpacing || '0px';
        }

        // 1. Draw white text (base layer — acts as both visible text AND mask)
        ctx.font = fontStr;
        ctx.fillStyle = '#ffffff';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(text, 0, textY);

        // 2. Draw ball using source-atop: ball is ONLY visible where text pixels exist
        ctx.globalCompositeOperation = 'source-atop';

        var ballX = startX + totalDist * p;
        var ballCenterY = h / 2;
        var rotation = p * totalRotations * Math.PI * 2;

        ctx.translate(ballX, ballCenterY);
        ctx.rotate(rotation);
        ctx.drawImage(footballImg, -ballSize / 2, -ballSize / 2, ballSize, ballSize);

        ctx.restore();

        if (t < 1) {
          requestAnimationFrame(draw);
        } else {
          // Restore HTML text and clean up
          textWindow.style.color = '';
          textWindow.style.webkitTextFillColor = '';
          canvas.remove();
        }
      }

      requestAnimationFrame(draw);
    }

    setTimeout(function () {
      if (footballImg.complete) {
        runBallAnimation();
      } else {
        footballImg.onload = runBallAnimation;
      }
    }, 10000);
  }

  // ---- Active nav link highlight on scroll ----
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.header__link');

  function highlightNav() {
    var scrollY = window.scrollY + 200;
    sections.forEach(function (section) {
      var top = section.offsetTop;
      var height = section.offsetHeight;
      var id = section.getAttribute('id');
      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach(function (link) {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        highlightNav();
      });
    }
  });

})();
