import { redirect } from 'next/navigation';

// サーバーコンポーネントのログインページ
// クライアントコンポーネントにリダイレクトする
export default function SignInPage() {
  redirect('/auth/signin-client');
  return null;
}
