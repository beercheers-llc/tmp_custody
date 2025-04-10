import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

// レイアウトのプロパティ型定義
interface MainLayoutProps {
  children: React.ReactNode;
  userRole?: 'admin' | 'operator';
  userName?: string;
}

// メインレイアウトコンポーネント
export function MainLayout({ 
  children, 
  userRole = 'operator',
  userName = 'ユーザー'
}: MainLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header userName={userName} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar userRole={userRole} />
        
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
