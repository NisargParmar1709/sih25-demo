import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'verified':
      return 'success';
    case 'pending':
      return 'warning';
    case 'rejected':
      return 'error';
    case 'under_review':
      return 'info';
    default:
      return 'default';
  }
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatScore(score: number): string {
  return score.toFixed(1);
}