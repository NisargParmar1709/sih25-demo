// src/lib/api.ts
import { Institution, Student, Activity, Mentor, CareerRecommendation, SystemAnalytics } from '../types';
import demoData from '../../data/demo-data.json';

// Mock API implementation using demo data
class ApiClient {
  private data = demoData;

  // --- Students (and other earlier methods) ---

  // Students
  async getStudents(params?: { institution_id?: string; search?: string }): Promise<Student[]> {
    let students = this.data.students;
    
    if (params?.institution_id) {
      students = students.filter(s => s.institution_id === params.institution_id);
    }
    
    if (params?.search) {
      const search = params.search.toLowerCase();
      students = students.filter(s => 
        s.name.toLowerCase().includes(search) ||
        s.enrollment_number.toLowerCase().includes(search) ||
        s.email.toLowerCase().includes(search)
      );
    }
    
    return students;
  }

  async getStudent(id: string): Promise<Student | null> {
    return this.data.students.find(s => s.id === id) || null;
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
      activities = activities.filter(a => a.student_id === params.student_id);
    }
    
    if (params?.institution_id) {
      const students = this.data.students.filter(s => s.institution_id === params.institution_id);
      const studentIds = students.map(s => s.id);
      activities = activities.filter(a => studentIds.includes(a.student_id));
    }
    
    if (params?.status) {
      activities = activities.filter(a => a.verification.status === params.status);
    }

    if (params?.mentor_id) {
      activities = activities.filter(a => a.verification.mentor_id === params.mentor_id);
    }
    
