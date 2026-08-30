import { supabase } from './supabase.js';

export const api = {
  // Auth
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    // Fetch profile from users table
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    return {
      id: user.id,
      email: user.email,
      name: profile?.name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
      role: profile?.role || 'member',
      created_at: profile?.created_at || user.created_at
    };
  },

  async signUp(email, password, name) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });
    if (error) throw error;
    
    if (data.user) {
      await supabase.from('users').upsert({
        id: data.user.id,
        email,
        name,
        role: 'member',
        email_verified: false
      });
    }
    return data;
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    return await supabase.auth.signOut();
  },

  async resetPassword(email) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/#profile'
    });
    if (error) throw error;
    return data;
  },

  async resendVerification(email) {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });
    if (error) throw error;
    return data;
  },

  async getProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) throw error;
    return data || {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || user.email?.split('@')[0],
      role: 'member'
    };
  },

  async updateProfile(updates) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async changePassword(currentPassword, newPassword) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Re-authenticate with current password to verify
    const { error: reauthErr } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword
    });
    if (reauthErr) throw new Error('Current password is incorrect');

    // Update password
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
    return data;
  },

  // Projects & Pipeline
  async getProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getDashboardSummary() {
    const { data, error } = await supabase
      .from('projects')
      .select('current_stage');

    if (error) throw error;

    const counts = { D0: 0, D1: 0, D2: 0, D3: 0, D4: 0 };
    (data || []).forEach(p => {
      const stg = (p.current_stage || 'D0').toUpperCase();
      if (counts[stg] !== undefined) counts[stg]++;
    });

    const stageCounts = Object.entries(counts).map(([current_stage, count]) => ({
      current_stage,
      count
    }));

    return {
      stageCounts,
      analytics: {
        totalActive: data ? data.length : 0,
        avgTimeInStage: 14,
        completedThisMonth: counts.D4
      }
    };
  },

  async getProject(id) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async createProject(projectData) {
    const { data: { user } } = await supabase.auth.getUser();
    const payload = {
      ...projectData,
      owner_id: user ? user.id : null,
      current_stage: 'D0',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    if (user && !payload.suggester_email) {
      payload.suggester_email = user.email;
    }
    if (user && !payload.suggester_name) {
      payload.suggester_name = user.user_metadata?.name || user.email?.split('@')[0];
    }

    const { data, error } = await supabase
      .from('projects')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async saveDraft(id, updates) {
    const { data, error } = await supabase
      .from('projects')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async submitApproval(id, { to_stage, comments }) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: currentProject, error: fetchErr } = await supabase
      .from('projects')
      .select('current_stage, title, suggester_email')
      .eq('id', id)
      .single();

    if (fetchErr) throw fetchErr;

    const from_stage = currentProject.current_stage || 'D0';

    // 1. Update project stage
    const { data: updated, error: updateErr } = await supabase
      .from('projects')
      .update({
        current_stage: to_stage,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // 2. Insert into stage_history
    await supabase.from('stage_history').insert([{
      project_id: id,
      from_stage,
      to_stage,
      actor_id: user ? user.id : null,
      comments: comments || '',
      created_at: new Date().toISOString()
    }]);

    return updated;
  },

  async getProjectHistory(id) {
    const { data, error } = await supabase
      .from('stage_history')
      .select('*')
      .eq('project_id', id)
      .order('created_at', { ascending: false });

    if (error) return [];
    return data || [];
  }
};
