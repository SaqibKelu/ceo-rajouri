/* ========================================
   CEO Rajouri Website - Main JavaScript
   ======================================== */

// Theme Management
class ThemeManager {
    constructor() {
        this.themeToggleBtn = document.getElementById('themeToggle');
        this.htmlElement = document.documentElement;
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.init();
    }
    
    init() {
        this.setTheme(this.currentTheme);
        if (this.themeToggleBtn) {
            this.themeToggleBtn.addEventListener('click', () => this.toggleTheme());
        }
        this.watchSystemTheme();
    }
    
    setTheme(theme) {
        this.htmlElement.setAttribute('data-bs-theme', theme);
        this.currentTheme = theme;
        localStorage.setItem('theme', theme);
        if (this.themeToggleBtn) {
            const label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
            this.themeToggleBtn.setAttribute('aria-label', label);
        }
    }
    
    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
        this.themeToggleBtn?.classList.add('rotating');
        setTimeout(() => this.themeToggleBtn?.classList.remove('rotating'), 300);
    }
    
    watchSystemTheme() {
        if (!localStorage.getItem('theme')) {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) this.setTheme('dark');
        }
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }
}

// Navbar Scroll Effect
class NavbarScrollEffect {
    constructor() {
        this.navbar = document.querySelector('.navbar-custom');
        this.scrollThreshold = 50;
        this.init();
    }
    init() {
        window.addEventListener('scroll', () => this.handleScroll());
    }
    handleScroll() {
        if (!this.navbar) return;
        if (window.scrollY > this.scrollThreshold) {
            this.navbar.classList.add('scrolled');
        } else {
            this.navbar.classList.remove('scrolled');
        }
    }
}

// Active Link Highlighter
class ActiveLinkHighlighter {
    constructor() {
        this.navLinks = document.querySelectorAll('.navbar-nav .nav-link');
        this.currentPath = window.location.pathname.split('/').pop() || 'index.html';
        this.init();
    }
    init() {
        this.navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === this.currentPath) link.classList.add('active');
        });
    }
}

// Dropdown Hover Effect
class DropdownHoverEffect {
    constructor() {
        this.dropdowns = document.querySelectorAll('.navbar .dropdown');
        this.init();
    }
    init() {
        if (window.innerWidth > 991) {
            this.dropdowns.forEach(dropdown => {
                dropdown.addEventListener('mouseenter', function() {
                    const toggle = this.querySelector('.dropdown-toggle');
                    const menu = this.querySelector('.dropdown-menu');
                    toggle?.classList.add('show');
                    menu?.classList.add('show');
                });
                dropdown.addEventListener('mouseleave', function() {
                    const toggle = this.querySelector('.dropdown-toggle');
                    const menu = this.querySelector('.dropdown-menu');
                    toggle?.classList.remove('show');
                    menu?.classList.remove('show');
                });
            });
        }
    }
}

// Mobile Menu Auto-Close
class MobileMenuAutoClose {
    constructor() {
        this.navLinks = document.querySelectorAll('.navbar-nav .nav-link:not(.dropdown-toggle)');
        this.navbarCollapse = document.getElementById('navbarNav');
        this.init();
    }
    init() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth < 992 && this.navbarCollapse) {
                    const bsCollapse = bootstrap.Collapse.getInstance(this.navbarCollapse);
                    if (bsCollapse) bsCollapse.hide();
                }
            });
        });
    }
}

// Smooth Scroll
class SmoothScroll {
    constructor() {
        this.anchorLinks = document.querySelectorAll('a[href^="#"]');
        this.init();
    }
    init() {
        this.anchorLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && href !== '#') {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        const navbarHeight = document.querySelector('.navbar-custom')?.offsetHeight || 0;
                        const targetPosition = target.offsetTop - navbarHeight - 20;
                        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
                    }
                }
            });
        });
    }
}

// ========== Latest Updates Logic ==========

async function loadLatestFive({ jsonPath, pdfFolder, targetId }) {
    const container = document.getElementById(targetId);
    if (!container) return;

    try {
        const res = await fetch(jsonPath);
        if (!res.ok) throw new Error("Failed to load " + jsonPath);

        let data = await res.json();

        if (!Array.isArray(data) || data.length === 0) {
            container.innerHTML = `<p class="text-muted">No records found.</p>`;
            return;
        }

        // Sort by date (DD-MM-YYYY) newest first
        data.sort((a, b) => {
            const [da, ma, ya] = a.date.split("-").map(Number);
            const [db, mb, yb] = b.date.split("-").map(Number);
            return new Date(yb, mb - 1, db) - new Date(ya, ma - 1, da);
        });

        const latestFive = data.slice(0, 5);
        container.innerHTML = "";

        latestFive.forEach((item, index) => {
            const pdfPath = pdfFolder + item.file;
            const isNew = index === 0;

            const a = document.createElement("a");
            a.href = pdfPath;
            a.target = "_blank";
            a.className = "update-item" + (isNew ? " new" : "");

            a.innerHTML = `
                <div class="update-left">
                    <i class="bi bi-file-earmark-pdf text-danger"></i>
                    <span>${item.title}</span>
                </div>
                <div class="update-right">
                    ${isNew ? '<span class="badge-new">NEW</span>' : ''}
                    <span class="date">${item.date}</span>
                </div>
            `;

            container.appendChild(a);
        });

    } catch (err) {
        console.error(err);
        container.innerHTML = `<p class="text-danger">Failed to load data.</p>`;
    }
}

// Called by component-loader after latest-updates loads
function initLatestUpdates() {
    loadLatestFive({
        jsonPath: "assets/data/orders.json",
        pdfFolder: "resources/orders/",
        targetId: "ordersList"
    });
    loadLatestFive({
        jsonPath: "assets/data/notifications.json",
        pdfFolder: "resources/notifications/",
        targetId: "notificationsList"
    });
    loadLatestFive({
        jsonPath: "assets/data/circulars.json",
        pdfFolder: "resources/circulars/",
        targetId: "circularsList"
    });
    loadLatestFive({
        jsonPath: "assets/data/press-releases.json",
        pdfFolder: "resources/press-releases/",
        targetId: "pressList"
    });
}

// Init core features
document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
    new NavbarScrollEffect();
    new ActiveLinkHighlighter();
    new DropdownHoverEffect();
    new MobileMenuAutoClose();
    new SmoothScroll();

    console.log('🎓 CEO Rajouri Website Initialized');
});

// Resize handler
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        new DropdownHoverEffect();
    }, 250);
});

