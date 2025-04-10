"use client";

import React, { useState, useEffect } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { itemApi } from '../../lib/api/database';
import { Item } from '../../lib/schema';

// 出庫品データの型定義
type OutgoingItem = Item & {
  customerName?: string;        // お客様名
  customerItemId?: string;      // お客様管理番号
  destination?: string;         // 納品先
  requestedDate?: string;       // 出庫希望日
  outgoingDate?: string;        // 出庫日
};

// 現在の日付を取得（YYYY-MM-DD形式）
const getCurrentDate = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// 今日の出庫アイテムをフィルタリングする関数
const filterTodayOutgoing = (items: OutgoingItem[]): OutgoingItem[] => {
  const today = getCurrentDate();
  return items.filter(item => 
    (item.requestedDate === today && item.status === 'scheduled') || 
    (item.outgoingDate === today && item.status === 'shipped')
  );
};

// サンプルデータ
const sampleData: OutgoingItem[] = [
  { 
    id: 'O001', 
    item_code: 'ITM-001',
    name: '金型A',
    description: '自動車部品用金型',
    customer_id: '1',
    customerName: '株式会社スバル',
    size_width: 80,
    size_height: 60,
    size_depth: 40,
    weight: 120,
    status: 'scheduled',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'user1',
    customerItemId: 'SB-MOLD-001',
    destination: 'スバル群馬工場',
    requestedDate: '2025-04-15',
    outgoingDate: '',
    location_id: 'L001'
  },
  { 
    id: 'O002', 
    item_code: 'ITM-002',
    name: '金型B',
    description: 'ドアパネル用金型',
    customer_id: '1',
    customerName: '株式会社スバル',
    size_width: 90,
    size_height: 70,
    size_depth: 45,
    weight: 150,
    status: 'scheduled',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'user1',
    customerItemId: 'SB-MOLD-002',
    destination: 'スバル本社',
    requestedDate: '2025-04-20',
    outgoingDate: '',
    location_id: 'L002'
  },
  { 
    id: 'O003', 
    item_code: 'ITM-003',
    name: '金型C',
    description: 'エンジン部品用金型',
    customer_id: '2',
    customerName: '株式会社マツダ',
    size_width: 75,
    size_height: 55,
    size_depth: 35,
    weight: 110,
    status: 'shipped',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'user1',
    customerItemId: 'MZ-MOLD-001',
    destination: 'マツダ広島工場',
    requestedDate: '2025-04-10',
    outgoingDate: '2025-04-11',
    location_id: 'L003'
  },
  { 
    id: 'O004', 
    item_code: 'ITM-004',
    name: '金型D',
    description: 'ボディパネル用金型',
    customer_id: '2',
    customerName: '株式会社マツダ',
    size_width: 100,
    size_height: 80,
    size_depth: 50,
    weight: 180,
    status: 'shipped',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'user1',
    customerItemId: 'MZ-MOLD-002',
    destination: 'マツダ本社',
    requestedDate: '2025-04-05',
    outgoingDate: '2025-04-06',
    location_id: 'L004'
  },
  { 
    id: 'O005', 
    item_code: 'ITM-005',
    name: '金型E',
    description: 'インテリア部品用金型',
    customer_id: '3',
    customerName: '株式会社トヨタ',
    size_width: 85,
    size_height: 65,
    size_depth: 42,
    weight: 130,
    status: 'scheduled',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'user1',
    customerItemId: 'TY-MOLD-001',
    destination: 'トヨタ愛知工場',
    requestedDate: '2025-04-25',
    outgoingDate: '',
    location_id: 'L005'
  }
];

