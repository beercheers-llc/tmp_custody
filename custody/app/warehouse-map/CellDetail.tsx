"use client";

import React from 'react';

// セルのデータ型
type CellData = {
  x: number;
  y: number;
  area?: string;
  status?: 'empty' | 'used' | 'scheduled-in' | 'scheduled-out';
  itemId?: string;
  itemName?: string;
  customer?: {
    id: string;
    name: string;
  };
  inDate?: string;
  outDate?: string;
  shelfType?: string;
};

// セル詳細コンポーネントのプロパティ
interface CellDetailProps {
  cell: CellData | null;
}

export function CellDetail({ cell }: CellDetailProps) {
  if (!cell) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">保管場所の詳細</h2>
        <p className="text-gray-500">保管場所を選択してください</p>
      </div>
    );
  }

  // ステータスに応じたテキストと色
  const getStatusText = (status?: string) => {
    switch (status) {
      case 'empty': return { text: '空き', color: 'text-gray-600' };
      case 'used': return { text: '使用中', color: 'text-blue-600' };
      case 'scheduled-in': return { text: '入庫予定', color: 'text-green-600' };
      case 'scheduled-out': return { text: '出庫予定', color: 'text-yellow-600' };
      default: return { text: '不明', color: 'text-gray-600' };
    }
  };

  const statusInfo = getStatusText(cell.status);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">保管場所の詳細</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-md font-medium text-gray-700 mb-2">保管場所情報</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">エリア:</span>
              <span className="font-medium">{cell.area || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">棚ID:</span>
              <span className="font-medium">{cell.area}-{cell.x}{cell.y}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">タイプ:</span>
              <span className="font-medium">{cell.shelfType === 'standard' ? '標準棚' : '重量棚'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">位置:</span>
              <span className="font-medium">X:{cell.x}, Y:{cell.y}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">状態:</span>
              <span className={`font-medium ${statusInfo.color}`}>{statusInfo.text}</span>
            </div>
          </div>
        </div>
        {cell.status !== 'empty' && (
          <div>
            <h3 className="text-md font-medium text-gray-700 mb-2">保管物品情報</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">管理番号:</span>
                <span className="font-medium">{cell.itemId || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">品名:</span>
                <span className="font-medium">{cell.itemName || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">お客様:</span>
                <span className="font-medium">{cell.customer?.name || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">入庫日:</span>
                <span className="font-medium">{cell.inDate || '-'}</span>
              </div>
              {cell.status === 'scheduled-out' && (
                <div className="flex justify-between">
                  <span className="text-gray-600">出庫予定日:</span>
                  <span className="font-medium">{cell.outDate || '-'}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="mt-4 flex justify-end space-x-2">
        {cell.status !== 'empty' && (
          <button
            type="button"
            className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            詳細を見る
          </button>
        )}
        <button
          type="button"
          className="px-4 py-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          {cell.status === 'empty' ? '物品を配置' : '移動する'}
        </button>
      </div>
    </div>
  );
}
