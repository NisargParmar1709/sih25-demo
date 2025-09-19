import type { Meta, StoryObj } from '@storybook/react';
import { Progress } from './progress';

const meta: Meta<typeof Progress> = {
  title: 'UI/Progress',
  component: Progress,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'success', 'warning', 'error'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 75,
  },
};

export const Success: Story = {
  args: {
    value: 90,
    variant: 'success',
  },
};

export const Warning: Story = {
  args: {
    value: 60,
    variant: 'warning',
  },
};

export const Error: Story = {
  args: {
    value: 30,
    variant: 'error',
  },
};

export const WithLabel: Story = {
  args: {
    value: 85,
    showLabel: true,
    variant: 'success',
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4 w-64">
      <div>
        <p className="text-sm mb-2">Small</p>
        <Progress value={75} size="sm" />
      </div>
      <div>
        <p className="text-sm mb-2">Medium</p>
        <Progress value={75} size="md" />
      </div>
      <div>
        <p className="text-sm mb-2">Large</p>
        <Progress value={75} size="lg" />
      </div>
    </div>
  ),
};