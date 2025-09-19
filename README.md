# Student Activity Verification Platform

A comprehensive platform for verifying student activities and achievements using AI-powered document validation, GPS tracking, and biometric verification.

## 🎯 Demo Credentials

**Student Account:**
- Email: `amit.sharma@skit.edu.in`
- Password: `demo123`

**Mentor Account:**
- Email: `sunita.rao@skit.edu.in`
- Password: `demo123`

**Admin Account:**
- Email: `admin@gtu.edu.in`
- Password: `demo123`

## 🚀 Features

### MVP Features (Implemented)
- **Landing Page** - Social proof from platform analytics
- **Complete Student Portal** - Full interactive student experience
  - Dashboard with verification score and activity overview
  - Profile management with skill editing and portfolio export
  - Multi-step activity submission wizard with GPS/biometric capture
  - Activity detail pages with verification status and appeal system
  - Career recommendations with AI-powered insights
  - Internship marketplace with application tracking
- **Judge Mode Demo** - Three verification scenarios
- **Authentication** - Role-based login system
- **Mock API Layer** - MSW-powered API simulation with real data

### Core Capabilities
- AI-powered document verification
- GPS location validation  
- Biometric matching
- Mentor review system
- Role-based dashboards (Student, Mentor, Institution, Admin)
- Career recommendations
- Comprehensive reporting

## 🎮 Student Features (Fully Interactive)

### Dashboard (`/dashboard`)
- Verification score with circular progress indicator
- Quick KPI cards (verified/pending/rejected counts, CGPA, attendance)
- Recent activities feed with real-time status updates
- Quick action buttons for common tasks

### Profile Management (`/student/profile`)
- Complete profile view with academic details
- Activity timeline grouped by year
- Editable bio and skills with real-time updates
- Portfolio export functionality (JSON format for demo)

### Activity Submission (`/student/activities/new`)
- 4-step wizard: Details → Documents → Evidence → Review
- File drag-and-drop with preview and validation
- GPS capture simulation with fallback coordinates
- Biometric verification simulation with score generation
- Real-time AI processing simulation with status updates

### Activity Details (`/student/activities/:id`)
- Document viewer with extracted text display
- GPS map visualization and biometric match scores
- AI confidence scoring with color-coded progress bars
- Mentor comments and verification timeline
- Appeal system for rejected/low-confidence activities
- Social sharing for verified achievements

### Career Recommendations (`/student/career`)
- AI-powered career matching with percentage scores
- Interview readiness assessment
- Skill gap analysis with learning recommendations
- Regenerate recommendations with simulated AI processing

### Internship Marketplace (`/student/internships`)
- Company listings with eligibility checking
- Application flow with portfolio/resume selection
- Application tracking and status management

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Lucide React** for icons
- **Vite** for build tooling
- **Storybook** for component documentation
- **MSW (Mock Service Worker)** for API simulation

### Design System
- Clean, minimalist UI following Untitled UI principles
- Consistent spacing (8px grid system)
- Comprehensive color system with semantic variants
- Responsive design (mobile-first)
- Dark/light theme support ready

### Data Layer
- MSW-powered mock API with full CRUD operations
- Real-time data updates and state management
- Type-safe interfaces for all data models
- Ready for backend integration

### Mock API Endpoints

All endpoints are fully functional with MSW:

