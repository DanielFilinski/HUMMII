/**
 * OrderCard Example
 *
 * Demonstrates usage of the OrderCard component
 */

import { OrderCard } from './OrderCard';

export default function OrderCardExample() {
  const handleRespond = (id: string) => {
    console.log('Respond clicked for order:', id);
    // Navigate to order response page or open modal
  };

  const handleLocationClick = (id: string) => {
    console.log('Location clicked for order:', id);
    // Open map or navigate to location details
  };

  return (
    <div className="p-8 bg-background-secondary min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-text-primary">
          Order Cards
        </h1>

        {/* Single Card */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4 text-text-primary">
            Single Card
          </h2>
          <OrderCard
            id="1"
            clientName="Mary K."
            clientPhoto="/images/clients/mary-k.jpg"
            title="Cleaning of 2-floors House"
            description="Need full cleaning of a two-floor house, including floors, dusting, bathrooms, and kitchen. Looking for a thorough, detailed clean."
            location="Toronto"
            startDate="2024-11-13"
            endDate="2024-11-20"
            startTime="10:00"
            endTime="14:00"
            onRespond={handleRespond}
            onLocationClick={handleLocationClick}
          />
        </div>

        {/* Multiple Cards */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4 text-text-primary">
            Multiple Orders
          </h2>
          <div className="space-y-6">
            <OrderCard
              id="1"
              clientName="Mary K."
              clientPhoto="/images/clients/mary-k.jpg"
              title="Cleaning of 2-floors House"
              description="Need full cleaning of a two-floor house, including floors, dusting, bathrooms, and kitchen. Looking for a thorough, detailed clean."
              location="Toronto"
              startDate="2024-11-13"
              endDate="2024-11-20"
              startTime="10:00"
              endTime="14:00"
              onRespond={handleRespond}
              onLocationClick={handleLocationClick}
            />

            <OrderCard
              id="2"
              clientName="John S."
              clientPhoto="/images/clients/john-s.jpg"
              title="Plumbing Repair - Kitchen Sink"
              description="Kitchen sink is leaking underneath. Need urgent plumbing repair. The leak is getting worse and water is pooling under the cabinet."
              location="Vancouver"
              startDate="2024-11-14"
              endDate="2024-11-14"
              startTime="09:00"
              endTime="12:00"
              onRespond={handleRespond}
              onLocationClick={handleLocationClick}
            />

            <OrderCard
              id="3"
              clientName="Sarah L."
              clientPhoto="/images/clients/sarah-l.jpg"
              title="Garden Landscaping"
              description="Looking for landscaping services for a medium-sized backyard. Need lawn mowing, hedge trimming, and flower bed maintenance."
              location="Montreal"
              startDate="2024-11-15"
              endDate="2024-11-16"
              startTime="08:00"
              endTime="16:00"
              onRespond={handleRespond}
              onLocationClick={handleLocationClick}
            />
          </div>
        </div>

        {/* Without Photo (Fallback) */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4 text-text-primary">
            Without Client Photo (Fallback Avatar)
          </h2>
          <OrderCard
            id="4"
            clientName="Anonymous User"
            title="Electrical Outlet Installation"
            description="Need to install 3 new electrical outlets in the living room. All materials are already purchased and ready."
            location="Calgary"
            startDate="2024-11-20"
            endDate="2024-11-20"
            startTime="14:00"
            endTime="17:00"
            onRespond={handleRespond}
            onLocationClick={handleLocationClick}
          />
        </div>

        {/* Different Date Ranges */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-text-primary">
            Different Date Ranges
          </h2>
          <div className="space-y-6">
            <OrderCard
              id="5"
              clientName="Mike W."
              title="One Day Project"
              description="Quick repair job that needs to be completed in one day."
              location="Ottawa"
              startDate="2024-11-18"
              endDate="2024-11-18"
              startTime="10:00"
              endTime="15:00"
              onRespond={handleRespond}
              onLocationClick={handleLocationClick}
            />

            <OrderCard
              id="6"
              clientName="Lisa B."
              title="Multi-Day Renovation"
              description="Major home renovation project spanning multiple days. Need experienced contractor."
              location="Edmonton"
              startDate="2024-11-25"
              endDate="2024-12-05"
              startTime="08:00"
              endTime="18:00"
              onRespond={handleRespond}
              onLocationClick={handleLocationClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
