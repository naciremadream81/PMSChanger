import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  ApiResponse, 
  PaginatedResponse, 
  PermitPackage, 
  Customer, 
  Contractor, 
  Subcontractor,
  County,
  CreatePackageFormData,
  CreateCustomerFormData,
  CreateContractorFormData,
  CreateSubcontractorFormData,
  AuthResponse,
  LoginCredentials,
  SearchFilters,
  PresignedUrlResponse
} from '@/types';

// API base URL - supports both local and cloud deployment
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (window.location.hostname === 'localhost' ? 'http://localhost:4000/api' : '/api');

// Development mode flag
const DEV_MODE = import.meta.env.DEV && !import.meta.env.VITE_API_URL;

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle auth errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        // Handle network errors (no response)
        if (!error.response) {
          console.warn('Network error:', error.message);
          return Promise.reject(new Error('Network error: Unable to connect to server'));
        }
        
        // Handle HTTP errors
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Development mode mock data
  private getMockUser() {
    return {
      data: {
        id: 'dev-user-1',
        email: 'admin@example.com',
        role: 'ADMIN' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    };
  }

  // Authentication
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    if (DEV_MODE) {
      // Mock login for development
      const mockUser = this.getMockUser();
      const mockToken = 'dev-token-' + Date.now();
      localStorage.setItem('auth_token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser.data));
      return {
        user: mockUser.data,
        token: mockToken
      };
    }
    
    const response = await this.client.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  }

  async logout(): Promise<void> {
    if (DEV_MODE) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      return;
    }
    
    await this.client.post('/auth/logout');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }

  async getCurrentUser(): Promise<ApiResponse<any>> {
    if (DEV_MODE) {
      // Check if we have a stored user in dev mode
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        return { data: JSON.parse(storedUser) };
      }
      // Return mock user for development
      return this.getMockUser();
    }
    
    const response = await this.client.get<ApiResponse<any>>('/auth/me');
    return response.data;
  }

  // Permit Packages
  async getPackages(filters?: SearchFilters, page = 1, limit = 20): Promise<PaginatedResponse<PermitPackage>> {
    const params = { page, limit, ...filters };
    const response = await this.client.get<PaginatedResponse<PermitPackage>>('/packages', { params });
    return response.data;
  }

  async getPackage(id: string): Promise<PermitPackage> {
    const response = await this.client.get<PermitPackage>(`/packages/${id}`);
    return response.data;
  }

  async createPackage(data: CreatePackageFormData): Promise<PermitPackage> {
    const response = await this.client.post<PermitPackage>('/packages', data);
    return response.data;
  }

  async updatePackage(id: string, data: Partial<CreatePackageFormData>): Promise<PermitPackage> {
    const response = await this.client.patch<PermitPackage>(`/packages/${id}`, data);
    return response.data;
  }

  async updatePackageStatus(id: string, status: string, note?: string): Promise<PermitPackage> {
    const response = await this.client.patch<PermitPackage>(`/packages/${id}/status`, { status, note });
    return response.data;
  }

  async deletePackage(id: string): Promise<void> {
    await this.client.delete(`/packages/${id}`);
  }

  // Mobile Home Details
  async updateMobileHomeDetails(packageId: string, data: any): Promise<any> {
    const response = await this.client.put(`/packages/${packageId}/mobile-home`, data);
    return response.data;
  }

  // Subcontractors
  async getPackageSubcontractors(packageId: string): Promise<Subcontractor[]> {
    const response = await this.client.get<Subcontractor[]>(`/packages/${packageId}/subcontractors`);
    return response.data;
  }

  async createSubcontractor(packageId: string, data: CreateSubcontractorFormData): Promise<Subcontractor> {
    const response = await this.client.post<Subcontractor>(`/packages/${packageId}/subcontractors`, data);
    return response.data;
  }

  async updateSubcontractor(packageId: string, subcontractorId: string, data: Partial<CreateSubcontractorFormData>): Promise<Subcontractor> {
    const response = await this.client.patch<Subcontractor>(`/packages/${packageId}/subcontractors/${subcontractorId}`, data);
    return response.data;
  }

  async deleteSubcontractor(packageId: string, subcontractorId: string): Promise<void> {
    await this.client.delete(`/packages/${packageId}/subcontractors/${subcontractorId}`);
  }

  async updateSubcontractorStatus(packageId: string, subcontractorId: string, status: string): Promise<Subcontractor> {
    const response = await this.client.patch<Subcontractor>(`/packages/${packageId}/subcontractors/${subcontractorId}/status`, { status });
    return response.data;
  }

  // Customers
  async getCustomers(page = 1, limit = 20): Promise<PaginatedResponse<Customer>> {
    const response = await this.client.get<PaginatedResponse<Customer>>('/customers', { 
      params: { page, limit } 
    });
    return response.data;
  }

  async getCustomer(id: string): Promise<Customer> {
    const response = await this.client.get<Customer>(`/customers/${id}`);
    return response.data;
  }

  async createCustomer(data: CreateCustomerFormData): Promise<Customer> {
    const response = await this.client.post<Customer>('/customers', data);
    return response.data;
  }

  async updateCustomer(id: string, data: Partial<CreateCustomerFormData>): Promise<Customer> {
    const response = await this.client.patch<Customer>(`/customers/${id}`, data);
    return response.data;
  }

  async deleteCustomer(id: string): Promise<void> {
    await this.client.delete(`/customers/${id}`);
  }

  // Contractors
  async getContractors(page = 1, limit = 20): Promise<PaginatedResponse<Contractor>> {
    const response = await this.client.get<PaginatedResponse<Contractor>>('/contractors', { 
      params: { page, limit } 
    });
    return response.data;
  }

  async getContractor(id: string): Promise<Contractor> {
    const response = await this.client.get<Contractor>(`/contractors/${id}`);
    return response.data;
  }

  async createContractor(data: CreateContractorFormData): Promise<Contractor> {
    const response = await this.client.post<Contractor>('/contractors', data);
    return response.data;
  }

  async updateContractor(id: string, data: Partial<CreateContractorFormData>): Promise<Contractor> {
    const response = await this.client.patch<Contractor>(`/contractors/${id}`, data);
    return response.data;
  }

  async deleteContractor(id: string): Promise<void> {
    await this.client.delete(`/contractors/${id}`);
  }

  // Counties
  async getCounties(): Promise<County[]> {
    const response = await this.client.get<County[]>('/counties');
    return response.data;
  }

  // Checklist
  async getPackageChecklist(packageId: string): Promise<any[]> {
    const response = await this.client.get(`/packages/${packageId}/checklist`);
    return response.data;
  }

  async updateChecklistItem(packageId: string, itemId: string, completed: boolean): Promise<any> {
    const response = await this.client.patch(`/packages/${packageId}/checklist/${itemId}`, { completed });
    return response.data;
  }

  // Documents
  async getPackageDocuments(packageId: string): Promise<any[]> {
    const response = await this.client.get(`/packages/${packageId}/documents`);
    return response.data;
  }

  async uploadDocument(packageId: string, file: File, type: string, tag?: string): Promise<any> {
    // Get presigned URL for upload
    const key = `packages/${packageId}/${type}/${Date.now()}-${file.name}`;
    const presignResponse = await this.client.post<PresignedUrlResponse>('/documents/presign', {
      key,
      op: 'put'
    });

    // Upload file to storage
    await fetch(presignResponse.data.url, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    // Create document record
    const documentData = {
      packageId,
      type,
      tag,
      objectKey: key,
      filename: file.name,
      mime: file.type,
      size: file.size,
    };

    const response = await this.client.post('/documents', documentData);
    return response.data;
  }

  async getDocumentDownloadUrl(documentId: string): Promise<string> {
    const response = await this.client.post<PresignedUrlResponse>('/documents/presign', {
      key: documentId,
      op: 'get'
    });
    return response.data.url;
  }

  async deleteDocument(documentId: string): Promise<void> {
    await this.client.delete(`/documents/${documentId}`);
  }

  // PDF Operations
  async fillPdf(packageId: string, templateDocumentId: string): Promise<any> {
    const response = await this.client.post(`/packages/${packageId}/fill`, {
      templateDocumentId
    });
    return response.data;
  }

  // County Templates (Admin only)
  async getCountyTemplates(countyId: number): Promise<any[]> {
    const response = await this.client.get(`/counties/${countyId}/template-items`);
    return response.data;
  }

  async createCountyTemplate(countyId: number, data: any): Promise<any> {
    const response = await this.client.post(`/counties/${countyId}/template-items`, data);
    return response.data;
  }

  async updateCountyTemplate(countyId: number, itemId: string, data: any): Promise<any> {
    const response = await this.client.patch(`/counties/${countyId}/template-items/${itemId}`, data);
    return response.data;
  }

  async deleteCountyTemplate(countyId: number, itemId: string): Promise<void> {
    await this.client.delete(`/counties/${countyId}/template-items/${itemId}`);
  }
}

export const api = new ApiClient();
