import React from 'react';
import Link from 'next/link';
import { cn } from '@/app/lib/utils/cn';

// ヘッダーのプロパティ型定義
interface HeaderProps {
  userName?: string;
}

// ヘッダーコンポーネント
export function Header({ userName = 'ユーザー' }: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  return (
    <header className="bg-green-600 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <div className="flex items-center">
          <Link href="/dashboard" className="text-white text-xl font-bold">
            物品管理システム
          </Link>
        </div>

        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center text-white hover:text-green-200 focus:outline-none"
          >
            <span className="mr-2">{userName}さん</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
              <Link
                href="/profile"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setDropdownOpen(false)}
              >
                プロフィール
              </Link>
              <Link
                href="/auth/signout"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setDropdownOpen(false)}
              >
                ログアウト
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
