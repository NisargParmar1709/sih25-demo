// src/lib/mock-api.ts
// Note: using JSON assertion to avoid esbuild import parsing issues.
// If your toolchain doesn't support `assert { type: 'json' }`, use the dynamic import alternative below.
import { setupWorker, rest } from 'msw';
import demoData from '../../data/demo-data.json' assert { type: 'json' };
import { Activity, Student, CareerRecommendation } from '../types';

// In-memory data store that starts with demo data
let mockData = {
  ...demoData,
  notifications: [
    {
      id: 'notif-001',
      user_id: 'stu-001',
      type: 'verification_update',
      title: 'Activity Verified',
      message: 'Your Backend Development Intern certificate has been verified!',
      read: false,
      created_at: '2024-08-01T10:30:00Z'
    },
    {
      id: 'notif-002',
      user_id: 'stu-001',
      type: 'mentor_comment',
      title: 'Mentor Comment Added',
      message: 'Dr. Sunita Rao added comments to your internship verification.',
      read: true,
      created_at: '2024-07-28T14:15:00Z'
    }
  ],
  applications: [
    {
      id: 'app-001',
      student_id: 'stu-001',
      company_id: 'comp-001',
      program_title: 'Backend Intern',
      status: 'applied',
      applied_date: '2024-09-01T09:00:00Z',
      justification: 'I have experience with Node.js and API development from my previous internship.',
      resume_url: 'portfolio-export.pdf'
    }
  ],
  appeals: []
};

// Utility functions
const generateId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

const simulateDelay = (ms: number = 1000) =>
  new Promise<void>(resolve => setTimeout(resolve, ms));

// Make simulateAIProcessing safe for empty/missing documents
const simulateAIProcessing = (activity: Activity): Activity => {
  const docs = Array.isArray(activity.documents) ? activity.documents : [];

  const baseScore = Math.random() * 40 + 40;
  const gpsBonus = docs.some(d => d.gps_verified) ? 15 : 0;
  const biometricBonus = docs.length
    ? docs.reduce((acc, d) => acc + (d.biometric_match_score ?? 0), 0) / docs.length / 5
    : 0;

  const aiScore = Math.min(99, Math.round(baseScore + gpsBonus + biometricBonus));

  let status: Activity['verification']['status'] = 'pending';
  if (aiScore >= 85) status = 'verified';
  else if (aiScore < 40) status = 'rejected';
  else if (aiScore < 60) status = 'under_review';

  return {
    ...activity,
    verification: {
      ...activity.verification,
      ai_confidence_score: aiScore,
      status,
      verification_date: status === 'verified' ? new Date().toISOString() : null
    }
  };
};

