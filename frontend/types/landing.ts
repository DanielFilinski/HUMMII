/**
 * Landing Page Type Definitions
 * Types for categories, contractors, and search functionality
 */

export type Category = {
  id: string;
  name: string;
  slug: string;
  subcategories: string[];
  image: string;
  gradient: string; // Tailwind gradient classes
};

export type Contractor = {
  id: string;
  name: string;
  avatar: string;
  category: string;
  categorySlug: string;
  location: string;
  hourlyRate: number;
  rating?: number;
  completedJobs?: number;
  verified?: boolean;
};

export type PopularSearch = {
  id: string;
  label: string;
  query: string;
};

export type SearchResult = {
  categories: Category[];
  contractors: Contractor[];
  total: number;
};

export type Benefit = {
  id: string;
  icon: string;
  title: string;
  description: string;
};

export type SocialLink = {
  name: string;
  icon: string;
  url: string;
};

export type FooterLink = {
  label: string;
  href: string;
};

export type FooterSection = {
  title: string;
  links: FooterLink[];
};



