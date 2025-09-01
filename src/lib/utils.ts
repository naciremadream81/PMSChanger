import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'DRAFT':
      return 'status-draft'
    case 'IN_REVIEW':
      return 'status-in-review'
    case 'SUBMITTED':
      return 'status-submitted'
    case 'APPROVED':
      return 'status-approved'
    case 'REJECTED':
      return 'status-rejected'
    case 'CLOSED':
      return 'status-closed'
    default:
      return 'status-draft'
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'DRAFT':
      return 'Draft'
    case 'IN_REVIEW':
      return 'In Review'
    case 'SUBMITTED':
      return 'Submitted'
    case 'APPROVED':
      return 'Approved'
    case 'REJECTED':
      return 'Rejected'
    case 'CLOSED':
      return 'Closed'
    default:
      return status
  }
}

export function getSubcontractorStatusColor(status: string): string {
  switch (status) {
    case 'PENDING':
      return 'status-draft'
    case 'ACTIVE':
      return 'status-submitted'
    case 'COMPLETED':
      return 'status-approved'
    case 'CANCELLED':
      return 'status-rejected'
    default:
      return 'status-draft'
  }
}

export function getSubcontractorStatusLabel(status: string): string {
  switch (status) {
    case 'PENDING':
      return 'Pending'
    case 'ACTIVE':
      return 'Active'
    case 'COMPLETED':
      return 'Completed'
    case 'CANCELLED':
      return 'Cancelled'
    default:
      return status
  }
}

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

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

// Florida counties data
export const FLORIDA_COUNTIES = [
  'Alachua', 'Baker', 'Bay', 'Bradford', 'Brevard', 'Broward', 'Calhoun', 'Charlotte', 'Citrus', 'Clay',
  'Collier', 'Columbia', 'DeSoto', 'Dixie', 'Duval', 'Escambia', 'Flagler', 'Franklin', 'Gadsden', 'Gilchrist',
  'Glades', 'Gulf', 'Hamilton', 'Hardee', 'Hendry', 'Hernando', 'Highlands', 'Hillsborough', 'Holmes', 'Indian River',
  'Jackson', 'Jefferson', 'Lafayette', 'Lake', 'Lee', 'Leon', 'Levy', 'Liberty', 'Madison', 'Manatee',
  'Marion', 'Martin', 'Miami-Dade', 'Monroe', 'Nassau', 'Okaloosa', 'Okeechobee', 'Orange', 'Osceola', 'Palm Beach',
  'Pasco', 'Pinellas', 'Polk', 'Putnam', 'Santa Rosa', 'Sarasota', 'Seminole', 'St. Johns', 'St. Lucie', 'Sumter',
  'Suwannee', 'Taylor', 'Union', 'Volusia', 'Wakulla', 'Walton', 'Washington'
]

// Document tags for standardization
export const DOCUMENT_TAGS = [
  'site_plan',
  'foundation_plan', 
  'anchoring_details',
  'zoning_letter',
  'flood_elevation',
  'utility_letter_power',
  'utility_letter_water',
  'utility_letter_sewer',
  'hud_label_photo',
  'serial_photo',
  'installation_affidavit',
  'impact_fee_receipt',
  'addressing_approval'
] as const

export type DocumentTag = typeof DOCUMENT_TAGS[number]

// Checklist categories
export const CHECKLIST_CATEGORIES = [
  'Application',
  'Site',
  'Zoning', 
  'Flood',
  'Wind',
  'Fees',
  'Addressing',
  'Foundation',
  'Anchorage',
  'Unit',
  'Installer',
  'Utilities',
  'Photos',
  'Affidavits'
] as const

export type ChecklistCategory = typeof CHECKLIST_CATEGORIES[number]
