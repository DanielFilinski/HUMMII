/**
 * CategoryCard Component
 * 
 * Карточка категории услуг с многослойным дизайном согласно макету
 * 
 * Особенности:
 * - Градиентный фон
 * - Многослойный эффект карточек
 * - Поддержка hover-состояний
 * - Семантические цвета из дизайн-системы
 */

import { forwardRef } from 'react';
import { cn } from '@/src/shared/lib/utils';
import { Typography } from '@/src/shared/ui/typography/Typography';
import type { CategoryCardProps } from '@/src/entities/category';

export const CategoryCard = forwardRef<HTMLDivElement, CategoryCardProps>(
  ({ category, locale, onClick, className, ...props }, ref) => {
    const handleClick = () => {
      if (onClick) {
        onClick(category.id);
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'group relative h-[320px] w-full max-w-[320px] cursor-pointer overflow-hidden rounded-[32px] transition-all duration-300',
          // Gradient background
          'bg-gradient-to-b',
          category.gradient,
          // Hover effects
          'hover:scale-[1.02] hover:shadow-xl',
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {/* Subcategories List - Top Section */}
        <div className="relative z-20 flex flex-col gap-2 p-4">
          {category.subcategories.slice(0, 3).map((subcategory, index) => (
            <div
              key={`${category.id}-${index}`}
              className={cn(
                'w-full rounded-[16px] bg-background-card px-5 py-4 shadow-sm transition-all duration-300',
                'group-hover:translate-y-[-2px] group-hover:shadow-md',
                index === 1 && 'delay-75',
                index === 2 && 'delay-150'
              )}
            >
              <Typography 
                variant="body" 
                color="primary"
                weight="medium"
                className="line-clamp-1"
              >
                {subcategory}
              </Typography>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 h-[140px]">
           {/* Title */}
           <div className="absolute bottom-6 left-6 z-20 max-w-[60%]">
            <Typography 
              variant="h2" 
              color="primary"
              weight="bold"
              className="leading-tight"
            >
              {category.name}
            </Typography>
          </div>

          {/* Image & Decoration - Bottom Right */}
          <div className="absolute bottom-0 right-0 h-[160px] w-[160px]">
             {/* Decorative Circle */}
             <div className="absolute bottom-[-30px] right-[-30px] h-[160px] w-[160px] rounded-full bg-feedback-warning/20" />
             
             {/* Image */}
             {category.icon && (
               <img 
                 src={category.icon} 
                 alt={category.name}
                 className="absolute bottom-0 right-0 h-[140px] w-[140px] object-contain object-bottom transition-transform duration-300 group-hover:scale-110"
               />
             )}
          </div>
        </div>
      </div>
    );
  }
);

CategoryCard.displayName = 'CategoryCard';