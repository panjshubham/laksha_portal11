-- 001_initial_schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'admin')) DEFAULT 'user',
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- STAGE HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.stage_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  from_stage TEXT,
  to_stage TEXT NOT NULL,
  actor_id UUID REFERENCES public.users(id),
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- RLS POLICIES
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stage_history ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins have full access to users" ON public.users
  FOR ALL USING (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));

CREATE POLICY "Admins have full access to projects" ON public.projects
  FOR ALL USING (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));

CREATE POLICY "Admins have full access to stage_history" ON public.stage_history
  FOR ALL USING (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));

-- Users can read projects
CREATE POLICY "Users can view projects" ON public.projects
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Users can update projects they suggested or in their workstream
CREATE POLICY "Users can update their projects" ON public.projects
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND (
      suggester_email = (SELECT email FROM public.users WHERE id = auth.uid()) 
      -- Add workstream condition if workstream tied to users later
    )
  );

-- Stage history is insertable by edge functions or triggers but let's allow admins for now