```typescript
// Students
GET /api/students/:id
PATCH /api/students/:id

// Activities  
GET /api/activities?student_id=:id&status=:status&_sort=date&_order=desc
GET /api/activities/:id
POST /api/activities
POST /api/activities/:id/appeals

// Career Recommendations
GET /api/career-recommendations?student_id=:id
POST /api/career-recommendations/generate

// Companies & Internships
GET /api/companies
POST /api/companies/:companyId/internships/:programId/apply
GET /api/applications?student_id=:id

// Notifications
GET /api/notifications?user_id=:id
PATCH /api/notifications/:id
```

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/              # Base UI components
│   │   ├── modal.tsx    # Modal component
│   │   ├── progress.tsx # Progress bars
│   │   └── file-upload.tsx # File upload with drag-and-drop
│   ├── student/         # Student-specific components
│   │   └── add-activity-wizard.tsx # Multi-step activity wizard
│   ├── layout/          # Layout components
│   ├── dashboard/       # Dashboard-specific components
│   └── activities/      # Activity-related components
├── pages/
│   ├── landing.tsx      # Landing page
│   ├── auth/           # Authentication pages
│   ├── student/        # Complete student portal
│   │   ├── dashboard.tsx
│   │   ├── profile.tsx
│   │   ├── activity-detail.tsx
│   │   ├── career-recommendations.tsx
│   │   ├── internships.tsx
│   │   └── applications.tsx
│   └── demo/           # Demo/judge mode
├── lib/
│   ├── api.ts          # API client and mock data
│   ├── mock-api.ts     # MSW handlers and mock server
│   └── utils.ts        # Utility functions
├── types/
│   └── index.ts        # TypeScript definitions
└── data/
    └── demo-data.json  # Mock data source
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation & Running

```bash
# Install dependencies
npm install

# Start development server (includes MSW mock API)
npm run dev

# Start Storybook for component documentation
npm run storybook
```

The application will be available at `http://localhost:5173` with the mock API automatically running via MSW.

### Judge Mode

Access judge mode scenarios at `/demo` to see the three verification workflows:
1. **Clean Verification** - High confidence, all checks pass
2. **Low Confidence** - AI flags for mentor review
3. **Fraud Detection** - GPS mismatch, document issues

## 🎯 User Roles & Dashboards

### Student Portal
- Personal verification dashboard
- Activity submission workflow
- Progress tracking
- Career recommendations
- Profile management
- Internship applications
- Appeal system
- Portfolio export
- Social sharing

### Mentor Interface  
- Review queue with AI evidence
- Verification tools
- Bulk processing capabilities

### Institution Admin
- Student management
- Activity oversight
- Reporting and analytics

### Platform Admin
- System-wide analytics
- Institution approvals
- AI model monitoring

## 🎪 Interactive Features

### Activity Submission Wizard
- **Step 1**: Activity type selection and basic details
- **Step 2**: Document upload with drag-and-drop, file validation, and previews
- **Step 3**: GPS capture and biometric verification simulation
- **Step 4**: Review and submit with processing timeline

### Real-time Processing Simulation
- AI confidence scoring with 3-second processing delay
- Status transitions (pending → verified/rejected/under_review)
- Biometric matching with realistic score generation
- GPS verification with coordinate validation

### Appeal System
- Available for rejected or low-confidence activities
- Additional document upload capability
- Status change to "under_review" upon submission
- Mentor notification simulation

### Career Recommendations
- AI-powered matching with percentage scores
- Skill gap analysis with learning suggestions
- Interview readiness assessment
- Regeneration with 2-second processing simulation

## 📊 Data Mapping

### Key Endpoints
```typescript
GET /api/students?institution_id=&search=
GET /api/activities?status=&student_id=&mentor_id=
GET /api/institutions
GET /api/mentors?institution_id=
GET /api/career-recommendations?student_id=
GET /api/system-analytics
POST /api/activities
PATCH /api/activities/:id/verify
```

### UI to Data Mapping
- **Student Dashboard** → `students.profile.verification_score`, `activities` filtered by `student_id`
- **Activity Cards** → `activities` with `verification.status` badges
- **Stats Cards** → `system_analytics.platform_stats`
- **Landing Page** → `system_analytics` for social proof counters
- **Profile Timeline** → `activities` grouped by year with verification status
- **Career Insights** → `career_recommendations` with match scores
- **Internship Cards** → `companies.internship_programs` with eligibility logic

## 🎨 Component Library

### Base Components
- `Button` - Primary actions with loading states
- `Badge` - Status indicators with semantic colors
- `Card` - Content containers with consistent styling
- `Input` - Form inputs with validation states
- `Modal` - Overlay dialogs with backdrop and keyboard handling
- `Progress` - Progress bars with variants and sizes
- `FileUpload` - Drag-and-drop file upload with previews

