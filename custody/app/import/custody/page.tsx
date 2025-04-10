"use client";

import React, { useState, useRef, useEffect } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import * as XLSX from 'xlsx';

// CSVデータの型定義
type CustodyItem = {
  id: string; // 管理番号
  customerItemId: string; // お客様管理番号
  productNumber: string; // 品番
  name: string; // 名称
  vertical: string; // 縦
  beside: string; // 横
  height: string; // 高さ
  weight: string; // 重量
  quantity: string; // 員数
  notes: string; // 備考
  [key: string]: string; // 動的なキーのサポート
};

// ヘッダーマッピングの型定義
type HeaderMapping = {
  csvHeader: string;
  fieldName: string;
  required: boolean;
};

// 預かり品データ作成ページ
export default function CustodyImportPage() {
  // 状態管理
  const [rawData, setRawData] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [items, setItems] = useState<CustodyItem[]>([]);
  const [mappings, setMappings] = useState<HeaderMapping[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'complete'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 必須フィールドの定義（idとnotes以外は必須）
  const requiredFields = [
    'customerItemId', 
    'productNumber', 
    'name', 
    'vertical', 
    'beside', 
    'height', 
    'weight', 
    'quantity'
  ];
  
  // オプションフィールドの定義
  const optionalFields = ['notes'];
  
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
          setHeaders(headers);
          setRawData(data);
          
          // ヘッダーに基づいてマッピングを生成
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
          
          // マッピングを設定
          setMappings(initialMappings);
          
          setSuccess(`CSVファイルを読み込みました。ヘッダーマッピングを設定してください。`);
          setStep('mapping');
        } catch (err) {
          setError('CSVファイルの解析に失敗しました: ' + (err instanceof Error ? err.message : String(err)));
          setHeaders([]);
          setRawData([]);
          setMappings([]);
        } finally {
          setIsLoading(false);
        }
      };
      
      reader.onerror = () => {
        setError('ファイルの読み込みに失敗しました');
        setIsLoading(false);
      };
      
      reader.readAsText(file);
    } else if (['xlsx', 'xls', 'xlsb', 'xlsm'].includes(fileExtension || '')) {
      // Excelファイルの場合
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'array' });
          
          // 最初のシートを取得
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // シートをJSONに変換
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
          
          if (jsonData.length <= 1) {
            throw new Error('データが存在しません');
          }
          
          // ヘッダー行を取得（最初の行）
          const rawHeaders = jsonData[0].map(h => h?.toString() || '');
          
          // 空のヘッダーがあれば自動生成
          const processedHeaders = rawHeaders.map((header, index) => {
            const trimmedHeader = header.trim();
            return trimmedHeader || `column_${index + 1}`;
          });
          
          // 重複ヘッダーの処理
          const headerCounts: Record<string, number> = {};
          const uniqueHeaders = processedHeaders.map(header => {
            headerCounts[header] = (headerCounts[header] || 0) + 1;
            if (headerCounts[header] > 1) {
              return `${header}_${headerCounts[header]}`;
            }
            return header;
          });
          
          // データ行を取得（ヘッダー以外の行）
          const rows = jsonData.slice(1)
            .filter(row => row.some(cell => cell !== undefined && cell !== null && cell !== ''))
            .map(row => {
              // 各行のデータをヘッダーの数に合わせる（足りない場合は空文字で埋める）
              const processedRow = [];
              for (let i = 0; i < uniqueHeaders.length; i++) {
                processedRow[i] = row[i]?.toString() || '';
              }
              return processedRow;
            });
          
          // ヘッダーとデータを設定
          setHeaders(uniqueHeaders);
          setRawData(rows);
          
          // 初期マッピングを作成
          const initialMappings: HeaderMapping[] = uniqueHeaders.map(header => {
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
          
          setSuccess(`Excelファイルを読み込みました。ヘッダーマッピングを設定してください。`);
          setStep('mapping');
        } catch (err) {
          setError('Excelファイルの解析に失敗しました: ' + (err instanceof Error ? err.message : String(err)));
          setHeaders([]);
          setRawData([]);
          setMappings([]);
        } finally {
          setIsLoading(false);
        }
      };
      
      reader.onerror = () => {
        setError('ファイルの読み込みに失敗しました');
        setIsLoading(false);
      };
      
      reader.readAsArrayBuffer(file);
    } else {
      setError('サポートされていないファイル形式です。CSVまたはExcel（.xlsx, .xls）ファイルをアップロードしてください。');
      setIsLoading(false);
    }
  };

  // CSVデータの解析（ヘッダーと行データを返す）
  const parseCSV = (csv: string): { headers: string[], data: string[][] } => {
    const lines = csv.split('\n');
    if (lines.length <= 1) {
      throw new Error('データが存在しません');
    }

    // ヘッダー行を解析（空白や改行を除去）
    const rawHeaders = lines[0].split(',');
    
    // 空のヘッダーがあれば自動生成
    const processedHeaders = rawHeaders.map((header, index) => {
      const trimmedHeader = header.trim();
      return trimmedHeader || `column_${index + 1}`;
    });
    
    // 重複ヘッダーの処理（重複する場合は番号を付ける）
    const headerCounts: Record<string, number> = {};
    const uniqueHeaders = processedHeaders.map(header => {
      headerCounts[header] = (headerCounts[header] || 0) + 1;
      if (headerCounts[header] > 1) {
        return `${header}_${headerCounts[header]}`;
      }
      return header;
    });

    const data: string[][] = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue; // 空行をスキップ
      
      const values = lines[i].split(',').map(v => v.trim());
      
      // 値の数がヘッダーより少ない場合は空文字を追加
      if (values.length < uniqueHeaders.length) {
        while (values.length < uniqueHeaders.length) {
          values.push('');
        }
      }
      
      // 値の数がヘッダーより多い場合は切り捨て
      const processedValues = values.slice(0, uniqueHeaders.length);
      
      data.push(processedValues);
    }
    
    return { headers: uniqueHeaders, data };
  };
  
  // マッピングの更新処理
  const updateMapping = (index: number, fieldName: string) => {
    // mappingsが空の場合や未定義の場合に対応
    if (!Array.isArray(mappings)) {
      // 初期化されていない場合はヘッダーから新たに作成
      const initialMappings = headers.map(header => ({
        csvHeader: header,
        fieldName: '',
        required: false
      }));
      
      initialMappings[index] = {
        csvHeader: headers[index],
        fieldName,
        required: requiredFields.includes(fieldName)
      };
      
      setMappings(initialMappings);
      return;
    }
    
    const newMappings = [...mappings];
    newMappings[index] = {
      ...newMappings[index],
      fieldName,
      required: requiredFields.includes(fieldName)
    };
    setMappings(newMappings);
  };
  
  // 現在マッピングされているフィールドを取得
  const getMappedFields = () => {
    // mappingsが空の場合や未定義の場合は空配列を返す
    if (!Array.isArray(mappings) || mappings.length === 0) {
      return [];
    }
    // 各要素がnullやundefinedの場合もエラーにならないように安全に処理
    return mappings
      .filter(m => m != null) // nullやundefinedを除外
      .map(m => m?.fieldName || '') // 安全にフィールド名を取得
      .filter(Boolean); // 空の値を除外
  };
  
  // マッピングの検証
  const validateMappings = (): boolean => {
    // デバッグ情報を表示
    console.log('validateMappings - mappings:', mappings);
    
    // mappingsが空の場合や未定義の場合はエラー
    if (!Array.isArray(mappings)) {
      setError('マッピングが配列ではありません。ファイルを再アップロードしてください。');
      return false;
    }
    
    if (mappings.length === 0) {
      setError('マッピングが空です。ファイルを再アップロードしてください。');
      return false;
    }
    
    // 必須フィールドがすべてマッピングされているか確認
    // getMappedFieldsと同様に、空の値を除外してマッピングされたフィールドを取得
    const mappedFields = mappings
      .filter(m => m != null) // nullやundefinedを除外
      .map(m => m.fieldName || '') // 安全にフィールド名を取得
      .filter(Boolean); // 空の値を除外
    
    console.log('validateMappings - mappedFields:', mappedFields);
    console.log('validateMappings - requiredFields:', requiredFields);
    
    const missingRequiredFields = requiredFields.filter(field => !mappedFields.includes(field));
    
    if (missingRequiredFields.length > 0) {
      setError(`必須フィールド「${missingRequiredFields.join('、')}」がマッピングされていません`);
      return false;
    }
    
    // 重複するフィールドマッピングがないか確認
    const fieldCounts: Record<string, number> = {};
    for (const mapping of mappings) {
      if (mapping && mapping.fieldName) {
        fieldCounts[mapping.fieldName] = (fieldCounts[mapping.fieldName] || 0) + 1;
      }
    }
    
    const duplicateFields = Object.entries(fieldCounts)
      .filter(([_, count]) => count > 1)
      .map(([field]) => field);
    
    if (duplicateFields.length > 0) {
      setError(`フィールド「${duplicateFields.join('、')}」が複数のヘッダーにマッピングされています`);
      return false;
    }
    
    return true;
  };
  
  // マッピングを適用してアイテムを生成
  const applyMappings = () => {
    setError(null);
    setIsLoading(true);
    
    try {
      // デバッグ情報を表示
      console.log('rawData:', JSON.stringify(rawData));
      console.log('headers:', JSON.stringify(headers));
      console.log('mappings:', JSON.stringify(mappings));
      
      // 基本的なチェック
      if (!Array.isArray(rawData) || rawData.length === 0) {
        throw new Error('データが空です。ファイルを再アップロードしてください。');
      }
      
      if (!Array.isArray(mappings) || mappings.length === 0) {
        throw new Error('マッピングが設定されていません。ファイルを再アップロードしてください。');
      }
      
      // マッピングとヘッダーの関係を確認
      console.log('Headers to mappings relationship:');
      for (let i = 0; i < headers.length; i++) {
        const header = headers[i];
        const mapping = mappings.find(m => m && m.csvHeader === header);
        console.log(`Header[${i}]: '${header}' -> ${mapping ? `Field: '${mapping.fieldName}'` : 'No mapping'}`);
      }
      
      // 有効なマッピングを取得
      const validMappings = mappings.filter(m => m != null && m.fieldName && m.fieldName.trim() !== '');
      console.log('validMappings:', JSON.stringify(validMappings));
      
      if (validMappings.length === 0) {
        throw new Error('有効なマッピングがありません。少なくとも一つのフィールドを選択してください。');
      }
      
      // マッピングされたフィールド名を取得
      const mappedFieldNames = validMappings.map(m => m.fieldName);
      console.log('mappedFieldNames:', JSON.stringify(mappedFieldNames));
      
      // 必須フィールドのチェック
      const missingRequiredFields = requiredFields.filter(field => !mappedFieldNames.includes(field));
      
      if (missingRequiredFields.length > 0) {
        throw new Error(`必須フィールド「${missingRequiredFields.join('、')}」がマッピングされていません`);
      }
      
      // 重複フィールドのチェック
      const fieldCounts: Record<string, number> = {};
      for (const mapping of validMappings) {
        fieldCounts[mapping.fieldName] = (fieldCounts[mapping.fieldName] || 0) + 1;
      }
      
      const duplicateFields = Object.entries(fieldCounts)
        .filter(([_, count]) => count > 1)
        .map(([field]) => field);
      
      if (duplicateFields.length > 0) {
        throw new Error(`フィールド「${duplicateFields.join('、')}」が複数のヘッダーにマッピングされています`);
      }
      
      // データのマッピング処理
      const mappedItems: CustodyItem[] = [];
      
      // ヘッダーとフィールドのマッピングを事前に作成
      const headerToFieldMap: Record<number, string> = {};
      
      for (let colIndex = 0; colIndex < headers.length; colIndex++) {
        const header = headers[colIndex];
        const mapping = mappings.find(m => m && m.csvHeader === header);
        
        if (mapping && mapping.fieldName && mapping.fieldName.trim() !== '') {
          headerToFieldMap[colIndex] = mapping.fieldName;
          console.log(`Column ${colIndex} with header '${header}' maps to field '${mapping.fieldName}'`);
        }
      }
      
      // 各行のデータを処理
      for (let rowIndex = 0; rowIndex < rawData.length; rowIndex++) {
        const row = rawData[rowIndex];
        console.log(`Processing row ${rowIndex + 1}:`, JSON.stringify(row));
        
        // 初期値を設定
        const item: CustodyItem = {
          id: '',
          customerItemId: '',
          productNumber: '',
          name: '',
          vertical: '',
          beside: '',
          height: '',
          weight: '',
          quantity: '',
          notes: ''
        };
        
        // 各カラムの値をマッピングに従って設定
        for (let colIndex = 0; colIndex < row.length; colIndex++) {
          const fieldName = headerToFieldMap[colIndex];
          
          if (fieldName) {
            const value = row[colIndex];
            // nullやundefinedの場合は空文字を設定
            item[fieldName] = value !== null && value !== undefined ? value : '';
            console.log(`Row ${rowIndex + 1}, Col ${colIndex}: Setting ${fieldName} = '${item[fieldName]}'`);
          }
        }
        
        console.log(`Row ${rowIndex + 1} mapped item:`, JSON.stringify(item));
        
        // 必須フィールドの存在確認とデフォルト値の設定
        for (const field of requiredFields) {
          // 値がundefined、null、空文字、または空白文字のみの場合
          const value = item[field];
          const isEmpty = value === undefined || value === null || value.toString().trim() === '';
          
          if (isEmpty) {
            console.log(`Row ${rowIndex + 1}: Required field '${field}' is empty, setting default value`);
            
            // フィールドに応じたデフォルト値を設定
            switch (field) {
              case 'vertical':
              case 'beside':
              case 'height':
              case 'weight':
                item[field] = '0';
                break;
              case 'quantity':
                item[field] = '1';
                break;
              default:
                // 他の必須フィールドは空のまま許容しない
                console.error(`Row ${rowIndex + 1}: Required field '${field}' is empty or whitespace only. Value: '${value}'`);
                throw new Error(`${rowIndex + 2}行目: 必須フィールド「${field}」の値が空です`);
            }
            
            console.log(`Row ${rowIndex + 1}: Set default value for '${field}' = '${item[field]}'`);
          }
        }
        
        mappedItems.push(item);
      }
      
      // 結果を設定
      setItems(mappedItems);
      setStep('preview');
      setSuccess(`${mappedItems.length}件のデータをマッピングしました`);
    } catch (error) {
      console.error('Error in applyMappings:', error);
      setError(`データのマッピング中にエラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // データの登録処理
  const handleSubmit = async () => {
    if (items.length === 0) {
      setError('登録するデータがありません');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // ここでAPIを呼び出してデータを登録する
      // 実際の実装では、APIクライアントを使用してデータを送信する
      
      // IDが空の場合はシステムで自動採番されることをログに出力
      const itemsWithAutoId = items.map(item => {
        if (!item.id) {
          console.log('管理IDが空のため、システムで自動採番されます');
          // 実際の実装では、サーバー側でIDが自動生成される
          return { ...item };
        }
        return item;
      });
      
      // 例: await apiClient.createCustodyItems(itemsWithAutoId);
      
      // モックの成功レスポンス
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(`${items.length}件のデータを登録しました`);
      setStep('complete');
      
      // 全ての状態をリセット
      setTimeout(() => {
        setItems([]);
        setRawData([]);
        setHeaders([]);
        setMappings([]);
        setStep('upload');
        
        // ファイル入力をリセット
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 3000); // 3秒後にリセット
    } catch (err) {
      setError('データの登録に失敗しました: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  // ファイル選択をリセット
  const handleReset = () => {
    setItems([]);
    setRawData([]);
    setHeaders([]);
    setMappings([]);
    setError(null);
    setSuccess(null);
    setStep('upload');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // マッピング画面に戻る
  const backToMapping = () => {
    setError(null);
    setSuccess(null);
    setStep('mapping');
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">預かり品データ作成</h1>
          <p className="text-gray-600">CSVファイルから預かり品データを一括登録できます</p>
        </div>
        
        {/* ステップナビゲーション */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div className={`flex-1 text-center pb-2 ${step === 'upload' ? 'border-b-2 border-green-500 text-green-600 font-medium' : 'border-b text-gray-500'}`}>
              1. CSVファイルのアップロード
            </div>
            <div className={`flex-1 text-center pb-2 ${step === 'mapping' ? 'border-b-2 border-green-500 text-green-600 font-medium' : 'border-b text-gray-500'}`}>
              2. ヘッダーマッピング
            </div>
            <div className={`flex-1 text-center pb-2 ${step === 'preview' ? 'border-b-2 border-green-500 text-green-600 font-medium' : 'border-b text-gray-500'}`}>
              3. データ確認
            </div>
            <div className={`flex-1 text-center pb-2 ${step === 'complete' ? 'border-b-2 border-green-500 text-green-600 font-medium' : 'border-b text-gray-500'}`}>
              4. 登録完了
            </div>
          </div>
        </div>

        {/* ファイルアップロード部分 */}
        {step === 'upload' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">CSVファイルのアップロード</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="csv-file" className="block text-sm font-medium text-gray-700 mb-1">
                  CSVまたはExcelファイル
                </label>
                <input
                  type="file"
                  id="csv-file"
                  accept=".csv,.xlsx,.xls,.xlsb,.xlsm"
                  onChange={handleFileUpload}
                  ref={fileInputRef}
                  disabled={isLoading}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-green-50 file:text-green-700
                    hover:file:bg-green-100"
                />
              </div>
              
              <div className="text-sm text-gray-600">
                <p>ファイル形式:</p>
                <ul className="list-disc list-inside ml-2">
                  <li>CSV形式（文字コード: UTF-8、カンマ区切り）</li>
                  <li>Excel形式（.xlsx, .xls, .xlsb, .xlsm）</li>
                  <li>必須項目: お客様管理番号、品番、名称、縦、横、高さ、重量、員数</li>
                  <li>任意項目: 備考</li>
                  <li>管理番号はシステムが自動採番します</li>
                </ul>
              </div>
              
              {isLoading && (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                  <span className="ml-2 text-gray-600">処理中...</span>
                </div>
              )}
              
              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-md">
                  {error}
                </div>
              )}
              
              {success && step === 'upload' && (
                <div className="p-3 bg-green-50 text-green-700 rounded-md">
                  {success}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* ヘッダーマッピング部分 */}
        {step === 'mapping' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">ヘッダーマッピング</h2>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                CSVファイルの各ヘッダーをシステムのフィールドにマッピングしてください。
                <span className="text-red-600 font-medium">必須フィールド</span>は必ずマッピングしてください。
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
                    {headers.length > 0 ? (
                      // ヘッダーがあれば全て表示
                      headers.map((header, index) => {
                        // 各ヘッダーに対応するマッピングを取得
                        // mappingsが空の場合や未定義の場合に対応
                        const mapping = Array.isArray(mappings) && mappings.length > 0 ? 
                          (mappings.find(m => m && m.csvHeader === header) || {
                            csvHeader: header,
                            fieldName: '',
                            required: false
                          }) : {
                            csvHeader: header,
                            fieldName: '',
                            required: false
                          };
                        
                        return (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {header}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <select
                                value={mapping.fieldName}
                                onChange={(e) => updateMapping(index, e.target.value)}
                                className={`w-full px-3 py-2 border ${mapping.required && !mapping.fieldName ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500`}
                              >
                                <option value="">使用しない</option>
                                <optgroup label="必須フィールド">
                                  {requiredFields.map(field => (
                                    <option key={field} value={field}>
                                      {field === 'id' ? '管理番号' : 
                                       field === 'customerItemId' ? 'お客様管理番号' : 
                                       field === 'productNumber' ? '品番' : 
                                       field === 'name' ? '名称' : 
                                       field === 'vertical' ? '縦' : 
                                       field === 'beside' ? '横' : 
                                       field === 'height' ? '高さ' : 
                                       field === 'weight' ? '重量' : 
                                       field === 'quantity' ? '員数' : 
                                       field === 'notes' ? '備考' : field}
                                      {getMappedFields().includes(field) && field !== mapping.fieldName && ' (他で使用中)'}
                                    </option>
                                  ))}
                                </optgroup>
                                <optgroup label="任意フィールド">
                                  {optionalFields.map(field => (
                                    <option key={field} value={field}>
                                      {field === 'notes' ? '備考' : field}
                                      {getMappedFields().includes(field) && field !== mapping.fieldName && ' (他で使用中)'}
                                    </option>
                                  ))}
                                </optgroup>
                              </select>
                              {mapping.required && !mapping.fieldName && (
                                <p className="mt-1 text-xs text-red-600">必須フィールドを選択してください</p>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {rawData.length > 0 ? rawData[0][index] || '-' : '-'}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      // ヘッダーがない場合はメッセージを表示
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                          CSVファイルが読み込まれていません
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-md">
                  {error}
                </div>
              )}
              
              {success && step === 'mapping' && (
                <div className="p-3 bg-green-50 text-green-700 rounded-md">
                  {success}
                </div>
              )}
              
              <div className="flex justify-between mt-4">
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
                  onClick={applyMappings}
                  className="px-4 py-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  disabled={isLoading}
                >
                  {isLoading ? '処理中...' : 'マッピングを適用する'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* データプレビュー部分 */}
        {step === 'preview' && items.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md overflow-hidden">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">データプレビュー</h2>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                以下のデータを登録します。内容を確認してください。
                合計: <span className="font-medium">{items.length}</span> 件
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      お客様管理番号
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      品番
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      名称
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      縦
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      横
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      高さ
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      重量
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      員数
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      備考
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.slice(0, 10).map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.customerItemId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.productNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.vertical}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.beside}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.height}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.weight}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {items.length > 10 && (
                <p className="mt-2 text-sm text-gray-500">
                  他 {items.length - 10} 件のデータがあります
                </p>
              )}
            </div>
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
                {error}
              </div>
            )}
            
            {success && step === 'preview' && (
              <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md">
                {success}
              </div>
            )}
            
            <div className="mt-4 flex justify-between space-x-2">
              <div>
                <button
                  type="button"
                  onClick={backToMapping}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  disabled={isLoading}
                >
                  マッピングに戻る
                </button>
              </div>
              <div className="flex space-x-2">
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
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">使い方ガイド</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-md font-medium text-gray-700">1. CSVファイルの準備</h3>
              <p className="text-sm text-gray-600">
                以下の項目を含むCSVファイルを準備してください。
              </p>
              <ul className="list-disc list-inside ml-2 text-sm text-gray-600">
                <li>customerItemId: お客様管理番号（必須）</li>
                <li>productNumber: 品番（必須）</li>
                <li>name: 名称（必須）</li>
                <li>vertical: 縦（必須）</li>
                <li>beside: 横（必須）</li>
                <li>height: 高さ（必須）</li>
                <li>weight: 重量（必須）</li>
                <li>quantity: 員数（必須）</li>
                <li>notes: 備考（任意）</li>
                <li>管理番号（id）はシステムが自動採番します</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-md font-medium text-gray-700">2. ファイルのアップロード</h3>
              <p className="text-sm text-gray-600">
                「ファイルを選択」ボタンをクリックして、準備したCSVファイルを選択してください。
              </p>
            </div>
            
            <div>
              <h3 className="text-md font-medium text-gray-700">3. データの確認</h3>
              <p className="text-sm text-gray-600">
                アップロードしたデータのプレビューが表示されます。内容を確認してください。
              </p>
            </div>
            
            <div>
              <h3 className="text-md font-medium text-gray-700">4. データの登録</h3>
              <p className="text-sm text-gray-600">
                「データを登録する」ボタンをクリックして、データを登録します。
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
