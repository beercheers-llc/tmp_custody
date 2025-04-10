/**
 * Supabaseデータベーススキーマの型定義
 * 
 * このファイルはデータベースの構造を型として定義し、
 * TypeScriptの型安全性を確保するために使用されます。
 */

// ユーザーテーブル
export interface User {
  id: string; // UUID（Supabase Authと連携）
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'operator'; // 管理者または運用者
  department?: string; // 部署（任意）
  created_at: string;
  updated_at: string;
  last_sign_in_at?: string;
  is_active: boolean;
}

// 顧客テーブル
export interface Customer {
  id: string;
  name: string; // 会社名
  contact_person: string; // 担当者名
  email: string;
  phone: string;
  address: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by: string; // ユーザーID
}

// 物品テーブル
export interface Item {
  id: string;
  item_code: string; // 管理番号
  name: string; // 品名
  description?: string;
  customer_id: string; // 顧客ID
  size_width?: number; // 幅（cm）
  size_height?: number; // 高さ（cm）
  size_depth?: number; // 奥行き（cm）
  weight?: number; // 重量（kg）
  status: 'in_storage' | 'shipped' | 'in_transit'; // 保管中、出荷済み、移動中
  location_id?: string; // 現在の保管場所ID
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by: string; // ユーザーID
  image_url?: string; // 画像URL
}

// 保管場所テーブル
export interface StorageLocation {
  id: string;
  area: string; // エリア（A, B, C...）
  rack: string; // 棚ID（A-1, B-2...）
  level: number; // 段数
  position: number; // 位置
  status: 'empty' | 'occupied' | 'reserved'; // 空き、使用中、予約済み
  max_width: number; // 最大幅（cm）
  max_height: number; // 最大高さ（cm）
  max_depth: number; // 最大奥行き（cm）
  max_weight: number; // 最大重量（kg）
  item_id?: string; // 保管中の物品ID（ある場合）
  notes?: string;
  created_at: string;
  updated_at: string;
}

// 入庫記録テーブル
export interface IncomingRecord {
  id: string;
  item_id: string;
  customer_id: string;
  location_id: string;
  received_at: string;
  received_by: string; // ユーザーID
  notes?: string;
  created_at: string;
  updated_at: string;
}

// 出庫記録テーブル
export interface OutgoingRecord {
  id: string;
  item_id: string;
  customer_id: string;
  shipped_at: string;
  shipped_by: string; // ユーザーID
  destination: string;
  tracking_number?: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  notes?: string;
  created_at: string;
  updated_at: string;
}

// 物品移動記録テーブル
export interface MovementRecord {
  id: string;
  item_id: string;
  from_location_id: string;
  to_location_id: string;
  moved_at: string;
  moved_by: string; // ユーザーID
  reason?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// データベース全体の型定義
export interface Database {
  users: User[];
  customers: Customer[];
  items: Item[];
  storage_locations: StorageLocation[];
  incoming_records: IncomingRecord[];
  outgoing_records: OutgoingRecord[];
  movement_records: MovementRecord[];
}
