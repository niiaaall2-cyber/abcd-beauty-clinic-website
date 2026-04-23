/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, FormEvent } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { 
  Scissors, 
  Sparkles, 
  Palette, 
  Droplet, 
  Eye, 
  Smile, 
  Moon, 
  Star,
  MapPin,
  Phone,
  Clock,
  Instagram,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle2,
  Lock,
  Calendar,
  LogOut,
  Trash2
} from 'lucide-react';
import { db, auth, googleProvider } from './lib/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';

// --- Constants & Types ---

const logoOfficial = "/images/logo.png";
const hero1 = "/images/hero1.png";
const hero2 = "/images/hero2.png";
const hero3 = "/images/hero3.png";

const ADMIN_EMAILS = ['niiaaall2@gmail.com'];

const NAVIGATION = [
  { name: 'About', href: '#about' },
  { name: 'Services', href: '#services' },
  { name: 'Reviews', href: '#testimonials' },
  { name: 'Find Us', href: '#findus' },
];

const SERVICES = [
  {
    id: 'hair-ladies',
    title: 'Hair Services (Ladies)',
    description: 'From precision cuts to high-fashion colors and restorative treatments.',
    icon: Scissors,
    image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&q=80',
    price: '₹300+',
    subcategories: [
      {
        name: 'Hair Cutting',
        items: [
          { name: 'U Cut', price: '₹400' },
          { name: 'V Cut', price: '₹400' },
          { name: 'Straight Cut', price: '₹300' },
          { name: 'Layer Cut (with wash)', price: '₹600' },
          { name: 'Step Cut (with wash)', price: '₹600' },
          { name: 'Feathered Cut (with wash)', price: '₹700' },
          { name: 'Bob Cut', price: '₹700' },
          { name: 'Pixie Cut', price: '₹800' }
        ]
      },
      {
        name: 'Hair Colouring',
        items: [
          { name: 'Global Hair Colour (Grey coverage)', price: '₹2200+' },
          { name: 'Root Touch-Up', price: '₹1500' },
          { name: 'Highlights (per strip)', price: '₹300' },
          { name: 'Balayage', price: '₹4000+' }
        ]
      },
      {
        name: 'Chemical Treatments',
        items: [
          { name: 'Smoothening', price: '₹4000 to ₹10,000' },
          { name: 'Keratin Treatment', price: '₹6000+' },
          { name: 'Botox Treatment', price: '₹7000+' }
        ]
      }
    ]
  },
  {
    id: 'skin-ladies',
    title: 'Skin Care (Ladies)',
    description: 'Nourishing facials, clean-ups, and skin-specific treatments.',
    icon: Smile,
    image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc2069?w=800&q=80',
    price: '₹500+',
    subcategories: [
      {
        name: 'Facials',
        items: [
          { name: 'Basic Facial', price: '₹1500' },
          { name: 'Premium Facial', price: '₹2500' },
          { name: 'Luxury / Hydra Facial', price: '₹4000' }
        ]
      },
      {
        name: 'Cleanup & De-Tan',
        items: [
          { name: 'Cleanup Basic', price: '₹600' },
          { name: 'De-Tan Basic', price: '₹500' },
          { name: 'Face Massage (20 mins)', price: '₹800+' }
        ]
      }
    ]
  },
  {
    id: 'advanced-clinical',
    title: 'Clinical Treatments',
    description: 'Advanced aesthetic and medical-grade skin and hair treatments.',
    icon: Sparkles,
    image: 'https://images.unsplash.com/photo-1594465919760-441fe540f1f5?w=800&q=80',
    price: '₹1500+',
    subcategories: [
      {
        name: 'Advanced Skin',
        items: [
          { name: 'Carbon Laser Toning', price: '₹6000' },
          { name: 'IPL Photo Laser', price: '₹5500' },
          { name: 'Microneedling', price: '₹6000' },
          { name: 'BB Glow Treatment', price: '₹6000' }
        ]
      },
      {
        name: 'Aesthetic',
        items: [
          { name: 'Microblading', price: '₹10,000' },
          { name: 'Lip Neutralizing', price: '₹4000' },
          { name: 'Beauty Spot', price: '₹500' }
        ]
      }
    ]
  },
  {
    id: 'bridal-packages',
    title: 'Bridal & Combos',
    description: 'Curated beauty packages for your most special day.',
    icon: Moon,
    image: 'https://images.unsplash.com/photo-1595152271333-5c02613ce991?w=800&q=80',
    price: '₹5,999+',
    subcategories: [
      {
        name: 'Packages',
        items: [
          { name: 'Silver Package', price: '₹5,999' },
          { name: 'Platinum Package', price: '₹9,999' },
          { name: 'Diamond Package', price: '₹14,999' }
        ]
      },
      {
        name: 'Special Services',
        items: [
          { name: 'Bridal Makeup', price: 'Consultation' },
          { name: 'Photography/Events', price: 'Custom' }
        ]
      }
    ]
  },
  {
    id: 'kids-hair',
    title: 'Kids Services',
    description: 'Gentle and stylish hair services for our youngest clients.',
    icon: Star,
    image: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&q=80',
    price: '₹200+',
    subcategories: [
      {
        name: 'Hair Cuts',
        items: [
          { name: 'Layer / Bob Cut', price: '₹500+' },
          { name: 'Butterfly / Feather', price: '₹700' },
          { name: 'Baby Cut', price: '₹300' }
        ]
      }
    ]
  },
  {
    id: 'mani-pedi',
    title: 'Mani & Pedi',
    description: 'Indulgent hand and foot care from basic grooming to premium luxury.',
    icon: Droplet,
    image: 'https://images.unsplash.com/photo-1519415510236-855bc7bd4064?w=800&q=80',
    price: '₹500+',
    subcategories: [
      {
        name: 'Treatments',
        items: [
          { name: 'Ordinary Mani/Pedi', price: '₹500/₹900' },
          { name: 'Classic Mani/Pedi', price: '₹700/₹1300' },
          { name: 'Premium Mani/Pedi', price: '₹1500/₹2000' }
        ]
      }
    ]
  },
  {
    id: 'waxing',
    title: 'Waxing Services',
    description: 'Smooth results with Regular and Premium Rica wax options.',
    icon: Sparkles,
    image: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800&q=80',
    price: '₹150+',
    subcategories: [
      {
        name: 'Body Waxing',
        items: [
          { name: 'Full Arm / Leg', price: '₹800/₹1200' },
          { name: 'Full Body', price: '₹4000' }
        ]
      },
      {
        name: 'Face (Rica)',
        items: [
          { name: 'Upper Lip / Chin', price: '₹150' },
          { name: 'Forehead / Side Lock', price: '₹150' },
          { name: 'Full Face', price: '₹500' }
        ]
      }
    ]
  },
  {
    id: 'makeup-events',
    title: 'Makeup & Events',
    description: 'Professional makeup for weddings, parties, and special occasions.',
    icon: Palette,
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&q=80',
    price: 'Custom',
    subcategories: [
      {
        name: 'Makeup',
        items: [
          { name: 'Bridal Makeup', price: 'Requirement base' },
          { name: 'Party Makeup', price: 'Requirement base' },
          { name: 'Reception Makeup', price: 'Requirement base' }
        ]
      },
      {
        name: 'Special Event Packages',
        items: [
          { name: 'Bridal Makeover', price: 'Custom' },
          { name: 'Costume & Events', price: 'Custom' },
          { name: 'Photography/Video', price: 'Custom' }
        ]
      }
    ]
  },
  {
    id: 'mens-hair-grooming',
    title: 'Men\'s Hair & Grooming',
    description: 'Precision cuts, beard styling, and advanced textures for the modern man.',
    icon: Scissors,
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80',
    price: '₹200+',
    subcategories: [
      {
        name: 'Classic & Luxury',
        items: [
          { name: 'Classic Haircut', price: '₹200' },
          { name: 'Beard Trimming / Shave', price: '₹150+' },
          { name: 'Haircut + Shaving (Wash)', price: '₹450' },
          { name: 'Beard Styling', price: '₹200' },
          { name: 'Luxury Grooming Combo', price: '₹600+' }
        ]
      },
      {
        name: 'Chemical & Scalp',
        items: [
          { name: 'Anti-Dandruff / Scalp Spa', price: '₹800+' },
          { name: 'Hair Smoothening / Keratin', price: '₹3500+' },
          { name: 'Hair / Beard Colouring', price: '₹600+' },
          { name: 'Fashion Colour / Highlights', price: '₹1200+' },
          { name: 'Head Massage (Oil/Normal)', price: '₹300+' }
        ]
      }
    ]
  },
  {
    id: 'mens-skin-aesthetic',
    title: 'Men\'s Skin & Aesthetics',
    description: 'Dermatological innovation meeting clinical precision for male skin health.',
    icon: Sparkles,
    image: 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=800&q=80',
    price: '₹600+',
    subcategories: [
      {
        name: 'Clinical Skin',
        items: [
          { name: 'Basic / Glow Cleanup', price: '₹600 / ₹1200' },
          { name: 'Premium Facial / Hydra', price: '₹2500 / ₹4500' },
          { name: 'Carbon Laser Toning', price: '₹6000' },
          { name: 'IPL Photo Facial / Hair Removal', price: 'Custom' },
          { name: 'Microneedling (Face/Hair)', price: '₹6000' }
        ]
      },
      {
        name: 'Cosmetic Services',
        items: [
          { name: 'Microblading / Shading', price: '₹10,000+' },
          { name: 'Lip Neutralizing / Colour', price: '₹4000+' },
          { name: 'Tattoo Removal', price: 'Consultation' },
          { name: 'Saggy Skin Tightening', price: '₹3500+' }
        ]
      }
    ]
  },
  {
    id: 'mens-packages-makeup',
    title: 'Men\'s Packages & Events',
    description: 'Complete transformation packages and specialized groom styling for events.',
    icon: Moon,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    price: '₹2,500+',
    subcategories: [
      {
        name: 'Transformation Packages',
        items: [
          { name: 'Glow Groom Package', price: '₹2500+' },
          { name: 'Booster Glow Up', price: '₹4000+' },
          { name: 'Gold Glow Up (Total Transform)', price: '₹7500+' }
        ]
      },
      {
        name: 'Professional Styling',
        items: [
          { name: 'Groom / Night Reception Makeup', price: '₹3000+' },
          { name: 'Nikkah / Special Event Makeup', price: '₹4000+' },
          { name: 'Costume Styling & Makeover', price: 'Custom' }
        ]
      }
    ]
  }
];

