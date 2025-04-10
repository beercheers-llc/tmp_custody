"use client";

import React, { useState, useEffect } from 'react';

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
  highlighted?: boolean; // 検索結果でハイライト表示されているかどうか
};

// 選択されたセルの詳細情報
type SelectedCell = CellData | null;

// 倉庫グリッドコンポーネントのプロパティ
interface WarehouseGridProps {
  onCellSelect: (cell: CellData | null) => void;
  warehouseId?: string; // 倉庫ID
}

export function WarehouseGrid({ onCellSelect, warehouseId }: WarehouseGridProps) {
  const [cells, setCells] = useState<CellData[]>([]);
  const [selectedCell, setSelectedCell] = useState<SelectedCell>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [outDate, setOutDate] = useState('');

  // 初期データのロード（実際のアプリではAPIから取得）
  useEffect(() => {
    // 倉庫IDが変更された場合にデータを再取得
    // 実際のアプリでは、warehouseIdに基づいてAPIからデータを取得する
    // 倉庫IDが変更された場合にデータを再取得
    // 実際のアプリでは、warehouseIdに基づいてAPIからデータを取得する
    // サンプルデータの生成
    const sampleCells: CellData[] = [];
    
    // グリッドのサイズ
    const gridWidth = 10;
    const gridHeight = 10;
    
    // エリアの定義
    const areas = ['A', 'B', 'C', 'D'];
    
    // ステータスの定義
    const statuses: ('empty' | 'used' | 'scheduled-in' | 'scheduled-out')[] = [
      'empty', 'used', 'scheduled-in', 'scheduled-out'
    ];
    
    // サンプルのお客様データ
    const customers = [
      { id: 'cust1', name: '株式会社山田製作所' },
      { id: 'cust2', name: '鈴木金型工業' },
      { id: 'cust3', name: '佐藤プラスチック' },
      { id: 'cust4', name: '高橋エンジニアリング' }
    ];
    
    // サンプルの物品名
    const itemNames = [
      '金型A-123', '金型B-456', '金型C-789', '金型D-012',
      '金型E-345', '金型F-678', '金型G-901', '金型H-234'
    ];
    
    // セルデータの生成
    for (let x = 0; x < gridWidth; x++) {
      for (let y = 0; y < gridHeight; y++) {
        // 通路の設定（例：x=3またはy=3の場合は通路）
        if (x === 3 || y === 3) {
          sampleCells.push({ x, y, status: 'empty' });
          continue;
        }
        
        // ランダムなエリアの割り当て
        const area = areas[Math.floor(x / 3) % areas.length];
        
        // ランダムなステータスの割り当て（70%は空き）
        const randomStatus = Math.random() < 0.7 
          ? 'empty' 
          : statuses[Math.floor(Math.random() * 3) + 1];
        
        // 基本セルデータ
        const cellData: CellData = {
          x,
          y,
          area,
          status: randomStatus,
          shelfType: Math.random() < 0.5 ? 'standard' : 'heavy'
        };
        
        // 空き以外の場合は追加情報を設定
        if (randomStatus !== 'empty') {
          const randomCustomer = customers[Math.floor(Math.random() * customers.length)];
          const randomItemName = itemNames[Math.floor(Math.random() * itemNames.length)];
          const today = new Date();
          
          cellData.customer = randomCustomer;
          cellData.itemName = randomItemName;
          cellData.itemId = `ITM-2025-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
          
          // 入庫日（過去30日以内のランダムな日付）
          const inDate = new Date(today);
          inDate.setDate(today.getDate() - Math.floor(Math.random() * 30));
          cellData.inDate = inDate.toISOString().split('T')[0];
          
          // 出庫予定の場合は出庫日を設定（将来30日以内のランダムな日付）
          if (randomStatus === 'scheduled-out') {
            const outDate = new Date(today);
            outDate.setDate(today.getDate() + Math.floor(Math.random() * 30) + 1);
            cellData.outDate = outDate.toISOString().split('T')[0];
          }
        }
        
        sampleCells.push(cellData);
      }
    }
    
    setCells(sampleCells);
  }, [warehouseId]); // warehouseIdが変更されたときに再取得

  // セルをクリックした時の処理
  const handleCellClick = (cell: CellData) => {
    setSelectedCell(cell);
    onCellSelect(cell);
  };

  // 検索処理
  const performSearch = () => {
    // 検索条件に合致するセルを検索
    const filteredCells = cells.filter(cell => {
      // 基本検索（テキスト）
      if (searchTerm && !(
        (cell.itemId && cell.itemId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (cell.itemName && cell.itemName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (cell.customer && cell.customer.name && cell.customer.name.toLowerCase().includes(searchTerm.toLowerCase()))
      )) {
        return false;
      }
      
      // 状態フィルター
      if (selectedStatus && cell.status !== selectedStatus) {
        return false;
      }
      
      // 出庫予定日フィルター
      if (outDate && cell.outDate !== outDate) {
        return false;
      }
      
      return true;
    });
    
    // 検索結果をハイライト表示
    setCells(prevCells => prevCells.map(cell => {
      const isHighlighted = filteredCells.some(fc => fc.x === cell.x && fc.y === cell.y);
      return { ...cell, highlighted: isHighlighted };
    }));
  };

  return (
    <div>
      {/* 検索・フィルター機能 */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              検索
            </label>
            <input
              type="text"
              id="search"
              placeholder="管理番号、品名、お客様名など"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              状態
            </label>
            <select
              id="status"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">全ての状態</option>
              <option value="empty">空き</option>
              <option value="used">使用中</option>
              <option value="scheduled-in">入庫予定</option>
              <option value="scheduled-out">出庫予定</option>
            </select>
          </div>
          <div>
            <label htmlFor="outDate" className="block text-sm font-medium text-gray-700 mb-1">
              出庫予定日
            </label>
            <input
              type="date"
              id="outDate"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              value={outDate}
              onChange={(e) => setOutDate(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            className="px-4 py-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            onClick={performSearch}
          >
            検索
          </button>
        </div>
      </div>

      {/* 倉庫マップ表示エリア */}
      <div className="bg-white p-6 rounded-lg shadow-md overflow-hidden">
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">倉庫レイアウト</h2>
          <div className="flex space-x-2">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-200 border border-gray-300 mr-1"></div>
              <span className="text-sm text-gray-600">空き</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-200 border border-blue-500 mr-1"></div>
              <span className="text-sm text-gray-600">使用中</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-200 border border-green-500 mr-1"></div>
              <span className="text-sm text-gray-600">入庫予定</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-200 border border-yellow-500 mr-1"></div>
              <span className="text-sm text-gray-600">出庫予定</span>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <div className="warehouse-grid" style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(10, 60px)',
            gridTemplateRows: 'repeat(10, 60px)',
            gap: '2px',
            minWidth: '600px',
            minHeight: '600px'
          }}>
            {cells.map((cell) => {
              // セルのスタイルを決定
              let cellStyle: React.CSSProperties = {
                border: '1px solid #e5e7eb',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '0.75rem',
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.2s',
                opacity: cell.highlighted === false ? 0.3 : 1
              };
              
              // エリアの背景色
              if (cell.area === 'A') cellStyle.backgroundColor = 'rgba(147, 197, 253, 0.2)';
              if (cell.area === 'B') cellStyle.backgroundColor = 'rgba(134, 239, 172, 0.2)';
              if (cell.area === 'C') cellStyle.backgroundColor = 'rgba(196, 181, 253, 0.2)';
              if (cell.area === 'D') cellStyle.backgroundColor = 'rgba(252, 211, 77, 0.2)';
              
              // 通路の場合
              if (cell.x === 3 || cell.y === 3) {
                cellStyle.backgroundColor = '#f3f4f6';
                cellStyle.cursor = 'default';
              }
              
              // 状態に応じたスタイル
              if (cell.status === 'used') {
                cellStyle.border = '2px solid #3b82f6';
                cellStyle.backgroundColor = 'rgba(59, 130, 246, 0.1)';
              } else if (cell.status === 'scheduled-in') {
                cellStyle.border = '2px solid #10b981';
                cellStyle.backgroundColor = 'rgba(16, 185, 129, 0.1)';
              } else if (cell.status === 'scheduled-out') {
                cellStyle.border = '2px solid #f59e0b';
                cellStyle.backgroundColor = 'rgba(245, 158, 11, 0.1)';
              }
              
              // 選択されたセルのハイライト
              if (selectedCell && selectedCell.x === cell.x && selectedCell.y === cell.y) {
                cellStyle.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.5)';
                cellStyle.zIndex = 10;
                cellStyle.transform = 'scale(1.05)';
              }
              
              // 検索結果のハイライト
              if (cell.highlighted) {
                cellStyle.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.5)';
                cellStyle.zIndex = 10;
              }
              
              return (
                <div
                  key={`${cell.x}-${cell.y}`}
                  style={cellStyle}
                  onClick={() => cell.x !== 3 && cell.y !== 3 && handleCellClick(cell)}
                >
                  {cell.x !== 3 && cell.y !== 3 && (
                    <>
                      <div className="font-semibold">{cell.area}-{cell.x}{cell.y}</div>
                      {cell.status !== 'empty' && (
                        <div className="text-xs mt-1 text-center">
                          {cell.itemName && <div className="truncate max-w-[50px]">{cell.itemName}</div>}
                          {cell.customer && <div className="truncate max-w-[50px]">{cell.customer.name}</div>}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
