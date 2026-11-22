/**
 * Service menu + prices — transcribed from the clinic's menu cards
 * "Ladies_sep 2026.pdf" and "Gents_sep 2026.pdf".
 *
 * To change a price, edit it here only: the service cards, price drawer,
 * "from" prices and booking dropdown all read from this file.
 */

export type MenuItem = {
  name: string;
  /** Price exactly as printed. Empty when the group note carries the price (e.g. "Price Depending Upon Clients"). */
  price: string;
  /** Small print next to the name, e.g. "(Hair Wash)" or "(1st Sitting)". */
  note?: string;
  /** What a package includes. */
  includes?: string[];
};
export type MenuGroup = { name: string; note?: string; items: MenuItem[] };
export type ServiceCategory = {
  id: string;
  audience: 'her' | 'him';
  title: string;
  description: string;
  image: string;
  groups: MenuGroup[];
};

const u = (id: string) => `https://images.unsplash.com/photo-${id}?w=900&q=80&auto=format&fit=crop`;
const DLEN = '(Depending On Hair Length)';

// ---------------------------------------------------------------- LADIES

const LADIES: ServiceCategory[] = [
  {
    id: 'ladies-hair-cuts',
    audience: 'her',
    title: 'Hair Cuts',
    description: 'Classic and trend cuts, from U cut to butterfly.',
    image: u('1522337360788-8b13dee7a37e'),
    groups: [
      {
        name: 'For Ladies',
        items: [
          { name: 'U Cut', price: '₹600' },
          { name: 'Straight Cut', price: '₹600' },
          { name: 'Layer Cut', price: '₹700' },
          { name: 'Step Cut', price: '₹700' },
          { name: 'Bob Cut', price: '₹700' },
          { name: 'Blend Cut', price: '₹700' },
          { name: 'Pixie Cut', price: '₹800' },
          { name: 'Inverted Bob', price: '₹800' },
          { name: 'Graduated Bob', price: '₹800' },
          { name: 'Butterfly Cut', price: '₹800' },
        ],
      },
    ],
  },
  {
    id: 'ladies-hair-treatments',
    audience: 'her',
    title: 'Hair Treatments & Spa',
    description: 'Smoothening, keratin, botox, nanoplastia and hair spas.',
    image: u('1595476108010-b4d1f102b1b1'),
    groups: [
      {
        name: 'Hair Treatments for Ladies',
        items: [
          { name: 'Smoothening', note: DLEN, price: '₹4500+' },
          { name: 'Crown Portion', note: '(Smoothening)', price: '₹3000+' },
          { name: 'Root Touch Up', note: DLEN, price: '₹3500' },
          { name: 'Permanent Blow Dry', note: DLEN, price: '₹5500+' },
          { name: 'Keratin Treatment', note: DLEN, price: '₹6000+' },
          { name: 'Botox Treatment', note: DLEN, price: '₹7500+' },
          { name: 'Nanoplastia', note: DLEN, price: '₹8000+' },
          { name: 'Kera Smooth', note: DLEN, price: '₹10000+' },
        ],
      },
      {
        name: 'Hair Spa for Ladies',
        items: [
          { name: 'Hair Ironing', price: '₹1000+' },
          { name: 'tongs ironing curls', price: '₹1500+' },
          { name: 'Nourishing Spa', price: '₹1500+' },
          { name: 'Repairing Spa', price: '₹1800+' },
          { name: 'Protein Spa', price: '₹2000+' },
          { name: 'Colouring Spa', price: '₹2500+' },
          { name: 'Keratin Spa', price: '₹3000+' },
          { name: 'Moroccan Spa', price: '₹3000+' },
        ],
      },
      {
        name: 'Dandruff Treatment',
        items: [
          { name: 'Dandruff Treatment', price: '₹2500+' },
          { name: 'Dandruff Spa', price: '₹3000+' },
          { name: 'Hair Fall Spa', price: '₹2500+' },
        ],
      },
    ],
  },
  {
    id: 'ladies-colour',
    audience: 'her',
    title: 'Hair Colour',
    description: 'Root touch up, global colour, highlights, ombre and balayage.',
    image: u('1580618672591-eb180b1a973f'),
    groups: [
      {
        name: 'Ladies Colour',
        items: [
          { name: 'Root Touch Up (Gray Coverage)', price: '₹1500+' },
          { name: 'Global Hair Colour', price: '₹3000+' },
          { name: 'Highlights', note: '(Per Strip)', price: '₹300+' },
          { name: 'Highlights with Pre Light', price: '₹400+' },
          { name: 'Global Colour', price: '₹3000+' },
          { name: 'Ombre', price: '₹3500+' },
          { name: 'Balayage', price: '₹4000+' },
        ],
      },
    ],
  },
  {
    id: 'ladies-skin-cleanup',
    audience: 'her',
    title: 'Skin Cleanup',
    description: 'Cleanups, D-tan and bleach for fresh, even skin.',
    image: u('1570172619644-dfd03ed5d881'),
    groups: [
      {
        name: 'Skin Cleanup',
        items: [
          { name: 'Cleanup Basic', price: '₹800' },
          { name: 'Cleanup Premium', price: '₹1000' },
          { name: 'Glow Cleanup', price: '₹1500' },
          { name: 'D-tan Cleanup', price: '₹1500' },
          { name: 'D-tan Basic', price: '₹500' },
          { name: 'D-tan Face & Neck', price: '₹600' },
          { name: 'D-tan Premium', price: '₹1000' },
          { name: 'Foot D-tan', price: '₹800' },
          { name: 'Full Arm D-tan', price: '₹1000' },
          { name: 'Bleach', price: '₹500' },
        ],
      },
    ],
  },
  {
    id: 'ladies-facials',
    audience: 'her',
    title: 'Facials',
    description: 'Mini Premium, Premium and Luxury facials, plus Hydra Facial.',
    image: u('1616394584738-fc6e612e71b9'),
    groups: [
      {
        name: 'Mini Premium',
        note: '(Including D-tan)',
        items: [
          { name: 'Glow Facial', price: '₹2500' },
          { name: 'Whitening Facial', price: '₹2500' },
          { name: 'Gold Facial', price: '₹2500' },
          { name: 'Brightening Facial', price: '₹2500' },
          { name: 'Veg. Peel', price: '₹2500' },
        ],
      },
      {
        name: 'Premium',
        note: '(Including D-tan)',
        items: [
          { name: 'Gold Facial', price: '₹3500' },
          { name: 'Diamond Facial', price: '₹3500' },
          { name: 'Pearl Facial', price: '₹3500' },
          { name: 'Glow Facial', price: '₹3500' },
          { name: 'Veg Peel', price: '₹3500' },
        ],
      },
      {
        name: 'Luxury',
        note: '(Including D-tan)',
        items: [
          { name: 'O3+', price: '₹4500' },
          { name: 'Radiant Facial', price: '₹4500' },
          { name: 'Bio Bright Facial', price: '₹4500' },
          { name: 'Gold Facial', price: '₹4500' },
          { name: 'Vitamin C Brightening', price: '₹4500' },
        ],
      },
      {
        name: '',
        items: [{ name: 'Hydra Facial', price: '₹5000' }],
      },
    ],
  },
  {
    id: 'ladies-korean',
    audience: 'her',
    title: 'Korean Treatment',
    description: 'Hydra, laser, micro needling, BB glow and more.',
    image: u('1552693673-1bf958298935'),
    groups: [
      {
        name: 'Korean Treatment',
        items: [
          { name: 'Hydra Facial', price: '₹3500' },
          { name: 'Hydra Treatment Basic', price: '₹5000' },
          { name: 'Hydra Treatment Premium', price: '₹8000' },
          { name: 'Medi Facial Tan', price: '₹2000' },
          { name: 'Carbon Laser Toning', price: '₹6000' },
          { name: 'IPL Photolaser', price: '₹5500' },
          { name: 'IPL Hair Removal Laser', price: '₹1500' },
          { name: 'Micro Needling For Face', price: '₹6000' },
          { name: 'Micro Needling For Hair', price: '₹6000' },
          { name: 'Mesotherapy Treatment', price: '₹4000' },
          { name: 'B.B Glow Treatment', price: '₹6000' },
          { name: 'L.L.L Therapy', price: '₹1500' },
          { name: 'Chemical Peel', price: '₹2000' },
          { name: 'Oxygeno Treatment', price: '₹6000' },
        ],
      },
    ],
  },
  {
    id: 'ladies-waxing',
    audience: 'her',
    title: 'Waxing & Threading',
    description: 'Rica wax, Brazilian wax and threading.',
    image: u('1610992015732-2449b76344bc'),
    groups: [
      {
        name: 'Rica Wax',
        items: [
          { name: 'Half Arm', price: '₹700' },
          { name: 'Half Leg', price: '₹900' },
          { name: 'Full Arm', price: '₹900' },
          { name: 'Full Leg', price: '₹1200' },
          { name: 'Full Body', price: '₹4000' },
          { name: 'Back And Front', price: '₹800' },
        ],
      },
      {
        name: 'Brazilian Wax',
        items: [
          { name: 'Upper Lip', price: '₹150' },
          { name: 'Fore Head', price: '₹150' },
          { name: 'Sidelock', price: '₹150' },
          { name: 'Chin', price: '₹150' },
          { name: 'Full Face', price: '₹500' },
          { name: 'Underarms', price: '₹500' },
        ],
      },
      {
        name: 'Threading',
        items: [
          { name: 'Eyebrow', price: '₹50' },
          { name: 'Upper Lip', price: '₹50' },
          { name: 'Forehead', price: '₹50' },
          { name: 'Chin', price: '₹50' },
          { name: 'Sidelock', price: '₹50' },
          { name: 'Full Face', price: '₹250' },
          { name: 'Razor', price: '₹250' },
        ],
      },
    ],
  },
  {
    id: 'ladies-mani-pedi',
    audience: 'her',
    title: 'Manicure & Pedicure',
    description: 'Basic, Classic and Premium hand and foot care.',
    image: u('1607779097040-26e80aa78e66'),
    groups: [
      { name: 'Basic', items: [{ name: 'Pedicure', price: '₹1000' }, { name: 'Manicure', price: '₹700' }] },
      { name: 'Classic', items: [{ name: 'Pedicure', price: '₹1500' }, { name: 'Manicure', price: '₹1000' }] },
      { name: 'Premium', items: [{ name: 'Pedicure', price: '₹2000' }, { name: 'Manicure', price: '₹1500' }] },
      { name: '', items: [{ name: 'Only Cutting Falling (Leg/Hand)', price: '₹200+' }] },
    ],
  },
  {
    id: 'ladies-bridal',
    audience: 'her',
    title: 'Bridal & Makeover',
    description: 'Bridal packages, bridal, party and reception make-up.',
    image: u('1487412947147-5cebf100ffc2'),
    groups: [
      {
        name: 'Bridal Packages',
        items: [
          { name: 'Silver', price: '₹5000', includes: ['Luxury Facial', 'Face Neck D-tan', 'Hand D-tan', 'Hand Wax'] },
          { name: 'Platinum', price: '₹6500', includes: ['Luxury Facial', 'Face Neck D-tan', 'Pedicure Classic', 'Hair Spa'] },
          { name: 'Diamond', price: '₹8000', includes: ['Luxury Facial or Hydra Facial', 'Face Neck D-tan', 'Hand D-tan', 'Hair Spa', 'Premium Pedicure, Manicure'] },
        ],
      },
      {
        name: 'Makeover',
        note: 'Price Depending Upon Clients',
        items: [
          { name: 'Bridal Make-Up', price: '' },
          { name: 'Party Make-Up', price: '' },
          { name: 'Reception Make-Up', price: '' },
        ],
      },
      {
        name: 'ABCD Special Package',
        note: 'Price Depending Upon Clients',
        items: [
          { name: 'Bridal package', price: '' },
          { name: 'Makeover', price: '' },
          { name: 'Costume', price: '' },
          { name: 'Event', price: '' },
          { name: 'Photography', price: '' },
          { name: 'Videography', price: '' },
        ],
      },
    ],
  },
  {
    id: 'kids',
    audience: 'her',
    title: 'Kids',
    description: 'Kids’ cuts and the Kids ABCD Special, in our own kids’ corner.',
    image: '/images/hero3-sm.webp',
    groups: [
      {
        name: 'Kids Cut',
        items: [
          { name: 'Layer Cut', price: '₹600' },
          { name: 'Bob Cut', price: '₹500' },
          { name: 'Butterfly', price: '₹700' },
          { name: 'Feather Cut', price: '₹700' },
          { name: 'U Cut', price: '₹500' },
          { name: 'Straight Cut', price: '₹500' },
          { name: 'Baby Cut', note: '(below 2yrs)', price: '₹200' },
          { name: 'Only Hair Wash', note: '(Hair Setting)', price: '₹500' },
        ],
      },
      {
        name: 'Kids ABCD Special',
        items: [
          { name: 'Kids Hair Spa', price: '₹800' },
          { name: 'Kids Pedicure', price: '₹600' },
          { name: 'Kids Manicure', price: '₹400' },
          { name: 'Kids Face Massage', price: '₹500' },
          { name: 'Kids Hair Colour', note: '(Per Strip)', price: '₹300' },
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------- GENTS

const GENTS: ServiceCategory[] = [
  {
    id: 'gents-hair-grooming',
    audience: 'him',
    title: 'Hair & Grooming',
    description: 'Classic and premium cuts, beard, styling and head massage.',
    image: u('1599351431202-1e0f0137899a'),
    groups: [
      {
        name: 'Classic',
        items: [
          { name: 'Haircut', price: '₹200' },
          { name: 'Beard', price: '₹200' },
          { name: 'Cutting Shaving', price: '₹350' },
        ],
      },
      {
        name: 'Premium',
        items: [
          { name: 'Cutting', note: '(Hair Wash)', price: '₹300' },
          { name: 'Beard', note: '(Face cleansing)', price: '₹300' },
          { name: 'Cutting & Beard', note: '(Hair Wash & Cleansing)', price: '₹500' },
        ],
      },
      {
        name: '',
        items: [
          { name: 'Hair Wash', price: '₹100' },
          { name: 'Hair Setting & blow dry', price: '₹150' },
          { name: 'Blow dry with Hair fibre Setting', price: '₹400' },
        ],
      },
      {
        name: 'Head Massage Gents',
        items: [
          { name: 'Normal Massage', price: '₹300' },
          { name: 'Oil Massage', price: '₹500' },
        ],
      },
    ],
  },
  {
    id: 'gents-hair-treatments',
    audience: 'him',
    title: 'Hair Spa & Treatments',
    description: 'Hair spas, dandruff care, smoothening, keratin and more.',
    image: u('1605497788044-5a32c7078486'),
    groups: [
      {
        name: 'Hair Spa',
        items: [
          { name: 'Nourishing Spa', price: '₹1200+' },
          { name: 'Repairing Spa', price: '₹1500+' },
          { name: 'Protein Spa', price: '₹1500+' },
          { name: 'Colouring Spa', price: '₹1800+' },
          { name: 'Keratin Spa', price: '₹1800+' },
          { name: 'Moroccan Spa', price: '₹1800+' },
        ],
      },
      {
        name: 'Dandruff Treatment',
        items: [
          { name: 'Dandruff Treatment', price: '₹1800+' },
          { name: 'Dandruff Spa', price: '₹2500+' },
          { name: 'Hair Fall Spa', price: '₹2500+' },
        ],
      },
      {
        name: 'Hair Treatments',
        items: [
          { name: 'Smoothening Crown', price: '₹1500+' },
          { name: 'Smoothening Full', price: '₹2000+' },
          { name: 'Only Cream', price: '₹800+' },
          { name: 'Keratin', price: '₹4500+' },
          { name: 'Botox', price: '₹5000+' },
          { name: 'Nanoplastia', price: '₹5000+' },
          { name: 'Shine fusion Treatment', price: '₹5500+' },
          { name: 'Kera Smooth', price: '₹6000+' },
          { name: 'Curling', price: '₹4500+' },
        ],
      },
    ],
  },
  {
    id: 'gents-colour',
    audience: 'him',
    title: 'Gents Colour',
    description: 'Ammonia-free hair and beard colour, highlights and fashion colour.',
    image: u('1598524374912-6b0b0bab43dd'),
    groups: [
      {
        name: 'Gents Colour',
        items: [
          { name: 'Hair Colour', note: '(Ammonia Free)', price: '₹600+' },
          { name: 'Beard Colour', note: '(Ammonia Free)', price: '₹400+' },
          { name: 'Hair Colour', note: '(Loreal/Schwarzkopf)', price: '₹800+' },
          { name: 'Cap Highlights', price: '₹1500+' },
          { name: 'Fashion Colour', price: '₹2000+' },
        ],
      },
    ],
  },
  {
    id: 'gents-face-cleanup',
    audience: 'him',
    title: 'Face Cleanup',
    description: 'Cleanups, D-tan and bleach.',
    image: u('1532710093739-9470acff878f'),
    groups: [
      {
        name: 'Face Cleanup',
        items: [
          { name: 'Cleanup Basic', price: '₹800' },
          { name: 'Cleanup Premium', price: '₹1000' },
          { name: 'Glow Cleanup', price: '₹1500' },
          { name: 'D-tan Cleanup', price: '₹1500' },
          { name: 'D-tan Basic', price: '₹500' },
          { name: 'D-tan Face & Neck', price: '₹600' },
          { name: 'D-tan Premium', price: '₹1000' },
          { name: 'Foot D-tan', price: '₹800' },
          { name: 'Full Arm D-tan', price: '₹1000' },
          { name: 'Bleach', price: '₹500' },
        ],
      },
    ],
  },
  {
    id: 'gents-facials',
    audience: 'him',
    title: 'Skin Facial for Gents',
    description: 'Mini Premium, Premium and Luxury facials, Groom and Hydra Facial.',
    image: u('1515377905703-c4788e51af15'),
    groups: [
      {
        name: 'Mini Premium',
        note: '(Including D-tan)',
        items: [
          { name: 'Glow Facial', price: '₹2500' },
          { name: 'Whitening Facial', price: '₹2500' },
          { name: 'Gold Facial', price: '₹2500' },
          { name: 'Brightening Facial', price: '₹2500' },
          { name: 'Veg. Peel', price: '₹2500' },
        ],
      },
      {
        name: 'Premium',
        note: '(Including D-tan)',
        items: [
          { name: 'Gold Facial', price: '₹3500' },
          { name: 'Diamond Facial', price: '₹3500' },
          { name: 'Pearl Facial', price: '₹3500' },
          { name: 'Glow Facial', price: '₹3500' },
          { name: 'Veg Peel', price: '₹3500' },
        ],
      },
      {
        name: 'Luxury',
        note: '(Including D-tan)',
        items: [
          { name: 'O3+', price: '₹4500' },
          { name: 'Radiant Facial', price: '₹4500' },
          { name: 'Bio Bright Facial', price: '₹4500' },
          { name: 'Gold Facial', price: '₹4500' },
          { name: 'Vitamin C Brightening', price: '₹4500' },
        ],
      },
      {
        name: '',
        items: [
          { name: 'Groom Facial', price: '₹4500' },
          { name: 'Hydra Facial', price: '₹5000' },
        ],
      },
    ],
  },
  {
    id: 'gents-korean',
    audience: 'him',
    title: 'Korean Treatment',
    description: 'Hydra, laser, micro needling, micro blading, lip and skin treatments.',
    image: u('1576426863848-c21f53c60b19'),
    groups: [
      {
        name: 'Korean Treatment',
        items: [
          { name: 'Hydra Facial', price: '₹3500' },
          { name: 'Hydra Treatment Basic', price: '₹5000' },
          { name: 'Hydra Treatment Premium', price: '₹8000' },
          { name: 'Medi Facial Tan', price: '₹2000' },
          { name: 'Carbon Laser Toning', price: '₹6000' },
          { name: 'IPL Photolaser', price: '₹5500' },
          { name: 'IPL Hair Removal Laser', price: '₹1500' },
          { name: 'Micro Needling For Face', price: '₹6000' },
          { name: 'Micro Needling For Hair', price: '₹6000' },
          { name: 'Mesotherapy Treatment', price: '₹4000' },
          { name: 'B.B Glow Treatment', price: '₹6000' },
          { name: 'L.L.L Therapy', price: '₹1500' },
          { name: 'Chemical Peel', price: '₹2000' },
          { name: 'Oxygeno Treatment', price: '₹6000' },
        ],
      },
      {
        name: '',
        items: [
          { name: 'Medi - Cleanup Facial Treatment', price: '₹1500' },
          { name: 'Saggy Skin Tightening', price: '₹3000' },
          { name: 'Tatto - Removal', price: '₹2500' },
          { name: 'Micro Blading', note: '(1st Sitting)', price: '₹10000' },
          { name: 'Micro Blading', note: '(2nd Sitting)', price: '₹8000' },
          { name: 'Micro Blading', note: '(3rd Sitting)', price: '₹4000' },
          { name: 'Lip Neutrilizing Treatment', price: '₹4000' },
          { name: 'Lip Colouring Treatment', price: '₹6000' },
          { name: 'Lip Contouring Treatment', price: '₹2000' },
          { name: 'Eye Brow Shading', price: '₹4000' },
          { name: 'Beauty Spot', price: '₹500' },
        ],
      },
    ],
  },
  {
    id: 'gents-mani-pedi',
    audience: 'him',
    title: 'Manicure & Pedicure',
    description: 'Basic, Classic and Premium hand and foot care for men.',
    image: u('1610992015732-2449b76344bc'),
    groups: [
      { name: 'Basic', items: [{ name: 'Pedicure', price: '₹1000' }, { name: 'Manicure', price: '₹700' }] },
      { name: 'Classic', items: [{ name: 'Pedicure', price: '₹1500' }, { name: 'Manicure', price: '₹1000' }] },
      { name: 'Premium', items: [{ name: 'Pedicure', price: '₹2000' }, { name: 'Manicure', price: '₹1500' }] },
      { name: '', items: [{ name: 'Only Cutting Falling (Leg/Hand)', price: '₹200+' }] },
    ],
  },
  {
    id: 'gents-groom',
    audience: 'him',
    title: 'Groom & Makeover',
    description: 'Groom package facials, groom, reception and nikkah makeup.',
    image: u('1503951914875-452162b0f3f1'),
    groups: [
      {
        name: 'Groom Package Facials',
        items: [
          { name: 'Silver', price: '₹5000', includes: ['Luxury Facial', 'Face Neck D-tan', 'Hand D-tan', 'Hair Cut & Beard'] },
          { name: 'Platinum', price: '₹6000', includes: ['Luxury Facial', 'Face Neck D-tan', 'Pedicure Classic', 'Hair Cut & Beard'] },
          { name: 'Diamond', price: '₹7500', includes: ['Luxury Facial or Hydra Facial', 'Face Neck D-tan', 'Hand D-tan', 'Hair Cut & Beard', 'Premium Pedicure, Manicure'] },
        ],
      },
      {
        name: 'Makeover',
        note: 'Price Depending Upon Clients',
        items: [
          { name: 'Groom Makeup', price: '' },
          { name: 'Night Reception makeup', price: '' },
          { name: 'Nikkah Makeup', price: '' },
        ],
      },
      {
        name: 'ABCD Special Package',
        note: 'Price Depending Upon Clients',
        items: [
          { name: 'Groom Package', price: '' },
          { name: 'Makeover', price: '' },
          { name: 'Costume', price: '' },
          { name: 'Event', price: '' },
          { name: 'Photography', price: '' },
          { name: 'Videography', price: '' },
        ],
      },
    ],
  },
];

export const SERVICES: ServiceCategory[] = [...LADIES, ...GENTS];

/** Lowest listed price in a category, e.g. "₹200". Computed so it can never drift from the menu. */
export const fromPrice = (c: ServiceCategory) => {
  const nums = c.groups.flatMap((g) => g.items).map((i) => Number(i.price.replace(/[^\d]/g, ''))).filter((n) => n > 0);
  return nums.length ? `₹${Math.min(...nums)}` : 'On request';
};

/** Full label used in the booking dropdown and WhatsApp message, e.g. "Cutting (Hair Wash)". */
export const itemLabel = (i: MenuItem) => (i.note ? `${i.name} ${i.note}` : i.name);

/** Which menu card a category comes from (shown in the booking dropdown). */
export const menuLabel = (c: ServiceCategory) => (c.id === 'kids' ? 'Kids' : c.audience === 'her' ? 'Ladies' : 'Gents');

/**
 * Unambiguous booking value, e.g. "Pedicure — Premium (Gents)" or "Gold Facial — Luxury (Ladies)",
 * so the clinic sees exactly which tier/menu was requested.
 */
export const bookingValue = (c: ServiceCategory, g: MenuGroup, i: MenuItem) => {
  const label = itemLabel(i);
  const tier = g.name && g.name !== i.name ? ` — ${g.name}` : '';
  return `${label}${tier} (${menuLabel(c)})`;
};
