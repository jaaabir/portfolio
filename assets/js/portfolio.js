import {
	animate,
	createTimeline,
	stagger,
	utils,
	createAnimatable,
} from "https://esm.sh/animejs@4";

const root = document.documentElement;
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Kill the no-JS fallback timer — the module reached the browser. */
clearTimeout(window.__revealFallback);

if (reduce) {
	root.classList.add("ready");
} else {
	boot();
}

function boot() {
	heroReveal();
	scrollReveals();
	sectionNav();
	headerState();
	scrollProgress();
	cursorGlow();
}

/* ---------- hero entrance ---------- */
function heroReveal() {
	const tl = createTimeline({ defaults: { ease: "outExpo" } });
	const lines = document.querySelectorAll(".hero-name .line-in");

	if (lines.length) {
		utils.set(lines, { y: "110%", opacity: 0 });
		tl.add(lines, {
			y: ["110%", 0],
			opacity: [0, 1],
			duration: 950,
			delay: stagger(95),
		});
	}

	tl.add(
		"[data-hero]",
		{
			opacity: [0, 1],
			y: [18, 0],
			duration: 700,
			delay: stagger(85),
		},
		lines.length ? "-=600" : 0,
	);
}

/* ---------- scroll-triggered reveals ---------- */
function scrollReveals() {
	const io = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (!entry.isIntersecting) return;
				const el = entry.target;
				io.unobserve(el);

				const kids = el.querySelectorAll("[data-child]");
				if (kids.length) {
					utils.set(el, { opacity: 1 });
					animate(kids, {
						opacity: [0, 1],
						y: [22, 0],
						duration: 720,
						ease: "outQuad",
						delay: stagger(70),
					});
				} else {
					animate(el, {
						opacity: [0, 1],
						y: [24, 0],
						duration: 760,
						ease: "outQuad",
					});
				}
			});
		},
		{ threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
	);

	document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));
}

/* ---------- active section in the nav ---------- */
function sectionNav() {
	const links = new Map();
	document.querySelectorAll(".nav-links a[href^='#']").forEach((a) => {
		links.set(a.getAttribute("href").slice(1), a);
	});

	const io = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (!entry.isIntersecting) return;
				links.forEach((a) => a.classList.remove("active"));
				links.get(entry.target.id)?.classList.add("active");
			});
		},
		{ rootMargin: "-45% 0px -50% 0px" },
	);

	links.forEach((_, id) => {
		const sec = document.getElementById(id);
		if (sec) io.observe(sec);
	});
}

/* ---------- header background on scroll ---------- */
function headerState() {
	const header = document.querySelector(".site-header");
	const onScrollY = () => header.classList.toggle("pinned", window.scrollY > 12);
	onScrollY();
	addEventListener("scroll", onScrollY, { passive: true });

	const toggle = document.querySelector(".nav-toggle");
	toggle?.addEventListener("click", () => header.classList.toggle("open"));
	header.querySelectorAll(".nav-links a").forEach((a) =>
		a.addEventListener("click", () => header.classList.remove("open")),
	);
}

/* ---------- top scroll-progress bar ---------- */
function scrollProgress() {
	const bar = document.querySelector(".scroll-progress");
	if (!bar) return;
	const update = () => {
		const h = document.documentElement.scrollHeight - innerHeight;
		bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
	};
	update();
	addEventListener("scroll", update, { passive: true });
	addEventListener("resize", update);
}

/* ---------- accent glow trailing the cursor ---------- */
function cursorGlow() {
	if (!matchMedia("(pointer: fine)").matches) return;
	const glow = document.querySelector(".cursor-glow");
	if (!glow) return;
	const follow = createAnimatable(glow, { x: 0, y: 0, ease: "out(4)" });
	const half = () => glow.offsetWidth / 2;
	addEventListener(
		"pointermove",
		(e) => {
			follow.x(e.clientX - half());
			follow.y(e.clientY - half());
		},
		{ passive: true },
	);
}
