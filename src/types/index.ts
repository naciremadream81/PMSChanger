// Core entity types
export interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'USER';
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: Address;
  addressId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contractor {
  id: string;
  companyName: string;
  contactName?: string;
  phone?: string;
  email?: string;
  licenseNumber?: string;
  address?: Address;
  addressId?: string;
  packages PermitPackage[];
}

export interface Subcontractor {
  id: string;
  packageId: string;
  companyName: string;
  contactName?: string;
  phone?: string;
  email?: string;
  licenseNumber?: string;
  address?: Address;
  addressId?: string;
  tradeType: string; // e.g., "Electrical", "Plumbing", "HVAC", "Roofing", etc.
  scopeOfWork?: string;
  contractAmount?: number;
  startDate?: string;
  completionDate?: string;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export interface County {
  id: number;
  name: string;
}

export interface MobileHomeDetails {
  id: string;
  packageId: string;
  makeModel?: string;
  year?: number;
  widthFt?: number;
  lengthFt?: number;
  serialVIN?: string;
  hudLabel?: string;
  installerLicense?: string;
  foundationType?: string;
  tieDownSystem?: string;
  windZone?: string;
}

export interface PackageChecklistItem {
  id: string;
  packageId: string;
  label: string;
  category: string;
  required: boolean;
  completed: boolean;
  completedAt?: string;
}

export interface Document {
  id: string;
  packageId: string;
  type: 'PDF_TEMPLATE' | 'FILLED_PDF' | 'ATTACHMENT' | 'PHOTO';
  tag?: string;
  objectKey: string;
  filename: string;
  mime: string;
  size: number;
  uploadedBy: User;
  uploadedById: string;
  createdAt: string;
  fieldMap?: PdfFieldMap[];
}

export interface PdfFieldMap {
  id: string;
  templateDocumentId: string;
  fieldName: string;
  source: 'CUSTOMER' | 'CONTRACTOR' | 'PACKAGE' | 'MOBILE_HOME' | 'MANUAL';
  sourcePath?: string;
  transform?: string;
}

export interface StatusLog {
  id: string;
  packageId: string;
  status: string;
  note?: string;
  createdBy: User;
  createdById: string;
  createdAt: string;
}

export interface Signature {
  id: string;
  packageId: string;
  signedBy: User;
  signedById: string;
  imageObjectKey: string;
  createdAt: string;
}

export interface PermitPackage {
  id: string;
  title: string;
  permitType: 'RESIDENTIAL' | 'MOBILE_HOME' | 'MODULAR_HOME';
  status: 'DRAFT' | 'IN_REVIEW' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'CLOSED';
  dueDate?: string;
  parcelNumber?: string;
  floodZone?: string;
  windExposure?: string;
  zoningApprovalRef?: string;
  customer: Customer;
  customerId: string;
  contractor: Contractor;
  contractorId: string;
  county: County;
  countyId: number;
  siteAddress?: Address;
  siteAddressId?: string;
  mobileHome?: MobileHomeDetails;
  subcontractors: Subcontractor[];
  createdBy: User;
  createdById: string;
  checklist: PackageChecklistItem[];
  documents: Document[];
  logs: StatusLog[];
  signatures: Signature[];
  createdAt: string;
  updatedAt: string;
}

export interface CountyChecklistTemplateItem {
  id: string;
  countyId: number;
  label: string;
  category: string;
  permitType?: 'RESIDENTIAL' | 'MOBILE_HOME' | 'MODULAR_HOME';
  required: boolean;
  sort: number;
}

// Form types
export interface CreatePackageFormData {
  title: string;
  permitType: 'RESIDENTIAL' | 'MOBILE_HOME' | 'MODULAR_HOME';
  countyId: number;
  customerId: string;
  contractorId: string;
  parcelNumber?: string;
  floodZone?: string;
  windExposure?: string;
  zoningApprovalRef?: string;
  dueDate?: string;
  siteAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
  };
  mobileHome?: {
    makeModel?: string;
    year?: number;
    widthFt?: number;
    lengthFt?: number;
    serialVIN?: string;
    hudLabel?: string;
    installerLicense?: string;
    foundationType?: string;
    tieDownSystem?: string;
    windZone?: string;
  };
}

export interface CreateSubcontractorFormData {
  companyName: string;
  contactName?: string;
  phone?: string;
  email?: string;
  licenseNumber?: string;
  tradeType: string;
  scopeOfWork?: string;
  contractAmount?: number;
  startDate?: string;
  completionDate?: string;
  address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
  };
}

export interface CreateCustomerFormData {
  name: string;
  phone?: string;
  email?: string;
  address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
  };
}

export interface CreateContractorFormData {
  companyName: string;
  contactName?: string;
  phone?: string;
  email?: string;
  licenseNumber?: string;
  address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
  };
}

// API response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SearchFilters {
  q?: string;
  status?: string[];
  countyId?: number;
  dueBefore?: string;
  assignedTo?: string;
}

// Authentication types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// PDF types
export interface PdfFieldMapping {
  field: string;
  source: 'CUSTOMER' | 'CONTRACTOR' | 'PACKAGE' | 'MOBILE_HOME' | 'MANUAL';
  path?: string;
  transform?: string;
}

export interface PresignedUrlResponse {
  url: string;
  expiresAt: string;
}

// Trade types for subcontractors
export const TRADE_TYPES = [
  'Electrical',
  'Plumbing',
  'HVAC',
  'Roofing',
  'Foundation',
  'Framing',
  'Drywall',
  'Painting',
  'Flooring',
  'Landscaping',
  'Concrete',
  'Masonry',
  'Carpentry',
  'Insulation',
  'Windows & Doors',
  'Siding',
  'Gutters',
  'Driveway',
  'Fencing',
  'Other'
] as const;

export type TradeType = typeof TRADE_TYPES[number];

// Utility function for permit type labels
export function getPermitTypeLabel(type: string): string {
  switch (type) {
    case 'RESIDENTIAL':
      return 'Residential'
    case 'MOBILE_HOME':
      return 'Mobile Home'
    case 'MODULAR_HOME':
      return 'Modular Home'
    default:
      return type
  }
}
