export interface OrderWithDistance {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  categoryId: string;
  clientId: string;
  contractorId: string | null;
  latitude: number | null;
  longitude: number | null;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  budget: number | null;
  deadline: Date | null;
  publishedAt: Date | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  distance?: number; // Distance in km (calculated)
}

