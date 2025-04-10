-- 管理者ユーザーの作成（Supabase Auth UIから作成後、IDを取得して入力）
INSERT INTO public.users (id, email, first_name, last_name, role, department)
VALUES 
  ('a2700c51-9e06-4c94-9940-e20a30ec7364', 'm.nakano@beercheers-llc.com', '管理者', '太郎', 'admin', '情報システム部');

-- 顧客データ
INSERT INTO public.customers (name, contact_person, email, phone, address, created_by)
VALUES 
  ('株式会社テクノ工業', '山田健太', 'yamada@techno.example.com', '03-1234-5678', '東京都港区芝浦3-4-1', (SELECT id FROM public.users LIMIT 1)),
  ('ファクトリー株式会社', '佐藤誠', 'sato@factory.example.com', '06-8765-4321', '大阪府大阪市北区梅田1-2-3', (SELECT id FROM public.users LIMIT 1));

-- 保管場所データ
INSERT INTO public.storage_locations (area, rack, level, position, status, max_width, max_height, max_depth, max_weight)
VALUES 
  ('A', '1', 1, 1, 'empty', 120, 100, 80, 500),
  ('A', '1', 2, 1, 'empty', 120, 100, 80, 500),
  ('A', '2', 1, 1, 'empty', 120, 100, 80, 500),
  ('B', '1', 1, 1, 'empty', 150, 120, 100, 800),
  ('B', '1', 2, 1, 'empty', 150, 120, 100, 800),
  ('B', '2', 1, 1, 'empty', 150, 120, 100, 800);

-- 物品データ
INSERT INTO public.items (item_code, name, description, customer_id, size_width, size_height, size_depth, weight, status, created_by)
VALUES 
  ('ITM-001', '金型A', 'プラスチック射出成形用金型', (SELECT id FROM public.customers WHERE name = '株式会社テクノ工業' LIMIT 1), 60, 50, 40, 120, 'in_transit', (SELECT id FROM public.users LIMIT 1)),
  ('ITM-002', '金型B', '金属プレス用金型', (SELECT id FROM public.customers WHERE name = '株式会社テクノ工業' LIMIT 1), 50, 40, 30, 75, 'in_transit', (SELECT id FROM public.users LIMIT 1)),
  ('ITM-003', '治具C', '組立用治具', (SELECT id FROM public.customers WHERE name = 'ファクトリー株式会社' LIMIT 1), 100, 80, 60, 200, 'in_transit', (SELECT id FROM public.users LIMIT 1));