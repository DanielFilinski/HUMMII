/**
 * OrderCard Component
 *
 * Card component displaying order information including:
 * - Client avatar and name
 * - Order date and time range
 * - Order title
 * - Location with link
 * - Order description
 * - Respond button
 */

import { forwardRef } from 'react';
import { cn } from '@/src/shared/lib/utils';
import { Avatar } from '@/src/shared/ui/avatars/Avatar';
import { Typography } from '@/src/shared/ui/typography/Typography';

export interface OrderCardProps {
  /**
   * Order ID
   */
  id: string;

  /**
   * Client name
   */
  clientName: string;

  /**
   * Client profile photo URL
   */
  clientPhoto?: string;

  /**
   * Order title
   */
  title: string;

  /**
   * Order description
   */
  description: string;

  /**
   * Location/city
   */
  location: string;

  /**
   * Start date (ISO string or Date object)
   */
  startDate: string | Date;

  /**
   * End date (ISO string or Date object)
   */
  endDate: string | Date;

  /**
   * Start time (e.g., "10:00")
   */
  startTime: string;

  /**
   * End time (e.g., "14:00")
   */
  endTime: string;

  /**
   * Click handler for respond button
   */
  onRespond?: (id: string) => void;

  /**
   * Click handler for location link
   */
  onLocationClick?: (id: string) => void;

  /**
   * Additional CSS classes
   */
  className?: string;
}

export const OrderCard = forwardRef<HTMLDivElement, OrderCardProps>(
  (
    {
      id,
      clientName,
      clientPhoto,
      title,
      description,
      location,
      startDate,
      endDate,
      startTime,
      endTime,
      onRespond,
      onLocationClick,
      className,
    },
    ref
  ) => {
    const handleRespond = () => {
      if (onRespond) {
        onRespond(id);
      }
    };

    const handleLocationClick = () => {
      if (onLocationClick) {
        onLocationClick(id);
      }
    };

    // Format dates
    const formatDate = (date: string | Date): string => {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    };

    const dateRange = `${formatDate(startDate)} - ${formatDate(endDate)}, ${startTime}-${endTime}`;

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col w-full max-w-[608px] bg-background-primary rounded-[24px] overflow-hidden shadow-sm border border-[#E0E0E0] p-5',
          className
        )}
      >
        {/* Header: Avatar, Name, and Date */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar
              src={clientPhoto}
              alt={clientName}
              size="sm"
              shape="circle"
              showBorder
              variant="default"
            />
            <Typography
              variant="h3"
              weight="bold"
              color="primary"
              className="leading-tight"
            >
              {clientName}
            </Typography>
          </div>
          <Typography
            variant="bodySm"
            color="secondary"
            className="text-right whitespace-nowrap ml-2"
          >
            {dateRange}
          </Typography>
        </div>

        {/* Title */}
        <Typography
          variant="h3"
          weight="bold"
          color="primary"
          className="mb-1"
        >
          {title}
        </Typography>

        {/* Location with Link */}
        <div className="flex items-center justify-between mb-3">
          <Typography
            variant="bodyMd"
            color="primary"
            className="leading-tight"
          >
            {location}
          </Typography>
          <button
            onClick={handleLocationClick}
            className="text-[#6AB344] font-semibold text-[16px] hover:text-[#5A9B38] transition-colors focus:outline-none"
          >
            See location
          </button>
        </div>

        {/* Separator */}
        <div className="w-full h-px bg-[#E0E0E0] mb-3" />

        {/* Description */}
        <Typography
          variant="bodyMd"
          color="primary"
          className="mb-5 leading-relaxed"
        >
          {description}
        </Typography>

        {/* Respond Button */}
        <button
          onClick={handleRespond}
          className={cn(
            'w-full py-3.5 px-6 rounded-[12px]',
            'bg-[#6AB344] text-white font-semibold text-[18px]',
            'transition-all duration-200',
            'hover:bg-[#5A9B38]',
            'active:scale-[0.98]',
            'focus:outline-none focus:ring-2 focus:ring-[#6AB344] focus:ring-offset-2'
          )}
        >
          Respond
        </button>
      </div>
    );
  }
);

OrderCard.displayName = 'OrderCard';
