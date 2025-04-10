"use client";

import React, { useState } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';

// 状態の定義
type Status = '未設定' | '刻印作成済み' | '入庫済み';

// 預かり品データの型定義
type CustodyItem = {
  id: string;                  // 本システム管理番号
  customerName: string;        // お客様名
  productNumber: string;       // 品番
  name: string;                // 名称
  customerItemId: string;      // お客様管理番号
  vertical: string;            // 縦
  beside: string;              // 横
  height: string;              // 高さ
  weight: string;              // 重量
  storageLocation: string;     // 保管場所
  startDate: string;           // 預かり開始日
  endDate: string;             // 出庫日
  registrationDate: string;    // 登録日
  status: Status;              // 状況
  quantity: string;            // 員数
  notes: string;               // 備考
};

// 現在の日付を取得（YYYY-MM-DD形式）
const getCurrentDate = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// サンプルデータ
const sampleData: CustodyItem[] = [
  { 
    id: 'C001', 
    customerName: '株式会社A', 
    productNumber: '60485SG100', 
    name: 'BRKT R R', 
    customerItemId: '3', 
    vertical: '710', 
    beside: '1250', 
    height: '450', 
    weight: '1410', 
    storageLocation: '', 
    startDate: '', 
    endDate: '', 
    registrationDate: '2025-04-01', 
    status: '未設定', 
    quantity: '2', 
    notes: '-' 
  },
  { 
    id: 'C002', 
    customerName: '株式会社A', 
    productNumber: '60085SG060', 
    name: 'BRKT BEAM CTR', 
    customerItemId: '7', 
    vertical: '730', 
    beside: '1300', 
    height: '460', 
    weight: '1540', 
    storageLocation: 'A-1-2', 
    startDate: '2025-04-02', 
    endDate: '', 
    registrationDate: '2025-04-01', 
    status: '刻印作成済み', 
    quantity: '2', 
    notes: '-' 
  },
  { 
    id: 'C003', 
    customerName: '株式会社B', 
    productNumber: '60886AE030', 
    name: 'ﾌﾟﾚｰﾄ WPR', 
    customerItemId: '12', 
    vertical: '500', 
    beside: '500', 
    height: '270', 
    weight: '240', 
    storageLocation: 'B-3-1', 
    startDate: '2025-04-03', 
    endDate: '', 
    registrationDate: '2025-04-01', 
    status: '入庫済み', 
    quantity: '1', 
    notes: '-' 
  },
  { 
    id: 'C004', 
    customerName: '株式会社C', 
    productNumber: '57232AJ030', 
    name: 'BRKT HOOD LOCK', 
    customerItemId: '30', 
    vertical: '750', 
    beside: '1550', 
    height: '530', 
    weight: '2180', 
    storageLocation: '', 
    startDate: '', 
    endDate: '', 
    registrationDate: '2025-04-02', 
    status: '未設定', 
    quantity: '2', 
    notes: '-' 
  },
  { 
    id: 'C005', 
    customerName: '株式会社C', 
    productNumber: '57231SC010', 
    name: 'PLATE NUT HD LK', 
    customerItemId: '34', 
    vertical: '530', 
    beside: '700', 
    height: '340', 
    weight: '450', 
    storageLocation: '', 
    startDate: '', 
    endDate: '', 
    registrationDate: '2025-04-02', 
    status: '未設定', 
    quantity: '1', 
    notes: '-' 
  },
  { 
    id: 'C006', 
    customerName: '株式会社D', 
    productNumber: '57231FG010', 
    name: 'PLATE NUT B', 
    customerItemId: '40', 
    vertical: '510', 
    beside: '700', 
    height: '320', 
    weight: '400', 
    storageLocation: '', 
    startDate: '', 
    endDate: '', 
    registrationDate: '2025-04-03', 
    status: '未設定', 
    quantity: '2', 
    notes: '-' 
  },
  { 
    id: 'C007', 
    customerName: '株式会社D', 
    productNumber: '60862SC000', 
    name: 'REINF R WPR R G', 
    customerItemId: '52', 
    vertical: '550', 
    beside: '980', 
    height: '440', 
    weight: '840', 
    storageLocation: '', 
    startDate: '', 
    endDate: '', 
    registrationDate: '2025-04-03', 
    status: '未設定', 
    quantity: '1', 
    notes: '-' 
  },
  { 
    id: 'C008', 
    customerName: '株式会社E', 
    productNumber: '60867SC000', 
    name: 'REINF STPR R GATE RH', 
    customerItemId: '53', 
    vertical: '680', 
    beside: '880', 
    height: '390', 
    weight: '830', 
    storageLocation: '', 
    startDate: '', 
    endDate: '', 
    registrationDate: '2025-04-04', 
    status: '未設定', 
    quantity: '1', 
    notes: '-' 
  },
  { 
    id: 'C009', 
    customerName: '株式会社E', 
    productNumber: '60867SC010', 
    name: 'REINF STPR R GATE LH', 
    customerItemId: '54', 
    vertical: '0', 
    beside: '0', 
    height: '0', 
    weight: '0', 
    storageLocation: '', 
    startDate: '', 
    endDate: '', 
    registrationDate: '2025-04-04', 
    status: '未設定', 
    quantity: '1', 
    notes: '-' 
  },
  { 
    id: 'C010', 
    customerName: '株式会社F', 
    productNumber: '60064FG000', 
    name: 'REINF DR F OUT', 
    customerItemId: '62', 
    vertical: '1500', 
    beside: '2000', 
    height: '800', 
    weight: '8450', 
    storageLocation: '', 
    startDate: '', 
    endDate: '', 
    registrationDate: '2025-04-05', 
    status: '未設定', 
    quantity: '2', 
    notes: '' 
  },
];

