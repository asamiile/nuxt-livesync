-- supabase/migrations/_initial_schema.sql

-- 1. 演出リストを保存する "cues" テーブルを作成
CREATE TABLE public.cues (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    name text NOT NULL,
    type text NOT NULL,
    value text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 2. リアルタイム通知のトリガーとなる "live_state" テーブルを作成
-- このテーブルは常に1行だけのデータを保持します
CREATE TABLE public.live_state (
    id smallint NOT NULL PRIMARY KEY DEFAULT 1,
    active_cue_id uuid REFERENCES public.cues(id) ON DELETE SET NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT single_row_check CHECK (id = 1)
);

-- 3. live_stateテーブルに初期データを1行だけ挿入
INSERT INTO public.live_state (id) VALUES (1);

-- 4. テーブルの変更をリアルタイムで通知できるように設定
ALTER TABLE public.cues REPLICA IDENTITY FULL;
ALTER TABLE public.live_state REPLICA IDENTITY FULL;

-- supabase_realtime PUBLICATION が存在しない場合のみ作成する
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime FOR ALL TABLES;
    END IF;
END $$;