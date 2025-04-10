"use client";

import React, { useState, useEffect } from 'react';
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

// サンプル倉庫データ
const sampleWarehouses = [
  { id: 'warehouse1', name: '本社倉庫' },
  { id: 'warehouse2', name: '第二倉庫' },
  { id: 'warehouse3', name: '物流センター' },
];

// 倉庫マップページコンポーネント
export default function WarehouseMapPage() {
  const [selectedCell, setSelectedCell] = useState<CellData | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>(sampleWarehouses[0].id);
  const [warehouses, setWarehouses] = useState(sampleWarehouses);

  // 倉庫データの取得（実際のアプリではAPIから取得）
  useEffect(() => {
    // ここでAPIから倉庫データを取得する処理を実装
    // 現在はサンプルデータを使用
  }, []);

  // セルが選択された時の処理
  const handleCellSelect = (cell: CellData | null) => {
    setSelectedCell(cell);
  };
  
  // 倉庫が選択された時の処理
  const handleWarehouseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedWarehouse(e.target.value);
    setSelectedCell(null); // 倉庫が変わったら選択セルをリセット
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">倉庫マップ</h1>
            <p className="text-gray-600">倉庫内の物品配置状況を確認できます</p>
          </div>
          <div className="w-64">
            <label htmlFor="warehouse-select" className="block text-sm font-medium text-gray-700 mb-1">
              倉庫を選択
            </label>
            <select
              id="warehouse-select"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              value={selectedWarehouse}
              onChange={handleWarehouseChange}
            >
              {warehouses.map(warehouse => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 倉庫グリッドコンポーネント */}
        <WarehouseGrid 
          onCellSelect={handleCellSelect} 
          warehouseId={selectedWarehouse} 
        />

        {/* 選択した保管場所の詳細 */}
        <CellDetail cell={selectedCell} />
      </div>
    </MainLayout>
  );
}
