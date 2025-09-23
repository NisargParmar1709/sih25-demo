import type { Meta, StoryObj } from '@storybook/react';
import { InstitutionApprovalRow } from './institution-approval-row';

const meta: Meta<typeof InstitutionApprovalRow> = {
  title: 'Admin/InstitutionApprovalRow',
  component: InstitutionApprovalRow,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockInstitution = {
  id: 'inst-gtu-001',
  name: 'Shri Karmaveer Institute of Technology',
  code: 'SKIT-GTU',
  type: 'Engineering College',
  location: 'Rajkot, Gujarat, India',
  email_domain: 'skit.edu.in',
  naac_grade: 'A',
  total_students: 4200,
  status: 'pending' as const,
  verification_stats: {
    documents_processed: 12500,
    success_rate: 92.4,
    pending_verifications: 42
  },
  contact: {
    principal: 'Dr. Meera Patel',
    admin_email: 'registrar@skit.edu.in',
    phone: '+91-281-1234567'
  },
  registration_date: '2020-06-12'
};

export const Pending: Story = {
  args: {
    institution: mockInstitution,
    onApprove: (id, notes) => console.log('Approve:', id, notes),
    onReject: (id, reason) => console.log('Reject:', id, reason),
    onRequestInfo: (id, message) => console.log('Request Info:', id, message),
  },
};

export const Approved: Story = {
  args: {
    institution: { ...mockInstitution, status: 'approved' },
    onApprove: (id, notes) => console.log('Approve:', id, notes),
    onReject: (id, reason) => console.log('Reject:', id, reason),
    onRequestInfo: (id, message) => console.log('Request Info:', id, message),
  },
};

export const Rejected: Story = {
  args: {
    institution: { ...mockInstitution, status: 'rejected' },
    onApprove: (id, notes) => console.log('Approve:', id, notes),
    onReject: (id, reason) => console.log('Reject:', id, reason),
    onRequestInfo: (id, message) => console.log('Request Info:', id, message),
  },
};