### Compound Components
- `StatsCard` - Dashboard metrics display
- `ActivityCard` - Activity preview with status
- `Navigation` - Role-aware navigation system
- `AddActivityWizard` - Multi-step activity submission flow

## 🧪 Demo Scenarios (Judge Mode)

1. **Clean Verification** - High confidence, all checks pass
2. **Low Confidence Review** - AI flags for mentor review  
3. **Fraud Detection** - GPS mismatch, document issues

Each scenario uses real data from demo-data.json and demonstrates the complete verification workflow.

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# The mock API runs automatically via MSW
# No separate server needed!

# Start Storybook (component documentation)
npm run storybook
```

### Demo Users
```
Student: amit.sharma@skit.edu.in (password: demo123)
Mentor: sunita.rao@skit.edu.in (password: demo123)  
Admin: admin@gtu.edu.in (password: demo123)
```

### Testing Student Features

1. Login as student (amit.sharma@skit.edu.in / demo123)
2. Explore dashboard with real verification score and activities
3. Try the activity submission wizard with file upload simulation
4. View activity details with AI confidence and mentor comments
5. Check career recommendations and regenerate them
6. Browse internships and submit applications

## 🔧 Development

### Adding New Components
1. Create component in appropriate directory
2. Add TypeScript interfaces
3. Create Storybook story
4. Export from index files

### Mock API Integration

The platform uses MSW (Mock Service Worker) for realistic API simulation:

```typescript
// MSW handlers in src/lib/mock-api.ts
rest.post('/api/activities', async (req, res, ctx) => {
  const activityData = await req.json();
  const newActivity = { id: generateId('act'), ...activityData };
  
  // Simulate AI processing after delay
  setTimeout(() => {
    const processedActivity = simulateAIProcessing(newActivity);
    // Update in-memory store
  }, 3000);
  
  return res(ctx.json(newActivity));
});
```

### Real API Integration

To replace mock API with real backend:

1. Remove MSW initialization from `src/main.tsx`
2. Update `src/lib/api.ts` to use real endpoints
3. Replace mock handlers with actual HTTP calls

```typescript
// Example real API integration
async createActivity(activityData: any): Promise<Activity> {
  const response = await fetch('/api/activities', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(activityData)
  });
  return response.json();
}
```

### Theming
Extend theme in `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: { /* custom primary colors */ },
      success: { /* success color variants */ },
      warning: { /* warning color variants */ },
      error: { /* error color variants */ },
    },
  },
},
```

## 🎪 Storybook Components

Access interactive component documentation at `http://localhost:6006`:

```bash
npm run storybook
```

### Available Stories
- **UI Components**: Button, Badge, Card, Input, Progress, FileUpload, Modal
- **Student Components**: AddActivityWizard
- **Interactive Examples**: All components with realistic props and data

## 📈 Next Steps

### Immediate (MVP+)
- [x] Complete activity submission flow
- [x] Student profile management
- [x] Career recommendations system
- [x] Internship marketplace
- [x] Application tracking
- [ ] Mentor review interface
- [ ] Institution management pages
- [x] File upload components
- [ ] Real-time notifications

### Phase 2
- [x] Advanced filtering and search
- [ ] PDF portfolio generation (currently JSON export)
- [ ] Mobile-optimized interface
- [ ] Advanced filtering and search

### Phase 3  
- [ ] Backend API integration
- [ ] Real biometric/GPS services
- [ ] Advanced analytics dashboard
- [ ] Multi-language support

### Technical Debt
- [ ] Add comprehensive unit tests
- [ ] Implement proper error boundaries
- [ ] Add loading states for all async operations
- [ ] Optimize bundle size and performance

## 🤝 Contributing

1. Follow existing code patterns
2. Add TypeScript types for new features
3. Include Storybook stories for components
4. Test responsive design
5. Update this README for major changes

## 🧪 Testing

### Manual Testing Checklist

