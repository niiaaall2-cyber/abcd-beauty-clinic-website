/**
 * Service menu + prices.
 * When the clinic sends the new menu card, update ONLY this file —
 * the services section, price drawer and booking dropdown all read from here.
 */

export type MenuItem = { name: string; price: string };
export type MenuGroup = { name: string; items: MenuItem[] };
export type ServiceCategory = {
  id: string;
  audience: 'her' | 'him';
  title: string;
  description: string;
  image: string;
  from: string;
  groups: MenuGroup[];
};

const u = (id: string) => `https://images.unsplash.com/photo-${id}?w=900&q=80&auto=format&fit=crop`;

export const SERVICES: ServiceCategory[] = [
  {
    id: 'hair-ladies',
    audience: 'her',
    title: 'Hair',
    description: 'Precision cuts, colour and restorative treatments.',
    image: u('1522337360788-8b13dee7a37e'),
    from: '₹300',
    groups: [
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
          { name: 'Pixie Cut', price: '₹800' },
        ],
      },
      {
        name: 'Hair Colouring',
        items: [
          { name: 'Global Hair Colour (Grey coverage)', price: '₹2200+' },
          { name: 'Root Touch-Up', price: '₹1500' },
          { name: 'Highlights (per strip)', price: '₹300' },
          { name: 'Balayage', price: '₹4000+' },
        ],
      },
      {
        name: 'Chemical Treatments',
        items: [
          { name: 'Smoothening', price: '₹4000 – ₹10,000' },
          { name: 'Keratin Treatment', price: '₹6000+' },
          { name: 'Botox Treatment', price: '₹7000+' },
        ],
      },
    ],
  },
  {
    id: 'skin-ladies',
    audience: 'her',
    title: 'Skin & Facials',
    description: 'Nourishing facials, clean-ups and de-tan rituals.',
    image: u('1616394584738-fc6e612e71b9'),
    from: '₹500',
    groups: [
      {
        name: 'Facials',
        items: [
          { name: 'Basic Facial', price: '₹1500' },
          { name: 'Premium Facial', price: '₹2500' },
          { name: 'Luxury / Hydra Facial', price: '₹4000' },
        ],
      },
      {
        name: 'Cleanup & De-Tan',
        items: [
          { name: 'Cleanup Basic', price: '₹600' },
          { name: 'De-Tan Basic', price: '₹500' },
          { name: 'Face Massage (20 mins)', price: '₹800+' },
        ],
      },
    ],
  },
  {
    id: 'advanced-clinical',
    audience: 'her',
    title: 'Clinical Treatments',
    description: 'Korean-inspired, clinic-grade skin and aesthetic care.',
    image: u('1552693673-1bf958298935'),
    from: '₹500',
    groups: [
      {
        name: 'Advanced Skin',
        items: [
          { name: 'Carbon Laser Toning', price: '₹6000' },
          { name: 'IPL Photo Laser', price: '₹5500' },
          { name: 'Microneedling', price: '₹6000' },
          { name: 'BB Glow Treatment', price: '₹6000' },
        ],
      },
      {
        name: 'Aesthetic',
        items: [
          { name: 'Microblading', price: '₹10,000' },
          { name: 'Lip Neutralizing', price: '₹4000' },
          { name: 'Beauty Spot', price: '₹500' },
        ],
      },
    ],
  },
  {
    id: 'bridal-packages',
    audience: 'her',
    title: 'Bridal & Makeup',
    description: 'Packages and makeup for weddings, parties and receptions.',
    image: u('1487412947147-5cebf100ffc2'),
    from: '₹5,999',
    groups: [
      {
        name: 'Bridal Packages',
        items: [
          { name: 'Silver Package', price: '₹5,999' },
          { name: 'Platinum Package', price: '₹9,999' },
          { name: 'Diamond Package', price: '₹14,999' },
        ],
      },
      {
        name: 'Makeup',
        items: [
          { name: 'Bridal Makeup', price: 'On consultation' },
          { name: 'Party Makeup', price: 'On requirement' },
          { name: 'Reception Makeup', price: 'On requirement' },
        ],
      },
      {
        name: 'Special Events',
        items: [
          { name: 'Bridal Makeover', price: 'Custom' },
          { name: 'Costume & Events', price: 'Custom' },
          { name: 'Photography / Video', price: 'Custom' },
        ],
      },
    ],
  },
  {
    id: 'mani-pedi',
    audience: 'her',
    title: 'Hands & Feet',
    description: 'Manicure and pedicure, from classic to premium.',
    image: u('1607779097040-26e80aa78e66'),
    from: '₹500',
    groups: [
      {
        name: 'Manicure / Pedicure',
        items: [
          { name: 'Ordinary Mani / Pedi', price: '₹500 / ₹900' },
          { name: 'Classic Mani / Pedi', price: '₹700 / ₹1300' },
          { name: 'Premium Mani / Pedi', price: '₹1500 / ₹2000' },
        ],
      },
    ],
  },
  {
    id: 'waxing',
    audience: 'her',
    title: 'Waxing',
    description: 'Smooth results with regular and premium Rica wax.',
    image: u('1610992015732-2449b76344bc'),
    from: '₹150',
    groups: [
      {
        name: 'Body Waxing',
        items: [
          { name: 'Full Arm / Leg', price: '₹800 / ₹1200' },
          { name: 'Full Body', price: '₹4000' },
        ],
      },
      {
        name: 'Face (Rica)',
        items: [
          { name: 'Upper Lip / Chin', price: '₹150' },
          { name: 'Forehead / Side Lock', price: '₹150' },
          { name: 'Full Face', price: '₹500' },
        ],
      },
    ],
  },
  {
    id: 'kids-hair',
    audience: 'her',
    title: 'Kids',
    description: 'Gentle cuts in our own kids’ corner.',
    image: '/images/hero3-sm.webp',
    from: '₹300',
    groups: [
      {
        name: 'Hair Cuts',
        items: [
          { name: 'Baby Cut', price: '₹300' },
          { name: 'Layer / Bob Cut', price: '₹500+' },
          { name: 'Butterfly / Feather', price: '₹700' },
        ],
      },
    ],
  },
  {
    id: 'mens-hair-grooming',
    audience: 'him',
    title: 'Hair & Grooming',
    description: 'Precision cuts, beard styling and scalp care.',
    image: u('1599351431202-1e0f0137899a'),
    from: '₹150',
    groups: [
      {
        name: 'Classic & Luxury',
        items: [
          { name: 'Classic Haircut', price: '₹200' },
          { name: 'Beard Trimming / Shave', price: '₹150+' },
          { name: 'Haircut + Shaving (Wash)', price: '₹450' },
          { name: 'Beard Styling', price: '₹200' },
          { name: 'Luxury Grooming Combo', price: '₹600+' },
        ],
      },
      {
        name: 'Chemical & Scalp',
        items: [
          { name: 'Anti-Dandruff / Scalp Spa', price: '₹800+' },
          { name: 'Hair Smoothening / Keratin', price: '₹3500+' },
          { name: 'Hair / Beard Colouring', price: '₹600+' },
          { name: 'Fashion Colour / Highlights', price: '₹1200+' },
          { name: 'Head Massage (Oil / Normal)', price: '₹300+' },
        ],
      },
    ],
  },
  {
    id: 'mens-skin-aesthetic',
    audience: 'him',
    title: 'Skin & Aesthetics',
    description: 'Clinical skin care designed for men.',
    image: u('1515377905703-c4788e51af15'),
    from: '₹600',
    groups: [
      {
        name: 'Clinical Skin',
        items: [
          { name: 'Basic / Glow Cleanup', price: '₹600 / ₹1200' },
          { name: 'Premium Facial / Hydra', price: '₹2500 / ₹4500' },
          { name: 'Carbon Laser Toning', price: '₹6000' },
          { name: 'IPL Photo Facial / Hair Removal', price: 'Custom' },
          { name: 'Microneedling (Face / Hair)', price: '₹6000' },
        ],
      },
      {
        name: 'Cosmetic Services',
        items: [
          { name: 'Microblading / Shading', price: '₹10,000+' },
          { name: 'Lip Neutralizing / Colour', price: '₹4000+' },
          { name: 'Tattoo Removal', price: 'On consultation' },
          { name: 'Saggy Skin Tightening', price: '₹3500+' },
        ],
      },
    ],
  },
  {
    id: 'mens-packages-makeup',
    audience: 'him',
    title: 'Groom & Packages',
    description: 'Glow-up packages and groom styling for the big day.',
    image: u('1621605815971-fbc98d665033'),
    from: '₹2,500',
    groups: [
      {
        name: 'Transformation Packages',
        items: [
          { name: 'Glow Groom Package', price: '₹2500+' },
          { name: 'Booster Glow Up', price: '₹4000+' },
          { name: 'Gold Glow Up (Total Transform)', price: '₹7500+' },
        ],
      },
      {
        name: 'Professional Styling',
        items: [
          { name: 'Groom / Night Reception Makeup', price: '₹3000+' },
          { name: 'Nikkah / Special Event Makeup', price: '₹4000+' },
          { name: 'Costume Styling & Makeover', price: 'Custom' },
        ],
      },
    ],
  },
];
