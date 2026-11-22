/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef, FormEvent, ReactNode, CSSProperties } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin,
  Phone,
  Instagram,
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Check,
  Lock,
  Calendar,
  LogOut,
  Trash2,
  Menu,
  ShieldCheck,
  Sparkles,
  HeartHandshake,
  Clock,
  Expand,
} from 'lucide-react';
import { db, auth, googleProvider } from './lib/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { SERVICES, ServiceCategory, fromPrice, itemLabel, bookingValue, menuLabel } from './data/menu';

// --- Constants ---

const PHONE_DISPLAY = '062385 70877';
const PHONE_TEL = 'tel:+916238570877';
const WHATSAPP = 'https://wa.me/916238570877';
const INSTAGRAM = 'https://www.instagram.com/abcdbeautyclinic';
const MAPS_KANHANGAD = 'https://www.google.com/maps/search/?api=1&query=ABCD+Beauty+Clinic+Kanhangad+Kerala';
const MAPS_CHERKALA = 'https://www.google.com/maps/search/?api=1&query=ABCD+Beauty+Clinic+Cherkala+Kasaragod';
const MAP_EMBED = 'https://maps.google.com/maps?q=ABCD%20Beauty%20Clinic%20Manikoth%20Kanhangad&z=15&output=embed';

const IMG = {
  studio: '/images/hero1.webp',
  suite: '/images/hero2.webp',
  reception: '/images/hero3.webp',
  suiteSm: '/images/hero2-sm.webp',
};

const ADMIN_EMAILS = ['niiaaall2@gmail.com'];

const NAVIGATION = [
  { name: 'About', href: '#about' },
  { name: 'Services', href: '#services' },
  { name: 'The Clinic', href: '#clinic' },
  { name: 'Reviews', href: '#reviews' },
  { name: 'Visit', href: '#visit' },
];

const SPECIALISTS = [
  { title: 'Hair Specialists', description: 'Stylists trained in precision cutting, smoothening and ammonia-free colour work.' },
  { title: 'Skin Experts', description: 'Certified therapists for hydra-facials, peels and Korean-inspired clinical skin care.' },
  { title: 'Beauticians', description: 'Bridal and occasion makeup, saree draping and detailed aesthetic finishing.' },
];

const TESTIMONIALS = [
  { name: 'Thasneem Mohammad', service: 'Smoothening', text: 'The smoothening was so perfect — I couldn’t believe how silky my hair felt. Staff are very helpful and caring. Will definitely be back.' },
  { name: 'Haseena M C', service: 'Hair colour', text: 'Absolutely thrilled! The salon’s pristine ambiance was wonderful. Hair colour service was exceptional — especially Uvais’s work.' },
  { name: 'Aysha Kasim', service: 'Regular client', text: 'ABCD is the most comfortable salon for me. Sandhya is very friendly and kind. This is my forever salon — I’ll recommend it to everyone.' },
  { name: 'Nawaz Muhammed', service: 'Grooming', text: 'Totally satisfied by Asif’s work and customer service. They really take care of you. 100% worth it.' },
  { name: 'Fathimath Nafila', service: 'Hair styling', text: 'Amazing hospitality and service. Shaan did my hair — he is genuinely a perfectionist. Definitely suggesting it to my friends.' },
  { name: 'Shama N A', service: 'First visit', text: 'I walked in by accident and now it’s my forever spot. Staff are friendly, skilled and made me feel very comfortable.' },
];

const FAQS = [
  { q: 'Is ABCD a ladies-only salon?', a: 'No — ABCD is a unisex clinic. Ladies’ services run 10 am to 10 pm and gents’ services 10 am to 12 midnight, every day.' },
  { q: 'Can I get an appointment outside regular hours?', a: 'Yes. 24-hour service is available for pre-booked appointments. Call or WhatsApp us to arrange a slot.' },
  { q: 'How does online booking work?', a: 'Send a request with the form on this page. It opens WhatsApp with your details, and our team confirms your slot — usually within the hour.' },
  { q: 'Where are your clinics?', a: 'Our flagship clinic is near 100HP Car Dealers, Madiyan, Manikoth, Kanhangad. We also have a branch in Cherkala Town, Kasaragod.' },
  { q: 'Are prices fixed?', a: 'Listed prices are a guide. Some services, like smoothening or colour, depend on hair length and a short consultation.' },
];

const TIME_SLOTS = ['Morning', 'Afternoon', 'Evening', 'Night'];
const EASE = [0.22, 1, 0.36, 1] as const;

// --- Hooks & helpers ---

/** Live open/closed status in Kerala time. Ladies 10–22, Gents 10–24, 24h by appointment. */
const useOpenStatus = () => {
  const compute = () => {
    const h = Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hour12: false, timeZone: 'Asia/Kolkata' }).format(new Date()));
    if (h >= 10 && h < 22) return { open: true, label: 'Open now', detail: 'until 10 pm (ladies) · 12 am (gents)' };
    if (h >= 22) return { open: true, label: 'Open now', detail: 'gents until 12 am' };
    return { open: false, label: 'Closed now', detail: 'opens 10 am · 24h by appointment' };
  };
  const [status, setStatus] = useState(compute);
  useEffect(() => {
    const t = setInterval(() => setStatus(compute()), 60_000);
    return () => clearInterval(t);
  }, []);
  return status;
};

const useActiveSection = (ids: string[]) => {
  const [active, setActive] = useState('');
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [ids]);
  return active;
};

/** True once the page is scrolled past `y`. Re-renders only when that flips, never per scroll event. */
const useScrolledPast = (y: number) => {
  const [past, setPast] = useState(false);
  useEffect(() => {
    let current = window.scrollY > y;
    setPast(current);
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const next = window.scrollY > y;
        if (next !== current) {
          current = next;
          setPast(next);
        }
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [y]);
  return past;
};

const useLockScroll = (locked: boolean) => {
  useEffect(() => {
    if (!locked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [locked]);
};

// One shared observer for every reveal. The fade/slide itself is a CSS transition
// (see .reveal in index.css), so it runs on the compositor instead of per-frame JS.
const revealObserver =
  typeof window !== 'undefined' && 'IntersectionObserver' in window
    ? new IntersectionObserver(
        (entries) =>
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            e.target.classList.add('is-in');
            revealObserver?.unobserve(e.target);
          }),
        { rootMargin: '0px 0px -60px 0px' },
      )
    : null;

type RevealProps = { children: ReactNode; delay?: number; className?: string; key?: string };
const Reveal = ({ children, delay = 0, className = '' }: RevealProps) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!revealObserver) {
      el.classList.add('is-in');
      return;
    }
    revealObserver.observe(el);
    return () => revealObserver.unobserve(el);
  }, []);
  return (
    <div ref={ref} className={`reveal ${className}`} style={{ '--reveal-delay': `${delay}s` } as CSSProperties}>
      {children}
    </div>
  );
};

const SectionHeading = ({ eyebrow, title, accent, light = false }: { eyebrow: string; title: string; accent: string; light?: boolean }) => (
  <Reveal>
    <p className={`eyebrow mb-5 ${light ? '!text-lilac' : ''}`}>{eyebrow}</p>
    <h2 className={`font-serif text-[2.75rem] leading-[1] sm:text-6xl tracking-[-0.01em] ${light ? 'text-ivory' : 'text-plum'}`}>
      {title} <em className={light ? 'text-lilac' : 'text-lilac-deep'}>{accent}</em>
    </h2>
  </Reveal>
);

