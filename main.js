document.addEventListener('DOMContentLoaded', function () {

    const views = {
        home: document.getElementById('home-view'),
        projects: document.getElementById('projects-view'),
        projectDetail: document.getElementById('project-detail-view')
    };

    function getQueryParams() {
        const params = new URLSearchParams(window.location.search);
        return {
            view: params.get('view') || 'home',
            id: params.get('id')
        };
    }

    function updateView() {
        const { view, id } = getQueryParams();

        Object.values(views).forEach(el => {
            if (el) el.classList.remove('active');
        });

        let targetView = views.home;
        if (view === 'projects') targetView = views.projects;
        if (view === 'project-detail') targetView = views.projectDetail;

        if (targetView) {
            targetView.classList.add('active');

            if (view === 'project-detail' && id) {
                loadProjectDetail(id);
            }

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

        if (window.initGlobalAnimations) {
            setTimeout(window.initGlobalAnimations, 100);
        }
    }

    function loadProjectDetail(projectId) {
        if (typeof projectsData === 'undefined') return;

        const project = projectsData[projectId];
        const container = document.querySelector('.project-detail-container');

        if (project) {
            const detailTitle = document.getElementById('detail-title');
            detailTitle.textContent = project.title;
            detailTitle.setAttribute('data-anim-processed', 'true');
            detailTitle.style.opacity = '1';

            document.getElementById('detail-category').textContent = project.category;
            document.getElementById('detail-brief').textContent = project.brief;

            const rolesList = document.getElementById('detail-roles');
            rolesList.innerHTML = '';
            project.roles.forEach(role => {
                const li = document.createElement('li');
                li.textContent = role;
                rolesList.appendChild(li);
            });

            const deliverablesList = document.getElementById('detail-deliverables');
            deliverablesList.innerHTML = '';
            project.deliverables.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                deliverablesList.appendChild(li);
            });

            const galleryContainer = document.getElementById('detail-gallery');
            galleryContainer.innerHTML = '';
            galleryContainer.className = 'paul-gallery';

            const captions = project.imageCaptions || [];

            project.images.forEach((imgSrc, index) => {
                const item = document.createElement('div');
                item.className = 'paul-gallery-item';

                const caption = captions[index] || '';
                const captionHTML = caption ? `<div class="paul-gallery-caption">${caption}</div>` : '';

                item.innerHTML = `
                    ${captionHTML}
                    <img src="${imgSrc}" alt="${project.title} - ${caption || 'Image ' + (index + 1)}" class="gallery-image" loading="lazy">
                `;
                galleryContainer.appendChild(item);
            });

            renderMoreProjects(projectId);

            if (window._currentStackCleanup) {
                window._currentStackCleanup();
                window._currentStackCleanup = null;
            }

            container.style.display = 'block';
        } else {
            console.error('Project not found:', projectId);
        }
    }

    function renderMoreProjects(currentProjectId) {
        const container = document.getElementById('more-projects-grid');
        if (!container || typeof projectsData === 'undefined') return;

        container.innerHTML = '';

        const allKeys = Object.keys(projectsData).filter(key => key !== currentProjectId);

        const shuffled = allKeys.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 3);

        selected.forEach(key => {
            const project = projectsData[key];
            const thumbUrl = project.thumbnail ? project.thumbnail : (project.images[0] || '');
            const borderColor = project.cardColor || 'var(--color-dark)';

            const cardWrapper = document.createElement('div');

            cardWrapper.className = 'project_card';

            cardWrapper.style.border = `4px solid ${borderColor}`;
            cardWrapper.style.borderRadius = '16px';
            cardWrapper.style.overflow = 'hidden';

            cardWrapper.innerHTML = `
                <a href="/?view=project-detail&id=${key}" class="u-cover" data-link>
                    <div class="project_card_headline">
                        <div class="project_card_headline_inner">
                            <h3 class="project_card_title" data-anim-processed="true" style="opacity: 1;">${project.title}</h3>
                            <div class="project_card_infos">
                                <div class="subtitle">${project.category}</div>
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
            `;

            container.appendChild(cardWrapper);
        });
    }

    const transitionOverlay = document.createElement('div');
    transitionOverlay.className = 'page-transition-overlay';
    document.body.appendChild(transitionOverlay);

    setTimeout(() => {
        document.body.classList.add('is-entering');
        setTimeout(() => document.body.classList.remove('is-entering'), 1200);
    }, 10);

    document.addEventListener('click', function (e) {
        const link = e.target.closest('a[data-link]');

        if (link) {
            e.preventDefault();
            const href = link.getAttribute('href');

            const currentUrl = new URL(window.location);
            const targetUrl = new URL(href, window.location.href);

            const currentView = currentUrl.searchParams.get('view') || 'home';
            const targetView = targetUrl.searchParams.get('view') || 'home';
            const currentId = currentUrl.searchParams.get('id');
            const targetId = targetUrl.searchParams.get('id');

            if (link.id === 'nav-projects-link') {
                if (currentView === 'projects') {
                    if (window.lenis) { window.lenis.scrollTo(0); } else { window.scrollTo({ top: 0, behavior: 'smooth' }); }
                    return;
                }
                if (currentView === 'project-detail') {
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

            if (currentView === targetView && currentId === targetId) {
                window.history.pushState(null, null, href);

                if (targetUrl.hash) {
                    performSmoothScroll(targetUrl.hash);
                } else {
                    performSmoothScroll(0);
                }
                return;
            }

            document.body.classList.add('is-exiting');

            setTimeout(() => {
                window.history.pushState(null, null, href);
                updateView();
                document.body.classList.remove('is-exiting');
                document.body.classList.add('is-entering');

                setTimeout(() => {
                    document.body.classList.remove('is-entering');
                }, 1200);

            }, 600);
        }
    });

    window.addEventListener('popstate', function () {
        document.body.classList.add('is-exiting');
        setTimeout(() => {
            updateView();
            document.body.classList.remove('is-exiting');
            document.body.classList.add('is-entering');
            setTimeout(() => document.body.classList.remove('is-entering'), 1200);
        }, 600);
    });

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
                card.style.transform = "";
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

            cards.push(cards.shift());
            cards.forEach(c => stackElement.appendChild(c));

            updateStack();
            currentCard = null;
        }

        stackElement.addEventListener("pointerdown", onPointerDown);
        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", onPointerUp);

        updateStack();

        return () => {
            stackElement.removeEventListener("pointerdown", onPointerDown);
            window.removeEventListener("pointermove", onPointerMove);
            window.removeEventListener("pointerup", onPointerUp);
        };
    }

    function observeAnimations() {
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px 20% 0px',
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

    function initCircularProjects() {
        const circularProjects = document.getElementById('circular-projects');
        if (!circularProjects || typeof projectsData === 'undefined') return;

        circularProjects.innerHTML = '';

        const projectKeys = Object.keys(projectsData).slice(0, 7);

        projectKeys.forEach((key, index) => {
            const project = projectsData[key];
            const cssIndex = index % 12;

            const item = document.createElement('div');
            item.className = 'project-item';
            item.setAttribute('data-index', cssIndex);

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

        let currentRotation = 0;
        let scrollRotationTarget = 0;
        let autoRotationOffset = 0;
        let autoSpeed = 0.08;

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
            autoRotationOffset += autoSpeed;

            const finalTarget = autoRotationOffset + scrollRotationTarget;

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

        window.addEventListener('scroll', function () {
            const section = document.querySelector('.page-4-see-more-project-xl4bh6');
            if (!section) return;
            const rect = section.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;

            if (isVisible) {
                scrollRotationTarget = window.scrollY * 0.2;
            }
        });

        document.addEventListener('wheel', function (e) {
            const section = document.querySelector('.page-4-see-more-project-xl4bh6');
            if (section) {
                const rect = section.getBoundingClientRect();
                const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;

                if (isVisible) {
                    scrollRotationTarget += e.deltaY * 0.1;
                }
            }
        });
    }

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

    function initFeaturedProjects() {
        const container = document.getElementById('featured-carousel');
        const paginationCurrent = document.getElementById('carousel-current');
        const paginationTotal = document.getElementById('carousel-total');
        const prevBtn = document.getElementById('carousel-prev');
        const nextBtn = document.getElementById('carousel-next');
        const carouselContainer = document.querySelector('.featured-carousel-container');

        if (!container || typeof projectsData === 'undefined') return;

        container.innerHTML = '';

        const existingProgress = carouselContainer.querySelector('.carousel-progress-container');
        if (existingProgress) existingProgress.remove();

        const progressContainer = document.createElement('div');
        progressContainer.className = 'carousel-progress-container';
        progressContainer.innerHTML = '<div class="carousel-progress-bar"></div>';
        carouselContainer.appendChild(progressContainer);
        const progressBar = progressContainer.querySelector('.carousel-progress-bar');

        const projectKeys = Object.keys(projectsData).slice(0, 3);
        const totalProjects = projectKeys.length;

        if (paginationTotal) {
            paginationTotal.textContent = String(totalProjects).padStart(2, '0');
        }

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
                    <h3 class="carousel-slide-title" data-anim-processed="true" style="opacity: 1;">${project.title}</h3>
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

        let currentIndex = 0;
        let isScrolling = false;
        let autoSlideInterval;
        let startTime;
        let animationFrameId;
        const DURATION = 5000;

        function updatePagination() {
            if (paginationCurrent) {
                paginationCurrent.textContent = String(currentIndex + 1).padStart(2, '0');
            }
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

            const slides = container.querySelectorAll('.carousel-slide');
            const targetSlide = slides[index];
            if (targetSlide && typeof gsap !== 'undefined') {
                const content = targetSlide.querySelector('.carousel-slide-content');
                const title = targetSlide.querySelector('.carousel-slide-title');
                const desc = targetSlide.querySelector('.carousel-slide-description');
                const image = targetSlide.querySelector('.carousel-slide-image');
                const preview = targetSlide.querySelector('.carousel-slide-preview');

                gsap.set([content.children], { clearProps: 'all' });
                gsap.set(preview, { clipPath: 'inset(100% 0 0 0)' });
                gsap.set(image, { scale: 1.2 });

                if (typeof SplitType !== 'undefined') {
                    const splitDesc = new SplitType(desc, { types: 'lines' });

                    gsap.from(title, {
                        y: 50, opacity: 0, rotate: 10,
                        duration: 0.8, ease: 'back.out(1.7)', delay: 0.3
                    });

                    gsap.from(splitDesc.lines, {
                        y: 20, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power2.out', delay: 0.5
                    });
                } else {
                    gsap.from([title, desc], {
                        y: 30, opacity: 0, stagger: 0.1, duration: 0.8, delay: 0.3
                    });
                }

                const btn = targetSlide.querySelector('.carousel-slide-button');
                gsap.from(btn, {
                    y: 20, opacity: 0, duration: 0.6, delay: 0.7, ease: 'power2.out'
                });

                gsap.to(preview, {
                    clipPath: 'inset(0% 0 0 0)',
                    duration: 1.2,
                    ease: 'expo.inOut'
                });
                gsap.to(image, {
                    scale: 1,
                    duration: 1.4,
                    ease: 'power2.out'
                });
            }

            currentIndex = index;
            updatePagination();
            resetAutoSlide();

            setTimeout(() => {
                isScrolling = false;
            }, 500);
        }

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
                nextIndex = 0;
            }
            scrollToSlide(nextIndex);
        }

        function goPrev() {
            let prevIndex = currentIndex - 1;
            if (prevIndex < 0) {
                prevIndex = totalProjects - 1;
            }
            scrollToSlide(prevIndex);
        }

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
                    resetAutoSlide();
                }
            }, 150);
        };
        container.addEventListener('scroll', handleScroll);

        let touchStartX = 0;
        let touchEndX = 0;

        container.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            cancelAnimationFrame(animationFrameId);
        }, { passive: true });

        container.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
            startAutoSlide();
        }, { passive: true });

        function handleSwipe() {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) goNext();
                else goPrev();
            }
        }

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

        if (container._keydownHandler) {
            document.removeEventListener('keydown', container._keydownHandler);
        }
        container._keydownHandler = handleKeyDown;
        document.addEventListener('keydown', handleKeyDown);

        updatePagination();
        startAutoSlide();
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
        let currentThemeSection = null;

        activeBg.style.backgroundColor = '#f3f1ec';

        const setBackground = (value) => {
            if (inactiveBg.style.background === value) return;

            inactiveBg.style.background = value;

            inactiveBg.classList.add('active');
            inactiveBg.classList.remove('inactive');

            activeBg.classList.remove('active');
            activeBg.classList.add('inactive');

            const temp = activeBg;
            activeBg = inactiveBg;
            inactiveBg = temp;
        };

        const updateTheme = () => {
            if (window._skipThemeUpdate) return;

            const viewportCenter = window.innerHeight / 2;
            let centerSection = null;

            sections.forEach(section => {
                const rect = section.getBoundingClientRect();
                if (rect.top <= viewportCenter && rect.bottom >= viewportCenter) {
                    centerSection = section;
                }
            });

            if (!centerSection) {
                sections.forEach(section => {
                    const rect = section.getBoundingClientRect();
                    if (rect.top >= 0 && rect.top < window.innerHeight) {
                        centerSection = section;
                    }
                });
            }

            if (centerSection && centerSection !== currentThemeSection) {
                currentThemeSection = centerSection;
                const bg = centerSection.dataset.bg;
                const textMode = centerSection.dataset.text;

                setBackground(bg);

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

        window.addEventListener('scroll', () => {
            requestAnimationFrame(updateTheme);
        }, { passive: true });

        window.addEventListener('resize', updateTheme);
        updateTheme();

        document.querySelectorAll('a[href^="#"], .menu-item-ojgVmk').forEach(anchor => {
            anchor.addEventListener('click', () => {
                setTimeout(updateTheme, 100);
                setTimeout(updateTheme, 500);
                setTimeout(updateTheme, 1000);
            });
        });
    }

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
            if (!isExpanded) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                toggleBtn.setAttribute('aria-expanded', 'false');
                toggleBtn.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    function initAllProjectsGrid() {
        const container = document.getElementById('projects-grid');
        if (!container || typeof projectsData === 'undefined') return;

        container.innerHTML = '';

        Object.keys(projectsData).forEach(key => {
            const project = projectsData[key];

            let categoryId = 'website';
            const catLower = project.category.toLowerCase();
            if (catLower.includes('mobile') || catLower.includes('app')) categoryId = 'mobile';
            if (catLower.includes('ui/ux') || catLower.includes('design')) categoryId = 'uiux';

            const thumbUrl = project.thumbnail ? project.thumbnail : (project.images[0] || '');

            const gridItem = document.createElement('div');
            gridItem.className = 'grid_item project-grid-item';
            gridItem.setAttribute('data-category', categoryId);

            gridItem.innerHTML = `
                <div class="project_card">
                    <a href="/?view=project-detail&id=${key}" class="u-cover" data-link>
                        <div class="project_card_headline">
                            <div class="project_card_headline_inner">
                                <h3 class="project_card_title" data-anim-processed="true" style="opacity: 1;">${project.title}</h3>
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

        const items = container.querySelectorAll('.project-grid-item');
        items.forEach(item => {
            if (item.getAttribute('data-category') !== 'website') {
                item.classList.add('hidden');
            }
        });

        if (window.initGlobalAnimations) {
            setTimeout(window.initGlobalAnimations, 100);
        }
    }

    updateView();
    initCircularProjects();
    initAllProjectsGrid();
    initProjectSwitcher();
    initRoleSwitcher();
    initRoleSwitcher();
    initMobileMenu();
    initFeaturedProjects();

    let lenis;
    const initLenis = () => {
        if (typeof Lenis === 'undefined') return;

        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        if (typeof ScrollTrigger !== 'undefined') {
            lenis.on('scroll', ScrollTrigger.update);
            gsap.ticker.add((time) => {
                lenis.raf(time * 1000);
            });
            gsap.ticker.lagSmoothing(0);
        }
    };

    const initCustomCursor = () => {
        const cursor = document.querySelector('.custom-cursor');
        const follower = document.querySelector('.custom-cursor-follower');

        if (!cursor || !follower) return;

        let posX = 0, posY = 0;
        let mouseX = 0, mouseY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            cursor.style.left = mouseX + 'px';
            cursor.style.top = mouseY + 'px';
        });

        gsap.to({}, {
            duration: 0.016,
            repeat: -1,
            onRepeat: () => {
                posX += (mouseX - posX) / 9;
                posY += (mouseY - posY) / 9;

                follower.style.left = posX + 'px';
                follower.style.top = posY + 'px';
            }
        });

        const handleHover = () => {
            cursor.classList.add('hovered');
            follower.classList.add('hovered');
        };

        const handleLeave = () => {
            cursor.classList.remove('hovered');
            follower.classList.remove('hovered');
        };

        const hoverTargets = 'a, button, input, textarea, [data-link], .hover-scale, .menu-item-XtMdu3, .menu-item-4DfsaV, .menu-item-Cywxh7, .menu-item-8xqWWp';

        document.addEventListener('mouseover', (e) => {
            if (e.target.closest(hoverTargets)) handleHover();
        });

        document.addEventListener('mouseout', (e) => {
            if (e.target.closest(hoverTargets)) handleLeave();
        });
    };

    const initHeroAnimation = () => {
        if (typeof gsap === 'undefined' || typeof SplitType === 'undefined') return;

        const subtitle = new SplitType('.welcome-to-my-VLhK4q', { types: 'lines' });

        const tl = gsap.timeline();

        tl.from(subtitle.lines, {
            y: 50,
            opacity: 0,
            duration: 1,
            stagger: 0.1,
            ease: 'power3.out',
            delay: 0.5
        })
            .from('.title-VLhK4q', {
                y: 100,
                opacity: 0,
                rotate: 5,
                duration: 1,
                ease: 'back.out(1.7)'
            }, '-=0.5')
            .from('.pleased-to-meet-you-VLhK4q', {
                y: 30,
                opacity: 0,
                duration: 1,
                ease: 'power2.out'
            }, '-=0.5')
            .from('.frame-2-VLhK4q', {
                scale: 0.9,
                opacity: 0,
                duration: 1,
                ease: 'expo.out'
            }, '-=0.8');
    };

    const initLightbox = () => {
        const lightbox = document.getElementById('image-lightbox');
        if (!lightbox) return;

        const lightboxImg = document.getElementById('lightbox-image');
        const closeBtn = document.querySelector('.lightbox-close');

        const openLightbox = (src) => {
            lightboxImg.src = src;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        };

        const closeLightbox = () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
            setTimeout(() => {
                lightboxImg.src = '';
            }, 300);
        };

        document.addEventListener('click', (e) => {
            const bentoItem = e.target.closest('.bento-item');
            if (bentoItem) {
                const img = bentoItem.querySelector('img');
                if (img) {
                    openLightbox(img.src);
                }
            }
        });

        closeBtn.addEventListener('click', closeLightbox);

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                closeLightbox();
            }
        });
    };

    initLightbox();
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        initCustomCursor();
    }

});

function initThumbnailCarousel(container, images) {
    if (!container || !images || images.length === 0) return;

    container.innerHTML = `
            <div class="thumbnail-carousel-container">
                <div class="carousel-main-stage">
                    <div class="carousel-track">
                        ${images.map((src, i) => `
                            <div class="carousel-slide-item">
                                <img src="${src}" alt="Slide ${i + 1}" draggable="false" />
                            </div>
                        `).join('')}
                    </div>
                    <button class="carousel-nav-btn carousel-prev" aria-label="Previous">
                        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                    </button>
                    <button class="carousel-nav-btn carousel-next" aria-label="Next">
                        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                    </button>
                    <div class="carousel-counter">1 / ${images.length}</div>
                </div>
                <div class="thumbnail-strip">
                    ${images.map((src, i) => `
                        <button class="thumbnail-btn ${i === 0 ? 'active' : ''}" data-index="${i}">
                            <img src="${src}" alt="Thumb ${i + 1}" draggable="false" />
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

    const track = container.querySelector('.carousel-track');
    const prevBtn = container.querySelector('.carousel-prev');
    const nextBtn = container.querySelector('.carousel-next');
    const counter = container.querySelector('.carousel-counter');
    const thumbnailStrip = container.querySelector('.thumbnail-strip');
    const thumbBtns = container.querySelectorAll('.thumbnail-btn');
    const mainStage = container.querySelector('.carousel-main-stage');

    let currentIndex = 0;
    const totalSlides = images.length;

    const easing = 'cubic-bezier(0.25, 1, 0.5, 1)';

    function updateCarousel(duration = '0.5s') {
        track.style.transition = `transform ${duration} ${easing}`;
        track.style.transform = `translateX(-${currentIndex * 100}%)`;

        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex === totalSlides - 1;
        prevBtn.style.opacity = currentIndex === 0 ? '0.4' : '1';
        nextBtn.style.opacity = currentIndex === totalSlides - 1 ? '0.4' : '1';

        counter.textContent = `${currentIndex + 1} / ${totalSlides}`;

        thumbBtns.forEach((btn, i) => {
            const isActive = i === currentIndex;
            btn.classList.toggle('active', isActive);
        });

        const activeThumb = thumbBtns[currentIndex];
        if (activeThumb) {
            activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }

    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentIndex < totalSlides - 1) {
            currentIndex++;
            updateCarousel();
        }
    });

    thumbBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);
            if (index !== currentIndex) {
                currentIndex = index;
                updateCarousel();
            }
        });
    });

    let isDragging = false;
    let startX = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;

    mainStage.addEventListener('pointerdown', (e) => {
        if (e.target.closest('.carousel-nav-btn')) return;

        isDragging = true;
        startX = e.clientX;
        track.style.transition = 'none';
        mainStage.setPointerCapture(e.pointerId);
    });

    mainStage.addEventListener('pointermove', (e) => {
        if (!isDragging) return;
        const currentX = e.clientX;
        const diff = currentX - startX;

        const containerWidth = mainStage.offsetWidth;
        const baseOffset = -currentIndex * containerWidth;
        const currentOffset = baseOffset + diff;

        track.style.transform = `translateX(${currentOffset}px)`;
    });

    mainStage.addEventListener('pointerup', (e) => {
        if (!isDragging) return;
        isDragging = false;
        mainStage.releasePointerCapture(e.pointerId);

        const endX = e.clientX;
        const diff = endX - startX;
        const containerWidth = mainStage.offsetWidth;
        const threshold = containerWidth * 0.2;

        if (Math.abs(diff) > threshold) {
            if (diff > 0 && currentIndex > 0) {
                currentIndex--;
            } else if (diff < 0 && currentIndex < totalSlides - 1) {
                currentIndex++;
            }
        } else if (Math.abs(diff) < 5) {
        }

        updateCarousel();
    });

    mainStage.addEventListener('dragstart', (e) => e.preventDefault());

    updateCarousel('0s');
}


function performSmoothScroll(target, duration = 1.6) {
    const bgA = document.getElementById('bgA');
    const bgB = document.getElementById('bgB');

    window._skipThemeUpdate = true;

    if (bgA) bgA.style.transition = 'none';
    if (bgB) bgB.style.transition = 'none';

    document.body.style.color = '#161412';
    document.documentElement.style.setProperty('--color-dark', '#161412');
    document.documentElement.style.setProperty('--color-bg', '#f3f1ec');
    if (bgA) {
        bgA.style.backgroundColor = '#f3f1ec';
        bgA.classList.add('active');
        bgA.classList.remove('inactive');
    }
    if (bgB) {
        bgB.classList.remove('active');
        bgB.classList.add('inactive');
    }

    if (window.lenis) {
        let offsetVal = 0;

        if (typeof target === 'string') {
            const el = document.querySelector(target);
            if (el) {
                const elHeight = el.offsetHeight;
                const windowHeight = window.innerHeight;
                const spaceTop = Math.max(100, (windowHeight - elHeight) / 2);
                offsetVal = -spaceTop;
            }
        }

        const scrollOptions = { duration: duration };
        if (offsetVal !== 0) {
            scrollOptions.offset = offsetVal;
        }
        window.lenis.scrollTo(target, scrollOptions);
    } else {
        const el = typeof target === 'string' ? document.querySelector(target) : null;
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (target === 0) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    setTimeout(() => {
        window._skipThemeUpdate = false;
        if (bgA) bgA.style.transition = '';
        if (bgB) bgB.style.transition = '';

        if (window.updateTheme || (typeof updateTheme === 'function')) {
            try { window.updateTheme(); } catch (e) { }
        }
    }, duration * 1000 + 200);
}

function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    }, { passive: true });

    btn.addEventListener('click', () => {
        performSmoothScroll(0, 1.5);
    });
}

initBackToTop();
