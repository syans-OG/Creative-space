document.addEventListener('DOMContentLoaded', function () {

    // ==========================================
    // 1. STATE & ROUTING
    // ==========================================

    const views = {
        home: document.getElementById('home-view'),
        projects: document.getElementById('projects-view'),
        projectDetail: document.getElementById('project-detail-view')
    };

    // Helper: Parse Query Params
    function getQueryParams() {
        const params = new URLSearchParams(window.location.search);
        return {
            view: params.get('view') || 'home',
            id: params.get('id')
        };
    }

    // Helper: Update View
    function updateView() {
        const { view, id } = getQueryParams();

        // 1. Hide all views
        Object.values(views).forEach(el => {
            if (el) el.classList.remove('active');
        });

        // 2. Determine target view
        let targetView = views.home; // Default
        if (view === 'projects') targetView = views.projects;
        if (view === 'project-detail') targetView = views.projectDetail;

        // 3. Show target view
        if (targetView) {
            targetView.classList.add('active');

            // Special Handler: Load Data for Project Detail
            if (view === 'project-detail' && id) {
                loadProjectDetail(id);
            }

            // Special Handler: Scroll to Hash if present
            const hash = window.location.hash;
            if (hash) {
                setTimeout(() => {
                    const el = document.querySelector(hash);
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            } else {
                window.scrollTo(0, 0);
            }
        }

        // Re-run animation observer for new content
        observeAnimations();
    }

    // ==========================================
    // 2. PROJECT DETAIL LOGIC
    // ==========================================

    function loadProjectDetail(projectId) {
        if (typeof projectsData === 'undefined') return;

        const project = projectsData[projectId];
        const container = document.querySelector('.project-detail-container');

        if (project) {
            document.getElementById('detail-title').textContent = project.title;
            document.getElementById('detail-category').textContent = project.category;
            document.getElementById('detail-brief').textContent = project.brief;

            // Roles
            const rolesList = document.getElementById('detail-roles');
            rolesList.innerHTML = '';
            project.roles.forEach(role => {
                const li = document.createElement('li');
                li.textContent = role;
                rolesList.appendChild(li);
            });

            // Deliverables
            const deliverablesList = document.getElementById('detail-deliverables');
            deliverablesList.innerHTML = '';
            project.deliverables.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                deliverablesList.appendChild(li);
            });

            // Gallery
            const galleryContainer = document.getElementById('detail-gallery');
            galleryContainer.innerHTML = '';
            project.images.forEach(imgSrc => {
                const img = document.createElement('img');
                img.className = 'gallery-image-large';
                img.src = imgSrc;
                img.alt = project.title;
                img.loading = 'lazy';
                img.style.objectFit = 'cover';
                galleryContainer.appendChild(img);
            });

            container.style.display = 'block';
        } else {
            console.error('Project not found:', projectId);
            // Optional: Show error or redirect
        }
    }


    // ==========================================
    // 3. TRANSITION & NAVIGATION LOGIC
    // ==========================================

    // Create Overlay
    const transitionOverlay = document.createElement('div');
    transitionOverlay.className = 'page-transition-overlay';
    document.body.appendChild(transitionOverlay);

    // Initial Load Animation
    setTimeout(() => {
        document.body.classList.add('is-entering');
        setTimeout(() => document.body.classList.remove('is-entering'), 1200);
    }, 10);

    // Global Click Listener for Navigation
    document.addEventListener('click', function (e) {
        const link = e.target.closest('a[data-link]');

        if (link) {
            e.preventDefault();
            const href = link.getAttribute('href');

            // Normalize views and IDs for comparison
            const currentUrl = new URL(window.location);
            const targetUrl = new URL(href, window.location.origin);

            const currentView = currentUrl.searchParams.get('view') || 'home';
            const targetView = targetUrl.searchParams.get('view') || 'home';
            const currentId = currentUrl.searchParams.get('id');
            const targetId = targetUrl.searchParams.get('id');

            // Dynamic Projects Link Logic
            if (link.id === 'nav-projects-link') {
                if (currentView === 'projects') {
                    // Already on projects view -> scroll to top
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    return;
                }
                if (currentView === 'project-detail') {
                    // On detail view -> go to projects view
                    document.body.classList.add('is-exiting');
                    setTimeout(() => {
                        window.history.pushState(null, null, '/?view=projects');
                        updateView();
                        document.body.classList.remove('is-exiting');
                        document.body.classList.add('is-entering');
                        setTimeout(() => document.body.classList.remove('is-entering'), 1200);
                    }, 600);
                    return;
                }
            }

            // If staying on the same view configuration (same view AND same ID)
            if (currentView === targetView && currentId === targetId) {
                // Just update URL and scroll (skip full page transition)
                window.history.pushState(null, null, href);

                if (targetUrl.hash) {
                    const el = document.querySelector(targetUrl.hash);
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
                return;
            }

            // Otherwise, FULL TRANSITION
            document.body.classList.add('is-exiting');

            setTimeout(() => {
                // 1. Change URL
                window.history.pushState(null, null, href);
                // 2. Update View (DOM)
                updateView();
                // 3. Reset Transition
                document.body.classList.remove('is-exiting');
                document.body.classList.add('is-entering');

                setTimeout(() => {
                    document.body.classList.remove('is-entering');
                }, 1200);

            }, 600); // 600ms match css transition
        }
    });

    // Handle Browser Back/Forward
    window.addEventListener('popstate', function () {
        // Simple wipe for history navigation too
        document.body.classList.add('is-exiting');
        setTimeout(() => {
            updateView();
            document.body.classList.remove('is-exiting');
            document.body.classList.add('is-entering');
            setTimeout(() => document.body.classList.remove('is-entering'), 1200);
        }, 600);
    });


    // ==========================================
    // 4. ANIMATION & INTERACTION UTILS
    // ==========================================

    function observeAnimations() {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                } else {
                    entry.target.classList.remove('is-visible');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.animate-on-scroll').forEach((el) => {
            observer.observe(el);
        });
    }

    // Circular Project Logic (Dynamic)
    function initCircularProjects() {
        const circularProjects = document.getElementById('circular-projects');
        if (!circularProjects || typeof projectsData === 'undefined') return;

        // Clear existing
        circularProjects.innerHTML = '';

        // Generate Items
        // Limit to 7 items for visual balance (as requested)
        const projectKeys = Object.keys(projectsData).slice(0, 7);

        projectKeys.forEach((key, index) => {
            const project = projectsData[key];
            // Cycle through CSS gradients (0-11)
            const cssIndex = index % 12;

            const item = document.createElement('div');
            item.className = 'project-item';
            item.setAttribute('data-index', cssIndex);

            // Use featuredThumbnail if available, otherwise thumbnail/image
            const thumbUrl = project.featuredThumbnail
                ? project.featuredThumbnail
                : (project.thumbnail ? project.thumbnail : (project.images[0] || ''));


            item.innerHTML = `
                <a href="/?view=project-detail&id=${key}" data-link>
                    <div class="project-card">
                        <div class="project-image">
                             <img src="${thumbUrl}" alt="Project" loading="lazy" style="width: 100%; height: 100%; object-fit: cover; display: ${thumbUrl ? 'block' : 'none'}">
                        </div>
                    </div>
                </a>
            `;
            circularProjects.appendChild(item);
        });


        const projectItems = document.querySelectorAll('.project-item');
        const seeMoreText = document.querySelector('.see-more-project-1adQlr');
        if (!projectItems.length) return;

        const totalProjects = projectItems.length;
        let rotation = 0;
        let targetRotation = 0;
        let currentRadius = 350;
        let targetRadius = 350;

        function positionProjects(rotationAngle, radius) {
            projectItems.forEach((item, index) => {
                const angle = (360 / totalProjects) * index + rotationAngle;
                const radian = (angle * Math.PI) / 180;
                const x = Math.cos(radian) * radius;
                const y = Math.sin(radian) * radius;
                item.style.transform = `translate(${x}px, ${y}px) rotate(${angle}deg)`;
            });
        }

        function animate() {
            rotation += (targetRotation - rotation) * 0.1;
            currentRadius += (targetRadius - currentRadius) * 0.15;
            positionProjects(rotation, currentRadius);
            requestAnimationFrame(animate);
        }
        animate();

        if (seeMoreText) {
            seeMoreText.addEventListener('mouseenter', function () { targetRadius = 250; });
            seeMoreText.addEventListener('mouseleave', function () { targetRadius = 350; });
        }

        // Scroll/Wheel logic
        window.addEventListener('scroll', function () {
            const section = document.querySelector('.page-4-see-more-project-xl4bh6');
            if (!section) return;
            const rect = section.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;
            if (isVisible) targetRotation = window.scrollY * 0.1;
        });

        document.addEventListener('wheel', function (e) {
            const section = document.querySelector('.page-4-see-more-project-xl4bh6');
            if (section) {
                const rect = section.getBoundingClientRect();
                const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;
                if (isVisible) targetRotation += e.deltaY * 0.05;
            }
        });
    }

    // Project Switcher Logic
    function initProjectSwitcher() {
        const switcherBtn = document.getElementById('project-switcher');
        const categoryText = document.getElementById('category-text');
        const items = document.querySelectorAll('.project-grid-item');
        if (!switcherBtn) return;

        const categories = [
            { id: 'website', label: 'WEBSITE' },
            { id: 'mobile', label: 'MOBILE APP' },
            { id: 'uiux', label: 'UI/UX DESIGN' }
        ];
        let currentIndex = 0;

        switcherBtn.addEventListener('click', function () {
            // Query dynamic items on every click to ensure we have the latest list
            const items = document.querySelectorAll('.project-grid-item');

            currentIndex = (currentIndex + 1) % categories.length;
            const nextCategory = categories[currentIndex];
            categoryText.classList.remove('role-text-animating');
            void categoryText.offsetWidth;
            categoryText.textContent = nextCategory.label;
            categoryText.setAttribute('data-category', nextCategory.id);
            categoryText.classList.add('role-text-animating');

            const icon = switcherBtn.querySelector('svg');
            if (icon) icon.style.transform = `rotate(${currentIndex * 180}deg)`;

            items.forEach(item => {
                if (item.getAttribute('data-category') === nextCategory.id) {
                    item.classList.remove('hidden');
                    item.style.opacity = '0';
                    setTimeout(() => item.style.opacity = '1', 50);
                } else {
                    item.classList.add('hidden');
                }
            });
        });
    }

    // Role Switcher Logic
    function initRoleSwitcher() {
        const roleText = document.getElementById('role-text');
        const roleResetBtn = document.getElementById('role-reset-btn');
        if (roleText && roleResetBtn) {
            const roles = ['DEVELOPER', 'UI/UX DESIGNER', 'CREATIVE CODER'];
            let currentRoleIndex = 0;
            roleResetBtn.addEventListener('click', function () {
                currentRoleIndex = (currentRoleIndex + 1) % roles.length;
                roleText.classList.remove('role-text-animating');
                void roleText.offsetWidth;
                roleText.textContent = roles[currentRoleIndex];
                roleText.classList.add('role-text-animating');
            });
        }
    }

    // Featured Projects Logic
    function initFeaturedProjects() {
        const container = document.getElementById('featured-projects-grid');
        if (!container || typeof projectsData === 'undefined') return;

        // Clear existing content to prevent duplication if re-run
        container.innerHTML = '';

        // Take only the first 3 projects
        const projectKeys = Object.keys(projectsData).slice(0, 3);

        projectKeys.forEach((key, index) => {
            const project = projectsData[key];
            const delay = (index + 1) * 100;

            // Use featuredThumbnail if available, then thumbnail, then first image
            const thumbUrl = project.featuredThumbnail
                ? project.featuredThumbnail
                : (project.thumbnail ? project.thumbnail : (project.images[0] || ''));

            // Create Link Wrapper
            const link = document.createElement('a');
            link.href = `/?view=project-detail&id=${key}`;
            link.setAttribute('data-link', '');
            // Reuse existing class for layout/animation
            // Note: reused group-4-IlxfIo as generic wrapper since it has relative position
            link.className = `group-4-IlxfIo animate-on-scroll fade-up delay-${delay} hover-lift`;
            link.style.display = 'block';

            link.innerHTML = `
                <div class="rectangle-12-kXDzSf">
                    <div class="rectangle-13-kXDzSf">
                        <img src="${thumbUrl}" alt="${project.title}" loading="lazy" style="width: 100%; height: 100%; object-fit: cover; border-radius: 27px;">
                    </div>
                    <h3 class="title-kXDzSf">${project.title}</h3>
                    <p class="lorem-ipsum-dolor-si">${project.brief.substring(0, 100)}${project.brief.length > 100 ? '...' : ''}</p>
                </div>
            `;

            container.appendChild(link);
        });

        // Re-observe animations for newly added elements
        observeAnimations();
    }

    // Mobile Navigation Logic
    function initMobileMenu() {
        const toggleBtn = document.getElementById('mobile-menu-toggle');
        const navMenu = document.getElementById('primary-navigation');
        const navLinks = document.querySelectorAll('.menu-item-C8wxvJ a');

        if (!toggleBtn || !navMenu) return;

        toggleBtn.addEventListener('click', () => {
            const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
            toggleBtn.setAttribute('aria-expanded', !isExpanded);
            toggleBtn.classList.toggle('active');
            navMenu.classList.toggle('active');
            // Toggle body scroll lock
            if (!isExpanded) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });

        // Close menu when clicking a link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                toggleBtn.setAttribute('aria-expanded', 'false');
                toggleBtn.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // MAIN PROJECTS GRID LOGIC (ALL PROJECTS)
    function initAllProjectsGrid() {
        const container = document.getElementById('projects-grid');
        if (!container || typeof projectsData === 'undefined') return;

        // Clear existing content
        container.innerHTML = '';

        Object.keys(projectsData).forEach(key => {
            const project = projectsData[key];

            // Determine Category ID for filtering
            // Simple logic: check if category string contains keywords
            let categoryId = 'website'; // Default
            const catLower = project.category.toLowerCase();
            if (catLower.includes('mobile') || catLower.includes('app')) categoryId = 'mobile';
            if (catLower.includes('ui/ux') || catLower.includes('design')) categoryId = 'uiux';
            // Explicitly force specific ones if needed, or rely on naming convention

            // Use thumbnail if available, otherwise first image
            const thumbUrl = project.thumbnail ? project.thumbnail : (project.images[0] || '');

            const link = document.createElement('a');
            link.href = `/?view=project-detail&id=${key}`;
            link.className = `project-grid-item`;
            // Note: We don't add 'hidden' initially so they show up. 
            // The switcher will hide them if they don't match the current active filter (default Website).

            link.setAttribute('data-category', categoryId);
            link.setAttribute('data-link', '');

            link.innerHTML = `
                <div class="project-thumbnail">
                    <img src="${thumbUrl}" alt="${project.title}" loading="lazy" style="width: 100%; height: 100%; object-fit: cover; border-radius: 20px;">
                </div>
                <h3 class="project-grid-title">${project.title}</h3>
            `;

            container.appendChild(link);
        });

        // Re-trigger switcher to filter correctly on load
        // We assume the switcher defaults to 'website', so let's trigger a click or simulate filter
        // Actually, let's just manually hide the non-websites initially to match default state
        const items = container.querySelectorAll('.project-grid-item');
        items.forEach(item => {
            if (item.getAttribute('data-category') !== 'website') {
                item.classList.add('hidden');
            }
        });

        // Re-observe animations for newly added elements
        observeAnimations();
    }

    // INITIALIZATION
    updateView(); // Set initial view
    initCircularProjects();
    initAllProjectsGrid(); // Load all projects FIRST so switchers can find them (redundancy)
    initProjectSwitcher();
    initRoleSwitcher();
    initRoleSwitcher();
    initMobileMenu(); // Mobile menu logic
    initFeaturedProjects(); // Load featured projects

});
