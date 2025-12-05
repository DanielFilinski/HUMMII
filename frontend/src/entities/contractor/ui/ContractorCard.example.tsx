/**
 * ContractorCard Example
 *
 * Demonstrates usage of the ContractorCard component
 */

import { ContractorCard } from './ContractorCard';

export default function ContractorCardExample() {
  const handleViewProfile = (id: string) => {
    console.log('View profile clicked for contractor:', id);
    // Navigate to contractor profile page
  };

  return (
    <div className="p-8 bg-background-secondary min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-text-primary">
          Contractor Cards
        </h1>

        {/* Single Card */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4 text-text-primary">
            Single Card
          </h2>
          <ContractorCard
            id="1"
            category="Plumbing"
            name="John Smith"
            photo="/images/contractors/john-smith.jpg"
            location="Toronto"
            hourlyRate={40}
            rating={4.9}
            tasksCompleted={43}
            onViewProfile={handleViewProfile}
          />
        </div>

        {/* Grid of Cards */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4 text-text-primary">
            Grid Layout
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <ContractorCard
              id="1"
              category="Plumbing"
              name="John Smith"
              photo="/images/contractors/john-smith.jpg"
              location="Toronto"
              hourlyRate={40}
              rating={4.9}
              tasksCompleted={43}
              onViewProfile={handleViewProfile}
            />
            <ContractorCard
              id="2"
              category="Electrical"
              name="Sarah Johnson"
              photo="/images/contractors/sarah-johnson.jpg"
              location="Vancouver"
              hourlyRate={55}
              rating={4.8}
              tasksCompleted={67}
              onViewProfile={handleViewProfile}
            />
            <ContractorCard
              id="3"
              category="Carpentry"
              name="Mike Williams"
              photo="/images/contractors/mike-williams.jpg"
              location="Montreal"
              hourlyRate={45}
              rating={5.0}
              tasksCompleted={89}
              onViewProfile={handleViewProfile}
            />
            <ContractorCard
              id="4"
              category="HVAC"
              name="Lisa Brown"
              location="Calgary"
              hourlyRate={50}
              rating={4.7}
              tasksCompleted={52}
              onViewProfile={handleViewProfile}
            />
          </div>
        </div>

        {/* Different States */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4 text-text-primary">
            Different Rating States
          </h2>
          <div className="flex flex-wrap gap-6">
            <ContractorCard
              id="5"
              category="Plumbing"
              name="Perfect Rating"
              location="Toronto"
              hourlyRate={60}
              rating={5.0}
              tasksCompleted={100}
              onViewProfile={handleViewProfile}
            />
            <ContractorCard
              id="6"
              category="Painting"
              name="Good Rating"
              location="Toronto"
              hourlyRate={35}
              rating={4.5}
              tasksCompleted={28}
              onViewProfile={handleViewProfile}
            />
            <ContractorCard
              id="7"
              category="Landscaping"
              name="New Contractor"
              location="Toronto"
              hourlyRate={30}
              rating={3.8}
              tasksCompleted={5}
              onViewProfile={handleViewProfile}
            />
          </div>
        </div>

        {/* Without Photo (Fallback) */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-text-primary">
            Without Photo (Fallback Avatar)
          </h2>
          <ContractorCard
            id="8"
            category="Roofing"
            name="Tom Anderson"
            location="Ottawa"
            hourlyRate={48}
            rating={4.6}
            tasksCompleted={31}
            onViewProfile={handleViewProfile}
          />
        </div>
      </div>
    </div>
  );
}
