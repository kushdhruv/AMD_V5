
/**
 * Vanilla HTML + CSS + JS app templates.
 * These provide the scaffolding files that wrap the AI-generated components.
 */

export function getPackageJson(projectName = "my-website") {
  return JSON.stringify({
    name: projectName.toLowerCase().replace(/\s+/g, "-"),
    private: true,
    version: "1.0.0",
    description: "Vanilla HTML/CSS/JS website powered by AI",
    scripts: {
      "start": "echo 'Standard HTML/CSS/JS project. Open index.html in a browser.'"
    },
    dependencies: {},
    devDependencies: {}
  }, null, 2);
}

export function getIndexHTML(plan, sections = "") {
  const title = plan.projectName || "My Website";
  const brandHex = plan.colorScheme?.primary || "#6366f1";

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    
    <!-- CSS -->
    <link rel="stylesheet" href="style.css">
    
    <!-- Tailwind CDN for modern utility classes -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        theme: {
          extend: {
            colors: {
              brand: '${brandHex}'
            },
            fontFamily: {
              sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
              heading: ['Outfit', 'Plus Jakarta Sans', 'sans-serif'],
            },
            animation: {
              'fade-in': 'fadeIn 0.8s ease-out forwards',
              'slide-up': 'slideUp 0.8s ease-out forwards',
              'float': 'float 6s ease-in-out infinite',
              'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
            },
            keyframes: {
              fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
              slideUp: { '0%': { opacity: '0', transform: 'translateY(30px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
              float: { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-20px)' } },
              pulseGlow: { '0%, 100%': { opacity: '0.5' }, '50%': { opacity: '1' } },
            }
          }
        }
      }
    </script>
</head>
<body class="bg-[#020617] text-white selection:bg-indigo-500 selection:text-white antialiased">
    <div id="app">
        ${sections}
    </div>

    <!-- JS -->
    <script src="main.js"></script>
</body>
</html>
`;
}

export function getBaseCSS() {
  return `
/* Base Styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    letter-spacing: -0.01em;
}

html {
    scroll-behavior: smooth;
}

body {
    font-family: 'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif;
    line-height: 1.6;
    overflow-x: hidden;
    background-color: #020617;
    color: #f8fafc;
}

/* Container */
.container {
    width: 100%;
    max-width: 1280px;
    margin: 0 auto;
}

/* Glassmorphism 2.0 */
.glass {
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}

.glass-card {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-card:hover {
    border-color: rgba(99, 102, 241, 0.4);
    background: rgba(255, 255, 255, 0.06);
    box-shadow: 0 0 40px rgba(99, 102, 241, 0.15);
    transform: translateY(-4px);
}

/* Bento Grid Utilities */
.bento-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-auto-rows: minmax(180px, auto);
    gap: 1.5rem;
}

@media (max-width: 1024px) {
    .bento-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 640px) {
    .bento-grid {
        grid-template-columns: 1fr;
    }
}

/* Glow Blobs */
.glow-blob {
    position: absolute;
    width: 400px;
    height: 400px;
    border-radius: 50%;
    filter: blur(80px);
    z-index: -1;
    opacity: 0.15;
    pointer-events: none;
    animation: floatBlob 8s ease-in-out infinite;
}

@keyframes floatBlob {
    0%, 100% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(30px, -30px) scale(1.05); }
    66% { transform: translate(-20px, 20px) scale(0.95); }
}

/* Gradient Text */
.gradient-text {
    background: linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #f472b6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

/* Custom Scrollbar */
::-webkit-scrollbar {
    width: 6px;
}
::-webkit-scrollbar-track {
    background: #020617;
}
::-webkit-scrollbar-thumb {
    background: #1e1b4b;
    border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
    background: #312e81;
}

/* Scroll Reveal Animations */
.reveal {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.reveal.active {
    opacity: 1;
    transform: translateY(0);
}

/* Staggered children animation */
.reveal-stagger > * {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.6s ease, transform 0.6s ease;
}

.reveal-stagger.active > *:nth-child(1) { transition-delay: 0.1s; opacity: 1; transform: translateY(0); }
.reveal-stagger.active > *:nth-child(2) { transition-delay: 0.2s; opacity: 1; transform: translateY(0); }
.reveal-stagger.active > *:nth-child(3) { transition-delay: 0.3s; opacity: 1; transform: translateY(0); }
.reveal-stagger.active > *:nth-child(4) { transition-delay: 0.4s; opacity: 1; transform: translateY(0); }
.reveal-stagger.active > *:nth-child(5) { transition-delay: 0.5s; opacity: 1; transform: translateY(0); }
.reveal-stagger.active > *:nth-child(6) { transition-delay: 0.6s; opacity: 1; transform: translateY(0); }

/* Toast notification for form feedback */
.toast {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    padding: 1rem 1.5rem;
    background: rgba(30, 30, 60, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(99, 102, 241, 0.3);
    border-radius: 12px;
    color: #f8fafc;
    font-size: 0.875rem;
    font-weight: 500;
    z-index: 9999;
    transform: translateY(100px);
    opacity: 0;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}

.toast.show {
    transform: translateY(0);
    opacity: 1;
}

.toast.success { border-color: rgba(52, 211, 153, 0.5); }
.toast.error { border-color: rgba(248, 113, 113, 0.5); }

/* Navbar scroll effect */
.nav-scrolled {
    background: rgba(2, 6, 23, 0.8) !important;
    backdrop-filter: blur(20px) !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}
`;
}

export function getBaseJS() {
  return `
// ═══════════════════════════════════════════════════
// Website Runtime — Fully Functional Client-Side JS
// ═══════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Website loaded successfully!');

    // ── 1. Scroll-Triggered Reveal Animations ──────────────
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => observer.observe(el));

    // ── 2. Smooth Scroll for ALL Anchor Links ──────────────
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            if (!href || href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // Close mobile nav if open
                const mobileNav = document.querySelector('.mobile-nav-open');
                if (mobileNav) mobileNav.classList.remove('mobile-nav-open');
            }
        });
    });

    // ── 3. Navbar Scroll Effect ────────────────────────────
    const nav = document.querySelector('nav, [data-nav]');
    if (nav) {
        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            if (scrollY > 50) {
                nav.classList.add('nav-scrolled');
            } else {
                nav.classList.remove('nav-scrolled');
            }
            lastScroll = scrollY;
        });
    }

    // ── 4. Form Handler — Full Validation + localStorage ───
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn?.textContent;

            // Disable button and show loading
            if (btn) {
                btn.textContent = 'Submitting...';
                btn.disabled = true;
                btn.style.opacity = '0.6';
            }

            // Simulate slight network delay for realism
            await new Promise(r => setTimeout(r, 800));

            try {
                const formData = Object.fromEntries(new FormData(form));
                
                // Validate required fields
                const inputs = form.querySelectorAll('[required]');
                let valid = true;
                inputs.forEach(input => {
                    if (!input.value.trim()) {
                        valid = false;
                        input.style.borderColor = '#ef4444';
                        input.addEventListener('input', () => {
                            input.style.borderColor = '';
                        }, { once: true });
                    }
                });

                if (!valid) {
                    showToast('Please fill in all required fields', 'error');
                    return;
                }

                // Email validation
                const emailField = form.querySelector('[type="email"]');
                if (emailField && emailField.value) {
                    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
                    if (!emailRegex.test(emailField.value)) {
                        showToast('Please enter a valid email address', 'error');
                        emailField.style.borderColor = '#ef4444';
                        return;
                    }
                }

                // Store submission in localStorage
                const submissions = JSON.parse(localStorage.getItem('formSubmissions') || '[]');
                submissions.push({
                    formId: form.id || 'unknown',
                    data: formData,
                    timestamp: new Date().toISOString()
                });
                localStorage.setItem('formSubmissions', JSON.stringify(submissions));

                // Success!
                showToast('🎉 Registration successful! We\\'ll be in touch soon.', 'success');
                form.reset();

                // Show a success state on the button temporarily
                if (btn) {
                    btn.textContent = '✓ Submitted!';
                    btn.style.opacity = '1';
                    setTimeout(() => {
                        btn.textContent = originalText;
                        btn.disabled = false;
                    }, 3000);
                }
            } catch (err) {
                showToast('Something went wrong. Please try again.', 'error');
            } finally {
                if (btn && btn.textContent !== '✓ Submitted!') {
                    btn.textContent = originalText;
                    btn.disabled = false;
                    btn.style.opacity = '1';
                }
            }
        });
    });

    // ── 5. CTA Button Click Tracking ───────────────────────
    document.querySelectorAll('a[href^="#"], button[data-target]').forEach(el => {
        el.addEventListener('click', () => {
            const clicks = JSON.parse(localStorage.getItem('ctaClicks') || '[]');
            clicks.push({
                text: el.textContent?.trim(),
                target: el.getAttribute('href') || el.dataset.target,
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('ctaClicks', JSON.stringify(clicks));
        });
    });

    // ── 6. External Link Handler ───────────────────────────
    // Links with data-href will open in new tab
    document.querySelectorAll('[data-href]').forEach(el => {
        el.style.cursor = 'pointer';
        el.addEventListener('click', () => {
            window.open(el.dataset.href, '_blank');
        });
    });
});

// ── Toast Notification System ──────────────────────────────
function showToast(message, type = 'success') {
    document.querySelectorAll('.toast').forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.innerHTML = \`
        <div style="display:flex;align-items:center;gap:10px;">
            <span style="font-size:1.2em;">\${type === 'success' ? '✅' : '⚠️'}</span>
            <span>\${message}</span>
        </div>
    \`;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}
`;
}
