/**
 * ContractorCard Component
 *
 * Card component displaying contractor information including:
 * - Category badge
 * - Profile photo
 * - Name, location, and hourly rate
 * - Rating with stars
 * - Completed tasks count
 * - View profile button
 */

import { forwardRef } from 'react';
import { cn } from '@/src/shared/lib/utils';
import { Avatar } from '@/src/shared/ui/avatars/Avatar';
import { Typography } from '@/src/shared/ui/typography/Typography';

export interface ContractorCardProps {
  /**
   * Contractor ID
   */
  id: string;

  /**
   * Category name (e.g., "Plumbing", "Electrical")
   */
  category: string;

  /**
   * Contractor name
   */
  name: string;

  /**
   * Profile photo URL
   */
  photo?: string;

  /**
   * City/location
   */
  location: string;

  /**
   * Hourly rate in dollars
   */
  hourlyRate: number;

  /**
   * Rating (0-5)
   */
  rating: number;

  /**
   * Number of completed tasks
   */
  tasksCompleted: number;

  /**
   * Click handler for view profile button
   */
  onViewProfile?: (id: string) => void;

  /**
   * Additional CSS classes
   */
  className?: string;
}

export const ContractorCard = forwardRef<HTMLDivElement, ContractorCardProps>(
  (
    {
      id,
      category,
      name,
      photo,
      location,
      hourlyRate,
      rating,
      tasksCompleted,
      onViewProfile,
      className,
    },
    ref
  ) => {
    const handleViewProfile = () => {
      if (onViewProfile) {
        onViewProfile(id);
      }
    };

    // Render star icons based on rating
    const renderStars = () => {
      const stars = [];
      const fullStars = Math.floor(rating);

      for (let i = 0; i < 5; i++) {
        stars.push(
          <svg
            key={i}
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="inline-block"
          >
            <path
              d="M8 1.33334L9.88 5.14667L14 5.74667L11 8.66667L11.76 12.7733L8 10.78L4.24 12.7733L5 8.66667L2 5.74667L6.12 5.14667L8 1.33334Z"
              fill={i < fullStars ? '#6AB344' : '#E0E0E0'}
              stroke={i < fullStars ? '#6AB344' : '#E0E0E0'}
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      }
      return stars;
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col w-full max-w-[240px] bg-background-primary rounded-[16px] overflow-hidden shadow-sm border border-[#E0E0E0]',
          className
        )}
      >
        {/* Category Badge */}
        <div className="w-full bg-[#6AB344] px-4 py-3 flex items-center justify-center">
          <Typography
            variant="bodyMd"
            weight="semibold"
            className="text-white text-center"
          >
            {category}
          </Typography>
        </div>

        {/* Main Content */}
        <div className="flex flex-col items-center px-4 pb-6">
          {/* Avatar */}
          <div className="mt-4 mb-3">
            <Avatar
              src={photo}
              alt={name}
              size="lg"
              shape="circle"
              showBorder
              variant="default"
            />
          </div>

          {/* Name */}
          <Typography
            variant="h3"
            weight="bold"
            color="primary"
            className="mb-1 text-center"
          >
            {name}
          </Typography>

          {/* Location and Rate */}
          <Typography
            variant="bodySm"
            color="secondary"
            className="mb-2 text-center"
          >
            {location} {hourlyRate} $/Hr
          </Typography>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-1">
            <Typography
              variant="bodyMd"
              weight="bold"
              className="text-[#6AB344]"
            >
              {rating.toFixed(1)}
            </Typography>
            <div className="flex gap-0.5">
              {renderStars()}
            </div>
          </div>

          {/* Tasks Completed */}
          <Typography
            variant="bodySm"
            color="secondary"
            className="mb-4 text-center"
          >
            {tasksCompleted} Tasks completed
          </Typography>

          {/* View Profile Button */}
          <button
            onClick={handleViewProfile}
            className={cn(
              'w-full py-2.5 px-4 rounded-lg',
              'bg-transparent border-2 border-[#6AB344]',
              'text-[#6AB344] font-semibold text-[16px]',
              'transition-all duration-200',
              'hover:bg-[#6AB344] hover:text-white',
              'active:scale-[0.98]',
              'focus:outline-none focus:ring-2 focus:ring-[#6AB344] focus:ring-offset-2'
            )}
          >
            View Profile
          </button>
        </div>
      </div>
    );
  }
);

ContractorCard.displayName = 'ContractorCard';
