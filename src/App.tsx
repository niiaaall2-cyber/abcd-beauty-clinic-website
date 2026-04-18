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
  CheckCircle2
} from 'lucide-react';

// --- Constants & Types ---

const NAVIGATION = [
  { name: 'About', href: '#about' },
  { name: 'Services', href: '#services' },
  { name: 'Reviews', href: '#testimonials' },
  { name: 'Gallery', href: '#gallery' },
  { name: 'Find Us', href: '#findus' },
];

const SERVICES = [
  {
    id: 'haircut',
    title: 'Haircut & Styling',
    description: 'Precision cuts shaped to your face, finished with expert styling for the look you\'ve always wanted.',
    details: 'Our specialists analyze your hair texture, face shape, and lifestyle to recommend the perfect cut. Whether it\'s a classic trim, a bold new bob, or intricate layering, we ensure you leave with a look that turns heads.',
    icon: Scissors,
    image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&q=80',
    price: '₹200'
  },
  {
    id: 'smoothening',
    title: 'Hair Smoothening',
    description: 'Transform frizzy hair into silky, manageable perfection with our professional smoothening treatments.',
    details: 'Using premium products like L\'Oréal Professionnel and Schwarzkopf, we provide long-lasting smoothening that restores shine and eliminates frizz.',
    icon: Sparkles,
    image: 'https://images.unsplash.com/photo-1594465919760-441fe540f1f5?w=800&q=80',
    price: '₹2,500'
  },
  {
    id: 'coloring',
    title: 'Hair Coloring',
    description: 'Vibrant, long-lasting color from subtle balayage to bold transformations — expertly done every time.',
    details: 'From root touch-ups to creative global coloring and highlights, our experts use ammonia-free options to protect your hair while achieving the perfect shade.',
    icon: Palette,
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&q=80',
    price: '₹800'
  },
  {
    id: 'spa',
    title: 'Hair Spa',
    description: 'Deep conditioning and restorative treatments that bring life, shine, and strength back to your hair.',
    details: 'A multi-step process involving scalp massage, steaming, and nutrient-rich masks to combat dryness, dandruff, and hair fall.',
    icon: Droplet,
    image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800&q=80',
    price: '₹600'
  },
  {
    id: 'threading',
    title: 'Eyebrow & Threading',
    description: 'Perfectly shaped brows that frame your features beautifully — clean, precise, and painless.',
    details: 'Our experts specialize in threading for eyebrows, upper lip, and chin, ensuring sharp definitions and minimal discomfort.',
    icon: Eye,
    image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800&q=80',
    price: '₹40'
  },
  {
    id: 'skincare',
    title: 'Skin Care',
    description: 'Nourishing facials, clean-ups, and skin treatments for naturally glowing, healthy skin.',
    details: 'Offering Hydra-facials, Gold facials, and fruit clean-ups tailored to your skin type. We use biological products that deliver visible results.',
    icon: Smile,
    image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc2069?w=800&q=80',
    price: '₹500'
  },
  {
    id: 'bridal',
    title: 'Bridal Services',
    description: 'Complete bridal packages for your most special day — makeup, hair, and full beauty preparation.',
    details: 'Kerala traditional bridal looks, Christian weddings, and contemporary receptions. We handle everything from saree draping to HD makeup.',
    icon: Moon,
    image: 'https://images.unsplash.com/photo-1595152271333-5c02613ce991?w=800&q=80',
    price: '₹5,000'
  },
  {
    id: 'waxing',
    title: 'Waxing & Pedicure',
    description: 'Smooth, long-lasting results from expert waxing and indulgent pedicure treatments.',
    details: 'Hygienic waxing services using gentle wax, paired with a relaxing pedicure session that keeps your feet soft and happy.',
    icon: Star,
    image: 'https://images.unsplash.com/photo-1519415510236-855bc7bd4064?w=800&q=80',
    price: '₹300'
  },
];

