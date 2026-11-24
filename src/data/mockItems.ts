import { FoundItem, IntakePreset } from '../types/campusMatch';

export const STUDENT_SSO_USER = {
  name: 'Maya Chen',
  email: 'm.chen@university.edu',
  studentId: 'SID-2026-4918',
  avatarUrl: '/src/assets/images/avatar_student_sso_1795505414837.jpg',
};

export const CAMPUS_LOCATIONS = [
  'Main Library — 2nd Floor Quiet Zone',
  'Student Union — North Atrium',
  'Science Hall — Lecture Room 104',
  'Recreation Center — Locker Hallway',
  'Engineering Quad — Café Tables',
  'Fine Arts Building — Studio B',
];

export const PICKUP_DESKS = [
  'Student Union Info Desk (Rm 102)',
  'Main Library Circulation Desk',
  'Campus Safety & Facilities Office',
];

export const INITIAL_FOUND_ITEMS: FoundItem[] = [
  {
    id: 'CM-1042',
    title: 'Wireless Earbuds Case',
    category: 'Electronics',
    imageUrl: '/src/assets/images/item_airpods_1795505412503.jpg',
    locationFound: 'Main Library — 2nd Floor Quiet Zone',
    foundRelativeTime: 'Found 2 days ago',
    pickupDesk: 'Main Library Circulation Desk',
    aiTags: ['Electronics', 'White', 'Earbuds', 'Charging Case', 'Audio'],
    proofQuestion:
      'What Bluetooth pairing name appears when opened, or describe any engraving/scuff marks inside the lid?',
    status: 'found',
  },
  {
    id: 'CM-1041',
    title: 'Navy Canvas Jacket',
    category: 'Apparel',
    imageUrl: '/src/assets/images/item_blue_jacket_1795505413367.jpg',
    locationFound: 'Engineering Quad — Café Tables',
    foundRelativeTime: 'Found 1 day ago',
    pickupDesk: 'Student Union Info Desk (Rm 102)',
    aiTags: ['Apparel', 'Navy Blue', 'Canvas', 'Brass Buttons', 'Outerwear'],
    proofQuestion:
      'What brand tag and garment size are inside the collar, and is anything inside the left chest pocket?',
    status: 'found',
  },
  {
    id: 'CM-1040',
    title: 'Black Insulated Water Bottle',
    category: 'Bottles & Bags',
    imageUrl: '/src/assets/images/item_water_bottle_1795505413197.jpg',
    locationFound: 'Recreation Center — Locker Hallway',
    foundRelativeTime: 'Found 5 hours ago',
    pickupDesk: 'Campus Safety & Facilities Office',
    aiTags: ['Drinkware', 'Matte Black', 'Insulated', 'Stickers', 'Stainless'],
    proofQuestion:
      'Describe the two vinyl stickers on the side of the bottle and any name or initials on the bottom.',
    status: 'found',
  },
  {
    id: 'CM-1039',
    title: 'Blue Dell Laptop',
    category: 'Electronics',
    imageUrl: '/src/assets/images/item_dell_laptop_1795505413282.jpg',
    locationFound: 'Science Hall — Lecture Room 104',
    foundRelativeTime: 'Found 3 days ago',
    pickupDesk: 'Campus Safety & Facilities Office',
    aiTags: ['Electronics', 'Blue', 'Scratched', 'Dell', 'Laptop'],
    proofQuestion:
      'Describe the lock screen wallpaper or provide the asset tag / partial serial number on the underside.',
    status: 'pending',
    claim: {
      claimantName: 'Liam Patel',
      claimantEmail: 'l.patel@university.edu',
      submittedAt: 'Today, 10:14 AM',
      proofAnswer:
        'It is a slate-blue Dell Latitude with a "Property of University" sticker on the lower right lid edge. Lock screen shows a mountain trail at dusk and username lpatel.',
      claimRef: 'CLM-8821',
    },
  },
  {
    id: 'CM-1038',
    title: 'Scientific Graphing Calculator',
    category: 'Electronics',
    imageUrl: '/src/assets/images/item_calculator_1795505414670.jpg',
    locationFound: 'Main Library — 2nd Floor Quiet Zone',
    foundRelativeTime: 'Found 4 days ago',
    pickupDesk: 'Main Library Circulation Desk',
    aiTags: ['Electronics', 'Dark Gray', 'TI-84', 'Calculator', 'Academic'],
    proofQuestion:
      'What function or equation is currently plotted on the screen, or what initials are etched on the slide cover?',
    status: 'found',
  },
  {
    id: 'CM-1037',
    title: 'University Lanyard & Keys',
    category: 'Keys & IDs',
    imageUrl: '/src/assets/images/item_keys_lanyard_1795505414465.jpg',
    locationFound: 'Student Union — North Atrium',
    foundRelativeTime: 'Found 6 days ago',
    pickupDesk: 'Student Union Info Desk (Rm 102)',
    aiTags: ['Keys', 'Navy Lanyard', 'Brass Keys', 'ID Sleeve', 'Campus'],
    proofQuestion:
      'Provide the full name printed on the badge insert and how many brass keys are on the split ring.',
    status: 'returned',
    claim: {
      claimantName: 'Dr. Sarah Jenkins',
      claimantEmail: 's.jenkins@university.edu',
      submittedAt: 'Nov 19, 2:40 PM',
      proofAnswer:
        'Navy university lanyard with two brass Yale keys and my Biological Sciences staff badge (ID 198765).',
      claimRef: 'CLM-8790',
    },
    custodyLog: {
      studentIdNumber: 'FAC-198765',
      returnedAt: 'Nov 20, 9:15 AM',
      approvedBy: 'Desk Officer M. Rivera',
    },
  },
];

export const INTAKE_PRESETS: IntakePreset[] = [
  {
    id: 'preset-dell',
    label: 'Sample: Scratched Dell Laptop',
    title: 'Blue Dell Laptop',
    category: 'Electronics',
    imageUrl: '/src/assets/images/item_dell_laptop_1795505413282.jpg',
    aiTags: ['Electronics', 'Blue', 'Scratched', 'Dell'],
    locationFound: 'Science Hall — Lecture Room 104',
    proofQuestion:
      'Describe the lock screen wallpaper or provide the asset tag / partial serial number.',
  },
  {
    id: 'preset-bottle',
    label: 'Sample: Black Hydro Flask',
    category: 'Bottles & Bags',
    title: 'Matte Black Water Bottle',
    imageUrl: '/src/assets/images/item_water_bottle_1795505413197.jpg',
    aiTags: ['Drinkware', 'Black', 'Stickers', 'Insulated'],
    locationFound: 'Recreation Center — Locker Hallway',
    proofQuestion:
      'Describe the vinyl stickers on the exterior and any markings on the cap or base.',
  },
  {
    id: 'preset-calc',
    label: 'Sample: Graphing Calculator',
    category: 'Electronics',
    title: 'Graphing Calculator',
    imageUrl: '/src/assets/images/item_calculator_1795505414670.jpg',
    aiTags: ['Electronics', 'Gray', 'TI-84', 'Math'],
    locationFound: 'Main Library — 2nd Floor Quiet Zone',
    proofQuestion:
      'What initials are written under the battery cover or what graph was last saved?',
  },
];
