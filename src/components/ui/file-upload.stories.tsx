import type { Meta, StoryObj } from '@storybook/react';
import { FileUpload } from './file-upload';

const meta: Meta<typeof FileUpload> = {
  title: 'UI/FileUpload',
  component: FileUpload,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onFilesChange: (files) => console.log('Files changed:', files),
  },
};

export const SingleFile: Story = {
  args: {
    onFilesChange: (files) => console.log('Files changed:', files),
    multiple: false,
    maxFiles: 1,
  },
};

export const ImagesOnly: Story = {
  args: {
    onFilesChange: (files) => console.log('Files changed:', files),
    accept: '.jpg,.jpeg,.png,.gif',
    maxSize: 5,
  },
};

export const PDFOnly: Story = {
  args: {
    onFilesChange: (files) => console.log('Files changed:', files),
    accept: '.pdf',
    maxFiles: 3,
  },
};