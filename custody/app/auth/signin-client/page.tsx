"use client";

import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { createClient } from '@supabase/supabase-js';
import { LoadingSpinner } from '../../components/loading/LoadingSpinner';

/**
 * クライアントコンポーネントのログインページ
 * Supabase Auth UIを使用してログインフォームを表示
 */
export default function SignInClientPage() {
  const [supabase, setSupabase] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // クライアントサイドでSupabaseクライアントを初期化
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      const client = createClient(supabaseUrl, supabaseKey);
      setSupabase(client);
    } catch (error) {
      console.error('Supabaseクライアントの初期化エラー:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="m-auto w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-600">物品管理システム</h1>
          <p className="text-gray-600 mt-2">ログインしてください</p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner text="読み込み中..." />
          </div>
        ) : supabase ? (
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            theme="light"
            localization={{
              variables: {
                sign_in: {
                  email_label: 'メールアドレス',
                  password_label: 'パスワード',
                  button_label: 'ログイン',
                  loading_button_label: '読み込み中...',
                  link_text: 'アカウントをお持ちでない場合は管理者にお問い合わせください',
                },
                forgotten_password: {
                  button_label: 'パスワードリセットメールを送信',
                  loading_button_label: '送信中...',
                  link_text: 'パスワードをお忘れですか？',
                  confirmation_text: 'パスワードリセットのメールを確認してください',
                },
              }
            }}
            providers={[]}
            redirectTo={`${window.location.origin}/auth/callback`}
          />
        ) : (
          <div className="text-center text-red-500 py-4">
            <p>Supabaseクライアントの初期化に失敗しました。</p>
            <p className="mt-2">環境変数が正しく設定されているか確認してください。</p>
          </div>
        )}
      </div>
    </div>
  );
}