    return activities;
  }

  async getActivity(id: string): Promise<Activity | null> {
    return this.data.activities.find(a => a.id === id) || null;
  }

  async createActivity(activity: Omit<Activity, 'id'>): Promise<Activity> {
    const newActivity = {
      ...activity,
      id: `act-${Date.now()}`,
    };
    return newActivity;
  }

  async updateActivity(id: string, updates: Partial<Activity>): Promise<Activity | null> {
    const activity = await this.getActivity(id);
    if (!activity) return null;
    return { ...activity, ...updates };
  }

  // Mentors
  async getMentors(institutionId?: string): Promise<Mentor[]> {
    let mentors = this.data.mentors;
    if (institutionId) {
      mentors = mentors.filter(m => m.institution_id === institutionId);
    }
    return mentors;
  }

  async getMentor(id: string): Promise<Mentor | null> {
    return this.data.mentors.find(m => m.id === id) || null;
  }

  // Career Recommendations
  async getCareerRecommendations(studentId?: string): Promise<CareerRecommendation[]> {
    let recommendations = this.data.career_recommendations;
    if (studentId) {
      recommendations = recommendations.filter(r => r.student_id === studentId);
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
    return { ...student, ...updates };
  }

  async createAppeal(activityId: string, appealData: any): Promise<any> {
    return {
      id: `appeal-${Date.now()}`,
      activity_id: activityId,
      ...appealData,
      status: 'pending',
      created_at: new Date().toISOString()
    };
  }

  async generateCareerRecommendations(studentId: string): Promise<CareerRecommendation> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
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
  }

  async getCompanies(): Promise<any[]> {
    return this.data.companies;
  }

  async applyToInternship(companyId: string, programTitle: string, applicationData: any): Promise<any> {
    return {
      id: `app-${Date.now()}`,
      company_id: companyId,
      program_title: programTitle,
      ...applicationData,
      status: 'applied',
      applied_date: new Date().toISOString()
    };
  }

  async getApplications(params?: { student_id?: string }): Promise<any[]> {
    // Mock applications data
    const mockApplications = [
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
    ];
    
    if (params?.student_id) {
      return mockApplications.filter(app => app.student_id === params.student_id);
    }
    
    return mockApplications;
  }

  // Mentor-specific API methods
  async getMentorReviewQueue(mentorId: string): Promise<Activity[]> {
    // Return activities that need mentor review
    return this.data.activities.filter(activity => 
      activity.verification.status === 'pending' || 
      activity.verification.status === 'under_review'
    );
  }

  async getMentorActivityLog(mentorId: string, params?: { limit?: number }): Promise<Activity[]> {
    let activities = this.data.activities.filter(activity => 
      activity.verification.mentor_id === mentorId &&
      (activity.verification.status === 'verified' || activity.verification.status === 'rejected')
    );
    
    if (params?.limit) {
      activities = activities.slice(0, params.limit);
    }
    
    return activities;
  }

  async submitMentorReview(activityId: string, reviewData: {
    mentor_id: string;
    status: 'verified' | 'rejected' | 'under_review';
    comments: string;
    verification_date: string;
  }): Promise<Activity> {
    const activityIndex = this.data.activities.findIndex(a => a.id === activityId);
    if (activityIndex === -1) throw new Error('Activity not found');
    
    this.data.activities[activityIndex].verification = {
      ...this.data.activities[activityIndex].verification,
      status: reviewData.status,
      mentor_id: reviewData.mentor_id,
      mentor_comments: reviewData.comments,
      verification_date: reviewData.verification_date
    };
    
    return this.data.activities[activityIndex];
  }

  async getMentorBatches(mentorId: string): Promise<any[]> {
    // Mock batch data
    return [
      {
        id: 'batch-001',
        name: 'CS 2022 Batch A',
        course: 'Computer Science',
        year: 3,
        semester: 6,
        student_count: 45,
        mentor_id: mentorId
      },
      {
        id: 'batch-002', 
        name: 'CS 2023 Batch B',
        course: 'Computer Science',
        year: 2,
        semester: 4,
        student_count: 38,
        mentor_id: mentorId
      }
    ];
  }

  async getMentorAnnouncements(mentorId: string): Promise<any[]> {
    // Mock announcements data
    return [
      {
        id: 'ann-001',
        mentor_id: mentorId,
        title: 'Mid-term Activity Submission Deadline',
        content: 'Please ensure all your mid-term activities are submitted by October 15th for timely verification.',
        target_audience: 'all',
        created_at: '2024-09-15T10:00:00Z',
        status: 'published',
        read_count: 42
      },
      {
        id: 'ann-002',
        mentor_id: mentorId,
        title: 'Workshop on Industry Skills',
        content: 'Join us for an exclusive workshop on industry-relevant skills this Friday at 2 PM in the main auditorium.',
        target_audience: 'batch',
        target_ids: ['batch-001'],
        created_at: '2024-09-10T14:30:00Z',
        status: 'published',
        read_count: 28
      }
    ];
  }

  // RENAMED: mentor announcement creation to avoid clash with admin createAnnouncement
  async createMentorAnnouncement(announcementData: any): Promise<any> {
    const newAnnouncement = {
      id: `ann-${Date.now()}`,
      ...announcementData
    };
    return newAnnouncement;
  }

  async updateAnnouncement(id: string, updates: any): Promise<any> {
    return { id, ...updates };
  }

  async deleteAnnouncement(id: string): Promise<void> {
    // Mock delete operation
    return;
  }

  // Admin-specific API methods
  async getAdminDashboard(): Promise<SystemAnalytics> {
    return this.data.system_analytics;
  }

  // Keep this admin getInstitutions which supports optional params
  async getInstitutions(params?: { status?: string }): Promise<Institution[]> {
    let institutions = this.data.institutions;
    if (params?.status) {
      institutions = institutions.filter(i => i.status === params.status);
    }
    return institutions;
  }

  async updateInstitution(id: string, updates: any): Promise<Institution> {
    const institutionIndex = this.data.institutions.findIndex(i => i.id === id);
    if (institutionIndex === -1) throw new Error('Institution not found');
    
    this.data.institutions[institutionIndex] = {
      ...this.data.institutions[institutionIndex],
      ...updates
    };
    
    return this.data.institutions[institutionIndex];
  }

  async getUsers(params?: { role?: string }): Promise<any[]> {
    const users = [
      ...this.data.students.map(s => ({ ...s, role: 'student' })),
      ...this.data.mentors.map(m => ({ ...m, role: 'mentor' })),
      // Add admin users
      {
        id: 'admin-001',
        name: 'GTU Admin',
        email: 'admin@gtu.edu.in',
        role: 'admin',
        institution_id: null,
        created_at: '2024-01-01T00:00:00Z',
        last_login: '2025-01-15T10:30:00Z',
        status: 'active'
      },
      {
        id: 'admin-002',
        name: 'NAAC Auditor',
        email: 'auditor@gtu.edu.in',
        role: 'auditor',
        institution_id: null,
        created_at: '2024-01-01T00:00:00Z',
        last_login: '2025-01-14T15:45:00Z',
        status: 'active'
      }
    ];
    
    if (params?.role) {
      return users.filter(u => u.role === params.role);
    }
    
    return users;
  }

  async updateUserRole(userId: string, newRole: string): Promise<any> {
    // Mock user role update
    return { id: userId, role: newRole, updated_at: new Date().toISOString() };
  }

  async getFraudAlerts(): Promise<any[]> {
    // Generate mock fraud alerts from activities
    const fraudAlerts = this.data.activities
      .filter(activity => 
        activity.verification.ai_confidence_score < 50 ||
        !activity.documents[0]?.gps_verified ||
        activity.documents[0]?.biometric_match_score < 60 ||
        activity.additional_proof.duplicate_flag
      )
      .map(activity => {
        const student = this.data.students.find(s => s.id === activity.student_id);
        let type = 'suspicious_pattern';
        let severity = 'medium';
        
        if (activity.additional_proof.duplicate_flag) {
          type = 'duplicate_document';
          severity = 'high';
        } else if (!activity.documents[0]?.gps_verified) {
          type = 'gps_mismatch';
          severity = 'medium';
        } else if (activity.documents[0]?.biometric_match_score < 60) {
          type = 'low_biometric';
          severity = 'high';
        }
        
        return {
          id: `fraud-${activity.id}`,
          activity_id: activity.id,
          student_id: activity.student_id,
          type,
          severity,
          description: `${type.replace('_', ' ')} detected in ${activity.title}`,
          detected_at: activity.date,
          status: 'open',
          activity_details: {
            title: activity.title,
            organization: activity.organization,
            student_name: student?.name || 'Unknown',
            date: activity.date,
            location: activity.location
          }
        };
      });
    
    return fraudAlerts;
  }

  async updateFraudAlert(id: string, updates: any): Promise<any> {
    // Mock fraud alert update
    return { id, ...updates, updated_at: new Date().toISOString() };
  }

  async getModelMetrics(): Promise<any> {
    return {
      accuracy: 89.4,
      precision: 91.2,
      recall: 87.8,
      f1_score: 89.5,
      false_positive_rate: 8.8,
      false_negative_rate: 12.2,
      confidence_distribution: {
        high: 65,
        medium: 25,
        low: 10
      },
      drift_indicator: 'stable',
      last_updated: '2025-01-15T10:00:00Z'
    };
  }

  async generateNAACReport(institutionId: string, year: number): Promise<any> {
    const institution = this.data.institutions.find(i => i.id === institutionId);
    if (!institution) throw new Error('Institution not found');
    
    // Mock report generation
    const reportId = `naac-${institutionId}-${year}-${Date.now()}`;
    
    return {
      report_id: reportId,
      institution_id: institutionId,
      year,
      status: 'generated',
      download_url: `https://demo.invalid/reports/${reportId}.pdf`,
      csv_url: `https://demo.invalid/reports/${reportId}.csv`,
      generated_at: new Date().toISOString(),
      summary: {
        total_activities: 150,
        verified_activities: 142,
        community_engagement: 45,
        internships: 67,
        skill_certifications: 30
      }
    };
  }

  async getAuditLogs(params?: { user?: string; action?: string; from?: string; to?: string }): Promise<any[]> {
    // Mock audit logs
    const logs = [
      {
        id: 'log-001',
        timestamp: '2025-01-15T10:30:00Z',
        user_id: 'admin-001',
        user_name: 'GTU Admin',
        action: 'institution_approved',
        resource_type: 'institution',
        resource_id: 'inst-gtu-001',
        details: 'Approved Shri Karmaveer Institute of Technology',
        ip_address: '192.168.1.100'
      },
      {
        id: 'log-002',
        timestamp: '2025-01-15T09:15:00Z',
        user_id: 'mentor-01',
        user_name: 'Dr. Sunita Rao',
        action: 'activity_verified',
        resource_type: 'activity',
        resource_id: 'act-0001',
        details: 'Verified Backend Development Intern activity',
        ip_address: '192.168.1.101'
      },
      {
        id: 'log-003',
        timestamp: '2025-01-14T16:45:00Z',
        user_id: 'admin-001',
        user_name: 'GTU Admin',
        action: 'fraud_alert_resolved',
        resource_type: 'fraud_alert',
        resource_id: 'fraud-act-0002',
        details: 'Resolved GPS mismatch alert as false positive',
        ip_address: '192.168.1.100'
      }
    ];
    
    return logs.filter(log => {
      if (params?.user && !log.user_name.toLowerCase().includes(params.user.toLowerCase())) return false;
      if (params?.action && log.action !== params.action) return false;
      if (params?.from && new Date(log.timestamp) < new Date(params.from)) return false;
      if (params?.to && new Date(log.timestamp) > new Date(params.to)) return false;
      return true;
    });
  }

  // Admin / System methods
  async createAnnouncement(data: any): Promise<any> {
    return {
      id: `ann-${Date.now()}`,
      ...data,
      created_at: new Date().toISOString(),
      status: 'published'
    };
  }

  async getBackgroundJobs(): Promise<any[]> {
    return [
      {
        id: 'job-001',
        type: 'naac_report',
        status: 'completed',
        created_at: '2025-01-15T08:00:00Z',
        completed_at: '2025-01-15T08:05:00Z',
        result: 'Report generated successfully'
      },
      {
        id: 'job-002',
        type: 'data_export',
        status: 'running',
        created_at: '2025-01-15T10:30:00Z',
        progress: 65
      }
    ];
  }

  // Additional admin API methods
  async updateUserStatus(userId: string, status: string): Promise<any> {
    return { id: userId, status, updated_at: new Date().toISOString() };
  }

  async createSystemAnnouncement(data: any): Promise<any> {
    return {
      id: `sys-ann-${Date.now()}`,
      ...data,
      created_at: new Date().toISOString(),
      status: 'published'
    };
  }

  async getSystemHealth(): Promise<any> {
    return {
      api_status: 'operational',
      database_status: 'healthy',
      ai_models_status: 'active',
      storage_usage: 78,
      last_backup: '2025-01-15T02:00:00Z',
      uptime: '99.9%'
    };
  }

  // Demo scenarios for judge mode
  getScenarioData(scenario: 'clean' | 'low-confidence' | 'fraud'): Activity {
    switch (scenario) {
      case 'clean':
        return this.data.activities.find(a => a.verification.status === 'verified' && a.verification.ai_confidence_score > 95) || this.data.activities[0];
      case 'low-confidence':
        return this.data.activities.find(a => a.verification.status === 'pending' && a.verification.ai_confidence_score < 50) || this.data.activities[1];
      case 'fraud':
        return this.data.activities.find(a => a.verification.status === 'rejected') || this.data.activities[3];
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
    const student = demoData.students.find(s => s.email === email);
    if (student) {
      return { 
        id: student.id, 
        role: 'student' as const,
        name: student.name,
        email: student.email,
        institution_id: student.institution_id
      };
    }

    const mentor = demoData.mentors.find(m => m.email === email);
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
