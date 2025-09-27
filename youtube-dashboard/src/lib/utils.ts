import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwindcss-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds}s ago`;
  }
  if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)}m ago`;
  }
  if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)}h ago`;
  }
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

export function getOutlierColor(factor: number): string {
  if (factor >= 10) return 'text-red-500 bg-red-50';
  if (factor >= 5) return 'text-orange-500 bg-orange-50';
  if (factor >= 2) return 'text-yellow-500 bg-yellow-50';
  if (factor >= 1.5) return 'text-green-500 bg-green-50';
  return 'text-gray-500 bg-gray-50';
}

export function getYouTubeThumbnail(videoId: string, quality: 'default' | 'medium' | 'high' = 'medium'): string {
  return `https://img.youtube.com/vi/${videoId}/${quality === 'high' ? 'maxresdefault' : quality === 'medium' ? 'mqdefault' : 'default'}.jpg`;
}