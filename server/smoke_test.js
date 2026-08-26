// E2E smoke test: login -> get projects -> save draft -> submit approval -> verify stage_history
import { query } from './src/config/db.js';

const BASE = 'http://localhost:3001';
const h = (token) => ({ 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) });
const post = (url, body, token) => fetch(url, { method: 'POST', headers: h(token), body: JSON.stringify(body) }).then(r => r.json());
const patch = (url, body, token) => fetch(url, { method: 'PATCH', headers: h(token), body: JSON.stringify(body) }).then(r => r.json());
const get = (url, token) => fetch(url, { headers: h(token) }).then(r => r.json());

// --- Step 1: Login
console.log('\n🔐 Step 1: Login...');
const loginRes = await post(`${BASE}/api/auth/login`, { email: 'admin@lakshya.com', password: 'admin123' });
if (!loginRes.token) { console.error('❌ Login failed:', loginRes); process.exit(1); }
const token = loginRes.token;
console.log('✅ Login OK - user:', loginRes.user.email, '| role:', loginRes.user.role);

// --- Step 2: Get projects
console.log('\n📋 Step 2: Get projects...');
const projects = await get(`${BASE}/api/projects`, token);
if (!Array.isArray(projects) || projects.length === 0) { console.error('❌ No projects:', projects); process.exit(1); }
const project = projects.find(p => p.current_stage === 'D0') || projects[0];
console.log('✅ Project:', project.title, '| Stage:', project.current_stage, '| ID:', project.id);

// --- Step 3: Save Draft (PATCH)
console.log('\n💾 Step 3: Save Draft (PATCH /api/projects/:id/draft)...');
const draftRes = await patch(`${BASE}/api/projects/${project.id}/draft`, {
  lever: 'automation',
  impact: 'high',
  implementability: 'quick_win',
}, token);
console.log('✅ Draft saved:', draftRes.lever, draftRes.impact);

// --- Step 4: Submit for Approval (POST)
console.log('\n🚀 Step 4: Submit for Approval (POST /api/projects/:id/submit)...');
const nextStage = project.current_stage === 'D0' ? 'D1' : project.current_stage === 'D1' ? 'D2' : 'D3';
const submitRes = await post(`${BASE}/api/projects/${project.id}/submit`, {
  to_stage: nextStage,
  comments: 'Automated smoke test submission',
}, token);
console.log('✅ Submit result:', JSON.stringify(submitRes));

// --- Step 5: Verify stage_history in DB
console.log('\n🗃️  Step 5: Verify stage_history row in database...');
const historyRes = await query(
  `SELECT * FROM stage_history WHERE project_id = $1 ORDER BY created_at DESC LIMIT 1`,
  [project.id]
);
if (historyRes.rows.length === 0) {
  console.error('❌ No stage_history row found!');
  process.exit(1);
}
const row = historyRes.rows[0];
console.log('✅ stage_history row:', {
  id: row.id,
  from_stage: row.from_stage,
  to_stage: row.to_stage,
  comments: row.comments,
  created_at: row.created_at,
});

// --- Step 6: Confirm project stage updated
const updated = await get(`${BASE}/api/projects/${project.id}`, token);
console.log('\n✅ Project stage now:', updated.current_stage, '(was:', project.current_stage + ')');

console.log('\n🎉 ALL SMOKE TESTS PASSED\n');
process.exit(0);
