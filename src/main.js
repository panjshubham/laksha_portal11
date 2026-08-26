import { initThreeScene } from './threeScene.js';
import { api } from './api.js';

function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none';
    document.body.appendChild(container);
  }
  
  const toast = document.createElement('div');
  const colors = {
    success: 'bg-stage-d4-emerald text-white',
    error: 'bg-error text-on-error',
    info: 'bg-stage-d0-blue text-white',
    warning: 'bg-stage-d1-amber text-white'
  };
  toast.className = `${colors[type]} px-4 py-3 rounded shadow-lg flex items-center justify-between min-w-[250px] transition-all duration-300 transform translate-x-full pointer-events-auto`;
  
  toast.innerHTML = `
    <span class="font-body-sm font-medium">${message}</span>
    <button class="ml-4 text-white hover:text-gray-200 focus:outline-none">&times;</button>
  `;
  
  toast.querySelector('button').onclick = () => {
    toast.classList.add('opacity-0');
    setTimeout(() => toast.remove(), 300);
  };
  
  container.appendChild(toast);
  
  requestAnimationFrame(() => {
    toast.classList.remove('translate-x-full');
  });
  
  setTimeout(() => {
    if (toast.parentElement) {
      toast.classList.add('opacity-0');
      setTimeout(() => toast.remove(), 300);
    }
  }, 4000);
}

function showModal(title, body, confirmText, onConfirm) {
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 bg-obsidian/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-200';
  
  const modal = document.createElement('div');
  modal.className = 'bg-surface-container-lowest border border-slate-border rounded-lg shadow-2xl max-w-md w-full overflow-hidden transform scale-95 transition-transform duration-200';
  
  modal.innerHTML = `
    <div class="p-6">
      <h3 class="font-headline-lg text-primary mb-2">${title}</h3>
      <p class="font-body-md text-secondary mb-6">${body}</p>
      <div class="flex justify-end gap-3">
        <button class="px-4 py-2 font-body-sm font-semibold text-secondary hover:bg-surface-container-low rounded border border-transparent transition-colors" id="modal-cancel">Cancel</button>
        <button class="px-4 py-2 font-body-sm font-semibold bg-primary text-on-primary rounded hover:opacity-90 transition-opacity" id="modal-confirm">${confirmText}</button>
      </div>
    </div>
  `;
  
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  
  requestAnimationFrame(() => {
    modal.classList.remove('scale-95');
    modal.classList.add('scale-100');
  });
  
  const close = () => {
    overlay.classList.add('opacity-0');
    setTimeout(() => overlay.remove(), 200);
  };
  
  overlay.querySelector('#modal-cancel').onclick = close;
  overlay.querySelector('#modal-confirm').onclick = () => {
    close();
    if (onConfirm) onConfirm();
  };
}


let ambientOscillator = null;
let audioContext = null;

function toggleAudio(btn) {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  if (ambientOscillator) {
    ambientOscillator.stop();
    ambientOscillator.disconnect();
    ambientOscillator = null;
    btn.textContent = '[ Audio Toggle: OFF ]';
    return;
  }

  ambientOscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  ambientOscillator.type = 'sine';
  ambientOscillator.frequency.setValueAtTime(55, audioContext.currentTime); // Low drone (A1)
  
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 2); // fade in
  
  ambientOscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  ambientOscillator.start();
  btn.textContent = '[ Audio Toggle: ON ]';
}

