'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Button, 
  Input, 
  Card,
  CardContent,
  Badge,
  Avatar,
  Typography,
  Container 
} from '@/components/ui';
import { cn } from '@/lib/utils';

// ============================================
// SUB-COMPONENTS
// ============================================

// Search Icon Component
const SearchIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Star Rating Component
const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[...Array(5)].map((_, i) => (
      <svg 
        key={i} 
        width="13.5" 
        height="12.789" 
        viewBox="0 0 13.5 12.789" 
        fill="#67AD51"
        className="w-[10.125px] h-[10.125px]"
      >
        <path d="M6.75 0l2.078 4.209 4.672.68-3.375 3.289.797 4.611L6.75 10.711l-4.172 2.078.797-4.611L0 5.889l4.672-.68z"/>
      </svg>
    ))}
  </div>
);

// Contractor Card Component
interface ContractorCardProps {
  name: string;
  category: string;
  location: string;
  rate: number;
  rating: number;
  tasksCompleted: number;
  avatar: string;
}

const ContractorCard = ({ 
  name, 
  category, 
  location, 
  rate, 
  rating, 
  tasksCompleted,
  avatar 
}: ContractorCardProps) => (
  <Card className="w-full bg-background-1 shadow-[0px_-4px_10px_0px_rgba(198,194,187,0.2)] rounded-[20px] overflow-hidden">
    {/* Category Tag */}
    <div className="bg-accent-2 h-10 px-[30px] flex items-center justify-center">
      <Typography variant="body" className="text-text-inverse">
        {category}
      </Typography>
    </div>
    
    <CardContent className="flex flex-col items-center gap-2.5 pb-[15px] pt-0 px-0">
      {/* Avatar */}
      <div className="w-[150px] h-[150px] relative rounded-full overflow-hidden">
        <Image 
          src={avatar}
          alt={name}
          fill
          className="object-cover"
        />
      </div>

      {/* Info */}
      <div className="flex flex-col items-center gap-1.5 w-full px-5">
        <Typography variant="h3" className="text-text-primary text-center">
          {name}
        </Typography>
        
        <div className="flex flex-col items-center gap-1.5 w-[197px]">
          <Typography variant="bodySm" className="text-text-primary">
            {location}, {rate} $/Hr
          </Typography>
          
          <div className="flex items-center gap-2.5">
            <Typography variant="tag" className="text-accent-1">
              {rating}
            </Typography>
            <StarRating rating={rating} />
          </div>
          
          <Typography variant="bodySm" className="text-text-secondary">
            {tasksCompleted} Tasks completed
          </Typography>
        </div>
      </div>

      {/* View Profile Link */}
      <button className="h-9 px-5 py-[11.25px] rounded-[750px] hover:bg-background-2 transition-colors">
        <Typography variant="h3" className="text-accent-1">
          View Profile
        </Typography>
      </button>
    </CardContent>
  </Card>
);

// Category Card Component
interface CategoryCardProps {
  title: string;
  items: string[];
  image: string;
}

