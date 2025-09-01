# Permit Management System

A comprehensive React-based permit management system designed for Florida's 67 counties. This self-hosted application manages building permit packages with full lifecycle tracking, customer/contractor management, PDF template handling, and subcontractor coordination.

## 🚀 Features

### Core Functionality (Must Have)
- ✅ **Permit Package Management**: Create, track, and manage permit packages across all 67 Florida counties
- ✅ **Customer & Contractor Management**: Store detailed customer and contractor information with addresses
- ✅ **PDF Template Upload & Autofill**: Upload PDF templates and automatically fill them with package data
- ✅ **Multi-Package Support**: Support multiple permit packages per customer
- ✅ **Self-Hosted**: Runs on local PC/server with LAN accessibility and optional internet exposure
- ✅ **County-Specific Checklists**: Admin-configurable checklists for all 67 Florida counties
- ✅ **Subcontractor Management**: Fluid subcontractor tracking under each permit package

### Advanced Features (Should Have)
- ✅ **Search & Filter**: Advanced search and filtering capabilities for packages
- ✅ **Document Management**: Upload and manage documents/photos for packages
- ✅ **Multi-User Roles**: Admin and User role-based access control
- ✅ **PDF Download & Print**: Download and print filled PDFs

### Enhanced Features (Could Have)
- 📋 **Email Notifications**: Status update notifications (planned)
- 📋 **Dashboard/Calendar**: Deadline tracking and calendar view (planned)
- 📋 **Mobile-Friendly UI**: Responsive design for mobile devices (planned)

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Vite** for fast development and building
- **TanStack Query** for server state management
- **React Hook Form** with Zod validation
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Router** for navigation

### Key Components
- **Authentication System**: JWT-based login/logout
- **Dashboard**: Overview with statistics and quick actions
- **Package Management**: Full CRUD operations for permit packages
- **Customer Management**: Customer information and address handling
- **Contractor Management**: Contractor details and licensing
- **Subcontractor Management**: Trade-specific subcontractor tracking
- **Document Management**: File upload, PDF handling, and document organization
- **Checklist System**: County-specific checklist management
- **Admin Panel**: System administration and county template management

## 📋 Subcontractor Features

The system includes comprehensive subcontractor management:

### Subcontractor Information
- Company name and contact details
- Trade type classification (Electrical, Plumbing, HVAC, etc.)
- License numbers and contact information
- Scope of work descriptions
- Contract amounts and payment tracking
- Start and completion dates
- Status tracking (Pending, Active, Completed, Cancelled)

### Trade Types Supported
- Electrical
- Plumbing
- HVAC
- Roofing
- Foundation
- Framing
- Drywall
- Painting
- Flooring
- Landscaping
- Concrete
- Masonry
- Carpentry
- Insulation
- Windows & Doors
- Siding
- Gutters
- Driveway
- Fencing
- Other

### Subcontractor Management Features
- Add/edit/delete subcontractors per package
- Status updates and progress tracking
- Contact information management
- Address tracking
- Contract amount and scope documentation
- Timeline management with start/completion dates

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Modern web browser

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd permit-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:4000/api
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

### Cloud Deployment

The application is designed to work on both home computers and cloud platforms:

#### Google Cloud Platform
- Deploy to Google Cloud Run
- Use Cloud SQL for database
- Cloud Storage for file management

#### AWS
- Deploy to AWS Elastic Beanstalk
- Use RDS for database
- S3 for file storage

#### Home Computer Setup
- Run locally with Docker
- Use local PostgreSQL database
- Local file storage with MinIO

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── Layout.tsx       # Main application layout
│   └── LoadingSpinner.tsx
├── features/            # Feature-based modules
│   ├── auth/           # Authentication
│   ├── dashboard/      # Dashboard and overview
│   ├── packages/       # Permit package management
│   │   ├── PackagesPage.tsx
│   │   ├── CreatePackagePage.tsx
│   │   ├── PackageDetailPage.tsx
│   │   └── SubcontractorManager.tsx
│   ├── customers/      # Customer management
│   ├── contractors/    # Contractor management
│   └── admin/          # Admin panel
├── lib/                # Utilities and API
│   ├── api.ts         # API client
│   └── utils.ts       # Utility functions
└── types/              # TypeScript type definitions
```

## 🔧 Configuration

### Florida Counties
The system includes all 67 Florida counties:
- Alachua, Baker, Bay, Bradford, Brevard, Broward, Calhoun, Charlotte, Citrus, Clay
- Collier, Columbia, DeSoto, Dixie, Duval, Escambia, Flagler, Franklin, Gadsden, Gilchrist
- Glades, Gulf, Hamilton, Hardee, Hendry, Hernando, Highlands, Hillsborough, Holmes, Indian River
- Jackson, Jefferson, Lafayette, Lake, Lee, Leon, Levy, Liberty, Madison, Manatee
- Marion, Martin, Miami-Dade, Monroe, Nassau, Okaloosa, Okeechobee, Orange, Osceola, Palm Beach
- Pasco, Pinellas, Polk, Putnam, Santa Rosa, Sarasota, Seminole, St. Johns, St. Lucie, Sumter
- Suwannee, Taylor, Union, Volusia, Wakulla, Walton, Washington

### Document Tags
Standardized document tags for organization:
- site_plan, foundation_plan, anchoring_details
- zoning_letter, flood_elevation
- utility_letter_power, utility_letter_water, utility_letter_sewer
- hud_label_photo, serial_photo
- installation_affidavit, impact_fee_receipt, addressing_approval

## 🔐 Security Features

- JWT-based authentication
- Role-based access control (Admin/User)
- Secure file upload with presigned URLs
- Input validation with Zod schemas
- XSS protection
- CSRF protection

## 📱 User Interface

### Responsive Design
- Mobile-first approach
- Tablet and desktop optimized
- Touch-friendly interface
- Keyboard navigation support

### Accessibility
- WCAG 2.1 AA compliance
- Screen reader support
- High contrast mode support
- Keyboard-only navigation

## 🚀 Performance

- Lazy loading of components
- Optimized bundle size
- Efficient state management
- Caching strategies
- Image optimization

## 🔄 State Management

- TanStack Query for server state
- React Hook Form for form state
- Local state with useState/useReducer
- Context API for global state

## 📊 Data Flow

1. **Authentication**: JWT tokens for secure access
2. **API Communication**: RESTful API with axios
3. **State Management**: TanStack Query for caching and synchronization
4. **Form Handling**: React Hook Form with Zod validation
5. **File Management**: Presigned URLs for secure uploads

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run e2e tests
npm run test:e2e
```

## 📈 Future Enhancements

### Planned Features
- Email notifications for status updates
- Advanced dashboard with analytics
- Mobile app development
- Real-time collaboration
- Digital signature integration
- Workflow automation
- AI-powered document processing

### Integration Possibilities
- County permit system APIs
- Payment processing
- Insurance verification
- Building code compliance checking
- Weather integration for scheduling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code examples

## 🔗 Related Links

- [React Documentation](https://react.dev/)
- [TanStack Query](https://tanstack.com/query)
- [Tailwind CSS](https://tailwindcss.com/)
- [Zod Validation](https://zod.dev/)

---

**Built with ❤️ for Florida's building permit management needs**
