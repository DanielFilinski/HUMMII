/**
 * Dropdown Component Example
 *
 * This file demonstrates the usage of the Dropdown component
 * with cleaning service categories as shown in the design.
 */

'use client';

import { useState } from 'react';
import { Dropdown, DropdownOption } from './Dropdown';

const cleaningOptions: DropdownOption[] = [
  { value: 'home-cleaning', label: 'Home cleaning' },
  { value: 'post-renovation', label: 'Post-renovation cleaning' },
  { value: 'window-cleaning', label: 'Window cleaning' },
  { value: 'move-in-out', label: 'Move-in / move-out cleaning' },
];

export default function DropdownExample() {
  const [selectedValue, setSelectedValue] = useState('post-renovation');

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Basic Example */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Cleaning Service Dropdown</h2>
          <Dropdown
            options={cleaningOptions}
            value={selectedValue}
            onChange={setSelectedValue}
            placeholder="Cle"
            searchable
          />
        </div>

        {/* With Label */}
        <div>
          <h2 className="text-2xl font-bold mb-4">With Label</h2>
          <Dropdown
            label="Select Service Type"
            options={cleaningOptions}
            value={selectedValue}
            onChange={setSelectedValue}
            placeholder="Search services..."
            searchable
          />
        </div>

        {/* Full Width */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Full Width</h2>
          <Dropdown
            options={cleaningOptions}
            value={selectedValue}
            onChange={setSelectedValue}
            placeholder="Search..."
            searchable
            fullWidth
          />
        </div>

        {/* Disabled State */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Disabled</h2>
          <Dropdown
            options={cleaningOptions}
            value={selectedValue}
            onChange={setSelectedValue}
            placeholder="Search..."
            disabled
          />
        </div>

        {/* Current Selection */}
        <div className="mt-8 p-4 bg-white rounded-lg shadow">
          <h3 className="font-semibold mb-2">Current Selection:</h3>
          <p className="text-gray-600">
            {cleaningOptions.find((opt) => opt.value === selectedValue)?.label ||
              'None'}
          </p>
        </div>
      </div>
    </div>
  );
}