export default function CustodyListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof CustodyItem>('customerItemId');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 検索機能
  const filteredData = sampleData.filter(item => {
    return (
      item.customerItemId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.productNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // ソート機能
  const sortedData = [...filteredData].sort((a, b) => {
    const fieldA = a[sortField as keyof typeof a];
    const fieldB = b[sortField as keyof typeof b];
    
    if (sortDirection === 'asc') {
      return fieldA > fieldB ? 1 : -1;
    } else {
      return fieldA < fieldB ? 1 : -1;
    }
  });

  // ページネーション
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);

  // ソートの切り替え
  const handleSort = (field: keyof CustodyItem) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // ページの切り替え
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // 全選択/解除
  const toggleSelectAll = () => {
    if (selectedItems.length === currentItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(currentItems.map(item => item.customerItemId));
    }
  };

  // 個別選択/解除
  const toggleSelectItem = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
      
      // 編集中の場合、選択解除したアイテムの編集情報も削除
      if (editingItems[id]) {
        const newEditingItems = { ...editingItems };
        delete newEditingItems[id];
        setEditingItems(newEditingItems);
      }
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  // 編集中のアイテム管理
  const [editingItems, setEditingItems] = useState<Record<string, Partial<CustodyItem>>>({});
  const [bulkEditMode, setBulkEditMode] = useState(false);
  
  // ソートアイコンの表示
  const renderSortIcon = (field: keyof CustodyItem) => {
    if (field !== sortField) return null;
    return sortDirection === 'asc' ? '↑' : '↓';
  };
  
  // アイテムの編集開始
  const startEditing = (id: string) => {
    setEditingItems({
      ...editingItems,
      [id]: {}
    });
  };
  
  // アイテムの編集値を更新
  const updateEditingValue = (id: string, field: keyof CustodyItem, value: string) => {
    setEditingItems({
      ...editingItems,
      [id]: {
        ...editingItems[id],
        [field]: value
      }
    });
  };
  
  // 編集を保存
  const saveEdit = (id: string) => {
    // 実際のアプリではここでAPI呼び出しを行う
    console.log(`Saving changes for item ${id}:`, editingItems[id]);
    
    // 編集完了したアイテムを編集モードから除外
    const newEditingItems = { ...editingItems };
    delete newEditingItems[id];
    setEditingItems(newEditingItems);
  };
  
  // 編集をキャンセル
  const cancelEdit = (id: string) => {
    const newEditingItems = { ...editingItems };
    delete newEditingItems[id];
    setEditingItems(newEditingItems);
  };
  
  // 一括編集用の共通値
  const [bulkEditValues, setBulkEditValues] = useState<Partial<CustodyItem>>({});
  
  // 一括編集値を更新
  const updateBulkEditValue = (field: keyof CustodyItem, value: string) => {
    setBulkEditValues({
      ...bulkEditValues,
      [field]: value
    });
  };
  
  // 選択したアイテムを一括更新
  const bulkUpdate = () => {
    // 実際のアプリではここでAPI呼び出しを行う
    console.log('Bulk updating items:', selectedItems, bulkEditValues);
    
    // 一括編集モードを終了
    setBulkEditMode(false);
    setBulkEditValues({});
  };
  
  // 一括編集モードの切り替え
  const toggleBulkEditMode = () => {
    if (bulkEditMode) {
      // 一括編集モードを終了
      setBulkEditMode(false);
      setBulkEditValues({});
    } else {
      // 一括編集モードを開始
      setBulkEditMode(true);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">預かり品データ一覧</h1>
        
        {/* 検索・フィルタセクション */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="flex-grow">
            <input
              type="text"
              placeholder="検索..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {selectedItems.length > 0 && (
              <button 
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                onClick={toggleBulkEditMode}
              >
                {bulkEditMode ? '一括編集キャンセル' : '一括編集'}
              </button>
            )}
            {bulkEditMode && (
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={bulkUpdate}
              >
                一括更新を適用
              </button>
            )}
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              新規登録
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500">
              エクスポート
            </button>
          </div>
        </div>
        
        {/* データテーブル */}
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === currentItems.length && currentItems.length > 0}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('id')}
                >
                  管理番号 {renderSortIcon('id')}
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('customerName')}
                >
                  お客様名 {renderSortIcon('customerName')}
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('productNumber')}
                >
                  品番 {renderSortIcon('productNumber')}
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  名称 {renderSortIcon('name')}
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('customerItemId')}
                >
                  お客様管理番号 {renderSortIcon('customerItemId')}
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('storageLocation')}
                >
                  保管場所 {renderSortIcon('storageLocation')}
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('startDate')}
                >
                  預かり開始日 {renderSortIcon('startDate')}
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('status')}
                >
                  状況 {renderSortIcon('status')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((item, index) => {
                const isEditing = !!editingItems[item.id];
                const editValues = editingItems[item.id] || {};
                
                return (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => toggleSelectItem(item.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.id}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.customerName}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.productNumber}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.name}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.customerItemId}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editValues.storageLocation !== undefined ? editValues.storageLocation : item.storageLocation}
                          onChange={(e) => updateEditingValue(item.id, 'storageLocation', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md"
                        />
                      ) : (
                        item.storageLocation || '-'
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {isEditing ? (
                        <input
                          type="date"
                          value={editValues.startDate !== undefined ? editValues.startDate : item.startDate}
                          onChange={(e) => updateEditingValue(item.id, 'startDate', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md"
                        />
                      ) : (
                        item.startDate || '-'
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {isEditing ? (
                        <select
                          value={editValues.status !== undefined ? editValues.status : item.status}
                          onChange={(e) => updateEditingValue(item.id, 'status', e.target.value as Status)}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md"
                        >
                          <option value="未設定">未設定</option>
                          <option value="刻印作成済み">刻印作成済み</option>
                          <option value="入庫済み">入庫済み</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-1 rounded-full text-xs ${item.status === '入庫済み' ? 'bg-green-100 text-green-800' : item.status === '刻印作成済み' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                          {item.status}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {isEditing ? (
                        <div className="flex space-x-2">
                          <button 
                            className="text-green-600 hover:text-green-900"
                            onClick={() => saveEdit(item.id)}
                          >
                            保存
                          </button>
                          <button 
                            className="text-gray-600 hover:text-gray-900"
                            onClick={() => cancelEdit(item.id)}
                          >
                            キャンセル
                          </button>
                        </div>
                      ) : (
                        <div className="flex space-x-2">
                          <button 
                            className="text-blue-600 hover:text-blue-900"
                            onClick={() => startEditing(item.id)}
                          >
                            編集
                          </button>
                          <button className="text-red-600 hover:text-red-900">削除</button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* ページネーション */}
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-700">
            {filteredData.length} 件中 {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredData.length)} 件を表示
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => paginate(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md ${
                currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              前へ
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
              <button
                key={number}
                onClick={() => paginate(number)}
                className={`px-3 py-1 rounded-md ${
                  currentPage === number ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {number}
              </button>
            ))}
            <button
              onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md ${
                currentPage === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              次へ
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
