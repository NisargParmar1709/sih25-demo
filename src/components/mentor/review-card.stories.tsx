import type { Meta, StoryObj } from '@storybook/react';
import { ReviewCard } from './review-card';

const meta: Meta<typeof ReviewCard> = {
  title: 'Mentor/ReviewCard',
  component: ReviewCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockActivity = {
  id: 'act-001',
  student_id: 'stu-001',
  type: 'internship_certificate' as const,
  title: 'Backend Development Intern - TechCorp',
  organization: 'TechCorp Pvt Ltd',
  date: '2024-05-10',
  location: 'Ahmedabad, Gujarat, India',
  description: '3-month backend internship working on API development and database optimization.',
  documents: [
    {
      filename: 'internship_certificate.pdf',
      url: 'https://demo.invalid/docs/cert.pdf',
      gps: { lat: 23.0225, lng: 72.5714 },
      gps_verified: true,
      biometric_match_score: 94.5,
      extracted_text: 'Certificate of completion...'
    }
  ],
  verification: {
    ai_confidence_score: 87.3,
    status: 'pending' as const,
    mentor_comments: '',
    verification_date: null
  },
  additional_proof: {}
};

const mockStudent = {
  id: 'stu-001',
  enrollment_number: 'GTU/2022/CS/1001',
  name: 'Amit Sharma',
  email: 'amit.sharma@skit.edu.in',
  personal_email: 'amit.sharma@gmail.com',
  phone: '+91-9825012345',
  institution_id: 'inst-001',
  course: 'B.Tech Computer Engineering',
  semester: 6,
  year: 3,
  expected_graduation: '2025-06-15',
  profile: {
    photo: 'amit_sharma.jpg',
    bio: 'Third year CS student interested in ML and cloud.',
    skills: ['Python', 'Machine Learning', 'Git'],
    verification_score: 91.2,
    profile_completion: 88
  },
  academic_details: {
    current_cgpa: 8.6,
    total_credits: 120,
    attendance: 92.5
  },
  verification_status: {
    total_documents: 7,
    verified: 6,
    pending: 1,
    rejected: 0
  },
  registration_date: '2022-07-10',
  last_login: '2025-09-15T14:23:05Z'
};

export const Default: Story = {
  args: {
    activity: mockActivity,
    student: mockStudent,
    onReview: (id) => console.log('Review activity:', id),
  },
};

export const HighConfidence: Story = {
  args: {
    activity: {
      ...mockActivity,
      verification: {
        ...mockActivity.verification,
        ai_confidence_score: 96.1,
        status: 'verified'
      }
    },
    student: mockStudent,
    onReview: (id) => console.log('Review activity:', id),
  },
};

export const LowConfidence: Story = {
  args: {
    activity: {
      ...mockActivity,
      verification: {
        ...mockActivity.verification,
        ai_confidence_score: 42.3,
        status: 'under_review'
      }
    },
    student: mockStudent,
    onReview: (id) => console.log('Review activity:', id),
  },
};

export const Rejected: Story = {
  args: {
    activity: {
      ...mockActivity,
      verification: {
        ...mockActivity.verification,
        ai_confidence_score: 34.2,
        status: 'rejected'
      }
    },
    student: mockStudent,
    onReview: (id) => console.log('Review activity:', id),
  },
};