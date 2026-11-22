/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin,
  Phone,
  Instagram,
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  X,
  CheckCircle2,
  Lock,
  Calendar,
  LogOut,
  Trash2,
  Menu,
} from 'lucide-react';
import { db, auth, googleProvider } from './lib/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { SERVICES, ServiceCategory } from './data/menu';

// --- Constants ---

const PHONE_DISPLAY = '062385 70877';
const PHONE_TEL = 'tel:+916238570877';
const WHATSAPP = 'https://wa.me/916238570877';
const INSTAGRAM = 'https://www.instagram.com/abcdbeautyclinic';
const MAPS_KANHANGAD = 'https://www.google.com/maps/search/?api=1&query=ABCD+Beauty+Clinic+Kanhangad+Kerala';
const MAPS_CHERKALA = 'https://www.google.com/maps/search/?api=1&query=ABCD+Beauty+Clinic+Cherkala+Kasaragod';

const IMG = {
  studio: '/images/hero1.webp',
  suite: '/images/hero2.webp',
  reception: '/images/hero3.webp',
  studioSm: '/images/hero1-sm.webp',
  suiteSm: '/images/hero2-sm.webp',
  receptionSm: '/images/hero3-sm.webp',
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
  {
    title: 'Hair Specialists',
    description: 'Stylists trained in precision cutting, smoothening and ammonia-free colour work.',
  },
  {
    title: 'Skin Experts',
    description: 'Certified therapists for hydra-facials, peels and Korean-inspired clinical skin care.',
  },
  {
    title: 'Beauticians',
    description: 'Bridal and occasion makeup, saree draping and detailed aesthetic finishing.',
  },
];

const TESTIMONIALS = [
  {
    name: 'Thasneem Mohammad',
    text: 'The smoothening was so perfect — I couldn’t believe how silky my hair felt. Staff are very helpful and caring. Will definitely be back.',
  },
  {
    name: 'Haseena M C',
    text: 'Absolutely thrilled! The salon’s pristine ambiance was wonderful. Hair colour service was exceptional — especially Uvais’s work.',
  },
  {
    name: 'Aysha Kasim',
    text: 'ABCD is the most comfortable salon for me. Sandhya is very friendly and kind. This is my forever salon — I’ll recommend it to everyone.',
  },
  {
    name: 'Nawaz Muhammed',
    text: 'Totally satisfied by Asif’s work and customer service. They really take care of you. 100% worth it.',
  },
  {
    name: 'Fathimath Nafila',
    text: 'Amazing hospitality and service. Shaan did my hair — he is genuinely a perfectionist. Definitely suggesting it to my friends.',
  },
  {
    name: 'Shama N A',
    text: 'I walked in by accident and now it’s my forever spot. Staff are friendly, skilled and made me feel very comfortable.',
  },
];

// --- Small pieces ---

type RevealProps = { children: ReactNode; delay?: number; className?: string; key?: string };
const Reveal = ({ children, delay = 0, className = '' }: RevealProps) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-80px' }}
    transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

