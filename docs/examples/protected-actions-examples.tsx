/**
 * EXAMPLE: How to add protected actions to your features
 * Copy this file and adapt to your needs
 */

import { useProtectedAction } from '@/hooks/use-protected-action';
import { AuthModal } from '@/components/auth/auth-modal';
import { apiClient } from '@/lib/api/client';
import { useRouter } from 'next/navigation';

// ===========================================================================
// EXAMPLE 1: Simple protected button (navigation)
// ===========================================================================
export function SimpleProtectedButton() {
  const router = useRouter();
  
  const { execute, showModal, closeModal } = useProtectedAction({
    reason: 'To access this feature',
    action: 'Please register or login',
  });

  const handleClick = () => {
    execute(() => {
      // Code here runs ONLY if user is authenticated
      router.push('/protected-page');
    });
  };

  return (
    <>
      <button onClick={handleClick}>Protected Action</button>
      <AuthModal isOpen={showModal} onClose={closeModal} />
    </>
  );
}

// ===========================================================================
// EXAMPLE 2: Protected button with role check
// ===========================================================================
export function RoleProtectedButton() {
  const router = useRouter();
  
  const { execute, showModal, closeModal, reason, action } = useProtectedAction({
    requiredRoles: ['CLIENT'],
    reason: 'To create an order',
    action: 'You need to register as a client',
    onSuccess: () => {
      console.log('User has correct role, proceeding...');
    },
    onInsufficientRole: () => {
      alert('You need to be a CLIENT to perform this action');
    },
  });

  const handleCreateOrder = () => {
    execute(() => {
      router.push('/orders/create');
    });
  };

  return (
    <>
      <button onClick={handleCreateOrder}>Create Order</button>
      <AuthModal 
        isOpen={showModal} 
        onClose={closeModal}
        reason={reason}
        action={action}
      />
    </>
  );
}

// ===========================================================================
// EXAMPLE 3: Protected API call (async)
// ===========================================================================
export function ProtectedApiButton({ itemId }: { itemId: string }) {
  const { execute, showModal, closeModal } = useProtectedAction({
    reason: 'To add items to favorites',
    action: 'Register to save your favorite items',
  });

  const addToFavorites = () => {
    execute(async () => {
      // Async code is supported!
      try {
        await apiClient.post('/favorites', { itemId });
        alert('Added to favorites!');
      } catch (error) {
        console.error('Failed to add to favorites:', error);
        alert('Failed to add to favorites');
      }
    });
  };

  return (
    <>
      <button onClick={addToFavorites}>❤️ Add to Favorites</button>
      <AuthModal 
        isOpen={showModal} 
        onClose={closeModal}
        reason="To add items to favorites"
        action="Register to save your favorite items"
      />
    </>
  );
}

// ===========================================================================
// EXAMPLE 4: Protected form submission
// ===========================================================================
export function ProtectedForm() {
  const [formData, setFormData] = React.useState({ title: '', description: '' });
  const { execute, showModal, closeModal } = useProtectedAction({
    requiredRoles: ['CLIENT', 'CONTRACTOR'],
    reason: 'To submit reviews',
    action: 'Register to leave a review',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    execute(async () => {
      try {
        await apiClient.post('/reviews', formData);
        alert('Review submitted!');
        setFormData({ title: '', description: '' });
      } catch (error) {
        console.error('Failed to submit review:', error);
      }
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Title"
        />
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Description"
        />
        <button type="submit">Submit Review</button>
      </form>
      
      <AuthModal isOpen={showModal} onClose={closeModal} />
    </>
  );
}

// ===========================================================================
// EXAMPLE 5: Conditional rendering based on auth
// ===========================================================================
export function ConditionalProtectedContent() {
  const { isAuthenticated, hasRequiredRole, openModal, showModal, closeModal } = useProtectedAction({
    requiredRoles: ['CONTRACTOR'],
    reason: 'To view contractor dashboard',
  });

  // Show different content based on auth state
  if (!isAuthenticated) {
    return (
      <>
        <div>
          <h2>Contractor Dashboard</h2>
          <p>This content is only for contractors.</p>
          <button onClick={openModal}>Login to Access</button>
        </div>
        <AuthModal isOpen={showModal} onClose={closeModal} />
      </>
    );
  }

  if (!hasRequiredRole) {
    return (
      <div>
        <h2>Access Denied</h2>
        <p>You need to be a contractor to view this page.</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Welcome, Contractor!</h2>
      {/* Protected content here */}
    </div>
  );
}

// ===========================================================================
// EXAMPLE 6: Multiple protected actions in one component
// ===========================================================================
export function MultipleProtectedActions() {
  const router = useRouter();
  
  // First protected action
  const createOrder = useProtectedAction({
    requiredRoles: ['CLIENT'],
    reason: 'To create orders',
  });

  // Second protected action
  const sendMessage = useProtectedAction({
    reason: 'To send messages',
  });

  return (
    <div>
      <button onClick={() => createOrder.execute(() => router.push('/orders/create'))}>
        Create Order
      </button>
      
      <button onClick={() => sendMessage.execute(async () => {
        await apiClient.post('/messages', { content: 'Hello!' });
      })}>
        Send Message
      </button>

      {/* Modals for both actions */}
      <AuthModal 
        isOpen={createOrder.showModal} 
        onClose={createOrder.closeModal}
        reason={createOrder.reason}
        action={createOrder.action}
      />
      
      <AuthModal 
        isOpen={sendMessage.showModal} 
        onClose={sendMessage.closeModal}
        reason={sendMessage.reason}
        action={sendMessage.action}
      />
    </div>
  );
}

// ===========================================================================
// BACKEND EXAMPLES
// ===========================================================================

/**
 * BACKEND EXAMPLE 1: Basic protected endpoint
 */
/*
import { Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';

@Controller('favorites')
export class FavoritesController {
  @UseGuards(JwtAuthGuard)
  @Post()
  async addToFavorites(
    @CurrentUser() user: any,
    @Body() data: { itemId: string },
  ) {
    // User is authenticated, user.userId is available
    return this.favoritesService.add(user.userId, data.itemId);
  }
}
*/

/**
 * BACKEND EXAMPLE 2: Role-protected endpoint
 */
/*
import { Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';

@Controller('orders')
export class OrdersController {
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CLIENT') // Only CLIENT role allowed
  @Post()
  async createOrder(
    @CurrentUser() user: any,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    // User is CLIENT, can create order
    return this.ordersService.create(user.userId, createOrderDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CONTRACTOR') // Only CONTRACTOR role allowed
  @Post(':id/apply')
  async applyToOrder(
    @CurrentUser() user: any,
    @Param('id') orderId: string,
  ) {
    // User is CONTRACTOR, can apply to order
    return this.ordersService.apply(orderId, user.userId);
  }
}
*/

/**
 * BACKEND EXAMPLE 3: Multiple roles allowed
 */
/*
@Controller('messages')
export class MessagesController {
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CLIENT', 'CONTRACTOR') // Both roles allowed
  @Post()
  async sendMessage(
    @CurrentUser() user: any,
    @Body() messageDto: SendMessageDto,
  ) {
    // Both CLIENTs and CONTRACTORs can send messages
    return this.messagesService.send(user.userId, messageDto);
  }
}
*/

/**
 * BACKEND EXAMPLE 4: Admin-only endpoint
 */
/*
@Controller('admin')
export class AdminController {
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('stats')
  async getStats() {
    // Only ADMIN can access
    return this.statsService.getAll();
  }
}
*/

