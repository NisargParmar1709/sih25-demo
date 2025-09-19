// src/lib/api.ts
import { Institution, Student, Activity, Mentor, CareerRecommendation, SystemAnalytics } from '../types';
import demoData from '../../data/demo-data.json';

// Mock API implementation using demo data
class ApiClient {
  private data = demoData as any; // keep as any if JSON types are loose

  // Institutions
  async getInstitutions(): Promise<Institution[]> {
    return this.data.institutions;
  }

  async getInstitution(id: string): Promise<Institution | null> {
    return this.data.institutions.find((inst: Institution) => inst.id === id) || null;
  }

  // Students
  async getStudents(params?: { institution_id?: string; search?: string }): Promise<Student[]> {
    let students = this.data.students;

    if (params?.institution_id) {
      students = students.filter((s: Student) => s.institution_id === params.institution_id);
    }

    if (params?.search) {
      const search = params.search.toLowerCase();
      students = students.filter((s: Student) =>
        s.name.toLowerCase().includes(search) ||
        s.enrollment_number.toLowerCase().includes(search) ||
        s.email.toLowerCase().includes(search)
      );
    }

    return students;
  }

  async getStudent(id: string): Promise<Student | null> {
    return this.data.students.find((s: Student) => s.id === id) || null;
  }

  // Activities
  async getActivities(params?: { 
    student_id?: string; 
    institution_id?: string; 
    status?: string;
    mentor_id?: string;
  }): Promise<Activity[]> {
    let activities = this.data.activities;

    if (params?.student_id) {
      activities = activities.filter((a: Activity) => a.student_id === params.student_id);
    }

    if (params?.institution_id) {
      const students = this.data.students.filter((s: Student) => s.institution_id === params.institution_id);
      const studentIds = students.map((s: Student) => s.id);
      activities = activities.filter((a: Activity) => studentIds.includes(a.student_id));
    }

    if (params?.status) {
      activities = activities.filter((a: Activity) => a.verification.status === params.status);
    }

    if (params?.mentor_id) {
      activities = activities.filter((a: Activity) => a.verification.mentor_id === params.mentor_id);
    }

    return activities;
  }

  async getActivity(id: string): Promise<Activity | null> {
    return this.data.activities.find((a: Activity) => a.id === id) || null;
  }

  // Persist the new activity into the in-memory dataset
  async createActivity(activity: Omit<Activity, 'id'>): Promise<Activity> {
    // Ensure verification defaults exist (mirror behaviour of mock server)
    const verificationDefaults = {
      ai_confidence_score: 0,
      status: 'pending' as const,
      mentor_id: undefined,
      mentor_comments: '',
      verification_date: null
    };

    const newActivity: Activity = {
      ...activity,
      id: `act-${Date.now()}`,
      verification: {
        // If caller provided verification, merge, else use defaults
        ...(activity as any).verification || {},
        ...verificationDefaults
      }
    };

    // Persist into mock dataset so subsequent reads can find it
    this.data.activities = this.data.activities || [];
    this.data.activities.push(newActivity);

    return newActivity;
  }

  // Persist updates back into the dataset
  async updateActivity(id: string, updates: Partial<Activity>): Promise<Activity | null> {
    const idx = this.data.activities.findIndex((a: Activity) => a.id === id);
    if (idx === -1) return null;

    const updated = { ...this.data.activities[idx], ...updates };
    this.data.activities[idx] = updated;
    return updated;
  }

  // Mentors
  async getMentors(institutionId?: string): Promise<Mentor[]> {
    let mentors = this.data.mentors;
    if (institutionId) {
      mentors = mentors.filter((m: Mentor) => m.institution_id === institutionId);
    }
    return mentors;
  }

  async getMentor(id: string): Promise<Mentor | null> {
    return this.data.mentors.find((m: Mentor) => m.id === id) || null;
  }

  // Career Recommendations
  async getCareerRecommendations(studentId?: string): Promise<CareerRecommendation[]> {
    let recommendations = this.data.career_recommendations;
    if (studentId) {
      recommendations = recommendations.filter((r: CareerRecommendation) => r.student_id === studentId);
    }
    return recommendations;
  }

  // System Analytics
  async getSystemAnalytics(): Promise<SystemAnalytics> {
    return this.data.system_analytics;
  }

