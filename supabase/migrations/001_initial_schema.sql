-- 001_initial_schema.sql
-- Lakshya Stage-Gate Pipeline Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'member', 'admin', 'approver', 'customer', 'lead')) DEFAULT 'user',
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  suggester_name TEXT NOT NULL,
  suggester_email TEXT NOT NULL,
  workstream TEXT,
  ebitda_category TEXT,
  current_stage TEXT CHECK (current_stage IN ('D0', 'D1', 'D2', 'D3', 'D4')) DEFAULT 'D0',
  lever TEXT,
  impact TEXT,
  implementability TEXT,
  copq_charges NUMERIC DEFAULT 0,
  manpower_savings NUMERIC DEFAULT 0,
  investment_cost NUMERIC DEFAULT 0,
  monthly_actuals NUMERIC DEFAULT 0,
  accrued_savings NUMERIC DEFAULT 0,
  annualized_roi NUMERIC DEFAULT 0,
  owner_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- STAGE HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.stage_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  from_stage TEXT,
  to_stage TEXT NOT NULL,
  actor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- PROJECT TEAM MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.project_team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_users_email_lower ON public.users (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_projects_suggester_email ON public.projects (suggester_email);
CREATE INDEX IF NOT EXISTS idx_projects_current_stage ON public.projects (current_stage);
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON public.projects (owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_workstream ON public.projects (workstream);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON public.projects (updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_stage_history_project_id ON public.stage_history (project_id);
CREATE INDEX IF NOT EXISTS idx_stage_history_actor_id ON public.stage_history (actor_id);
CREATE INDEX IF NOT EXISTS idx_stage_history_created_at ON public.stage_history (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ptm_project_id ON public.project_team_members (project_id);
CREATE INDEX IF NOT EXISTS idx_ptm_user_id ON public.project_team_members (user_id);

-- RLS POLICIES
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_team_members ENABLE ROW LEVEL SECURITY;

-- Admins full access
CREATE POLICY "Admins have full access to users" ON public.users
  FOR ALL USING (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));

CREATE POLICY "Admins have full access to projects" ON public.projects
  FOR ALL USING (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));

CREATE POLICY "Admins have full access to stage_history" ON public.stage_history
  FOR ALL USING (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));

-- Users can view projects
CREATE POLICY "Users can view projects" ON public.projects
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Users can update their own projects
CREATE POLICY "Users can update their projects" ON public.projects
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND (
      suggester_email = (SELECT email FROM public.users WHERE id = auth.uid())
    )
  );
