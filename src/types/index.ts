// Type definitions based on demo-data.json structure
export interface Institution {
  id: string;
  name: string;
  code: string;
  type: string;
  location: string;
  email_domain: string;
  naac_grade: string;
  total_students: number;
  status: 'approved' | 'pending' | 'rejected';
  verification_stats: {
    documents_processed: number;
    success_rate: number;
    pending_verifications: number;
  };
  contact: {
    principal: string;
    admin_email: string;
    phone: string;
  };
  registration_date: string;
}

export interface Student {
  id: string;
  enrollment_number: string;
  name: string;
  email: string;
  personal_email: string;
  phone: string;
  institution_id: string;
  course: string;
  semester: number;
  year: number;
  expected_graduation: string;
  profile: {
    photo: string;
    bio: string;
    skills: string[];
    verification_score: number;
    profile_completion: number;
  };
  academic_details: {
    current_cgpa: number;
    total_credits: number;
    attendance: number;
  };
  verification_status: {
    total_documents: number;
    verified: number;
    pending: number;
    rejected: number;
  };
  registration_date: string;
  last_login: string;
}

export interface Activity {
  id: string;
  student_id: string;
  type: 'internship_certificate' | 'participation_certificate' | 'skill_certificate' | 'project_completion' | 'social_work';
  title: string;
  organization: string;
  date: string;
  location: string;
  description: string;
  documents: {
    filename: string;
    url: string;
    gps: { lat: number; lng: number } | null;
    gps_verified: boolean;
    biometric_match_score: number;
    extracted_text: string;
  }[];
  verification: {
    ai_confidence_score: number;
    status: 'verified' | 'pending' | 'rejected' | 'under_review';
    mentor_id?: string;
    mentor_comments: string;
    verification_date: string | null;
  };
  additional_proof: Record<string, any>;
}

export interface Mentor {
  id: string;
  name: string;
  designation: string;
  department: string;
  institution_id: string;
  email: string;
  phone: string;
  experience: number;
  specialization: string[];
  verification_stats: {
    total_reviews: number;
    avg_turnaround_time: number;
    accuracy_rate: number;
  };
  active_since: string;
}

export interface CareerRecommendation {
  id: string;
  student_id: string;
  generated_date: string;
  top_careers: { title: string; match_score: number }[];
  skill_gaps: string[];
  learning_recommendations: string[];
  interview_readiness_score: number;
}

export interface SystemAnalytics {
  platform_stats: {
    total_users: number;
    total_institutions: number;
    total_documents: number;
    verification_accuracy: number;
    avg_processing_time: string;
  };
  monthly_trends: {
    month: string;
    documents_processed: number;
    verifications: number;
  }[];
  verification_trends: {
    by_type: Record<string, number>;
    status_distribution: Record<string, number>;
  };
}

export interface User {
  id: string;
  role: 'student' | 'mentor' | 'institution' | 'admin';
  name: string;
  email: string;
  institution_id?: string;
}