const CategoryCard = ({ title, items, image }: CategoryCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="relative w-full sm:w-[305px] h-[305px] rounded-[20px] overflow-hidden bg-gradient-card">
      {/* Stacked Cards */}
      <div className="absolute top-5 left-[15.5px] right-[14.5px] space-y-0 z-10">
        {items.slice(0, 3).reverse().map((item, index) => (
          <div 
            key={index}
            className={cn(
              "bg-background-1 rounded-[10px] p-[15px] transition-all duration-300",
              index === 0 && "shadow-none",
              index === 1 && "shadow-[0px_-10px_10px_0px_rgba(198,194,187,0.2)] -mt-[28.373px]",
              index === 2 && "shadow-[0px_-10px_10px_0px_rgba(198,194,187,0.2)] -mt-[29.212px]"
            )}
          >
            <Typography variant="bodySm" className="text-text-primary">
              {item}
            </Typography>
          </div>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 h-[130px]">
        {/* Background Gradient */}
        <div 
          className="absolute inset-0 bg-background-2" 
          style={{
            clipPath: 'ellipse(152.5px 65px at 50% 100%)'
          }}
        />

        {/* Image */}
        <div className="absolute bottom-0 right-0 w-[202.53px] h-[202.53px] -mb-[53.34px] -mr-[74.31px]">
          <Image 
            src={image}
            alt={title}
            fill
            className="object-contain"
          />
        </div>

        {/* Title and Arrow */}
        <div className="absolute bottom-4 left-[15.5px] right-[14.5px] flex items-end justify-between">
          <Typography variant="h2" className="text-text-primary">
            {title.split('/').map((line, i) => (
              <span key={i}>
                {line}
                {i < title.split('/').length - 1 && <br />}
              </span>
            ))}
          </Typography>
          
          <button 
            className="w-8 h-8 flex items-center justify-center hover:bg-accent-1/10 rounded-full transition-colors"
            aria-label="View category"
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M23.04 10.72L16.544 17.216L10.048 10.72" stroke="#2A2A0F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" transform="rotate(180 16 16)"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// Advantage Item Component
interface AdvantageItemProps {
  title: string;
  description: string;
}

const AdvantageItem = ({ title, description }: AdvantageItemProps) => (
  <div className="flex gap-5 items-start w-full relative">
    <div className="w-8 h-8 bg-accent-1 rounded-full flex items-center justify-center flex-shrink-0 z-10">
      <svg width="15.936" height="15.933" viewBox="0 0 15.936 15.933" fill="#FFFFFF">
        <path d="M7.968 0v15.933M0 7.967h15.936" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </div>
    
    <div className="flex-1 space-y-2">
      <Typography variant="h2" className="text-text-primary">
        {title}
      </Typography>
      <Typography variant="body" className="text-text-primary">
        {description}
      </Typography>
    </div>
  </div>
);

// ============================================
// MAIN COMPONENT
// ============================================

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Data
  const popularTags = [
    'Dog Walking',
    'After-School Help', 
    'Pet sitting',
    'Moving',
    'Tree Trimming'
  ];

  const categories = [
    {
      title: 'Cleaning',
      items: ['Home cleaning', 'Space decluttering & organization', 'Window cleaning'],
      image: '/images/categories/cleaning.png'
    },
    {
      title: 'Construction/Renovation',
      items: ['Handyman services', 'Lighting & electrical work', 'Plumbing'],
      image: '/images/categories/construction.png'
    },
    {
      title: 'Kids/Family',
      items: ['Babysitting', 'Tutoring', "Kids' party planning"],
      image: '/images/categories/kids.png'
    },
    {
      title: 'Events',
      items: ['Event styling and decor', 'Photographer, videographer', 'Beauty services'],
      image: '/images/categories/events.png'
    },
    {
      title: 'Courier & Moving',
      items: ['Shopping delivery', 'Furniture transport', 'Moving assistance'],
      image: '/images/categories/moving.png'
    },
    {
      title: 'Auto & Tech',
      items: ['Mobile car detailing', 'Tire or oil change', 'Minor car repairs'],
      image: '/images/categories/auto.png'
    },
    {
      title: 'Pet Services',
      items: ['Dog walking', 'Grooming', 'Pet care'],
      image: '/images/categories/pets.png'
    },
    {
      title: 'Home Assistance',
      items: ['Small repairs', 'Furniture assembly (IKEA & others)', 'Appliance installation'],
      image: '/images/categories/home.png'
    },
    {
      title: 'Seasonal Tasks',
      items: ['Leaf removal', 'Patio & facade washing', 'Outdoor furniture setup'],
      image: '/images/categories/seasonal.png'
    },
    {
      title: 'Online Tasks',
      items: ['Event styling and decor', 'Photographer, videographer', 'Beauty services'],
      image: '/images/categories/online.png'
    }
  ];

  const topContractors: ContractorCardProps[] = [
    {
      name: 'John Smith',
      category: 'Plumbing',
      location: 'Toronto',
      rate: 40,
      rating: 4.9,
      tasksCompleted: 43,
      avatar: '/images/contractors/john-smith.jpg'
    },
    {
      name: 'Avrile Laurens',
      category: 'Pet care',
      location: 'Montreal',
      rate: 30,
      rating: 4.9,
      tasksCompleted: 56,
      avatar: '/images/contractors/avrile-laurens.jpg'
    },
    {
      name: 'Joan Dough',
      category: 'Baby Sitting',
      location: 'Toronto',
      rate: 53,
      rating: 5.0,
      tasksCompleted: 20,
      avatar: '/images/contractors/joan-dough.jpg'
    },
    {
      name: 'Susan Sweetpie',
      category: 'Event styling and decor',
      location: 'Toronto',
      rate: 150,
      rating: 5.0,
      tasksCompleted: 10,
      avatar: '/images/contractors/susan-sweetpie.jpg'
    }
  ];

  const advantages: AdvantageItemProps[] = [
    {
      title: 'Easy to Use',
      description: 'Find services or clients in just a few clicks — clear categories, smart search, and smooth navigation.'
    },
    {
      title: 'Trusted Community',
      description: 'All users go through verification to make collaboration safe, transparent, and worry-free.'
    },
    {
      title: 'Direct Communication',
      description: 'Chat instantly, discuss details, and agree on tasks without leaving the platform.'
    },
    {
      title: 'Grow Your Reputation',
      description: 'Earn ratings, collect reviews, and build trust that helps you get more opportunities'
    }
  ];

  return (
    <div className="min-h-screen bg-background-1">
      {/* ============================================ */}
      {/* HEADER */}
      {/* ============================================ */}
      <header className="h-20 border-b border-gray-100 sticky top-0 bg-background-1 z-50">
        <Container className="h-full">
          <div className="flex items-center justify-between h-full">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <div className="h-[17.6px] w-20 relative">
                <span className="text-2xl font-bold text-accent-1">HUMMII</span>
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              <Link href="#categories" className="hover:text-accent-1 transition-colors">
                <Typography variant="h3" className="text-text-primary hover:text-accent-1">
                  Categories
                </Typography>
              </Link>
              <Link href="#how-it-works" className="hover:text-accent-1 transition-colors">
                <Typography variant="h3" className="text-text-primary hover:text-accent-1">
                  How It Works
                </Typography>
              </Link>
              <Link href="#post-task" className="hover:text-accent-1 transition-colors">
                <Typography variant="h3" className="text-text-primary hover:text-accent-1">
                  Post a Task
                </Typography>
              </Link>
              <Link href="#become-contractor" className="hover:text-accent-1 transition-colors">
                <Typography variant="h3" className="text-accent-1 hover:text-accent-2">
                  Become a Contractor
                </Typography>
              </Link>
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              {/* Language Switcher */}
              <button className="hidden sm:flex items-center gap-1.5 text-text-primary hover:text-accent-1 transition-colors">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                  <path d="M9 0C4.032 0 0 4.032 0 9s4.032 9 9 9 9-4.032 9-9-4.032-9-9-9zm6.84 5.4H13.5c-.252-.972-.576-1.908-.972-2.772A7.308 7.308 0 0116.84 5.4zM9 1.8c.612.936 1.116 1.98 1.476 3.096H7.524C7.884 3.78 8.388 2.736 9 1.8zM1.98 10.8c-.108-.576-.18-1.176-.18-1.8s.072-1.224.18-1.8h3.276c-.072.576-.108 1.152-.108 1.8 0 .648.036 1.224.108 1.8H1.98zm.672 1.8h2.34c.252.972.576 1.908.972 2.772A7.308 7.308 0 011.652 12.6zm2.34-7.2h-2.34A7.308 7.308 0 015.964 2.628c-.396.864-.72 1.8-.972 2.772zM9 16.2c-.612-.936-1.116-1.98-1.476-3.096h2.952C10.116 14.22 9.612 15.264 9 16.2zm1.8-4.896H7.2c-.072-.576-.108-1.152-.108-1.8 0-.648.036-1.224.108-1.8h3.6c.072.576.108 1.152.108 1.8 0 .648-.036 1.224-.108 1.8zm.228 4.524c.396-.864.72-1.8.972-2.772h2.34a7.308 7.308 0 01-3.312 2.772zM12.744 10.8c.072-.576.108-1.152.108-1.8 0-.648-.036-1.224-.108-1.8h3.276c.108.576.18 1.176.18 1.8s-.072 1.224-.18 1.8h-3.276z"/>
                </svg>
                <Typography variant="h3">EN</Typography>
                <span className="text-lg transform rotate-180">↓</span>
              </button>

              {/* Sign In Button */}
              <Button variant="primary" size="md" className="min-w-[200px]">
                Sign in/ Sign Up
              </Button>

              {/* Mobile Menu Button */}
              <button 
                className="lg:hidden p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M3 12h18M3 6h18M3 18h18" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>
        </Container>
      </header>

      {/* ============================================ */}
      {/* HERO SECTION */}
      {/* ============================================ */}
      <section className="relative bg-gradient-main overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="w-full h-full bg-repeat" style={{ 
            backgroundImage: 'url(/images/pattern.png)',
            backgroundSize: 'auto 300px'
          }} />
        </div>
        
        <Container className="relative py-8 sm:py-12 md:py-16 lg:py-20">
          <div className="max-w-[1064px] mx-auto space-y-6 sm:space-y-8">
            {/* Headline */}
            <Typography 
              variant="h1" 
              align="center"
              className="text-text-primary px-4"
            >
              Find the Right Expert for Any Task
            </Typography>
            <Input
              placeholder="Search for any service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />

            {/* Search Bar */}
            <Card className="bg-background-1 shadow-[0px_4px_15px_0px_rgba(0,0,0,0.15)] rounded-full overflow-hidden">
              <div className="flex flex-col sm:flex-row items-stretch gap-0 h-[60px]">
                <div className="flex-1 flex items-center px-4 gap-4">
                  <SearchIcon />
                  <input
                    type="text"
                    placeholder="Search for any service..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-text-primary placeholder:text-text-primary/60 text-[20px] leading-8"
                  />
                </div>
                <Button 
                  variant="primary" 
                  size="lg"
                  className="rounded-full sm:rounded-l-none sm:rounded-r-full h-[60px] min-w-[220px]"
                >
                  View all services
                </Button>
              </div>
            </Card>

            {/* Popular Tags */}
            <div className="flex flex-wrap items-center justify-center gap-5 px-4">
              {popularTags.map((tag) => (
                <button 
                  key={tag}
                  className="h-[43px] px-[30px] rounded-full border border-accent-2 bg-transparent text-text-primary hover:bg-accent-2 hover:text-text-inverse transition-colors"
                >
                  <Typography variant="bodySm">{tag}</Typography>
                </button>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ============================================ */}
      {/* CATEGORIES SECTION */}
      {/* ============================================ */}
      <section id="categories" className="py-12 md:py-16 lg:py-20">
        <Container>
          <div className="space-y-8">
            <Typography variant="h1" className="text-text-primary">
              Categories
            </Typography>

            {/* Categories Carousel/Grid */}
            <div className="relative">
              <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
                {categories.map((category) => (
                  <div key={category.title} className="snap-center flex-shrink-0">
                    <CategoryCard {...category} />
                  </div>
                ))}
              </div>

              {/* Navigation Buttons */}
              <button 
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-12 h-12 bg-background-1 rounded-full shadow-[0px_4px_15px_0px_rgba(0,0,0,0.15)] flex items-center justify-center hover:bg-accent-1/10 transition-colors"
                aria-label="Next"
              >
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path d="M23.04 10.72L16.544 17.216L10.048 10.72" stroke="#2A2A0F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" transform="rotate(-90 16 16)"/>
                </svg>
              </button>
            </div>

            {/* View All Button */}
            <div className="flex justify-center">
              <Button variant="primary" size="lg" className="w-full sm:w-auto sm:min-w-[420px]">
                View all services
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* ============================================ */}
      {/* POST A TASK BANNER */}
      {/* ============================================ */}
      <section id="post-task" className="py-12 md:py-16">
        <Container>
          <div className="bg-gradient-banner rounded-[30px] overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr,750px] gap-8 lg:gap-10 p-6 md:p-8 lg:p-12 lg:pl-10">
              <div className="space-y-6 lg:space-y-12 flex flex-col justify-center order-2 lg:order-1">
                <div className="space-y-8">
                  <Typography variant="h1" className="text-text-primary leading-[1.2]">
                    Post a task - Get it done
                  </Typography>
                  <div className="space-y-0">
                    <Typography variant="body" className="text-text-primary">
                      Submit your request for any service -
                    </Typography>
                    <Typography variant="body" className="text-text-primary">
                      qualified specialists will respond directly.
                    </Typography>
                  </div>
                </div>
                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                  Post a Task
                </Button>
              </div>

              <div className="relative h-[300px] sm:h-[400px] lg:h-[450px] rounded-[10px] overflow-hidden order-1 lg:order-2">
                <Image 
                  src="/images/post-task.jpg"
                  alt="Post a task"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ============================================ */}
      {/* TOP CONTRACTORS SECTION */}
      {/* ============================================ */}
      <section className="relative py-12 md:py-16 lg:py-20 bg-gradient-main overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute bottom-0 left-0 right-0 h-[254px] opacity-20 pointer-events-none">
          <div className="w-full h-full bg-repeat" style={{ 
            backgroundImage: 'url(/images/pattern.png)',
            backgroundSize: 'auto 276px',
            maskImage: 'linear-gradient(to bottom, transparent, black 20%, black 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 20%, black 100%)'
          }} />
        </div>

        <Container className="relative">
          <div className="space-y-8">
            <Typography variant="h1" className="text-text-primary">
              Top Contractors
            </Typography>

            {/* Contractors Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {topContractors.map((contractor) => (
                <ContractorCard key={contractor.name} {...contractor} />
              ))}
            </div>

            {/* Active Indicator */}
            <div className="flex justify-center gap-2">
              <div className="w-5 h-5 rounded-full bg-accent-1 border-2 border-background-1" />
            </div>
          </div>
        </Container>
      </section>

      {/* ============================================ */}
      {/* WHY CHOOSE PLATFORM SECTION */}
      {/* ============================================ */}
      <section className="py-12 md:py-16 lg:py-20">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-[972px,1fr] gap-12 lg:gap-16 items-center">
            {/* Left side - Advantages */}
            <div className="space-y-9 order-2 lg:order-1">
              <Typography variant="h1" className="text-text-primary">
                Why choose our Platform
              </Typography>

              <div className="space-y-9 relative">
                {/* Vertical Line */}
                <div className="absolute left-4 top-10 bottom-10 w-px bg-accent-2 hidden md:block" />
                
                {advantages.map((advantage) => (
                  <AdvantageItem key={advantage.title} {...advantage} />
                ))}
              </div>
            </div>

            {/* Right side - Illustration */}
            <div className="relative h-[400px] lg:h-[480px] flex items-center justify-center order-1 lg:order-2">
              <div className="relative w-full h-full max-w-[457px] mx-auto">
                <Image 
                  src="/images/platform-illustration.png"
                  alt="Platform benefits"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ============================================ */}
      {/* BECOME CONTRACTOR BANNER */}
      {/* ============================================ */}
      <section id="become-contractor" className="py-12 md:py-16">
        <Container>
          <div className="bg-gradient-banner rounded-[30px] overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-[750px,1fr] gap-8 lg:gap-10 p-6 md:p-8 lg:p-12 lg:pr-10">
              <div className="relative h-[300px] sm:h-[400px] lg:h-[450px] rounded-l-[10px] overflow-hidden">
                <Image 
                  src="/images/become-contractor.jpg"
                  alt="Become a contractor"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="space-y-6 lg:space-y-12 flex flex-col justify-center">
                <div className="space-y-8">
                  <Typography variant="h1" className="text-text-primary leading-[1.2]">
                    Your Talent. Their Need. One Click Away.
                  </Typography>
                  <Typography variant="body" className="text-text-primary">
                    Start offering your skills and connect with clients who need your expertise.
                  </Typography>
                </div>
                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                  Become a Contractor
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ============================================ */}
      {/* FOOTER */}
      {/* ============================================ */}
      <footer className="bg-background-1 shadow-[0px_-10px_10px_0px_rgba(198,194,187,0.2)] py-12 md:py-16">
        <Container>
          <div className="flex flex-col md:flex-row gap-12 lg:gap-[110px] justify-center">
            {/* Left Side */}
            <div className="flex flex-wrap gap-12 lg:gap-[60px]">
              {/* Discover */}
              <div className="space-y-4 w-full sm:w-auto">
                <Typography variant="h3" className="text-text-secondary">
                  Discover
                </Typography>
                <nav className="space-y-4">
                  <Link href="#" className="block text-text-primary hover:text-accent-1 transition-colors">
                    <Typography variant="h3">Categories</Typography>
                  </Link>
                  <Link href="#" className="block text-text-primary hover:text-accent-1 transition-colors">
                    <Typography variant="h3">How It Works</Typography>
                  </Link>
                  <Link href="#" className="block text-text-primary hover:text-accent-1 transition-colors">
                    <Typography variant="h3">Post a Task</Typography>
                  </Link>
                  <Link href="#" className="block text-accent-1 hover:text-accent-2 transition-colors">
                    <Typography variant="h3">Become a Tasker</Typography>
                  </Link>
                </nav>
              </div>

              {/* Company */}
              <div className="space-y-4 w-full sm:w-auto">
                <Typography variant="h3" className="text-text-secondary">
                  Company
                </Typography>
                <nav className="space-y-4">
                  <Link href="#" className="block text-text-primary hover:text-accent-1 transition-colors">
                    <Typography variant="h3">Terms and Conditions</Typography>
                  </Link>
                  <Link href="#" className="block text-text-primary hover:text-accent-1 transition-colors">
                    <Typography variant="h3">Privacy Policy</Typography>
                  </Link>
                  <Link href="#" className="block text-text-primary hover:text-accent-1 transition-colors">
                    <Typography variant="h3">Cookie Policy</Typography>
                  </Link>
                </nav>
              </div>
            </div>

            {/* Center - Logo & Copyright */}
            <div className="flex flex-col items-center justify-between space-y-5 py-5 w-full md:w-[236px]">
              <div className="h-11 w-[200px] relative flex items-center justify-center">
                <span className="text-2xl font-bold text-accent-1">HUMMII</span>
              </div>
              <Typography variant="bodySm" align="center" className="text-text-primary">
                © 2025 All rights reserved.
              </Typography>
            </div>

            {/* Right Side */}
            <div className="flex flex-wrap gap-12 lg:gap-[60px]">
              {/* Social & Language */}
              <div className="space-y-4">
                {/* Follow Us */}
                <div className="space-y-4">
                  <Typography variant="h3" className="text-text-secondary">
                    Follow Us
                  </Typography>
                  <div className="flex gap-4">
                    <Link href="#" className="w-8 h-8 flex items-center justify-center hover:opacity-70 transition-opacity" aria-label="Instagram">
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="#2A2A0F">
                        <path d="M16 10.4c-3.1 0-5.6 2.5-5.6 5.6s2.5 5.6 5.6 5.6 5.6-2.5 5.6-5.6-2.5-5.6-5.6-5.6zm0 9.2c-2 0-3.6-1.6-3.6-3.6s1.6-3.6 3.6-3.6 3.6 1.6 3.6 3.6-1.6 3.6-3.6 3.6z"/>
                        <circle cx="22" cy="10" r="1.3"/>
                        <path d="M20.8 3.2H11.2C6.7 3.2 3.2 6.7 3.2 11.2v9.6c0 4.5 3.5 8 8 8h9.6c4.5 0 8-3.5 8-8v-9.6c0-4.5-3.5-8-8-8zm6 17.6c0 3.3-2.7 6-6 6h-9.6c-3.3 0-6-2.7-6-6v-9.6c0-3.3 2.7-6 6-6h9.6c3.3 0 6 2.7 6 6v9.6z"/>
                      </svg>
                    </Link>
                    <Link href="#" className="w-8 h-8 flex items-center justify-center hover:opacity-70 transition-opacity" aria-label="Twitter">
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="#2A2A0F">
                        <path d="M28.8 8.4c-.8.4-1.6.6-2.5.7.9-.5 1.6-1.4 1.9-2.4-.8.5-1.8.9-2.8 1.1-.8-.9-2-1.4-3.2-1.4-2.4 0-4.4 2-4.4 4.4 0 .3 0 .7.1 1-3.7-.2-7-2-9.2-4.7-.4.7-.6 1.4-.6 2.2 0 1.5.8 2.8 2 3.6-.7 0-1.4-.2-2-.5v.1c0 2.1 1.5 3.9 3.5 4.3-.4.1-.8.2-1.2.2-.3 0-.6 0-.9-.1.6 1.9 2.4 3.3 4.5 3.3-1.6 1.3-3.7 2-6 2-.4 0-.8 0-1.2-.1 2.2 1.4 4.8 2.2 7.6 2.2 9.1 0 14.1-7.6 14.1-14.1v-.6c1-.7 1.8-1.6 2.5-2.6z"/>
                      </svg>
                    </Link>
                    <Link href="#" className="w-8 h-8 flex items-center justify-center hover:opacity-70 transition-opacity" aria-label="Facebook">
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="#2A2A0F">
                        <path d="M28.8 16c0-7.1-5.7-12.8-12.8-12.8S3.2 8.9 3.2 16c0 6.4 4.7 11.7 10.8 12.6V19.8h-3.2V16h3.2v-2.8c0-3.2 1.9-4.9 4.8-4.9 1.4 0 2.8.2 2.8.2v3.1h-1.6c-1.6 0-2 1-2 2v2.4h3.4l-.5 3.8h-2.9v8.8c6.1-.9 10.8-6.2 10.8-12.6z"/>
                      </svg>
                    </Link>
                  </div>
                </div>

                {/* Language */}
                <div className="space-y-4">
                  <Typography variant="h3" className="text-text-secondary">
                    Language
                  </Typography>
                  <button className="flex items-center gap-1.5 text-text-primary hover:text-accent-1 transition-colors">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                      <path d="M9 0C4.032 0 0 4.032 0 9s4.032 9 9 9 9-4.032 9-9-4.032-9-9-9zm6.84 5.4H13.5c-.252-.972-.576-1.908-.972-2.772A7.308 7.308 0 0116.84 5.4zM9 1.8c.612.936 1.116 1.98 1.476 3.096H7.524C7.884 3.78 8.388 2.736 9 1.8zM1.98 10.8c-.108-.576-.18-1.176-.18-1.8s.072-1.224.18-1.8h3.276c-.072.576-.108 1.152-.108 1.8 0 .648.036 1.224.108 1.8H1.98zm.672 1.8h2.34c.252.972.576 1.908.972 2.772A7.308 7.308 0 011.652 12.6zm2.34-7.2h-2.34A7.308 7.308 0 015.964 2.628c-.396.864-.72 1.8-.972 2.772zM9 16.2c-.612-.936-1.116-1.98-1.476-3.096h2.952C10.116 14.22 9.612 15.264 9 16.2zm1.8-4.896H7.2c-.072-.576-.108-1.152-.108-1.8 0-.648.036-1.224.108-1.8h3.6c.072.576.108 1.152.108 1.8 0 .648-.036 1.224-.108 1.8zm.228 4.524c.396-.864.72-1.8.972-2.772h2.34a7.308 7.308 0 01-3.312 2.772zM12.744 10.8c.072-.576.108-1.152.108-1.8 0-.648-.036-1.224-.108-1.8h3.276c.108.576.18 1.176.18 1.8s-.072 1.224-.18 1.8h-3.276z"/>
                    </svg>
                    <Typography variant="h3">EN</Typography>
                    <span className="text-lg transform rotate-180">↓</span>
                  </button>
                </div>
              </div>

              {/* Support */}
              <div className="space-y-4 flex flex-col items-end">
                <Typography variant="h3" className="text-text-secondary">
                  Need Help?
                </Typography>
                <Button variant="primary" size="md">
                  Contact support
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
}