const WhatsAppIcon = ({ size = 20 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
    <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.48.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.04 21.5h-.01a9.4 9.4 0 0 1-4.8-1.32l-.34-.2-3.57.94.95-3.48-.22-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.23-9.43 9.44-9.43 2.52 0 4.89.98 6.67 2.77a9.37 9.37 0 0 1 2.76 6.67c0 5.2-4.23 9.43-9.44 9.43zm8.03-17.46A11.27 11.27 0 0 0 12.04.72C5.79.72.7 5.8.7 12.06c0 2 .52 3.95 1.52 5.67L.6 23.6l6.01-1.58a11.3 11.3 0 0 0 5.42 1.38h.01c6.25 0 11.34-5.09 11.34-11.34 0-3.03-1.18-5.88-3.32-8.02z" />
  </svg>
);

const GoogleG = ({ size = 16 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
    <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.56-5.17 3.56-8.81z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.9l-3.88-3.01c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.28v3.11A12 12 0 0 0 12 24z" />
    <path fill="#FBBC05" d="M5.29 14.29a7.2 7.2 0 0 1 0-4.58V6.6H1.28a12 12 0 0 0 0 10.8l4.01-3.11z" />
    <path fill="#EA4335" d="M12 4.75c1.76 0 3.34.61 4.59 1.8l3.43-3.43A11.96 11.96 0 0 0 12 0 12 12 0 0 0 1.28 6.6l4.01 3.11C6.23 6.86 8.88 4.75 12 4.75z" />
  </svg>
);

const Stars = ({ size = 14 }: { size?: number }) => (
  <div className="flex gap-0.5 text-[#E0A526]" aria-label="5 stars">
    {Array.from({ length: 5 }).map((_, i) => (
      <svg key={i} viewBox="0 0 20 20" width={size} height={size} fill="currentColor" aria-hidden="true">
        <path d="M10 1.5l2.6 5.5 6 .7-4.5 4.1 1.2 6-5.3-3-5.3 3 1.2-6L1.4 7.7l6-.7z" />
      </svg>
    ))}
  </div>
);

const OpenBadge = ({ dark = false }: { dark?: boolean }) => {
  const s = useOpenStatus();
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3.5 h-9 text-[12.5px] font-medium ${dark ? 'bg-ivory/10 text-ivory' : 'bg-white border border-line text-plum shadow-[var(--shadow-soft)]'}`}>
      <span className={`w-2 h-2 rounded-full ${s.open ? 'bg-green-500 live-dot' : 'bg-amber-500'}`} />
      <span className="font-semibold">{s.label}</span>
      <span className={dark ? 'text-ivory/60' : 'text-muted'}>· {s.detail}</span>
    </span>
  );
};

// --- Navigation ---

// 'top' and 'booking' clear the highlight when the user is outside the nav sections.
const SECTION_IDS = ['top', 'about', 'services', 'clinic', 'reviews', 'booking', 'visit'];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const active = useActiveSection(SECTION_IDS);
  useLockScroll(open);

  const scrolled = useScrolledPast(24);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 px-3 sm:px-5 pt-3">
        <nav
          className={`mx-auto flex items-center justify-between transition-all duration-500 ease-out rounded-full ${
            scrolled
              ? 'max-w-5xl h-16 pl-5 pr-2 bg-ivory/90 backdrop-blur-md border border-line shadow-[var(--shadow-lift)]'
              : 'max-w-7xl h-[72px] pl-3 pr-1 sm:px-5 bg-transparent border border-transparent'
          }`}
        >
          <a href="#top" aria-label="ABCD Beauty Clinic home" className="shrink-0">
            <img decoding="async" src="/images/logo-mark.png" alt="ABCD Beauty Clinic" className={`w-auto transition-[height] duration-500 ${scrolled ? 'h-8' : 'h-9 md:h-10'}`} />
          </a>

          <div className="hidden lg:flex items-center gap-1">
            {NAVIGATION.map((item) => {
              const isActive = active === item.href.slice(1);
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`relative px-4 h-10 inline-flex items-center rounded-full text-[13.5px] font-medium transition-colors ${isActive ? 'text-plum' : 'text-plum/60 hover:text-plum'}`}
                >
                  {isActive && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-lilac-light" transition={{ type: 'spring', stiffness: 400, damping: 35 }} />}
                  <span className="relative">{item.name}</span>
                </a>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5">
            <a href={PHONE_TEL} aria-label="Call the clinic" className="hidden md:inline-flex w-12 h-12 rounded-full items-center justify-center text-plum hover:bg-lilac-light transition-colors">
              <Phone size={18} />
            </a>
            <a href="#booking" className="hidden sm:inline-flex btn-primary !h-12 !px-6">Book a visit</a>
            <button className="lg:hidden w-12 h-12 rounded-full flex items-center justify-center text-plum hover:bg-lilac-light" onClick={() => setOpen(true)} aria-label="Open menu">
              <Menu size={22} />
            </button>
          </div>
        </nav>
      </header>

      {/* Rendered outside <header>: a backdrop-filter ancestor would trap this fixed overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[95] bg-plum text-ivory flex flex-col lg:hidden"
          >
            <div className="h-[84px] px-6 flex items-center justify-between">
              <img decoding="async" src="/images/logo-white.png" alt="ABCD Beauty Clinic" className="h-9 w-auto" />
              <button onClick={() => setOpen(false)} className="w-12 h-12 rounded-full bg-ivory/10 flex items-center justify-center" aria-label="Close menu">
                <X size={22} />
              </button>
            </div>
            <div className="flex-1 px-6 pt-6 flex flex-col">
              {NAVIGATION.map((item, i) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 * i + 0.1, duration: 0.5, ease: EASE }}
                  className="font-serif text-[3.25rem] leading-none py-3 border-b border-ivory/10 flex items-center justify-between"
                >
                  {item.name}
                  <ArrowUpRight size={22} className="text-lilac" />
                </motion.a>
              ))}
              <div className="mt-8">
                <OpenBadge dark />
              </div>
            </div>
            <div className="p-5 grid grid-cols-2 gap-3">
              <a href={PHONE_TEL} className="btn !h-14 border border-ivory/20 text-ivory"><Phone size={18} /> Call</a>
              <a href="#booking" onClick={() => setOpen(false)} className="btn !h-14 bg-lilac text-plum">Book a visit</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// --- Sections ---

const Hero = () => (
  <section id="top" className="relative pt-28 md:pt-36 pb-16 md:pb-24 overflow-hidden">
    {/* soft brand wash */}
    <div aria-hidden className="pointer-events-none absolute -top-40 right-[-10%] w-[60vw] h-[60vw] max-w-[820px] max-h-[820px] rounded-full bg-[radial-gradient(closest-side,rgba(233,224,241,0.85),rgba(233,224,241,0))]" />
    <div className="relative max-w-7xl mx-auto px-5 lg:px-10 grid lg:grid-cols-12 gap-12 lg:gap-10 items-center">
      <div className="lg:col-span-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }}>
          <OpenBadge />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.05, ease: EASE }}
          className="mt-8 font-serif text-[3.6rem] leading-[0.92] sm:text-[5.2rem] lg:text-[6.4rem] tracking-[-0.02em] text-plum"
        >
          Beauty, backed <br className="hidden sm:block" />
          by <em className="text-lilac-deep">expertise.</em>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.15, ease: EASE }}
          className="mt-7 max-w-[30rem] text-[17px] leading-[1.7] text-muted"
        >
          Hair, skin and clinic-style treatments inspired by Korean aesthetics — with the care that has made
          ABCD a forever salon for 5,000+ clients across Kanhangad and Cherkala since 2018.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.25, ease: EASE }}
          className="mt-9 flex flex-col sm:flex-row gap-3"
        >
          <a href="#booking" className="btn-primary group">
            Book a visit <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </a>
          <a href="#services" className="btn-ghost">Explore services & prices</a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.45 }}
          className="mt-12 flex items-center gap-5"
        >
          <div className="flex -space-x-2.5">
            {['T', 'H', 'A', 'N'].map((l, i) => (
              <span key={l} className="w-10 h-10 rounded-full border-2 border-ivory flex items-center justify-center text-[13px] font-semibold text-plum" style={{ background: ['#E9E0F1', '#F3E3E7', '#E4E9F3', '#EFE8DA'][i] }}>
                {l}
              </span>
            ))}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-plum">4.6</span>
              <Stars />
            </div>
            <p className="text-[13px] text-muted mt-0.5 flex items-center gap-1.5">
              <GoogleG size={13} /> 172+ Google reviews
            </p>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.3, delay: 0.15, ease: EASE }}
        className="lg:col-span-6 relative"
      >
        <div className="relative ml-auto w-[86%] sm:w-[72%] lg:w-[80%]">
          <div className="arch aspect-[3/4] bg-paper shadow-[var(--shadow-lift)]">
            <img decoding="async" src={IMG.studio} alt="Ladies’ styling studio at ABCD Beauty Clinic" fetchPriority="high" className="w-full h-full object-cover object-[35%_50%]" />
          </div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.7, ease: EASE }}
            className="absolute -left-[22%] sm:-left-[26%] bottom-[12%] w-[50%] rounded-[var(--radius-media)] overflow-hidden ring-[6px] ring-ivory shadow-[var(--shadow-lift)]"
          >
            <img decoding="async" src={IMG.suiteSm} alt="Treatment suite" className="w-full aspect-square object-cover" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.9, ease: EASE }}
            className="absolute -right-2 sm:-right-6 top-[14%] rounded-2xl bg-white/95 border border-white px-4 py-3.5 shadow-[var(--shadow-lift)]"
          >
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Clinics</p>
            <p className="font-serif text-2xl text-plum leading-tight mt-0.5">Kanhangad<br />& Cherkala</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.05, ease: EASE }}
            className="absolute right-[8%] -bottom-5 rounded-full bg-plum text-ivory pl-2 pr-5 h-14 flex items-center gap-3 shadow-[var(--shadow-lift)]"
          >
            <span className="w-10 h-10 rounded-full bg-lilac/25 flex items-center justify-center"><Sparkles size={18} className="text-lilac" /></span>
            <span className="text-[13px] leading-tight"><b className="font-semibold">Korean-inspired</b><br /><span className="text-ivory/60">clinical skin care</span></span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  </section>
);

const Ticker = () => {
  const words = ['Hair', 'Skin', 'Clinical care', 'Bridal', 'Grooming', 'Nails', 'Korean aesthetics', 'Kids'];
  // Two copies are enough for a seamless -50% loop; the animation pauses while off-screen.
  const row = [...words, ...words];
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className="px-3 sm:px-5" aria-hidden="true">
      <div className="rounded-full bg-paper border border-line py-4 overflow-hidden">
        <div className="flex w-max animate-marquee" style={{ animationPlayState: visible ? 'running' : 'paused' }}>
          {row.map((w, i) => (
            <span key={i} className="font-serif italic text-2xl md:text-[1.9rem] text-plum/75 px-7 flex items-center gap-14 whitespace-nowrap">
              {w} <span className="text-lilac text-sm not-italic">✦</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const About = () => (
  <section id="about" className="py-24 md:py-32">
    <div className="max-w-7xl mx-auto px-5 lg:px-10 grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">
      <Reveal className="lg:col-span-5 order-2 lg:order-1">
        <div className="relative">
          <div className="aspect-[4/5] rounded-[2rem] overflow-hidden bg-paper shadow-[var(--shadow-lift)]">
            <img decoding="async" src={IMG.reception} alt="Reception and kids’ corner at ABCD Beauty Clinic" loading="lazy" className="w-full h-full object-cover object-[62%_50%]" />
          </div>
          <div className="absolute -bottom-6 left-6 right-6 sm:left-auto sm:-right-8 sm:w-60 card p-5">
            <p className="font-serif text-5xl text-plum leading-none">2018</p>
            <p className="text-sm text-muted mt-2">Founded on one principle — exceptional customer care.</p>
          </div>
        </div>
      </Reveal>

      <div className="lg:col-span-7 order-1 lg:order-2">
        <SectionHeading eyebrow="Our story" title="Where expertise" accent="meets warmth." />
        <Reveal delay={0.1}>
          <div className="mt-8 grid md:grid-cols-2 gap-6 text-[16px] leading-[1.75] text-muted">
            <p>From everyday cuts to complete bridal packages, ABCD treats every client like family — which is why so many call us their forever salon.</p>
            <p>Our Kanhangad clinic now brings advanced, clinic-style beauty services inspired by Korean aesthetics, alongside our branch in Cherkala.</p>
          </div>
        </Reveal>
        <div className="mt-12 grid sm:grid-cols-3 gap-4">
          {[
            { icon: ShieldCheck, t: 'Hygiene first', d: 'Spotless stations and fresh tools, every visit.' },
            { icon: Sparkles, t: 'Precision', d: 'Specialists for hair, skin and clinical care.' },
            { icon: HeartHandshake, t: 'Hospitality', d: 'Unhurried, friendly care — for her, him and kids.' },
          ].map(({ icon: Icon, t, d }, i) => (
            <Reveal key={t} delay={0.08 * i}>
              <div className="card h-full p-6 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] transition-[translate,box-shadow] duration-500">
                <span className="w-11 h-11 rounded-2xl bg-lilac-light text-lilac-deep flex items-center justify-center"><Icon size={20} /></span>
                <h3 className="font-serif text-[1.6rem] mt-5 text-plum leading-none">{t}</h3>
                <p className="text-sm text-muted mt-2.5 leading-relaxed">{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const ServiceDrawer = ({ service, onClose, onBook }: { service: ServiceCategory | null; onClose: () => void; onBook: (s: string) => void }) => {
  useLockScroll(!!service);
  useEffect(() => {
    if (!service) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [service, onClose]);

  return (
    <AnimatePresence>
      {service && (
        <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label={`${service.title} price list`}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-plum/50" />
          <motion.aside
            initial={{ x: '105%' }}
            animate={{ x: 0 }}
            exit={{ x: '105%' }}
            transition={{ type: 'tween', duration: 0.5, ease: EASE }}
            className="absolute right-0 sm:right-3 top-0 sm:top-3 bottom-0 sm:bottom-3 w-full sm:max-w-[34rem] bg-ivory sm:rounded-[2rem] overflow-hidden flex flex-col shadow-2xl"
          >
            <div className="relative h-60 shrink-0 m-3 rounded-[1.5rem] overflow-hidden">
              <img decoding="async" src={service.image} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-plum/80 via-plum/10 to-transparent" />
              <button onClick={onClose} className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/95 text-plum flex items-center justify-center hover:bg-white" aria-label="Close">
                <X size={20} />
              </button>
              <div className="absolute bottom-5 left-6 right-6 text-ivory">
                <span className="inline-flex rounded-full bg-plum/45 px-3 h-7 items-center text-[11px] uppercase tracking-[0.18em]">{service.audience === 'her' ? 'For her' : 'For him'}</span>
                <h3 className="font-serif text-[2.6rem] leading-none mt-3">{service.title}</h3>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-6 sm:px-8 pb-6 pt-3 space-y-8">
              {service.groups.map((g, gi) => (
                <div key={gi}>
                  {(g.name || g.note) && (
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 mb-2">
                      {g.name && <h4 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-lilac-deep">{g.name}</h4>}
                      {g.note && <span className="text-[12px] font-medium text-plum/70 rounded-full bg-lilac-light px-2.5 py-0.5">{g.note}</span>}
                    </div>
                  )}
                  <ul className="divide-y divide-line">
                    {g.items.map((it, ii) => (
                      <li key={ii}>
                        <button
                          onClick={() => onBook(bookingValue(service, g, it))}
                          className="group w-full flex items-start gap-3 py-3.5 text-left -mx-3 px-3 rounded-xl hover:bg-paper transition-colors"
                        >
                          <span className="flex-1 min-w-0">
                            <span className="text-[15px] text-plum">{it.name}</span>
                            {it.note && <span className="text-[12.5px] text-muted"> {it.note}</span>}
                            {it.includes && (
                              <span className="mt-1.5 block text-[13px] leading-relaxed text-muted">{it.includes.join(' · ')}</span>
                            )}
                          </span>
                          {it.price && <span className="text-[15px] font-semibold text-plum whitespace-nowrap tabular-nums">{it.price}</span>}
                          <span className="w-7 h-7 rounded-full bg-plum text-ivory flex items-center justify-center opacity-0 -mr-1 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all">
                            <ArrowRight size={13} />
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <p className="text-xs text-muted rounded-xl bg-paper px-4 py-3">Tap any treatment to book it. Prices marked + start from the amount shown.</p>
            </div>

            <div className="shrink-0 p-4 border-t border-line grid grid-cols-[1fr_auto] gap-2.5 bg-ivory">
              <button onClick={() => onBook('')} className="btn-primary">
                Book {service.title.toLowerCase()} <ArrowRight size={16} />
              </button>
              <a
                href={`${WHATSAPP}?text=${encodeURIComponent(`Hi ABCD, I'd like to know more about ${service.title}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-13 h-13 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:brightness-105"
                aria-label="Ask on WhatsApp"
              >
                <WhatsAppIcon size={22} />
              </a>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};

const Services = ({ onBook }: { onBook: (service: string) => void }) => {
  const [audience, setAudience] = useState<'her' | 'him'>('her');
  const [selected, setSelected] = useState<ServiceCategory | null>(null);
  const list = SERVICES.filter((s) => s.audience === audience);
  const close = useCallback(() => setSelected(null), []);

  return (
    <section id="services" className="px-3 sm:px-5">
      <div className="grain rounded-[2.5rem] bg-paper py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-5 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
            <div>
              <SectionHeading eyebrow="Services & prices" title="The ABCD" accent="menu." />
              <Reveal delay={0.1}>
                <p className="mt-5 text-muted max-w-md">Open any category for the full price list — tap a treatment to book it straight away.</p>
              </Reveal>
            </div>
            <div className="relative inline-flex rounded-full bg-white border border-line p-1.5 self-start md:self-auto shadow-[var(--shadow-soft)]" role="tablist" aria-label="Choose audience">
              {(['her', 'him'] as const).map((a) => (
                <button
                  key={a}
                  role="tab"
                  aria-selected={audience === a}
                  onClick={() => setAudience(a)}
                  className={`relative px-7 h-11 rounded-full text-sm font-semibold transition-colors ${audience === a ? 'text-ivory' : 'text-plum/60 hover:text-plum'}`}
                >
                  {audience === a && <motion.span layoutId="aud-pill" className="absolute inset-0 rounded-full bg-plum" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
                  <span className="relative">For {a}</span>
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={audience}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {list.map((s, i) => {
                // A lone card on the last row becomes a wide banner so the grid stays balanced.
                const wide = i === list.length - 1 && list.length % 3 === 1;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelected(s)}
                    className={`group text-left card p-2.5 hover:-translate-y-1.5 hover:shadow-[var(--shadow-lift)] transition-[translate,box-shadow] duration-500 ${wide ? 'sm:col-span-2 lg:col-span-3 lg:grid lg:grid-cols-[2fr_1fr] lg:items-center lg:gap-4' : ''}`}
                  >
                    <div className={`relative overflow-hidden rounded-[1.35rem] bg-lilac-light aspect-[4/3] ${wide ? 'lg:aspect-[2.4/1]' : ''}`}>
                      <img decoding="async" src={s.image} alt={s.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-[1.06]" />
                      <span className="absolute top-3 left-3 rounded-full bg-white/95 text-plum text-[12px] font-semibold px-3 h-8 inline-flex items-center">
                        From {fromPrice(s)}
                      </span>
                    </div>
                    <div className={`px-3.5 pt-4 pb-3 ${wide ? 'lg:px-6' : ''}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className={`font-serif text-plum leading-none ${wide ? 'text-[2rem] lg:text-5xl' : 'text-[2rem]'}`}>{s.title}</h3>
                          <p className="text-[14px] text-muted mt-2.5 leading-relaxed">{s.description}</p>
                        </div>
                        <span className="mt-0.5 shrink-0 w-11 h-11 rounded-full bg-paper text-plum flex items-center justify-center transition-all duration-300 group-hover:bg-plum group-hover:text-ivory group-hover:rotate-45">
                          <ArrowUpRight size={18} />
                        </span>
                      </div>
                      <p className="mt-4 text-[12.5px] font-medium text-lilac-deep">
                        {s.groups.reduce((n, g) => n + g.items.length, 0)} treatments · View price list
                      </p>
                    </div>
                  </button>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <ServiceDrawer
        service={selected}
        onClose={close}
        onBook={(name) => {
          setSelected(null);
          onBook(name);
        }}
      />
    </section>
  );
};

const Specialists = () => (
  <section className="py-24 md:py-32">
    <div className="max-w-7xl mx-auto px-5 lg:px-10">
      <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-end mb-12">
        <div className="lg:col-span-7">
          <SectionHeading eyebrow="Our people" title="Specialists," accent="not generalists." />
        </div>
        <Reveal delay={0.1} className="lg:col-span-5">
          <p className="text-muted leading-relaxed">Every service is handled by someone who does it every day — so your cut, colour or skin treatment gets real expertise, not guesswork.</p>
        </Reveal>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {SPECIALISTS.map((s, i) => (
          <Reveal key={s.title} delay={0.08 * i}>
            <div className="group h-full rounded-[var(--radius-card)] bg-plum text-ivory p-8 relative overflow-hidden">
              <div aria-hidden className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-[radial-gradient(closest-side,rgba(179,156,203,0.22),rgba(179,156,203,0))] transition-transform duration-700 group-hover:scale-125" />
              <span className="relative font-serif text-[4.5rem] leading-none text-lilac/70">0{i + 1}</span>
              <h3 className="relative font-serif text-[2rem] mt-8 leading-none">{s.title}</h3>
              <p className="relative text-[14.5px] text-ivory/65 mt-3 leading-relaxed">{s.description}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

const Lightbox = ({ items, index, onClose, onNav }: { items: { src: string; title: string }[]; index: number | null; onClose: () => void; onNav: (d: number) => void }) => {
  useLockScroll(index !== null);
  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNav(1);
      if (e.key === 'ArrowLeft') onNav(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, onClose, onNav]);

  return (
    <AnimatePresence>
      {index !== null && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[120] bg-[#120B17]/95 flex flex-col" role="dialog" aria-modal="true">
          <div className="flex items-center justify-between p-4 sm:p-6 text-ivory">
            <p className="font-serif text-2xl">{items[index].title}</p>
            <button onClick={onClose} className="w-12 h-12 rounded-full bg-ivory/10 hover:bg-ivory/20 flex items-center justify-center" aria-label="Close">
              <X size={22} />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center px-4 sm:px-20 pb-10 relative" onClick={onClose}>
            <motion.img key={index} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease: EASE }} src={items[index].src} alt={items[index].title} className="max-h-full max-w-full rounded-[1.5rem] object-contain" onClick={(e) => e.stopPropagation()} />
            {[-1, 1].map((d) => (
              <button
                key={d}
                onClick={(e) => {
                  e.stopPropagation();
                  onNav(d);
                }}
                className={`absolute ${d < 0 ? 'left-3 sm:left-6' : 'right-3 sm:right-6'} w-12 h-12 rounded-full bg-ivory/10 hover:bg-ivory/20 text-ivory flex items-center justify-center`}
                aria-label={d < 0 ? 'Previous photo' : 'Next photo'}
              >
                {d < 0 ? <ChevronLeft size={22} /> : <ChevronRight size={22} />}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Clinic = () => {
  const spaces = [
    { src: IMG.studio, title: 'Styling studio', note: 'Hair, colour & makeup' },
    { src: IMG.suite, title: 'Treatment suite', note: 'Facials & clinical care' },
    { src: IMG.reception, title: 'Kids’ corner', note: 'Reception & kids’ cuts' },
  ];
  const [idx, setIdx] = useState<number | null>(null);
  const nav = useCallback((d: number) => setIdx((i) => (i === null ? i : (i + d + spaces.length) % spaces.length)), [spaces.length]);
  const close = useCallback(() => setIdx(null), []);

  return (
    <section id="clinic" className="pb-24 md:pb-32">
      <div className="max-w-7xl mx-auto px-5 lg:px-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <SectionHeading eyebrow="Inside ABCD" title="A calm space," accent="made for you." />
          <Reveal delay={0.1}>
            <p className="max-w-sm text-muted leading-relaxed">Separate areas for styling, treatments and kids — so every visit feels private, clean and unhurried.</p>
          </Reveal>
        </div>
        <div className="grid md:grid-cols-12 md:grid-rows-2 gap-4 md:h-[640px]">
          {spaces.map((s, i) => (
            <Reveal key={s.title} delay={0.08 * i} className={i === 0 ? 'md:col-span-7 md:row-span-2' : 'md:col-span-5'}>
              <button onClick={() => setIdx(i)} className="group relative block w-full h-full min-h-[240px] rounded-[var(--radius-card)] overflow-hidden bg-paper text-left">
                <img decoding="async" src={s.src} alt={s.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-[1.05]" />
                <div className="absolute inset-0 bg-gradient-to-t from-plum/70 via-transparent to-transparent" />
                <div className="absolute left-5 right-5 bottom-5 flex items-end justify-between gap-4 text-ivory">
                  <div>
                    <p className="font-serif text-[1.9rem] leading-none">{s.title}</p>
                    <p className="text-[13px] text-ivory/75 mt-1.5">{s.note}</p>
                  </div>
                  <span className="w-11 h-11 rounded-full bg-plum/40 flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <Expand size={17} />
                  </span>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </div>
      <Lightbox items={spaces} index={idx} onClose={close} onNav={nav} />
    </section>
  );
};

const Reviews = () => {
  const scroll = (dir: number) => document.getElementById('review-track')?.scrollBy({ left: dir * 420, behavior: 'smooth' });
  // Align the first card with the heading inside the inset rounded panel (outer inset 1.25rem on sm+).
  const pad = 'max(1.25rem, calc((100vw - 2.5rem - 80rem) / 2 + 2.5rem))';
  return (
    <section id="reviews" className="px-3 sm:px-5">
      <div className="grain rounded-[2.5rem] bg-paper py-20 md:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 lg:px-10">
          <div className="grid lg:grid-cols-12 gap-10 items-end mb-12">
            <div className="lg:col-span-7">
              <SectionHeading eyebrow="Client stories" title="“My" accent="forever salon.”" />
            </div>
            <Reveal delay={0.1} className="lg:col-span-5 flex flex-wrap items-center gap-4 lg:justify-end">
              <div className="card px-5 py-4 flex items-center gap-4">
                <span className="font-serif text-5xl text-plum leading-none">4.6</span>
                <div>
                  <Stars size={15} />
                  <p className="text-[13px] text-muted mt-1.5 flex items-center gap-1.5"><GoogleG size={13} /> 172+ reviews</p>
                </div>
              </div>
              <div className="flex gap-2">
                {[-1, 1].map((d) => (
                  <button key={d} onClick={() => scroll(d)} aria-label={d < 0 ? 'Previous reviews' : 'Next reviews'} className="w-12 h-12 rounded-full bg-white border border-line text-plum flex items-center justify-center hover:bg-plum hover:text-ivory hover:border-plum transition-colors">
                    {d < 0 ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                  </button>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
        <div id="review-track" className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-2" style={{ paddingInline: pad, scrollPaddingInline: pad }}>
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="snap-start shrink-0 w-[86%] sm:w-[400px] card p-7 md:p-8 flex flex-col">
              <div className="flex items-center justify-between">
                <Stars />
                <GoogleG size={16} />
              </div>
              <blockquote className="mt-5 font-serif text-[1.55rem] leading-[1.25] text-plum flex-1">“{t.text}”</blockquote>
              <figcaption className="mt-7 flex items-center gap-3">
                <span className="w-11 h-11 rounded-full bg-lilac-light text-plum flex items-center justify-center font-semibold">{t.name[0]}</span>
                <span>
                  <span className="block text-[14px] font-semibold text-plum">{t.name}</span>
                  <span className="block text-[12.5px] text-muted">{t.service}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
};

const Booking = ({ preset, onPresetUsed }: { preset: { service: string; n: number }; onPresetUsed: () => void }) => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [service, setService] = useState('');
  const [branch, setBranch] = useState('Kanhangad');
  const [slot, setSlot] = useState('');
  const [highlight, setHighlight] = useState(false);
  const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

  useEffect(() => {
    if (!preset.n) return;
    if (preset.service) setService(preset.service);
    setHighlight(true);
    const t = setTimeout(() => setHighlight(false), 1600);
    onPresetUsed();
    return () => clearTimeout(t);
  }, [preset.n]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const date = (formData.get('date') as string) || '';
    const appointmentData = {
      name: formData.get('name'),
      service,
      phone: formData.get('phone'),
      branch,
      preferredDate: date,
      preferredTime: slot,
      status: 'pending',
      createdAt: serverTimestamp(),
      userId: auth.currentUser?.uid || 'anonymous',
    };

    try {
      await addDoc(collection(db, 'appointments'), appointmentData);
      const now = new Date();
      const prettyDate = date ? new Date(date + 'T00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) : 'Flexible';
      const message =
        `🔔 New Booking Request\n\n` +
        `Name: ${appointmentData.name}\nPhone: ${appointmentData.phone}\nService: ${service}\n` +
        `Branch: ${branch}\nPreferred: ${prettyDate}${slot ? ` · ${slot}` : ''}\n\n` +
        `Sent ${now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}, ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
      window.open(`${WHATSAPP}?text=${encodeURIComponent(message)}`, '_blank');
      setSubmitted(true);
    } catch (error) {
      console.error('Error saving appointment:', error);
      alert('Something went wrong. Please call us directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="booking" className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-5 lg:px-10 grid lg:grid-cols-12 gap-12 lg:gap-16">
        <div className="lg:col-span-5">
          <SectionHeading eyebrow="Appointments" title="Book your" accent="visit." />
          <Reveal delay={0.1}>
            <p className="mt-6 text-muted leading-relaxed max-w-sm">Send a request and we’ll confirm your slot on WhatsApp — usually within the hour.</p>
            <ol className="mt-10 space-y-5">
              {['Choose your treatment & time', 'Send the request on WhatsApp', 'We confirm your slot'].map((s, i) => (
                <li key={s} className="flex items-center gap-4">
                  <span className="w-9 h-9 rounded-full bg-lilac-light text-lilac-deep text-sm font-semibold flex items-center justify-center shrink-0">{i + 1}</span>
                  <span className="text-plum">{s}</span>
                </li>
              ))}
            </ol>
            <div className="mt-10 grid sm:grid-cols-2 gap-3">
              <a href={PHONE_TEL} className="card p-4 flex items-center gap-3 hover:shadow-[var(--shadow-lift)] transition-shadow">
                <span className="w-11 h-11 rounded-full bg-paper text-plum flex items-center justify-center"><Phone size={18} /></span>
                <span><span className="block text-[12px] text-muted">Call us</span><span className="block font-semibold text-plum">{PHONE_DISPLAY}</span></span>
              </a>
              <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="card p-4 flex items-center gap-3 hover:shadow-[var(--shadow-lift)] transition-shadow">
                <span className="w-11 h-11 rounded-full bg-[#25D366]/12 text-[#1DA851] flex items-center justify-center"><WhatsAppIcon size={19} /></span>
                <span><span className="block text-[12px] text-muted">Chat with us</span><span className="block font-semibold text-plum">WhatsApp</span></span>
              </a>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="lg:col-span-7">
          <div className={`rounded-[2rem] bg-paper border p-6 sm:p-10 transition-all duration-700 ${highlight ? 'border-lilac-deep ring-8 ring-lilac/20' : 'border-line'}`}>
            {submitted ? (
              <div className="text-center py-14">
                <span className="mx-auto w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center"><Check size={30} /></span>
                <h3 className="font-serif text-5xl text-plum mt-6">Request sent.</h3>
                <p className="text-muted mt-3 max-w-xs mx-auto">Thank you — we’ll message you on WhatsApp shortly to confirm your slot.</p>
                <button onClick={() => setSubmitted(false)} className="btn-ghost mt-8">Book another</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="block text-[13px] font-medium text-plum mb-2">Full name</span>
                    <input name="name" required type="text" autoComplete="name" placeholder="Your name" className="field" />
                  </label>
                  <label className="block">
                    <span className="block text-[13px] font-medium text-plum mb-2">Phone / WhatsApp</span>
                    <input name="phone" required type="tel" inputMode="tel" autoComplete="tel" placeholder="+91 98765 43210" pattern="[0-9+\s\-]{10,15}" className="field" />
                  </label>
                </div>

                <label className="block">
                  <span className="block text-[13px] font-medium text-plum mb-2">Treatment</span>
                  <div className="relative">
                    <select name="service" required value={service} onChange={(e) => setService(e.target.value)} className={`field appearance-none pr-12 cursor-pointer ${service ? '' : 'text-plum/40'}`}>
                      <option value="" disabled>Choose a treatment</option>
                      {SERVICES.map((c) => (
                        <optgroup key={c.id} label={`${menuLabel(c)} — ${c.title}`}>
                          {c.groups.flatMap((g, gi) =>
                            g.items.map((it, ii) => (
                              <option key={`${c.id}-${gi}-${ii}`} value={bookingValue(c, g, it)} className="text-plum">
                                {itemLabel(it)}
                                {g.name && g.name !== it.name ? ` — ${g.name}` : ''}
                                {it.price ? ` · ${it.price}` : g.note ? ` · ${g.note}` : ''}
                              </option>
                            )),
                          )}
                        </optgroup>
                      ))}
                    </select>
                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-plum/50 pointer-events-none" />
                  </div>
                </label>

                <div>
                  <span className="block text-[13px] font-medium text-plum mb-2">Branch</span>
                  <div className="flex flex-wrap gap-2">
                    {['Kanhangad', 'Cherkala'].map((b) => (
                      <button type="button" key={b} data-active={branch === b} onClick={() => setBranch(b)} className="chip">
                        <MapPin size={14} className="mr-1.5" /> {b}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid sm:grid-cols-[1fr_1.4fr] gap-4">
                  <label className="block">
                    <span className="block text-[13px] font-medium text-plum mb-2">Preferred date <span className="text-muted font-normal">(optional)</span></span>
                    <input name="date" type="date" min={today} className="field" />
                  </label>
                  <div>
                    <span className="block text-[13px] font-medium text-plum mb-2">Preferred time <span className="text-muted font-normal">(optional)</span></span>
                    <div className="grid grid-cols-4 gap-1.5 rounded-[var(--radius-field)] bg-white border border-line p-1.5 h-13">
                      {TIME_SLOTS.map((t) => (
                        <button type="button" key={t} onClick={() => setSlot(slot === t ? '' : t)} className={`rounded-[0.7rem] text-[12.5px] font-medium transition-colors ${slot === t ? 'bg-plum text-ivory' : 'text-plum/70 hover:bg-paper'}`}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full !h-14 text-[15px] disabled:opacity-60">
                  {loading ? 'Sending…' : 'Send booking request'} {!loading && <ArrowRight size={17} />}
                </button>
                <p className="text-[12.5px] text-muted text-center flex items-center justify-center gap-1.5">
                  <Lock size={12} /> Your details are only used to confirm your appointment.
                </p>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

const Visit = () => {
  const locations = [
    { name: 'Kanhangad', tag: 'Flagship clinic', address: 'Near 100HP Car Dealers, Madiyan, Manikoth, Kanhangad, Kerala 671316', maps: MAPS_KANHANGAD },
    { name: 'Cherkala', tag: 'Branch', address: 'Cherkala Town, Kasaragod, Kerala', maps: MAPS_CHERKALA },
  ];
  return (
    <section id="visit" className="px-3 sm:px-5">
      <div className="grain rounded-[2.5rem] bg-paper py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-5 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <SectionHeading eyebrow="Visit us" title="Two clinics," accent="open every day." />
            <Reveal delay={0.1}><OpenBadge /></Reveal>
          </div>

          <div className="grid lg:grid-cols-12 gap-4">
            <Reveal className="lg:col-span-7 lg:row-span-2">
              <div className="h-full min-h-[340px] rounded-[var(--radius-card)] overflow-hidden border border-line bg-lilac-light relative">
                <iframe title="Map to ABCD Beauty Clinic, Kanhangad" src={MAP_EMBED} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="absolute inset-0 w-full h-full" />
              </div>
            </Reveal>
            <div className="lg:col-span-5 grid sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {locations.map((l, i) => (
                <Reveal key={l.name} delay={0.08 * i}>
                  <div className="card p-6 h-full flex flex-col">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-lilac-light text-lilac-deep text-[11px] font-semibold uppercase tracking-[0.16em] px-3 h-7 inline-flex items-center">{l.tag}</span>
                      <MapPin size={18} className="text-lilac-deep" />
                    </div>
                    <h3 className="font-serif text-[2.4rem] text-plum leading-none mt-5">{l.name}</h3>
                    <p className="mt-3 text-[14.5px] text-muted leading-relaxed flex-1">{l.address}</p>
                    <a href={l.maps} target="_blank" rel="noopener noreferrer" className="mt-5 btn-ghost !h-11 !px-5 self-start text-[13px]">
                      Get directions <ArrowUpRight size={15} />
                    </a>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.15} className="lg:col-span-5">
              <div className="rounded-[var(--radius-card)] bg-plum text-ivory p-6 sm:p-7">
                <div className="flex items-center gap-2 text-lilac text-[11px] font-semibold uppercase tracking-[0.2em]"><Clock size={14} /> Opening hours · all days</div>
                <dl className="mt-4 divide-y divide-ivory/10">
                  <div className="flex justify-between items-baseline py-3"><dt className="text-ivory/70">Ladies</dt><dd className="font-serif text-2xl">10 am – 10 pm</dd></div>
                  <div className="flex justify-between items-baseline py-3"><dt className="text-ivory/70">Gents</dt><dd className="font-serif text-2xl">10 am – 12 am</dd></div>
                </dl>
                <p className="mt-2 text-[13px] text-ivory/55">24-hour service available for pre-booked appointments.</p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};

const Faq = () => {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-5 lg:px-10 grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4">
          <SectionHeading eyebrow="Good to know" title="Questions," accent="answered." />
          <Reveal delay={0.1}>
            <p className="mt-5 text-muted">Something else? <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="text-plum font-semibold underline decoration-lilac underline-offset-4">Ask us on WhatsApp</a>.</p>
          </Reveal>
        </div>
        <div className="lg:col-span-8 space-y-3">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={f.q} delay={0.05 * i}>
                <div className={`rounded-[1.5rem] border transition-colors duration-300 ${isOpen ? 'bg-white border-line shadow-[var(--shadow-soft)]' : 'bg-paper/60 border-transparent hover:bg-paper'}`}>
                  <button onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen} className="w-full flex items-center justify-between gap-6 text-left px-6 py-5">
                    <span className="text-[16.5px] font-semibold text-plum">{f.q}</span>
                    <span className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-plum text-ivory rotate-180' : 'bg-white text-plum'}`}>
                      <ChevronDown size={17} />
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: EASE }} className="overflow-hidden">
                        <p className="px-6 pb-6 -mt-1 text-muted leading-relaxed max-w-2xl">{f.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const CtaBanner = () => (
  <section className="px-3 sm:px-5 pb-3 sm:pb-5">
    <Reveal>
      <div className="relative rounded-[2.5rem] overflow-hidden min-h-[460px] flex items-end">
        <img decoding="async" src={IMG.studio} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-plum/95 via-plum/75 to-plum/20" />
        <div className="relative w-full max-w-7xl mx-auto px-6 lg:px-10 py-14 md:py-20 grid md:grid-cols-12 gap-8 items-end">
          <div className="md:col-span-7 text-ivory">
            <p className="eyebrow !text-lilac mb-5">Your next visit</p>
            <h2 className="font-serif text-[2.9rem] sm:text-7xl leading-[0.95]">Ready when <em className="text-lilac">you are.</em></h2>
            <p className="mt-5 text-ivory/70 max-w-md">Book in under a minute, or follow along for our latest transformations.</p>
          </div>
          <div className="md:col-span-5 flex flex-col sm:flex-row md:justify-end gap-3">
            <a href="#booking" className="btn-light">Book a visit <ArrowRight size={16} /></a>
            <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" className="btn border border-ivory/25 text-ivory hover:bg-ivory/10"><Instagram size={17} /> @abcdbeautyclinic</a>
          </div>
        </div>
      </div>
    </Reveal>
  </section>
);

const Footer = ({ onOpenAdmin, onOpenPrivacy, onOpenTerms }: { onOpenAdmin: () => void; onOpenPrivacy: () => void; onOpenTerms: () => void }) => {
  const [clickCount, setClickCount] = useState(0);
  // Hidden admin entry: click the copyright line 5 times.
  const handleSecretClick = () => {
    const next = clickCount + 1;
    setClickCount(next);
    if (next >= 5) {
      onOpenAdmin();
      setClickCount(0);
    }
    setTimeout(() => setClickCount(0), 3000);
  };

  return (
    <footer className="px-3 sm:px-5 pb-24 md:pb-5">
      <div className="rounded-[2.5rem] bg-[#1E1326] text-ivory pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid md:grid-cols-12 gap-10 pb-14 border-b border-ivory/10">
            <div className="md:col-span-5">
              <img decoding="async" src="/images/logo-white.png" alt="ABCD Beauty Clinic" className="h-11 w-auto opacity-90" />
              <p className="mt-7 font-serif text-[2rem] leading-[1.15] text-ivory/90 max-w-sm">Beauty and confidence in Kanhangad & Cherkala, since 2018.</p>
            </div>
            <div className="md:col-span-2">
              <h4 className="text-[11px] uppercase tracking-[0.2em] text-ivory/40 mb-5">Explore</h4>
              <ul className="space-y-3 text-[14px] text-ivory/70">
                {NAVIGATION.map((n) => <li key={n.name}><a href={n.href} className="hover:text-lilac transition-colors">{n.name}</a></li>)}
              </ul>
            </div>
            <div className="md:col-span-2">
              <h4 className="text-[11px] uppercase tracking-[0.2em] text-ivory/40 mb-5">Hours</h4>
              <p className="text-[14px] text-ivory/70 leading-[1.9]">Ladies 10 am – 10 pm<br />Gents 10 am – 12 am<br />Open all days</p>
            </div>
            <div className="md:col-span-3">
              <h4 className="text-[11px] uppercase tracking-[0.2em] text-ivory/40 mb-5">Contact</h4>
              <a href={PHONE_TEL} className="block text-[14px] text-ivory/70 hover:text-lilac">{PHONE_DISPLAY}</a>
              <div className="flex gap-2 mt-6">
                {[
                  { href: INSTAGRAM, label: 'Instagram', icon: <Instagram size={18} /> },
                  { href: WHATSAPP, label: 'WhatsApp', icon: <WhatsAppIcon size={18} /> },
                  { href: PHONE_TEL, label: 'Call', icon: <Phone size={17} /> },
                ].map((s) => (
                  <a key={s.label} href={s.href} target={s.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" aria-label={s.label} className="w-12 h-12 rounded-full bg-ivory/8 border border-ivory/10 flex items-center justify-center hover:bg-lilac hover:text-plum hover:border-lilac transition-colors">
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="pt-7 flex flex-col sm:flex-row justify-between items-center gap-5 text-[12.5px] text-ivory/35">
            <p onClick={handleSecretClick} className="cursor-default select-none">© {new Date().getFullYear()} ABCD Beauty Clinic. All rights reserved.</p>
            <div className="flex gap-6">
              <button onClick={onOpenPrivacy} className="hover:text-ivory transition-colors">Privacy</button>
              <button onClick={onOpenTerms} className="hover:text-ivory transition-colors">Terms</button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

/** Desktop: floating WhatsApp button. Mobile: thumb-friendly action bar. */
const QuickActions = () => {
  const show = useScrolledPast(500);

  return (
    <>
      <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp" className="hidden md:flex fixed bottom-6 right-6 z-[90] w-14 h-14 rounded-full bg-[#25D366] text-white items-center justify-center shadow-[0_12px_30px_-8px_rgba(37,211,102,0.6)] hover:scale-105 transition-transform">
        <WhatsAppIcon size={28} />
      </a>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="md:hidden fixed bottom-3 inset-x-3 z-[90] rounded-full bg-plum p-1.5 grid grid-cols-[auto_auto_1fr] gap-1.5 shadow-[0_20px_40px_-12px_rgba(42,27,51,0.6)]"
            style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
          >
            <a href={PHONE_TEL} aria-label="Call" className="w-12 h-12 rounded-full bg-ivory/10 text-ivory flex items-center justify-center"><Phone size={19} /></a>
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center"><WhatsAppIcon size={21} /></a>
            <a href="#booking" className="h-12 rounded-full bg-ivory text-plum font-semibold text-[14px] flex items-center justify-center gap-2">Book a visit <ArrowRight size={16} /></a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// --- Admin (hidden) ---

const AdminSection = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [user, setUser] = useState<User | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  const isAdminUser = user?.email && ADMIN_EMAILS.includes(user.email);

  useEffect(() => {
    if (isAdminUser) {
      setError(null);
      const q = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => setAppointments(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))),
        (err) => {
          console.error('Firestore error:', err);
          setError('Permission Denied: You do not have access to view these records.');
        },
      );
      return () => unsubscribe();
    } else if (user) {
      setError(`Access Denied: ${user.email} is not an authorized administrator.`);
    }
  }, [user, isAdminUser]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error('Login failed:', e);
      setError('Login failed. Please try again.');
    }
  };

  const handleLogout = () => {
    signOut(auth);
    setAppointments([]);
    setError(null);
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'appointments', id), { status });
    } catch (e) {
      console.error(e);
    }
  };

  const deleteBooking = async (id: string) => {
    if (confirm('Delete this appointment?')) await deleteDoc(doc(db, 'appointments', id));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[130] bg-ivory overflow-y-auto">
      <div className="max-w-6xl mx-auto px-5 py-10">
        <div className="flex justify-between items-start mb-10 gap-6">
          <div>
            <button onClick={onClose} className="btn-ghost !h-10 !px-4 text-[13px] mb-6"><ChevronLeft size={16} /> Back to site</button>
            <p className="eyebrow mb-3">Dashboard</p>
            <h2 className="font-serif text-5xl text-plum">Appointments</h2>
          </div>
          {user ? (
            <div className="card flex items-center gap-4 p-2 pl-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-plum">{user.displayName}</p>
                <p className="text-[11px] text-muted">{user.email}</p>
              </div>
              <button onClick={handleLogout} className="w-11 h-11 rounded-full bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100" title="Log out"><LogOut size={18} /></button>
            </div>
          ) : (
            <button onClick={handleLogin} className="btn-primary"><Lock size={16} /> Log in</button>
          )}
        </div>

        {error && <div className="mb-8 p-5 rounded-2xl bg-red-50 border border-red-100 text-red-700 text-center">{error}</div>}

        {isAdminUser ? (
          <div className="grid gap-3">
            {appointments.length === 0 ? (
              <div className="text-center py-20 rounded-[2rem] bg-paper border border-dashed border-lavender-300">
                <Calendar className="mx-auto text-lilac mb-4" size={40} />
                <p className="text-muted">No bookings yet.</p>
              </div>
            ) : (
              appointments.map((app) => (
                <div key={app.id} className="card p-5 sm:p-6 flex flex-col md:flex-row justify-between md:items-center gap-5">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold text-plum">{app.name}</h4>
                      <span className={`px-2.5 h-6 inline-flex items-center rounded-full text-[10px] font-bold uppercase tracking-widest ${app.status === 'confirmed' ? 'bg-green-100 text-green-700' : app.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{app.status}</span>
                    </div>
                    <p className="text-sm text-muted">Service: <span className="text-plum">{app.service}</span>{app.branch && <> · Branch: <span className="text-plum">{app.branch}</span></>}</p>
                    {(app.preferredDate || app.preferredTime) && (
                      <p className="text-sm text-muted">Preferred: <span className="text-plum">{[app.preferredDate, app.preferredTime].filter(Boolean).join(' · ')}</span></p>
                    )}
                    <p className="text-sm text-muted">Contact: <a href={`tel:${app.phone}`} className="text-lilac-deep underline">{app.phone}</a></p>
                  </div>
                  <div className="flex items-center gap-2">
                    {app.status === 'pending' && <button onClick={() => updateStatus(app.id, 'confirmed')} className="btn !h-10 !px-5 bg-green-600 text-white hover:bg-green-700 text-[13px]">Confirm</button>}
                    <button onClick={() => updateStatus(app.id, 'cancelled')} className="btn-ghost !h-10 !px-5 text-[13px]">Cancel</button>
                    <button onClick={() => deleteBooking(app.id)} className="w-10 h-10 rounded-full text-plum/30 hover:text-red-600 hover:bg-red-50 flex items-center justify-center" title="Delete permanently"><Trash2 size={17} /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="text-center py-20 rounded-[2rem] bg-paper border border-line">
            <p className="text-muted">Please log in with the admin account to view appointments.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const LegalOverlay = ({ isOpen, onClose, type }: { isOpen: boolean; onClose: () => void; type: 'privacy' | 'terms' }) => {
  useLockScroll(isOpen);
  if (!isOpen) return null;
  const content =
    type === 'privacy'
      ? {
          title: 'Privacy Policy',
          sections: [
            { title: 'Information Collection', text: 'We collect only the information needed to provide our services: your name, phone number and appointment preferences when you request a booking.' },
            { title: 'How We Use Your Data', text: 'Your contact details are used only to schedule and confirm your appointments at ABCD Beauty Clinic. We do not sell or trade your data with third parties.' },
            { title: 'Security', text: 'We use industry-standard measures to protect your personal information from unauthorized access or disclosure.' },
          ],
        }
      : {
          title: 'Terms of Service',
          sections: [
            { title: 'Booking Policy', text: 'Appointments are subject to availability. We recommend booking in advance to secure your preferred time.' },
            { title: 'Cancellation Policy', text: 'If you need to cancel or reschedule, please let us know at least 2 hours before your appointment.' },
            { title: 'Health & Safety', text: 'Please tell us about any medical conditions or allergies before your treatment. ABCD Beauty Clinic is not liable for reactions if this information was withheld.' },
          ],
        };

  return (
    <div className="fixed inset-0 z-[130] bg-ivory overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">
        <button onClick={onClose} className="btn-ghost !h-10 !px-4 text-[13px] mb-12"><ChevronLeft size={16} /> Close</button>
        <h2 className="font-serif text-6xl text-plum mb-12">{content.title}</h2>
        <div className="space-y-4">
          {content.sections.map((s) => (
            <div key={s.title} className="card p-7">
              <h3 className="text-lg font-semibold text-plum mb-2">{s.title}</h3>
              <p className="text-muted leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
        <p className="mt-12 text-sm text-muted">Last updated: November 2026.</p>
      </div>
    </div>
  );
};

export default function App() {
  const [adminOpen, setAdminOpen] = useState(false);
  const [legal, setLegal] = useState<{ open: boolean; type: 'privacy' | 'terms' }>({ open: false, type: 'privacy' });
  const [preset, setPreset] = useState({ service: '', n: 0 });

  const bookService = (service: string) => {
    setPreset((p) => ({ service, n: p.n + 1 }));
    requestAnimationFrame(() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' }));
  };

  return (
    <div>
      <Navbar />
      <main>
        <Hero />
        <Ticker />
        <About />
        <Services onBook={bookService} />
        <Specialists />
        <Clinic />
        <Reviews />
        <Booking preset={preset} onPresetUsed={() => {}} />
        <Visit />
        <Faq />
        <CtaBanner />
      </main>
      <Footer
        onOpenAdmin={() => setAdminOpen(true)}
        onOpenPrivacy={() => setLegal({ open: true, type: 'privacy' })}
        onOpenTerms={() => setLegal({ open: true, type: 'terms' })}
      />
      <AdminSection isOpen={adminOpen} onClose={() => setAdminOpen(false)} />
      <LegalOverlay isOpen={legal.open} onClose={() => setLegal({ ...legal, open: false })} type={legal.type} />
      <QuickActions />
    </div>
  );
}
