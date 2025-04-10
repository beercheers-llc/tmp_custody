import { createClient } from '@supabase/supabase-js';
import { Database, User, Customer, Item, StorageLocation } from '../schema';

// Supabaseクライアントの初期化
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * ユーザー関連の操作
 */
export const userApi = {
  /**
   * 現在のログインユーザー情報を取得
   */
  getCurrentUser: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    if (error) throw error;
    return data as User;
  },
  
  /**
   * 全ユーザーリストを取得（管理者用）
   */
  getAllUsers: async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as User[];
  },
  
  /**
   * 新規ユーザーを作成（管理者用）
   */
  createUser: async (userData: Partial<User>, password: string) => {
    // 1. Supabase Authでユーザーを作成
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email!,
      password,
      email_confirm: true,
    });
    
    if (authError) throw authError;
    
    // 2. ユーザープロファイルを作成
    const { data, error } = await supabase
      .from('users')
      .insert([{
        id: authData.user!.id,
        email: userData.email!,
        first_name: userData.first_name!,
        last_name: userData.last_name!,
        role: userData.role || 'operator',
        department: userData.department,
        is_active: true,
      }])
      .select()
      .single();
    
    if (error) {
      // ロールバック：Authユーザーを削除
      await supabase.auth.admin.deleteUser(authData.user!.id);
      throw error;
    }
    
    return data as User;
  },
  
  /**
   * ユーザー情報を更新
   */
  updateUser: async (userId: string, userData: Partial<User>) => {
    const { data, error } = await supabase
      .from('users')
      .update({
        first_name: userData.first_name,
        last_name: userData.last_name,
        department: userData.department,
        role: userData.role,
        is_active: userData.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data as User;
  },
};

/**
 * 顧客関連の操作
 */
export const customerApi = {
  /**
   * 全顧客リストを取得
   */
  getAllCustomers: async () => {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data as Customer[];
  },
  
  /**
   * 顧客情報を取得
   */
  getCustomerById: async (customerId: string) => {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single();
    
    if (error) throw error;
    return data as Customer;
  },
  
  /**
   * 新規顧客を作成
   */
  createCustomer: async (customerData: Partial<Customer>, userId: string) => {
    const { data, error } = await supabase
      .from('customers')
      .insert([{
        ...customerData,
        created_by: userId,
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data as Customer;
  },
  
  /**
   * 顧客情報を更新
   */
  updateCustomer: async (customerId: string, customerData: Partial<Customer>) => {
    const { data, error } = await supabase
      .from('customers')
      .update({
        ...customerData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', customerId)
      .select()
      .single();
    
    if (error) throw error;
    return data as Customer;
  },
};

/**
 * 物品関連の操作
 */
export const itemApi = {
  /**
   * 全物品リストを取得
   */
  getAllItems: async () => {
    const { data, error } = await supabase
      .from('items')
      .select(`
        *,
        customers (id, name),
        storage_locations (id, area, rack, level, position)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as (Item & { customers: Pick<Customer, 'id' | 'name'>, storage_locations: Pick<StorageLocation, 'id' | 'area' | 'rack' | 'level' | 'position'> })[];
  },
  
  /**
   * 物品情報を取得
   */
  getItemById: async (itemId: string) => {
    const { data, error } = await supabase
      .from('items')
      .select(`
        *,
        customers (id, name, contact_person, email, phone),
        storage_locations (id, area, rack, level, position, status)
      `)
      .eq('id', itemId)
      .single();
    
    if (error) throw error;
    return data as (Item & { customers: Pick<Customer, 'id' | 'name' | 'contact_person' | 'email' | 'phone'>, storage_locations: Pick<StorageLocation, 'id' | 'area' | 'rack' | 'level' | 'position' | 'status'> });
  },
  
  /**
   * 新規物品を作成
   */
  createItem: async (itemData: Partial<Item>, userId: string) => {
    const { data, error } = await supabase
      .from('items')
      .insert([{
        ...itemData,
        created_by: userId,
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data as Item;
  },
  
  /**
   * 物品情報を更新
   */
  updateItem: async (itemId: string, itemData: Partial<Item>) => {
    const { data, error } = await supabase
      .from('items')
      .update({
        ...itemData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', itemId)
      .select()
      .single();
    
    if (error) throw error;
    return data as Item;
  },
};

/**
 * 保管場所関連の操作
 */
export const storageLocationApi = {
  /**
   * 全保管場所リストを取得
   */
  getAllLocations: async () => {
    const { data, error } = await supabase
      .from('storage_locations')
      .select('*')
      .order('area', { ascending: true })
      .order('rack', { ascending: true })
      .order('level', { ascending: true })
      .order('position', { ascending: true });
    
    if (error) throw error;
    return data as StorageLocation[];
  },
  
  /**
   * 空き保管場所リストを取得
   */
  getEmptyLocations: async () => {
    const { data, error } = await supabase
      .from('storage_locations')
      .select('*')
      .eq('status', 'empty')
      .order('area', { ascending: true })
      .order('rack', { ascending: true })
      .order('level', { ascending: true })
      .order('position', { ascending: true });
    
    if (error) throw error;
    return data as StorageLocation[];
  },
  
  /**
   * 保管場所情報を取得
   */
  getLocationById: async (locationId: string) => {
    const { data, error } = await supabase
      .from('storage_locations')
      .select(`
        *,
        items (id, item_code, name, customer_id, customers(id, name))
      `)
      .eq('id', locationId)
      .single();
    
    if (error) throw error;
    return data as StorageLocation;
  },
  
  /**
   * 保管場所を更新
   */
  updateLocation: async (locationId: string, locationData: Partial<StorageLocation>) => {
    const { data, error } = await supabase
      .from('storage_locations')
      .update({
        ...locationData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', locationId)
      .select()
      .single();
    
    if (error) throw error;
    return data as StorageLocation;
  },
};

// エクスポート
export { supabase };
