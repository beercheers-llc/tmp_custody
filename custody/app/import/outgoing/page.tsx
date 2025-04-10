"use client";

import React, { useState, useRef, useEffect } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import * as XLSX from 'xlsx';

// 出庫品データの型定義
type OutgoingItem = {
  id: string; // 管理番号（システム内部で使用）
  customerItemId: string; // お客様管理番号（必須）
  destination: string; // 納品先（必須）
  requestedDate: string; // 出庫希望日（必須）
  notes: string; // 備考（任意）
  [key: string]: string; // 動的なキーのサポート
};

// ヘッダーマッピングの型定義
type HeaderMapping = {
  csvHeader: string;
  fieldName: string;
  required: boolean;
};

// 出庫品データ作成ページ
export default function OutgoingImportPage() {
  // 状態管理
  const [rawData, setRawData] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [items, setItems] = useState<OutgoingItem[]>([]);
  const [mappings, setMappings] = useState<HeaderMapping[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'complete'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 必須フィールドの定義
  const requiredFields = [
    'customerItemId', // お客様管理番号
    'destination',    // 納品先
    'requestedDate'   // 出庫希望日
  ];
  
  // オプションフィールドの定義
  const optionalFields = ['notes']; // 備考
  
  // 全フィールドの定義
  const allFields = [...requiredFields, ...optionalFields];

  // デフォルトのマッピングを設定
  useEffect(() => {
    if (headers.length > 0) {
      // 必ず新しいマッピングを生成する
      const initialMappings: HeaderMapping[] = headers.map(header => {
        // ヘッダー名が一致するフィールドを探す
        const matchingField = allFields.find(field => 
          field.toLowerCase() === header.toLowerCase() ||
          field.toLowerCase().replace(/[_\s]/g, '') === header.toLowerCase().replace(/[_\s]/g, '')
        );
        
        return {
          csvHeader: header,
          fieldName: matchingField || '',
          required: requiredFields.includes(matchingField || '')
        };
      });
      
      setMappings(initialMappings);
    }
  }, [headers]);

  // ファイルアップロード処理（CSVまたはExcel）
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setStep('upload');

    // ファイル拡張子を取得
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (fileExtension === 'csv') {
      // CSVファイルの場合
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csv = e.target?.result as string;
          const { headers, data } = parseCSV(csv);
          
          // ヘッダーとデータを設定
          setHeaders(excelHeaders);
          setRawData(excelData);
          
          // ステップをマッピングに進める
          setStep('mapping');
          setIsLoading(false);
        } catch (err) {
          console.error('CSVパースエラー:', err);
          setError('CSVファイルの解析中にエラーが発生しました。ファイル形式を確認してください。');
          setIsLoading(false);
        }
      };
      reader.onerror = () => {
        setError('ファイルの読み込み中にエラーが発生しました。');
        setIsLoading(false);
      };
      reader.readAsText(file);
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      // Excelファイルの場合
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const excelBuffer = e.target?.result;
          const workbook = XLSX.read(excelBuffer, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // シートデータをJSONに変換
          const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { header: 1 });
          
          if (jsonData.length < 2) {
            throw new Error('データが不足しています。ヘッダー行とデータ行が必要です。');
          }
          
          // ヘッダー行を取得
          const excelHeaders = jsonData[0] as string[];
          
          // データ行を取得（ヘッダー行を除く）
          const excelData = jsonData.slice(1).map(row => {
            // 各行を文字列の配列に変換
            return (row as any[]).map(cell => {
              if (cell === undefined || cell === null) return '';
              return String(cell);
            });
          });
          
          // ヘッダーとデータを設定
          setHeaders(excelHeaders);
          setRawData(excelData);
          
          // ステップをマッピングに進める
          setStep('mapping');
          setIsLoading(false);
        } catch (err) {
          console.error('Excelパースエラー:', err);
          setError('Excelファイルの解析中にエラーが発生しました。ファイル形式を確認してください。');
          setIsLoading(false);
        }
      };
      reader.onerror = () => {
        setError('ファイルの読み込み中にエラーが発生しました。');
        setIsLoading(false);
      };
      reader.readAsArrayBuffer(file);
    } else {
      setError('サポートされていないファイル形式です。CSVまたはExcelファイルをアップロードしてください。');
      setIsLoading(false);
    }
  };

  // CSVデータの解析（ヘッダーと行データを返す）
  const parseCSV = (csv: string): { headers: string[], data: string[][] } => {
    // 改行コードを正規化
    const normalizedCSV = csv.replace(/\r\n|\r/g, '\n');
    
    // 行に分割
    const rows = normalizedCSV.split('\n');
    
    // 空行を除去
    const nonEmptyRows = rows.filter(row => row.trim() !== '');
    
    if (nonEmptyRows.length < 2) {
      throw new Error('データが不足しています。ヘッダー行とデータ行が必要です。');
    }
    
    // ヘッダー行を解析
    const headerRow = nonEmptyRows[0];
    const headers = parseCSVRow(headerRow);
    
    // データ行を解析
    const data = nonEmptyRows.slice(1).map(row => parseCSVRow(row));
    
    return { headers, data };
  };
  
  // CSV行を解析（カンマ区切りの値を配列に変換）
  const parseCSVRow = (row: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      
      if (char === '"') {
        // 引用符の処理
        if (inQuotes && i + 1 < row.length && row[i + 1] === '"') {
          // エスケープされた引用符
          current += '"';
          i++; // 次の引用符をスキップ
        } else {
          // 引用符の開始または終了
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // フィールドの区切り
        result.push(current);
        current = '';
      } else {
        // 通常の文字
        current += char;
      }
    }
    
    // 最後のフィールドを追加
    result.push(current);
    
    return result;
  };

  // マッピングの更新処理
  const updateMapping = (index: number, fieldName: string) => {
    setMappings(prevMappings => {
      const newMappings = [...prevMappings];
      newMappings[index] = {
        ...newMappings[index],
        fieldName,
        required: requiredFields.includes(fieldName)
      };
      return newMappings;
    });
  };

  // 現在マッピングされているフィールドを取得
  const getMappedFields = () => {
    return mappings
      .filter(mapping => mapping.fieldName !== '')
      .map(mapping => mapping.fieldName);
  };

  // マッピングの検証
  const validateMappings = (): boolean => {
    // 必須フィールドが全てマッピングされているか確認
    const mappedFields = getMappedFields();
    const missingRequiredFields = requiredFields.filter(
      field => !mappedFields.includes(field)
    );
    
    if (missingRequiredFields.length > 0) {
      const missingFieldNames = missingRequiredFields.map(field => {
        switch (field) {
          case 'customerItemId': return 'お客様管理番号';
          case 'destination': return '納品先';
          case 'requestedDate': return '出庫希望日';
          default: return field;
        }
      });
      
      setError(`以下の必須フィールドがマッピングされていません: ${missingFieldNames.join(', ')}`);
      return false;
    }
    
    // 重複するマッピングがないか確認
    const fieldCounts: Record<string, number> = {};
    mappings.forEach(mapping => {
      if (mapping.fieldName) {
        fieldCounts[mapping.fieldName] = (fieldCounts[mapping.fieldName] || 0) + 1;
      }
    });
    
    const duplicateFields = Object.entries(fieldCounts)
      .filter(([_, count]) => count > 1)
      .map(([field, _]) => {
        switch (field) {
          case 'customerItemId': return 'お客様管理番号';
          case 'destination': return '納品先';
          case 'requestedDate': return '出庫希望日';
          case 'notes': return '備考';
          default: return field;
        }
      });
    
    if (duplicateFields.length > 0) {
      setError(`以下のフィールドが重複してマッピングされています: ${duplicateFields.join(', ')}`);
      return false;
    }
    
    return true;
  };

  // マッピングを適用してアイテムを生成
  const applyMappings = () => {
    try {
      // 各行のデータをマッピングに基づいてオブジェクトに変換
      const mappedItems: OutgoingItem[] = rawData.map((row, rowIndex) => {
        const item: OutgoingItem = {
          id: `temp-${rowIndex}`, // 一時的なID
          customerItemId: '',
          destination: '',
          requestedDate: '',
          notes: ''
        };
        
        // 各フィールドをマッピングに基づいて設定
        mappings.forEach((mapping, colIndex) => {
          if (mapping.fieldName && colIndex < row.length) {
            item[mapping.fieldName] = row[colIndex];
          }
        });
        
        return item;
      });
      
      // 日付形式の検証
      const dateRegex = /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/;
      const invalidDateItems = mappedItems.filter(
        item => !dateRegex.test(item.requestedDate)
      );
      
      if (invalidDateItems.length > 0) {
        setError(`出庫希望日の形式が正しくありません。YYYY/MM/DD または YYYY-MM-DD 形式で入力してください。`);
        return false;
      }
      
      // アイテムを設定
      setItems(mappedItems);
      setError(null);
      return true;
    } catch (err) {
      console.error('マッピング適用エラー:', err);
      setError('データのマッピング中にエラーが発生しました。');
      return false;
    }
  };

  // データの登録処理
  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // ここで実際のAPIを呼び出してデータを登録
      // 開発中はモックデータを使用
      
      // 成功メッセージを表示
      setSuccess(`${items.length}件の出庫予定データを登録しました。`);
      setStep('complete');
      
      // 3秒後にダッシュボードに遷移
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 3000);
    } catch (err) {
      console.error('データ登録エラー:', err);
      setError('データの登録中にエラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  };

  // ファイル選択をリセット
  const handleReset = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setRawData([]);
    setHeaders([]);
    setItems([]);
    setMappings([]);
    setError(null);
    setSuccess(null);
    setStep('upload');
  };

  // マッピング画面に戻る
  const backToMapping = () => {
    setStep('mapping');
    setError(null);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">出庫品データ作成</h1>
        
        {/* エラーメッセージ */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p>{error}</p>
          </div>
        )}
        
        {/* 成功メッセージ */}
        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
            <p>{success}</p>
          </div>
        )}
        
        {/* ファイルアップロード画面 */}
        {step === 'upload' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">CSVファイルをアップロード</h2>
            <p className="text-sm text-gray-600 mb-4">
              出庫品データのCSVファイルをアップロードしてください。
            </p>
            
            <div className="mt-4">
              <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
                ファイルを選択
              </label>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                ref={fileInputRef}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-green-50 file:text-green-700
                  hover:file:bg-green-100"
                disabled={isLoading}
              />
              <p className="mt-1 text-xs text-gray-500">
                CSVまたはExcel形式のファイルをアップロードしてください。
              </p>
            </div>
            
            {isLoading && (
              <div className="flex justify-center items-center mt-4">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>ファイルを処理中...</span>
              </div>
            )}
          </div>
        )}
        
        {/* ヘッダーマッピング画面 */}
        {step === 'mapping' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">ヘッダーマッピング</h2>
            <p className="text-sm text-gray-600 mb-4">
              CSVファイルのヘッダーとシステムのフィールドをマッピングしてください。
            </p>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CSVヘッダー
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      システムフィールド
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      サンプルデータ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mappings.map((mapping, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {mapping.csvHeader}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <select
                          value={mapping.fieldName}
                          onChange={(e) => updateMapping(index, e.target.value)}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                        >
                          <option value="">選択してください</option>
                          {allFields.map((field) => (
                            <option 
                              key={field} 
                              value={field}
                              disabled={getMappedFields().includes(field) && mapping.fieldName !== field}
                            >
                              {field === 'customerItemId' && 'お客様管理番号'}
                              {field === 'destination' && '納品先'}
                              {field === 'requestedDate' && '出庫希望日'}
                              {field === 'notes' && '備考'}
                            </option>
                          ))}
                        </select>
                        {mapping.required && (
                          <span className="text-xs text-red-500 ml-1">*必須</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {rawData[0] && rawData[0][index] ? rawData[0][index] : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={() => {
                  setStep('upload');
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                戻る
              </button>
              <button
                type="button"
                onClick={() => {
                  // マッピングの検証と適用
                  if (validateMappings()) {
                    applyMappings();
                    setStep('preview');
                  }
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                次へ
              </button>
            </div>
          </div>
        )}
        
        {/* データプレビュー画面 */}
        {step === 'preview' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">データプレビュー</h2>
            <p className="text-sm text-gray-600 mb-4">
              以下の内容で出庫予定データを登録します。内容を確認してください。
            </p>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      お客様管理番号
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      納品先
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      出庫希望日
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      備考
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.customerItemId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.destination}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.requestedDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.notes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={backToMapping}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                disabled={isLoading}
              >
                戻る
              </button>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  disabled={isLoading}
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  disabled={isLoading}
                >
                  {isLoading ? '処理中...' : 'データを登録する'}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* 登録完了画面 */}
        {step === 'complete' && (
          <div className="bg-white p-6 rounded-lg shadow-md overflow-hidden">
            <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">登録完了</h2>
              <p className="text-gray-600 mb-4">{success}</p>
              <p className="text-sm text-gray-500">自動的にトップページに戻ります...</p>
            </div>
          </div>
        )}
        
        {/* 使い方ガイド */}
        <div className="bg-white p-6 rounded-lg shadow-md mt-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">使い方ガイド</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-md font-medium text-gray-700">1. CSVファイルの準備</h3>
              <p className="text-sm text-gray-600">
                以下の項目を含むCSVファイルを準備してください。
              </p>
              <ul className="list-disc list-inside ml-2 text-sm text-gray-600">
                <li>customerItemId: お客様管理番号（必須）</li>
                <li>destination: 納品先（必須）</li>
                <li>requestedDate: 出庫希望日（必須、YYYY/MM/DD形式）</li>
                <li>notes: 備考（任意）</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-md font-medium text-gray-700">2. ファイルのアップロード</h3>
              <p className="text-sm text-gray-600">
                「ファイルを選択」ボタンをクリックして、準備したCSVファイルを選択してください。
              </p>
            </div>
            
            <div>
              <h3 className="text-md font-medium text-gray-700">3. ヘッダーマッピング</h3>
              <p className="text-sm text-gray-600">
                CSVファイルのヘッダーとシステムのフィールドをマッピングしてください。
              </p>
            </div>
            
            <div>
              <h3 className="text-md font-medium text-gray-700">4. データの確認</h3>
              <p className="text-sm text-gray-600">
                アップロードしたデータのプレビューが表示されます。内容を確認してください。
              </p>
            </div>
            
            <div>
              <h3 className="text-md font-medium text-gray-700">5. データの登録</h3>
              <p className="text-sm text-gray-600">
                「データを登録する」ボタンをクリックして、出庫予定データを登録します。
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