const WhatsAppIcon = ({ size = 20 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
    <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.48.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.04 21.5h-.01a9.4 9.4 0 0 1-4.8-1.32l-.34-.2-3.57.94.95-3.48-.22-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.23-9.43 9.44-9.43 2.52 0 4.89.98 6.67 2.77a9.37 9.37 0 0 1 2.76 6.67c0 5.2-4.23 9.43-9.44 9.43zm8.03-17.46A11.27 11.27 0 0 0 12.04.72C5.79.72.7 5.8.7 12.06c0 2 .52 3.95 1.52 5.67L.6 23.6l6.01-1.58a11.3 11.3 0 0 0 5.42 1.38h.01c6.25 0 11.34-5.09 11.34-11.34 0-3.03-1.18-5.88-3.32-8.02z" />
  </svg>
);

const Stars = () => (
  <div className="flex gap-0.5 text-brass" aria-label="5 stars">
    {Array.from({ length: 5 }).map((_, i) => (
      <svg key={i} viewBox="0 0 20 20" width="14" height="14" fill="currentColor" aria-hidden="true">
        <path d="M10 1.5l2.6 5.5 6 .7-4.5 4.1 1.2 6-5.3-3-5.3 3 1.2-6L1.4 7.7l6-.7z" />
      </svg>
    ))}
  </div>
);

// --- Sections ---

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
  }, [open]);

  return (
    <>
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled ? 'bg-ivory/90 backdrop-blur-md border-b border-line' : 'bg-transparent'}`}>
      <div className={`hidden md:block overflow-hidden transition-all duration-500 ${scrolled ? 'max-h-0' : 'max-h-10'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-2.5 flex justify-between text-[11px] tracking-[0.18em] uppercase text-muted">
          <span>Kanhangad · Cherkala — Open all days</span>
          <a href={PHONE_TEL} className="hover:text-plum transition-colors">Call {PHONE_DISPLAY}</a>
        </div>
      </div>
      <nav className="max-w-7xl mx-auto px-6 lg:px-10 h-[72px] flex items-center justify-between">
        <a href="#top" aria-label="ABCD Beauty Clinic home" className="shrink-0">
          <img src="/images/logo-mark.png" alt="ABCD Beauty Clinic" className="h-9 md:h-10 w-auto" />
        </a>

        <div className="hidden lg:flex items-center gap-10">
          {NAVIGATION.map((item) => (
            <a key={item.name} href={item.href} className="text-[13px] font-medium text-plum/75 hover:text-plum transition-colors">
              {item.name}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <a href="#booking" className="hidden sm:inline-flex btn-primary !py-3 !px-6">Book a visit</a>
          <button
            className="lg:hidden w-11 h-11 flex items-center justify-center text-plum"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </nav>
    </header>

      {/* Outside <header>: its backdrop-blur would trap a fixed overlay inside the header box */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[95] bg-plum text-ivory flex flex-col lg:hidden"
          >
            <div className="h-[72px] px-6 flex items-center justify-between">
              <img src="/images/logo-white.png" alt="ABCD Beauty Clinic" className="h-9 w-auto" />
              <button onClick={() => setOpen(false)} className="w-11 h-11 flex items-center justify-center" aria-label="Close menu">
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 px-6 pt-10 flex flex-col gap-2">
              {NAVIGATION.map((item, i) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="font-serif text-5xl py-2 border-b border-ivory/10"
                >
                  {item.name}
                </motion.a>
              ))}
            </div>
            <div className="p-6 grid grid-cols-2 gap-3">
              <a href={PHONE_TEL} className="border border-ivory/25 py-4 text-center text-sm font-semibold">Call</a>
              <a href="#booking" onClick={() => setOpen(false)} className="bg-lilac text-plum py-4 text-center text-sm font-semibold">Book a visit</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const Hero = () => (
  <section id="top" className="relative pt-32 md:pt-44 pb-20 md:pb-28 overflow-hidden">
    <div className="max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-12 gap-14 lg:gap-10 items-center">
      <div className="lg:col-span-6">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="eyebrow mb-8">
          Unisex beauty clinic · Since 2018
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="font-serif text-[3.4rem] leading-[0.95] sm:text-7xl lg:text-[6.2rem] tracking-[-0.01em] text-plum"
        >
          Beauty, backed <br className="hidden sm:block" />
          by <em className="text-lilac-deep">expertise.</em>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.15 }}
          className="mt-8 max-w-md text-[17px] leading-relaxed text-muted"
        >
          Hair, skin and clinic-style treatments inspired by Korean aesthetics — delivered with the
          care that has made us a forever salon for over 5,000 clients in Kanhangad and Cherkala.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.25 }}
          className="mt-10 flex flex-col sm:flex-row gap-3"
        >
          <a href="#booking" className="btn-primary">
            Book a visit <ArrowRight size={16} />
          </a>
          <a href="#services" className="btn-ghost">View services & prices</a>
        </motion.div>

        <motion.dl
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.45 }}
          className="mt-14 grid grid-cols-3 max-w-md border-t border-line pt-6"
        >
          {[
            ['4.6', 'Google rating'],
            ['172+', 'Reviews'],
            ['5,000+', 'Clients'],
          ].map(([v, l]) => (
            <div key={l}>
              <dt className="font-serif text-4xl text-plum">{v}</dt>
              <dd className="mt-1 text-[11px] uppercase tracking-[0.18em] text-muted">{l}</dd>
            </div>
          ))}
        </motion.dl>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="lg:col-span-6 relative"
      >
        <div className="relative ml-auto w-[82%] sm:w-[70%] lg:w-[78%]">
          <div className="arch aspect-[3/4] bg-paper">
            <img src={IMG.studio} alt="Ladies’ styling studio at ABCD Beauty Clinic" className="w-full h-full object-cover object-[35%_50%]" />
          </div>
          <div className="absolute -left-[28%] bottom-10 w-[52%] aspect-square overflow-hidden border-[6px] border-ivory shadow-[0_30px_60px_-30px_rgba(42,27,51,0.45)]">
            <img src={IMG.suiteSm} alt="Treatment suite" className="w-full h-full object-cover" />
          </div>
          <div className="absolute -right-3 top-10 hidden sm:flex flex-col items-center justify-center w-28 h-28 rounded-full bg-lilac text-plum text-center">
            <span className="font-serif text-3xl leading-none">2</span>
            <span className="text-[10px] uppercase tracking-[0.16em] mt-1 leading-tight">clinics in<br />Kasaragod</span>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

