/* main.js - extracted from index.html
   Contains initialization, nav behavior, smooth-scrolling, and highlighting.
*/
(function () {
    function init() {
        // ensure lucide icons are created (if loaded)
        if (window.lucide && typeof lucide.createIcons === 'function') {
            lucide.createIcons();
        }

        const navbar = document.getElementById('navbar');
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        const menuIcon = document.getElementById('menu-icon');

        // Smooth Scrolling Function — exported to window for inline handlers
        window.scrollToSection = function (id) {
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
                // Close mobile menu if open
                if (mobileMenu) mobileMenu.classList.add('hidden');
                if (menuIcon) menuIcon.setAttribute('data-lucide', 'menu');
                if (window.lucide && typeof lucide.createIcons === 'function') lucide.createIcons();
            }
        };

        // Active Section Highlighter (also exported)
        window.highlightNav = function () {
            // keep this list in sync with page sections
            const sections = ['home', 'about', 'skills', 'projects', 'achievements', 'certifications', 'contact'];
            const navLinks = document.querySelectorAll('.nav-link');

            let current = '';

            sections.forEach(section => {
                const element = document.getElementById(section);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    // 150px offset for better trigger timing
                    if (rect.top <= 150 && rect.bottom >= 150) {
                        current = section;
                    }
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('text-cyan-400');
                link.classList.add('text-slate-300');
                if (link.dataset.section === current) {
                    link.classList.remove('text-slate-300');
                    link.classList.add('text-cyan-400');
                }
            });
        };

        // Scroll effect
        if (typeof window !== 'undefined') {
            window.addEventListener('scroll', () => {
                if (!navbar) return;
                if (window.scrollY > 50) {
                    navbar.classList.add('bg-slate-900/95', 'backdrop-blur-md', 'shadow-lg', 'border-b', 'border-slate-800');
                    navbar.classList.remove('bg-transparent');
                } else {
                    navbar.classList.remove('bg-slate-900/95', 'backdrop-blur-md', 'shadow-lg', 'border-b', 'border-slate-800');
                    navbar.classList.add('bg-transparent');
                }
                // keep highlight in sync
                if (window.highlightNav) window.highlightNav();
            });
        }

        // Mobile Menu Toggle (safe-bind)
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => {
                if (!mobileMenu) return;
                mobileMenu.classList.toggle('hidden');
                // Toggle icon between menu and x
                if (menuIcon) {
                    if (mobileMenu.classList.contains('hidden')) {
                        menuIcon.setAttribute('data-lucide', 'menu');
                    } else {
                        menuIcon.setAttribute('data-lucide', 'x');
                    }
                    if (window.lucide && typeof lucide.createIcons === 'function') lucide.createIcons();
                }
            });
        }

        // Initial highlight run
        if (window.highlightNav) window.highlightNav();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
