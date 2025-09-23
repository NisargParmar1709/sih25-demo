import type { Meta, StoryObj } from '@storybook/react';
import { FraudAlertCard } from './fraud-alert-card';

const meta: Meta<typeof FraudAlertCard> = {
  title: 'Admin/FraudAlertCard',
  component: FraudAlertCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockAlert = {
  id: 'fraud-001',
  activity_id: 'act-001',
  student_id: 'stu-001',
  type: 'gps_mismatch' as const,
  severity: 'high' as const,
  description: 'GPS location does not match expected activity location',
  detected_at: '2025-01-15T10:30:00Z',
  status: 'open' as const,
  activity_details: {
    title: 'Backend Development Internship',
    organization: 'TechCorp Pvt Ltd',
    student_name: 'Amit Sharma',
    date: '2024-05-10',
    location: 'Ahmedabad, Gujarat, India'
  }
};

export const GPSMismatch: Story = {
  args: {
    alert: mockAlert,
    onResolve: (id) => console.log('Resolve:', id),
    onEscalate: (id) => console.log('Escalate:', id),
    onMarkFalsePositive: (id) => console.log('False Positive:', id),
    onViewActivity: (activityId) => console.log('View Activity:', activityId),
  },
};

export const DuplicateDocument: Story = {
  args: {
    alert: {
      ...mockAlert,
      type: 'duplicate_document',
      severity: 'critical',
      description: 'Duplicate document detected across multiple submissions'
    },
    onResolve: (id) => console.log('Resolve:', id),
    onEscalate: (id) => console.log('Escalate:', id),
    onMarkFalsePositive: (id) => console.log('False Positive:', id),
    onViewActivity: (activityId) => console.log('View Activity:', activityId),
  },
};

export const LowBiometric: Story = {
  args: {
    alert: {
      ...mockAlert,
      type: 'low_biometric',
      severity: 'medium',
      description: 'Biometric match score below acceptable threshold'
    },
    onResolve: (id) => console.log('Resolve:', id),
    onEscalate: (id) => console.log('Escalate:', id),
    onMarkFalsePositive: (id) => console.log('False Positive:', id),
    onViewActivity: (activityId) => console.log('View Activity:', activityId),
  },
};

export const Resolved: Story = {
  args: {
    alert: { ...mockAlert, status: 'resolved' },
    onResolve: (id) => console.log('Resolve:', id),
    onEscalate: (id) => console.log('Escalate:', id),
    onMarkFalsePositive: (id) => console.log('False Positive:', id),
    onViewActivity: (activityId) => console.log('View Activity:', activityId),
  },
};