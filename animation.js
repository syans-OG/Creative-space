gsap.registerPlugin(ScrollTrigger);
document.addEventListener('DOMContentLoaded', () => {

    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
    });

    window.lenis = lenis;

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);

    const loader = document.getElementById('loader');
    const loaderProgress = document.querySelector('.loader-progress');
    const loaderText = document.querySelector('.loader-text');

    if (loader) {
        document.body.style.overflow = 'hidden';

        const tlLoad = gsap.timeline();

        setTimeout(() => { document.body.style.overflow = ''; }, 5000);

        tlLoad.to(loaderProgress, {
            width: '100%',
            duration: 1.2,
            ease: 'power2.inOut'
        })
            .to(loaderText, {
                opacity: 0,
                y: -20,
                duration: 0.4,
                ease: 'power2.out'
            })
            .to(loader, {
                yPercent: -100,
                duration: 0.8,
                ease: 'expo.inOut',
                onStart: () => {
                    document.body.style.overflow = '';

                    try {
                        initHeroAnimations();
                    } catch (e) { console.error('Hero anim error', e); }

                    setTimeout(() => {
                        try { window.initGlobalAnimations(); } catch (e) { console.error('Global anim error', e); }
                    }, 50);
                }
            }, '-=0.2');

    } else {
        initGlobalAnimations();
        initHeroAnimations();
    }
});

window.initGlobalAnimations = function () {
    ScrollTrigger.refresh();

    const protectedSelectors = [
        '#loader', '#loader *',
        '.contact-NtoAGH', '.contact-NtoAGH *',
        '.doyouhavean-awesomeproject-ojgVmk',
        '.circular-projects', '.circular-projects *',
        '.logo-xGQ2i9', '.logo-xGQ2i9 *',
        'nav', 'nav *', '.navigasi-xl4bh6 *',
        '.projects-title-block', '.projects-title-block *',
        '.carousel-slide-title'
    ];

    const isProtected = (el) => {
        return protectedSelectors.some(sel => el.matches(sel) || el.closest(sel));
    };

    const headings = document.querySelectorAll('h1, h2, h3, .title, .section-title');
    headings.forEach(el => {
        if (el.dataset.animProcessed || isProtected(el)) return;
        el.setAttribute('data-anim-processed', 'true');
        if (!el.textContent.trim()) return;

        try {
            const split = new SplitType(el, { types: 'chars' });
            if (split.chars && split.chars.length > 0) {
                gsap.from(split.chars, {
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 85%',
                        toggleActions: 'play none none reverse'
                    },
                    y: 60, opacity: 0, rotate: 3, duration: 0.9, stagger: 0.02, ease: 'back.out(1.5)'
                });
            } else {
                gsap.from(el, { scrollTrigger: { trigger: el, start: 'top 85%' }, y: 40, opacity: 0, duration: 0.8 });
            }
        } catch (e) { console.warn('SplitType failed', el); }
    });

    const bodyTexts = document.querySelectorAll('p, li, .subtitle, .description, span');
    bodyTexts.forEach(el => {
        if (el.dataset.animProcessed || isProtected(el)) return;
        if (el.classList.contains('no-anim')) return;
        if (el.textContent.length < 5) return;

        el.setAttribute('data-anim-processed', 'true');

        try {
            const split = new SplitType(el, { types: 'lines' });
            if (!split.lines || split.lines.length === 0) throw new Error("Fallback");

            gsap.from(split.lines, {
                scrollTrigger: { trigger: el, start: 'top 92%', toggleActions: 'play none none reverse' },
                y: 30, opacity: 0, duration: 0.8, stagger: 0.08, ease: 'power2.out'
            });
        } catch (e) {
            gsap.from(el, {
                scrollTrigger: { trigger: el, start: 'top 92%', toggleActions: 'play none none reverse' },
                y: 20, opacity: 0, duration: 0.6, ease: 'power2.out'
            });
        }
    });

    const visuals = document.querySelectorAll('img, .project-card, .bento-item, .tool-icon, .rectangle-3-eSjKYj');
    visuals.forEach(el => {
        if (el.dataset.animProcessed || isProtected(el)) return;
        el.setAttribute('data-anim-processed', 'true');

        gsap.from(el, {
            scrollTrigger: { trigger: el, start: 'top 95%', toggleActions: 'play none none reverse' },
            opacity: 0, duration: 0.8, ease: 'power2.out'
        });
    });

    const buttons = document.querySelectorAll('.menu-item-ojgVmk, .carousel-slide-button, .role-reset-btn');
    buttons.forEach(el => {
        if (el.dataset.animProcessed || isProtected(el) || el.classList.contains('no-anim')) return;
        el.setAttribute('data-anim-processed', 'true');

        gsap.from(el, {
            scrollTrigger: { trigger: el, start: 'top 90%' },
            y: 15, opacity: 0, duration: 0.5, delay: 0.1, ease: 'power2.out'
        });
    });

    gsap.set('.logo-xGQ2i9 img, .contact-NtoAGH', { opacity: 1, visibility: 'visible' });

    try { initContactAnimations(); } catch (e) { console.warn('Contact anim error', e); }
};

