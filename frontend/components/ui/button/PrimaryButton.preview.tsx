/**
 * PRIMARY BUTTON - VISUAL PREVIEW
 * 
 * Этот файл генерирует визуальное превью всех состояний PrimaryButton
 * Используется для документации и дизайн-систем
 */

export function PrimaryButtonPreview() {
  return (
    <div className="space-y-8 p-8 bg-background">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-text-primary mb-2">
          Primary Button States
        </h1>
        <p className="text-lg text-text-secondary">
          Visual preview of all button states from design system
        </p>
      </div>

      {/* Grid of all states */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* State 1: Default */}
        <div className="text-center space-y-3">
          <div className="h-32 flex items-center justify-center bg-white rounded-xl border-2 border-gray-200">
            <div className="w-48 h-12 rounded-full bg-[#3A971E] flex items-center justify-center">
              <span className="text-white font-medium">View all services</span>
            </div>
          </div>
          <div>
            <p className="font-semibold text-text-primary">Default</p>
            <p className="text-sm text-text-secondary">#3A971E</p>
          </div>
        </div>

        {/* State 2: Hover */}
        <div className="text-center space-y-3">
          <div className="h-32 flex items-center justify-center bg-white rounded-xl border-2 border-gray-200">
            <div className="w-48 h-12 rounded-full bg-[#67AD51] flex items-center justify-center">
              <span className="text-white font-medium">View all services</span>
            </div>
          </div>
          <div>
            <p className="font-semibold text-text-primary">Hover</p>
            <p className="text-sm text-text-secondary">#67AD51</p>
          </div>
        </div>

        {/* State 3: Pressed */}
        <div className="text-center space-y-3">
          <div className="h-32 flex items-center justify-center bg-white rounded-xl border-2 border-gray-200">
            <div className="w-48 h-12 rounded-full bg-[#AAC89A] flex items-center justify-center">
              <span className="text-white font-medium">View all services</span>
            </div>
          </div>
          <div>
            <p className="font-semibold text-text-primary">Pressed</p>
            <p className="text-sm text-text-secondary">#AAC89A</p>
          </div>
        </div>

        {/* State 4: Loading */}
        <div className="text-center space-y-3">
          <div className="h-32 flex items-center justify-center bg-white rounded-xl border-2 border-gray-200">
            <div className="w-48 h-12 rounded-full bg-[#3A971E] flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              <span className="text-white font-medium">View all services</span>
            </div>
          </div>
          <div>
            <p className="font-semibold text-text-primary">Loading</p>
            <p className="text-sm text-text-secondary">With spinner</p>
          </div>
        </div>

        {/* State 5: Disabled */}
        <div className="text-center space-y-3">
          <div className="h-32 flex items-center justify-center bg-white rounded-xl border-2 border-gray-200">
            <div className="w-48 h-12 rounded-full bg-[#3A971E] opacity-40 flex items-center justify-center">
              <span className="text-white font-medium">View all services</span>
            </div>
          </div>
          <div>
            <p className="font-semibold text-text-primary">Disabled</p>
            <p className="text-sm text-text-secondary">40% opacity</p>
          </div>
        </div>
      </div>

      {/* Dark theme variants */}
      <div className="dark bg-[#0F1419] rounded-xl p-8 space-y-6">
        <h2 className="text-2xl font-bold text-white text-center mb-6">
          Dark Theme Variants
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Default Dark */}
          <div className="text-center space-y-3">
            <div className="h-32 flex items-center justify-center bg-[#1A2028] rounded-xl border-2 border-[#374151]">
              <div className="w-48 h-12 rounded-full bg-[#67AD51] flex items-center justify-center">
                <span className="text-white font-medium">View all services</span>
              </div>
            </div>
            <div>
              <p className="font-semibold text-white">Default</p>
              <p className="text-sm text-gray-400">#67AD51</p>
            </div>
          </div>

          {/* Hover Dark */}
          <div className="text-center space-y-3">
            <div className="h-32 flex items-center justify-center bg-[#1A2028] rounded-xl border-2 border-[#374151]">
              <div className="w-48 h-12 rounded-full bg-[#86C06E] flex items-center justify-center">
                <span className="text-white font-medium">View all services</span>
              </div>
            </div>
            <div>
              <p className="font-semibold text-white">Hover</p>
              <p className="text-sm text-gray-400">#86C06E</p>
            </div>
          </div>

          {/* Pressed Dark */}
          <div className="text-center space-y-3">
            <div className="h-32 flex items-center justify-center bg-[#1A2028] rounded-xl border-2 border-[#374151]">
              <div className="w-48 h-12 rounded-full bg-[#5A8D47] flex items-center justify-center">
                <span className="text-white font-medium">View all services</span>
              </div>
            </div>
            <div>
              <p className="font-semibold text-white">Pressed</p>
              <p className="text-sm text-gray-400">#5A8D47</p>
            </div>
          </div>

          {/* Loading Dark */}
          <div className="text-center space-y-3">
            <div className="h-32 flex items-center justify-center bg-[#1A2028] rounded-xl border-2 border-[#374151]">
              <div className="w-48 h-12 rounded-full bg-[#67AD51] flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                <span className="text-white font-medium">View all services</span>
              </div>
            </div>
            <div>
              <p className="font-semibold text-white">Loading</p>
              <p className="text-sm text-gray-400">With spinner</p>
            </div>
          </div>

          {/* Disabled Dark */}
          <div className="text-center space-y-3">
            <div className="h-32 flex items-center justify-center bg-[#1A2028] rounded-xl border-2 border-[#374151]">
              <div className="w-48 h-12 rounded-full bg-[#67AD51] opacity-40 flex items-center justify-center">
                <span className="text-white font-medium">View all services</span>
              </div>
            </div>
            <div>
              <p className="font-semibold text-white">Disabled</p>
              <p className="text-sm text-gray-400">40% opacity</p>
            </div>
          </div>
        </div>
      </div>

      {/* Technical specs */}
      <div className="bg-background-card rounded-xl border border-border-primary p-6">
        <h2 className="text-2xl font-bold text-text-primary mb-4">
          Technical Specifications
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="font-semibold text-text-primary">Padding</p>
            <p className="text-text-secondary">32px × 12px</p>
          </div>
          <div>
            <p className="font-semibold text-text-primary">Border Radius</p>
            <p className="text-text-secondary">9999px (full round)</p>
          </div>
          <div>
            <p className="font-semibold text-text-primary">Font Size</p>
            <p className="text-text-secondary">16px (1rem)</p>
          </div>
          <div>
            <p className="font-semibold text-text-primary">Font Weight</p>
            <p className="text-text-secondary">500 (medium)</p>
          </div>
          <div>
            <p className="font-semibold text-text-primary">Line Height</p>
            <p className="text-text-secondary">24px (1.5rem)</p>
          </div>
          <div>
            <p className="font-semibold text-text-primary">Transition</p>
            <p className="text-text-secondary">200ms ease-in-out</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrimaryButtonPreview;
