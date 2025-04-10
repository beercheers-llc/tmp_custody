import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * ログアウト処理ハンドラー
 * ユーザーセッションを終了し、ログインページにリダイレクトする
 */
export async function GET(request: NextRequest) {
  // クッキーからSupabaseクライアントを作成
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  
  // ログアウト処理
  await supabase.auth.signOut();
  
  // ログインページにリダイレクト
  return NextResponse.redirect(new URL('/auth/signin', request.url));
}
