// Theme Toggle Functionality
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

// Get saved theme preference or default to dark
const currentTheme = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', currentTheme);

// Theme toggle handler
themeToggle.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update navbar shadow for light theme
    updateNavbarShadow();
});

// Update navbar shadow based on theme
function updateNavbarShadow() {
    const theme = html.getAttribute('data-theme');
    if (window.pageYOffset > 100) {
        navbar.style.boxShadow = theme === 'dark' 
            ? '0 4px 6px -1px rgba(0, 0, 0, 0.4)' 
            : '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.boxShadow = theme === 'dark'
            ? '0 1px 2px 0 rgba(0, 0, 0, 0.3)'
            : '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
    }
}

// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Smooth scroll for navigation links
const NAV_SCROLL_OFFSET = 88;

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - NAV_SCROLL_OFFSET,
                behavior: 'smooth'
            });
        }
    });
});

// Navbar background on scroll
const navbar = document.querySelector('.navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    updateNavbarShadow();
    lastScroll = currentScroll;
});

// Initialize navbar shadow on load
document.addEventListener('DOMContentLoaded', () => {
    updateNavbarShadow();
});

// Section & scroll reveal transitions
const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

const revealObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
);

const sectionObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    },
    { threshold: 0.06 }
);

function initScrollReveals() {
    const groups = [
        { selector: '.section-header, .about-header', variant: 'reveal-up' },
        { selector: '.about-text-content', variant: 'reveal-up', delay: 80 },
        { selector: '.contact-content-modern', variant: 'reveal-up', delay: 80 },
        { selector: '.featured-card', variant: 'reveal-scale' },
        { selector: '.skills-cloud', variant: 'reveal-up', delay: 120 },
        { selector: '.highlight-item', variant: 'reveal-up', stagger: 100 },
        { selector: '.duty-item', variant: 'reveal-left', stagger: 70 },
        { selector: '.exp-card-mini', variant: 'reveal-up', stagger: 90 },
        { selector: '.education-card-modern', variant: 'reveal-up', stagger: 90 },
        { selector: '.contact-card', variant: 'reveal-scale', stagger: 80 },
        { selector: '.footer', variant: 'reveal-up' }
    ];

    groups.forEach(({ selector, variant, stagger = 0, delay = 0 }) => {
        document.querySelectorAll(selector).forEach((el, index) => {
            el.classList.add(variant);
            el.style.setProperty('--reveal-delay', `${delay + index * stagger}ms`);
            revealObserver.observe(el);
        });
    });

    document.querySelectorAll('section[id]:not(#home)').forEach((section) => {
        section.classList.add('section-enter');
        sectionObserver.observe(section);
    });
}

function initHeroEntrance() {
    const items = [
        ...document.querySelectorAll('.hero-intro > *'),
        document.querySelector('.hero-visual'),
        ...document.querySelectorAll('.hero-actions > *')
    ].filter(Boolean);

    items.forEach((el, index) => {
        el.classList.add('hero-enter');
        el.style.setProperty('--enter-delay', `${80 + index * 90}ms`);
    });

    requestAnimationFrame(() => {
        document.body.classList.add('is-loaded');
    });
}

function initTransitions() {
    if (motionQuery.matches) {
        document.documentElement.classList.add('reduce-motion');
        return;
    }

    initHeroEntrance();
    initScrollReveals();
}

motionQuery.addEventListener('change', () => {
    if (motionQuery.matches) {
        document.documentElement.classList.add('reduce-motion');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    initTransitions();
});

// Active navigation link highlighting
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
    const scrollPos = window.pageYOffset;
    const navOffset = NAV_SCROLL_OFFSET;
    let current = sections[0]?.getAttribute('id') || '';

    sections.forEach((section) => {
        const sectionTop = section.offsetTop - navOffset;
        const sectionBottom = sectionTop + section.offsetHeight;

        if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach((link) => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}, { passive: true });

// Add typing effect to hero code snippet (optional enhancement)
const codeSnippet = document.querySelector('.code-snippet');
if (codeSnippet) {
    const originalText = codeSnippet.innerHTML;
    codeSnippet.innerHTML = '';
    codeSnippet.style.opacity = '0';
    
    setTimeout(() => {
        codeSnippet.innerHTML = originalText;
        codeSnippet.style.transition = 'opacity 0.5s ease';
        codeSnippet.style.opacity = '1';
    }, 800);
}

// Subtle parallax on hero background only (desktop) — never shift hero content
const heroBackground = document.querySelector('.hero-background');
const heroSection = document.querySelector('.hero');
const canParallax = window.matchMedia('(min-width: 1025px) and (prefers-reduced-motion: no-preference)');

function resetHeroMotion() {
    if (heroSection) {
        heroSection.style.transform = '';
        heroSection.style.opacity = '';
    }
    if (heroBackground) {
        heroBackground.style.transform = '';
    }
}

window.addEventListener('scroll', () => {
    if (!canParallax.matches) {
        resetHeroMotion();
        return;
    }

    const scrolled = window.pageYOffset;
    if (heroBackground && scrolled < window.innerHeight) {
        heroBackground.style.transform = `translateY(${scrolled * 0.25}px)`;
    }
}, { passive: true });

canParallax.addEventListener('change', resetHeroMotion);
document.addEventListener('DOMContentLoaded', resetHeroMotion);

// Add hover effect to skill tags
document.querySelectorAll('.skill-tag-modern').forEach(tag => {
    tag.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px) scale(1.05)';
    });
    
    tag.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Set current year in footer
document.addEventListener('DOMContentLoaded', () => {
    const yearElement = document.getElementById('currentYear');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
});

// Console message for fun
console.log('%c👋 Hello! Thanks for checking out my portfolio.', 'color: #6366f1; font-size: 16px; font-weight: bold;');
console.log('%cBuilt with HTML, CSS, and JavaScript', 'color: #64748b; font-size: 12px;');

