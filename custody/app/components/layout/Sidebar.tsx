"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../../lib/utils/cn';

// サイドバーのメニュー項目の型定義
type MenuItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
  submenu?: {
    title: string;
    href: string;
  }[];
};

// サイドバーのプロパティ型定義
interface SidebarProps {
  userRole?: 'admin' | 'operator';
}

// サイドバーコンポーネント
export function Sidebar({ userRole = 'operator' }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  const [openMenus, setOpenMenus] = React.useState<string[]>([]);

  // メニュー項目を開閉する関数
  const toggleMenu = (title: string) => {
    setOpenMenus((prev) => 
      prev.includes(title) 
        ? prev.filter(item => item !== title) 
        : [...prev, title]
    );
  };

  // メニュー項目の定義
  const menuItems: MenuItem[] = [
    {
      title: '預かる',
      href: '#',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
      submenu: [
        { title: '預かり品データ作成', href: '/import/custody' },
        { title: '預かり品データ一覧', href: '/custody/list' },
        { title: '入庫', href: '/custody/incoming' },
      ]
    },
    {
      title: '出庫する',
      href: '#',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      submenu: [
        { title: '出庫品データ作成', href: '/import/outgoing' },
        { title: '出庫品データ一覧', href: '/outgoing/list' },
      ]
    },
    {
      title: '管理',
      href: '#',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
      submenu: [
        { title: '倉庫マップ', href: '/warehouse-map' },
        { title: '顧客管理', href: '/customers' },
        ...(userRole === 'admin' ? [{ title: 'ユーザー管理', href: '/users' }] : []),
      ]
    },
  ];

  return (
    <div className={cn(
      "flex flex-col h-screen bg-green-800 text-white transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex items-center justify-between p-4 border-b border-green-700">
        {!collapsed && <h1 className="text-xl font-bold">物品管理</h1>}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md hover:bg-green-700"
        >
          {collapsed ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          )}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => (
            <li key={item.title}>
              {item.submenu ? (
                <>
                  <button
                    onClick={() => toggleMenu(item.title)}
                    className={cn(
                      "flex items-center w-full p-2 rounded-md hover:bg-green-700 transition-colors",
                      openMenus.includes(item.title) ? "bg-green-700" : ""
                    )}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left">{item.title}</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className={cn(
                            "h-4 w-4 transition-transform",
                            openMenus.includes(item.title) ? "transform rotate-180" : ""
                          )}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </>
                    )}
                  </button>
                  {!collapsed && openMenus.includes(item.title) && (
                    <ul className="pl-6 mt-1 space-y-1">
                      {item.submenu.map((subItem) => (
                        <li key={subItem.title}>
                          <Link 
                            href={subItem.href}
                            className={cn(
                              "block p-2 rounded-md hover:bg-green-700 transition-colors",
                              pathname === subItem.href ? "bg-green-700" : ""
                            )}
                          >
                            {subItem.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center p-2 rounded-md hover:bg-green-700 transition-colors",
                    pathname === item.href ? "bg-green-700" : ""
                  )}
                >
                  <span className="mr-2">{item.icon}</span>
                  {!collapsed && <span>{item.title}</span>}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
