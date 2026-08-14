document.addEventListener("DOMContentLoaded", () => {
  const navbar = document.querySelector(".navbar");
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");
  const backToTop = document.getElementById("backToTop");

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
    document.querySelectorAll(".skill-fill").forEach((fill) => {
      const w = fill.getAttribute("data-width") || "0";
      fill.style.width = "0%";
      requestAnimationFrame(() => {
        setTimeout(() => {
          fill.style.width = w + "%";
        }, 120);
      });
    });
    const gpaFill = document.querySelector(".gpa-fill");
    if (gpaFill) {
      const w = gpaFill.getAttribute("data-width") || "0";
      gpaFill.style.width = "0%";
      requestAnimationFrame(() => {
        setTimeout(() => {
          gpaFill.style.width = w + "%";
        }, 320);
      });
    }
  };

  const animateNumbers = () => {
    document.querySelectorAll(".stat-num").forEach((el) => {
      const targetStr = el.getAttribute("data-target");
      const suffix = el.getAttribute("data-suffix") || "";
      if (!targetStr) return;
      const target = parseFloat(targetStr);
      if (isNaN(target)) return;
      const isFloat = targetStr.includes(".");
      const duration = 1500;
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = target * eased;
        el.textContent = (isFloat ? current.toFixed(2) : Math.round(current)) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = targetStr + suffix;
      };
      requestAnimationFrame(tick);
    });
  };

  const revealEls = document.querySelectorAll(
    ".section-header, .about-card, .edu-card, .skill-category, .skill-tags, .research-card, .project-main, .award-item, .ip-card, .paper-detail, .contact-card"
  );
  revealEls.forEach((el) => el.classList.add("reveal"));

  const observerOptions = { threshold: 0.14, rootMargin: "0px 0px -60px 0px" };
  let statsAnimated = false;
  let skillsAnimated = false;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      const section = entry.target.closest("section");
      if (!statsAnimated && section && section.id === "about") {
        animateNumbers();
        statsAnimated = true;
      }
      if (!skillsAnimated && section && section.id === "skills") {
        animateSkillBars();
        skillsAnimated = true;
      }
      io.unobserve(entry.target);
    });
  }, observerOptions);

  revealEls.forEach((el) => io.observe(el));

  if (!("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("visible"));
    animateSkillBars();
    animateNumbers();
  }
});
