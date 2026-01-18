export const siteConfig = {
  name: 'Future Point Coaching Institute',
  tagline: 'Turning Concepts Into Confidence',
  description:
    'Future Point Coaching Institute Sadulpur - Best Coaching for Class 10, 11 & 12 in Churu, Rajasthan. Expert faculty for CBSE, IIT-JEE & NEET preparation. Quality education by Gautam Sharma.',
  shortDescription: 'Best Coaching Institute in Sadulpur for Class 10, 11, 12 - IIT-JEE, NEET, CBSE Board Exams',
  url: 'https://futurepointcoaching.in',
  founded: '2023',
  successRate: '100%',
  owner: {
    name: 'Gautam Sharma',
    title: 'Founder & Director',
    description: 'Visionary educator dedicated to transforming students into achievers',
  },
  contact: {
    address: 'Ghanshyam Murliwala Complex, Near Maharana Pratap Chowk, Sadulpur, Churu - 331023, Rajasthan, India',
    city: 'Sadulpur',
    district: 'Churu',
    state: 'Rajasthan',
    country: 'India',
    pincode: '331023',
    phone: '+91 8209429318',
    email: 'futurepointcoaching@gmail.com',
    hours: {
      weekday: 'Mon–Sat: 9:00 AM - 9:00 PM',
      weekend: 'Sunday: OFF',
    },
  },
  social: {
    facebook: '',
    instagram: '',
    youtube: '',
  },
  branding: {
    developer: 'ASTRAFORENSICS',
    developerUrl: 'https://astraforensics.in',
    tagline: 'Made & Secured by',
  },
  seo: {
    keywords: [
      'Future Point Coaching Institute',
      'Future Point Coaching Sadulpur',
      'Best Coaching in Sadulpur',
      'Coaching Institute Sadulpur',
      'Coaching Classes Sadulpur',
      'Tuition Classes Sadulpur',
      'Sadulpur Coaching Center',
      'Churu Coaching Institute',
      'Rajasthan Coaching Classes',
      'Class 10 Coaching Sadulpur',
      'Class 11 Coaching Sadulpur',
      'Class 12 Coaching Sadulpur',
      'CBSE Coaching Sadulpur',
      'Board Exam Preparation Sadulpur',
      'IIT JEE Coaching Sadulpur',
      'IIT JEE Preparation Churu',
      'NEET Coaching Sadulpur',
      'NEET Preparation Churu',
      'Medical Entrance Coaching',
      'Engineering Entrance Coaching',
      'Science Coaching Sadulpur',
      'Maths Coaching Sadulpur',
      'Physics Coaching Sadulpur',
      'Chemistry Coaching Sadulpur',
      'Biology Coaching Sadulpur',
      'Best Teachers Sadulpur',
      'Top Coaching Churu District',
      'Gautam Sharma Coaching',
      'Future Point Institute',
      'Study Notes Sadulpur',
      'Free Study Material',
      'Online Notes Download',
      'NCERT Solutions',
      'Competitive Exam Coaching',
      'Affordable Coaching Sadulpur',
      'Quality Education Rajasthan',
    ],
  },
};

export const faculty = [
  {
    id: 'sachin-kumar',
    name: 'Er. Sachin Kumar',
    designation: 'Mathematics Faculty',
    subject: 'Mathematics',
    experience: '10+ Years Experience',
    image: '/images/REAL-SACHIN.JPG',
    description:
      'M.Tech in Applied Mathematics with over a decade of teaching excellence. Patient guidance and structured methodology help students build strong mathematical foundations.',
    qualifications: ['M.Tech in Applied Mathematics', 'B.Tech'],
    specializations: ['IIT-JEE Mathematics', 'Board Exams', 'Competitive Mathematics'],
  },
  {
    id: 'gautam-sharma',
    name: 'Prof. Gautam Sharma',
    designation: 'Biology Faculty',
    subject: 'Biology',
    experience: '7+ Years Experience',
    image: '/images/GAUTOM.jpg',
    description:
      'Blends theory and practice to prepare students for medical entrances and research careers. Known for making complex biological concepts easy to understand.',
    qualifications: ['M.Sc. Biology', 'B.Ed'],
    specializations: ['NEET Biology', 'Board Exams', 'Medical Entrance'],
  },
];

export const classes = [
  { value: '10', label: 'Class 10' },
  { value: '11', label: 'Class 11' },
  { value: '12', label: 'Class 12' },
];

// Class-wise subjects
export const subjectsByClass: Record<string, { value: string; label: string }[]> = {
  '10': [
    { value: 'maths', label: 'Maths' },
    { value: 'science', label: 'Science' },
    { value: 'sst', label: 'SST' },
    { value: 'hindi', label: 'Hindi' },
    { value: 'english', label: 'English' },
  ],
  '11': [
    { value: 'maths', label: 'Maths' },
    { value: 'physics', label: 'Physics' },
    { value: 'chemistry', label: 'Chemistry' },
    { value: 'biology', label: 'Biology' },
    { value: 'english', label: 'English' },
  ],
  '12': [
    { value: 'maths', label: 'Maths' },
    { value: 'physics', label: 'Physics' },
    { value: 'chemistry', label: 'Chemistry' },
    { value: 'biology', label: 'Biology' },
    { value: 'english', label: 'English' },
  ],
};

// All subjects combined for general use
export const allSubjects = [
  { value: 'maths', label: 'Maths' },
  { value: 'physics', label: 'Physics' },
  { value: 'chemistry', label: 'Chemistry' },
  { value: 'biology', label: 'Biology' },
  { value: 'science', label: 'Science' },
  { value: 'sst', label: 'SST' },
  { value: 'hindi', label: 'Hindi' },
  { value: 'english', label: 'English' },
];

export const streams = [
  { value: 'cbse', label: 'CBSE' },
  { value: 'science', label: 'Science' },
  { value: 'commerce', label: 'Commerce' },
  { value: 'arts', label: 'Arts' },
  { value: 'all', label: 'ALL' },
];

export const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/notes', label: 'Notes' },
  { href: '/contact', label: 'Contact' },
];
