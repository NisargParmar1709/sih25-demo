import type { Meta, StoryObj } from '@storybook/react';
import { AddActivityWizard } from './add-activity-wizard';

const meta: Meta<typeof AddActivityWizard> = {
  title: 'Student/AddActivityWizard',
  component: AddActivityWizard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    studentId: 'stu-001',
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
    onClose: () => {},
    studentId: 'stu-001',
  },
};