function renderLandingPage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <!-- TopNavBar (Re-interpreted for dark mode context) -->
    <header class="absolute top-0 w-full z-20">
    <div class="flex justify-between items-center w-full px-margin-desktop py-stack-md max-w-container-max-width mx-auto">
    <div class="flex items-baseline gap-4">
    <h1 class="font-display-lg text-display-lg font-bold tracking-tighter force-dark-text m-0 p-0 leading-none">LAKSHYA</h1>
    <span class="font-data-tabular text-data-tabular text-on-surface-variant cyan-text tracking-widest uppercase">// System Access 2026</span>
    </div>
    <nav class="flex items-center gap-6">
    <!-- Hiding standard nav links per intent, keeping Admin Console -->
    <a class="glass-pill px-6 py-2 rounded-full font-label-caps text-label-caps text-white hover:bg-white/10 transition-colors uppercase flex items-center gap-2" href="#">
                        [ Console ]
                        <span class="material-symbols-outlined text-sm">settings_input_component</span>
    </a>
    </nav>
    </div>
    </header>

    <div class="absolute inset-0 w-full h-full mist-overlay z-10"></div>

    <!-- Center Content Canvas -->
    <main class="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none">
    <div class="pointer-events-auto flex flex-col items-center text-center max-w-2xl px-6">
    <h2 class="font-display-lg text-display-lg md:text-6xl font-bold tracking-tighter mb-12 force-dark-text uppercase">
                    Innovation<br>Workflow Portal
                </h2>
    <button data-login-btn class="bg-white text-black font-body-md text-body-md font-bold px-12 py-4 rounded-full cyan-glow transition-all mb-6 flex items-center justify-center w-full md:w-auto hover:bg-gray-100">
                    Sign In with SSO / Enterprise Login
                </button>
    <a class="font-data-tabular text-data-tabular cyan-text hover:text-white transition-colors flex items-center gap-2" href="#">
                    Admin Access & Permissions <span class="material-symbols-outlined text-sm">arrow_forward</span>
    </a>
    </div>
    </main>
    <!-- Footer -->
    <footer class="absolute bottom-0 w-full z-20">
    <div class="flex justify-between items-center w-full px-margin-desktop py-stack-lg max-w-container-max-width mx-auto font-data-tabular text-data-tabular text-on-surface-variant">
    <button data-audio-btn class="glass-pill px-4 py-1.5 rounded uppercase hover:text-white transition-colors flex items-center gap-2 force-dark-text">
                    [ Audio Toggle: OFF ]
                </button>
    <div class="glass-pill px-4 py-1.5 rounded uppercase cyan-text flex items-center gap-2">
                    [ 60 FPS • Diagnostic Status: Optimal ]
                </div>
    </div>
    </footer>

    <!-- Login Modal Placeholder -->
    <div id="login-modal" class="hidden fixed inset-0 bg-black/80 flex justify-center items-center backdrop-blur-sm z-50">
      <div class="bg-obsidian border border-gray-700 p-8 rounded-xl w-96 shadow-2xl">
        <h2 id="modal-title" class="text-2xl mb-6 font-semibold">Sign In</h2>
        <form id="login-form" class="flex flex-col gap-4">
          <input type="text" id="name" placeholder="Full Name" class="hidden bg-gray-900 border border-gray-700 p-3 rounded text-white focus:outline-none focus:border-cyan-500">
          <input type="email" id="email" placeholder="Email Address" class="bg-gray-900 border border-gray-700 p-3 rounded text-white focus:outline-none focus:border-cyan-500" required>
          <input type="password" id="password" placeholder="Password" class="bg-gray-900 border border-gray-700 p-3 rounded text-white focus:outline-none focus:border-cyan-500" required>
          <button type="submit" id="submit-btn" class="bg-cyan-600 hover:bg-cyan-700 text-black p-3 rounded font-bold mt-2 transition">Continue</button>
        </form>
        <div class="mt-4 flex flex-col gap-2 text-center">
          <button id="toggle-mode-btn" class="text-sm text-cyan-400 hover:text-cyan-300 transition">Create an account</button>
          <button class="text-sm text-gray-400 hover:text-white">Forgot Password?</button>
        </div>
        <button id="close-modal" class="absolute top-4 right-4 text-gray-400 hover:text-white text-xl">&times;</button>
      </div>
    </div>
  `;

  document.querySelector('[data-audio-btn]').addEventListener('click', (e) => toggleAudio(e.target));
  
  let isLogin = true;
  const modal = document.getElementById('login-modal');
  const modalTitle = document.getElementById('modal-title');
  const nameInput = document.getElementById('name');
  const toggleBtn = document.getElementById('toggle-mode-btn');

  document.querySelector('[data-login-btn]').addEventListener('click', () => modal.classList.remove('hidden'));
  document.getElementById('close-modal').addEventListener('click', () => modal.classList.add('hidden'));

  toggleBtn.addEventListener('click', () => {
    isLogin = !isLogin;
    if (isLogin) {
      modalTitle.textContent = 'Sign In';
      nameInput.classList.add('hidden');
      nameInput.required = false;
      toggleBtn.textContent = 'Create an account';
    } else {
      modalTitle.textContent = 'Create Account';
      nameInput.classList.remove('hidden');
      nameInput.required = true;
      toggleBtn.textContent = 'Already have an account? Sign In';
    }
  });
  
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const name = nameInput.value;
    
    try {
      if (isLogin) {
        const { token, user } = await api.login(email, password);
        localStorage.setItem('lakshya_token', token);
        localStorage.setItem('lakshya_user', JSON.stringify(user));
        renderDashboard();
      } else {
        await api.signup(email, password, name || email.split('@')[0]);
        showToast('Account created successfully! You can now sign in.', 'success');
        toggleBtn.click(); // Switch back to login view
      }
    } catch (err) {
      showToast(isLogin ? 'Incorrect email or password' : 'Signup failed: ' + err.message, 'error');
    }
  });

  initThreeScene();
}

async function renderDashboard() {
  document.title = "Dashboard — Lakshya Innovation Portal";
  window.location.hash = '#dashboard';
  document.getElementById('canvas-container').innerHTML = ''; // Remove Three.js
  const app = document.getElementById('app');
  
  const user = JSON.parse(localStorage.getItem('lakshya_user') || '{}');
  const roleBadge = user.role === 'admin' ? '<span class="bg-primary text-white text-[10px] px-2 py-0.5 rounded-full uppercase ml-2">Admin</span>' : '<span class="bg-surface-variant text-secondary text-[10px] px-2 py-0.5 rounded-full uppercase ml-2">User</span>';
  
  document.body.className = "flex flex-col min-h-screen bg-background text-on-background m-0 p-0 font-sans";

  app.innerHTML = `
    <header class="bg-surface-container-lowest border-b border-slate-border flex items-center justify-between px-4 h-16 w-full shrink-0 relative z-20">
      <div class="flex items-center gap-4">
        <div class="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">L</div>
        <h1 class="font-headline-lg text-headline-lg font-bold text-primary">LAKSHYA INNOVATION PORTAL</h1>
      </div>
      <div class="flex items-center gap-6">
        <div class="flex items-center gap-2">
          <a href="#profile" class="font-body-sm font-semibold text-primary hidden md:flex items-center hover:opacity-80 transition-opacity cursor-pointer">Welcome, ${user.name || (user.email ? user.email.split('@')[0] : 'User')}${roleBadge}</a>
        </div>
      </div>
    </header>
    <main class="flex-1 w-full max-w-container-max-width mx-auto px-margin-desktop py-stack-lg animate-pulse">
      <div class="h-[72px] mb-stack-md bg-surface-container-low rounded w-1/3"></div>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-stack-lg">
        ${[1,2,3,4,5].map(() => `<div class="h-[100px] bg-surface-container-low rounded"></div>`).join('')}
      </div>
      <div class="h-[60px] bg-surface-container-low rounded mb-4 w-full"></div>
      <div class="h-[300px] bg-surface-container-low rounded w-full"></div>
    </main>
  `;

  let apiSummary = { stageCounts: [], analytics: { totalActive: 0, avgTimeInStage: 0, completedThisMonth: 0 } };
  let summary = [];
  let projects = [];
  try {
    apiSummary = await api.getDashboardSummary();
    if(Array.isArray(apiSummary)) { summary = apiSummary; } else { summary = apiSummary.stageCounts; }
    projects = await api.getProjects();
  } catch (err) {
    console.error("Failed to load dashboard data", err);
  }

  const getCount = (stage) => {
    const stat = summary.find(s => s.current_stage?.toUpperCase() === stage.toUpperCase());
    return stat ? parseInt(stat.count, 10) : 0;
  };
  
  const analytics = apiSummary.analytics || { totalActive: projects.length, avgTimeInStage: 0, completedThisMonth: 0 };
  
  app.innerHTML = `
    <!-- TopNav / Header -->
    <header class="bg-surface-container-lowest border-b border-slate-border flex items-center justify-between px-4 h-16 w-full shrink-0 relative z-20">
      <div class="flex items-center gap-4">
        <div class="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">L</div>
        <h1 class="font-headline-lg text-headline-lg font-bold text-primary">LAKSHYA INNOVATION PORTAL</h1>
      </div>
      <div class="flex items-center gap-6">
        <div class="flex items-center gap-2">
          <span class="font-body-sm font-semibold text-primary hidden md:block">Welcome, ${user.email || 'Reviewer'}${roleBadge}</span>
        </div>
        <button data-logout-btn class="text-xs border border-slate-border px-3 py-1 rounded text-primary hover:bg-surface-container-low transition">Log Out</button>
      </div>
    </header>
    
    <!-- Main Content Area -->
    <main class="flex-1 overflow-y-auto w-full max-w-container-max-width mx-auto px-margin-desktop py-stack-lg relative z-20 bg-background text-on-background">
      <!-- Dynamic Subheader -->
      <div class="px-4 mb-stack-md h-[72px] flex flex-col justify-center">
        <h2 class="font-headline-xl text-headline-xl font-bold text-primary transition-all duration-300 ease-out" id="dynamic-title">STAGE-GATE PIPELINE DASHBOARD</h2>
        <div class="mt-1">
          <span class="font-data-tabular text-[13px] bg-surface-container border border-slate-border text-secondary px-2 py-1 rounded transition-opacity duration-300 ease-out" id="dynamic-subtitle">Overview of ongoing enterprise initiatives from ideation to realization.</span>
        </div>
      </div>
      
      <!-- Summary Analytics -->
      <div class="flex gap-6 mb-4 px-4">
        <div class="flex flex-col"><span class="text-xs text-secondary uppercase tracking-wider">Total Active</span><span class="text-lg font-bold text-primary">${analytics.totalActive}</span></div>
        <div class="flex flex-col"><span class="text-xs text-secondary uppercase tracking-wider">Avg Time in Stage</span><span class="text-lg font-bold text-primary">${analytics.avgTimeInStage} days</span></div>
        <div class="flex flex-col"><span class="text-xs text-secondary uppercase tracking-wider">Completed this Month</span><span class="text-lg font-bold text-primary">${analytics.completedThisMonth}</span></div>
      </div>
      <!-- Summary Metric Cards -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-stack-lg">
        ${[
          { stage: 'D0', title: 'Potential', color: 'stage-d0-blue' },
          { stage: 'D1', title: 'Idea/Levers', color: 'stage-d1-amber' },
          { stage: 'D2', title: 'Signoff', color: 'stage-d2-orange' },
          { stage: 'D3', title: 'Implementation', color: 'stage-d3-indigo' },
          { stage: 'D4', title: 'Completed', color: 'stage-d4-emerald' }
        ].map(s => `
        <div class="stage-card bg-surface-container-lowest border border-slate-border border-t-4 border-t-${s.color} p-4 hover:bg-surface-container-low transition-colors duration-200 rounded cursor-pointer group flex flex-col h-full" data-stage="${s.stage.toLowerCase()}">
          <div class="flex justify-between items-start mb-1">
            <span class="font-label-caps text-label-caps text-secondary uppercase tracking-wider">${s.stage}: ${s.title}</span>
            <span class="h-2 w-2 rounded-full bg-${s.color}"></span>
          </div>
          <div class="font-headline-xl text-headline-xl text-primary group-hover:text-${s.color} transition-colors">${getCount(s.stage)} Ideas</div>
        </div>
        `).join('')}
      </div>
      
      <!-- Filter & Controls -->
      <div class="flex flex-col md:flex-row items-center bg-surface-container-lowest border border-slate-border p-3 rounded my-4 gap-4">
        <div class="flex-1 relative">
          <span class="font-label-caps text-label-caps text-secondary absolute -top-2 left-3 bg-white px-1 z-10">PROJECT SEARCH</span>
          <div class="relative mt-1">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
            <input id="dashboard-search" class="w-full pl-9 pr-4 py-1.5 bg-surface-container-low border border-slate-border rounded text-body-sm focus:outline-none focus:border-primary transition-colors" placeholder="Search title, ID, or suggester..." type="text">
          </div>
        </div>
        <div class="w-full md:w-64 relative">
          <span class="font-label-caps text-label-caps text-secondary absolute -top-2 left-3 bg-white px-1 z-10">FILTER BY STAGE</span>
          <select id="dashboard-filter" class="w-full mt-1 px-3 py-1.5 bg-surface-container-low border border-slate-border rounded text-body-sm focus:outline-none focus:border-primary transition-colors appearance-none pr-10">
            <option>All Stages</option>
            <option>D0 Potential</option>
            <option>D1 Idea</option>
          </select>
        </div>
        <div class="flex bg-surface-container-low border border-slate-border rounded p-1 ml-auto">
          <button class="px-4 py-1 bg-white border border-slate-border rounded text-primary font-body-sm font-semibold shadow-sm flex items-center gap-2">
            Table View
          </button>
          <button data-nav-grid class="px-4 py-1 text-secondary hover:text-primary font-body-sm flex items-center gap-2 transition-colors">
            Excel Grid View
          </button>
        </div>
      </div>
      
      <!-- Main Data Table -->
      <div class="bg-surface-container-lowest border border-slate-border rounded overflow-x-auto">
        <table class="w-full min-w-[1000px] text-left border-collapse table-fixed">
          <thead>
            <tr class="bg-surface-container-low border-b border-slate-border">
              <th class="py-2 px-4 font-label-caps text-label-caps text-secondary font-semibold uppercase tracking-wider">Project ID</th>
              <th class="py-2 px-4 font-label-caps text-label-caps text-secondary font-semibold uppercase tracking-wider">Title / Idea Description</th>
              <th class="py-2 px-4 font-label-caps text-label-caps text-secondary font-semibold uppercase tracking-wider text-center">Stage</th>
              <th class="py-2 px-4 font-label-caps text-label-caps text-secondary font-semibold uppercase tracking-wider">Suggester</th>
              <th class="py-2 px-4 font-label-caps text-label-caps text-secondary font-semibold uppercase tracking-wider">Last Updated</th>
              <th class="py-2 px-4 font-label-caps text-label-caps text-secondary font-semibold uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody id="dashboard-tbody" class="font-data-tabular text-data-tabular text-primary">
            ${projects.length > 0 ? projects.map(proj => {
              const stageUpper = proj.current_stage?.toUpperCase() || 'D0';
              const stageColors = { 'D0': 'stage-d0-blue', 'D1': 'stage-d1-amber', 'D2': 'stage-d2-orange', 'D3': 'stage-d3-indigo', 'D4': 'stage-d4-emerald' };
              const color = stageColors[stageUpper] || 'stage-d0-blue';
              const date = new Date(proj.updated_at).toLocaleDateString();
              return `
              <tr data-project-id="${proj.id}" data-project-stage="${stageUpper.toLowerCase()}" class="project-row border-b border-slate-border hover:bg-surface-container-low cursor-pointer transition-colors duration-150 h-[46px]">
                <td class="py-2 px-4">I${proj.id}</td>
                <td class="py-2 px-4 font-body-sm text-secondary truncate">${proj.title}</td>
                <td class="py-2 px-4 text-center">
                  <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-${color}/10 text-${color} font-bold text-[12px]">
                    <span class="h-1.5 w-1.5 rounded-full bg-${color}"></span>${stageUpper}
                  </span>
                </td>
                <td class="py-2 px-4">${proj.suggester_name || proj.suggester_email.split('@')[0]}</td>
                <td class="py-2 px-4 text-secondary">${date}</td>
                <td class="py-2 px-4 text-right">
                  <button class="px-3 py-0.5 bg-white border border-slate-border rounded text-primary hover:bg-surface-container-low transition-colors text-body-sm font-semibold">View</button>
                </td>
              </tr>
              `;
            }).join('') : `<tr><td colspan="6" class="text-center py-16 text-secondary"><div class="flex flex-col items-center gap-2"><span class="material-symbols-outlined text-4xl opacity-20">search_off</span><p>No projects match your criteria.</p></div></td></tr>`}
          </tbody>
        </table>
      </div>
    </main>
  `;

  document.querySelector('[data-logout-btn]').addEventListener('click', () => {
      showModal('Log Out', 'Log out of Lakshya Innovation System?', 'Log Out', () => {
    localStorage.removeItem('lakshya_token');
    localStorage.removeItem('lakshya_user');
    document.body.className = "bg-obsidian text-white font-sans m-0 p-0 overflow-x-hidden";
    renderLandingPage();
    });
  });
  
  document.querySelector('[data-nav-grid]').addEventListener('click', () => {
    renderSpreadsheetGrid();
  });

  // Replaced by searchLogic

  // Re-attach the dynamic title hover effect from Stitch design
  const defaultTitle = "STAGE-GATE PIPELINE DASHBOARD";
  const defaultSubtitle = "Overview of ongoing enterprise initiatives from ideation to realization.";
  const defaultColor = "text-primary";
  
  const stageMeta = {
    'd0': { title: "D0: IDEA CAPTURE & POTENTIAL", subtitle: "CRITERIA: Impact evaluation & strategic alignment check.", color: "text-stage-d0-blue" },
    'd1': { title: "D1: VALUE LEVERS & SCORING", subtitle: "CRITERIA: Detailed benefit assessment & implementation effort.", color: "text-stage-d1-amber" },
    'd2': { title: "D2: EXECUTIVE SIGN-OFF", subtitle: "CRITERIA: Final gate approval & resource allocation.", color: "text-stage-d2-orange" },
    'd3': { title: "D3: PROJECT EXECUTION", subtitle: "CRITERIA: Milestone tracking & real-time delivery metrics.", color: "text-stage-d3-indigo" },
    'd4': { title: "D4: BENEFIT REALIZATION", subtitle: "CRITERIA: Post-implementation review & final value sign-off.", color: "text-stage-d4-emerald" }
  };

  const titleEl = document.getElementById('dynamic-title');
  const subtitleEl = document.getElementById('dynamic-subtitle');
  const cards = document.querySelectorAll('.stage-card');
  let timeout;

  const updateHeader = (title, subtitle, colorClass) => {
    titleEl.style.opacity = '0';
    subtitleEl.style.opacity = '0';
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      titleEl.textContent = title;
      subtitleEl.textContent = subtitle;
      titleEl.className = `font-headline-xl text-headline-xl font-bold transition-all duration-300 ease-out ${colorClass}`;
      titleEl.style.opacity = '1';
      subtitleEl.style.opacity = '1';
    }, 120);
  };

  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      const stage = card.dataset.stage;
      if (stageMeta[stage]) updateHeader(stageMeta[stage].title, stageMeta[stage].subtitle, stageMeta[stage].color);
    });
    card.addEventListener('mouseleave', () => {
      updateHeader(defaultTitle, defaultSubtitle, defaultColor);
    });
  });

  const searchInput = document.getElementById('dashboard-search');
  const stageFilter = document.getElementById('dashboard-filter');
  const tbody = document.getElementById('dashboard-tbody');
  
  function renderTableRows() {
    const q = searchInput.value.toLowerCase();
    const stage = stageFilter.value;
    
    const filtered = projects.filter(p => {
      const matchQ = p.title.toLowerCase().includes(q) || ('I'+p.id).toLowerCase().includes(q) || (p.suggester_name || '').toLowerCase().includes(q);
      const matchS = stage === 'All Stages' || (p.current_stage || 'd0').toLowerCase() === stage.toLowerCase().split(' ')[0];
      return matchQ && matchS;
    });
    
    if (filtered.length === 0) {
      if (projects.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-16 text-secondary"><div class="flex flex-col items-center gap-2"><span class="material-symbols-outlined text-4xl opacity-20">inbox</span><p>No projects yet. Get started by submitting a new idea!</p></div></td></tr>`;
      } else {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-16 text-secondary"><div class="flex flex-col items-center gap-2"><span class="material-symbols-outlined text-4xl opacity-20">search_off</span><p>No projects match your search.</p><button id="clear-filters" class="mt-2 text-primary font-bold hover:underline">Clear Filters</button></div></td></tr>`;
        setTimeout(() => {
          const btn = document.getElementById('clear-filters');
          if (btn) btn.onclick = () => { searchInput.value = ''; stageFilter.value = 'All Stages'; renderTableRows(); };
        }, 0);
      }
      return;
    }
    
    tbody.innerHTML = filtered.map(proj => {
      const stageUpper = proj.current_stage?.toUpperCase() || 'D0';
      const stageColors = { 'D0': 'stage-d0-blue', 'D1': 'stage-d1-amber', 'D2': 'stage-d2-orange', 'D3': 'stage-d3-indigo', 'D4': 'stage-d4-emerald' };
      const color = stageColors[stageUpper] || 'stage-d0-blue';
      const date = new Date(proj.updated_at).toLocaleDateString();
      return `
      <tr data-project-id="${proj.id}" data-project-stage="${stageUpper.toLowerCase()}" class="project-row border-b border-slate-border hover:bg-surface-container-low cursor-pointer transition-colors duration-150 h-[46px]">
        <td class="py-2 px-4">I${proj.id}</td>
        <td class="py-2 px-4 font-body-sm text-secondary truncate">${proj.title}</td>
        <td class="py-2 px-4 text-center">
          <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-${color}/10 text-${color} font-bold text-[12px]">
            <span class="h-1.5 w-1.5 rounded-full bg-${color}"></span>${stageUpper}
          </span>
        </td>
        <td class="py-2 px-4">${proj.suggester_name || proj.suggester_email?.split('@')[0]}</td>
        <td class="py-2 px-4 text-secondary">${date}</td>
        <td class="py-2 px-4 text-right">
          <button class="px-3 py-0.5 bg-white border border-slate-border rounded text-primary hover:bg-surface-container-low transition-colors text-body-sm font-semibold">View</button>
        </td>
      </tr>
      `;
    }).join('');
    
    document.querySelectorAll('.project-row').forEach(row => {
      row.addEventListener('click', () => {
        renderProjectDetail(row.dataset.projectId, row.dataset.projectStage);
      });
    });
  }

  if (searchInput && stageFilter) {
    searchInput.addEventListener('input', renderTableRows);
    stageFilter.addEventListener('change', renderTableRows);
    renderTableRows(); // Initial render to apply logic
  }

}

