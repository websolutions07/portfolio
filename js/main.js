/* ==========================================================================
   main.js — scroll reveals, marquee duplication guard, contact form
   ========================================================================== */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --- Character-by-Character Kinetic Typography Splitting Engine ---------- */
  function splitTextIntoChars(el) {
    if (!el || el.dataset.charsSplit) return;
    el.dataset.charsSplit = "true";

    var charIndex = 0;
    var fragment = document.createDocumentFragment();

    function processChild(node) {
      if (node.nodeType === 3) {
        var text = node.textContent;
        var words = text.split(" ");
        for (var w = 0; w < words.length; w++) {
          var word = words[w];
          if (!word && w > 0) continue;

          var wordSpan = document.createElement("span");
          wordSpan.style.display = "inline-block";
          wordSpan.style.whiteSpace = "nowrap";

          for (var i = 0; i < word.length; i++) {
            var ch = word[i];
            if (ch === "\n" || ch === "\r" || ch === "\t") continue;
            var span = document.createElement("span");
            span.className = "char";
            span.style.setProperty("--char-idx", charIndex);
            span.textContent = ch;
            wordSpan.appendChild(span);
            charIndex++;
          }
          fragment.appendChild(wordSpan);

          if (w < words.length - 1) {
            var spaceSpan = document.createElement("span");
            spaceSpan.className = "char char--space";
            spaceSpan.style.setProperty("--char-idx", charIndex);
            spaceSpan.textContent = "\u00A0";
            fragment.appendChild(spaceSpan);
            charIndex++;
          }
        }
      } else if (node.nodeType === 1) {
        if (node.tagName === "BR") {
          var br = document.createElement("br");
          fragment.appendChild(br);
        } else if (node.tagName === "IMG") {
          var cloneImg = node.cloneNode(true);
          cloneImg.classList.add("char", "char--emoji");
          cloneImg.style.setProperty("--char-idx", charIndex);
          fragment.appendChild(cloneImg);
          charIndex++;
        } else {
          Array.from(node.childNodes).forEach(processChild);
        }
      }
    }

    Array.from(el.childNodes).forEach(processChild);
    el.innerHTML = "";
    el.appendChild(fragment);
  }

  // Split all .reveal-fill display headings on page execution
  Array.from(document.querySelectorAll(".reveal-fill")).forEach(splitTextIntoChars);

  /* --- outline -> fill headings, and rise-in blocks ----------------------
     Only hide things once we know we can reveal them again. */

  document.documentElement.classList.add("js-reveal");

  var groups = [
    { selector: ".reveal-fill", className: "is-filled", ratio: 0.25 },
    { selector: ".rise", className: "is-in", ratio: 0.12 },
    { selector: ".about", className: "is-revealed", ratio: 0.12 },
  ];

  var pending = [];

  groups.forEach(function (group) {
    Array.prototype.forEach.call(
      document.querySelectorAll(group.selector),
      function (node) {
        pending.push({ node: node, className: group.className, ratio: group.ratio });
      }
    );
  });

  function reveal(item) {
    item.node.classList.add(item.className);
    item.done = true;
  }

  if (reduceMotion) {
    pending.forEach(reveal);
    pending = [];
  }

  /* Geometry check — the backstop. IntersectionObserver below is the fast
     path, but it does not fire in every environment, and a heading that
     never reveals would stay invisible. */
  function sweep() {
    if (!pending.length) return;

    var viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    pending = pending.filter(function (item) {
      if (item.done) return false;

      var rect = item.node.getBoundingClientRect();
      if (!rect.height) return true;

      var visible = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
      var enough = visible / rect.height >= Math.min(item.ratio, 0.9);

      if (enough) {
        reveal(item);
        return false;
      }
      return true;
    });
  }

  var scheduled = false;

  /* Throttled with a timer rather than requestAnimationFrame: rAF is suspended
     whenever the page is not being painted, and the sweep must still run. */
  function onScroll() {
    if (scheduled) return;
    scheduled = true;
    window.setTimeout(function () {
      scheduled = false;
      sweep();
    }, 90);
  }

  if (!reduceMotion) {
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            if (entry.target.classList.contains("reveal-fill")) {
              entry.target.classList.add("is-filled");
            } else if (entry.target.classList.contains("about")) {
              entry.target.classList.add("is-revealed");
            } else {
              entry.target.classList.add("is-in");
            }
            io.unobserve(entry.target);
          });
        },
        { threshold: [0.1, 0.25], rootMargin: "0px 0px -5% 0px" }
      );

      pending.forEach(function (item) {
        io.observe(item.node);
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("load", sweep);

    /* Safety net. Scroll events, rAF and IntersectionObserver are all
       suspended while a page is not being painted, and any of them can be
       missing in an embedded viewer — without this poll a heading could stay
       outlined and a .rise block stay at opacity 0 forever. It stops itself
       as soon as everything has been revealed. */
    var poll = window.setInterval(function () {
      sweep();
      if (!pending.length) window.clearInterval(poll);
    }, 350);

    sweep();
  }

  /* --- marquees ----------------------------------------------------------
     Each track is authored once; cloning it makes the -50% loop seamless. */

  document.querySelectorAll("[data-marquee]").forEach(function (track) {
    var originals = Array.prototype.slice.call(track.children);

    originals.forEach(function (node) {
      var clone = node.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      clone.querySelectorAll("a, button, input").forEach(function (el) {
        el.setAttribute("tabindex", "-1");
      });
      track.appendChild(clone);
    });

    track.classList.add("is-doubled");
  });

  /* --- contact form ------------------------------------------------------ */

  var form = document.getElementById("contact-form");
  var status = document.getElementById("contact-status");

  if (form && status) {
    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      var name = form.querySelector('[name="fullname"]');
      var phone = form.querySelector('[name="phone"]');
      var email = form.querySelector('[name="email"]');
      var message = form.querySelector('[name="message"]');

      if (!name.value.trim() || !phone.value.trim() || !email.value.trim()) {
        status.textContent = "Please fill in your name, mobile number, and email.";
        status.hidden = false;
        return;
      }

      status.textContent = "Sending...";
      status.hidden = false;

      try {
        const response = await fetch('https//portfolio-7cm8.onrender.com/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullname: name.value.trim(),
            phone: phone.value.trim(),
            email: email.value.trim(),
            message: message ? message.value.trim() : ''
          })
        });

        if (response.ok) {
          status.textContent = "✨ Thanks! Your message has been sent. Apurva will get back to you within 24 hours.";
          form.reset();
        } else {
          status.textContent = "Oops! Something went wrong. Please try again.";
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        status.textContent = "Oops! Something went wrong. Please try again.";
      }

      setTimeout(function () {
        status.hidden = true;
      }, 7000);
    });
  }

  /* --- nav scrollspy & focus management ---------------------------------- */

  var navLinks = document.querySelectorAll(".hero__nav a");
  var sections = document.querySelectorAll("section[id]");

  function updateNavSpy() {
    var scrollPos = window.scrollY + 220;
    sections.forEach(function (sec) {
      var top = sec.offsetTop;
      var height = sec.offsetHeight;
      var id = sec.getAttribute("id");
      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(function (link) {
          if (link.getAttribute("href") === "#" + id) {
            link.style.opacity = "1";
            link.style.color = "#ffffff";
            link.style.textShadow = "0 0 12px rgba(255,255,255,0.6)";
          } else {
            link.style.opacity = "";
            link.style.color = "";
            link.style.textShadow = "";
          }
        });
      }
    });
  }
  window.addEventListener("scroll", updateNavSpy, { passive: true });

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function () {
      var target = document.getElementById(link.getAttribute("href").slice(1));
      if (target) target.setAttribute("tabindex", "-1");
    });
  });

  /* --- interactive 3D character tilt, glow tracking & physics ------------ */
  var heroChar = document.getElementById("hero-character");
  var heroStage = document.getElementById("hero-stage");
  var heroGlow = document.getElementById("hero-glow");
  var heroSection = document.querySelector(".hero");

  if (heroChar && heroSection && !reduceMotion) {
    var targetRotX = 0, targetRotY = 0, targetRotZ = 0;
    var targetX = 0, targetY = 0, targetScale = 1;
    var currentRotX = 0, currentRotY = 0, currentRotZ = 0;
    var currentX = 0, currentY = 0, currentScale = 1;
    var clickBounce = 0;
    var isDragging = false;
    var startDragX = 0, startDragY = 0;

    function onPointerMove(clientX, clientY) {
      var rect = heroSection.getBoundingClientRect();
      if (clientY < rect.top - 100 || clientY > rect.bottom + 100) return;

      var charRect = heroChar.getBoundingClientRect();
      var charCenterX = charRect.left + charRect.width / 2;
      var charCenterY = charRect.top + charRect.height / 2;

      var dx = (clientX - charCenterX) / (window.innerWidth * 0.5);
      var dy = (clientY - charCenterY) / (window.innerHeight * 0.5);

      // Clamp values between -1 and 1
      dx = Math.max(-1.2, Math.min(1.2, dx));
      dy = Math.max(-1.2, Math.min(1.2, dy));

      targetRotY = dx * 24; // Yaw
      targetRotX = -dy * 18; // Pitch
      targetRotZ = dx * 3; // Subtle roll
      targetX = dx * 20;
      targetY = dy * 14;
    }

    window.addEventListener("mousemove", function (e) {
      onPointerMove(e.clientX, e.clientY);
    }, { passive: true });

    heroSection.addEventListener("mouseleave", function () {
      targetRotX = 0;
      targetRotY = 0;
      targetRotZ = 0;
      targetX = 0;
      targetY = 0;
      targetScale = 1;
    });

    if (heroStage) {
      heroStage.addEventListener("mouseenter", function () {
        targetScale = 1.04;
      });

      heroStage.addEventListener("mouseleave", function () {
        targetScale = 1;
        isDragging = false;
      });

      heroStage.addEventListener("mousedown", function (e) {
        isDragging = true;
        startDragX = e.clientX;
        startDragY = e.clientY;
        clickBounce = -10;
        targetScale = 0.98;
      });

      window.addEventListener("mouseup", function () {
        if (isDragging) {
          isDragging = false;
          clickBounce = 8;
          targetScale = 1.04;
        }
      });

      // Touch interactions
      heroStage.addEventListener("touchstart", function (e) {
        if (e.touches.length > 0) {
          isDragging = true;
          startDragX = e.touches[0].clientX;
          startDragY = e.touches[0].clientY;
          targetScale = 1.03;
          onPointerMove(startDragX, startDragY);
        }
      }, { passive: true });

      heroStage.addEventListener("touchmove", function (e) {
        if (isDragging && e.touches.length > 0) {
          onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
        }
      }, { passive: true });

      heroStage.addEventListener("touchend", function () {
        isDragging = false;
        targetRotX = 0;
        targetRotY = 0;
        targetRotZ = 0;
        targetX = 0;
        targetY = 0;
        targetScale = 1;
      });
    }

    var startTime = performance.now();
    function animateModel(now) {
      var elapsed = (now - startTime) / 1000;
      var floatOffset = Math.sin(elapsed * 1.8) * 8;
      var floatRotZ = Math.sin(elapsed * 0.9) * 1.5;

      // Smooth decay of click bounce
      clickBounce *= 0.85;

      // Smooth spring lerp
      var ease = 0.085;
      currentRotX += (targetRotX - currentRotX) * ease;
      currentRotY += (targetRotY - currentRotY) * ease;
      currentRotZ += ((targetRotZ + floatRotZ) - currentRotZ) * ease;
      currentX += (targetX - currentX) * ease;
      currentY += (targetY - currentY) * ease;
      currentScale += (targetScale - currentScale) * ease;

      heroChar.style.transform =
        "translate(" + currentX.toFixed(2) + "px, " +
        (currentY + floatOffset + clickBounce).toFixed(2) +
        "px) perspective(1000px) rotateX(" +
        currentRotX.toFixed(2) +
        "deg) rotateY(" +
        currentRotY.toFixed(2) +
        "deg) rotateZ(" +
        currentRotZ.toFixed(2) +
        "deg) scale(" +
        currentScale.toFixed(3) +
        ")";

      if (heroGlow) {
        heroGlow.style.transform =
          "translate(calc(-50% + " + (-currentX * 0.6).toFixed(1) + "px), calc(-50% + " +
          (-currentY * 0.6 + floatOffset * 0.4).toFixed(1) +
          "px)) scale(" +
          (currentScale * 1.05).toFixed(3) +
          ")";
      }

      requestAnimationFrame(animateModel);
    }
    requestAnimationFrame(animateModel);
  }

  /* --- About Section 3D Holographic Stage & Parallax Physics Engine ------- */
  var aboutSection = document.querySelector(".about");
  var aboutStageCard = document.getElementById("about-stage-card");
  var aboutAvatar = document.getElementById("about-model-avatar");
  var aboutBadges = document.querySelectorAll(".about__badge");

  if (aboutSection && aboutStageCard && !reduceMotion) {
    var stageRotX = 0, stageRotY = 0, stageScale = 1;
    var curStageRotX = 0, curStageRotY = 0, curStageScale = 1;
    var mouseNormX = 0, mouseNormY = 0;
    var curMouseNormX = 0, curMouseNormY = 0;
    var isHoveringStage = false;

    window.addEventListener("mousemove", function (e) {
      var rect = aboutSection.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      if (rect.bottom < -100 || rect.top > vh + 100) return;

      var cardRect = aboutStageCard.getBoundingClientRect();
      var cx = cardRect.left + cardRect.width / 2;
      var cy = cardRect.top + cardRect.height / 2;

      var nx = (e.clientX - cx) / (window.innerWidth * 0.45);
      var ny = (e.clientY - cy) / (window.innerHeight * 0.45);

      mouseNormX = Math.max(-1.2, Math.min(1.2, nx));
      mouseNormY = Math.max(-1.2, Math.min(1.2, ny));

      if (isHoveringStage) {
        stageRotY = mouseNormX * 18;
        stageRotX = -mouseNormY * 16;
        stageScale = 1.03;
      } else {
        stageRotY = mouseNormX * 8;
        stageRotX = -mouseNormY * 6;
        stageScale = 1;
      }
    }, { passive: true });

    aboutStageCard.addEventListener("mouseenter", function () {
      isHoveringStage = true;
    });

    aboutStageCard.addEventListener("mouseleave", function () {
      isHoveringStage = false;
      stageRotX = 0;
      stageRotY = 0;
      stageScale = 1;
    });

    var stageStartTime = performance.now();

    function renderAbout3D(now) {
      var elapsed = (now - stageStartTime) / 1000;
      var gentleBob = Math.sin(elapsed * 1.6) * 5;

      curStageRotX += (stageRotX - curStageRotX) * 0.09;
      curStageRotY += (stageRotY - curStageRotY) * 0.09;
      curStageScale += (stageScale - curStageScale) * 0.09;

      curMouseNormX += (mouseNormX - curMouseNormX) * 0.08;
      curMouseNormY += (mouseNormY - curMouseNormY) * 0.08;

      aboutStageCard.style.transform =
        "perspective(1200px) rotateX(" + curStageRotX.toFixed(2) + "deg) " +
        "rotateY(" + curStageRotY.toFixed(2) + "deg) " +
        "scale(" + curStageScale.toFixed(3) + ") " +
        "translateY(" + gentleBob.toFixed(1) + "px)";

      // Parallax for floating badges
      aboutBadges.forEach(function (badge) {
        var depth = parseFloat(badge.getAttribute("data-parallax-depth")) || 20;
        var bx = curMouseNormX * depth;
        var by = curMouseNormY * depth;
        badge.style.transform =
          "translate3d(" + bx.toFixed(1) + "px, " + by.toFixed(1) + "px, " + (depth + 15) + "px) " +
          "rotateX(" + (-curStageRotX * 0.5).toFixed(1) + "deg) " +
          "rotateY(" + (-curStageRotY * 0.5).toFixed(1) + "deg)";
      });

      requestAnimationFrame(renderAbout3D);
    }
    requestAnimationFrame(renderAbout3D);
  }

  /* --- Interactive Services Row Spotlight Physics ------------------------ */
  var serviceRows = document.querySelectorAll(".services__row");

  if (serviceRows.length && !reduceMotion) {
    serviceRows.forEach(function (row) {
      row.addEventListener("mousemove", function (e) {
        var rect = row.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        row.style.setProperty("--mouse-x", x.toFixed(1) + "px");
        row.style.setProperty("--mouse-y", y.toFixed(1) + "px");
      });

      // Smooth scroll to Contact when clicking a service row
      row.addEventListener("click", function (e) {
        if (e.target.closest("a, button")) return;
        var contactSec = document.getElementById("contact");
        if (contactSec) {
          contactSec.scrollIntoView({ behavior: "smooth" });
        }
      });
    });
  }

  /* --- 3D Project Slide Perspective Tilt --------------------------------- */
  var projectCards = document.querySelectorAll(".projects__card");

  if (projectCards.length && !reduceMotion) {
    projectCards.forEach(function (card) {
      var slideWrap = card.querySelector(".projects__slide-wrap");
      var slideImg = card.querySelector(".projects__slide-img");
      if (!slideWrap || !slideImg) return;

      var pRotX = 0, pRotY = 0, pScale = 1;
      var curPRotX = 0, curPRotY = 0, curPScale = 1;

      card.addEventListener("mousemove", function (e) {
        if (window.innerWidth <= 719) return;
        var rect = slideWrap.getBoundingClientRect();
        var x = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
        var y = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);

        x = Math.max(-1, Math.min(1, x));
        y = Math.max(-1, Math.min(1, y));

        pRotY = x * 10;
        pRotX = -y * 8;
        pScale = 1.02;
      });

      card.addEventListener("mouseleave", function () {
        pRotX = 0;
        pRotY = 0;
        pScale = 1;
      });

      function animateSlideTilt() {
        if (window.innerWidth <= 719) {
          slideImg.style.transform = "";
          requestAnimationFrame(animateSlideTilt);
          return;
        }

        curPRotX += (pRotX - curPRotX) * 0.1;
        curPRotY += (pRotY - curPRotY) * 0.1;
        curPScale += (pScale - curPScale) * 0.1;

        slideImg.style.transform =
          "perspective(1100px) rotateX(" + curPRotX.toFixed(2) + "deg) rotateY(" + curPRotY.toFixed(2) + "deg) scale(" + curPScale.toFixed(3) + ")";

        requestAnimationFrame(animateSlideTilt);
      }
      requestAnimationFrame(animateSlideTilt);
    });
  }

  /* --- Unified Site-Wide Scroll Animation Engine -------------------------- */
  var scrollProgress = document.getElementById("scroll-progress");
  var heroSection = document.querySelector(".hero");
  var heroFlankLeft = document.querySelector(".hero__flank--left");
  var heroFlankRight = document.querySelector(".hero__flank--right");
  var heroTitle = document.querySelector(".hero__title");
  var heroStatusWrap = document.querySelector(".hero__status-wrap");
  var contactDecos = document.querySelectorAll(".contact__deco");
  var contactSection = document.querySelector(".contact");
  var processSection = document.querySelector("#process");
  var processTracks = document.querySelectorAll("#process .marquee__track");

  var scrollTicking = false;

  function updateSiteScrollAnimations() {
    var scrollY = window.pageYOffset || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;

    // 1. Top Scroll Progress Bar
    if (scrollProgress && docHeight > 0) {
      var progress = Math.min(1, Math.max(0, scrollY / docHeight));
      scrollProgress.style.width = (progress * 100).toFixed(2) + "%";
    }

    if (reduceMotion) {
      scrollTicking = false;
      return;
    }

    var vh = window.innerHeight || document.documentElement.clientHeight;

    // 2. Hero Section Parallax on Scroll
    if (heroSection && scrollY < vh * 1.2) {
      var heroRatio = Math.min(1, scrollY / vh);
      var heroY = (scrollY * 0.22).toFixed(1);
      var heroFade = Math.max(0, 1 - heroRatio * 1.15).toFixed(3);

      if (heroTitle) {
        heroTitle.style.transform = "translate3d(0, " + (heroY * 0.6) + "px, 0)";
        heroTitle.style.opacity = heroFade;
      }
      if (heroStatusWrap) {
        heroStatusWrap.style.transform = "translate3d(0, " + (heroY * 0.4) + "px, 0)";
        heroStatusWrap.style.opacity = heroFade;
      }
      if (heroFlankLeft) {
        heroFlankLeft.style.transform = "translate3d(" + (-heroRatio * 20) + "px, " + (heroY * 0.8) + "px, 0)";
        heroFlankLeft.style.opacity = heroFade;
      }
      if (heroFlankRight) {
        heroFlankRight.style.transform = "translate3d(" + (heroRatio * 20) + "px, " + (heroY * 0.8) + "px, 0)";
        heroFlankRight.style.opacity = heroFade;
      }
    }

    // 3. Contact 3D Decos Parallax
    if (contactSection && contactDecos.length) {
      var cRect = contactSection.getBoundingClientRect();
      if (cRect.bottom > -100 && cRect.top < vh + 100) {
        var cProgress = (vh * 0.5 - (cRect.top + cRect.height * 0.5)) / (vh + cRect.height);
        contactDecos.forEach(function (deco) {
          var speedY = parseFloat(deco.getAttribute("data-parallax-y")) || 0;
          var speedRot = parseFloat(deco.getAttribute("data-parallax-rot")) || 0;
          var py = cProgress * speedY * 260;
          var pr = cProgress * speedRot;
          deco.style.setProperty("--scroll-y", py.toFixed(1) + "px");
          deco.style.setProperty("--scroll-rot", pr.toFixed(1) + "deg");
        });
      }
    }

    // 4. My Design Process Section Counter-Scroll Velocity Shift
    if (processSection && processTracks.length >= 2) {
      var pRect = processSection.getBoundingClientRect();
      if (pRect.bottom > 0 && pRect.top < vh) {
        var pProgress = (vh - pRect.top) / (vh + pRect.height);
        var pShift = (pProgress - 0.5) * 70;
        processTracks[0].style.transform = "translate3d(" + (-pShift) + "px, 0, 0)";
        processTracks[1].style.transform = "translate3d(" + (pShift) + "px, 0, 0)";
      }
    }

    scrollTicking = false;
  }

  function onSiteScroll() {
    if (!scrollTicking) {
      scrollTicking = true;
      requestAnimationFrame(updateSiteScrollAnimations);
    }
  }

  window.addEventListener("scroll", onSiteScroll, { passive: true });
  window.addEventListener("resize", onSiteScroll);
  updateSiteScrollAnimations();

  /* --- Dynamic Data Fetching --------------------------------------------- */
  async function loadDynamicData() {
    try {
      // Fetch Services
      const servicesRes = await fetch('https:///portfolio-7cm8.onrender.com/api/services');
      if (servicesRes.ok) {
        const services = await servicesRes.json();
        const servicesList = document.getElementById('services-list');
        if (servicesList) {
          servicesList.innerHTML = services.map((s, idx) => `
      <div class="services__row rise" style="--rise-delay:${0.04 + (idx * 0.08)}s" data-service-idx="${s.id}">
        <div class="services__spotlight" aria-hidden="true"></div>
        <div class="services__col-num">
          <span class="services__num display">0${idx + 1}</span>
          <span class="services__tag-pill">${s.tagline}</span>
        </div>
        <div class="services__body">
          <div class="services__title-bar">
            <h3 class="services__name label">${s.name}</h3>
            <span class="services__action-pill">
              <span>Explore Scope</span>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </span>
          </div>
          <p class="services__desc">${s.description}</p>
          <div class="services__chips">
            ${s.chips.split(',').map(chip => `<span class="services__chip">${chip.trim()}</span>`).join('')}
          </div>
        </div>
      </div>
          `).join('');

          // Re-attach physics to dynamically created rows
          const serviceRows = document.querySelectorAll(".services__row");
          if (serviceRows.length && !reduceMotion) {
            serviceRows.forEach(function (row) {
              row.addEventListener("mousemove", function (e) {
                var rect = row.getBoundingClientRect();
                var x = e.clientX - rect.left;
                var y = e.clientY - rect.top;
                row.style.setProperty("--mouse-x", x.toFixed(1) + "px");
                row.style.setProperty("--mouse-y", y.toFixed(1) + "px");
              });
              row.addEventListener("click", function (e) {
                if (e.target.closest("a, button")) return;
                var contactSec = document.getElementById("contact");
                if (contactSec) {
                  contactSec.scrollIntoView({ behavior: "smooth" });
                }
              });
            });
          }
        }
      }

      // Fetch Projects
      const projectsRes = await fetch('https://portfolio-7cm8.onrender.com//api/projects');
      if (projectsRes.ok) {
        const projects = await projectsRes.json();
        const projectsList = document.getElementById('projects-list');
        if (projectsList) {
          projectsList.innerHTML = projects.map((p, idx) => `
      <article class="projects__card" style="--card-top:${90 + (idx * 28)}px">
        <header class="projects__head">
          <span class="projects__num display">0${idx + 1}</span>
          <div class="projects__client">
            <span class="projects__client-label label">${p.client_location}</span>
            <span class="projects__client-name">${p.title}</span>
          </div>
          <div class="projects__tags">
            ${p.tags.split(',').map(tag => `<span class="projects__tag">${tag.trim()}</span>`).join('')}
          </div>
          <a class="pill-ghost projects__link" href="#contact">Live project</a>
        </header>
        <div class="projects__media projects__media--mockup">
          <div class="projects__browser-bar">
            <span class="projects__dot"></span>
            <span class="projects__dot"></span>
            <span class="projects__dot"></span>
            <span class="projects__url">${p.url}</span>
          </div>
          <div class="projects__slide-wrap">
            <img class="projects__slide-img" src="${p.image_url}" alt="Project Mockup" width="1024" height="1024">
            <div class="projects__shine" aria-hidden="true"></div>
          </div>
        </div>
      </article>
          `).join('');

          // Re-attach 3D Project Slide Perspective Tilt
          const projectCards = document.querySelectorAll(".projects__card");
          if (projectCards.length && !reduceMotion) {
            projectCards.forEach(function (card) {
              var slideWrap = card.querySelector(".projects__slide-wrap");
              var slideImg = card.querySelector(".projects__slide-img");
              if (!slideWrap || !slideImg) return;

              var pRotX = 0, pRotY = 0, pScale = 1;
              var curPRotX = 0, curPRotY = 0, curPScale = 1;

              card.addEventListener("mousemove", function (e) {
                if (window.innerWidth <= 719) return;
                var rect = slideWrap.getBoundingClientRect();
                var x = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
                var y = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);

                x = Math.max(-1, Math.min(1, x));
                y = Math.max(-1, Math.min(1, y));

                pRotY = x * 10;
                pRotX = -y * 8;
                pScale = 1.02;
              });

              card.addEventListener("mouseleave", function () {
                pRotX = 0;
                pRotY = 0;
                pScale = 1;
              });

              function animateSlideTilt() {
                if (window.innerWidth <= 719) {
                  slideImg.style.transform = "";
                  requestAnimationFrame(animateSlideTilt);
                  return;
                }

                curPRotX += (pRotX - curPRotX) * 0.1;
                curPRotY += (pRotY - curPRotY) * 0.1;
                curPScale += (pScale - curPScale) * 0.1;

                slideImg.style.transform =
                  "perspective(1100px) rotateX(" + curPRotX.toFixed(2) + "deg) rotateY(" + curPRotY.toFixed(2) + "deg) scale(" + curPScale.toFixed(3) + ")";

                requestAnimationFrame(animateSlideTilt);
              }
              requestAnimationFrame(animateSlideTilt);
            });
          }
        }
      }

      // Re-trigger reveal animation for newly added dynamic rows
      setTimeout(() => {
        const newRises = document.querySelectorAll('#services-list .rise');
        newRises.forEach(node => {
          pending.push({ node: node, className: 'is-in', ratio: 0.12 });
          if ("IntersectionObserver" in window && typeof io !== 'undefined') {
            io.observe(node);
          }
        });
        // Call sweep to immediately reveal items in view
        if (typeof sweep === 'function') {
          sweep();
        }
      }, 50);

    } catch (err) {
      console.error("Failed to load dynamic data:", err);
    }
  }

  loadDynamicData();

})();
