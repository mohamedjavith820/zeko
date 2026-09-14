import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/* ------------------------------------------------------------------ *
 *  ZEKO CONSULTANCY & CONSTRUCTION — Tbilisi, Georgia
 *
 *  Design concept: "Blueprint to daylight." The site opens on a dark,
 *  dramatic 3D construction scene (drafting-table mode) then breaks
 *  into a bright, energetic, two-tone daylight theme for the rest of
 *  the page — blue for the consultancy/planning side of the business,
 *  safety orange for the construction/build side — the same duality
 *  as high-vis workwear and site signage, applied as a brand system.
 *  Glass-surfaced cards, gradient CTAs, a soft construction-pattern
 *  backdrop, and two extra lightweight 3D accent objects (About band,
 *  CTA band) carry the "3D" idea past just the hero.
 * ------------------------------------------------------------------ */

const COLORS = {
  ink: "#11141B",
  paper: "#F5F7FB",
  surface: "#FFFFFF",
  border: "rgba(17,20,27,0.09)",
  muted: "#68707E",

  blue: "#2454E0",
  blueLight: "#5B8DEF",
  orange: "#FF6B2C",
  orangeLight: "#FF9459",

  heroBg: "#121419",
  heroBgDeep: "#0A0B0E",
  chalk: "#F7F4EC",
};

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const fn = (e) => setReduced(e.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return reduced;
}

/* ---------------------------- 3D HERO (dark, full-bleed) ------------------------------ */
function BlueprintSkyline() {
  const mountRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x121419, 14, 34);

    const camera = new THREE.PerspectiveCamera(42, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(7, 6, 12);
    camera.lookAt(0, 1.5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const grid = new THREE.GridHelper(30, 30, 0x384057, 0x1d2028);
    scene.add(grid);

    const cityGroup = new THREE.Group();
    const chalkMat = new THREE.LineBasicMaterial({ color: 0xf7f4ec, transparent: true, opacity: 0.78 });
    const blueMat = new THREE.LineBasicMaterial({ color: 0x5b8def, transparent: true, opacity: 0.95 });
    const orangeMat = new THREE.LineBasicMaterial({ color: 0xff8a4c, transparent: true, opacity: 1 });

    const layout = [
      { x: -6, z: -2, w: 1.4, d: 1.4, h: 3.2 },
      { x: -4, z: 1, w: 1.1, d: 1.1, h: 5.1, mat: "blue" },
      { x: -2, z: -1.5, w: 1.6, d: 1.6, h: 2.4 },
      { x: 0, z: 0.5, w: 1.3, d: 1.3, h: 6.4, mat: "orange" },
      { x: 2.1, z: -1, w: 1.5, d: 1.5, h: 3.8 },
      { x: 4, z: 1.2, w: 1.1, d: 1.1, h: 4.6, mat: "blue" },
      { x: 6, z: -0.5, w: 1.7, d: 1.7, h: 2.1 },
      { x: -0.2, z: 2.6, w: 1.0, d: 1.0, h: 1.6 },
      { x: 2.6, z: 2.2, w: 0.9, d: 0.9, h: 2.6, mat: "orange" },
    ];

    const buildings = layout.map((b) => {
      const geo = new THREE.BoxGeometry(b.w, b.h, b.d);
      const edges = new THREE.EdgesGeometry(geo);
      const mat = b.mat === "blue" ? blueMat : b.mat === "orange" ? orangeMat : chalkMat;
      const line = new THREE.LineSegments(edges, mat);
      line.position.set(b.x, b.h / 2, b.z);
      line.scale.y = reducedMotion ? 1 : 0.001;
      line.userData.targetH = b.h;
      line.userData.riseSpeed = 0.4 + Math.random() * 0.4;
      cityGroup.add(line);
      return line;
    });

    scene.add(cityGroup);
    scene.add(new THREE.AmbientLight(0x8892a6, 0.6));

    let raf;
    const clock = new THREE.Clock();
    function animate() {
      raf = requestAnimationFrame(animate);
      const dt = clock.getDelta();
      const t = clock.getElapsedTime();
      if (!reducedMotion) {
        buildings.forEach((line) => {
          if (line.scale.y < 1) {
            line.scale.y = Math.min(1, line.scale.y + dt * line.userData.riseSpeed);
            line.position.y = (line.userData.targetH * line.scale.y) / 2;
          }
        });
        cityGroup.rotation.y = Math.sin(t * 0.08) * 0.18 + t * 0.02;
      }
      renderer.render(scene, camera);
    }
    animate();

    function handleResize() {
      const w = mount.clientWidth, h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    const ro = new ResizeObserver(handleResize);
    ro.observe(mount);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      buildings.forEach((line) => { line.geometry.dispose(); });
      chalkMat.dispose(); blueMat.dispose(); orangeMat.dispose();
      grid.geometry.dispose(); grid.material.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [reducedMotion]);

  return <div ref={mountRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} aria-hidden="true" />;
}

/* ---------------------- MINI 3D ACCENT (compact, reused twice) --------------------- */
function MiniRig({ size = 220 }) {
  const mountRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 50);
    camera.position.set(0, 0, 6.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const blueMat = new THREE.LineBasicMaterial({ color: 0x2454e0, transparent: true, opacity: 0.9 });
    const orangeMat = new THREE.LineBasicMaterial({ color: 0xff6b2c, transparent: true, opacity: 0.9 });

    const geoA = new THREE.IcosahedronGeometry(1.7, 0);
    const outerCage = new THREE.LineSegments(new THREE.EdgesGeometry(geoA), blueMat);

    const geoB = new THREE.OctahedronGeometry(1.05, 0);
    const innerCage = new THREE.LineSegments(new THREE.EdgesGeometry(geoB), orangeMat);

    const group = new THREE.Group();
    group.add(outerCage, innerCage);
    scene.add(group);

    let raf;
    const clock = new THREE.Clock();
    function animate() {
      raf = requestAnimationFrame(animate);
      if (!reducedMotion) {
        const t = clock.getElapsedTime();
        outerCage.rotation.y = t * 0.35;
        outerCage.rotation.x = t * 0.18;
        innerCage.rotation.y = -t * 0.5;
        innerCage.rotation.x = t * 0.28;
      }
      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelAnimationFrame(raf);
      geoA.dispose(); geoB.dispose(); blueMat.dispose(); orangeMat.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [reducedMotion]);

  return <div ref={mountRef} style={{ width: size, height: size }} aria-hidden="true" />;
}

/* ------------------- CONSTRUCTION-PATTERN PAGE BACKDROP (illustrated, not a photo) ------------------- */
function PageBackdrop() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }} aria-hidden="true">
      <div style={{
        position: "absolute", top: "-10%", right: "-8%", width: 560, height: 560, borderRadius: "50%",
        background: `radial-gradient(circle, ${COLORS.blue}22, transparent 70%)`, filter: "blur(10px)",
      }} />
      <div style={{
        position: "absolute", bottom: "-12%", left: "-6%", width: 620, height: 620, borderRadius: "50%",
        background: `radial-gradient(circle, ${COLORS.orange}20, transparent 70%)`, filter: "blur(10px)",
      }} />
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.05 }}>
        <defs>
          <pattern id="zk-grid" width="46" height="46" patternUnits="userSpaceOnUse">
            <path d="M46 0H0V46" fill="none" stroke={COLORS.ink} strokeWidth="1" />
          </pattern>
          <pattern id="zk-crane" width="320" height="320" patternUnits="userSpaceOnUse">
            <g stroke={COLORS.ink} strokeWidth="1.4" fill="none" opacity="0.9">
              <path d="M40 280V120l110-55v40M40 130h130" />
              <path d="M150 105v10M40 160h20M40 200h20M40 240h20" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#zk-grid)" />
        <rect width="100%" height="100%" fill="url(#zk-crane)" />
      </svg>
    </div>
  );
}