async function renderProjectDetail(id, stage = 'd0') {
  document.title = `Project ${id} — Lakshya Innovation Portal`;
  window.location.hash = '#project/' + id;
  const app = document.getElementById('app');
  
  app.innerHTML = `<div class="h-screen w-full flex flex-col p-8 animate-pulse"><div class="h-16 bg-surface-container-low mb-8 rounded w-full"></div><div class="h-64 bg-surface-container-low rounded w-full mb-8"></div><div class="h-64 bg-surface-container-low rounded w-full"></div></div>`;
  
  let proj = {};
  let history = [];
  try {
    const [p, h] = await Promise.all([api.getProject(id), api.getProjectHistory(id).catch(()=>[])]);
    proj = p;
    history = h;
    stage = proj.current_stage ? proj.current_stage.toLowerCase() : 'd0';
  } catch (err) {
    console.error("Failed to load project details", err);
    showToast('Error loading project: ' + err.message, 'error');
    renderDashboard();
    return;
  }
  
  const user = JSON.parse(localStorage.getItem('lakshya_user') || '{}');
  const isAdmin = user.role === 'admin';
  const disableStr = !isAdmin ? 'disabled title="Only admins can submit for approval"' : '';
  const disableClass = !isAdmin ? 'opacity-50 cursor-not-allowed' : '';


  // Logic to apply D0 pattern across all 5 stages
  const stages = ['d0', 'd1', 'd2', 'd3', 'd4'];
  const currentStageIndex = stages.indexOf(stage);
  
  const stageNames = [
    { id: 'd0', label: 'D0 Validation' },
    { id: 'd1', label: 'D1 Score Matrix' },
    { id: 'd2', label: 'D2 Signoff' },
    { id: 'd3', label: 'D3 Implementation' },
    { id: 'd4', label: 'D4 Completed' }
  ];

// TODO: Distinct forms for D1-D4 stages need to be implemented. Currently reusing D0 form layout as placeholder.
  app.innerHTML = `
<nav class="bg-surface-container-lowest border-b border-slate-border sticky top-0 z-50">
<div class="max-w-container-max-width mx-auto px-margin-mobile md:px-margin-desktop h-16 flex items-center justify-between">
<div class="flex items-center gap-gutter">
<div class="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">L</div>
<div class="flex flex-col ml-4">
<div class="flex items-center text-secondary text-body-sm mb-unit">
<a class="hover:text-primary transition-colors cursor-pointer" id="breadcrumb-dash">Dashboard</a>
<span class="material-symbols-outlined mx-1 text-sm">chevron_right</span>
<span class="text-primary font-semibold">Project ID ${id}</span>
</div>
<div class="flex items-center gap-stack-md">
<h1 class="font-headline-lg text-headline-lg text-primary">PROJECT DETAILS: ID ${id}</h1>${isAdmin ? '<span class="bg-primary text-white text-[10px] px-2 py-0.5 rounded-full uppercase ml-2">Admin</span>' : '<span class="bg-surface-variant text-secondary text-[10px] px-2 py-0.5 rounded-full uppercase ml-2">User</span>'}
<span class="inline-flex items-center px-2 py-1 rounded bg-stage-${stage === 'd0' ? 'd0-blue' : 'd1-amber'}/10 text-stage-${stage === 'd0' ? 'd0-blue' : 'd1-amber'} font-label-caps text-label-caps uppercase">STATUS: Stage ${stage} - Under Review</span>
</div>
</div>
</div>
</div>
</nav>
<main class="flex-grow max-w-container-max-width w-full mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg flex flex-col gap-stack-lg">
<div class="bg-surface-container-lowest border border-slate-border rounded p-stack-md overflow-x-auto"><div class="flex items-center justify-between min-w-max gap-2">
  <div class="flex items-center gap-2 flex-1">
    <div class="flex items-center gap-2 text-secondary">
      <span class="material-symbols-outlined text-lg">check_circle</span>
      <span class="font-label-caps text-label-caps">Idea Info</span>
    </div>
    <span class="material-symbols-outlined text-secondary opacity-30">chevron_right</span>
  </div>
  ${stageNames.map((s, index) => {
    if (index === currentStageIndex) {
      return `
        <div class="flex items-center gap-2 flex-1">
          <div class="flex items-center gap-2 bg-stage-d0-blue text-white px-4 py-2 rounded-full animate-pulse shadow-lg">
            <span class="font-data-tabular text-data-tabular">${index + 2}</span>
            <span class="font-label-caps text-label-caps font-bold">${s.label}</span>
          </div>
          <span class="material-symbols-outlined text-stage-d0-blue">chevron_right</span>
        </div>
      `;
    } else if (index < currentStageIndex) {
      return `
        <div class="flex items-center gap-2 flex-1">
          <div class="flex items-center gap-2 text-secondary">
            <span class="material-symbols-outlined text-lg">check_circle</span>
            <span class="font-label-caps text-label-caps">${s.label}</span>
          </div>
          <span class="material-symbols-outlined text-secondary opacity-30">chevron_right</span>
        </div>
      `;
    } else {
      return `
        <div class="flex items-center gap-2 flex-1 opacity-50">
          <span class="font-data-tabular text-data-tabular text-secondary">${index + 2}</span>
          <span class="font-label-caps text-label-caps text-secondary">${s.label}</span>
          ${index < 4 ? '<span class="material-symbols-outlined text-secondary opacity-30">chevron_right</span>' : ''}
        </div>
      `;
    }
  }).join('')}
</div></div>
<div class="grid grid-cols-1 lg:grid-cols-3 gap-gutter items-start">
<div class="lg:col-span-1 bg-surface-container-lowest border border-slate-border rounded p-gutter flex flex-col gap-stack-md h-full"><h2 class="font-headline-md text-headline-md text-primary mb-stack-sm pb-stack-sm border-b border-slate-border">Idea Details</h2><div class="flex flex-col gap-stack-sm mb-stack-md"><label class="font-label-caps text-label-caps text-secondary uppercase tracking-wider">Idea Description</label><p class="font-body-md text-body-md text-primary bg-surface-container-low p-stack-sm rounded border border-slate-border line-clamp-4">${proj.title}</p></div><div class="grid grid-cols-2 gap-x-gutter gap-y-stack-md"><div class="flex flex-col gap-unit"><label class="font-label-caps text-label-caps text-secondary uppercase tracking-wider">Suggester</label><span class="font-body-md text-primary font-semibold">${proj.suggester_name || proj.suggester_email?.split('@')[0]}</span></div><div class="flex flex-col gap-unit"><label class="font-label-caps text-label-caps text-secondary uppercase tracking-wider">Work Stream</label><span class="font-body-md text-primary font-semibold">${proj.workstream || 'Operations'}</span></div><div class="flex flex-col gap-unit"><label class="font-label-caps text-label-caps text-secondary uppercase tracking-wider">EBITDA Category</label><span class="font-body-md text-primary font-semibold">${proj.ebitda_category || 'Cost Reduction'}</span></div><div class="flex flex-col gap-unit"><label class="font-label-caps text-label-caps text-secondary uppercase tracking-wider">Stage</label><span class="font-body-md text-primary font-semibold">${proj.current_stage}</span></div></div></div>
<div class="lg:col-span-2 bg-surface-container-lowest border border-slate-border rounded p-gutter flex flex-col gap-stack-lg">
<h2 class="font-headline-md text-headline-md text-primary border-b border-slate-border pb-stack-sm uppercase">INPUT REQUIRED FOR ${stage.toUpperCase()} STAGE</h2>
<form class="flex flex-col gap-stack-lg">
<div class="flex flex-col gap-unit">
<label class="font-label-caps text-label-caps text-secondary uppercase tracking-wider" for="d0-lever">Select ${stage.toUpperCase()} Lever <span class="text-error">*</span></label>
<select class="w-full md:w-1/2 p-2 border border-slate-border rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none font-body-md text-primary bg-surface-container-lowest transition-colors" id="d0-lever"><option disabled="" selected="" value="">Select a lever category</option>
<option value="automation">Automation / Digitization</option>
<option value="cost_saving">Process Optimization</option>
</select>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 gap-gutter items-start">
<div class="flex flex-col gap-stack-sm">
<label class="font-label-caps text-label-caps text-secondary uppercase tracking-wider">Estimated Impact</label>
<div class="flex flex-col gap-2">
<label class="flex items-center gap-2 cursor-pointer p-2 border border-slate-border rounded hover:bg-surface-container-low transition-colors"><input class="text-primary focus:ring-primary border-slate-border" name="impact" type="radio" value="low"><span class="font-body-md text-primary">Low</span></label>
<label class="flex items-center gap-2 cursor-pointer p-2 border border-slate-border rounded hover:bg-surface-container-low transition-colors"><input class="text-primary focus:ring-primary border-slate-border" name="impact" type="radio" value="medium"><span class="font-body-md text-primary">Medium</span></label>
<label class="flex items-center gap-2 cursor-pointer p-2 border border-slate-border rounded hover:bg-surface-container-low transition-colors bg-surface-container-low border-primary/30"><input checked="" class="text-primary focus:ring-primary border-slate-border" name="impact" type="radio" value="high"><span class="font-body-md text-primary font-medium">High</span></label>
</div></div>
<div class="flex flex-col gap-stack-sm">
<label class="font-label-caps text-label-caps text-secondary uppercase tracking-wider">Implementability</label>
<div class="flex flex-col gap-2">
<label class="flex items-center gap-2 cursor-pointer p-2 border border-slate-border rounded hover:bg-surface-container-low transition-colors"><input class="text-primary focus:ring-primary border-slate-border" name="implementability" type="radio" value="high"><span class="font-body-md text-primary">High Effort</span></label>
<label class="flex items-center gap-2 cursor-pointer p-2 border border-slate-border rounded hover:bg-surface-container-low transition-colors"><input class="text-primary focus:ring-primary border-slate-border" name="implementability" type="radio" value="mid"><span class="font-body-md text-primary">Mid Effort</span></label>
<label class="flex items-center gap-2 cursor-pointer p-2 border border-slate-border rounded hover:bg-surface-container-low transition-colors"><input class="text-primary focus:ring-primary border-slate-border" name="implementability" type="radio" value="quick_win"><span class="font-body-md text-primary">Quick Win</span></label>
</div></div></div>
<div class="flex flex-col gap-unit">
<label class="font-label-caps text-label-caps text-secondary uppercase tracking-wider" for="justification">Reviewer Justification & Comments</label>
<textarea class="w-full p-3 border border-slate-border rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none font-body-md text-primary bg-surface-container-lowest resize-y" id="justification" placeholder="Enter detailed justification for the ${stage.toUpperCase()} stage gate review..." rows="4"></textarea>
</div>
</form>
</div>
</div>

<!-- Stage History Timeline -->
<div class="lg:col-span-3 bg-surface-container-lowest border border-slate-border rounded p-gutter mt-stack-md">
  <h3 class="font-headline-sm font-bold text-primary mb-4 border-b border-slate-border pb-2">Stage History</h3>
  <div class="flex flex-col gap-4">
    ${history.length > 0 ? history.map(h => `
      <div class="flex items-start gap-4 border-l-2 border-slate-border pl-4 relative">
        <div class="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-surface-variant border-2 border-surface-container-lowest"></div>
        <div>
          <p class="font-body-sm text-primary"><strong>${h.actor_name || h.actor_email?.split('@')[0]}</strong> advanced from <span class="uppercase font-semibold">${h.from_stage}</span> to <span class="uppercase font-semibold">${h.to_stage}</span></p>
          ${h.comments ? `<p class="text-sm text-secondary italic mt-1">${h.comments}</p>` : ''}
          <p class="text-xs text-secondary mt-1" title="${new Date(h.created_at).toLocaleString()}">${new Date(h.created_at).toLocaleDateString()}</p>
        </div>
      </div>
    `).join('') : '<p class="text-sm text-secondary">No stage changes yet.</p>'}
  </div>
</div>

</main>
<footer class="bg-surface-container-lowest border-t border-slate-border mt-auto py-4 px-margin-mobile md:px-margin-desktop sticky bottom-0 z-40 backdrop-blur-md bg-surface-container-lowest/90">
<div class="max-w-container-max-width mx-auto flex items-center justify-between">
<button class="font-label-caps text-label-caps text-secondary hover:text-primary transition-colors flex items-center gap-1 cursor-pointer" id="back-btn">
<span class="material-symbols-outlined text-sm">arrow_back</span> Back to Dashboard
</button>
<div class="flex items-center gap-[12px]">
<button id="save-progress-btn" class="px-4 py-2 border border-slate-border rounded font-label-caps text-label-caps text-primary hover:bg-surface-container-low transition-colors cursor-pointer">
Save Progress
</button>
<button id="submit-approval-btn" ${disableStr} class="px-4 py-2 text-on-primary ${disableClass} rounded font-label-caps text-label-caps flex items-center gap-2 hover:bg-primary/90 transition-colors bg-stage-d0-blue cursor-pointer">
<span class="material-symbols-outlined text-sm">mail</span> Submit for Approval
</button>
</div>
</div>
</footer>
  `;

  document.getElementById('back-btn').addEventListener('click', () => {
    renderDashboard();
  });
  document.getElementById('breadcrumb-dash').addEventListener('click', () => {
    renderDashboard();
  });

  
  const submitBtn = document.getElementById('submit-approval-btn');
  const impactRadios = document.querySelectorAll('input[name="impact"]');
  const implRadios = document.querySelectorAll('input[name="implementability"]');
  const commentsInput = document.getElementById('justification');

  // Add error placeholders
  const impactContainer = impactRadios[0].closest('.flex-col').parentElement;
  if (!document.getElementById('impact-error')) {
    const err1 = document.createElement('div');
    err1.id = 'impact-error';
    err1.className = 'text-error font-body-sm mt-1 hidden';
    err1.textContent = 'Impact is required';
    impactRadios[0].closest('.flex-col').appendChild(err1);
  }
  if (!document.getElementById('impl-error')) {
    const err2 = document.createElement('div');
    err2.id = 'impl-error';
    err2.className = 'text-error font-body-sm mt-1 hidden';
    err2.textContent = 'Implementability is required';
    implRadios[0].closest('.flex-col').appendChild(err2);
  }
  if (!document.getElementById('comments-error')) {
    const err3 = document.createElement('div');
    err3.id = 'comments-error';
    err3.className = 'text-error font-body-sm mt-1 hidden';
    err3.textContent = 'Comments must be at least 10 characters';
    commentsInput.parentElement.appendChild(err3);
  }

  function validateForm() {
    let isValid = true;
    const impactChecked = document.querySelector('input[name="impact"]:checked');
    const implChecked = document.querySelector('input[name="implementability"]:checked');
    const comments = commentsInput.value.trim();

    if (!impactChecked) isValid = false;
    if (!implChecked) isValid = false;
    if (comments.length < 10) isValid = false;

    if (isValid) {
      submitBtn.disabled = false;
      submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    } else {
      submitBtn.disabled = true;
      submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
    }
    return isValid;
  }

  [...impactRadios, ...implRadios].forEach(el => el.addEventListener('change', () => {
    document.getElementById('impact-error').classList.add('hidden');
    document.getElementById('impl-error').classList.add('hidden');
    validateForm();
  }));
  commentsInput.addEventListener('input', () => {
    document.getElementById('comments-error').classList.add('hidden');
    validateForm();
  });
  
  // Initial validation
  validateForm();

  document.getElementById('save-progress-btn')
    .addEventListener('click', async () => {
    const btn = document.getElementById('save-progress-btn');
    btn.textContent = 'Saving...';
    btn.disabled = true;
    try {
      const lever = document.getElementById('d0-lever').value;
      const impact = document.querySelector('input[name="impact"]:checked')?.value;
      const implementability = document.querySelector('input[name="implementability"]:checked')?.value;
      
      await api.saveDraft(id, { 
        lever,
        impact,
        implementability
      });
      showToast('Draft saved.', 'success');
    } catch (e) {
      showToast('Error saving draft: ' + e.message, 'error');
    } finally {
      btn.textContent = 'Save Progress';
      btn.disabled = false;
    }
  });

  document.getElementById('submit-approval-btn').addEventListener('click', async () => {
    if (!validateForm()) {
      const impactChecked = document.querySelector('input[name="impact"]:checked');
      const implChecked = document.querySelector('input[name="implementability"]:checked');
      if (!impactChecked) document.getElementById('impact-error').classList.remove('hidden');
      if (!implChecked) document.getElementById('impl-error').classList.remove('hidden');
      if (commentsInput.value.trim().length < 10) {
        document.getElementById('comments-error').classList.remove('hidden');
        commentsInput.focus();
      } else if (!impactChecked) {
        impactRadios[0].focus();
      }
      return;
    }

    const stages = ['d0', 'd1', 'd2', 'd3', 'd4'];
    const nextStageIndex = stages.indexOf(stage) + 1;
    const to_stage = nextStageIndex < stages.length ? stages[nextStageIndex] : stage;
    const suggesterName = proj.suggester_name || proj.suggester_email.split('@')[0];
    
    showModal('Submit for Approval', `This will advance "${proj.title}" from ${stage.toUpperCase()} to ${to_stage.toUpperCase()} and automatically email ${suggesterName} to notify them. This can't be undone from here. Continue?`, 'Confirm', async () => {
      const btn = document.getElementById('submit-approval-btn');
      btn.innerHTML = '<span class="material-symbols-outlined text-sm">mail</span> Submitting...';
      btn.disabled = true;
      try {
        const comments = commentsInput.value;
        await api.submitApproval(id, { to_stage, comments });
        showToast(`Project advanced to ${to_stage.toUpperCase()}. ${suggesterName} has been notified.`, 'success');
        renderDashboard();
      } catch (e) {
        showToast('Error submitting approval: ' + e.message, 'error');
        btn.innerHTML = '<span class="material-symbols-outlined text-sm">mail</span> Submit for Approval';
        btn.disabled = false;
      }
    });
  });
}

