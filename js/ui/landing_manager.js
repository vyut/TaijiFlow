/**
 * ============================================================================
 * TaijiFlow AI - Landing Page Manager
 * ============================================================================
 *
 * Manages interactions on the landing page (index.html):
 * - Hamburger Menu
 * - Random Motivational Quotes
 * - Scroll Reveal Animations
 *
 * @author TaijiFlow AI Team
 */

document.addEventListener("DOMContentLoaded", function () {
  // ===========================================================================
  // 1. HAMBURGER MENU TOGGLE
  // ===========================================================================
  const hamburger = document.getElementById("hamburger-btn");
  const navMenu = document.getElementById("nav-menu");

  if (hamburger && navMenu) {
    // Toggle menu on hamburger click
    hamburger.addEventListener("click", function () {
      hamburger.classList.toggle("active");
      navMenu.classList.toggle("active");
    });

    // Close menu when clicking a link
    navMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", function () {
        hamburger.classList.remove("active");
        navMenu.classList.remove("active");
      });
    });

    // Close menu when clicking outside
    document.addEventListener("click", function (e) {
      if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
        hamburger.classList.remove("active");
        navMenu.classList.remove("active");
      }
    });
  }

  // ===========================================================================
  // 2. RANDOM MOTIVATIONAL QUOTE
  // ===========================================================================
  // Derived from Shared Source (TAIJI_QUOTES in translations.js)
  if (typeof TAIJI_QUOTES !== "undefined") {
    const quotes = TAIJI_QUOTES;
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    const quoteText = document.getElementById("quote-text");
    if (quoteText && randomQuote) {
      quoteText.innerHTML = `"${randomQuote.zh}" — ${randomQuote.th}<br><span style="font-size: 0.9em; opacity: 0.8;">${randomQuote.en}</span>`;
    }
  }

  // ===========================================================================
  // 3. SCROLL REVEAL ANIMATION LOGIC (Replay on Scroll)
  // ===========================================================================
  const observerOptions = {
    threshold: 0.15, // Trigger when 15% visible
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      // Replay Logic: Add active when in view, remove when out
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
      } else {
        // Toggle off to replay animation when scrolling back
        entry.target.classList.remove("active");
      }
    });
  }, observerOptions);

  // Elements to animate
  const animatedSelectors = [
    ".about-card",
    ".guide-quickstart",
    ".guide-step",
    ".guide-extra-card",
    ".reference-card",
  ];

  const elements = document.querySelectorAll(animatedSelectors.join(", "));
  elements.forEach((el, index) => {
    el.classList.add("reveal-card");

    // Optional: Add staggered delay for siblings
    const parent = el.parentElement;
    if (parent && parent.children.length > 1) {
      const childIndex = Array.from(parent.children).indexOf(el);
      const delayClass = `reveal-delay-${Math.min(childIndex * 100, 300)}`;
      if (childIndex > 0) el.classList.add(delayClass);
    }

    observer.observe(el);
  });

  // ===========================================================================
  // 4. BACK TO TOP BUTTON
  // ===========================================================================
  const backToTopBtn = document.getElementById("back-to-top");

  if (backToTopBtn) {
    // Show/Hide on scroll
    window.addEventListener("scroll", () => {
      if (window.scrollY > 500) {
        backToTopBtn.classList.add("visible");
      } else {
        backToTopBtn.classList.remove("visible");
      }
    });

    // Scroll to top on click
    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }
});
