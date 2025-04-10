import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * 認証コールバックハンドラー
 * Supabaseからのリダイレクト時に認証情報を処理する
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    // クッキーからSupabaseクライアントを作成
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // codeを使用してセッションを交換
    await supabase.auth.exchangeCodeForSession(code);
  }

  // ダッシュボードにリダイレクト
  return NextResponse.redirect(new URL('/dashboard', request.url));
}
