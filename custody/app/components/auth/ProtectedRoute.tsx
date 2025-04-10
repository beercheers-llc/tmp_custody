"use client";

import React, { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from './AuthProvider';

// 保護されたルートのプロパティ型
interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

/**
 * 認証が必要なルートを保護するコンポーネント
 * 
 * 未認証ユーザーはログインページにリダイレクト
 * adminOnlyがtrueの場合、管理者以外はダッシュボードにリダイレクト
 */
export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { user, loading, isAdmin } = useAuthContext();
  const router = useRouter();

  // デモモード：認証チェックをスキップして常にコンテンツを表示
  // 本番環境では以下のコメントを外して認証を有効化してください
  return <>{children}</>;

  /*
  // 認証状態の読み込み中
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  // 未認証の場合、ログインページにリダイレクト
  if (!user) {
    // クライアントサイドでのみ実行
    if (typeof window !== 'undefined') {
      router.push('/auth/signin');
    }
    return null;
  }

  // 管理者専用ページに運用者がアクセスした場合
  if (adminOnly && !isAdmin) {
    // クライアントサイドでのみ実行
    if (typeof window !== 'undefined') {
      router.push('/dashboard');
    }
    return null;
  }

  // 認証済みかつ適切な権限がある場合、子コンポーネントを表示
  return <>{children}</>;
  */
}