const EXPERTS = [
  {
    name: "Uvais",
    specialty: "Master Hair Stylist",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    experience: "12+ Years"
  },
  {
    name: "Soumya",
    specialty: "Skin & Bridal Expert",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
    experience: "8+ Years"
  },
  {
    name: "Shaan",
    specialty: "Smoothening Specialist",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
    experience: "10+ Years"
  },
  {
    name: "Sandhya",
    specialty: "Beauty Consultant",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
    experience: "7+ Years"
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

const GALLERY_IMAGES = [
  { url: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&q=80', category: 'Hair Color' },
  { url: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=600&q=80', category: 'Bridal' },
  { url: 'https://images.unsplash.com/photo-1595152271333-5c02613ce991?w=600&q=80', category: 'Bridal Look' },
  { url: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc2069?w=600&q=80', category: 'Facial' },
  { url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80', category: 'Styling' },
  { url: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600&q=80', category: 'Threading' },
];

// --- Components ---

const Logo = ({ className = "", inverted = false }: { className?: string; inverted?: boolean }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src="/logo-official.png" 
        alt="ABCD Beauty Clinic" 
        className={`h-16 md:h-28 w-auto object-contain transition-all duration-300 ${inverted ? 'brightness-0 invert' : ''}`}
        referrerPolicy="no-referrer"
      />
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
              href="tel:+917012121125" 
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
            href="tel:+917012121125" 
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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-lavender-200 text-xs font-bold uppercase tracking-[0.2em] mb-8">
            <span className="w-2 h-2 bg-lavender-400 rounded-full animate-pulse shadow-[0_0_10px_#BC9EFF]" />
            Kanhangad's Premier Salon
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-6">
            Experience <br />
            <span className="italic font-serif text-lavender-300">Premium</span> Beauty
          </h1>
          <p className="text-xl text-lavender-100/60 max-w-lg mb-10 leading-relaxed font-light">
            Award-winning care for your aesthetic needs. Join 1000+ happy clients in Kanhangad for premium hair, skin, and bridal services.
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
                <img src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&q=80" className="rounded-3xl h-48 w-full object-cover" alt="Service" />
                <img src="https://images.unsplash.com/photo-1594465919760-441fe540f1f5?w=400&q=80" className="rounded-3xl h-48 w-full object-cover" alt="Service" />
             </div>
             <img src="https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800&q=80" className="rounded-3xl h-64 w-full object-cover" alt="Salon" />
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
              className="relative w-full max-w-2xl bg-mist rounded-[40px] overflow-hidden shadow-2xl"
            >
              <button 
                onClick={() => setSelectedService(null)}
                className="absolute top-6 right-6 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full text-purple-deep transition-colors"
              >
                <X size={24} />
              </button>
              <div className="h-64 relative overflow-hidden">
                <img src={selectedService.image} alt={selectedService.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-mist to-transparent" />
              </div>
              <div className="p-10 -mt-10 relative">
                <div className="inline-block p-4 rounded-3xl bg-white text-lavender-600 shadow-sm mb-6">
                  <selectedService.icon size={32} />
                </div>
                <h3 className="text-4xl font-bold text-purple-deep mb-2">{selectedService.title}</h3>
                <div className="text-xl font-bold text-lavender-600 mb-6">Starting from {selectedService.price}</div>
                <p className="text-lg text-text-muted leading-relaxed font-light italic mb-10">
                  {selectedService.details}
                </p>
                <div className="flex gap-4">
                  <a href="#booking" onClick={() => setSelectedService(null)} className="flex-1 bg-purple-deep text-white text-center py-5 rounded-3xl font-bold text-lg hover:bg-lavender-600 transition-colors">
                    Book Treatment
                  </a>
                  <a href={`https://wa.me/917012121125?text=I am interested in ${selectedService.title}`} target="_blank" className="bg-[#22C55E] text-white px-8 py-5 rounded-3xl font-bold flex items-center justify-center hover:bg-green-600 transition-colors">
                    <Phone size={24} />
                  </a>
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

const Gallery = () => {
  return (
    <section id="gallery" className="py-24 bg-mist">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-lavender-600 mb-4 block">Transformations</span>
          <h2 className="text-4xl font-bold mb-4 tracking-tight text-purple-deep">Beauty in Every Frame</h2>
          <p className="text-xl text-gray-400 font-light italic">Witness the magic of professional care.</p>
        </div>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {GALLERY_IMAGES.map((img, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              whileHover={{ y: -10 }}
              className="relative group rounded-[32px] overflow-hidden cursor-pointer shadow-lg"
            >
              <img src={img.url} alt={img.category} className="w-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-purple-ink/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8 backdrop-blur-[2px]">
                <span className="text-white font-bold bg-white/20 px-5 py-2.5 rounded-full border border-white/40 backdrop-blur-md">
                  {img.category}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
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
                <p className="text-xs uppercase tracking-[0.2em] text-white/40 font-bold mb-2">Let's talk</p>
                <a href="tel:+917012121125" className="text-2xl font-bold hover:text-lavender-400 transition-colors">070121 21125</a>
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

const Footer = () => {
  return (
    <footer className="bg-purple-darker py-16 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-2">
            <Logo className="mb-10" inverted={true} />
            <p className="text-white/40 max-w-sm text-lg font-light leading-relaxed italic">
              Empowering beauty and confidence in Kanhangad since 2015. Visit our unisex clinic for professional transformations.
            </p>
            <div className="flex gap-6 mt-12">
              <a href="https://www.instagram.com/abcdbeautyclinic?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-lavender-600 transition-all">
                <Instagram size={24} />
              </a>
              <a href="https://wa.me/917012121125" className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-green-600 transition-all">
                <Phone size={22} />
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-white/50 mb-8 font-bold">Services</h4>
            <ul className="space-y-4">
              {['Haircut', 'Smoothening', 'Coloring', 'Skin Care'].map(s => (
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
          <p className="text-sm text-white/20">© 2026 ABCD Beauty Clinic. All Professional Care.</p>
          <div className="flex gap-10">
            <a href="#" className="text-xs uppercase tracking-widest text-white/20 hover:text-white transition-colors">Privacy</a>
            <a href="#" className="text-xs uppercase tracking-widest text-white/20 hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

const BookingSection = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const name = formData.get('name');
    const service = formData.get('service');
    const msg = `Hi ABCD Beauty! I am ${name}. I want to book for ${service}.`;
    setTimeout(() => {
        window.open(`https://wa.me/917012121125?text=${encodeURIComponent(msg)}`, '_blank');
    }, 1500);
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
              <p className="text-gray-500 mb-10 italic text-lg">We're redirecting you to WhatsApp for instant confirmation...</p>
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
                    {SERVICES.map(s => <option key={s.id} value={s.title}>{s.title}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-lavender-400 ml-4">Phone Number</label>
                <input name="phone" required type="tel" placeholder="+91" className="w-full bg-white border border-lavender-100 rounded-3xl px-8 py-5 focus:outline-none focus:ring-2 focus:ring-lavender-400 transition-all text-purple-deep" />
              </div>
              <button type="submit" className="w-full bg-purple-deep text-white py-6 rounded-3xl font-bold text-xl hover:bg-lavender-600 hover:shadow-2xl transition-all flex items-center justify-center gap-4">
                Confirm Appointment
                <ArrowRight size={24} />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

const ExpertsSection = () => {
  return (
    <section id="experts" className="py-24 bg-mist">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-lavender-600 mb-4 block">Our Team</span>
          <h2 className="text-4xl font-bold tracking-tight text-purple-deep mb-4">Meet Our Professional Stylists</h2>
          <p className="text-gray-400 text-lg font-light italic">Artistry backed by years of experience.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {EXPERTS.map((expert, idx) => (
            <motion.div 
              key={expert.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -10 }}
              className="group bg-white rounded-[40px] p-4 shadow-sm hover:shadow-xl transition-all border border-lavender-100"
            >
              <div className="relative aspect-[4/5] rounded-[32px] overflow-hidden mb-6">
                <img src={expert.image} alt={expert.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-bold text-purple-deep uppercase tracking-widest shadow-sm">
                  {expert.experience}
                </div>
              </div>
              <div className="px-4 pb-4">
                <h4 className="text-xl font-bold text-purple-deep mb-1">{expert.name}</h4>
                <p className="text-lavender-500 font-medium text-sm">{expert.specialty}</p>
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
      href="https://wa.me/917012121125"
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

export default function App() {
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
              Since 2015, ABCD Beauty Clinic has been a sanctuary for beauty enthusiasts in Kanhangad. Founded on the principles of <span className="text-black font-medium">hygiene, precision, and hospitality</span>.
            </p>
          </div>
        </section>

        <ServicesSection />
        <ExpertsSection />
        <TestimonialsMarquee />
        <Gallery />
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
                      src={`https://picsum.photos/seed/beauty${i}/100/100`} 
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
      <Footer />
      <WhatsAppFloatingButton />
    </div>
  );
}