const Ticker = () => {
  const words = ['Hair', 'Skin', 'Clinical care', 'Bridal', 'Grooming', 'Nails', 'Korean aesthetics', 'Kids'];
  const row = [...words, ...words];
  return (
    <div className="border-y border-line bg-paper py-5 overflow-hidden" aria-hidden="true">
      <div className="flex w-max animate-marquee">
        {[...row, ...row].map((w, i) => (
          <span key={i} className="font-serif italic text-2xl md:text-3xl text-plum/80 px-8 flex items-center gap-16 whitespace-nowrap">
            {w} <span className="text-lilac text-base not-italic">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
};

const About = () => (
  <section id="about" className="py-24 md:py-36">
    <div className="max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-12 gap-14 lg:gap-20 items-center">
      <Reveal className="lg:col-span-5 order-2 lg:order-1">
        <div className="aspect-[4/5] overflow-hidden bg-paper">
          <img src={IMG.reception} alt="Reception and kids’ corner at ABCD Beauty Clinic" loading="lazy" className="w-full h-full object-cover object-[60%_50%]" />
        </div>
        <p className="mt-4 text-xs text-muted tracking-wide">Reception & kids’ corner, Kanhangad</p>
      </Reveal>

      <div className="lg:col-span-7 order-1 lg:order-2">
        <Reveal>
          <p className="eyebrow mb-6">Our story</p>
          <h2 className="font-serif text-5xl md:text-6xl leading-[1.02] text-plum">
            Where expertise <em className="text-lilac-deep">meets warmth.</em>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-8 grid md:grid-cols-2 gap-6 text-[16px] leading-relaxed text-muted">
            <p>
              ABCD Beauty Clinic was founded in 2018 on one principle — exceptional customer care.
              From everyday cuts to complete bridal packages, we treat every client like family.
            </p>
            <p>
              Today our Kanhangad clinic brings advanced, clinic-style beauty services inspired by
              Korean aesthetics, alongside our branch in Cherkala.
            </p>
          </div>
        </Reveal>
        <div className="mt-14 grid sm:grid-cols-3 border-t border-line">
          {[
            ['01', 'Hygiene', 'Spotless stations and single-use tools, every visit.'],
            ['02', 'Precision', 'Trained specialists for hair, skin and clinical care.'],
            ['03', 'Hospitality', 'Unhurried, friendly service — for her, him and kids.'],
          ].map(([n, t, d], i) => (
            <Reveal key={n} delay={0.1 * i} className={`pt-6 pb-2 sm:pr-6 ${i > 0 ? 'sm:pl-6 sm:border-l border-line' : ''}`}>
              <span className="text-xs text-lilac-deep font-semibold tracking-widest">{n}</span>
              <h3 className="font-serif text-2xl mt-2 text-plum">{t}</h3>
              <p className="text-sm text-muted mt-2 leading-relaxed">{d}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const ServiceDrawer = ({ service, onClose }: { service: ServiceCategory | null; onClose: () => void }) => {
  useEffect(() => {
    if (!service) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [service, onClose]);

  return (
    <AnimatePresence>
      {service && (
        <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label={`${service.title} menu`}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-plum/50 backdrop-blur-[2px]"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-0 h-full w-full max-w-xl bg-ivory flex flex-col"
          >
            <div className="relative h-56 shrink-0 overflow-hidden">
              <img src={service.image} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-plum/70 to-transparent" />
              <button
                onClick={onClose}
                className="absolute top-5 right-5 w-11 h-11 bg-ivory text-plum flex items-center justify-center"
                aria-label="Close"
              >
                <X size={20} />
              </button>
              <div className="absolute bottom-5 left-8 text-ivory">
                <p className="text-[11px] uppercase tracking-[0.25em] opacity-80">{service.audience === 'her' ? 'For her' : 'For him'}</p>
                <h3 className="font-serif text-4xl mt-1">{service.title}</h3>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-8 py-8 space-y-10">
              {service.groups.map((g) => (
                <div key={g.name}>
                  <h4 className="eyebrow mb-3">{g.name}</h4>
                  <ul>
                    {g.items.map((it) => (
                      <li key={it.name} className="flex items-baseline gap-3 py-3 border-b border-line">
                        <span className="text-[15px] text-plum">{it.name}</span>
                        <span className="flex-1 border-b border-dotted border-plum/20 translate-y-[-4px]" />
                        <span className="text-[15px] font-semibold text-plum whitespace-nowrap">{it.price}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <p className="text-xs text-muted">Prices are indicative and may vary with hair length and consultation.</p>
            </div>

            <div className="shrink-0 p-6 border-t border-line grid grid-cols-[1fr_auto] gap-3 bg-ivory">
              <a href="#booking" onClick={onClose} className="btn-primary">
                Book this treatment <ArrowRight size={16} />
              </a>
              <a
                href={`${WHATSAPP}?text=${encodeURIComponent(`Hi ABCD, I'd like to know more about ${service.title}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-14 bg-[#25D366] text-white flex items-center justify-center"
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

const Services = () => {
  const [audience, setAudience] = useState<'her' | 'him'>('her');
  const [selected, setSelected] = useState<ServiceCategory | null>(null);
  const list = SERVICES.filter((s) => s.audience === audience);

  return (
    <section id="services" className="py-24 md:py-32 bg-paper">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14">
          <Reveal>
            <p className="eyebrow mb-6">Services & prices</p>
            <h2 className="font-serif text-5xl md:text-6xl leading-[1.02] text-plum max-w-xl">
              The ABCD <em className="text-lilac-deep">menu.</em>
            </h2>
          </Reveal>
          <div className="inline-flex border border-plum/15 p-1 self-start md:self-auto" role="tablist">
            {(['her', 'him'] as const).map((a) => (
              <button
                key={a}
                role="tab"
                aria-selected={audience === a}
                onClick={() => setAudience(a)}
                className={`px-7 py-3 text-sm font-semibold tracking-wide transition-colors ${audience === a ? 'bg-plum text-ivory' : 'text-plum/70 hover:text-plum'}`}
              >
                For {a}
              </button>
            ))}
          </div>
        </div>

        <motion.div key={audience} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
          {list.map((s, i) => {
            // A lone card on the last row becomes a wide banner so the grid stays balanced.
            const wide = i === list.length - 1 && list.length % 3 === 1;
            return (
            <button key={s.id} onClick={() => setSelected(s)} className={`group text-left ${wide ? 'lg:col-span-3 lg:grid lg:grid-cols-3 lg:gap-6 lg:items-center' : ''}`}>
              <div className={`relative aspect-[4/3] overflow-hidden bg-lilac-light ${wide ? 'lg:col-span-2 lg:aspect-[21/9]' : ''}`}>
                <img
                  src={s.image}
                  alt={s.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]"
                />
                <span className="absolute top-4 left-4 bg-ivory/90 text-plum text-[11px] font-semibold tracking-widest px-3 py-1.5">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <div>
              <div className="pt-5 flex items-start justify-between gap-4">
                <div>
                  <h3 className={`font-serif text-plum ${wide ? 'text-3xl lg:text-5xl' : 'text-3xl'}`}>{s.title}</h3>
                  <p className="text-sm text-muted mt-1.5 leading-relaxed">{s.description}</p>
                </div>
                <span className="mt-1 shrink-0 w-10 h-10 border border-plum/15 flex items-center justify-center text-plum transition-colors group-hover:bg-plum group-hover:text-ivory">
                  <ArrowUpRight size={18} />
                </span>
              </div>
              <p className="mt-4 text-[12px] uppercase tracking-[0.18em] text-plum/60">
                From <span className="text-plum font-semibold">{s.from}</span> · See price list
              </p>
              </div>
            </button>
            );
          })}
        </motion.div>
      </div>
      <ServiceDrawer service={selected} onClose={() => setSelected(null)} />
    </section>
  );
};

const Specialists = () => (
  <section className="py-24 md:py-32 bg-plum text-ivory">
    <div className="max-w-7xl mx-auto px-6 lg:px-10">
      <div className="grid lg:grid-cols-12 gap-12">
        <Reveal className="lg:col-span-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-lilac mb-6">Our people</p>
          <h2 className="font-serif text-5xl md:text-6xl leading-[1.02]">
            Specialists, <em className="text-lilac">not generalists.</em>
          </h2>
        </Reveal>
        <div className="lg:col-span-8 grid md:grid-cols-3 gap-px bg-ivory/10">
          {SPECIALISTS.map((s, i) => (
            <Reveal key={s.title} delay={0.1 * i} className="bg-plum p-8 md:pt-0 md:first:pl-0">
              <span className="font-serif text-6xl text-lilac/60">0{i + 1}</span>
              <h3 className="font-serif text-3xl mt-6">{s.title}</h3>
              <p className="text-sm text-ivory/60 mt-3 leading-relaxed">{s.description}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const Clinic = () => {
  const spaces = [
    { src: IMG.studio, title: 'Styling studio', note: 'Hair, colour & makeup' },
    { src: IMG.suite, title: 'Treatment suite', note: 'Facials & clinical care' },
    { src: IMG.reception, title: 'Kids’ corner', note: 'Reception & kids’ cuts' },
  ];
  return (
    <section id="clinic" className="py-24 md:py-36">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <Reveal>
            <p className="eyebrow mb-6">Inside ABCD</p>
            <h2 className="font-serif text-5xl md:text-6xl leading-[1.02] text-plum">
              A calm space, <em className="text-lilac-deep">made for you.</em>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="max-w-sm text-muted leading-relaxed">
              Separate areas for styling, treatments and kids — so every visit feels private, clean and unhurried.
            </p>
          </Reveal>
        </div>
        <div className="grid md:grid-cols-12 gap-6">
          {spaces.map((s, i) => (
            <Reveal key={s.title} delay={0.1 * i} className={i === 0 ? 'md:col-span-7 md:row-span-2' : 'md:col-span-5'}>
              <figure className="group">
                <div className={`overflow-hidden bg-paper ${i === 0 ? 'aspect-[4/3] md:aspect-auto md:h-[640px]' : 'aspect-[16/10] md:h-[300px] md:aspect-auto'}`}>
                  <img src={s.src} alt={s.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-[1.03]" />
                </div>
                <figcaption className="mt-3 flex justify-between text-sm">
                  <span className="font-serif text-xl text-plum">{s.title}</span>
                  <span className="text-muted">{s.note}</span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

const Reviews = () => (
  <section id="reviews" className="py-24 md:py-32 bg-paper overflow-hidden">
    <div className="max-w-7xl mx-auto px-6 lg:px-10">
      <div className="grid lg:grid-cols-12 gap-12 items-end mb-14">
        <Reveal className="lg:col-span-7">
          <p className="eyebrow mb-6">Client stories</p>
          <h2 className="font-serif text-5xl md:text-6xl leading-[1.02] text-plum">
            “My <em className="text-lilac-deep">forever salon.</em>”
          </h2>
        </Reveal>
        <Reveal delay={0.1} className="lg:col-span-5 flex items-center gap-6 lg:justify-end">
          <div className="font-serif text-7xl text-plum leading-none">4.6</div>
          <div>
            <Stars />
            <p className="text-sm text-muted mt-2">from 172+ Google reviews</p>
          </div>
        </Reveal>
      </div>
    </div>
    <div className="max-w-7xl mx-auto px-6 lg:px-10 flex justify-end gap-2 mb-6">
      {[-1, 1].map((dir) => (
        <button
          key={dir}
          onClick={() => document.getElementById('review-track')?.scrollBy({ left: dir * 440, behavior: 'smooth' })}
          aria-label={dir < 0 ? 'Previous reviews' : 'Next reviews'}
          className="w-11 h-11 border border-plum/20 text-plum flex items-center justify-center hover:bg-plum hover:text-ivory transition-colors"
        >
          <ArrowRight size={18} className={dir < 0 ? 'rotate-180' : ''} />
        </button>
      ))}
    </div>
    <div
      id="review-track"
      className="flex gap-6 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-4"
      style={{ paddingInline: 'max(1.5rem, calc((100vw - 80rem) / 2 + 2.5rem))', scrollPaddingInline: 'max(1.5rem, calc((100vw - 80rem) / 2 + 2.5rem))' }}
    >
      {TESTIMONIALS.map((t) => (
        <figure key={t.name} className="snap-start shrink-0 w-[85%] sm:w-[420px] bg-ivory border border-line p-8 md:p-10 flex flex-col">
          <Stars />
          <blockquote className="mt-6 font-serif text-[1.6rem] leading-snug text-plum flex-1">“{t.text}”</blockquote>
          <figcaption className="mt-8 pt-5 border-t border-line flex items-center gap-3">
            <span className="w-10 h-10 rounded-full bg-lilac-light text-plum flex items-center justify-center font-semibold text-sm">{t.name[0]}</span>
            <span>
              <span className="block text-sm font-semibold text-plum">{t.name}</span>
              <span className="block text-xs text-muted">Google review</span>
            </span>
          </figcaption>
        </figure>
      ))}
    </div>
  </section>
);

const Booking = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const appointmentData = {
      name: formData.get('name'),
      service: formData.get('service'),
      phone: formData.get('phone'),
      status: 'pending',
      createdAt: serverTimestamp(),
      userId: auth.currentUser?.uid || 'anonymous',
    };

    try {
      await addDoc(collection(db, 'appointments'), appointmentData);
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
      const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
      const message = `🔔 New Booking Alert!\n\nDate: ${dateStr}\nTime: ${timeStr}\n\nName: ${appointmentData.name}\nService: ${appointmentData.service}\nPhone: ${appointmentData.phone}`;
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
    <section id="booking" className="py-24 md:py-36">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-12 gap-14 lg:gap-20">
        <Reveal className="lg:col-span-5">
          <p className="eyebrow mb-6">Appointments</p>
          <h2 className="font-serif text-5xl md:text-6xl leading-[1.02] text-plum">
            Book your <em className="text-lilac-deep">visit.</em>
          </h2>
          <p className="mt-6 text-muted leading-relaxed max-w-sm">
            Send a request and we’ll confirm your slot on WhatsApp, usually within the hour.
          </p>
          <div className="mt-10 space-y-4">
            <a href={PHONE_TEL} className="flex items-center justify-between py-4 border-b border-line group">
              <span className="flex items-center gap-4 text-plum"><Phone size={18} className="text-lilac-deep" /> {PHONE_DISPLAY}</span>
              <span className="text-xs uppercase tracking-[0.18em] text-muted group-hover:text-plum">Call</span>
            </a>
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between py-4 border-b border-line group">
              <span className="flex items-center gap-4 text-plum"><span className="text-[#25D366]"><WhatsAppIcon size={18} /></span> WhatsApp us</span>
              <span className="text-xs uppercase tracking-[0.18em] text-muted group-hover:text-plum">Chat</span>
            </a>
          </div>
          <p className="mt-8 text-sm text-muted">
            <span className="text-plum font-semibold">24-hour service</span> available for pre-booked appointments.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="lg:col-span-7">
          <div className="bg-paper p-8 md:p-14">
            {submitted ? (
              <div className="text-center py-12">
                <CheckCircle2 size={44} className="mx-auto text-lilac-deep" />
                <h3 className="font-serif text-4xl text-plum mt-6">Request sent.</h3>
                <p className="text-muted mt-3">Thank you — we’ll contact you shortly to confirm.</p>
                <button onClick={() => setSubmitted(false)} className="mt-8 text-sm font-semibold text-lilac-deep underline underline-offset-4">
                  Book another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-9">
                <div className="grid md:grid-cols-2 gap-9">
                  <label className="block">
                    <span className="eyebrow !text-muted">Full name</span>
                    <input name="name" required type="text" autoComplete="name" placeholder="Your name" className="field mt-2" />
                  </label>
                  <label className="block">
                    <span className="eyebrow !text-muted">Phone</span>
                    <input name="phone" required type="tel" autoComplete="tel" placeholder="+91" className="field mt-2" />
                  </label>
                </div>
                <label className="block">
                  <span className="eyebrow !text-muted">Service</span>
                  <select name="service" required defaultValue="" className="field mt-2 appearance-none cursor-pointer">
                    <option value="" disabled>Choose a service</option>
                    {SERVICES.map((c) => (
                      <optgroup key={c.id} label={`${c.title} (${c.audience === 'her' ? 'Ladies' : 'Men'})`}>
                        {c.groups.flatMap((g) =>
                          g.items.map((it) => (
                            <option key={`${c.id}-${g.name}-${it.name}`} value={it.name}>
                              {it.name}
                            </option>
                          )),
                        )}
                      </optgroup>
                    ))}
                  </select>
                </label>
                <button type="submit" disabled={loading} className="btn-primary w-full !py-5 disabled:opacity-50">
                  {loading ? 'Sending…' : 'Request appointment'} <ArrowRight size={16} />
                </button>
                <p className="text-xs text-muted text-center">Opens WhatsApp to send your request to the clinic.</p>
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
    {
      name: 'Kanhangad',
      tag: 'Flagship clinic',
      address: 'Near 100HP Car Dealers, Madiyan, Manikoth, Kanhangad, Kerala 671316',
      maps: MAPS_KANHANGAD,
    },
    {
      name: 'Cherkala',
      tag: 'Branch',
      address: 'Cherkala Town, Kasaragod, Kerala',
      maps: MAPS_CHERKALA,
    },
  ];
  return (
    <section id="visit" className="py-24 md:py-32 bg-paper">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <Reveal>
          <p className="eyebrow mb-6">Visit us</p>
          <h2 className="font-serif text-5xl md:text-6xl leading-[1.02] text-plum mb-14">
            Two clinics, <em className="text-lilac-deep">open every day.</em>
          </h2>
        </Reveal>
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 grid sm:grid-cols-2 gap-6">
            {locations.map((l, i) => (
              <Reveal key={l.name} delay={0.1 * i} className="bg-ivory border border-line p-8 flex flex-col">
                <MapPin size={20} className="text-lilac-deep" />
                <p className="mt-6 text-[11px] uppercase tracking-[0.2em] text-muted">{l.tag}</p>
                <h3 className="font-serif text-4xl text-plum mt-1">{l.name}</h3>
                <p className="mt-4 text-muted leading-relaxed flex-1">{l.address}</p>
                <a href={l.maps} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-plum border-b border-plum pb-1 self-start hover:text-lilac-deep hover:border-lilac-deep">
                  Get directions <ArrowUpRight size={16} />
                </a>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.2} className="lg:col-span-5 bg-plum text-ivory p-8 md:p-10">
            <p className="text-[11px] uppercase tracking-[0.2em] text-lilac">Opening hours · all days</p>
            <dl className="mt-8 divide-y divide-ivory/10">
              <div className="flex justify-between py-4">
                <dt className="text-ivory/70">Ladies</dt>
                <dd className="font-serif text-2xl">10 am – 10 pm</dd>
              </div>
              <div className="flex justify-between py-4">
                <dt className="text-ivory/70">Gents</dt>
                <dd className="font-serif text-2xl">10 am – 12 am</dd>
              </div>
            </dl>
            <p className="mt-6 text-sm text-ivory/60 leading-relaxed">
              24-hour service is available for pre-booked appointments.
            </p>
            <div className="mt-10 grid grid-cols-2 gap-3">
              <a href={PHONE_TEL} className="border border-ivory/25 py-3.5 text-center text-sm font-semibold hover:bg-ivory hover:text-plum transition-colors">Call</a>
              <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="bg-lilac text-plum py-3.5 text-center text-sm font-semibold hover:bg-ivory transition-colors">WhatsApp</a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

const InstagramBand = () => (
  <section className="py-20 md:py-24">
    <div className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
      <Reveal>
        <p className="eyebrow mb-4">@abcdbeautyclinic</p>
        <h2 className="font-serif text-4xl md:text-5xl text-plum">See our latest work on <em className="text-lilac-deep">Instagram.</em></h2>
      </Reveal>
      <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" className="btn-ghost shrink-0">
        <Instagram size={18} /> Follow us
      </a>
    </div>
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
    <footer className="bg-[#1E1326] text-ivory pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid md:grid-cols-12 gap-12 pb-16 border-b border-ivory/10">
          <div className="md:col-span-5">
            <img src="/images/logo-white.png" alt="ABCD Beauty Clinic" className="h-11 w-auto opacity-90" />
            <p className="mt-8 font-serif text-3xl leading-snug text-ivory/90 max-w-sm">
              Beauty and confidence in Kanhangad & Cherkala, since 2018.
            </p>
          </div>
          <div className="md:col-span-2">
            <h4 className="text-[11px] uppercase tracking-[0.2em] text-ivory/40 mb-5">Explore</h4>
            <ul className="space-y-3 text-sm text-ivory/70">
              {NAVIGATION.map((n) => (
                <li key={n.name}><a href={n.href} className="hover:text-lilac">{n.name}</a></li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-2">
            <h4 className="text-[11px] uppercase tracking-[0.2em] text-ivory/40 mb-5">Hours</h4>
            <p className="text-sm text-ivory/70 leading-relaxed">Ladies 10 am – 10 pm<br />Gents 10 am – 12 am<br />Open all days</p>
          </div>
          <div className="md:col-span-3">
            <h4 className="text-[11px] uppercase tracking-[0.2em] text-ivory/40 mb-5">Contact</h4>
            <a href={PHONE_TEL} className="block text-sm text-ivory/70 hover:text-lilac">{PHONE_DISPLAY}</a>
            <div className="flex gap-3 mt-6">
              <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-11 h-11 border border-ivory/15 flex items-center justify-center hover:bg-lilac hover:text-plum hover:border-lilac transition-colors"><Instagram size={18} /></a>
              <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="w-11 h-11 border border-ivory/15 flex items-center justify-center hover:bg-lilac hover:text-plum hover:border-lilac transition-colors"><WhatsAppIcon size={18} /></a>
              <a href={PHONE_TEL} aria-label="Call" className="w-11 h-11 border border-ivory/15 flex items-center justify-center hover:bg-lilac hover:text-plum hover:border-lilac transition-colors"><Phone size={17} /></a>
            </div>
          </div>
        </div>
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-6 text-xs text-ivory/35">
          <p onClick={handleSecretClick} className="cursor-default select-none">© {new Date().getFullYear()} ABCD Beauty Clinic. All rights reserved.</p>
          <div className="flex gap-8 uppercase tracking-[0.18em]">
            <button onClick={onOpenPrivacy} className="hover:text-ivory">Privacy</button>
            <button onClick={onOpenTerms} className="hover:text-ivory">Terms</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

const WhatsAppFloatingButton = () => (
  <a
    href={WHATSAPP}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Chat on WhatsApp"
    className="fixed bottom-6 right-6 z-[90] w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-[0_12px_30px_-8px_rgba(37,211,102,0.6)] hover:scale-105 transition-transform"
  >
    <WhatsAppIcon size={28} />
  </a>
);

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
    <div className="fixed inset-0 z-[110] bg-ivory overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex justify-between items-start mb-12 gap-6">
          <div>
            <button onClick={onClose} className="flex items-center gap-2 text-lilac-deep mb-6 text-sm font-semibold">
              <ChevronLeft size={18} /> Back to site
            </button>
            <p className="eyebrow mb-3">Dashboard</p>
            <h2 className="font-serif text-5xl text-plum">Appointments</h2>
          </div>
          {user ? (
            <div className="flex items-center gap-4 bg-paper p-3 border border-line">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-plum">{user.displayName}</p>
                <p className="text-[11px] text-muted">{user.email}</p>
              </div>
              <button onClick={handleLogout} className="p-3 bg-ivory text-red-600 hover:bg-red-50" title="Log out">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button onClick={handleLogin} className="btn-primary">
              <Lock size={16} /> Log in
            </button>
          )}
        </div>

        {error && <div className="mb-8 p-5 bg-red-50 border border-red-100 text-red-700 text-center">{error}</div>}

        {isAdminUser ? (
          <div className="grid gap-4">
            {appointments.length === 0 ? (
              <div className="text-center py-20 bg-paper border border-dashed border-lavender-300">
                <Calendar className="mx-auto text-lilac mb-4" size={40} />
                <p className="text-muted">No bookings yet.</p>
              </div>
            ) : (
              appointments.map((app) => (
                <div key={app.id} className="bg-paper p-6 border border-line flex flex-col md:flex-row justify-between md:items-center gap-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold text-plum">{app.name}</h4>
                      <span
                        className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${
                          app.status === 'confirmed' ? 'bg-green-100 text-green-700' : app.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted">Service: <span className="text-plum">{app.service}</span></p>
                    <p className="text-sm text-muted">
                      Contact: <a href={`tel:${app.phone}`} className="text-lilac-deep underline">{app.phone}</a>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {app.status === 'pending' && (
                      <button onClick={() => updateStatus(app.id, 'confirmed')} className="bg-green-600 text-white px-5 py-2.5 text-sm font-semibold hover:bg-green-700">
                        Confirm
                      </button>
                    )}
                    <button onClick={() => updateStatus(app.id, 'cancelled')} className="bg-ivory text-muted px-5 py-2.5 text-sm font-semibold border border-line hover:text-plum">
                      Cancel
                    </button>
                    <button onClick={() => deleteBooking(app.id)} className="p-2.5 text-plum/30 hover:text-red-600" title="Delete permanently">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="text-center py-20 bg-paper border border-line">
            <p className="text-muted">Please log in with the admin account to view appointments.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const LegalOverlay = ({ isOpen, onClose, type }: { isOpen: boolean; onClose: () => void; type: 'privacy' | 'terms' }) => {
  if (!isOpen) return null;

  const content =
    type === 'privacy'
      ? {
          title: 'Privacy Policy',
          sections: [
            { title: 'Information Collection', text: 'We collect only the information needed to provide our services: your name and phone number when you request a booking.' },
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
    <div className="fixed inset-0 z-[110] bg-ivory overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-24">
        <button onClick={onClose} className="flex items-center gap-2 text-lilac-deep mb-12 text-sm font-semibold">
          <ChevronLeft size={18} /> Close
        </button>
        <h2 className="font-serif text-6xl text-plum mb-14">{content.title}</h2>
        <div className="space-y-12">
          {content.sections.map((s) => (
            <div key={s.title}>
              <h3 className="text-lg font-semibold text-plum mb-3">{s.title}</h3>
              <p className="text-muted leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
        <p className="mt-20 pt-10 border-t border-line text-sm text-muted">Last updated: April 2026.</p>
      </div>
    </div>
  );
};

export default function App() {
  const [adminOpen, setAdminOpen] = useState(false);
  const [legal, setLegal] = useState<{ open: boolean; type: 'privacy' | 'terms' }>({ open: false, type: 'privacy' });

  return (
    <div>
      <Navbar />
      <main>
        <Hero />
        <Ticker />
        <About />
        <Services />
        <Specialists />
        <Clinic />
        <Reviews />
        <Booking />
        <Visit />
        <InstagramBand />
      </main>
      <Footer
        onOpenAdmin={() => setAdminOpen(true)}
        onOpenPrivacy={() => setLegal({ open: true, type: 'privacy' })}
        onOpenTerms={() => setLegal({ open: true, type: 'terms' })}
      />
      <AdminSection isOpen={adminOpen} onClose={() => setAdminOpen(false)} />
      <LegalOverlay isOpen={legal.open} onClose={() => setLegal({ ...legal, open: false })} type={legal.type} />
      <WhatsAppFloatingButton />
    </div>
  );
}
