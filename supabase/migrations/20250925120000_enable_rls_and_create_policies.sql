-- 1. RLS (Row Level Security) をテーブルで有効化
ALTER TABLE public.cues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_state ENABLE ROW LEVEL SECURITY;

-- 2. cues テーブルに対するポリシーを作成
-- 2.1. 認証済みユーザーにすべての操作を許可するポリシー
CREATE POLICY "Allow all operations for authenticated users on cues"
ON public.cues
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 2.2. すべてのユーザー（匿名ユーザー含む）に読み取りアクセスを許可するポリシー
CREATE POLICY "Allow read access for all users on cues"
ON public.cues
FOR SELECT
TO public
USING (true);

-- 3. live_state テーブルに対するポリシーを作成
-- 3.1. 認証済みユーザーにすべての操作を許可するポリシー
CREATE POLICY "Allow all operations for authenticated users on live_state"
ON public.live_state
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 3.2. すべてのユーザー（匿名ユーザー含む）に読み取りアクセスを許可するポリシー
CREATE POLICY "Allow read access for all users on live_state"
ON public.live_state
FOR SELECT
TO public
USING (true);