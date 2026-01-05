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
            // Gallery - Card Stack Implementation
            const galleryContainer = document.getElementById('detail-gallery');
            galleryContainer.innerHTML = '';

            // Create Stack Container
            const stack = document.createElement('div');
            stack.className = 'card-stack';
            stack.id = 'cardStack';

            project.images.forEach((imgSrc, i) => {
                const card = document.createElement('div');
                card.className = 'card';
                // Add index for initial stacking
                card.dataset.index = i;

                const img = document.createElement('img');
                img.src = imgSrc;
                img.alt = `${project.title} - Image ${i + 1}`;
                img.draggable = false;

                card.appendChild(img);
                stack.appendChild(card);
            });

            galleryContainer.appendChild(stack);

            // Initialize Stack Logic
            if (window._currentStackCleanup) {
                window._currentStackCleanup();
            }
            window._currentStackCleanup = initCardStack(stack);

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

    function initCardStack(stackElement) {
        let cards = Array.from(stackElement.children);
        let isDragging = false;
        let startX = 0;
        let startY = 0;
        let currentCard = null;

        function updateStack() {
            cards.forEach((card, i) => {
                card.dataset.index = i;
                card.style.transition = "transform .35s cubic-bezier(.4,0,.2,1), filter .35s cubic-bezier(.4,0,.2,1)";
                card.style.transform = ""; // Reset inline transform to let CSS handle it
            });
        }

        function getFrontCard() {
            return cards[0];
        }

        function onPointerDown(e) {
            const card = getFrontCard();
            if (!card || e.target.closest('.card') !== card) return;

            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            currentCard = card;

            card.setPointerCapture(e.pointerId);
            card.style.transition = "none";
        }

        function onPointerMove(e) {
            if (!isDragging || !currentCard) return;

            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            currentCard.style.transform = `translate(${dx}px, ${dy}px) rotate(${dx * 0.05}deg)`;
        }

        function onPointerUp(e) {
            if (!isDragging || !currentCard) return;
            isDragging = false;

            currentCard.releasePointerCapture(e.pointerId);

            // pindahkan card depan ke belakang (always cycle on release, as per user request)
            cards.push(cards.shift());
            cards.forEach(c => stackElement.appendChild(c));

            updateStack();
            currentCard = null;
        }

        // Attach listeners
        stackElement.addEventListener("pointerdown", onPointerDown);
        window.addEventListener("pointermove", onPointerMove); // Window to catch drags outside
        window.addEventListener("pointerup", onPointerUp);

        // Initial update
        updateStack();

        // Cleanup function
        return () => {
            stackElement.removeEventListener("pointerdown", onPointerDown);
            window.removeEventListener("pointermove", onPointerMove);
            window.removeEventListener("pointerup", onPointerUp);
        };
    }


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

        // Rotation State
        let currentRotation = 0;       // The actual rotation value rendered
        let scrollRotationTarget = 0;  // The rotation value derived from user scroll/wheel
        let autoRotationOffset = 0;    // The continuously increasing auto-rotation value
        let autoSpeed = 0.08;           // Speed of auto-rotation (degrees per frame)

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
            // 1. Accumulate Auto Rotation
            autoRotationOffset += autoSpeed;

            // 2. Calculate Final Target (Auto + Scroll)
            // We want the scroll to essentially "scrub" or "add" to the auto flow
            const finalTarget = autoRotationOffset + scrollRotationTarget;

            // 3. Smooth Interpolation (Lerp) towards the final target
            // Note: Since autoRotationOffset changes every frame, this creates a constant 'pull'
            currentRotation += (finalTarget - currentRotation) * 0.1;

            currentRadius += (targetRadius - currentRadius) * 0.15;

            positionProjects(currentRotation, currentRadius);
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

            if (isVisible) {
                // Determine layout direction (Down vs Up) to feel natural
                scrollRotationTarget = window.scrollY * 0.2;
            }
        });

        document.addEventListener('wheel', function (e) {
            const section = document.querySelector('.page-4-see-more-project-xl4bh6');
            if (section) {
                const rect = section.getBoundingClientRect();
                const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;

                if (isVisible) {
                    // Accumulate wheel delta into the target
                    // Note: We act on scrollRotationTarget directly to persist the change
                    scrollRotationTarget += e.deltaY * 0.1;
                }
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

    // Featured Projects Carousel Logic
    function initFeaturedProjects() {
        const container = document.getElementById('featured-carousel');
        const paginationCurrent = document.getElementById('carousel-current');
        const paginationTotal = document.getElementById('carousel-total');
        const prevBtn = document.getElementById('carousel-prev');
        const nextBtn = document.getElementById('carousel-next');
        const carouselContainer = document.querySelector('.featured-carousel-container');

        if (!container || typeof projectsData === 'undefined') return;

        // Clear existing content
        container.innerHTML = '';

        // Remove existing progress bar if any
        const existingProgress = carouselContainer.querySelector('.carousel-progress-container');
        if (existingProgress) existingProgress.remove();

        // Add Progress Bar
        const progressContainer = document.createElement('div');
        progressContainer.className = 'carousel-progress-container';
        progressContainer.innerHTML = '<div class="carousel-progress-bar"></div>';
        carouselContainer.appendChild(progressContainer);
        const progressBar = progressContainer.querySelector('.carousel-progress-bar');

        // Get first 3 projects only
        const projectKeys = Object.keys(projectsData).slice(0, 3);
        const totalProjects = projectKeys.length;

        // Update total pagination
        if (paginationTotal) {
            paginationTotal.textContent = String(totalProjects).padStart(2, '0');
        }

        // Generate slides
        projectKeys.forEach((key, index) => {
            const project = projectsData[key];
            const thumbUrl = project.featuredThumbnail
                ? project.featuredThumbnail
                : (project.thumbnail ? project.thumbnail : (project.images[0] || ''));

            const slide = document.createElement('div');
            slide.className = 'carousel-slide';
            slide.setAttribute('data-index', index);

            slide.innerHTML = `
                <div class="carousel-slide-content">
                    <h3 class="carousel-slide-title">${project.title}</h3>
                    <p class="carousel-slide-description">${project.brief}</p>
                    <a href="/?view=project-detail&id=${key}" data-link class="carousel-slide-button">
                        VIEW PROJECT
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                    </a>
                </div>
                <div class="carousel-slide-preview">
                    <img src="${thumbUrl}" alt="${project.title}" class="carousel-slide-image" loading="lazy">
                </div>
            `;
            container.appendChild(slide);
        });

        // State Management
        let currentIndex = 0;
        let isScrolling = false;
        let autoSlideInterval;
        let startTime;
        let animationFrameId;
        const DURATION = 5000; // 5 seconds per slide

        function updatePagination() {
            if (paginationCurrent) {
                paginationCurrent.textContent = String(currentIndex + 1).padStart(2, '0');
            }
            // Loop mode: buttons are never disabled
            if (prevBtn) prevBtn.disabled = false;
            if (nextBtn) nextBtn.disabled = false;
        }

        function scrollToSlide(index, animate = true) {
            if (isScrolling) return;
            isScrolling = true;

            const slideWidth = container.offsetWidth;
            const targetScroll = index * slideWidth;

            container.scrollTo({
                left: targetScroll,
                behavior: animate ? 'smooth' : 'auto'
            });

            currentIndex = index;
            updatePagination();
            resetAutoSlide();

            setTimeout(() => {
                isScrolling = false;
            }, 500);
        }

        // Progress Bar Animation
        function animateProgress() {
            const now = Date.now();
            const elapsed = now - startTime;
            const progress = Math.min((elapsed / DURATION) * 100, 100);

            if (progressBar) {
                progressBar.style.width = `${progress}%`;
            }

            if (elapsed < DURATION) {
                animationFrameId = requestAnimationFrame(animateProgress);
            } else {
                // Time's up, go next
                goNext();
            }
        }

        function startAutoSlide() {
            cancelAnimationFrame(animationFrameId);
            startTime = Date.now();
            animateProgress();
        }

        function resetAutoSlide() {
            cancelAnimationFrame(animationFrameId);
            if (progressBar) progressBar.style.width = '0%';
            startAutoSlide();
        }

        function goNext() {
            let nextIndex = currentIndex + 1;
            if (nextIndex >= totalProjects) {
                nextIndex = 0; // Loop back to start
            }
            scrollToSlide(nextIndex);
        }

        function goPrev() {
            let prevIndex = currentIndex - 1;
            if (prevIndex < 0) {
                prevIndex = totalProjects - 1; // Loop to end
            }
            scrollToSlide(prevIndex);
        }

        // Event Listeners
        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                goPrev();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                goNext();
            });
        }

        // Scroll Handling (Manual Swipe)
        let scrollTimeout;
        const handleScroll = () => {
            if (isScrolling) return;

            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const scrollLeft = container.scrollLeft;
                const slideWidth = container.offsetWidth;
                const newIndex = Math.round(scrollLeft / slideWidth);

                if (newIndex !== currentIndex && newIndex >= 0 && newIndex < totalProjects) {
                    currentIndex = newIndex;
                    updatePagination();
                    resetAutoSlide(); // Reset timer on manual scroll
                }
            }, 150);
        };
        container.addEventListener('scroll', handleScroll);

        // Touch Interaction
        let touchStartX = 0;
        let touchEndX = 0;

        container.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            cancelAnimationFrame(animationFrameId); // Pause on touch
        }, { passive: true });

        container.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
            startAutoSlide(); // Resume on release
        }, { passive: true });

        function handleSwipe() {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) goNext(); // Swipe Left -> Next
                else goPrev(); // Swipe Right -> Prev
            }
        }

        // Keyboard Navigation
        const handleKeyDown = (e) => {
            const rect = container.getBoundingClientRect();
            const isInView = rect.top < window.innerHeight && rect.bottom > 0;
            if (!isInView) return;

            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                goPrev();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                goNext();
            }
        };

        // Cleanup & Init
        if (container._keydownHandler) {
            document.removeEventListener('keydown', container._keydownHandler);
        }
        container._keydownHandler = handleKeyDown;
        document.addEventListener('keydown', handleKeyDown);

        updatePagination();
        startAutoSlide(); // Start the loop
        observeAnimations();
        initScrollTheme();
    }

    function initScrollTheme() {
        const sections = document.querySelectorAll('[data-bg]');
        const bgA = document.getElementById('bgA');
        const bgB = document.getElementById('bgB');
        const body = document.body;

        if (!bgA || !bgB) return;

        let activeBg = bgA;
        let inactiveBg = bgB;
        let currentThemeSection = null; // Track current active section to avoid redundant updates

        // Initialize defaults
        activeBg.style.backgroundColor = '#f3f1ec';

        const setBackground = (value) => {
            if (inactiveBg.style.background === value) return; // Skip if same

            // Apply new color/gradient to the inactive layer
            inactiveBg.style.background = value;

            // Fade in inactive
            inactiveBg.classList.add('active');
            inactiveBg.classList.remove('inactive');

            // Fade out active
            activeBg.classList.remove('active');
            activeBg.classList.add('inactive');

            // Swap roles
            const temp = activeBg;
            activeBg = inactiveBg;
            inactiveBg = temp;
        };

        const updateTheme = () => {
            const viewportCenter = window.innerHeight / 2;
            let centerSection = null;

            // Find which section is crossing the center of the viewport
            sections.forEach(section => {
                const rect = section.getBoundingClientRect();
                // console.log(section.id, rect.top, rect.bottom, viewportCenter); // Debug
                if (rect.top <= viewportCenter && rect.bottom >= viewportCenter) {
                    centerSection = section;
                }
            });

            // Fallback: If no section crosses center (e.g. short page), check which one is visible at all
            if (!centerSection) {
                sections.forEach(section => {
                    const rect = section.getBoundingClientRect();
                    if (rect.top >= 0 && rect.top < window.innerHeight) {
                        centerSection = section;
                    }
                });
            }

            // If we found a section in the center and it's different from the last one
            if (centerSection && centerSection !== currentThemeSection) {
                console.log('Theme Switch:', centerSection.id, centerSection.dataset.text); // Debug Log
                currentThemeSection = centerSection;
                const bg = centerSection.dataset.bg;
                const textMode = centerSection.dataset.text;

                // Trigger Background Transition
                setBackground(bg);

                // Update Text Color and CSS Variables
                if (textMode === 'light') {
                    body.style.color = '#f3f1ec';
                    document.documentElement.style.setProperty('--color-dark', '#f3f1ec');
                    document.documentElement.style.setProperty('--color-bg', '#161412');
                } else {
                    body.style.color = '#161412';
                    document.documentElement.style.setProperty('--color-dark', '#161412');
                    document.documentElement.style.setProperty('--color-bg', '#f3f1ec');
                }
            }
        };

        // Attach Scroll Listener (Throttling handled by browser efficiently, but could add RAF)
        window.addEventListener('scroll', () => {
            requestAnimationFrame(updateTheme);
        }, { passive: true });

        // Force check on load and resize
        window.addEventListener('resize', updateTheme);
        updateTheme();

        // Navigation Click Logic: Force check after scroll
        document.querySelectorAll('a[href^="#"], .menu-item-ojgVmk').forEach(anchor => {
            anchor.addEventListener('click', () => {
                // Check multiple times during smooth scroll to ensure catch
                setTimeout(updateTheme, 100);
                setTimeout(updateTheme, 500);
                setTimeout(updateTheme, 1000);
            });
        });
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
            let categoryId = 'website'; // Default
            const catLower = project.category.toLowerCase();
            if (catLower.includes('mobile') || catLower.includes('app')) categoryId = 'mobile';
            if (catLower.includes('ui/ux') || catLower.includes('design')) categoryId = 'uiux';

            // Use thumbnail if available, otherwise first image
            const thumbUrl = project.thumbnail ? project.thumbnail : (project.images[0] || '');

            const gridItem = document.createElement('div');
            gridItem.className = 'grid_item project-grid-item'; // Added project-grid-item for filter logic compat
            gridItem.setAttribute('data-category', categoryId);

            gridItem.innerHTML = `
                <div class="project_card">
                    <a href="/?view=project-detail&id=${key}" class="u-cover" data-link>
                        <div class="project_card_headline">
                            <div class="project_card_headline_inner">
                                <h3 class="project_card_title">${project.title}</h3>
                                <div class="project_card_infos">
                                    <div class="subtitle">${project.category}</div>
                                    <div class="subtitle">2025</div>
                                </div>
                                <div class="project_card_headline_bg">
                                    <div class="project_discover">Discover case</div>
                                </div>
                            </div>
                        </div>
                        <div class="project_card_thumbnail">
                            <img src="${thumbUrl}" alt="${project.title}" loading="lazy" class="u-cover">
                        </div>
                    </a>
                </div>
            `;

            container.appendChild(gridItem);
        });

        // Re-trigger switcher to filter correctly on load
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