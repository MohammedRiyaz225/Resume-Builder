/* =============================================
   MAIN.JS – Resu-Master Site-wide Logic
   ============================================= */

/* ---- Navbar scroll style ---- */
window.addEventListener('scroll', () => {
    document.querySelector('nav').classList.toggle('window-scroll', window.scrollY > 50);
    // Scroll-to-top visibility
    const scrollBtn = document.getElementById('scroll-top');
    if (scrollBtn) {
        scrollBtn.classList.toggle('show', window.scrollY > 400);
    }
});

/* ---- Mobile menu ---- */
const openBtn = document.getElementById('open-menu-btn');
const closeBtn = document.getElementById('close-menu-btn');
const navMenu = document.getElementById('nav-menu');

if (openBtn && closeBtn && navMenu) {
    openBtn.addEventListener('click', () => {
        navMenu.classList.add('show');
        openBtn.style.display = 'none';
        closeBtn.style.display = 'block';
    });
    closeBtn.addEventListener('click', () => {
        navMenu.classList.remove('show');
        closeBtn.style.display = 'none';
        openBtn.style.display = 'block';
    });
}

/* ---- Scroll to top ---- */
const scrollTopBtn = document.getElementById('scroll-top');
if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/* ---- FAQ accordion ---- */
const faqs = document.querySelectorAll('.faq');
faqs.forEach(faq => {
    faq.addEventListener('click', () => {
        // Close others
        faqs.forEach(other => {
            if (other !== faq) {
                other.classList.remove('open');
                const otherIcon = other.querySelector('.faq__icon i');
                if (otherIcon) otherIcon.className = 'uil uil-plus';
            }
        });
        faq.classList.toggle('open');
        const icon = faq.querySelector('.faq__icon i');
        if (icon) {
            icon.className = faq.classList.contains('open') ? 'uil uil-minus' : 'uil uil-plus';
        }
    });
});

/* ---- Animated stats counter ---- */
function animateCounter(el) {
    const target = parseInt(el.closest('.stat').dataset.target);
    const duration = 1800;
    const startTime = performance.now();
    const step = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(eased * target);
        el.textContent = current >= 1000 ? current.toLocaleString() : current;
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target >= 1000 ? target.toLocaleString() : target;
    };
    requestAnimationFrame(step);
}

/* ---- IntersectionObserver for reveal + counter ---- */
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

/* Stats counter observer */
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));

/* ---- Active nav link ---- */
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav__menu a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
        link.classList.add('active');
    } else {
        link.classList.remove('active');
    }
});

/* ---- Hero typing effect ---- */
(function() {
    const typingEl = document.querySelector('.gradient-text');
    if (!typingEl) return;
    const phrases = ['Dream Resume', 'Career Story', 'Next Chapter', 'Success Path'];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
        const current = phrases[phraseIndex];
        if (isDeleting) {
            typingEl.textContent = current.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typingEl.textContent = current.substring(0, charIndex + 1);
            charIndex++;
        }
        let delay = isDeleting ? 60 : 100;
        if (!isDeleting && charIndex === current.length) {
            delay = 2200;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            delay = 400;
        }
        setTimeout(type, delay);
    }
    setTimeout(type, 800);
})();