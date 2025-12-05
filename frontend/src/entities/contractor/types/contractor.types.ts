/**
 * Contractor Entity Types
 *
 * Type definitions for Contractor business entity
 */

export interface Contractor {
  id: string;
  category: string;
  name: string;
  photo?: string;
  location: string;
  hourlyRate: number;
  rating: number;
  tasksCompleted: number;
}

export type ContractorStatus = 'available' | 'busy' | 'offline';

export interface ContractorWithStatus extends Contractor {
  status: ContractorStatus;
  isVerified?: boolean;
}

export interface ContractorProfile extends Contractor {
  bio?: string;
  skills: string[];
  certifications?: string[];
  languages?: string[];
  yearsOfExperience: number;
  responseTime?: string;
}