/* ------------------------- 3D WORDMARK (interactive, CSS-extruded) ------------------------- */
function Wordmark3D({ text = "ZEKO" }) {
  const wrapRef = useRef(null);
  const [tilt, setTilt] = useState({ rx: 10, ry: -14 });
  const reducedMotion = useReducedMotion();

  const onMove = (e) => {
    if (reducedMotion) return;
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setTilt({ rx: 22 - py * 32, ry: -22 + px * 44 });
  };
  const onLeave = () => setTilt({ rx: 10, ry: -14 });

  // Build extrusion layers: stacked duplicate letters offset diagonally,
  // drawn back-to-front, colour-ramped from ink (back) through blue then
  // orange (mid-depth) to chalk white (front face, on top).
  const depth = 12;
  const backLayers = Array.from({ length: depth }, (_, i) => depth - i); // depth..1, back to front

  return (
    <div
      ref={wrapRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ perspective: 900, display: "inline-block", cursor: "default" }}
      aria-hidden="true"
    >
      <div
        style={{
          position: "relative",
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          transition: "transform .4s cubic-bezier(.2,.8,.3,1)",
          transformStyle: "preserve-3d",
          fontFamily: "'Big Shoulders Display', sans-serif",
          fontWeight: 800,
          fontSize: "clamp(2.8rem, 9vw, 6.5rem)",
          letterSpacing: 2,
          lineHeight: 1,
          userSelect: "none",
        }}
      >
        {backLayers.map((i) => {
          const t = i / depth; // 1 at back, ~0.08 nearest front of the extrusion
          const color =
            t > 0.5 ? mixHex("#2454E0", "#121419", (t - 0.5) / 0.5) : mixHex("#FF6B2C", "#2454E0", t / 0.5);
          return (
            <span
              key={i}
              style={{
                position: "absolute", left: 0, top: 0,
                transform: `translate3d(${-i * 1.1}px, ${i * 1.1}px, ${-i}px)`,
                color,
              }}
            >
              {text}
            </span>
          );
        })}
        <span
          style={{
            position: "relative",
            color: COLORS.chalk,
            WebkitTextStroke: "1px rgba(255,255,255,0.18)",
          }}
        >
          {text}
        </span>
      </div>
    </div>
  );
}

function mixHex(a, b, t) {
  const pa = hexToRgb(a), pb = hexToRgb(b);
  const r = Math.round(pa.r + (pb.r - pa.r) * t);
  const g = Math.round(pa.g + (pb.g - pa.g) * t);
  const bl = Math.round(pa.b + (pb.b - pa.b) * t);
  return `rgb(${r},${g},${bl})`;
}
function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
}

