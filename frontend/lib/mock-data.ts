import type { Category, Contractor, PopularSearch, Benefit } from '@/types/landing';

/**
 * Mock Data for Landing Page
 * This data will be replaced with API calls in the future
 */

export const categories: Category[] = [
  {
    id: '1',
    name: 'Cleaning',
    slug: 'cleaning',
    subcategories: ['Window Washing', 'Regular Cleaning', 'Laundry & Ironing'],
    image: '/images/categories/cleaning.jpg',
    gradient: 'from-[#d4f8e1] to-[#f9d5b7]',
  },
  {
    id: '2',
    name: 'Repairs & Maintenance',
    slug: 'repairs-maintenance',
    subcategories: ['Plumbing', 'Electrical Work', 'Appliance Repair'],
    image: '/images/categories/repairs.jpg',
    gradient: 'from-[#d4f8e1] to-[#e5d0be]',
  },
  {
    id: '3',
    name: 'Child Care',
    slug: 'child-care',
    subcategories: ['Babysitting', 'Tutoring', 'Home Nursing'],
    image: '/images/categories/childcare.jpg',
    gradient: 'from-[#d4f8e1] to-[#f9d5b7]',
  },
  {
    id: '4',
    name: 'Food & Catering',
    slug: 'food-catering',
    subcategories: ['Home Cooking', 'Catering for Events', 'Baking & Desserts'],
    image: '/images/categories/food.jpg',
    gradient: 'from-[#d4f8e1] to-[#f9d5b7]',
  },
  {
    id: '5',
    name: 'Pet Care',
    slug: 'pet-care',
    subcategories: ['Pet Sitting', 'Dog Walking', 'Pet Grooming'],
    image: '/images/categories/pet-care.jpg',
    gradient: 'from-[#d4f8e1] to-[#fce4d0]',
  },
  {
    id: '6',
    name: 'Moving & Delivery',
    slug: 'moving-delivery',
    subcategories: ['Moving Services', 'Furniture Assembly', 'Delivery'],
    image: '/images/categories/moving.jpg',
    gradient: 'from-[#d4f8e1] to-[#e8d9f5]',
  },
  {
    id: '7',
    name: 'Gardening & Landscaping',
    slug: 'gardening-landscaping',
    subcategories: ['Lawn Mowing', 'Tree Trimming', 'Garden Design'],
    image: '/images/categories/gardening.jpg',
    gradient: 'from-[#d4f8e1] to-[#d5f5d9]',
  },
  {
    id: '8',
    name: 'Home Improvement',
    slug: 'home-improvement',
    subcategories: ['Painting', 'Carpentry', 'Flooring'],
    image: '/images/categories/home-improvement.jpg',
    gradient: 'from-[#d4f8e1] to-[#f9d5b7]',
  },
];

export const contractors: Contractor[] = [
  {
    id: '1',
    name: 'John Smith',
    avatar: '/images/contractors/avatar-1.jpg',
    category: 'Plumbing',
    categorySlug: 'repairs-maintenance',
    location: 'Toronto',
    hourlyRate: 48,
    rating: 4.9,
    completedJobs: 124,
    verified: true,
  },
  {
    id: '2',
    name: 'Avrile Laurens',
    avatar: '/images/contractors/avatar-2.jpg',
    category: 'Pet Sitting',
    categorySlug: 'pet-care',
    location: 'Montreal',
    hourlyRate: 30,
    rating: 4.8,
    completedJobs: 89,
    verified: true,
  },
  {
    id: '3',
    name: 'Joan Dough',
    avatar: '/images/contractors/avatar-3.jpg',
    category: 'Baby Sitting',
    categorySlug: 'child-care',
    location: 'Toronto',
    hourlyRate: 53,
    rating: 5.0,
    completedJobs: 156,
    verified: true,
  },
  {
    id: '4',
    name: 'Travis Scott',
    avatar: '/images/contractors/avatar-4.jpg',
    category: 'Tree Trimming',
    categorySlug: 'gardening-landscaping',
    location: 'Toronto',
    hourlyRate: 53,
    rating: 4.7,
    completedJobs: 98,
    verified: true,
  },
  {
    id: '5',
    name: 'Susan Sweetpie',
    avatar: '/images/contractors/avatar-5.jpg',
    category: 'Catering for Events',
    categorySlug: 'food-catering',
    location: 'Toronto',
    hourlyRate: 150,
    rating: 4.9,
    completedJobs: 67,
    verified: true,
  },
  {
    id: '6',
    name: 'Gregory Hawkins',
    avatar: '/images/contractors/avatar-6.jpg',
    category: 'Moving',
    categorySlug: 'moving-delivery',
    location: 'Toronto',
    hourlyRate: 40,
    rating: 4.6,
    completedJobs: 201,
    verified: true,
  },
  {
    id: '7',
    name: 'Maria Rodriguez',
    avatar: '/images/contractors/avatar-7.jpg',
    category: 'Cleaning',
    categorySlug: 'cleaning',
    location: 'Vancouver',
    hourlyRate: 35,
    rating: 4.9,
    completedJobs: 178,
    verified: true,
  },
  {
    id: '8',
    name: 'David Chen',
    avatar: '/images/contractors/avatar-8.jpg',
    category: 'Electrical Work',
    categorySlug: 'repairs-maintenance',
    location: 'Calgary',
    hourlyRate: 65,
    rating: 4.8,
    completedJobs: 142,
    verified: true,
  },
];

export const popularSearches: PopularSearch[] = [
  { id: '1', label: 'Dog Walking', query: 'dog walking' },
  { id: '2', label: 'After-School Help', query: 'after school help' },
  { id: '3', label: 'Pet sitting', query: 'pet sitting' },
  { id: '4', label: 'Moving', query: 'moving' },
  { id: '5', label: 'Tree Trimming', query: 'tree trimming' },
];

export const benefits: Benefit[] = [
  {
    id: '1',
    icon: '✓',
    title: 'Easy to Use',
    description: 'Find services or clients in just a few clicks — clear categories, smart search, and smooth navigation.',
  },
  {
    id: '2',
    icon: '✓',
    title: 'Trusted Community',
    description: 'All users go through verification to make collaboration safe, transparent, and worry-free.',
  },
  {
    id: '3',
    icon: '✓',
    title: 'Direct Communication',
    description: 'Chat instantly, discuss details, and agree on tasks without leaving the platform.',
  },
  {
    id: '4',
    icon: '✓',
    title: 'Grow Your Reputation',
    description: 'Earn ratings, collect reviews, and build trust that helps you get more opportunities',
  },
];




