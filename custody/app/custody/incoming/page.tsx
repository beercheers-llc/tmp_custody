"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { itemApi, storageLocationApi, supabase } from '../../lib/api/database';
import { Item, StorageLocation, IncomingRecord, Customer } from '../../lib/schema';
import { useAuth } from '../../lib/hooks/useAuth';
import { MainLayout } from '../../components/layout/MainLayout';
import { Button } from '../../components/ui/button';
import { format } from 'date-fns';

// APIから返される拡張されたItem型
type ExtendedItem = Item & {
  customers?: Pick<Customer, 'id' | 'name'>,
  storage_locations?: Pick<StorageLocation, 'id' | 'area' | 'rack' | 'level' | 'position'>,
  customer_item_code?: string, // お客様管理番号
  scheduled_outgoing_date?: string, // 予定出庫日
  incoming_date?: string // 入庫日
};

// 入庫管理ページコンポーネント
export default function IncomingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [items, setItems] = useState<ExtendedItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ExtendedItem[]>([]);
  const [locations, setLocations] = useState<StorageLocation[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [dateFilterType, setDateFilterType] = useState<'created_at' | 'incoming_date'>('created_at');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [itemUpdates, setItemUpdates] = useState<Record<string, Partial<ExtendedItem>>>({});
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_transit' | 'in_storage'>('all');
  const printRef = useRef<HTMLDivElement>(null);

  // データの読み込み
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // テーブルが存在するか確認
        const { data: tablesData, error: tablesError } = await supabase
          .from('items')
          .select('id')
          .limit(1);
          
        if (tablesError) {
          console.error('テーブル確認エラー:', tablesError);
          throw new Error('データベーステーブルが見つかりません。システム管理者に連絡してください。');
        }
        
        // サンプルデータを使用（開発用）
        // 実際の環境では下記のコメントアウトを解除してAPIを使用
        /*
        // 入庫予定の物品を取得（status = 'in_transit'）
        const itemsData = await itemApi.getAllItems();
        const inTransitItems = itemsData.filter(item => item.status === 'in_transit');
        setItems(inTransitItems);
        
        // 空き保管場所を取得
        const locationsData = await storageLocationApi.getEmptyLocations();
        setLocations(locationsData);
        */
        
        // 開発用サンプルデータ
        const sampleItems: ExtendedItem[] = [
          {
            id: '1',
            item_code: 'ITM-001',
            name: '金型A',
            description: '自動車部品用金型',
            customer_id: '1',
            customers: { id: '1', name: '株式会社スバル' },
            size_width: 80,
            size_height: 60,
            size_depth: 40,
            weight: 120,
            status: 'in_transit' as 'in_transit',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: user?.id || '',
            customer_item_code: 'CUST-001',
            incoming_date: new Date().toISOString()
          },
          {
            id: '2',
            item_code: 'ITM-002',
            name: '金型B',
            description: '電子部品用金型',
            customer_id: '2',
            customers: { id: '2', name: '株式会社日立' },
            size_width: 50,
            size_height: 40,
            size_depth: 30,
            weight: 75,
            status: 'in_transit' as 'in_transit',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: user?.id || ''
          },
          {
            id: '3',
            item_code: 'ITM-003',
            name: '金型C',
            description: '家電部品用金型',
            customer_id: '1',
            customers: { id: '1', name: '株式会社スバル' },
            size_width: 100,
            size_height: 80,
            size_depth: 60,
            weight: 200,
            status: 'in_transit' as 'in_transit',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: user?.id || ''
          }
        ];
        
        const sampleLocations: StorageLocation[] = [
          {
            id: 'loc-1',
            area: 'A',
            rack: '1',
            level: 1,
            position: 1,
            status: 'empty' as 'empty',
            max_width: 120,
            max_height: 100,
            max_depth: 80,
            max_weight: 300,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'loc-2',
            area: 'A',
            rack: '1',
            level: 2,
            position: 1,
            status: 'empty' as 'empty',
            max_width: 120,
            max_height: 100,
            max_depth: 80,
            max_weight: 300,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'loc-3',
            area: 'B',
            rack: '2',
            level: 1,
            position: 1,
            status: 'empty' as 'empty',
            max_width: 150,
            max_height: 120,
            max_depth: 100,
            max_weight: 500,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        
        setItems(sampleItems);
        const filtered = filterItems(sampleItems);
        setFilteredItems(filtered);
        setLocations(sampleLocations);
      } catch (err) {
        console.error('データの取得に失敗しました:', err);
        setError(err instanceof Error ? err.message : 'データの取得に失敗しました。再読み込みしてください。');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  // フィルタリング関数
  const filterItems = (itemsList = items) => {
    // 日付フィルタリング
    let filtered = itemsList;
    if (selectedDate) {
      filtered = filtered.filter(item => {
        const dateToCompare = dateFilterType === 'created_at' 
          ? item.created_at.split('T')[0] 
          : item.incoming_date ? item.incoming_date.split('T')[0] : null;
        return dateToCompare === selectedDate;
      });
    }
    
    // ステータスフィルタリング
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }
    
    // テキスト検索
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(item => 
        item.item_code.toLowerCase().includes(query) ||
        item.name.toLowerCase().includes(query) ||
        item.customers?.name.toLowerCase().includes(query) ||
        (item.customer_item_code && item.customer_item_code.toLowerCase().includes(query)) ||
        (item.description && item.description.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  };
  
  // 日付フィルタータイプの変更ハンドラー
  const handleFilterTypeChange = (type: 'created_at' | 'incoming_date') => {
    setDateFilterType(type);
    const filtered = filterItems();
    setFilteredItems(filtered);
  };
  
  // 検索クエリ変更ハンドラー
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    const filtered = filterItems();
    setFilteredItems(filtered);
  };
  
  // ステータスフィルタ変更ハンドラー
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value as 'all' | 'in_transit' | 'in_storage');
    const filtered = filterItems();
    setFilteredItems(filtered);
  };

  // 日付変更ハンドラー
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    const filtered = filterItems();
    setFilteredItems(filtered);
  };

  // チェックボックス変更ハンドラー
  const handleCheckboxChange = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId) 
        : [...prev, itemId]
    );
  };

  // 保管場所割り当てハンドラー
  const handleAssignLocation = async (itemId: string, locationId: string) => {
    if (!user) return;
    
    try {
      // 開発環境用の簡易処理
      // 実際の環境では下記のコメントアウトを解除してAPIを使用
      /*
      // 物品の保管場所を更新
      await itemApi.updateItem(itemId, {
        location_id: locationId,
        status: 'in_storage'
      });
      
      // 保管場所のステータスを更新
      await storageLocationApi.updateLocation(locationId, {
        status: 'occupied',
        item_id: itemId
      });
      
      // 入庫記録を作成
      const { data, error } = await supabase
        .from('incoming_records')
        .insert([{
          item_id: itemId,
          customer_id: items.find(item => item.id === itemId)?.customer_id,
          location_id: locationId,
          received_at: new Date().toISOString(),
          received_by: user.id,
        }])
        .select();
      
      if (error) throw error;
      */
      
      // 開発環境用：ローカルステートの更新のみ
      // 選択された物品のステータスを更新
      const updatedItems = items.map(item => 
        item.id === itemId 
          ? { ...item, status: 'in_storage' as 'in_storage', location_id: locationId } 
          : item
      );
      
      // 選択された保管場所のステータスを更新
      const updatedLocations = locations.map(location => 
        location.id === locationId
          ? { ...location, status: 'occupied' as 'occupied', item_id: itemId }
          : location
      );
      
      // 成功メッセージを表示
      setSuccessMessage('入庫処理が完了しました');
      
      // 3秒後にメッセージを消す
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      
      // ステートを更新
      setItems(updatedItems);
      const inTransitItems = updatedItems.filter(item => item.status === 'in_transit');
      const filtered = filterItems(inTransitItems);
      setFilteredItems(filtered);
      
      // 空き保管場所を更新
      setLocations(updatedLocations.filter(location => location.status === 'empty'));
      
      // 選択をクリア
      setSelectedItems(prev => prev.filter(id => id !== itemId));
      
    } catch (err) {
      console.error('入庫処理に失敗しました:', err);
      setError('入庫処理に失敗しました。再試行してください。');
    }
  };

  // 一括入庫処理
  const handleBulkIncoming = async () => {
    if (selectedItems.length === 0) {
      setError('入庫する物品を選択してください');
      return;
    }
    
    if (!user) return;
    
    try {
      // 開発環境用の簡易処理
      // 実際の環境では下記のコメントアウトを解除してAPIを使用
      /*
      // 選択された各物品に対して処理
      for (const itemId of selectedItems) {
        // 適切な保管場所を見つける（サイズなどを考慮して最適な場所を選ぶロジックを実装可能）
        const item = items.find(i => i.id === itemId);
        const suitableLocation = locations[0]; // 簡易的に最初の空き場所を使用
        
        if (!item || !suitableLocation) {
          console.error(`物品ID: ${itemId} の処理に失敗しました。適切な保管場所が見つかりません。`);
          continue;
        }
        
        // 物品の保管場所を更新
        await itemApi.updateItem(itemId, {
          location_id: suitableLocation.id,
          status: 'in_storage'
        });
        
        // 保管場所のステータスを更新
        await storageLocationApi.updateLocation(suitableLocation.id, {
          status: 'occupied',
          item_id: itemId
        });
        
        // 入庫記録を作成
        await supabase
          .from('incoming_records')
          .insert([{
            item_id: itemId,
            customer_id: item.customer_id,
            location_id: suitableLocation.id,
            received_at: new Date().toISOString(),
            received_by: user.id,
          }]);
      }
      */
      
      // 開発環境用：ローカルステートの更新のみ
      let updatedItems = [...items];
      let updatedLocations = [...locations];
      
      // 選択された各物品に対して処理
      for (const itemId of selectedItems) {
        // 適切な保管場所を見つける
        const item = items.find(i => i.id === itemId);
        const locationIndex = updatedLocations.findIndex(l => l.status === 'empty');
        
        if (!item || locationIndex === -1) {
          console.error(`物品ID: ${itemId} の処理に失敗しました。適切な保管場所が見つかりません。`);
          continue;
        }
        
        const suitableLocation = updatedLocations[locationIndex];
        
        // 物品のステータスを更新
        updatedItems = updatedItems.map(i => 
          i.id === itemId 
            ? { ...i, status: 'in_storage' as 'in_storage', location_id: suitableLocation.id } 
            : i
        );
        
        // 保管場所のステータスを更新
        updatedLocations = updatedLocations.map((l, index) => 
          index === locationIndex
            ? { ...l, status: 'occupied' as 'occupied', item_id: itemId }
            : l
        );
      }
      
      // 成功メッセージを表示
      setSuccessMessage(`${selectedItems.length}件の入庫処理が完了しました`);
      
      // 3秒後にメッセージを消す
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      
      // ステートを更新
      setItems(updatedItems);
      const inTransitItems = updatedItems.filter(item => item.status === 'in_transit');
      const filtered = filterItems(inTransitItems);
      setFilteredItems(filtered);
      
      // 空き保管場所を更新
      setLocations(updatedLocations.filter(location => location.status === 'empty'));
      
      // 選択をクリア
      setSelectedItems([]);
      
    } catch (err) {
      console.error('一括入庫処理に失敗しました:', err);
      setError('一括入庫処理に失敗しました。再試行してください。');
    }
  };

  // 入庫情報の印刷
  const handlePrint = () => {
    window.print();
  };
  
  // 出庫日の更新
  const handleOutgoingDateChange = (itemId: string, date: string) => {
    setItemUpdates(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        scheduled_outgoing_date: date
      }
    }));
  };
  
  // 行の編集モードを切り替え
  const toggleEditMode = (itemId: string) => {
    setEditingItem(editingItem === itemId ? null : itemId);
    // 編集モードをキャンセルした場合は更新情報をクリア
    if (editingItem === itemId) {
      const updatedItemUpdates = { ...itemUpdates };
      delete updatedItemUpdates[itemId];
      setItemUpdates(updatedItemUpdates);
    }
  };
  
  // 行の更新を保存
  const saveRowUpdate = async (itemId: string) => {
    try {
      const itemUpdate = itemUpdates[itemId];
      if (!itemUpdate) return;
      
      // 実際の環境では下記のコメントアウトを解除してAPIを使用
      /*
      await itemApi.updateItem(itemId, itemUpdate);
      */
      
      // 開発用：ローカルステートの更新
      const updatedItems = items.map(item => 
        item.id === itemId ? { ...item, ...itemUpdate } : item
      );
      
      setItems(updatedItems);
      const filtered = filterItems();
      setFilteredItems(filtered);
      setSuccessMessage('物品情報が更新されました');
      setEditingItem(null);
      
      // 更新情報をクリア
      const updatedItemUpdates = { ...itemUpdates };
      delete updatedItemUpdates[itemId];
      setItemUpdates(updatedItemUpdates);
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('更新に失敗しました:', err);
      setError('更新に失敗しました');
      setTimeout(() => setError(null), 3000);
    }
  };
  
  // 入庫完了登録
  const handleCompleteIncoming = async (itemId: string) => {
    try {
      // 実際の環境では下記のコメントアウトを解除してAPIを使用
      /*
      await itemApi.updateItem(itemId, {
        status: 'in_storage',
        incoming_date: new Date().toISOString()
      });
      
      // 入庫記録の作成
      const item = items.find(i => i.id === itemId);
      if (item && item.location_id) {
        await incomingRecordApi.createIncomingRecord({
          item_id: itemId,
          customer_id: item.customer_id,
          location_id: item.location_id,
          received_by: user?.id || '',
          received_at: new Date().toISOString()
        });
      }
      */
      
      // 開発用：ローカルステートの更新
      const updatedItems = items.map(item => 
        item.id === itemId ? { 
          ...item, 
          status: 'in_storage' as 'in_storage',
          incoming_date: new Date().toISOString() 
        } : item
      );
      
      setItems(updatedItems);
      const filtered = filterItems();
      setFilteredItems(filtered);
      setSuccessMessage('入庫が完了しました');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('入庫完了登録に失敗しました:', err);
      setError('入庫完了登録に失敗しました');
      setTimeout(() => setError(null), 3000);
    }
  };

  // 印刷用スタイル
  const printStyles = `
    @media print {
      body * {
        visibility: hidden;
      }
      .container, .container * {
        visibility: visible;
      }
      button, select, input[type="checkbox"] {
        display: none;
      }
      .container {
        position: absolute;
        left: 0;
        top: 0;
      }
    }
  `;

  return (
    <MainLayout userRole={user?.role} userName={`${user?.first_name || ''} ${user?.last_name || ''}`}>
      <style jsx global>{printStyles}</style>
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-6">入庫情報一覧</h1>
        
        {/* エラーメッセージ */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
            <button 
              className="ml-2 text-red-700"
              onClick={() => setError(null)}
            >
              ×
            </button>
          </div>
        )}
        
        {/* 成功メッセージ */}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <p>{successMessage}</p>
          </div>
        )}
        
        {/* フィルターセクション */}
        <div className="p-6 bg-white rounded-lg shadow-md mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">検索とフィルター</h2>
          </div>
          
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="w-64">
              <label htmlFor="date-filter" className="block text-sm font-medium text-gray-700">
                日付で絞り込み
              </label>
              <div className="flex items-center space-x-2">
                <select 
                  value={dateFilterType} 
                  onChange={(e) => handleFilterTypeChange(e.target.value as 'created_at' | 'incoming_date')}
                  className="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                >
                  <option value="created_at">登録日</option>
                  <option value="incoming_date">入庫日</option>
                </select>
                <input
                  type="date"
                  id="date-filter"
                  value={selectedDate}
                  onChange={handleDateChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                />
              </div>
            </div>
            
            <div className="w-48">
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700">
                ステータス
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
              >
                <option value="all">すべて</option>
                <option value="in_transit">入庫待ち</option>
                <option value="in_storage">入庫済み</option>
              </select>
            </div>
            
            <div className="w-64">
              <label htmlFor="search-query" className="block text-sm font-medium text-gray-700">
                検索
              </label>
              <input
                type="text"
                id="search-query"
                placeholder="管理番号、品名、顧客名など"
                value={searchQuery}
                onChange={handleSearchChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
              />
            </div>
            
            <div className="flex items-end space-x-2">
              <Button onClick={handlePrint} variant="outline" size="sm">
                印刷
              </Button>
              {searchQuery && (
                <Button onClick={() => { setSearchQuery(''); const filtered = filterItems(); setFilteredItems(filtered); }} variant="outline" size="sm">
                  検索クリア
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {filteredItems.length} 件の物品が見つかりました
            </div>
            {selectedItems.length > 0 && (
              <Button onClick={handleBulkIncoming} variant="default" size="sm">
                選択した物品を一括入庫 ({selectedItems.length} 件)
              </Button>
            )}
          </div>
        </div>
        
        {/* テーブルセクション */}
        
        {/* 入庫情報テーブル */}
        {loading ? (
        <div className="text-center py-8">
          <p>データを読み込み中...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-8">
          <p>選択した日付の入庫予定はありません</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:hidden">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-green-600 border-gray-300 rounded"
                    checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                    onChange={() => {
                      if (selectedItems.length === filteredItems.length) {
                        setSelectedItems([]);
                      } else {
                        setSelectedItems(filteredItems.map(item => item.id));
                      }
                    }}
                  />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">システム管理番号</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">お客様名</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">お客様管理番号</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">品番</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名称</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">縦 (cm)</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">横 (cm)</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">高さ (cm)</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">重量 (kg)</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '200px' }}>保管予定場所</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">入庫日</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">出庫予定日</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:hidden">アクション</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item, index) => (
                <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 print:hidden">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-green-600 border-gray-300 rounded"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleCheckboxChange(item.id)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.item_code}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.customers?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingItem === item.id ? (
                      <input
                        type="text"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                        value={itemUpdates[item.id]?.customer_item_code || item.customer_item_code || ''}
                        onChange={(e) => setItemUpdates(prev => ({
                          ...prev,
                          [item.id]: { ...prev[item.id], customer_item_code: e.target.value }
                        }))}
                      />
                    ) : (
                      item.customer_item_code || '未設定'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.item_code}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.size_depth || '未設定'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.size_width || '未設定'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.size_height || '未設定'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.weight || '未設定'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" style={{ minWidth: '200px' }}>
                    <select
                      className="block w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                      onChange={(e) => handleAssignLocation(item.id, e.target.value)}
                      defaultValue=""
                      data-item-id={item.id}
                      disabled={editingItem === item.id}
                    >
                      <option value="" disabled>
                        保管場所を選択
                      </option>
                      {locations.map((location) => (
                        <option key={location.id} value={location.id}>
                          {`${location.area}-${location.rack}-${location.level}-${location.position}`}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.incoming_date ? format(new Date(item.incoming_date), 'yyyy/MM/dd') : '未入庫'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingItem === item.id ? (
                      <input
                        type="date"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                        value={itemUpdates[item.id]?.scheduled_outgoing_date || item.scheduled_outgoing_date || ''}
                        onChange={(e) => handleOutgoingDateChange(item.id, e.target.value)}
                      />
                    ) : (
                      item.scheduled_outgoing_date ? format(new Date(item.scheduled_outgoing_date), 'yyyy/MM/dd') : '未設定'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 print:hidden">
                    <div className="flex space-x-2">
                      {editingItem === item.id ? (
                        <>
                          <Button onClick={() => saveRowUpdate(item.id)} variant="default" size="sm">
                            保存
                          </Button>
                          <Button onClick={() => toggleEditMode(item.id)} variant="outline" size="sm">
                            キャンセル
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button onClick={() => toggleEditMode(item.id)} variant="outline" size="sm">
                            編集
                          </Button>
                          {item.status === 'in_transit' && (
                            <Button
                              onClick={() => {
                                const locationSelect = document.querySelector(
                                  `select[data-item-id="${item.id}"]`
                                ) as HTMLSelectElement;
                                if (locationSelect && locationSelect.value) {
                                  handleAssignLocation(item.id, locationSelect.value);
                                } else {
                                  setError('保管場所を選択してください');
                                }
                              }}
                              variant="default"
                              size="sm"
                            >
                              入庫
                            </Button>
                          )}
                          {item.location_id && item.status === 'in_transit' && (
                            <Button
                              onClick={() => handleCompleteIncoming(item.id)}
                              variant="default"
                              size="sm"
                            >
                              入庫完了
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      </div>
    </MainLayout>
  );
}
