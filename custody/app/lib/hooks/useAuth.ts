"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../api/database';
import { User } from '../schema';

/**
 * 認証状態を管理するカスタムフック
 * 
 * ユーザーのログイン状態、ロール、プロフィール情報を提供します
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // 初期化時とセッション変更時にユーザー情報を取得
  useEffect(() => {
    // 現在のセッションを取得
    const getInitialSession = async () => {
      try {
        setLoading(true);
        
        // セッション情報を取得
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          try {
            // ユーザープロファイル情報を取得
            const { data, error } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();
              
            if (error) {
              // ユーザーテーブルがない場合や他のエラーの場合は、基本情報だけで仮ユーザーオブジェクトを作成
              console.warn('ユーザーテーブルからの情報取得に失敗しました:', error);
              // 認証情報からユーザー基本情報を設定
              const tempUser: Partial<User> = {
                id: session.user.id,
                email: session.user.email || '',
                role: 'operator', // デフォルトロール
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                first_name: '',
                last_name: '',
              };
              setUser(tempUser as User);
            } else {
              setUser(data as User);
            }
          } catch (err) {
            console.error('ユーザー情報処理エラー:', err);
            // エラーが発生しても基本的なユーザー情報は設定
            const tempUser: Partial<User> = {
              id: session.user.id,
              email: session.user.email || '',
              role: 'operator',
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              first_name: '',
              last_name: '',
            };
            setUser(tempUser as User);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('認証エラー:', err);
        setError(err as Error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // 初期セッションを取得
    getInitialSession();

    // 認証状態変更のリスナーを設定
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // ログイン、ログアウト、トークン更新時に実行
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session) {
            try {
              const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single();
                
              if (error) {
                // ユーザーテーブルがない場合や他のエラーの場合は、基本情報だけで仮ユーザーオブジェクトを作成
                console.warn('ユーザーテーブルからの情報取得に失敗しました:', error);
                // 認証情報からユーザー基本情報を設定
                const tempUser: Partial<User> = {
                  id: session.user.id,
                  email: session.user.email || '',
                  role: 'operator', // デフォルトロール
                  is_active: true,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  first_name: '',
                  last_name: '',
                };
                setUser(tempUser as User);
              } else {
                setUser(data as User);
              }
            } catch (err) {
              console.error('ユーザー情報処理エラー:', err);
              // エラーが発生しても基本的なユーザー情報は設定
              const tempUser: Partial<User> = {
                id: session.user.id,
                email: session.user.email || '',
                role: 'operator',
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                first_name: '',
                last_name: '',
              };
              setUser(tempUser as User);
            }
          }
        }
        
        if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    // クリーンアップ関数
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  /**
   * ログアウト処理
   */
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      return { success: true };
    } catch (err) {
      console.error('ログアウトエラー:', err);
      setError(err as Error);
      return { success: false, error: err };
    }
  };

  /**
   * パスワードリセットメールを送信
   */
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
      });
      
      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error('パスワードリセットエラー:', err);
      setError(err as Error);
      return { success: false, error: err };
    }
  };

  /**
   * 管理者権限を持っているかチェック
   */
  const isAdmin = user?.role === 'admin';

  return {
    user,
    loading,
    error,
    signOut,
    resetPassword,
    isAdmin,
  };
}