  // Mock API methods for student features
  async updateStudent(id: string, updates: Partial<Student>): Promise<Student | null> {
    const student = await this.getStudent(id);
    if (!student) return null;
    const idx = this.data.students.findIndex((s: Student) => s.id === id);
    const updated = { ...student, ...updates };
    this.data.students[idx] = updated;
    return updated;
  }

  async createAppeal(activityId: string, appealData: any): Promise<any> {
    const newAppeal = {
      id: `appeal-${Date.now()}`,
      activity_id: activityId,
      ...appealData,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    this.data.appeals = this.data.appeals || [];
    this.data.appeals.push(newAppeal);

    // Optionally update activity status as well
    const actIdx = this.data.activities.findIndex((a: Activity) => a.id === activityId);
    if (actIdx !== -1) {
      this.data.activities[actIdx].verification = {
        ...this.data.activities[actIdx].verification,
        status: 'under_review'
      };
    }

    return newAppeal;
  }

  async generateCareerRecommendations(studentId: string): Promise<CareerRecommendation> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const rec = {
      id: `rec-${Date.now()}`,
      student_id: studentId,
      generated_date: new Date().toISOString().split('T')[0],
      top_careers: [
        { title: 'Full Stack Developer', match_score: Math.floor(Math.random() * 20) + 80 },
        { title: 'DevOps Engineer', match_score: Math.floor(Math.random() * 20) + 75 }
      ],
      skill_gaps: ['Docker', 'AWS'],
      learning_recommendations: [
        'Complete Docker fundamentals course',
        'AWS Solutions Architect certification'
      ],
      interview_readiness_score: Math.floor(Math.random() * 30) + 70
    };

    // persist/replace if needed
    this.data.career_recommendations = this.data.career_recommendations || [];
    const existingIndex = this.data.career_recommendations.findIndex((r: CareerRecommendation) => r.student_id === studentId);
    if (existingIndex !== -1) {
      this.data.career_recommendations[existingIndex] = rec;
    } else {
      this.data.career_recommendations.push(rec);
    }

    return rec;
  }

  async getCompanies(): Promise<any[]> {
    return this.data.companies;
  }

  async applyToInternship(companyId: string, programTitle: string, applicationData: any): Promise<any> {
    const app = {
      id: `app-${Date.now()}`,
      company_id: companyId,
      program_title: programTitle,
      ...applicationData,
      status: 'applied',
      applied_date: new Date().toISOString()
    };

    this.data.applications = this.data.applications || [];
    this.data.applications.push(app);

    return app;
  }

  async getApplications(params?: { student_id?: string }): Promise<any[]> {
    // Use persisted applications if present
    this.data.applications = this.data.applications || [];
    if (params?.student_id) {
      return this.data.applications.filter((app: any) => app.student_id === params.student_id);
    }
    return this.data.applications;
  }

  // Demo scenarios for judge mode
  getScenarioData(scenario: 'clean' | 'low-confidence' | 'fraud'): Activity {
    switch (scenario) {
      case 'clean':
        return this.data.activities.find((a: Activity) => a.verification.status === 'verified' && a.verification.ai_confidence_score > 95) || this.data.activities[0];
      case 'low-confidence':
        return this.data.activities.find((a: Activity) => a.verification.status === 'pending' && a.verification.ai_confidence_score < 50) || this.data.activities[1];
      case 'fraud':
        return this.data.activities.find((a: Activity) => a.verification.status === 'rejected') || this.data.activities[3];
      default:
        return this.data.activities[0];
    }
  }
}

export const apiClient = new ApiClient();

// Authentication mock
export const auth = {
  login: async (email: string, password: string) => {
    // Find user in students or mentors
    const student = demoData.students.find((s: Student) => s.email === email);
    if (student) {
      return { 
        id: student.id, 
        role: 'student' as const,
        name: student.name,
        email: student.email,
        institution_id: student.institution_id
      };
    }

    const mentor = demoData.mentors.find((m: Mentor) => m.email === email);
    if (mentor) {
      return { 
        id: mentor.id, 
        role: 'mentor' as const,
        name: mentor.name,
        email: mentor.email,
        institution_id: mentor.institution_id
      };
    }

    // Admin login
    if (email === 'admin@gtu.edu.in') {
      return {
        id: 'admin-001',
        role: 'admin' as const,
        name: 'GTU Admin',
        email: 'admin@gtu.edu.in'
      };
    }

    throw new Error('Invalid credentials');
  },

  getCurrentUser: () => {
    const userData = localStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
  },

  logout: () => {
    localStorage.removeItem('currentUser');
  }
};