const SPECIALISTS = [
  {
    title: "Hair Specialists",
    description: "Master stylists specializing in precision cutting, clinical smoothening, and advanced ammonia-free transformations.",
    icon: Scissors,
    tag: "Artistry"
  },
  {
    title: "Skin Experts",
    description: "Certified professionals providing advanced hydra-facials, chemical peels, and restorative biological skin treatments.",
    icon: Sparkles,
    tag: "Clinical"
  },
  {
    title: "Professional Beauticians",
    description: "Experts in traditional and contemporary bridal makeup, saree draping, and meticulous aesthetic refinement.",
    icon: Palette,
    tag: "Precision"
  }
];

const TESTIMONIALS = [
  {
    name: "Thasneem Mohammad",
    text: "The smoothening was so perfect — I couldn't believe how silky my hair felt. Staffs are very helpful and caring. Had a wonderful time and will definitely be back.",
    staff: "Soumya",
    rating: 4.8
  },
  {
    name: "Haseena M C",
    text: "Absolutely thrilled! The salon's pristine ambiance was wonderful. Hair colour service was exceptional — especially Uvais's work!",
    staff: "Uvais",
    rating: 4.9
  },
  {
    name: "Aysha Kasim",
    text: "ABCD is the most comfortable salon for me. Sandhya is very friendly and kind. This is my forever salon — will recommend to everyone!",
    staff: "Sandhya",
    rating: 4.7
  },
  {
    name: "Nawaz Muhammed",
    text: "Totally satisfied by Asif's work and customer service. They really take care of you. 100% worth it.",
    staff: "Asif",
    rating: 4.4
  },
  {
    name: "Fathimath Nafila",
    text: "Amazing hospitality and service. Shaan did my hair — he is genuinely a perfectionist. Definitely suggesting to my friends.",
    staff: "Shaan",
    rating: 4.9
  },
  {
    name: "Shama N A",
    text: "I accidentally entered but now it's my forever spot! Staff are friendly, skilled, and made me feel very comfortable.",
    staff: "Team",
    rating: 4.6
  },
];