/* --------------------------- ICONS (inline svg, no emoji) --------------------------- */
const Icon = {
  compass: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 8.5 13 13l-4.5 2.5L11 11l4.5-2.5Z" />
    </svg>
  ),
  document: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M6 3h9l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M14 3v5h5M8 12h8M8 16h8M8 8h3" />
    </svg>
  ),
  blueprint: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M4 20V6l6-3 6 3v14" />
      <path d="M4 6h12M4 20h16M16 20V9l4-2v13" />
    </svg>
  ),
  building: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="4" y="9" width="8" height="12" />
      <rect x="12" y="3" width="8" height="18" />
      <path d="M6.5 12h3M6.5 15h3M6.5 18h3M14.5 6h3M14.5 9h3M14.5 12h3M14.5 15h3" />
    </svg>
  ),
  crane: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M5 21V8l9-5v6M5 8h13M15 9v3M3 21h14M9 21v-6h4v6" />
    </svg>
  ),
  wrench: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.8 2.8-2-2 2.8-2.8Z" />
    </svg>
  ),
  scale: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M12 3v18M7 7l-4 8a4 4 0 0 0 8 0l-4-8ZM17 7l-4 8a4 4 0 0 0 8 0l-4-8ZM4 21h16M6 7h12" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  ),
  pin: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 21s7-6.6 7-12a7 7 0 1 0-14 0c0 5.4 7 12 7 12Z" />
      <circle cx="12" cy="9" r="2.4" />
    </svg>
  ),
};

/* ----------------------------- DATA (unchanged) ----------------------------- */
const CONSULTANCY_SERVICES = [
  { icon: "compass", title: "Feasibility & investment advisory", text: "Site analysis, cost modelling and return projections before you commit capital." },
  { icon: "document", title: "Permits & licensing", text: "We navigate Tbilisi's planning process so approvals don't stall your timeline." },
  { icon: "scale", title: "Real estate advisory", text: "Acquisition, valuation and disposal guidance for residential and commercial assets." },
  { icon: "blueprint", title: "Architectural planning", text: "Concept design and technical drawings, coordinated with structural and MEP teams." },
];

const CONSTRUCTION_SERVICES = [
  { icon: "building", title: "Residential & commercial build", text: "Ground-up construction from foundation to final finish, on schedule." },
  { icon: "wrench", title: "Renovation & fit-out", text: "Full or partial renovation of existing structures, occupied or vacant." },
  { icon: "crane", title: "Site & project management", text: "One point of accountability across contractors, suppliers and inspectors." },
  { icon: "blueprint", title: "Structural & MEP execution", text: "Engineering-grade execution of structural, mechanical and electrical works." },
];

const PROCESS = [
  { n: "01", title: "Consult", text: "We assess the site, the budget and the goal, and tell you honestly what's realistic." },
  { n: "02", title: "Design", text: "Architectural and engineering drawings developed to buildable, permit-ready detail." },
  { n: "03", title: "Permit", text: "We manage submissions and approvals with the relevant Tbilisi authorities." },
  { n: "04", title: "Build", text: "Construction proceeds against a fixed program, with weekly site reporting." },
  { n: "05", title: "Handover", text: "Snagging, documentation and a full handover pack — nothing left loose." },
];

const PROJECTS = [
  { name: "Vake Residence", type: "Private residential — 340 m²", tag: "Build" },
  { name: "Kazbegi Avenue Fit-Out", type: "Commercial office — 610 m²", tag: "Fit-out" },
  { name: "Saburtalo Retail Block", type: "Mixed-use retail — 890 m²", tag: "Consult + Build" },
  { name: "Mtatsminda Villa", type: "Heritage renovation — 260 m²", tag: "Renovation" },
];

const STATS = [
  { n: "120+", l: "Projects delivered" },
  { n: "14", l: "Years in Georgia" },
  { n: "6", l: "Districts of Tbilisi active" },
  { n: "0", l: "Missed permit deadlines" },
];