// Mock API handlers
export const handlers = [
  rest.get('/api/students/:id', (req, res, ctx) => {
    const { id } = req.params as { id: string };
    const student = mockData.students.find((s: Student) => s.id === id);
    if (!student) return res(ctx.status(404));
    return res(ctx.json(student));
  }),

  rest.patch('/api/students/:id', async (req, res, ctx) => {
    const { id } = req.params as { id: string };
    const updates = await req.json();
    const studentIndex = mockData.students.findIndex((s: Student) => s.id === id);

    if (studentIndex === -1) return res(ctx.status(404));

    mockData.students[studentIndex] = {
      ...mockData.students[studentIndex],
      ...updates
    };

    return res(ctx.json(mockData.students[studentIndex]));
  }),

  rest.get('/api/activities', (req, res, ctx) => {
    const studentId = req.url.searchParams.get('student_id');
    const status = req.url.searchParams.get('status');
    const sort = req.url.searchParams.get('_sort') || 'date';
    const order = req.url.searchParams.get('_order') || 'desc';

    let activities = [...mockData.activities];

    if (studentId) {
      activities = activities.filter((a: Activity) => a.student_id === studentId);
    }

    if (status) {
      activities = activities.filter((a: Activity) => a.verification.status === status);
    }

    activities.sort((a: any, b: any) => {
      const aVal = sort === 'date' ? new Date(a.date).getTime() : a[sort];
      const bVal = sort === 'date' ? new Date(b.date).getTime() : b[sort];

      if (order === 'desc') {
        return aVal > bVal ? -1 : 1;
      }
      return aVal < bVal ? -1 : 1;
    });

    return res(ctx.json(activities));
  }),

  rest.get('/api/activities/:id', (req, res, ctx) => {
    const { id } = req.params as { id: string };
    const activity = mockData.activities.find((a: Activity) => a.id === id);
    if (!activity) return res(ctx.status(404));
    return res(ctx.json(activity));
  }),

  rest.post('/api/activities', async (req, res, ctx) => {
    const activityData = await req.json();

    const newActivity: Activity = {
      id: generateId('act'),
      ...activityData,
      documents: Array.isArray(activityData.documents) ? activityData.documents : [],
      verification: {
        ai_confidence_score: 0,
        status: 'pending' as const,
        mentor_id: undefined,
        mentor_comments: '',
        verification_date: null
      }
    };

    mockData.activities.push(newActivity);

    setTimeout(() => {
      const processedActivity = simulateAIProcessing(newActivity);
      const index = mockData.activities.findIndex((a: Activity) => a.id === newActivity.id);
      if (index !== -1) {
        mockData.activities[index] = processedActivity;
      }
    }, 3000);

    return res(ctx.json(newActivity));
  }),

  rest.post('/api/activities/:id/appeals', async (req, res, ctx) => {
    const { id } = req.params as { id: string };
    const appealData = await req.json();

    const appeal = {
      id: generateId('appeal'),
      activity_id: id,
      ...appealData,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    mockData.appeals.push(appeal);

    const activityIndex = mockData.activities.findIndex((a: Activity) => a.id === id);
    if (activityIndex !== -1) {
      mockData.activities[activityIndex].verification.status = 'under_review';
    }

    return res(ctx.json(appeal));
  }),

  rest.get('/api/career-recommendations', (req, res, ctx) => {
    const studentId = req.url.searchParams.get('student_id');
    let recommendations = mockData.career_recommendations;

    if (studentId) {
      recommendations = recommendations.filter((r: CareerRecommendation) => r.student_id === studentId);
    }

    return res(ctx.json(recommendations));
  }),

  rest.post('/api/career-recommendations/generate', async (req, res, ctx) => {
    const { student_id } = await req.json();

    await simulateDelay(2000);

    const newRecommendation: CareerRecommendation = {
      id: generateId('rec'),
      student_id,
      generated_date: new Date().toISOString().split('T')[0],
      top_careers: [
        { title: 'Full Stack Developer', match_score: Math.floor(Math.random() * 20) + 80 },
        { title: 'DevOps Engineer', match_score: Math.floor(Math.random() * 20) + 75 }
      ],
      skill_gaps: ['Docker', 'AWS'],
      learning_recommendations: ['Complete Docker fundamentals course', 'AWS Solutions Architect certification'],
      interview_readiness_score: Math.floor(Math.random() * 30) + 70
    };

    const existingIndex = mockData.career_recommendations.findIndex((r: CareerRecommendation) => r.student_id === student_id);
    if (existingIndex !== -1) {
      mockData.career_recommendations[existingIndex] = newRecommendation;
    } else {
      mockData.career_recommendations.push(newRecommendation);
    }

    return res(ctx.json(newRecommendation));
  }),

  rest.get('/api/companies', (req, res, ctx) => {
    return res(ctx.json(mockData.companies));
  }),

  rest.post('/api/companies/:companyId/internships/:programId/apply', async (req, res, ctx) => {
    const { companyId, programId } = req.params as { companyId: string; programId: string };
    const applicationData = await req.json();

    const application = {
      id: generateId('app'),
      company_id: companyId,
      program_id: programId,
      ...applicationData,
      status: 'applied',
      applied_date: new Date().toISOString()
    };

    mockData.applications.push(application);

    return res(ctx.json(application));
  }),

  rest.get('/api/applications', (req, res, ctx) => {
    const studentId = req.url.searchParams.get('student_id');
    let applications = mockData.applications;

    if (studentId) {
      applications = applications.filter((a: any) => a.student_id === studentId);
    }

    return res(ctx.json(applications));
  }),

  rest.get('/api/notifications', (req, res, ctx) => {
    const userId = req.url.searchParams.get('user_id');
    let notifications = mockData.notifications;

    if (userId) {
      notifications = notifications.filter((n: any) => n.user_id === userId);
    }

    return res(ctx.json(notifications));
  }),

  rest.patch('/api/notifications/:id', async (req, res, ctx) => {
    const { id } = req.params as { id: string };
    const updates = await req.json();

    const notificationIndex = mockData.notifications.findIndex((n: any) => n.id === id);
    if (notificationIndex === -1) return res(ctx.status(404));

    mockData.notifications[notificationIndex] = {
      ...mockData.notifications[notificationIndex],
      ...updates
    };

    return res(ctx.json(mockData.notifications[notificationIndex]));
  })
];

// Setup MSW worker (exported, start it from your app entry point)
export const worker = setupWorker(...handlers);