**Student Dashboard:**
- [ ] Verification score displays correctly
- [ ] Recent activities load and show proper status badges
- [ ] Quick actions navigate to correct pages
- [ ] Stats cards show real data from demo-data.json

**Activity Submission:**
- [ ] Wizard progresses through all 4 steps
- [ ] File upload accepts valid formats and rejects invalid ones
- [ ] GPS capture simulation works
- [ ] Biometric simulation generates realistic scores
- [ ] Submission creates new activity with pending status
- [ ] AI processing simulation updates status after delay

**Profile Management:**
- [ ] Profile displays complete student information
- [ ] Activity timeline groups by year correctly
- [ ] Edit modal allows bio and skill updates
- [ ] Portfolio export downloads JSON file

**Career Recommendations:**
- [ ] Displays existing recommendations with match scores
- [ ] Regenerate button triggers 2-second loading state
- [ ] New recommendations replace old ones
- [ ] Skill gaps and learning recommendations display

**Internship Marketplace:**
- [ ] Companies load with program details
- [ ] Search filters companies correctly
- [ ] Application modal pre-fills company information
- [ ] Application submission creates tracking record

## 📋 API Contract Example

```typescript
// Activity verification
POST /api/activities/:id/verify
{
  "status": "verified" | "rejected" | "under_review",
  "mentor_id": "mentor-01",
  "mentor_comments": "Verification notes...",
  "confidence_override": 85.5
}

// Activity submission
POST /api/activities
{
  "student_id": "stu-001",
  "type": "internship_certificate",
  "title": "Backend Development Intern",
  "organization": "TechCorp Pvt Ltd",
  "date": "2024-05-10",
  "location": "Ahmedabad, Gujarat, India",
  "description": "3-month backend internship...",
  "documents": [
    {
      "filename": "certificate.pdf",
      "url": "https://demo.invalid/docs/certificate.pdf",
      "gps": { "lat": 23.0225, "lng": 72.5714 },
      "gps_verified": true,
      "biometric_match_score": 94.5,
      "extracted_text": "Certificate text..."
    }
  ],
  "additional_proof": {}
}

// Career recommendations  
GET /api/career-recommendations?student_id=stu-001
{
  "recommendations": [
    {
      "title": "ML Engineer",
      "match_score": 92,
      "skill_gaps": ["Cloud Security"],
      "learning_path": ["Advanced ML Ops Course"]
    }
  ]
}
```

## 🎯 Demo Workflows

### Complete Student Journey

1. **Login** as student (amit.sharma@skit.edu.in / demo123)
2. **Dashboard** - View verification score (91.2%) and recent activities
3. **Add Activity** - Submit new internship certificate:
   - Select "Internship Certificate" type
   - Fill in details (title, organization, date, location)
   - Upload PDF document (drag-and-drop simulation)
   - Capture GPS location (simulated)
   - Run biometric check (generates 70-100% score)
   - Review and submit
   - Watch AI processing (3-second delay)
4. **View Activity** - Check detailed verification status
5. **Profile** - Edit bio and add skills, export portfolio
6. **Career** - View recommendations, regenerate with new data
7. **Internships** - Browse companies, apply to programs
8. **Applications** - Track application status

### Judge Mode Scenarios

Access `/demo` to see three verification scenarios:

1. **Clean Verification** (act-0001):
   - High AI confidence (96.1%)
   - GPS verified, strong biometric match (94.5%)
   - Mentor verified with positive comments

2. **Low Confidence** (act-0002):
   - Low AI confidence (42.3%)
   - GPS mismatch, weak biometric match (56%)
   - Pending mentor review

3. **Fraud Detection** (act-0004):
   - Very low AI confidence (34.2%)
   - Poor biometric match (40%)
   - Rejected by mentor with detailed reasoning

Each scenario demonstrates the complete verification pipeline with realistic data and decision points.

---

**Built with ❤️ for educational institutions seeking verified student achievement tracking.**

*This platform demonstrates production-ready React/TypeScript development with comprehensive mock API integration, interactive UI components, and realistic data workflows. Perfect for showcasing modern web development capabilities to stakeholders and judges.*