/* ----------------------------- APP ----------------------------- */
export default function ZekoSite() {
  const [navSolid, setNavSolid] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setNavSolid(window.scrollY > 40);
      setPastHero(window.scrollY > window.innerHeight * 0.7);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@500;700;800&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; }

        .zk-fade { animation: zkFadeUp 0.9s ease both; }
        @keyframes zkFadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @media (prefers-reduced-motion: reduce) { .zk-fade { animation: none; } }

        button:focus-visible, a:focus-visible, input:focus-visible, textarea:focus-visible, [tabindex]:focus-visible {
          outline: 2px solid ${COLORS.orange}; outline-offset: 2px;
        }
        ::selection { background: ${COLORS.orange}; color: #fff; }

        /* ---- Glass cards, 3D tilt on hover ---- */
        .zk-card {
          position: relative;
          transition: transform .3s cubic-bezier(.2,.8,.3,1), box-shadow .3s ease, border-color .3s ease;
          transform-style: preserve-3d;
        }
        .zk-card:hover {
          transform: perspective(900px) rotateX(3deg) translateY(-6px);
          box-shadow: 0 26px 44px -20px rgba(17,20,27,0.22);
        }
        .zk-card:active { transform: perspective(900px) rotateX(1deg) translateY(-2px) scale(0.99); }
        .zk-card.zk-card-blue:hover { border-color: ${COLORS.blue} !important; box-shadow: 0 26px 44px -20px rgba(36,84,224,0.28); }
        .zk-card.zk-card-orange:hover { border-color: ${COLORS.orange} !important; box-shadow: 0 26px 44px -20px rgba(255,107,44,0.28); }

        .zk-link { position: relative; color: ${COLORS.ink}; }
        .zk-link::after { content:''; position:absolute; left:0; bottom:-4px; width:0; height:2px; background: linear-gradient(90deg, ${COLORS.blue}, ${COLORS.orange}); transition: width .25s ease; }
        .zk-link:hover::after { width: 100%; }

        /* ---- Advanced buttons: gradient shift + shine sweep + press feedback ---- */
        .zk-btn-primary {
          position: relative; overflow: hidden; isolation: isolate;
          background: linear-gradient(120deg, ${COLORS.blue}, ${COLORS.orange});
          background-size: 180% 180%; background-position: 0% 50%;
          box-shadow: 0 10px 24px -10px rgba(36,84,224,0.5);
          transition: background-position .5s ease, transform .2s ease, box-shadow .2s ease;
        }
        .zk-btn-primary::before {
          content: ''; position: absolute; inset: 0; z-index: -1;
          background: linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.55) 40%, transparent 60%);
          transform: translateX(-120%); transition: transform .6s ease;
        }
        .zk-btn-primary:hover { background-position: 100% 50%; transform: translateY(-3px); box-shadow: 0 16px 32px -10px rgba(255,107,44,0.55); }
        .zk-btn-primary:hover::before { transform: translateX(120%); }
        .zk-btn-primary:active { transform: translateY(-1px) scale(0.97); box-shadow: 0 6px 14px -6px rgba(36,84,224,0.5); }

        .zk-btn-ghost {
          transition: background .2s ease, border-color .2s ease, transform .2s ease, color .2s ease;
        }
        .zk-btn-ghost:hover { background: rgba(36,84,224,0.06); border-color: ${COLORS.blue} !important; color: ${COLORS.blue}; transform: translateY(-3px); }
        .zk-btn-ghost:active { transform: translateY(-1px) scale(0.97); background: rgba(36,84,224,0.12); }

        .zk-btn-dark {
          transition: background .2s ease, transform .2s ease, box-shadow .2s ease;
          box-shadow: 0 8px 20px -10px rgba(0,0,0,0.5);
        }
        .zk-btn-dark:hover { transform: translateY(-3px); box-shadow: 0 14px 28px -10px rgba(0,0,0,0.6); background: #1c1f27; }
        .zk-btn-dark:active { transform: translateY(-1px) scale(0.97); }

        @media (max-width: 900px) {
          .zk-nav-links, .zk-nav-cta { display: none !important; }
          .zk-burger { display: flex !important; }
          .zk-about-grid, .zk-contact-grid { grid-template-columns: 1fr !important; }
          .zk-services-split { grid-template-columns: 1fr !important; }
          .zk-service-divider { display: none !important; }
          .zk-hero-stats { display: none !important; }
          .zk-mini-rig { display: none !important; }
        }
        @media (max-width: 560px) {
          .zk-process-row { flex-direction: column; }
          .zk-process-tick { display: none !important; }
        }
      `}</style>

      <PageBackdrop />

      {/* ---------------- NAV ---------------- */}
      <header
        style={{
          ...styles.nav,
          background: navSolid ? (pastHero ? "rgba(255,255,255,0.85)" : "rgba(10,11,14,0.85)") : "transparent",
          borderBottom: navSolid ? `1px solid ${pastHero ? COLORS.border : "rgba(255,255,255,0.1)"}` : "1px solid transparent",
          backdropFilter: navSolid ? "blur(10px)" : "none",
        }}
      >
        <div style={styles.navInner}>
          <div style={styles.logo} onClick={() => scrollTo("top")}>
            <span style={{ ...styles.logoMark, borderColor: COLORS.orange, color: COLORS.orange }}>Z</span>
            <span style={{ ...styles.logoWord, color: pastHero ? COLORS.ink : COLORS.chalk }}>
              ZEKO
              <span style={styles.logoSub}>CONSULTANCY &amp; CONSTRUCTION</span>
            </span>
          </div>

          <nav className="zk-nav-links" style={styles.navLinks}>
            {["Services", "Process", "Projects", "About", "Contact"].map((label) => (
              <span
                key={label}
                className="zk-link"
                style={{ ...styles.navLink, color: pastHero ? COLORS.ink : COLORS.chalk }}
                onClick={() => scrollTo(label.toLowerCase())}
              >
                {label}
              </span>
            ))}
          </nav>

          <button className="zk-btn-primary zk-nav-cta" style={styles.navCta} onClick={() => scrollTo("contact")}>
            Book a consultation
          </button>

          <button aria-label="Toggle menu" className="zk-burger" style={{ ...styles.burger, borderColor: pastHero ? COLORS.ink : COLORS.chalk }} onClick={() => setMenuOpen((v) => !v)}>
            <span style={{ ...styles.burgerLine, background: pastHero ? COLORS.ink : COLORS.chalk }} />
            <span style={{ ...styles.burgerLine, background: pastHero ? COLORS.ink : COLORS.chalk }} />
            <span style={{ ...styles.burgerLine, background: pastHero ? COLORS.ink : COLORS.chalk }} />
          </button>
        </div>

        {menuOpen && (
          <div style={styles.mobileMenu}>
            {["Services", "Process", "Projects", "About", "Contact"].map((label) => (
              <div key={label} style={styles.mobileLink} onClick={() => scrollTo(label.toLowerCase())}>
                {label}
              </div>
            ))}
          </div>
        )}
      </header>

      {/* ---------------- HERO (dark, full 3D) ---------------- */}
      <section id="top" style={styles.hero}>
        <BlueprintSkyline />
        <div style={styles.heroGridOverlay} aria-hidden="true" />
        <svg width="100%" height="100%" style={styles.heroCraneOverlay} aria-hidden="true">
          <defs>
            <pattern id="zk-hero-crane" width="360" height="360" patternUnits="userSpaceOnUse">
              <g stroke={COLORS.chalk} strokeWidth="1.2" fill="none" opacity="0.9">
                <path d="M50 320V150l130-65v45M50 165h150" />
                <path d="M172 130v12M50 200h24M50 240h24M50 280h24" />
                <circle cx="172" cy="118" r="4" fill={COLORS.orangeLight} stroke="none" />
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#zk-hero-crane)" />
        </svg>
        <div style={styles.heroContent} className="zk-fade">
          <div style={styles.heroEyebrowRow}>
            {Icon.pin}
            <span style={styles.heroEyebrowText}>Tbilisi, Georgia</span>
          </div>
          <div style={styles.wordmarkWrap}>
            <Wordmark3D text="ZEKO" />
          </div>
          <h1 style={styles.h1}>
            We draft it.
            <br />
            We build it.
            <br />
            We stand behind it.
          </h1>
          <p style={styles.heroSub}>
            Zeko is a Tbilisi-based practice that carries a project from feasibility
            study to finished structure — one team, one contract, one point of
            accountability.
          </p>
          <div style={styles.heroBtnRow}>
            <button className="zk-btn-primary" style={styles.btnPrimary} onClick={() => scrollTo("projects")}>
              View our work
            </button>
            <button className="zk-btn-ghost" style={styles.btnGhostDark} onClick={() => scrollTo("contact")}>
              Book a consultation
            </button>
          </div>
        </div>

        <div className="zk-hero-stats" style={styles.heroStatsBar}>
          {STATS.map((s) => (
            <div key={s.l} style={styles.heroStat}>
              <div style={styles.heroStatN}>{s.n}</div>
              <div style={styles.heroStatL}>{s.l}</div>
            </div>
          ))}
        </div>
        <div style={styles.heroFade} aria-hidden="true" />
      </section>

      {/* ---------------- ABOUT / INTRO BAND (light, mini 3D rig) ---------------- */}
      <section id="about" style={styles.aboutBand}>
        <div style={{ ...styles.container, position: "relative", zIndex: 1 }}>
          <div className="zk-about-grid" style={styles.aboutGrid}>
            <div>
              <p style={styles.kicker}>Two practices, one team</p>
              <h2 style={styles.h2}>
                Most firms only plan, or only build. Zeko does both, on purpose.
              </h2>
              <p style={styles.bodyLg}>
                Splitting advisory from execution is where most projects lose time —
                and money. Our consultancy arm handles feasibility, permits and
                design; our construction arm executes the same plan on site, under
                the same roof. You get one program, one budget, and nobody to blame
                but us if it slips — which is precisely why it doesn't.
              </p>
            </div>
            <div className="zk-mini-rig" style={styles.miniRigWrap}>
              <MiniRig size={260} />
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- SERVICES ---------------- */}
      <section id="services" style={styles.section}>
        <div style={{ ...styles.container, position: "relative", zIndex: 1 }}>
          <p style={styles.kicker}>What we do</p>
          <h2 style={styles.h2}>Consultancy and construction, side by side.</h2>

          <div className="zk-services-split" style={styles.servicesSplit}>
            <div style={styles.serviceCol}>
              <div style={styles.serviceColHead}>
                <span style={{ ...styles.serviceColTag, color: COLORS.blue, borderColor: COLORS.blue, background: "rgba(36,84,224,0.06)" }}>
                  Consultancy
                </span>
              </div>
              {CONSULTANCY_SERVICES.map((s) => (
                <div className="zk-card zk-card-blue" key={s.title} style={styles.serviceCard}>
                  <div style={{ ...styles.serviceIcon, color: COLORS.blue }}>{Icon[s.icon]}</div>
                  <div>
                    <div style={styles.serviceTitle}>{s.title}</div>
                    <div style={styles.serviceText}>{s.text}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="zk-service-divider" style={styles.serviceDivider} aria-hidden="true" />

            <div style={styles.serviceCol}>
              <div style={styles.serviceColHead}>
                <span style={{ ...styles.serviceColTag, color: COLORS.orange, borderColor: COLORS.orange, background: "rgba(255,107,44,0.07)" }}>
                  Construction
                </span>
              </div>
              {CONSTRUCTION_SERVICES.map((s) => (
                <div className="zk-card zk-card-orange" key={s.title} style={styles.serviceCard}>
                  <div style={{ ...styles.serviceIcon, color: COLORS.orange }}>{Icon[s.icon]}</div>
                  <div>
                    <div style={styles.serviceTitle}>{s.title}</div>
                    <div style={styles.serviceText}>{s.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- PROCESS ---------------- */}
      <section id="process" style={styles.processSection}>
        <div style={{ ...styles.container, position: "relative", zIndex: 1 }}>
          <p style={styles.kicker}>How a project moves</p>
          <h2 style={styles.h2}>Five stages. No surprises.</h2>

          <div className="zk-process-row" style={styles.processRow}>
            {PROCESS.map((p, i) => (
              <React.Fragment key={p.n}>
                <div style={styles.processStep}>
                  <div style={styles.processN}>{p.n}</div>
                  <div style={styles.processTitle}>{p.title}</div>
                  <div style={styles.processText}>{p.text}</div>
                </div>
                {i < PROCESS.length - 1 && <div className="zk-process-tick" style={styles.processTick} aria-hidden="true" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- PROJECTS ---------------- */}
      <section id="projects" style={styles.section}>
        <div style={{ ...styles.container, position: "relative", zIndex: 1 }}>
          <p style={styles.kicker}>Recent work</p>
          <h2 style={styles.h2}>A sample of what's on our boards.</h2>

          <div style={styles.projectGrid}>
            {PROJECTS.map((p, i) => (
              <div className={`zk-card ${i % 2 === 0 ? "zk-card-blue" : "zk-card-orange"}`} key={p.name} style={styles.projectCard}>
                <svg viewBox="0 0 200 120" style={styles.projectSvg} aria-hidden="true">
                  <line x1="0" y1="100" x2="200" y2="100" stroke={COLORS.border} strokeWidth="1.5" />
                  <rect x="30" y="40" width="34" height="60" fill="none" stroke={COLORS.muted} strokeWidth="1.2" opacity="0.7" />
                  <rect x="70" y="20" width="26" height="80" fill="none" stroke={i % 2 === 0 ? COLORS.blue : COLORS.orange} strokeWidth="1.6" />
                  <rect x="102" y="55" width="40" height="45" fill="none" stroke={COLORS.muted} strokeWidth="1.2" opacity="0.7" />
                  <rect x="150" y="35" width="22" height="65" fill="none" stroke={COLORS.muted} strokeWidth="1.2" opacity="0.4" />
                </svg>
                <div style={{ ...styles.projectTag, color: i % 2 === 0 ? COLORS.blue : COLORS.orange }}>{p.tag}</div>
                <div style={styles.projectName}>{p.name}</div>
                <div style={styles.projectType}>{p.type}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- CTA BAND (bold gradient) ---------------- */}
      <section style={styles.ctaBand}>
        <div style={{ ...styles.container, position: "relative", zIndex: 1 }}>
          <div style={styles.ctaGrid}>
            <div>
              <h2 style={styles.ctaH2}>Let's put your next project on the board.</h2>
              <p style={styles.ctaSub}>
                Tell us the site and the goal. We'll tell you what it takes to get there.
              </p>
              <button className="zk-btn-dark" style={styles.btnDark} onClick={() => scrollTo("contact")}>
                Book a consultation
              </button>
            </div>
            <div className="zk-mini-rig" style={styles.miniRigWrapCta}>
              <MiniRig size={200} />
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- CONTACT ---------------- */}
      <section id="contact" style={{ ...styles.section, paddingBottom: 0 }}>
        <div style={{ ...styles.container, position: "relative", zIndex: 1 }}>
          <div className="zk-contact-grid" style={styles.contactGrid}>
            <div>
              <p style={styles.kicker}>Get in touch</p>
              <h2 style={styles.h2}>Based in Tbilisi. Working across Georgia.</h2>
              <p style={styles.bodyLg}>
                Reach out with a site, a sketch, or just a question — a member of
                the team will get back to you within one business day.
              </p>

              <div style={styles.contactRow}>
                <span style={styles.contactIcon}>{Icon.pin}</span>
                <span>25 Alexander Kazbegi Avenue, Tbilisi, Georgia</span>
              </div>
              <div style={styles.contactRow}>
                <span style={{ ...styles.contactIcon, color: COLORS.orange }}>{Icon.instagram}</span>
                <a href="https://www.instagram.com/_zekogroups.ge_/" target="_blank" rel="noreferrer" style={styles.contactLink}>
                  @_zekogroups.ge_
                </a>
              </div>
            </div>

            <form style={styles.form} onSubmit={(e) => e.preventDefault()}>
              <label style={styles.label}>
                Name
                <input style={styles.input} type="text" placeholder="Your full name" />
              </label>
              <label style={styles.label}>
                Email
                <input style={styles.input} type="email" placeholder="you@example.com" />
              </label>
              <label style={styles.label}>
                What are you planning?
                <textarea style={{ ...styles.input, height: 110, resize: "vertical" }} placeholder="A short description of the site and the goal" />
              </label>
              <button className="zk-btn-primary" style={styles.btnPrimary} type="submit">
                Send message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ---------------- FOOTER ---------------- */}
      <footer style={styles.footer}>
        <div style={{ ...styles.container, position: "relative", zIndex: 1 }}>
          <div style={styles.footerRow}>
            <div style={styles.logo}>
              <span style={{ ...styles.logoMark, borderColor: COLORS.orange, color: COLORS.orange }}>Z</span>
              <span style={{ ...styles.logoWord, color: COLORS.ink }}>
                ZEKO
                <span style={styles.logoSub}>CONSULTANCY &amp; CONSTRUCTION</span>
              </span>
            </div>
            <div style={styles.footerLinks}>
              {["Services", "Process", "Projects", "About", "Contact"].map((label) => (
                <span key={label} className="zk-link" style={styles.footerLink} onClick={() => scrollTo(label.toLowerCase())}>
                  {label}
                </span>
              ))}
            </div>
          </div>
          <div style={styles.footerBottom}>
            <span>© {new Date().getFullYear()} Zeko Consultancy &amp; Construction, Tbilisi.</span>
            <span>Design &amp; build under one roof.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ----------------------------- STYLES ----------------------------- */
const styles = {
  page: {
    background: COLORS.paper,
    color: COLORS.ink,
    fontFamily: "'Inter', -apple-system, sans-serif",
    minHeight: "100vh",
    overflowX: "hidden",
    position: "relative",
  },
  container: { maxWidth: 1160, margin: "0 auto", padding: "0 28px" },

  nav: { position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, transition: "background .3s ease, border-color .3s ease" },
  navInner: { maxWidth: 1160, margin: "0 auto", padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 },
  logo: { display: "flex", alignItems: "center", gap: 10, cursor: "pointer" },
  logoMark: {
    width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center",
    border: "1.4px solid", fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 800, fontSize: 20,
  },
  logoWord: { display: "flex", flexDirection: "column", lineHeight: 1, fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 700, fontSize: 20, letterSpacing: 1, transition: "color .3s ease" },
  logoSub: { fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 8.5, letterSpacing: 1.2, color: COLORS.muted, marginTop: 2 },
  navLinks: { display: "flex", gap: 30, fontSize: 14 },
  navLink: { cursor: "pointer", transition: "color .3s ease" },
  navCta: {
    border: "none", color: "#fff", padding: "9px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer",
    fontFamily: "'Inter', sans-serif", borderRadius: 3,
  },
  burger: { display: "none", flexDirection: "column", gap: 4, background: "none", border: "none", cursor: "pointer", padding: 6 },
  burgerLine: { width: 20, height: 1.5 },
  mobileMenu: { display: "none" },
  mobileLink: { padding: "14px 28px", borderTop: `1px solid ${COLORS.border}`, cursor: "pointer" },

  hero: { position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "flex-start", overflow: "hidden", background: COLORS.heroBg, zIndex: 1 },
  heroGridOverlay: {
    position: "absolute", inset: 0,
    backgroundImage: "linear-gradient(rgba(91,141,239,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(91,141,239,0.12) 1px, transparent 1px)",
    backgroundSize: "42px 42px", pointerEvents: "none",
  },
  heroCraneOverlay: { position: "absolute", inset: 0, opacity: 0.05, pointerEvents: "none" },
  heroFade: { position: "absolute", left: 0, right: 0, bottom: 0, height: 140, background: `linear-gradient(to bottom, transparent, ${COLORS.paper})`, pointerEvents: "none" },
  heroContent: { position: "relative", zIndex: 2, maxWidth: 1160, margin: "0 auto", padding: "140px 28px 60px", width: "100%" },
  heroEyebrowRow: { display: "flex", alignItems: "center", gap: 8, color: COLORS.orangeLight, marginBottom: 18 },
  heroEyebrowText: { fontSize: 13, letterSpacing: 0.4 },
  wordmarkWrap: { marginBottom: 8 },
  h1: { fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 800, fontSize: "clamp(2.6rem, 7vw, 5.2rem)", lineHeight: 0.98, margin: "0 0 26px", maxWidth: 780, color: COLORS.chalk },
  heroSub: { fontSize: 17, lineHeight: 1.6, color: "rgba(247,244,236,0.78)", maxWidth: 460, marginBottom: 34 },
  heroBtnRow: { display: "flex", gap: 14, flexWrap: "wrap" },
  btnPrimary: { color: "#fff", padding: "13px 26px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif", border: "none", borderRadius: 3 },
  btnGhostDark: { background: "transparent", color: COLORS.chalk, border: "1px solid rgba(247,244,236,0.35)", padding: "13px 26px", fontSize: 14, cursor: "pointer", fontFamily: "'Inter', sans-serif", borderRadius: 3 },
  btnDark: { background: COLORS.ink, color: "#fff", border: "none", padding: "14px 30px", fontSize: 14.5, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif", borderRadius: 3 },

  heroStatsBar: { position: "relative", zIndex: 2, display: "flex", flexWrap: "wrap", borderTop: "1px solid rgba(247,244,236,0.14)", maxWidth: 1160, margin: "0 auto", width: "100%" },
  heroStat: { flex: "1 1 140px", padding: "22px 28px", borderRight: "1px solid rgba(247,244,236,0.14)" },
  heroStatN: { fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 30, fontWeight: 700, background: `linear-gradient(90deg, ${COLORS.blueLight}, ${COLORS.orangeLight})`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" },
  heroStatL: { fontSize: 12.5, color: "rgba(247,244,236,0.7)", marginTop: 2 },

  aboutBand: { padding: "90px 0", position: "relative", zIndex: 1 },
  aboutGrid: { display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 48, alignItems: "center" },
  miniRigWrap: { display: "flex", justifyContent: "center" },
  kicker: { color: COLORS.orange, fontSize: 13.5, letterSpacing: 0.3, marginBottom: 10, fontWeight: 600 },
  h2: { fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 700, fontSize: "clamp(1.7rem, 3.4vw, 2.5rem)", lineHeight: 1.08, margin: "0 0 20px", maxWidth: 620, color: COLORS.ink },
  bodyLg: { fontSize: 16, lineHeight: 1.7, color: COLORS.muted, maxWidth: 480 },

  section: { padding: "90px 0", position: "relative", zIndex: 1 },
  servicesSplit: { display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 0, marginTop: 44 },
  serviceCol: { display: "flex", flexDirection: "column", gap: 4, padding: "0 28px" },
  serviceColHead: { marginBottom: 18 },
  serviceColTag: { display: "inline-block", fontSize: 12.5, letterSpacing: 0.5, fontWeight: 600, border: "1px solid", padding: "5px 12px", borderRadius: 3 },
  serviceDivider: { width: 1, background: COLORS.border },
  serviceCard: { display: "flex", gap: 16, padding: "22px 20px", background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 8, marginBottom: 14, cursor: "default" },
  serviceIcon: { flexShrink: 0, marginTop: 2 },
  serviceTitle: { fontSize: 15.5, fontWeight: 600, marginBottom: 4, color: COLORS.ink },
  serviceText: { fontSize: 14, lineHeight: 1.55, color: COLORS.muted },

  processSection: { padding: "90px 0", background: "linear-gradient(180deg, #FAFBFD, #F0F3F9)", position: "relative", zIndex: 1 },
  processRow: { display: "flex", alignItems: "flex-start", gap: 0, marginTop: 48, flexWrap: "wrap" },
  processStep: { flex: "1 1 150px", minWidth: 150, paddingRight: 12 },
  processN: { fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 36, fontWeight: 700, marginBottom: 8, background: `linear-gradient(135deg, ${COLORS.blue}, ${COLORS.orange})`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" },
  processTitle: { fontSize: 15.5, fontWeight: 600, marginBottom: 8, color: COLORS.ink },
  processText: { fontSize: 13.5, lineHeight: 1.6, color: COLORS.muted },
  processTick: { width: 26, height: 1, background: COLORS.border, marginTop: 18, flexShrink: 0 },

  projectGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24, marginTop: 44 },
  projectCard: { border: `1px solid ${COLORS.border}`, background: COLORS.surface, borderRadius: 8, padding: 20, cursor: "default" },
  projectSvg: { width: "100%", height: "auto", marginBottom: 16 },
  projectTag: { fontSize: 11.5, letterSpacing: 0.4, fontWeight: 600, marginBottom: 8 },
  projectName: { fontSize: 17, fontWeight: 600, marginBottom: 4, color: COLORS.ink },
  projectType: { fontSize: 13.5, color: COLORS.muted },

  ctaBand: { padding: "90px 0", background: `linear-gradient(120deg, ${COLORS.blue}, ${COLORS.orange})`, position: "relative", zIndex: 1, overflow: "hidden" },
  ctaGrid: { display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 40, alignItems: "center" },
  ctaH2: { fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 700, fontSize: "clamp(1.8rem, 4vw, 2.8rem)", margin: "0 0 14px", color: "#fff" },
  ctaSub: { fontSize: 16, color: "rgba(255,255,255,0.88)", marginBottom: 30 },
  miniRigWrapCta: { display: "flex", justifyContent: "center" },

  contactGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, padding: "0 0 90px" },
  contactRow: { display: "flex", alignItems: "center", gap: 12, fontSize: 15, marginTop: 18, color: COLORS.ink },
  contactIcon: { color: COLORS.blue, display: "flex" },
  contactLink: { color: COLORS.ink, textDecoration: "none", borderBottom: `1px solid ${COLORS.orange}` },
  form: { display: "flex", flexDirection: "column", gap: 16, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 24 },
  label: { display: "flex", flexDirection: "column", gap: 6, fontSize: 13, color: COLORS.muted },
  input: { background: COLORS.paper, border: `1px solid ${COLORS.border}`, color: COLORS.ink, padding: "11px 12px", fontSize: 14.5, fontFamily: "'Inter', sans-serif", outline: "none", borderRadius: 4 },

  footer: { padding: "40px 0 30px", borderTop: `1px solid ${COLORS.border}`, position: "relative", zIndex: 1, background: COLORS.surface },
  footerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20, marginBottom: 26 },
  footerLinks: { display: "flex", gap: 24, fontSize: 13.5 },
  footerLink: { cursor: "pointer", opacity: 0.85, color: COLORS.ink },
  footerBottom: { display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, fontSize: 12.5, color: COLORS.muted },
};
