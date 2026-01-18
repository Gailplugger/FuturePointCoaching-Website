export const siteConfig = {
  name: 'Future Point Coaching Institute',
  tagline: 'Turning Concepts Into Confidence',
  description:
    'Expert Coaching for Competitive Success. Future Point Coaching Institute offers quality education for Class 10, 11, and 12 students.',
  url: 'https://futurepointcoaching.in',
  founded: '2023',
  successRate: '100%',
  contact: {
    address:
      'Ghanshyam Murliwala Complex, Near Maharana Pratap Chowk, Sadulpur, Churu - 331023',
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
    tagline: 'Made with love',
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
