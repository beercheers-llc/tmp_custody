"use client";

import React, { useState } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { WarehouseGrid } from './WarehouseGrid';
import { CellDetail } from './CellDetail';

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

// 倉庫マップページコンポーネント
export default function WarehouseMapPage() {
  const [selectedCell, setSelectedCell] = useState<CellData | null>(null);

  // セルが選択された時の処理
  const handleCellSelect = (cell: CellData | null) => {
    setSelectedCell(cell);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">倉庫マップ</h1>
          <p className="text-gray-600">倉庫内の物品配置状況を確認できます</p>
        </div>

        {/* 倉庫グリッドコンポーネント */}
        <WarehouseGrid onCellSelect={handleCellSelect} />

        {/* 選択した保管場所の詳細 */}
        <CellDetail cell={selectedCell} />
      </div>
    </MainLayout>
  );
}
