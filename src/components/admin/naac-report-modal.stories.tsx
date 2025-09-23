import type { Meta, StoryObj } from '@storybook/react';
import { NAACReportModal } from './naac-report-modal';

const meta: Meta<typeof NAACReportModal> = {
  title: 'Admin/NAACReportModal',
  component: NAACReportModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockInstitutions = [
  {
    id: 'inst-001',
    name: 'Shri Karmaveer Institute of Technology',
    code: 'SKIT-GTU',
    location: 'Rajkot, Gujarat, India'
  },
  {
    id: 'inst-002',
    name: 'Sardar Patel College of Engineering',
    code: 'SPCE-GTU',
    location: 'Ahmedabad, Gujarat, India'
  }
];

const mockGenerateReport = async (institutionId: string, year: number) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    report_id: `naac-${institutionId}-${year}-${Date.now()}`,
    institution_id: institutionId,
    year,
    status: 'generated',
    download_url: `https://demo.invalid/reports/naac-report.pdf`,
    csv_url: `https://demo.invalid/reports/naac-report.csv`,
    generated_at: new Date().toISOString(),
    summary: {
      total_activities: 150,
      verified_activities: 142,
      community_engagement: 45,
      internships: 67,
      skill_certifications: 30
    }
  };
};

export const Default: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    institutions: mockInstitutions,
    onGenerateReport: mockGenerateReport,
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
    onClose: () => {},
    institutions: mockInstitutions,
    onGenerateReport: mockGenerateReport,
  },
};