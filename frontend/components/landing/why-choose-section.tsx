import { benefits } from '@/lib/mock-data';

export function WhyChooseSection() {
  return (
    <section className="w-full bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start gap-8 desktop:flex-row desktop:justify-between">
          {/* Left: Title and Benefits */}
          <div className="flex-1">
            <h2 className="mb-10 text-4xl font-bold text-black">
              Why choose our Platform
            </h2>

            {/* Benefits List */}
            <div className="flex flex-col gap-10">
              {benefits.map((benefit) => (
                <div key={benefit.id} className="flex items-start gap-5">
                  {/* Icon */}
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent-1 shadow-[0px_2.667px_10px_0px_rgba(0,0,0,0.15)]">
                    <svg
                      className="h-4 w-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>

                  {/* Text */}
                  <div className="flex-1">
                    <h3 className="mb-2 text-2xl font-bold text-text-primary">
                      {benefit.title}
                    </h3>
                    <p className="text-xl font-normal leading-relaxed text-text-primary">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Illustration */}
          <div className="flex items-center justify-center desktop:w-[457px]">
            <div className="flex h-[457px] w-[457px] items-center justify-center rounded-full bg-gradient-to-br from-accent-1/10 to-accent-2/10">
              {/* Placeholder for illustration */}
              <div className="text-center">
                <div className="mb-4 flex h-32 w-32 items-center justify-center rounded-full bg-white shadow-lg">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-accent-1">
                    <span className="text-5xl font-bold text-white">H</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500">Illustration Placeholder</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


