import React from 'react';
import { MainLayout } from '../components/layout/MainLayout';

// ダッシュボードページコンポーネント
export default function DashboardPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">ダッシュボード</h1>
          <p className="text-gray-600">物品管理システムの概要を確認できます</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 本日の入庫予定カード */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">本日の入庫予定</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">予定件数</span>
                <span className="text-xl font-bold text-green-600">5件</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">完了件数</span>
                <span className="text-xl font-bold text-blue-600">2件</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">残り件数</span>
                <span className="text-xl font-bold text-orange-600">3件</span>
              </div>
            </div>
            <div className="mt-4">
              <a href="/custody/incoming" className="text-green-600 hover:text-green-800 text-sm font-medium">
                入庫管理へ進む →
              </a>
            </div>
          </div>

          {/* 本日の出庫予定カード */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">本日の出庫予定</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">予定件数</span>
                <span className="text-xl font-bold text-green-600">3件</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">完了件数</span>
                <span className="text-xl font-bold text-blue-600">1件</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">残り件数</span>
                <span className="text-xl font-bold text-orange-600">2件</span>
              </div>
            </div>
            <div className="mt-4">
              <a href="/outgoing/process" className="text-green-600 hover:text-green-800 text-sm font-medium">
                出庫管理へ進む →
              </a>
            </div>
          </div>

          {/* 在庫状況カード */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">在庫状況</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">総在庫数</span>
                <span className="text-xl font-bold text-green-600">1,250件</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">使用中の保管場所</span>
                <span className="text-xl font-bold text-blue-600">850箇所</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">空き保管場所</span>
                <span className="text-xl font-bold text-orange-600">150箇所</span>
              </div>
            </div>
            <div className="mt-4">
              <a href="/warehouse-map" className="text-green-600 hover:text-green-800 text-sm font-medium">
                倉庫マップを見る →
              </a>
            </div>
          </div>
        </div>

        {/* 最近の活動 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">最近の活動</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-blue-100 rounded-full p-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">金型A-123が入庫されました</p>
                <p className="text-sm text-gray-500">30分前 - 田中 太郎</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-green-100 rounded-full p-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">新しい預かり品データが登録されました</p>
                <p className="text-sm text-gray-500">2時間前 - 佐藤 花子</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-yellow-100 rounded-full p-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">金型B-456の出庫予定が登録されました</p>
                <p className="text-sm text-gray-500">3時間前 - 山田 次郎</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
