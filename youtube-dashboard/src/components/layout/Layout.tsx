import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

interface LayoutProps {
  children: ReactNode;
  onSearch?: (query: string) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export default function Layout({ children, onSearch, onRefresh, isLoading }: LayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <TopBar onSearch={onSearch} onRefresh={onRefresh} isLoading={isLoading} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}