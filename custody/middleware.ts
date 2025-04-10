import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * ミドルウェア - 認証状態に基づいてリダイレクト処理を行う
 * 
 * 1. 認証が必要なページにアクセスした未認証ユーザーをログインページにリダイレクト
 * 2. 認証済みユーザーがログインページにアクセスした場合はダッシュボードにリダイレクト
 */
export async function middleware(req: NextRequest) {
  // デモモード：認証チェックを無効化
  // 本番環境では以下のコメントを外して認証を有効化してください
  return NextResponse.next();

  /*
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  // セッションの取得
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 現在のURLパス
  const path = req.nextUrl.pathname;
  
  // 認証が必要ないパス（ログイン関連ページなど）
  const publicPaths = ['/auth/signin', '/auth/callback', '/auth/reset-password'];
  
  // 認証が必要なパスかどうかを判定
  const isAuthRequired = !publicPaths.includes(path);
  
  // 認証が必要なページに未認証ユーザーがアクセスした場合
  if (isAuthRequired && !session) {
    // ログインページにリダイレクト
    const redirectUrl = new URL('/auth/signin', req.url);
    return NextResponse.redirect(redirectUrl);
  }
  
  // 認証済みユーザーがログインページにアクセスした場合
  if (!isAuthRequired && session) {
    // ダッシュボードにリダイレクト
    const redirectUrl = new URL('/dashboard', req.url);
    return NextResponse.redirect(redirectUrl);
  }
  
  return res;
  */
}

// ミドルウェアを適用するパスを指定
export const config = {
  matcher: [
    // 認証が必要なページ
    '/dashboard/:path*',
    '/warehouse-map/:path*',
    '/custody/:path*',
    '/outgoing/:path*',
    '/import/:path*',
    '/inventory/:path*',
    '/customers/:path*',
    '/users/:path*',
    // 認証関連ページ
    '/auth/signin',
    '/auth/callback',
    '/auth/reset-password',
  ],
};