function renderSpreadsheetGrid() {
  const app = document.getElementById('app');
  app.innerHTML = `
<!-- TopNavBar -->
<nav class="bg-surface-container-lowest border-b border-slate-border w-full h-16 flex justify-between items-center px-margin-desktop w-full max-w-container-max-width mx-auto">
<div class="flex items-center gap-stack-lg">
<span class="font-headline-lg text-headline-lg font-bold text-primary">InnovationPortal</span>
<div class="hidden md:flex gap-stack-md ml-stack-lg h-16 items-center">
<a class="text-secondary hover:text-primary transition-colors font-body-sm text-body-sm flex items-center h-full hover:bg-surface-container-low px-4" href="#">Dashboard</a>
<a class="text-primary font-bold border-b-2 border-primary h-full flex items-center px-4 font-body-sm text-body-sm mt-4" href="#">Financials</a>
   <a class="text-secondary hover:text-primary transition-colors font-body-sm text-body-sm flex items-center h-full hover:bg-surface-container-low px-4 ml-auto" href="#profile"><span class="material-symbols-outlined mr-1 text-[18px]">person</span> Profile</a>
</div>
</div>
</nav>

<main class="flex-grow w-full max-w-container-max-width mx-auto px-margin-desktop py-stack-lg flex flex-col gap-stack-lg">
<!-- Page Header -->
<header class="flex flex-col gap-stack-sm">
<h1 class="font-headline-xl text-headline-xl text-primary">Lakshya 25 - D4 Sign Off Grid</h1>
</header>

<!-- Controls Area -->
<div class="flex justify-between items-end bg-surface-container-lowest p-gutter rounded border border-slate-border">
<div class="flex gap-stack-md">
<button onclick="showToast('Bulk changes saved!', 'success')" class="px-4 py-2 bg-stage-d4-emerald text-white rounded font-body-sm font-semibold hover:opacity-90 transition-colors flex items-center gap-2">
<span class="material-symbols-outlined text-sm">save</span>Save All
</button>
</div>
</div>

<!-- Financial Matrix -->
<div class="bg-surface-container-lowest border border-slate-border rounded overflow-hidden">
<div class="overflow-x-auto">
<table class="w-full text-left border-collapse min-w-max">
<thead>
<tr class="bg-surface-container text-secondary font-label-caps text-label-caps uppercase">
<th class="py-3 px-4 border-r border-b border-slate-border">Project</th>
<th class="py-3 px-4 border-r border-b border-slate-border">COPQ Charges</th>
<th class="py-3 px-4 border-r border-b border-slate-border">Manpower Savings</th>
<th class="py-3 px-4 border-r border-b border-slate-border">Investment</th>
<th class="py-3 px-4 border-r border-b border-slate-border bg-surface-container-high">Computed: Actuals</th>
<th class="py-3 px-4 border-b border-slate-border bg-surface-container-high">Computed: ROI</th>
</tr>
</thead>
<tbody class="font-data-tabular text-data-tabular text-on-surface" id="grid-body">
<!-- Render rows dynamically -->
</tbody>
</table>
</div>
</div>
</main>
<!-- Footer -->
<div class="sticky bottom-0 w-full bg-surface-container-lowest/80 backdrop-blur-md border-t border-slate-border py-4 z-50">
<div class="max-w-container-max-width mx-auto px-margin-desktop flex justify-between items-center">
<a href="#" id="back-btn" class="flex items-center gap-2 text-secondary hover:text-primary font-body-sm transition-colors cursor-pointer">
<span class="material-symbols-outlined text-lg">arrow_back</span>Back to Dashboard
</a>
</div>
</div>
  `;

  document.getElementById('back-btn').addEventListener('click', (e) => {
    e.preventDefault();
    renderDashboard();
  });

  const tbody = document.getElementById('grid-body');
  for(let i=0; i<15; i++) {
    tbody.innerHTML += `
      <tr class="hover:bg-surface-container/50 transition-colors">
        <td class="py-2 px-4 border-r border-b border-slate-border text-secondary font-semibold">Project ${i+1}</td>
        <td class="py-1 px-2 border-r border-b border-slate-border bg-yellow-50/30 hover:bg-surface-container-lowest transition-colors">
          <input type="number" class="w-full bg-transparent text-right font-data-tabular focus:outline-none p-1 copq" value="5000">
        </td>
        <td class="py-1 px-2 border-r border-b border-slate-border bg-yellow-50/30 hover:bg-surface-container-lowest transition-colors">
          <input type="number" class="w-full bg-transparent text-right font-data-tabular focus:outline-none p-1 mp" value="2000">
        </td>
        <td class="py-1 px-2 border-r border-b border-slate-border bg-yellow-50/30 hover:bg-surface-container-lowest transition-colors">
          <input type="number" class="w-full bg-transparent text-right font-data-tabular focus:outline-none p-1 inv" value="10000">
        </td>
        <td class="py-2 px-4 border-r border-b border-slate-border text-right font-semibold bg-surface-container-lowest text-stage-d0-blue actuals">7000</td>
        <td class="py-2 px-4 border-b border-slate-border text-right font-semibold bg-surface-container-lowest text-stage-d4-emerald roi">0.70</td>
      </tr>
    `;
  }

  // Setup reactive recalculation
  tbody.addEventListener('input', (e) => {
    if (e.target.tagName === 'INPUT') {
      const row = e.target.closest('tr');
      const copq = parseFloat(row.querySelector('.copq').value) || 0;
      const mp = parseFloat(row.querySelector('.mp').value) || 0;
      const inv = parseFloat(row.querySelector('.inv').value) || 0;
      
      const actuals = copq + mp;
      const roi = inv > 0 ? (actuals / inv).toFixed(2) : 0;
      
      row.querySelector('.actuals').textContent = actuals;
      row.querySelector('.roi').textContent = roi;
    }
  });
}


