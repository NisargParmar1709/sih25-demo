import type { Meta, StoryObj } from '@storybook/react';
import { AdminDashboardKPI } from './admin-dashboard-kpi';

const meta: Meta<typeof AdminDashboardKPI> = {
  title: 'Admin/AdminDashboardKPI',
  component: AdminDashboardKPI,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'purple',
      values: [
        { name: 'purple', value: 'linear-gradient(to right, #9333ea, #6366f1)' }
      ]
    }
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockAnalytics = {
  platform_stats: {
    total_users: 12850,
    total_institutions: 56,
    total_documents: 24350,
    verification_accuracy: 89.4,
    avg_processing_time: "00:01:45"
  },
  monthly_trends: [],
  verification_trends: {
    by_type: {},
    status_distribution: {}
  }
};

export const Default: Story = {
  args: {
    analytics: mockAnalytics,
    isKioskMode: false,
  },
};

export const KioskMode: Story = {
  args: {
    analytics: mockAnalytics,
    isKioskMode: true,
  },
};