function initHeroAnimations() {
    const prepare = (el) => {
        if (!el) return false;
        el.setAttribute('data-anim-processed', 'true');
        el.style.visibility = 'visible';
        el.style.opacity = '1';
        gsap.killTweensOf(el);
        return true;
    };

    const nav = document.querySelector('.navigasi-xl4bh6');
    const subtitle = document.querySelector('.welcome-to-my-VLhK4q');
    const title = document.querySelector('.title-VLhK4q');
    const bodyText = document.querySelector('.pleased-to-meet-you-VLhK4q');
    const statsBox = document.querySelector('.frame-2-VLhK4q');

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (nav) {
        nav.setAttribute('data-anim-processed', 'true');
        gsap.set(nav, { y: -50, opacity: 0 });
        tl.to(nav, { y: 0, opacity: 1, duration: 1 });
    }

    if (prepare(subtitle)) {
        let targets = subtitle;
        try {
            const split = new SplitType(subtitle, { types: 'lines' });
            if (split.lines && split.lines.length) targets = split.lines;
        } catch (e) { }

        gsap.set(targets, { y: 20, opacity: 0, filter: 'blur(5px)' });
        tl.to(targets, {
            y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.8, stagger: 0.1
        }, '-=0.5');
    }

    if (prepare(title)) {
        let chars = title;
        try {
            const split = new SplitType(title, { types: 'words, chars' });
            if (split.chars && split.chars.length) chars = split.chars;
        } catch (e) { }

        gsap.set(chars, { y: 80, rotate: 5, opacity: 0 });
        tl.to(chars, {
            y: 0, rotate: 0, opacity: 1, duration: 1.2, stagger: 0.03, ease: 'back.out(1.2)'
        }, '-=0.3');
    }

    if (prepare(bodyText)) {
        let lines = bodyText;
        try {
            const split = new SplitType(bodyText, { types: 'lines' });
            if (split.lines && split.lines.length) lines = split.lines;
        } catch (e) { }

        gsap.set(lines, { y: 20, opacity: 0 });
        tl.to(lines, { y: 0, opacity: 1, duration: 0.8, stagger: 0.05 }, '-=0.7');
    }

    if (prepare(statsBox)) {
        const group1 = statsBox.querySelector('.group-1-tIf7Ki');
        const group2 = statsBox.querySelector('.group-2-tIf7Ki');
        const num1 = statsBox.querySelector('.x5-ZuBCzc');
        const num2 = statsBox.querySelector('.x1-AVvs05');

        if (group1 && group2) {
            const groups = [group1, group2];

            gsap.set(groups, { y: 30, opacity: 0 });
            gsap.set(statsBox, { scale: 1, opacity: 1, filter: 'none' });

            const val1 = parseInt(num1?.innerText || '5');
            const val2 = parseInt(num2?.innerText || '1');
            if (num1) num1.innerText = "0";
            if (num2) num2.innerText = "0";

            tl.to(groups, {
                y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'back.out(1.2)'
            }, '-=0.5');

            if (num1) {
                tl.to(num1, {
                    innerText: val1, duration: 1.5, snap: { innerText: 1 }, ease: 'power1.out'
                }, '<');
            }
            if (num2) {
                tl.to(num2, {
                    innerText: val2, duration: 1.5, snap: { innerText: 1 }, ease: 'power1.out'
                }, '<+0.1');
            }
        } else {
            gsap.set(statsBox, { scale: 0.9, opacity: 0 });
            tl.to(statsBox, { scale: 1, opacity: 1, duration: 1, ease: 'expo.out' }, '-=0.5');
        }
    }
}

function initContactAnimations() {
    const contactSection = document.querySelector('.page-5-contact-xl4bh6');
    const blackBox = document.querySelector('.rectangle-27-ojgVmk');
    const title = document.querySelector('.doyouhavean-awesomeproject-ojgVmk');
    const subtitle = document.querySelector('.itstheperfecttimetogetstarted-ojgVmk');
    const btn = document.querySelector('.group-8-mrwcVv');
    const socials = document.querySelectorAll('.logo-xGQ2i9 a img');
    const copyright = document.querySelector('.x2025-allrightsreserv-xGQ2i9');

    if (!contactSection || !blackBox) return;

    const prepare = (el) => {
        if (!el) return;
        gsap.set(el, { opacity: 0, visibility: 'visible' });
    };

    prepare(blackBox);
    prepare(title);
    prepare(subtitle);
    prepare(btn);
    if (copyright) prepare(copyright);
    if (socials.length) gsap.set(socials, { opacity: 0, scale: 0.5, visibility: 'visible' });

    gsap.set(blackBox, { scale: 0.95, y: 30 });
    gsap.set(subtitle, { y: 15 });
    gsap.set(btn, { y: 15, scale: 0.9 });

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: contactSection,
            start: "top 70%",
            toggleActions: "play none none reverse"
        },
        defaults: { ease: "power2.out" }
    });

    tl.to(blackBox, {
        scale: 1, opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.1)"
    });

    if (title) {
        gsap.set(title, { y: 20 });
        tl.to(title, {
            y: 0, opacity: 1, duration: 0.4, ease: "power2.out"
        }, "-=0.25");
    }

    tl.to(subtitle, {
        y: 0, opacity: 1, duration: 0.3
    }, "-=0.2");

    tl.to(btn, {
        y: 0, opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.5)"
    }, "-=0.25");

    if (socials.length) {
        tl.to(socials, {
            scale: 1, opacity: 1,
            duration: 0.3, stagger: 0.03, ease: "back.out(1.5)"
        }, "-=0.15");
    }

    if (copyright) {
        tl.to(copyright, { opacity: 1, duration: 0.3 }, "-=0.2");
    }
}