// 出庫品データ一覧ページコンポーネント
export default function OutgoingListPage() {
  // 状態管理
  const [items, setItems] = useState<OutgoingItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<OutgoingItem[]>([]);
  const [currentItems, setCurrentItems] = useState<OutgoingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<keyof OutgoingItem>('requestedDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showShipped, setShowShipped] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<OutgoingItem>>({});
  
  // フィルタ状態管理
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    itemCode: '',
    customerName: '',
    customerItemId: '',
    requestedDateStart: '',
    requestedDateEnd: '',
    outgoingDateStart: '',
    outgoingDateEnd: ''
  });
  const [showTodayOnly, setShowTodayOnly] = useState(false);

  // データの読み込み
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 実際の環境では下記のコメントアウトを解除してAPIを使用
        // const itemsData = await itemApi.getOutgoingItems();
        // setItems(itemsData);
        
        // 開発用サンプルデータ
        setItems(sampleData);
        setLoading(false);
      } catch (err) {
        console.error('データ取得エラー:', err);
        setError('データの取得中にエラーが発生しました。');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // 検索とフィルタリング
  useEffect(() => {
    let result = [...items];
    
    // 検索クエリによるフィルタリング
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.item_code.toLowerCase().includes(query) ||
        item.name.toLowerCase().includes(query) ||
        item.customerName?.toLowerCase().includes(query) ||
        item.customerItemId?.toLowerCase().includes(query) ||
        item.destination?.toLowerCase().includes(query)
      );
    }
    
    // 詳細フィルタによるフィルタリング
    if (filters.itemCode) {
      result = result.filter(item => 
        item.item_code.toLowerCase().includes(filters.itemCode.toLowerCase())
      );
    }
    
    if (filters.customerName) {
      result = result.filter(item => 
        item.customerName?.toLowerCase().includes(filters.customerName.toLowerCase())
      );
    }
    
    if (filters.customerItemId) {
      result = result.filter(item => 
        item.customerItemId?.toLowerCase().includes(filters.customerItemId.toLowerCase())
      );
    }
    
    if (filters.requestedDateStart) {
      result = result.filter(item => 
        item.requestedDate && item.requestedDate >= filters.requestedDateStart
      );
    }
    
    if (filters.requestedDateEnd) {
      result = result.filter(item => 
        item.requestedDate && item.requestedDate <= filters.requestedDateEnd
      );
    }
    
    if (filters.outgoingDateStart) {
      result = result.filter(item => 
        item.outgoingDate && item.outgoingDate >= filters.outgoingDateStart
      );
    }
    
    if (filters.outgoingDateEnd) {
      result = result.filter(item => 
        item.outgoingDate && item.outgoingDate <= filters.outgoingDateEnd
      );
    }
    
    // 出庫済みアイテムの表示/非表示
    if (!showShipped) {
      result = result.filter(item => item.status === 'scheduled');
    }
    
    // 今日の出庫のみ表示
    if (showTodayOnly) {
      const today = getCurrentDate();
      result = result.filter(item => 
        (item.requestedDate === today && item.status === 'scheduled') || 
        (item.outgoingDate === today && item.status === 'shipped')
      );
    }
    
    // ソート
    result.sort((a, b) => {
      const aValue = a[sortField] || '';
      const bValue = b[sortField] || '';
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return 0;
    });
    
    setFilteredItems(result);
  }, [items, searchQuery, sortField, sortDirection, showShipped, filters, showTodayOnly]);

  // ページネーション
  useEffect(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    setCurrentItems(filteredItems.slice(indexOfFirstItem, indexOfLastItem));
  }, [filteredItems, currentPage, itemsPerPage]);

  // ソートの切り替え
  const handleSort = (field: keyof OutgoingItem) => {
    if (sortField === field) {
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
      setSelectedItems(currentItems.map(item => item.id));
    }
  };

  // 個別選択/解除
  const toggleSelectItem = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  // 出庫完了処理
  const handleCompleteOutgoing = async (id: string) => {
    try {
      setLoading(true);
      
      // 実際の環境では下記のコメントアウトを解除してAPIを使用
      // await itemApi.completeOutgoing(id);
      
      // 開発用モックデータ更新
      const updatedItems = items.map(item => 
        item.id === id 
          ? { 
              ...item, 
              status: 'shipped' as 'shipped', 
              outgoingDate: getCurrentDate() 
            } 
          : item
      );
      
      setItems(updatedItems);
      setLoading(false);
    } catch (err) {
      console.error('出庫完了処理エラー:', err);
      setError('出庫完了処理中にエラーが発生しました。');
      setLoading(false);
    }
  };

  // 一括出庫完了処理
  const handleBulkCompleteOutgoing = async () => {
    try {
      setLoading(true);
      
      // 実際の環境では下記のコメントアウトを解除してAPIを使用
      // await Promise.all(selectedItems.map(id => itemApi.completeOutgoing(id)));
      
      // 開発用モックデータ更新
      const updatedItems = items.map(item => 
        selectedItems.includes(item.id) 
          ? { 
              ...item, 
              status: 'shipped' as 'shipped', 
              outgoingDate: getCurrentDate() 
            } 
          : item
      );
      
      setItems(updatedItems);
      setSelectedItems([]);
      setLoading(false);
    } catch (err) {
      console.error('一括出庫完了処理エラー:', err);
      setError('一括出庫完了処理中にエラーが発生しました。');
      setLoading(false);
    }
  };

  // ソートアイコンの表示
  const renderSortIcon = (field: keyof OutgoingItem) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  // アイテムの編集開始
  const startEditing = (id: string) => {
    const item = items.find(item => item.id === id);
    if (item) {
      setEditingItemId(id);
      setEditValues({
        destination: item.destination,
        requestedDate: item.requestedDate
      });
    }
  };

  // 編集値を更新
  const updateEditingValue = (field: keyof OutgoingItem, value: string) => {
    setEditValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 編集を保存
  const saveEdit = async (id: string) => {
    try {
      setLoading(true);
      
      // 実際の環境では下記のコメントアウトを解除してAPIを使用
      // await itemApi.updateOutgoingItem(id, editValues);
      
      // 開発用モックデータ更新
      const updatedItems = items.map(item => 
        item.id === id 
          ? { ...item, ...editValues } 
          : item
      );
      
      setItems(updatedItems);
      setEditingItemId(null);
      setEditValues({});
      setLoading(false);
    } catch (err) {
      console.error('編集保存エラー:', err);
      setError('編集の保存中にエラーが発生しました。');
      setLoading(false);
    }
  };

  // 編集をキャンセル
  const cancelEdit = () => {
    setEditingItemId(null);
    setEditValues({});
  };
  
  // フィルタの更新
  const updateFilter = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // フィルタのリセット
  const resetFilters = () => {
    setFilters({
      itemCode: '',
      customerName: '',
      customerItemId: '',
      requestedDateStart: '',
      requestedDateEnd: '',
      outgoingDateStart: '',
      outgoingDateEnd: ''
    });
    setShowTodayOnly(false);
  };
  
  // 今日の出庫のみ表示するクイックフィルタ
  const showOnlyTodayOutgoing = () => {
    resetFilters();
    setShowTodayOnly(true);
    setShowShipped(true); // 出庫済みも表示する必要がある
  };

  // ページネーション計算
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">出庫品データ一覧</h1>
        
        {/* エラーメッセージ */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p>{error}</p>
          </div>
        )}
        
        {/* 検索とフィルター */}
        <div className="mb-6 flex flex-col space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <svg
                  className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showShipped"
                  checked={showShipped}
                  onChange={() => setShowShipped(!showShipped)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="showShipped" className="ml-2 text-sm text-gray-700">
                  出庫済みも表示
                </label>
              </div>
              <div className="flex items-center ml-4">
                <input
                  type="checkbox"
                  id="showTodayOnly"
                  checked={showTodayOnly}
                  onChange={() => setShowTodayOnly(!showTodayOnly)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="showTodayOnly" className="ml-2 text-sm text-gray-700">
                  今日の出庫のみ表示
                </label>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex items-center"
              >
                <svg
                  className="h-4 w-4 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                    clipRule="evenodd"
                  />
                </svg>
                {showFilters ? 'フィルタを隠す' : 'フィルタを表示'}
              </button>
            </div>
            
            {/* アクションボタン */}
            <div className="flex space-x-2">
              {selectedItems.length > 0 && (
                <button
                  onClick={handleBulkCompleteOutgoing}
                  className="px-4 py-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  disabled={loading}
                >
                  {loading ? '処理中...' : '一括出庫完了'}
                </button>
              )}
            </div>
          </div>
          
          {/* 詳細フィルタ */}
          {showFilters && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">管理番号</label>
                  <input
                    type="text"
                    value={filters.itemCode}
                    onChange={(e) => updateFilter('itemCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="管理番号で絞り込み"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">お客様名</label>
                  <input
                    type="text"
                    value={filters.customerName}
                    onChange={(e) => updateFilter('customerName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="お客様名で絞り込み"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">お客様管理番号</label>
                  <input
                    type="text"
                    value={filters.customerItemId}
                    onChange={(e) => updateFilter('customerItemId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="お客様管理番号で絞り込み"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">出庫希望日（開始）</label>
                  <input
                    type="date"
                    value={filters.requestedDateStart}
                    onChange={(e) => updateFilter('requestedDateStart', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">出庫希望日（終了）</label>
                  <input
                    type="date"
                    value={filters.requestedDateEnd}
                    onChange={(e) => updateFilter('requestedDateEnd', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">出庫日（開始）</label>
                  <input
                    type="date"
                    value={filters.outgoingDateStart}
                    onChange={(e) => updateFilter('outgoingDateStart', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">出庫日（終了）</label>
                  <input
                    type="date"
                    value={filters.outgoingDateEnd}
                    onChange={(e) => updateFilter('outgoingDateEnd', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-between">
                <button
                  onClick={showOnlyTodayOutgoing}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  今日の出庫のみ表示
                </button>
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md mr-2 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  リセット
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* データテーブル */}
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === currentItems.length && currentItems.length > 0}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('item_code')}
                >
                  <div className="flex items-center">
                    管理番号 {renderSortIcon('item_code')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('customerName')}
                >
                  <div className="flex items-center">
                    お客様名 {renderSortIcon('customerName')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('customerItemId')}
                >
                  <div className="flex items-center">
                    お客様管理番号 {renderSortIcon('customerItemId')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    名称 {renderSortIcon('name')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('destination')}
                >
                  <div className="flex items-center">
                    納品先 {renderSortIcon('destination')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('requestedDate')}
                >
                  <div className="flex items-center">
                    出庫希望日 {renderSortIcon('requestedDate')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('outgoingDate')}
                >
                  <div className="flex items-center">
                    出庫日 {renderSortIcon('outgoingDate')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center">
                    状況 {renderSortIcon('status')}
                  </div>
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  アクション
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-4 text-center text-sm text-gray-500">
                    <div className="flex justify-center items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>データを読み込み中...</span>
                    </div>
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-4 text-center text-sm text-gray-500">
                    データがありません
                  </td>
                </tr>
              ) : (
                currentItems.map(item => {
                  const isEditing = editingItemId === item.id;
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => toggleSelectItem(item.id)}
                          disabled={item.status === 'shipped'}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.item_code}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.customerName}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.customerItemId}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.name}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editValues.destination || ''}
                            onChange={(e) => updateEditingValue('destination', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md"
                          />
                        ) : (
                          item.destination
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {isEditing ? (
                          <input
                            type="date"
                            value={editValues.requestedDate || ''}
                            onChange={(e) => updateEditingValue('requestedDate', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md"
                          />
                        ) : (
                          item.requestedDate
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.outgoingDate || '-'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          item.status === 'shipped' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.status === 'shipped' ? '出庫済み' : '出庫予定'}
                        </span>
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
                              onClick={cancelEdit}
                            >
                              キャンセル
                            </button>
                          </div>
                        ) : (
                          <div className="flex space-x-2">
                            {item.status === 'scheduled' && (
                              <>
                                <button 
                                  className="text-blue-600 hover:text-blue-900"
                                  onClick={() => startEditing(item.id)}
                                >
                                  編集
                                </button>
                                <button 
                                  className="text-green-600 hover:text-green-900"
                                  onClick={() => handleCompleteOutgoing(item.id)}
                                >
                                  出庫完了
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* ページネーション */}
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-700">
            {filteredItems.length} 件中 {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredItems.length)} 件を表示
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
                  currentPage === number ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
