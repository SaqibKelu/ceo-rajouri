/* ========================================
   Component Loader Utility
   Dynamically loads HTML components
   ======================================== */

class ComponentLoader {
    constructor() {
        this.componentsPath = 'components/';
        this.loadedComponents = new Set();
    }

    /**
     * Load a component into a specific element
     * @param {string} componentName - Name of the component file (without .html)
     * @param {string} targetSelector - CSS selector for target element
     * @param {Function} callback - Optional callback after component loads
     */
    async loadComponent(componentName, targetSelector, callback = null) {
        try {
            const target = document.querySelector(targetSelector);
            
            if (!target) {
                console.error(`Target element not found: ${targetSelector}`);
                return false;
            }

            // Check if component is already loaded
            if (this.loadedComponents.has(componentName)) {
                console.log(`Component already loaded: ${componentName}`);
                return true;
            }

            // Fetch the component HTML
            const response = await fetch(`${this.componentsPath}${componentName}.html`);
            
            if (!response.ok) {
                throw new Error(`Failed to load component: ${componentName}`);
            }

            const html = await response.text();
            
            // Insert the component HTML
            target.innerHTML = html;
            
            // Mark as loaded
            this.loadedComponents.add(componentName);
            
            console.log(`✓ Component loaded: ${componentName}`);
            
            // Execute callback if provided
            if (callback && typeof callback === 'function') {
                callback();
            }

            return true;

        } catch (error) {
            console.error(`Error loading component ${componentName}:`, error);
            return false;
        }
    }

    /**
     * Load multiple components at once
     * @param {Array} components - Array of {name, target, callback} objects
     */
    async loadComponents(components) {
        const promises = components.map(comp => 
            this.loadComponent(comp.name, comp.target, comp.callback)
        );
        
        try {
            await Promise.all(promises);
            console.log('✓ All components loaded successfully');
            return true;
        } catch (error) {
            console.error('Error loading components:', error);
            return false;
        }
    }

    /**
     * Reload a specific component
     */
    async reloadComponent(componentName, targetSelector) {
        this.loadedComponents.delete(componentName);
        return await this.loadComponent(componentName, targetSelector);
    }

    isLoaded(componentName) {
        return this.loadedComponents.has(componentName);
    }

    getLoadedComponents() {
        return Array.from(this.loadedComponents);
    }
}

// Create a global instance
const componentLoader = new ComponentLoader();

// Auto-load components when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🔄 Loading components...');
    
    const componentsToLoad = [
        {
            name: 'navbar',
            target: '#navbar-placeholder',
            callback: () => {
                if (typeof ActiveLinkHighlighter !== 'undefined') new ActiveLinkHighlighter();
                if (typeof DropdownHoverEffect !== 'undefined') new DropdownHoverEffect();
                if (typeof MobileMenuAutoClose !== 'undefined') new MobileMenuAutoClose();
                if (typeof ThemeManager !== 'undefined') new ThemeManager();
            }
        },
        {
            name: 'hero-carousel',
            target: '#hero-carousel-placeholder'
        },
        {
            name: 'news-ticker',
            target: '#news-ticker-placeholder'
        },
        {
            name: 'about-section',
            target: '#about-section-placeholder'
        },
        {
            name: 'latest-updates',
            target: '#latest-updates-placeholder',
            callback: () => {
                if (typeof initLatestUpdates === 'function') {
                    initLatestUpdates();
                }
            }
        },
        {
            name: 'featured-stories',
            target: '#featured-stories-placeholder'
        },
        {
            name: 'contact-social',
            target: '#contact-social-placeholder'
        },
        {
            name: 'footer',
            target: '#footer-placeholder'
        }
    ];

    await componentLoader.loadComponents(componentsToLoad);

    const event = new CustomEvent('componentsLoaded', {
        detail: { components: componentLoader.getLoadedComponents() }
    });
    document.dispatchEvent(event);
});

// Export if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ComponentLoader, componentLoader };
}
