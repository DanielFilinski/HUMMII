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
        <div className="relative z-20 flex flex-col p-4">
          {category.subcategories.slice(0, 3).map((subcategory, index) => (
            <div
              key={`${category.id}-${index}`}
              className={cn(
                'w-full h-[100px] rounded-[16px] bg-background-primary px-5 py-4 transition-all duration-300',
                'shadow-[0_-4px_8px_rgba(0,0,0,0.1)] shadow-sm',
                'group-hover:translate-y-[-2px] group-hover:shadow-md group-hover:shadow-[0_-6px_12px_rgba(0,0,0,0.15)]',
                index === 1 && 'delay-75 -mt-13',
                index === 2 && 'delay-150 -mt-13',
                index > 0 && '-mt-[38px]'
              )}
              style={{ zIndex: 20 + index }}
            >
              <Typography 
                variant="bodySm" 
                color="primary"
                weight="medium"
                className="line-clamp-1"
              >
                {subcategory}
              </Typography>
            </div>
          ))}
        </div>

        <div className="absolute bottom-0 right-0 w-full z-30" >

          <div className="absolute bottom-[100px] right-0">
            <svg width="199" height="18" viewBox="0 0 199 18" fill="none">
              <path d="M38.2873 1.61326C40.7743 0.548821 43.4515 0 46.1567 0H199V18H0L38.2873 1.61326Z" fill="#E1F7DB"/>
            </svg>           
          </div>

          <div className='absolute bottom-0 right-0 h-[100px] w-full bg-background-secondary'></div>

          <div className="absolute bottom-[-50px] right-[-60px] rounded-full h-[180px] w-[180px] overflow-hidden">
              <img 
                src="/images/categories/Auto.jpg" 
                alt="Leaves Decoration"              
                className="h-[120px] w-[250px] absolute top-[12px] right-0"
              /> 
            </div>  
           
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
        </div>
         
        
      </div>
    );
  }
);

CategoryCard.displayName = 'CategoryCard';