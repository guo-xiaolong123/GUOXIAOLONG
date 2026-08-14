document.addEventListener("DOMContentLoaded", () => {
  const navbar = document.querySelector(".navbar");
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");
  const backToTop = document.getElementById("backToTop");
  const skillFills = document.querySelectorAll(".skill-fill");
  const statNums = document.querySelectorAll(".stat-num");
  const gpaFill = document.querySelector(".gpa-fill");

  navToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
  });

  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("active");
    });
  });

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const targetId = link.getAttribute("href").slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        const offset = 72;
        const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: "smooth" });
      }
    });
  });

  const handleScroll = () => {
    const scrollY = window.scrollY;
    if (scrollY > 40) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
    if (scrollY > 500) {
      backToTop.classList.add("show");
    } else {
      backToTop.classList.remove("show");
    }
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  const animateSkillBars = () => {
    skillFills.forEach((fill) => {
      const width = fill.getAttribute("style")?.match(/width:\s*(\d+)%/)?.[1] || "0";
      fill.style.width = "0%";
      requestAnimationFrame(() => {
        setTimeout(() => {
          fill.style.width = width + "%";
        }, 100);
      });
    });
    if (gpaFill) {
      const width = gpaFill.getAttribute("style")?.match(/width:\s*(\d+)%/)?.[1] || "0";
      gpaFill.style.width = "0%";
      requestAnimationFrame(() => {
        setTimeout(() => {
          gpaFill.style.width = width + "%";
        }, 300);
      });
    }
  };

  const animateNumbers = () => {
    statNums.forEach((el) => {
      const text = el.textContent.trim();
      if (!text) return;
      const isFloat = text.includes(".");
      const target = parseFloat(text);
      if (isNaN(target)) return;
      const suffix = text.replace(/[0-9.]/g, "");
      const duration = 1400;
      const start = performance.now();
      el.textContent = isFloat ? "0.00" : "0";
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = target * eased;
        el.textContent = (isFloat ? current.toFixed(2) : Math.round(current)) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = text;
      };
      requestAnimationFrame(tick);
    });
  };

  const observerOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -60px 0px",
  };

  const revealEls = document.querySelectorAll(
    ".section-header, .about-card, .about-stats, .edu-card, .skill-category, .skill-tags, .research-card, .project-main, .award-item, .ip-card, .paper-detail, .contact-card"
  );
  revealEls.forEach((el) => el.classList.add("reveal"));

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        if (entry.target.classList.contains("skills-grid") ||
            entry.target.closest(".skills-section")) {
          animateSkillBars();
        }
        if (entry.target.classList.contains("about-stats") ||
            entry.target.closest(".about-section")) {
          animateNumbers();
        }
        io.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealEls.forEach((el) => io.observe(el));
  document.querySelectorAll(".skills-grid, .about-stats").forEach((el) => io.observe(el));

  if ("IntersectionObserver" in window === false) {
    revealEls.forEach((el) => el.classList.add("visible"));
    animateSkillBars();
    animateNumbers();
  }
});