// Check auth state on load
async function init() {
  const token = localStorage.getItem('lakshya_token');
  if (token) {
    renderDashboard();
  } else {
    renderLandingPage();
  }
}

init();

function handleRouting() {
  const hash = window.location.hash || '#';
  if (!localStorage.getItem('lakshya_token') && hash !== '#login') {
    window.location.hash = '#login';
    return;
  }
  
  if (hash === '#' || hash === '#login' || hash === '#dashboard') {
    if (localStorage.getItem('lakshya_token')) renderDashboard();
    else renderLandingPage();
  } else if (hash === '#grid') {
    renderSpreadsheetGrid();
  } else if (hash.startsWith('#project/')) {
    const id = hash.split('/')[1];
    renderProjectDetail(id);
  } else if (hash === '#profile') {
    renderProfile();
  } else {
    render404();
  }
}

window.addEventListener('hashchange', handleRouting);

function render404() {
  document.title = "Page Not Found — Lakshya Innovation Portal";
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="h-screen w-full flex flex-col items-center justify-center bg-obsidian text-white">
      <h1 class="font-display-lg text-[100px] font-bold text-stage-d0-blue">404</h1>
      <h2 class="font-headline-xl text-secondary mb-8">Page not found</h2>
      <button onclick="window.location.hash='#dashboard'" class="px-6 py-3 bg-primary text-on-primary rounded font-bold hover:opacity-90">Return to Dashboard</button>
    </div>
  `;
}

async function renderProfile() {
  document.title = "Profile — Lakshya Innovation Portal";
  window.location.hash = '#profile';
  const app = document.getElementById('app');
  const user = JSON.parse(localStorage.getItem('lakshya_user') || '{}');
  const roleBadge = user.role === 'admin' ? '<span class="bg-primary text-white text-[10px] px-2 py-0.5 rounded-full uppercase ml-2">Admin</span>' : '<span class="bg-surface-variant text-secondary text-[10px] px-2 py-0.5 rounded-full uppercase ml-2">User</span>';
  
  app.innerHTML = `
    <header class="bg-surface-container-lowest border-b border-slate-border flex items-center justify-between px-4 h-16 w-full shrink-0 relative z-20">
      <div class="flex items-center gap-4">
        <div class="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold cursor-pointer" onclick="window.location.hash='#dashboard'">L</div>
        <h1 class="font-headline-lg text-headline-lg font-bold text-primary">LAKSHYA INNOVATION PORTAL</h1>
      </div>
      <div class="flex items-center gap-6">
        <button onclick="window.location.hash='#dashboard'" class="text-xs border border-slate-border px-3 py-1 rounded text-primary hover:bg-surface-container-low transition flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">arrow_back</span> Dashboard</button>
        <button data-logout-btn class="text-xs border border-slate-border px-3 py-1 rounded text-primary hover:bg-surface-container-low transition">Log Out</button>
      </div>
    </header>
    <main class="flex-1 w-full max-w-container-max-width mx-auto px-margin-desktop py-stack-lg">
      <div class="flex items-center gap-stack-md mb-stack-lg">
        <h2 class="font-headline-xl text-headline-xl font-bold text-primary">User Profile</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-stack-lg">
        <!-- Profile Info -->
        <div class="bg-surface-container-lowest border border-slate-border rounded p-gutter flex flex-col gap-stack-md relative">
          <button id="edit-profile-btn" class="absolute top-gutter right-gutter text-sm text-primary hover:underline flex items-center gap-1"><span class="material-symbols-outlined text-[16px]">edit</span> Edit</button>
          
          <h3 class="font-headline-sm font-bold text-primary border-b border-slate-border pb-2 mb-2">Personal Information</h3>
          
          <form id="profile-form" class="flex flex-col gap-4">
            <div class="flex flex-col gap-1">
              <label class="font-label-caps text-label-caps text-secondary uppercase tracking-wider">Name</label>
              <div id="name-display" class="font-body-md text-primary font-medium py-1">Loading...</div>
              <input type="text" id="name-input" class="hidden w-full p-2 border border-slate-border rounded focus:border-primary focus:ring-1 outline-none font-body-md bg-surface-container-lowest transition-colors" required minlength="2">
            </div>
            
            <div class="flex flex-col gap-1">
              <label class="font-label-caps text-label-caps text-secondary uppercase tracking-wider">Email <span class="text-xs opacity-50 lowercase normal-case ml-2">(cannot be changed)</span></label>
              <div id="email-display" class="font-body-md text-secondary py-1 cursor-not-allowed">Loading...</div>
            </div>

            <div class="flex flex-col gap-1">
              <label class="font-label-caps text-label-caps text-secondary uppercase tracking-wider">Role</label>
              <div id="role-display" class="font-body-md text-primary py-1">Loading...</div>
            </div>

            <div class="flex flex-col gap-1">
              <label class="font-label-caps text-label-caps text-secondary uppercase tracking-wider">Member Since</label>
              <div id="created-display" class="font-body-md text-secondary py-1">Loading...</div>
            </div>

            <div id="edit-actions" class="hidden flex gap-3 mt-2">
              <button type="button" id="cancel-edit-btn" class="px-4 py-2 font-body-sm font-semibold text-secondary hover:bg-surface-container-low rounded border border-transparent transition-colors">Cancel</button>
              <button type="submit" id="save-profile-btn" class="px-4 py-2 font-body-sm font-semibold bg-primary text-on-primary rounded hover:opacity-90 transition-opacity">Save Changes</button>
            </div>
          </form>
        </div>

        <!-- Security -->
        <div class="bg-surface-container-lowest border border-slate-border rounded p-gutter flex flex-col gap-stack-md">
          <h3 class="font-headline-sm font-bold text-primary border-b border-slate-border pb-2 mb-2">Security</h3>
          
          <form id="password-form" class="flex flex-col gap-4">
            <div class="flex flex-col gap-1">
              <label class="font-label-caps text-label-caps text-secondary uppercase tracking-wider">Current Password</label>
              <input type="password" id="current-password" class="w-full p-2 border border-slate-border rounded focus:border-primary focus:ring-1 outline-none font-body-md bg-surface-container-lowest transition-colors" required>
            </div>
            
            <div class="flex flex-col gap-1">
              <label class="font-label-caps text-label-caps text-secondary uppercase tracking-wider">New Password</label>
              <input type="password" id="new-password" class="w-full p-2 border border-slate-border rounded focus:border-primary focus:ring-1 outline-none font-body-md bg-surface-container-lowest transition-colors" required minlength="6">
            </div>

            <div class="flex flex-col gap-1">
              <label class="font-label-caps text-label-caps text-secondary uppercase tracking-wider">Confirm New Password</label>
              <input type="password" id="confirm-password" class="w-full p-2 border border-slate-border rounded focus:border-primary focus:ring-1 outline-none font-body-md bg-surface-container-lowest transition-colors" required minlength="6">
              <div id="password-error" class="text-error font-body-sm mt-1 hidden">Passwords do not match</div>
            </div>

            <button type="submit" id="change-password-btn" class="mt-2 px-4 py-2 font-body-sm font-semibold bg-stage-d0-blue text-white rounded hover:opacity-90 transition-opacity self-start">Update Password</button>
          </form>
        </div>
      </div>
    </main>
  `;

  // Fetch data
  let profile = {};
  try {
    profile = await api.getProfile();
  } catch(e) {
    showToast('Failed to load profile', 'error');
    window.location.hash = '#dashboard';
    return;
  }

  // Populate data
  document.getElementById('name-display').textContent = profile.name;
  document.getElementById('name-input').value = profile.name;
  document.getElementById('email-display').textContent = profile.email;
  
  const pRoleBadge = profile.role === 'admin' ? '<span class="bg-primary text-white text-[10px] px-2 py-0.5 rounded-full uppercase ml-2">Admin</span>' : '<span class="bg-surface-variant text-secondary text-[10px] px-2 py-0.5 rounded-full uppercase ml-2">User</span>';
  document.getElementById('role-display').innerHTML = (profile.role === 'admin' ? 'Administrator' : 'Standard User') + pRoleBadge;
  
  const createdDate = new Date(profile.created_at);
  document.getElementById('created-display').textContent = createdDate.toLocaleDateString() + ' (Time: ' + createdDate.toLocaleTimeString() + ')';

  // Log Out Modal
  document.querySelector('[data-logout-btn]').addEventListener('click', () => {
    showModal('Log Out', 'Log out of Lakshya Innovation System?', 'Log Out', () => {
      localStorage.removeItem('lakshya_token');
      localStorage.removeItem('lakshya_user');
      window.location.hash = '#login';
    });
  });

  // Edit Mode toggle
  const editBtn = document.getElementById('edit-profile-btn');
  const cancelBtn = document.getElementById('cancel-edit-btn');
  const nameDisplay = document.getElementById('name-display');
  const nameInput = document.getElementById('name-input');
  const editActions = document.getElementById('edit-actions');

  function toggleEdit(editing) {
    if (editing) {
      nameDisplay.classList.add('hidden');
      nameInput.classList.remove('hidden');
      editActions.classList.remove('hidden');
      editBtn.classList.add('hidden');
      nameInput.focus();
    } else {
      nameDisplay.classList.remove('hidden');
      nameInput.classList.add('hidden');
      editActions.classList.add('hidden');
      editBtn.classList.remove('hidden');
      nameInput.value = profile.name; // reset
    }
  }

  editBtn.addEventListener('click', () => toggleEdit(true));
  cancelBtn.addEventListener('click', () => toggleEdit(false));

  // Profile Save
  document.getElementById('profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const newName = nameInput.value.trim();
    if (!newName) return;
    
    const saveBtn = document.getElementById('save-profile-btn');
    saveBtn.textContent = 'Saving...';
    saveBtn.disabled = true;
    
    try {
      const updated = await api.updateProfile({ name: newName });
      profile.name = updated.name;
      nameDisplay.textContent = updated.name;
      
      // Update local storage so headers everywhere get the new name instantly
      const localUser = JSON.parse(localStorage.getItem('lakshya_user') || '{}');
      localUser.name = updated.name;
      localStorage.setItem('lakshya_user', JSON.stringify(localUser));
      
      showToast('Profile updated successfully', 'success');
      toggleEdit(false);
    } catch (err) {
      showToast('Error updating profile: ' + err.message, 'error');
    } finally {
      saveBtn.textContent = 'Save Changes';
      saveBtn.disabled = false;
    }
  });

  // Password Change
  const pwdForm = document.getElementById('password-form');
  const newPwd = document.getElementById('new-password');
  const confPwd = document.getElementById('confirm-password');
  const pwdErr = document.getElementById('password-error');

  function validatePwd() {
    if (newPwd.value !== confPwd.value) {
      pwdErr.classList.remove('hidden');
      return false;
    }
    pwdErr.classList.add('hidden');
    return true;
  }

  newPwd.addEventListener('input', validatePwd);
  confPwd.addEventListener('input', validatePwd);

  pwdForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validatePwd()) return;

    const currentPassword = document.getElementById('current-password').value;
    const newPassword = newPwd.value;
    
    const chgBtn = document.getElementById('change-password-btn');
    chgBtn.textContent = 'Updating...';
    chgBtn.disabled = true;
    
    try {
      await api.changePassword({ currentPassword, newPassword });
      showToast('Password updated successfully', 'success');
      pwdForm.reset();
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    } finally {
      chgBtn.textContent = 'Update Password';
      chgBtn.disabled = false;
    }
  });
}