// --- Components ---

const Logo = ({ className = "", inverted = false }: { className?: string; inverted?: boolean }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img 
        src={logoOfficial} 
        alt="ABCD Beauty Clinic" 
        className={`h-12 md:h-16 w-auto object-contain transition-all duration-300 ${inverted ? 'brightness-0 invert' : ''}`}
      />
      <span className={`font-bold text-xl tracking-tight hidden sm:block ${inverted ? 'text-white' : 'text-purple-ink'}`}>
        ABCD Beauty Clinic
      </span>
    </div>
  );
};

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'py-2 apple-glass shadow-sm' : 'py-4 bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Logo inverted={!scrolled} />
        
          <div className="hidden md:flex items-center gap-10">
          {NAVIGATION.map((item) => (
            <a 
              key={item.name} 
              href={item.href} 
              className={`text-sm font-medium transition-colors relative group ${scrolled ? 'text-purple-deep hover:text-lavender-600' : 'text-white/80 hover:text-white'}`}
            >
              {item.name}
              <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-lavender-500 transition-all group-hover:w-full ${!scrolled && 'bg-white'}`} />
            </a>
          ))}
          <div className="flex items-center gap-3">
            <a 
              href="tel:+916238570877" 
              className={`hidden lg:flex w-10 h-10 rounded-full items-center justify-center border transition-all ${scrolled ? 'border-purple-deep/10 text-purple-deep hover:bg-purple-deep hover:text-white' : 'border-white/20 text-white hover:bg-white hover:text-purple-deep'}`}
            >
              <Phone size={18} />
            </a>
            <a 
              href="#booking" 
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all hover:-translate-y-0.5 ${scrolled ? 'bg-purple-deep text-white hover:bg-lavender-600' : 'bg-white text-purple-deep hover:bg-lavender-50'}`}
            >
              Book Now
            </a>
          </div>
        </div>

        <div className="md:hidden flex items-center gap-4">
          <a 
            href="tel:+916238570877" 
            className={`w-10 h-10 rounded-full flex items-center justify-center ${scrolled ? 'bg-purple-deep text-white shadow-lg' : 'bg-white text-purple-deep'}`}
          >
            <Phone size={18} />
          </a>
          <button 
            className={scrolled ? 'text-purple-deep' : 'text-white'}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : (
              <div className="space-y-1.5 flex flex-col items-end">
                <div className={`w-6 h-0.5 ${scrolled ? 'bg-purple-deep' : 'bg-white'}`}></div>
                <div className={`w-4 h-0.5 ${scrolled ? 'bg-purple-deep' : 'bg-white'}`}></div>
              </div>
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-full left-0 right-0 bg-white shadow-2xl overflow-hidden md:hidden"
          >
            <div className="p-8 flex flex-col gap-6">
              {NAVIGATION.map((item) => (
                <a 
                  key={item.name} 
                  href={item.href} 
                  className="text-2xl font-bold text-purple-deep"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <a 
                href="#booking" 
                className="mt-4 bg-purple-deep text-white text-center py-4 rounded-2xl font-bold"
                onClick={() => setMobileMenuOpen(false)}
              >
                Book Now
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = () => {
  return (
    <section className="relative min-h-[85vh] flex items-center pt-28 pb-16 overflow-hidden bg-purple-ink">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-ink via-purple-darker to-lavender-900/20" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-lavender-500/20 blur-[150px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-6">
            Experience Beauty, <br />
            Backed by <span className="italic font-serif text-lavender-300">Expertise</span>
          </h1>
          <p className="text-xl text-lavender-100/60 max-w-lg mb-10 leading-relaxed font-light">
            Founded in 2018, <span className="text-white font-semibold">ABCD Beauty Clinic</span> was built on one principle — <span className="text-lavender-300 italic font-medium">exceptional customer care</span>. <span className="text-lavender-300 font-medium">Trusted by 5,000+ clients</span>, we now bring our signature experience to Kanhangad, introducing advanced clinic-style beauty services inspired by Korean aesthetics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="#booking" className="bg-lavender-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-lavender-600 transition-all hover:shadow-[0_0_30px_rgba(128,69,245,0.4)] flex justify-center items-center gap-3">
              Book Now
            </a>
            <a href="#services" className="px-8 py-4 rounded-full font-bold text-lg border border-white/10 text-white bg-white/5 hover:bg-white/10 transition-all text-center">
              Our Services
            </a>
          </div>

          <div className="mt-20 flex items-center gap-12">
            <div>
              <div className="text-4xl font-bold text-white tracking-tight">4.6<span className="text-lavender-300 text-2xl">★</span></div>
              <p className="text-xs text-lavender-400 uppercase tracking-widest mt-2 font-medium">Google Rating</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-white tracking-tight">172+</div>
              <p className="text-xs text-lavender-400 uppercase tracking-widest mt-2 font-medium">Verified Reviews</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.3 }}
          className="relative hidden lg:block"
        >
          <div className="relative z-10 p-4 bg-white/5 border border-white/10 rounded-[40px] backdrop-blur-3xl overflow-hidden shadow-2xl">
             <div className="grid grid-cols-2 gap-4 mb-4">
                <img src={hero1} className="rounded-3xl h-48 w-full object-cover" alt="Service" />
                <img src={hero2} className="rounded-3xl h-48 w-full object-cover" alt="Service" />
             </div>
             <img src={hero3} className="rounded-3xl h-64 w-full object-cover" alt="Salon" />
          </div>
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-lavender-500 rounded-full blur-3xl opacity-50" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-600 rounded-full blur-3xl opacity-30" />
        </motion.div>
      </div>
    </section>
  );
};

const About = () => {
  return (
    <section id="about" className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-20 items-center">
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-[40px] overflow-hidden shadow-2xl z-20 relative"
            >
              <img src="https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800&q=80" alt="Salon interior" className="w-full h-full object-cover" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="absolute -bottom-10 -right-10 w-2/3 aspect-video rounded-3xl overflow-hidden border-8 border-white shadow-2xl"
            >
              <img src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80" alt="Specialist" className="w-full h-full object-cover" />
            </motion.div>
          </div>

          <div className="space-y-8">
            <div className="inline-block h-px w-12 bg-lavender-500 align-middle mr-4" />
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-lavender-600">Our Story</span>
            <h2 className="text-5xl font-bold tracking-tight text-purple-deep leading-tight">
              Where <span className="italic text-lavender-600">Beauty</span> <br />Meets Expertise
            </h2>
            <div className="space-y-6 text-lg text-gray-500 font-light leading-relaxed">
              <p>
                ABCD Beauty Clinic is Kanhangad's most trusted unisex salon — delivering premium hair, skin, and beauty services in a spotlessly clean and welcoming space.
              </p>
              <p>
                From everyday cuts to complete bridal packages, we treat every client like family. That is why so many call us their forever salon.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const ServicesSection = () => {
  const [selectedService, setSelectedService] = useState<typeof SERVICES[0] | null>(null);

  return (
    <section id="services" className="py-24 bg-mist">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-lavender-600 mb-4 block">What We Offer</span>
          <h2 className="text-4xl font-bold tracking-tight text-purple-deep mb-6">Our Services</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-lavender-500 to-transparent mx-auto" />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.map((service, idx) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group bg-white rounded-[32px] p-8 hover:shadow-2xl transition-all duration-500 border border-lavender-100 flex flex-col items-start cursor-pointer h-full"
              onClick={() => setSelectedService(service)}
            >
              <div className="mb-8 w-16 h-16 rounded-2xl bg-lavender-50 flex items-center justify-center text-lavender-600 group-hover:bg-lavender-600 group-hover:text-white transition-all duration-300">
                <service.icon size={30} />
              </div>
              <h3 className="text-xl font-bold text-purple-deep mb-4">{service.title}</h3>
              <p className="text-sm text-text-muted leading-relaxed mb-6 flex-grow">
                {service.description}
              </p>
              <div className="text-xs font-bold text-lavender-500 uppercase tracking-widest mt-auto group-hover:text-purple-deep transition-colors">
                Starting from <span className="text-lg ml-1">{service.price}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedService && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedService(null)}
              className="absolute inset-0 bg-purple-ink/80 backdrop-blur-md"
            />
            <motion.div 
              layoutId={selectedService.id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-purple-ink rounded-[40px] overflow-hidden shadow-2xl max-h-[90vh] flex flex-col border border-white/10"
            >
              <button 
                onClick={() => setSelectedService(null)}
                className="absolute top-6 right-6 z-20 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-md"
              >
                <X size={24} />
              </button>
              <div className="overflow-y-auto flex-grow custom-scrollbar overscroll-contain">
                <div className="p-10 relative">
                  <div className="inline-block p-4 rounded-3xl bg-white/10 text-lavender-300 shadow-sm mb-6">
                    <selectedService.icon size={32} />
                  </div>
                  <h3 className="text-4xl font-bold text-white mb-2">{selectedService.title}</h3>
                  <div className="text-xl font-bold text-lavender-400 mb-8">Service Menu</div>
                  
                  <div className="space-y-10 mb-12">
                    {selectedService.subcategories?.map((cat) => (
                      <div key={cat.name}>
                        <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-white/40 mb-4">{cat.name}</h4>
                        <div className="space-y-3">
                          {cat.items.map((item) => (
                            <div key={item.name} className="flex justify-between items-center py-3 border-b border-white/5">
                              <span className="text-white/90 font-medium">{item.name}</span>
                              <span className="text-lavender-300 font-bold">{item.price}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-4 sticky bottom-0 pt-6 bg-purple-ink/90 backdrop-blur-md pb-4">
                    <a href="#booking" onClick={() => setSelectedService(null)} className="flex-1 bg-lavender-500 text-white text-center py-5 rounded-3xl font-bold text-lg hover:bg-lavender-600 transition-colors">
                      Book Treatment
                    </a>
                    <a href={`https://wa.me/916238570877?text=I am interested in ${selectedService.title}`} target="_blank" className="bg-[#22C55E] text-white px-8 py-5 rounded-3xl font-bold flex items-center justify-center hover:bg-green-600 transition-colors" title="Chat on WhatsApp">
                      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.539 2.016 2.041-.536c1.01.623 1.956.955 3.251.956 3.181 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.767-5.772-5.767zm3.377 8.272c-.14.393-.812.756-1.12.784-.285.026-.642.152-1.812-.332-1.498-.619-2.459-2.15-2.534-2.25-.075-.1-.611-.812-.611-1.55 0-.737.387-1.1.527-1.253.14-.153.307-.19.41-.19.102 0 .204.001.292.006.091.004.215-.035.337.257.123.292.42 1.022.457 1.096.037.074.062.161.012.261-.05.1-.075.161-.149.25-.1.124-.2.224-.287.323-.087.1-.177.211-.077.383.1.171.442.73.948 1.18.653.58 1.203.76 1.374.846.171.086.271.071.371-.044.1-.114.426-.496.539-.666.113-.17.227-.142.383-.085s.988.468 1.158.553c.17.085.284.128.326.202.04.072.04.42-.1.813z"/></svg>
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

const TestimonialsMarquee = () => {
  return (
    <section id="testimonials" className="py-24 overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto px-6 mb-16 text-center">
        <span className="text-xs font-bold uppercase tracking-[0.3em] text-lavender-600 mb-4 block">Client Stories</span>
        <h2 className="text-4xl font-bold tracking-tight text-purple-deep mb-4">What Our Clients Say</h2>
        <p className="text-gray-400 text-lg font-light italic">Rated 4.6/5 by 172+ clients in Kanhangad.</p>
      </div>

      <div className="relative flex overflow-x-hidden group">
        <motion.div 
          animate={{ x: ["0%", "-50%"] }}
          transition={{ 
            duration: 40, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="flex whitespace-nowrap py-10"
        >
          {[...TESTIMONIALS, ...TESTIMONIALS].map((t, idx) => (
            <div 
              key={idx}
              className="inline-block w-[450px] mx-4 bg-mist rounded-[32px] p-10 border border-lavender-100 shadow-sm transition-all whitespace-normal group-hover:pause"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex flex-col gap-1.5">
                  <div className="flex gap-0.5 text-yellow-400">
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill={idx % 2 === 0 ? "currentColor" : "none"} />
                  </div>
                  <span className="text-[10px] font-bold text-lavender-400 uppercase tracking-[0.2em]">{t.rating} / 5.0 Rating</span>
                </div>
                <div className="text-4xl font-serif text-lavender-200 leading-none">“</div>
              </div>
              <p className="text-text-muted text-lg leading-relaxed italic mb-8">
                "{t.text}"
              </p>
              <div className="flex items-center gap-4 pt-6 border-t border-lavender-100">
                <div className="w-12 h-12 rounded-full bg-lavender-200 flex items-center justify-center text-purple-deep font-bold">
                  {t.name[0]}
                </div>
                <div>
                  <p className="font-bold text-purple-deep">{t.name}</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const FindUs = () => {
  return (
    <section id="findus" className="py-28 relative bg-purple-ink text-white overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-purple-darker to-purple-ink" />
      
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-lavender-400 mb-6 block">Visit Us</span>
          <h2 className="text-5xl font-bold mb-10 tracking-tight">
            Come Visit <span className="italic text-lavender-400">ABCD</span>
          </h2>
          
          <div className="space-y-10">
            <div className="flex gap-6 items-start">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <MapPin className="text-lavender-400" size={28} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/40 font-bold mb-2">Location</p>
                <p className="text-xl font-light leading-relaxed">
                  Near 100HP Car Dealers, Madiyan, Manikoth,<br /> Kanhangad, Kerala — 671316
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <Phone className="text-lavender-400" size={28} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/40 font-bold mb-2">Get in touch</p>
                <div className="space-y-4">
                  <div>
                    <span className="text-xs text-white/40 uppercase tracking-widest block mb-1">Call Us</span>
                    <a href="tel:+916238570877" className="text-2xl font-bold hover:text-lavender-400 transition-colors">062385 70877</a>
                  </div>
                  <div>
                    <span className="text-xs text-white/40 uppercase tracking-widest block mb-1">WhatsApp</span>
                    <a href="https://wa.me/916238570877" target="_blank" rel="noopener noreferrer" className="text-2xl font-bold text-[#25D366] hover:text-green-400 transition-colors">062385 70877</a>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <Clock className="text-lavender-400" size={28} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/40 font-bold mb-2">Open Hours</p>
                <p className="text-xl font-light">Mon – Sat: 9AM – 8PM<br />Sun: 10AM – 6PM</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="relative mb-12">
             <motion.div 
               animate={{ scale: [1, 1.4, 1.8], opacity: [0.4, 0.1, 0] }}
               transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
               className="absolute inset-0 border-2 border-lavender-400 rounded-full"
             />
             <motion.div 
               animate={{ scale: [1, 1.4, 1.8], opacity: [0.4, 0.1, 0] }}
               transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut", delay: 0.8 }}
               className="absolute inset-0 border-2 border-lavender-400 rounded-full"
             />

             {/* Moving Icon */}
             <motion.div 
               animate={{ y: [0, -20, 0] }}
               transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
               className="relative z-10 w-40 h-40 bg-gradient-to-br from-lavender-400 to-lavender-600 rounded-[50px] flex items-center justify-center shadow-[0_0_60px_rgba(157,110,255,0.4)]"
             >
                <MapPin size={80} className="text-white drop-shadow-2xl" />
             </motion.div>
          </div>
          
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-3">Finding Your Way</h3>
            <p className="text-lavender-200/50 font-light italic">In the heart of Manikoth, Kanhangad.</p>
          </div>

          <motion.a 
            href="https://www.google.com/maps/search/?api=1&query=ABCD+Beauty+Clinic+Kanhangad+Kerala" 
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-4 bg-white text-purple-ink px-12 py-5 rounded-full font-bold text-xl hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all"
          >
            Find Us on Maps
            <ArrowRight size={24} />
          </motion.a>
        </div>
      </div>
    </section>
  );
};

const Footer = ({ onOpenAdmin, onOpenPrivacy, onOpenTerms }: { onOpenAdmin: () => void, onOpenPrivacy: () => void, onOpenTerms: () => void }) => {
  const [clickCount, setClickCount] = useState(0);
  
  const handleSecretClick = () => {
    setClickCount(prev => prev + 1);
    if (clickCount + 1 >= 5) {
      onOpenAdmin();
      setClickCount(0);
    }
    // Reset count after 2 seconds of inactivity
    setTimeout(() => setClickCount(0), 3000);
  };

  return (
    <footer className="bg-purple-darker py-16 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-2">
            <Logo className="mb-10" inverted={true} />
            <p className="text-white/40 max-w-sm text-lg font-light leading-relaxed italic">
              Empowering beauty and confidence in Kanhangad since 2018. Visit our unisex clinic for professional transformations.
            </p>
            <div className="flex gap-6 mt-12">
              <a href="https://www.instagram.com/abcdbeautyclinic?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-lavender-600 transition-all">
                <Instagram size={24} />
              </a>
              <a href="tel:+916238570877" className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-lavender-600 transition-all" title="Call Us">
                <Phone size={22} />
              </a>
              <a href="https://wa.me/916238570877" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-green-600 transition-all" title="WhatsApp Us">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.539 2.016 2.041-.536c1.01.623 1.956.955 3.251.956 3.181 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.767-5.772-5.767zm3.377 8.272c-.14.393-.812.756-1.12.784-.285.026-.642.152-1.812-.332-1.498-.619-2.459-2.15-2.534-2.25-.075-.1-.611-.812-.611-1.55 0-.737.387-1.1.527-1.253.14-.153.307-.19.41-.19.102 0 .204.001.292.006.091.004.215-.035.337.257.123.292.42 1.022.457 1.096.037.074.062.161.012.261-.05.1-.075.161-.149.25-.1.124-.2.224-.287.323-.087.1-.177.211-.077.383.1.171.442.73.948 1.18.653.58 1.203.76 1.374.846.171.086.271.071.371-.044.1-.114.426-.496.539-.666.113-.17.227-.142.383-.085s.988.468 1.158.553c.17.085.284.128.326.202.04.072.04.42-.1.813z"/></svg>
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-white/50 mb-8 font-bold">Quick Links</h4>
            <ul className="space-y-4">
              {['Hair Services', 'Skin Care', 'Clinical', 'Bridal'].map(s => (
                <li key={s}><a href="#services" className="text-white/30 hover:text-lavender-300 transition-colors font-light">{s}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-white/50 mb-8 font-bold">Hours</h4>
            <div className="text-white/30 font-light space-y-2">
              <p>Mon – Sat: 9AM – 8PM</p>
              <p>Sun: 10AM – 6PM</p>
            </div>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-white/50 mb-8 font-bold">Location</h4>
            <p className="text-white/30 font-light leading-relaxed">
              Madiyan, Manikoth,<br /> Kanhangad, Kerala — 671316
            </p>
          </div>
        </div>
        <div className="pt-12 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-8">
          <p 
            onClick={handleSecretClick}
            className="text-sm text-white/20 cursor-default select-none"
          >
            © 2026 ABCD Beauty Clinic. All Professional Care.
          </p>
          <div className="flex gap-10">
            <button onClick={onOpenPrivacy} className="text-xs uppercase tracking-widest text-white/20 hover:text-white transition-colors">Privacy</button>
            <button onClick={onOpenTerms} className="text-xs uppercase tracking-widest text-white/20 hover:text-white transition-colors">Terms</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

const BookingSection = () => {
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
      userId: auth.currentUser?.uid || 'anonymous'
    };

    try {
      await addDoc(collection(db, 'appointments'), appointmentData);
      
      // Format the WhatsApp message
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
      const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
      
      const message = `🔔 New Booking Alert!\n\nDate: ${dateStr}\nTime: ${timeStr}\n\nName: ${appointmentData.name}\nService: ${appointmentData.service}\nPhone: ${appointmentData.phone}`;
      const encodedMessage = encodeURIComponent(message);
      
      // Open WhatsApp in a new tab
      window.open(`https://wa.me/916238570877?text=${encodedMessage}`, '_blank');

      setSubmitted(true);
    } catch (error) {
      console.error("Error saving appointment:", error);
      alert("Something went wrong. Please call us directly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="booking" className="py-32 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-lavender-600 mb-4 block">Appointments</span>
          <h2 className="text-6xl font-bold tracking-tight text-purple-deep mb-4">Book Your Visit</h2>
          <p className="text-xl text-gray-400 font-light italic">Confirmation within the hour.</p>
        </div>

        <div className="bg-mist p-10 md:p-16 rounded-[48px] relative overflow-hidden border border-lavender-100 shadow-xl">
          {submitted ? (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-10"
            >
              <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 size={48} />
              </div>
              <h3 className="text-4xl font-bold text-purple-deep mb-4">Request Sent!</h3>
              <p className="text-gray-500 mb-10 italic text-lg">Thank you for booking. We will contact you shortly for confirmation.</p>
              <button 
                onClick={() => setSubmitted(false)}
                className="text-sm font-bold text-lavender-600 hover:underline"
              >
                Go Back
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-lavender-400 ml-4">Full Name</label>
                  <input name="name" required type="text" placeholder="Your Name" className="w-full bg-white border border-lavender-100 rounded-3xl px-8 py-5 focus:outline-none focus:ring-2 focus:ring-lavender-400 transition-all text-purple-deep" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-lavender-400 ml-4">Service</label>
                  <select name="service" required className="w-full bg-white border border-lavender-100 rounded-3xl px-8 py-5 focus:outline-none focus:ring-2 focus:ring-lavender-400 transition-all text-purple-deep appearance-none">
                    <option value="">Select Service</option>
                    {SERVICES.map(category => (
                      <optgroup key={category.id} label={category.title}>
                        {category.subcategories?.map(sub => (
                          sub.items.map(item => (
                            <option key={`${category.id}-${item.name}`} value={item.name}>
                              {item.name}
                            </option>
                          ))
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-lavender-400 ml-4">Phone Number</label>
                <input name="phone" required type="tel" placeholder="+91" className="w-full bg-white border border-lavender-100 rounded-3xl px-8 py-5 focus:outline-none focus:ring-2 focus:ring-lavender-400 transition-all text-purple-deep" />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-purple-deep text-white py-6 rounded-3xl font-bold text-xl hover:bg-lavender-600 hover:shadow-2xl transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Confirm Appointment'}
                <ArrowRight size={24} />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

const AdminSection = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [user, setUser] = useState<User | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const isAdminUser = user?.email && ADMIN_EMAILS.includes(user.email);

  useEffect(() => {
    if (isAdminUser) {
      setError(null);
      const q = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setAppointments(docs);
      }, (err) => {
        console.error("Firestore error:", err);
        setError("Permission Denied: You do not have access to view these records.");
      });
      return () => unsubscribe();
    } else if (user) {
      setError(`Access Denied: ${user.email} is not an authorized administrator.`);
    }
  }, [user, isAdminUser]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
      setError("Login failed. Please try again.");
    }
  };

  const handleLogout = () => {
    signOut(auth);
    setAppointments([]);
    setError(null);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'appointments', id), { status: newStatus });
    } catch (e) {
      console.error(e);
    }
  };

  const deleteBooking = async (id: string) => {
    if (confirm("Delete this appointment?")) {
      await deleteDoc(doc(db, 'appointments', id));
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-white overflow-y-auto"
      >
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex justify-between items-start mb-12">
            <div>
              <button 
                onClick={onClose}
                className="flex items-center gap-2 text-lavender-600 mb-6 font-bold hover:translate-x-[-4px] transition-transform"
              >
                <ChevronLeft size={20} />
                Back to Site
              </button>
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-lavender-600 mb-4 block">Dashboard</span>
              <h2 className="text-4xl font-bold tracking-tight text-purple-deep">Admin Panel</h2>
            </div>
            {user ? (
              <div className="flex items-center gap-4 bg-mist p-3 rounded-2xl border border-lavender-100">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-purple-deep">{user.displayName}</p>
                  <p className="text-[10px] text-gray-400">{user.email}</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-3 bg-white text-red-500 rounded-xl hover:bg-red-50 transition-colors shadow-sm"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                className="bg-purple-deep text-white px-8 py-3 rounded-full font-bold flex items-center gap-3 hover:bg-lavender-600 transition-all shadow-lg"
              >
                <Lock size={18} />
                Login to Dashboard
              </button>
            )}
          </div>

          {error && (
            <div className="mb-8 p-6 bg-red-50 border border-red-100 rounded-3xl text-red-600 font-medium text-center">
              {error}
            </div>
          )}

          {isAdminUser ? (
            <div className="grid gap-6">
              {appointments.length === 0 ? (
                <div className="text-center py-20 bg-mist rounded-[40px] border-2 border-dashed border-lavender-200">
                  <Calendar className="mx-auto text-lavender-300 mb-4" size={48} />
                  <p className="text-gray-400 italic">No bookings found yet.</p>
                </div>
              ) : (
                appointments.map((app) => (
                  <motion.div 
                    layout
                    key={app.id}
                    className="bg-mist p-8 rounded-[32px] border border-lavender-100 flex flex-col md:flex-row justify-between items-center gap-8 group hover:shadow-xl transition-all"
                  >
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-xl font-bold text-purple-deep">{app.name}</h4>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                          app.status === 'confirmed' ? 'bg-green-100 text-green-600' : 
                          app.status === 'cancelled' ? 'bg-red-100 text-red-600' : 
                          'bg-yellow-100 text-yellow-600'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 font-medium mb-1">Service: <span className="text-purple-deep">{app.service}</span></p>
                      <p className="text-sm text-gray-500 font-medium">Contact: <a href={`tel:${app.phone}`} className="text-lavender-600 hover:underline">{app.phone}</a></p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {app.status === 'pending' && (
                        <button 
                          onClick={() => updateStatus(app.id, 'confirmed')}
                          className="bg-green-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-green-600 transition-colors shadow-sm"
                        >
                          Confirm
                        </button>
                      )}
                      <button 
                        onClick={() => updateStatus(app.id, 'cancelled')}
                        className="bg-white text-gray-400 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors border border-lavender-100 shadow-sm"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => deleteBooking(app.id)}
                        className="p-2.5 text-gray-300 hover:text-red-500 transition-colors"
                        title="Delete Permanently"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          ) : (
            <div className="text-center py-20 bg-mist rounded-[40px] border border-lavender-100">
              <p className="text-gray-400 italic">Please log in with the admin account to view appointments.</p>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

const SpecialistsSection = () => {
  return (
    <section id="specialists" className="py-24 bg-mist">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-lavender-600 mb-4 block">Expertise</span>
          <h2 className="text-4xl font-bold tracking-tight text-purple-deep mb-4">Our Specializations</h2>
          <p className="text-gray-400 text-lg font-light italic">Artistry backed by scientific precision and decades of experience.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {SPECIALISTS.map((spec, idx) => (
            <motion.div 
              key={spec.title}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group bg-white rounded-[40px] p-10 shadow-sm hover:shadow-2xl transition-all duration-500 border border-lavender-100 flex flex-col items-center text-center"
            >
              <div className="w-24 h-24 rounded-3xl bg-lavender-50 flex items-center justify-center text-lavender-600 mb-8 group-hover:bg-purple-deep group-hover:text-white transition-all duration-500">
                <spec.icon size={48} />
              </div>
              <div className="px-4">
                <h4 className="text-2xl font-bold text-purple-deep mb-3 uppercase tracking-tight">{spec.title}</h4>
                <p className="text-gray-500 font-light text-sm leading-relaxed italic">{spec.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const WhatsAppFloatingButton = () => {
  return (
    <motion.a
      href="https://wa.me/916238570877"
      target="_blank"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-8 right-8 z-[90] w-16 h-16 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl hover:shadow-[#25D366]/40 transition-shadow"
    >
      <div className="absolute -top-1 -right-1 flex h-4 w-4">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-white"></span>
      </div>
      <Phone size={32} />
    </motion.a>
  );
};

const LegalOverlay = ({ isOpen, onClose, type }: { isOpen: boolean, onClose: () => void, type: 'privacy' | 'terms' }) => {
  if (!isOpen) return null;

  const content = type === 'privacy' ? {
    title: "Privacy Policy",
    sections: [
      {
        title: "Information Collection",
        text: "We collect only the most essential information needed to provide our services. This includes your name and phone number when you request a booking."
      },
      {
        title: "How We Use Your Data",
        text: "Your contact details are used exclusively for scheduling and confirming your appointments at ABCD Beauty Clinic. We do not sell or trade your data with any third parties."
      },
      {
        title: "Security",
        text: "We implement industry-standard security measures to protect your personal information from unauthorized access or disclosure."
      }
    ]
  } : {
    title: "Terms of Service",
    sections: [
      {
        title: "Booking Policy",
        text: "Appointments are subject to availability. We recommend booking in advance to secure your preferred time slot."
      },
      {
        title: "Cancellation Policy",
        text: "We value your time and ours. If you need to cancel or reschedule, please inform us at least 2 hours before your appointment to avoid potential service fees."
      },
      {
        title: "Health & Safety",
        text: "Please inform us of any medical conditions or allergies prior to your treatment. ABCD Beauty Clinic is not liable for reactions if information was withheld."
      }
    ]
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[110] bg-white/95 backdrop-blur-xl overflow-y-auto"
      >
        <div className="max-w-3xl mx-auto px-6 py-24">
          <button 
            onClick={onClose}
            className="flex items-center gap-2 text-lavender-600 mb-12 font-bold hover:translate-x-[-4px] transition-transform"
          >
            <ChevronLeft size={20} />
            Close
          </button>

          <h2 className="text-5xl font-bold text-purple-deep mb-16 tracking-tight">{content.title}</h2>
          
          <div className="space-y-16">
            {content.sections.map((section, idx) => (
              <div key={idx}>
                <h3 className="text-xl font-bold text-purple-ink mb-4">{section.title}</h3>
                <p className="text-gray-500 leading-relaxed text-lg font-light">
                  {section.text}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-24 pt-12 border-t border-gray-100 italic text-gray-400 text-sm">
            Last updated: April 2026. ABCD Beauty Clinic Reserve all rights.
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default function App() {
  const [adminOpen, setAdminOpen] = useState(false);
  const [legalOpen, setLegalOpen] = useState<{ open: boolean, type: 'privacy' | 'terms' }>({ open: false, type: 'privacy' });

  return (
    <div className="selection:bg-lavender-100 selection:text-lavender-900">
      <Navbar />
      <main>
        <Hero />
        
        {/* About Section - Brief Intro */}
        <section id="about" className="py-32 bg-white flex items-center justify-center">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <motion.h2 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-bold italic tracking-tight mb-12"
            >
              "Where expertise <span className="text-gray-300">meets</span> warmth."
            </motion.h2>
            <p className="text-xl md:text-2xl text-gray-500 font-light leading-relaxed italic">
              Since 2018, ABCD Beauty Clinic has been a sanctuary for beauty enthusiasts in Kanhangad. Founded on the principles of <span className="text-black font-medium">hygiene, precision, and hospitality</span>.
            </p>
          </div>
        </section>

        <ServicesSection />
        <SpecialistsSection />
        <TestimonialsMarquee />
        <BookingSection />
        <FindUs />

        {/* Instagram CTA Section */}
        <section className="py-20 bg-mist border-t border-lavender-100">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-center gap-8"
            >
              <div className="flex -space-x-4 mb-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-12 h-12 rounded-full border-2 border-white overflow-hidden shadow-md">
                    <img 
                      src={`https://images.unsplash.com/photo-${i === 1 ? '1494790108377-be9c29b29330' : i === 2 ? '1507003211169-0a1dd7228f2d' : i === 3 ? '1534528741775-53994a69daeb' : '1500648767791-00dcc994a43e'}?w=200&h=200&fit=crop`} 
                      alt="Reviewer" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                <div className="w-12 h-12 rounded-full border-2 border-white bg-lavender-50 flex items-center justify-center text-[10px] font-bold text-lavender-600 shadow-md">
                  +1k
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-purple-deep mb-2">Join our community</h3>
                <p className="text-gray-500 italic">Get daily beauty tips and behind-the-scenes magic.</p>
              </div>
              <a 
                href="https://www.instagram.com/abcdbeautyclinic?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white text-purple-deep border border-lavender-200 px-10 py-5 rounded-full font-bold text-lg hover:shadow-xl transition-all flex items-center gap-3 group"
              >
                <Instagram size={24} className="text-lavender-500 group-hover:scale-110 transition-transform" />
                Find Us on Instagram
              </a>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer 
        onOpenAdmin={() => setAdminOpen(true)} 
        onOpenPrivacy={() => setLegalOpen({ open: true, type: 'privacy' })}
        onOpenTerms={() => setLegalOpen({ open: true, type: 'terms' })}
      />
      <AdminSection isOpen={adminOpen} onClose={() => setAdminOpen(false)} />
      <LegalOverlay 
        isOpen={legalOpen.open} 
        onClose={() => setLegalOpen({ ...legalOpen, open: false })} 
        type={legalOpen.type} 
      />
      <WhatsAppFloatingButton />
    </div>
  );
}

