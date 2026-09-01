import { api } from './api.js';

// ==========================================
// STATE MANAGEMENT & SESSION
// ==========================================
let activeUser = null;

async function refreshActiveUser() {
  try {
    activeUser = await api.getCurrentUser();
  } catch {
    activeUser = null;
  }
  return activeUser;
}

// ==========================================
// UTILITY HELPERS: TOASTS & MODALS
// ==========================================

function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed top-3 right-3 z-50 flex flex-col gap-1.5 pointer-events-none';
    document.body.appendChild(container);
  }
  
  const toast = document.createElement('div');
  const typeStyles = {
    success: 'bg-[#16A34A] text-white border-[#15803D]',
    error: 'bg-[#DC2626] text-white border-[#B91C1C]',
    info: 'bg-[#1F3864] text-white border-[#152747]',
    warning: 'bg-[#D97706] text-white border-[#B45309]'
  };
  
  toast.className = `${typeStyles[type] || typeStyles.info} border px-3 py-2 text-xs font-sans shadow-md flex items-center justify-between min-w-[240px] pointer-events-auto transition-opacity duration-200`;
  toast.innerHTML = `
    <span class="font-medium">${message}</span>
    <button class="ml-3 text-white/80 hover:text-white font-bold text-sm leading-none focus:outline-none">&times;</button>
  `;
  
  toast.querySelector('button').onclick = () => {
    toast.classList.add('opacity-0');
    setTimeout(() => toast.remove(), 200);
  };
  
  container.appendChild(toast);
  setTimeout(() => {
    if (toast.parentElement) {
      toast.classList.add('opacity-0');
      setTimeout(() => toast.remove(), 200);
    }
  }, 3500);
}

function showModal(title, body, confirmText, onConfirm) {
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4';
  
  const modal = document.createElement('div');
  modal.className = 'bg-white border border-gray-400 shadow-xl max-w-md w-full overflow-hidden text-xs';
  
  modal.innerHTML = `
    <div class="bg-[#1F3864] text-white px-4 py-2 flex items-center justify-between">
      <h3 class="font-bold text-xs uppercase tracking-wider">${title}</h3>
      <button id="modal-x" class="text-white/80 hover:text-white font-bold text-sm leading-none">&times;</button>
    </div>
    <div class="p-4 bg-white text-gray-800">
      <p class="mb-4">${body}</p>
      <div class="flex justify-end gap-2 pt-2 border-t border-gray-200">
        <button class="px-3 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300" id="modal-cancel">Cancel</button>
        <button class="px-3 py-1.5 text-xs font-semibold bg-[#1F3864] hover:bg-[#152747] text-white border border-[#152747]" id="modal-confirm">${confirmText}</button>
      </div>
    </div>
  `;
  
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  
  const close = () => overlay.remove();
  overlay.querySelector('#modal-x').onclick = close;
  overlay.querySelector('#modal-cancel').onclick = close;
  overlay.querySelector('#modal-confirm').onclick = () => {
    close();
    if (onConfirm) onConfirm();
  };
}

// ==========================================
// TOP NAVBAR COMPONENT
// ==========================================

function getTopNavHtml(activeTab = 'dashboard') {
  const user = activeUser || { name: 'User', email: '', role: 'member' };
  const userName = user.name || (user.email ? user.email.split('@')[0] : 'User');
  const userRole = (user.role || 'member').toUpperCase();
  const isAdmin = user.role === 'admin';
  
  return `
    <header class="bg-[#1F3864] text-white border-b border-[#152747] px-4 py-2.5 flex flex-wrap items-center justify-between shadow-sm select-none">
      <div class="flex items-center gap-3">
        <div class="bg-[#2F5597] text-white font-bold text-xs px-2 py-0.5 border border-white/30 tracking-wider">
          LAKSHYA
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-sm text-white tracking-wide uppercase">STAGE-GATE PIPELINE DASHBOARD</span>
          <span class="text-[10px] text-[#D9E1F2] hidden sm:block">Innovation &amp; Operational Excellence Portal</span>
        </div>
      </div>
      
      <div class="flex items-center gap-2 mt-2 sm:mt-0 text-xs">
        <div class="hidden md:flex items-center gap-1.5 text-white/90 mr-2 border-r border-white/20 pr-3">
          <span>User: <strong class="text-white">${userName}</strong> <span class="text-gray-300">(${user.email || ''})</span></span>
          <span class="text-[10px] ${isAdmin ? 'bg-[#2563EB] text-white' : 'bg-white/20 text-white'} px-1.5 py-0.2 border border-white/30 font-semibold uppercase">[${userRole}]</span>
        </div>
        
        <button onclick="window.location.hash='#dashboard'" class="px-2.5 py-1 text-xs border ${activeTab === 'dashboard' ? 'bg-white text-[#1F3864] font-bold border-white' : 'bg-white/10 hover:bg-white/20 text-white border-white/30'} transition">
          ${isAdmin ? 'My Dashboard' : 'Dashboard'}
        </button>
        
        ${isAdmin ? `
          <button onclick="window.location.hash='#admin'" class="px-2.5 py-1 text-xs border ${activeTab === 'admin' ? 'bg-white text-[#1F3864] font-bold border-white' : 'bg-white/10 hover:bg-white/20 text-white border-white/30'} transition">
            All Projects (Admin)
          </button>
        ` : ''}

        <button id="btn-new-idea-nav" class="px-2.5 py-1 text-xs border bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold border-green-700 transition">
          + New Idea
        </button>
        <button onclick="window.location.hash='#profile'" class="px-2.5 py-1 text-xs border ${activeTab === 'profile' ? 'bg-white text-[#1F3864] font-bold border-white' : 'bg-white/10 hover:bg-white/20 text-white border-white/30'} transition">
          Profile
        </button>
        <button id="btn-logout-nav" class="px-2.5 py-1 text-xs border bg-white/10 hover:bg-white/20 text-white border-white/30 transition">
          Log Out
        </button>
      </div>
    </header>
  `;
}

function bindNavEvents() {
  const newIdeaBtn = document.getElementById('btn-new-idea-nav');
  if (newIdeaBtn) {
    newIdeaBtn.addEventListener('click', () => showNewIdeaModal());
  }
  const logoutBtn = document.getElementById('btn-logout-nav');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await api.signOut();
      activeUser = null;
      window.location.hash = '#signin';
    });
  }
}

// Password toggle helper
function attachPasswordToggle(inputId, toggleBtnId) {
  const input = document.getElementById(inputId);
  const btn = document.getElementById(toggleBtnId);
  if (!input || !btn) return;

  btn.addEventListener('click', () => {
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    btn.innerHTML = isPassword
      ? `<svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"/></svg>`
      : `<svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>`;
  });
}

// ==========================================
// 1. SIGN IN PAGE (#signin)
// ==========================================

function renderSignIn(flashMsg = '') {
  document.title = "Sign In — Lakshya Innovation Portal";
  const app = document.getElementById('app');

  app.innerHTML = `
    <div class="min-h-screen bg-[#F1F5F9] flex flex-col justify-center items-center p-4 text-xs font-sans">
      <div class="max-w-md w-full auth-card overflow-hidden">
        
        <div class="auth-header text-white p-5 text-center border-b border-[#152747]">
          <div class="inline-block bg-[#2F5597] text-white font-bold text-xs px-2.5 py-0.5 border border-white/30 tracking-widest mb-1.5 rounded-sm">
            LAKSHYA
          </div>
          <h1 class="text-base font-bold uppercase tracking-wider text-white">Stage-Gate Innovation Portal</h1>
          <p class="text-xs text-[#D9E1F2] mt-0.5">Enterprise Portal Authentication</p>
        </div>

        <form id="signin-form" class="p-6 space-y-4 bg-white text-gray-800">
          ${flashMsg ? `
            <div id="signin-flash" class="bg-green-50 border border-green-300 text-green-800 p-2.5 rounded text-xs flex items-center gap-2">
              <span>✔</span>
              <span>${flashMsg}</span>
            </div>
          ` : ''}

          <div id="signin-error" class="hidden text-red-600 text-xs p-3 bg-red-50 border border-red-200 rounded leading-relaxed"></div>

          <!-- Unverified account banner -->
          <div id="signin-unverified" class="hidden bg-amber-50 border border-amber-300 text-amber-900 p-3.5 rounded text-xs">
            <div class="flex items-start gap-2">
              <span class="text-base leading-none text-amber-600">⚠️</span>
              <div class="flex-1">
                <p class="font-bold mb-1">Email verification required</p>
                <p class="mb-2 text-gray-700 leading-normal">
                  Your account has been created, but your email address <strong id="unverified-email-txt"></strong> is not yet verified. Please check your inbox and click the verification link.
                </p>
                <div class="flex items-center gap-2 pt-1">
                  <button type="button" id="btn-resend-verify" class="px-3 py-1.5 bg-[#1F3864] hover:bg-[#152747] text-white font-semibold text-xs rounded transition flex items-center gap-1.5">
                    <span>Resend Verification Email</span>
                  </button>
                  <span id="resend-status" class="text-[11px] text-green-700 font-medium hidden"></span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label class="block font-semibold text-gray-700 mb-1" for="signin-email">Corporate Email Address</label>
            <input type="email" id="signin-email" required placeholder="name@company.com" class="auth-input" />
          </div>

          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="font-semibold text-gray-700" for="signin-pwd">Password</label>
              <a href="#forgot-password" class="text-xs text-[#1F3864] hover:underline font-medium">Forgot password?</a>
            </div>
            <div class="relative">
              <input type="password" id="signin-pwd" required placeholder="••••••••" class="auth-input pr-10" />
              <button type="button" id="toggle-signin-pwd" class="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 focus:outline-none">
                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              </button>
            </div>
          </div>

          <!-- Quick Fill Role Presets for Testing / Demo -->
          <div class="bg-gray-50 border border-gray-200 p-2.5 rounded text-xs">
            <div class="text-[11px] text-gray-500 font-semibold uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Quick Login Presets:</span>
              <span class="text-[10px] text-blue-600 font-normal">Click to autofill</span>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <button type="button" id="fill-admin-btn" class="py-1 px-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 rounded font-semibold text-left transition flex items-center justify-between">
                <span>Admin</span>
                <span class="text-[10px] text-purple-600 font-mono">admin@lakshya.com</span>
              </button>
              <button type="button" id="fill-user-btn" class="py-1 px-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 rounded font-semibold text-left transition flex items-center justify-between">
                <span>Employee</span>
                <span class="text-[10px] text-blue-600 font-mono">vikram@lakshya.com</span>
              </button>
            </div>
          </div>

          <div class="pt-2">
            <button type="submit" id="btn-signin-submit" class="auth-btn-primary">
              Sign In
            </button>
          </div>

          <div class="text-center pt-3 border-t border-gray-200 text-xs text-gray-600">
            Don't have an account yet? 
            <a href="#signup" class="text-[#1F3864] font-bold hover:underline ml-1">Create Account</a>
          </div>
        </form>

      </div>
      <div class="text-center mt-4 text-gray-500 text-[11px]">
        Lakshya Innovation &amp; Operational Excellence System &bull; Enterprise Secure
      </div>
    </div>
  `;

  attachPasswordToggle('signin-pwd', 'toggle-signin-pwd');

  // Wire quick autofill buttons
  const emailInput = document.getElementById('signin-email');
  const pwdInput = document.getElementById('signin-pwd');
  const fillAdmin = document.getElementById('fill-admin-btn');
  const fillUser = document.getElementById('fill-user-btn');

  if (fillAdmin) {
    fillAdmin.addEventListener('click', () => {
      emailInput.value = 'admin@lakshya.com';
      pwdInput.value = 'Password123!';
      showToast('Admin credentials filled!', 'success');
    });
  }

  if (fillUser) {
    fillUser.addEventListener('click', () => {
      emailInput.value = '93.shubhampanjiyara@gmail.com';
      pwdInput.value = 'Password123!';
      showToast('User credentials filled!', 'success');
    });
  }

  const form = document.getElementById('signin-form');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signin-email').value.trim();
    const password = document.getElementById('signin-pwd').value;
    const errorEl = document.getElementById('signin-error');
    const unverifiedEl = document.getElementById('signin-unverified');
    const unverifiedEmailTxt = document.getElementById('unverified-email-txt');
    const submitBtn = document.getElementById('btn-signin-submit');

    errorEl.classList.add('hidden');
    unverifiedEl.classList.add('hidden');
    errorEl.textContent = '';
    submitBtn.textContent = 'Authenticating...';
    submitBtn.disabled = true;

    try {
      await api.signIn(email, password);
      await refreshActiveUser();
      if (activeUser?.role === 'admin') {
        window.location.hash = '#dashboard';
      } else {
        window.location.hash = '#dashboard';
      }
    } catch (err) {
      if (err.unverified || (err.message && err.message.toLowerCase().includes('not verified'))) {
        unverifiedEmailTxt.textContent = email;
        unverifiedEl.classList.remove('hidden');

        // Wire up resend verification
        const resendBtn = document.getElementById('btn-resend-verify');
        const resendStatus = document.getElementById('resend-status');
        resendBtn.onclick = async () => {
          resendBtn.textContent = 'Sending...';
          resendBtn.disabled = true;
          try {
            await api.resendVerification(email);
            resendStatus.textContent = 'Verification email sent! Check inbox & spam.';
            resendStatus.className = 'text-[11px] text-green-700 font-semibold block';
            resendBtn.textContent = 'Resend Verification Email';
          } catch (resendErr) {
            resendStatus.textContent = resendErr.message || 'Failed to resend email.';
            resendStatus.className = 'text-[11px] text-red-600 font-medium block';
            resendBtn.textContent = 'Resend Verification Email';
            resendBtn.disabled = false;
          }
        };
      } else {
        errorEl.textContent = err.message || 'Invalid email or password. Please check your credentials.';
        errorEl.classList.remove('hidden');
      }
      submitBtn.textContent = 'Sign In';
      submitBtn.disabled = false;
    }
  });
}

// ==========================================
// 2. SIGN UP PAGE (#signup)
// ==========================================

function renderSignUp() {
  document.title = "Create Account — Lakshya Innovation Portal";
  const app = document.getElementById('app');

  app.innerHTML = `
    <div class="min-h-screen bg-[#F1F5F9] flex flex-col justify-center items-center p-4 text-xs font-sans">
      <div class="max-w-md w-full auth-card overflow-hidden">
        
        <div class="auth-header text-white p-5 text-center border-b border-[#152747]">
          <div class="inline-block bg-[#2F5597] text-white font-bold text-xs px-2.5 py-0.5 border border-white/30 tracking-widest mb-1.5 rounded-sm">
            LAKSHYA
          </div>
          <h1 class="text-base font-bold uppercase tracking-wider text-white">Create Account</h1>
          <p class="text-xs text-[#D9E1F2] mt-0.5">Register for Lakshya Innovation Portal</p>
        </div>

        <div id="signup-container" class="p-6 bg-white text-gray-800">
          <form id="signup-form" class="space-y-3.5">
            <div id="signup-error" class="hidden text-red-600 text-xs p-3 bg-red-50 border border-red-200 rounded"></div>

            <div>
              <label class="block font-semibold text-gray-700 mb-1" for="signup-role">Account Type</label>
              <select id="signup-role" class="auth-input">
                <option value="admin">Admin</option>
                <option value="user" selected>Employee</option>
                <option value="customer">Customer</option>
              </select>
            </div>

            <div>
              <label class="block font-semibold text-gray-700 mb-1" for="signup-name">Full Name</label>
              <input type="text" id="signup-name" required placeholder="e.g. Rahul Sharma" class="auth-input" />
            </div>

            <div>
              <label class="block font-semibold text-gray-700 mb-1" for="signup-email">Corporate Email Address</label>
              <input type="email" id="signup-email" required placeholder="name@company.com" class="auth-input" />
            </div>

            <div>
              <label class="block font-semibold text-gray-700 mb-1" for="signup-pwd">
                Password <span class="text-gray-400 font-normal text-[11px]">(Min. 8 characters)</span>
              </label>
              <div class="relative">
                <input type="password" id="signup-pwd" required minlength="8" placeholder="••••••••" class="auth-input pr-10" />
                <button type="button" id="toggle-signup-pwd" class="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 focus:outline-none">
                  <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                </button>
              </div>
            </div>

            <div>
              <label class="block font-semibold text-gray-700 mb-1" for="signup-confirm-pwd">Confirm Password</label>
              <div class="relative">
                <input type="password" id="signup-confirm-pwd" required minlength="8" placeholder="••••••••" class="auth-input pr-10" />
                <button type="button" id="toggle-signup-confirm-pwd" class="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 focus:outline-none">
                  <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                </button>
              </div>
            </div>

            <div class="pt-2">
              <button type="submit" id="btn-signup-submit" class="auth-btn-primary">
                Create Account
              </button>
            </div>

            <div class="text-center pt-3 border-t border-gray-200 text-xs text-gray-600">
              Already have an account? 
              <a href="#signin" class="text-[#1F3864] font-bold hover:underline ml-1">Sign In</a>
            </div>
          </form>
        </div>

      </div>
      <div class="text-center mt-4 text-gray-500 text-[11px]">
        Lakshya Innovation &amp; Operational Excellence System
      </div>
    </div>
  `;

  attachPasswordToggle('signup-pwd', 'toggle-signup-pwd');
  attachPasswordToggle('signup-confirm-pwd', 'toggle-signup-confirm-pwd');

  document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const role = document.getElementById('signup-role').value;
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-pwd').value;
    const confirmPwd = document.getElementById('signup-confirm-pwd').value;
    const errorEl = document.getElementById('signup-error');
    const submitBtn = document.getElementById('btn-signup-submit');

    errorEl.classList.add('hidden');

    if (password !== confirmPwd) {
      errorEl.textContent = 'Passwords do not match. Please verify your confirmation password.';
      errorEl.classList.remove('hidden');
      return;
    }

    if (password.length < 8) {
      errorEl.textContent = 'Password must be at least 8 characters long.';
      errorEl.classList.remove('hidden');
      return;
    }

    submitBtn.textContent = 'Creating account & sending email...';
    submitBtn.disabled = true;

    try {
      await api.signUp(email, password, name, role);

      // Render dedicated success view
      const container = document.getElementById('signup-container');
      container.innerHTML = `
        <div class="text-center py-4 space-y-4">
          <div class="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-2xl animate-check shadow-inner">
            ✉️
          </div>
          <div>
            <h2 class="text-base font-bold text-gray-800">Verification Email Sent!</h2>
            <p class="text-xs text-gray-600 mt-1">
              We've dispatched a confirmation link to:
            </p>
            <div class="mt-2 bg-[#F1F5F9] border border-gray-300 py-1.5 px-3 rounded font-mono font-bold text-[#1F3864] text-xs inline-block">
              ${email}
            </div>
          </div>
          
          <div class="bg-blue-50 border border-blue-200 text-blue-900 p-3 rounded text-left text-xs leading-relaxed">
            <p class="font-bold mb-1">What to do next:</p>
            <ol class="list-decimal list-inside space-y-1 text-gray-700">
              <li>Check your inbox for an email from <strong>Lakshya Portal</strong>.</li>
              <li>Click the <strong>Verify Email Address</strong> button inside.</li>
              <li>Return to sign in to access your dashboard.</li>
            </ol>
            <p class="text-[11px] text-gray-500 mt-2">Check your Spam / Junk folder if not received in 1-2 minutes.</p>
          </div>

          <div class="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
            <button id="btn-signup-resend" class="w-full sm:w-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 font-semibold text-xs rounded transition">
              Resend Email
            </button>
            <a href="#signin" class="w-full sm:w-auto px-5 py-2 bg-[#1F3864] hover:bg-[#152747] text-white font-bold text-xs rounded text-center transition">
              Proceed to Sign In
            </a>
          </div>
          <div id="signup-resend-status" class="text-xs text-green-700 font-medium hidden"></div>
        </div>
      `;

      const resendBtn = document.getElementById('btn-signup-resend');
      const resendStatus = document.getElementById('signup-resend-status');
      resendBtn.onclick = async () => {
        resendBtn.textContent = 'Sending...';
        resendBtn.disabled = true;
        try {
          await api.resendVerification(email);
          resendStatus.textContent = 'Fresh verification email dispatched successfully!';
          resendStatus.classList.remove('hidden');
          resendBtn.textContent = 'Resend Email';
        } catch (resendErr) {
          resendStatus.textContent = resendErr.message || 'Failed to resend email.';
          resendStatus.className = 'text-xs text-red-600 font-medium';
          resendStatus.classList.remove('hidden');
          resendBtn.textContent = 'Resend Email';
          resendBtn.disabled = false;
        }
      };

    } catch (err) {
      errorEl.textContent = err.message || 'Error creating account. Please try again.';
      errorEl.classList.remove('hidden');
      submitBtn.textContent = 'Create Account';
      submitBtn.disabled = false;
    }
  });
}

// ==========================================
// 3. EMAIL VERIFICATION PAGE (#verify)
// ==========================================

async function renderVerifyEmail(tokenParam = null) {
  document.title = "Verify Email — Lakshya Innovation Portal";
  const app = document.getElementById('app');

  // Extract token from param or URL hash / search
  let token = tokenParam;
  if (!token) {
    const hashPart = window.location.hash.split('?')[1] || '';
    const searchPart = window.location.search.replace('?', '') || '';
    const params = new URLSearchParams(hashPart || searchPart);
    token = params.get('token');
  }

  app.innerHTML = `
    <div class="min-h-screen bg-[#F1F5F9] flex flex-col justify-center items-center p-4 text-xs font-sans">
      <div class="max-w-md w-full auth-card overflow-hidden">
        
        <div class="auth-header text-white p-5 text-center border-b border-[#152747]">
          <div class="inline-block bg-[#2F5597] text-white font-bold text-xs px-2.5 py-0.5 border border-white/30 tracking-widest mb-1.5 rounded-sm">
            LAKSHYA
          </div>
          <h1 class="text-base font-bold uppercase tracking-wider text-white">Email Verification</h1>
          <p class="text-xs text-[#D9E1F2] mt-0.5">Account Activation</p>
        </div>

        <div id="verify-content" class="p-6 bg-white text-gray-800 text-center">
          ${token ? `
            <div class="py-8 space-y-3">
              <div class="inline-block w-8 h-8 border-4 border-[#1F3864] border-t-transparent rounded-full animate-spin"></div>
              <p class="font-bold text-gray-700 text-sm">Verifying your email address...</p>
              <p class="text-gray-500 text-xs">Please wait while we confirm your credentials.</p>
            </div>
          ` : `
            <div class="space-y-4 py-2">
              <p class="text-gray-700">Need a verification link? Enter your registered email address below:</p>
              <form id="manual-verify-form" class="space-y-3">
                <input type="email" id="manual-verify-email" required placeholder="name@company.com" class="auth-input text-left" />
                <button type="submit" id="btn-manual-verify" class="auth-btn-primary">
                  Send Verification Link
                </button>
              </form>
              <div id="manual-verify-msg" class="hidden text-xs p-2.5 rounded"></div>
              <div class="pt-2 border-t border-gray-200">
                <a href="#signin" class="text-[#1F3864] font-semibold hover:underline">Back to Sign In</a>
              </div>
            </div>
          `}
        </div>

      </div>
      <div class="text-center mt-4 text-gray-500 text-[11px]">
        Lakshya Innovation &amp; Operational Excellence System
      </div>
    </div>
  `;

  if (token) {
    const content = document.getElementById('verify-content');
    try {
      const res = await api.verifyEmail(token);
      await refreshActiveUser();

      content.innerHTML = `
        <div class="py-4 space-y-4">
          <div class="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-3xl animate-check shadow-sm">
            ✔
          </div>
          <div>
            <h2 class="text-lg font-bold text-gray-800">Email Verified Successfully!</h2>
            <p class="text-xs text-gray-600 mt-1">
              Your account (${res.user?.email || 'Verified User'}) is now active.
            </p>
          </div>
          <div class="bg-green-50 border border-green-200 text-green-800 p-3 rounded text-xs">
            You have full access to the Stage-Gate Pipeline &amp; Innovation Portal.
          </div>
          <div class="pt-2">
            <a href="#dashboard" class="inline-block w-full py-2.5 bg-[#1F3864] hover:bg-[#152747] text-white font-bold text-xs uppercase tracking-wider rounded transition">
              Go to Dashboard
            </a>
          </div>
        </div>
      `;
    } catch (err) {
      content.innerHTML = `
        <div class="py-4 space-y-4">
          <div class="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-3xl shadow-sm">
            ✕
          </div>
          <div>
            <h2 class="text-base font-bold text-red-700">Verification Link Invalid or Expired</h2>
            <p class="text-xs text-gray-600 mt-1">
              ${err.message || 'This confirmation link has expired or is invalid.'}
            </p>
          </div>
          
          <div class="bg-gray-50 border border-gray-300 p-3.5 rounded text-left space-y-2 text-xs">
            <p class="font-bold text-gray-700">Request a new verification link:</p>
            <form id="retry-verify-form" class="space-y-2">
              <input type="email" id="retry-verify-email" required placeholder="name@company.com" class="auth-input" />
              <button type="submit" id="btn-retry-verify" class="w-full py-2 bg-[#1F3864] hover:bg-[#152747] text-white font-semibold text-xs rounded transition">
                Send New Verification Email
              </button>
            </form>
            <div id="retry-status" class="hidden text-xs p-2 rounded"></div>
          </div>

          <div class="pt-2 border-t border-gray-200">
            <a href="#signin" class="text-[#1F3864] font-semibold hover:underline">Back to Sign In</a>
          </div>
        </div>
      `;

      const retryForm = document.getElementById('retry-verify-form');
      if (retryForm) {
        retryForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const email = document.getElementById('retry-verify-email').value.trim();
          const statusEl = document.getElementById('retry-status');
          const btn = document.getElementById('btn-retry-verify');
          btn.textContent = 'Sending...';
          btn.disabled = true;

          try {
            await api.resendVerification(email);
            statusEl.textContent = 'Fresh verification email dispatched! Please check your inbox.';
            statusEl.className = 'bg-green-50 border border-green-200 text-green-800 text-xs p-2.5 rounded block';
            btn.textContent = 'Email Sent';
          } catch (retryErr) {
            statusEl.textContent = retryErr.message || 'Error resending verification email.';
            statusEl.className = 'bg-red-50 border border-red-200 text-red-800 text-xs p-2.5 rounded block';
            btn.textContent = 'Send New Verification Email';
            btn.disabled = false;
          }
        });
      }
    }
  } else {
    // Wire up manual verify form
    const manualForm = document.getElementById('manual-verify-form');
    if (manualForm) {
      manualForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('manual-verify-email').value.trim();
        const msgEl = document.getElementById('manual-verify-msg');
        const btn = document.getElementById('btn-manual-verify');
        btn.textContent = 'Sending...';
        btn.disabled = true;

        try {
          await api.resendVerification(email);
          msgEl.textContent = 'Verification email dispatched! Please check your inbox.';
          msgEl.className = 'bg-green-50 border border-green-200 text-green-800 text-xs p-2.5 rounded block text-left';
          btn.textContent = 'Email Sent';
        } catch (mErr) {
          msgEl.textContent = mErr.message || 'Error sending verification email.';
          msgEl.className = 'bg-red-50 border border-red-200 text-red-800 text-xs p-2.5 rounded block text-left';
          btn.textContent = 'Send Verification Link';
          btn.disabled = false;
        }
      });
    }
  }
}

// ==========================================
// 4. FORGOT PASSWORD PAGE (#forgot-password)
// ==========================================

function renderForgotPassword() {
  document.title = "Forgot Password — Lakshya Innovation Portal";
  const app = document.getElementById('app');

  app.innerHTML = `
    <div class="min-h-screen bg-[#F1F5F9] flex flex-col justify-center items-center p-4 text-xs font-sans">
      <div class="max-w-md w-full auth-card overflow-hidden">
        
        <div class="auth-header text-white p-5 text-center border-b border-[#152747]">
          <div class="inline-block bg-[#2F5597] text-white font-bold text-xs px-2.5 py-0.5 border border-white/30 tracking-widest mb-1.5 rounded-sm">
            LAKSHYA
          </div>
          <h1 class="text-base font-bold uppercase tracking-wider text-white">Reset Password</h1>
          <p class="text-xs text-[#D9E1F2] mt-0.5">Password Recovery Service</p>
        </div>

        <form id="forgot-form" class="p-6 space-y-4 bg-white text-gray-800">
          <div id="forgot-message" class="hidden p-3 rounded text-xs"></div>

          <div>
            <label class="block font-semibold text-gray-700 mb-1" for="forgot-email">Corporate Email Address</label>
            <input type="email" id="forgot-email" required placeholder="name@company.com" class="auth-input" />
            <p class="text-[11px] text-gray-500 mt-1">We will send a password reset link to this email address.</p>
          </div>

          <div class="pt-1">
            <button type="submit" id="btn-forgot-submit" class="auth-btn-primary">
              Send Reset Link
            </button>
          </div>

          <div class="text-center pt-3 border-t border-gray-200 text-xs">
            <a href="#signin" class="text-[#1F3864] font-bold hover:underline">&larr; Back to Sign In</a>
          </div>
        </form>

      </div>
      <div class="text-center mt-4 text-gray-500 text-[11px]">
        Lakshya Innovation &amp; Operational Excellence System
      </div>
    </div>
  `;

  document.getElementById('forgot-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('forgot-email').value.trim();
    const msgEl = document.getElementById('forgot-message');
    const submitBtn = document.getElementById('btn-forgot-submit');

    msgEl.className = 'hidden';
    submitBtn.textContent = 'Sending link...';
    submitBtn.disabled = true;

    try {
      await api.forgotPassword(email);
      msgEl.textContent = 'If an account exists with this email, a password reset link has been dispatched. Please check your inbox and spam folder.';
      msgEl.className = 'bg-green-50 border border-green-300 text-green-800 p-3 rounded text-xs block leading-relaxed';
      submitBtn.textContent = 'Link Sent';
    } catch (err) {
      msgEl.textContent = err.message || 'Error sending password reset email.';
      msgEl.className = 'bg-red-50 border border-red-300 text-red-800 p-3 rounded text-xs block';
      submitBtn.textContent = 'Send Reset Link';
      submitBtn.disabled = false;
    }
  });
}

// ==========================================
// 5. RESET PASSWORD PAGE (#reset-password)
// ==========================================

function renderResetPassword(tokenParam = null) {
  document.title = "Choose New Password — Lakshya Innovation Portal";
  const app = document.getElementById('app');

  let token = tokenParam;
  if (!token) {
    const hashPart = window.location.hash.split('?')[1] || '';
    const searchPart = window.location.search.replace('?', '') || '';
    const params = new URLSearchParams(hashPart || searchPart);
    token = params.get('token');
  }

  if (!token) {
    app.innerHTML = `
      <div class="min-h-screen bg-[#F1F5F9] flex flex-col justify-center items-center p-4 text-xs font-sans">
        <div class="max-w-md w-full auth-card overflow-hidden p-6 text-center">
          <h2 class="text-base font-bold text-red-700">Missing Reset Token</h2>
          <p class="text-gray-600 mt-2 mb-4">No password reset token was provided in the link.</p>
          <a href="#forgot-password" class="auth-btn-primary inline-block">Request New Reset Link</a>
        </div>
      </div>
    `;
    return;
  }

  app.innerHTML = `
    <div class="min-h-screen bg-[#F1F5F9] flex flex-col justify-center items-center p-4 text-xs font-sans">
      <div class="max-w-md w-full auth-card overflow-hidden">
        
        <div class="auth-header text-white p-5 text-center border-b border-[#152747]">
          <div class="inline-block bg-[#2F5597] text-white font-bold text-xs px-2.5 py-0.5 border border-white/30 tracking-widest mb-1.5 rounded-sm">
            LAKSHYA
          </div>
          <h1 class="text-base font-bold uppercase tracking-wider text-white">Create New Password</h1>
          <p class="text-xs text-[#D9E1F2] mt-0.5">Password Recovery</p>
        </div>

        <form id="reset-pwd-form" class="p-6 space-y-4 bg-white text-gray-800">
          <div id="reset-error" class="hidden text-red-600 text-xs p-3 bg-red-50 border border-red-200 rounded"></div>

          <div>
            <label class="block font-semibold text-gray-700 mb-1" for="new-pwd">
              New Password <span class="text-gray-400 font-normal text-[11px]">(Min. 8 characters)</span>
            </label>
            <div class="relative">
              <input type="password" id="new-pwd" required minlength="8" placeholder="••••••••" class="auth-input pr-10" />
              <button type="button" id="toggle-new-pwd" class="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 focus:outline-none">
                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              </button>
            </div>
          </div>

          <div>
            <label class="block font-semibold text-gray-700 mb-1" for="confirm-new-pwd">Confirm New Password</label>
            <div class="relative">
              <input type="password" id="confirm-new-pwd" required minlength="8" placeholder="••••••••" class="auth-input pr-10" />
              <button type="button" id="toggle-confirm-new-pwd" class="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 focus:outline-none">
                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              </button>
            </div>
          </div>

          <div class="pt-2">
            <button type="submit" id="btn-reset-submit" class="auth-btn-primary">
              Update Password
            </button>
          </div>

          <div class="text-center pt-3 border-t border-gray-200 text-xs">
            <a href="#signin" class="text-[#1F3864] font-bold hover:underline">&larr; Back to Sign In</a>
          </div>
        </form>

      </div>
    </div>
  `;

  attachPasswordToggle('new-pwd', 'toggle-new-pwd');
  attachPasswordToggle('confirm-new-pwd', 'toggle-confirm-new-pwd');

  document.getElementById('reset-pwd-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const newPwd = document.getElementById('new-pwd').value;
    const confirmPwd = document.getElementById('confirm-new-pwd').value;
    const errorEl = document.getElementById('reset-error');
    const submitBtn = document.getElementById('btn-reset-submit');

    errorEl.classList.add('hidden');

    if (newPwd !== confirmPwd) {
      errorEl.textContent = 'Passwords do not match.';
      errorEl.classList.remove('hidden');
      return;
    }

    if (newPwd.length < 8) {
      errorEl.textContent = 'Password must be at least 8 characters long.';
      errorEl.classList.remove('hidden');
      return;
    }

    submitBtn.textContent = 'Updating password...';
    submitBtn.disabled = true;

    try {
      await api.resetPassword(token, newPwd);
      renderSignIn('Your password has been updated successfully! Please sign in with your new password.');
    } catch (err) {
      errorEl.textContent = err.message || 'Error updating password.';
      errorEl.classList.remove('hidden');
      submitBtn.textContent = 'Update Password';
      submitBtn.disabled = false;
    }
  });
}


// ==========================================
// 4. MAIN DASHBOARD PAGE (#dashboard)
// ==========================================

async function renderDashboard() {
  document.title = "Stage-Gate Pipeline Dashboard — Lakshya";
  window.location.hash = '#dashboard';
  const app = document.getElementById('app');
  
  app.innerHTML = `
    ${getTopNavHtml('dashboard')}
    <main class="p-4 max-w-[1440px] mx-auto text-gray-800">
      <div class="p-8 text-center text-gray-500 font-sans text-xs">
        Loading stage-gate initiatives...
      </div>
    </main>
  `;
  bindNavEvents();

  let apiSummary = { stageCounts: [], analytics: { totalActive: 0, avgTimeInStage: 0, completedThisMonth: 0 } };
  let summary = [];
  let projects = [];
  try {
    [apiSummary, projects] = await Promise.all([
      api.getDashboardSummary(),
      api.getProjects()
    ]);
    summary = apiSummary.stageCounts || [];
  } catch (err) {
    console.error("Failed to load dashboard data", err);
  }

  const getCount = (stage) => {
    const stat = summary.find(s => s.current_stage?.toUpperCase() === stage.toUpperCase());
    return stat ? parseInt(stat.count, 10) : 0;
  };
  
  const analytics = apiSummary.analytics || { totalActive: projects.length, avgTimeInStage: 14, completedThisMonth: getCount('D4') };
  const isAdmin = activeUser?.role === 'admin';

  // Get unique owners for admin filter dropdown
  const uniqueOwners = [...new Set(projects.map(p => p.suggester_name || p.suggester_email).filter(Boolean))].sort();

  const stagesList = [
    { id: 'D0', name: 'D0 Validation', desc: 'Potential & Strategy', color: '#2563EB' },
    { id: 'D1', name: 'D1 Score Matrix', desc: 'Value Levers & Scoring', color: '#D97706' },
    { id: 'D2', name: 'D2 Sign-Off', desc: 'Gate Approval', color: '#EA580C' },
    { id: 'D3', name: 'D3 Implementation', desc: 'Execution & Milestones', color: '#4F46E5' },
    { id: 'D4', name: 'D4 Completed', desc: 'Value Realized', color: '#16A34A' }
  ];

  app.innerHTML = `
    ${getTopNavHtml('dashboard')}
    
    <main class="p-3 md:p-4 max-w-[1440px] mx-auto text-gray-900">
      
      <!-- Top Title & Scope Row -->
      <div class="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-gray-300">
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-base font-bold text-[#1F3864] uppercase tracking-tight">IDEA PIPELINE DASHBOARD</h2>
            <span class="text-[11px] px-2 py-0.5 font-bold ${isAdmin ? 'bg-[#1F3864] text-white' : 'bg-gray-100 text-gray-700 border border-gray-300'} uppercase">
              ${isAdmin ? 'Scope: All Projects (Admin View)' : 'Scope: My Projects'}
            </span>
          </div>
          <p class="text-xs text-gray-500 mt-0.5">
            ${isAdmin ? 'Company-wide portfolio of innovation initiatives across all workstreams.' : 'Track, update, and progress your active innovation initiatives.'}
          </p>
        </div>

        <div class="flex items-center gap-4 text-xs font-mono bg-[#F8FAFC] border border-gray-300 px-3 py-1.5">
          <span>Active Initiatives: <strong class="text-[#1F3864] font-bold">${analytics.totalActive}</strong></span>
          <span class="text-gray-300">|</span>
          <span>Completed in D4: <strong class="text-[#16A34A] font-bold">${getCount('D4')}</strong></span>
        </div>
      </div>

      <!-- 5 Stage Summary Boxes (Live Dynamic Counts scoped by RLS) -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mb-3">
        ${stagesList.map(s => `
          <div class="stage-filter-box bg-white border border-gray-300 p-2.5 cursor-pointer hover:bg-gray-50 transition" style="border-left: 4px solid ${s.color};" data-stage="${s.id}">
            <div class="flex justify-between items-start">
              <span class="text-[11px] font-bold text-gray-700 uppercase tracking-wide">${s.name}</span>
              <span class="text-[10px] text-gray-400 font-mono">[${s.id}]</span>
            </div>
            <div class="mt-1 flex items-baseline justify-between">
              <span class="text-xl font-bold text-[#1F3864] font-mono">${getCount(s.id)}</span>
              <span class="text-[11px] text-gray-500">Ideas</span>
            </div>
            <div class="text-[10px] text-gray-400 mt-0.5 truncate">${s.desc}</div>
          </div>
        `).join('')}
      </div>

      <!-- Toolbar: Search, Filters & Actions -->
      <div class="bg-[#F1F5F9] border border-gray-300 p-2 mb-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div class="flex flex-wrap items-center gap-2">
          <div class="flex items-center gap-1.5">
            <label class="font-semibold text-gray-700 whitespace-nowrap">Search:</label>
            <input id="dashboard-search" type="text" placeholder="Title, ID, Suggester..." class="bg-white border border-gray-300 px-2 py-1 w-44 sm:w-56 text-xs focus:outline-none focus:border-[#1F3864]" />
          </div>
          
          <div class="flex items-center gap-1.5">
            <label class="font-semibold text-gray-700 whitespace-nowrap">Stage:</label>
            <select id="dashboard-stage-filter" class="bg-white border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:border-[#1F3864]">
              <option value="ALL">All Stages</option>
              <option value="D0">D0 Validation</option>
              <option value="D1">D1 Score Matrix</option>
              <option value="D2">D2 Sign-Off</option>
              <option value="D3">D3 Implementation</option>
              <option value="D4">D4 Completed</option>
            </select>
          </div>

          ${isAdmin ? `
            <div class="flex items-center gap-1.5">
              <label class="font-semibold text-gray-700 whitespace-nowrap">Filter by Owner:</label>
              <select id="dashboard-owner-filter" class="bg-white border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:border-[#1F3864]">
                <option value="ALL">All Owners / Employees</option>
                ${uniqueOwners.map(owner => `<option value="${owner}">${owner}</option>`).join('')}
              </select>
            </div>
          ` : ''}

          <div class="flex items-center gap-1.5">
            <label class="font-semibold text-gray-700 whitespace-nowrap">Workstream:</label>
            <select id="dashboard-workstream-filter" class="bg-white border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:border-[#1F3864]">
              <option value="ALL">All Workstreams</option>
              <option value="Operations">Operations</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Production">Production</option>
              <option value="Engineering">Engineering</option>
              <option value="Procurement">Procurement</option>
              <option value="Quality">Quality</option>
            </select>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button id="btn-new-idea" class="px-3 py-1 bg-[#1F3864] hover:bg-[#152747] text-white font-semibold text-xs border border-[#152747] transition">
            + New Idea
          </button>
        </div>
      </div>

      <!-- Plain Bordered Data Table (Spreadsheet Look) -->
      <div class="border border-gray-300 bg-white overflow-x-auto">
        <table class="excel-table w-full">
          <thead>
            <tr class="bg-[#1F3864] text-white">
              <th class="py-1.5 px-2.5 font-bold text-xs text-white border-r border-[#2F5597] w-16 text-center">ID</th>
              <th class="py-1.5 px-2.5 font-bold text-xs text-white border-r border-[#2F5597]">Title / Idea Description</th>
              <th class="py-1.5 px-2.5 font-bold text-xs text-white border-r border-[#2F5597] w-24 text-center">Stage</th>
              <th class="py-1.5 px-2.5 font-bold text-xs text-white border-r border-[#2F5597] w-36">Suggester / Owner</th>
              <th class="py-1.5 px-2.5 font-bold text-xs text-white border-r border-[#2F5597] w-28">Workstream</th>
              <th class="py-1.5 px-2.5 font-bold text-xs text-white border-r border-[#2F5597] w-32">EBITDA Category</th>
              <th class="py-1.5 px-2.5 font-bold text-xs text-white border-r border-[#2F5597] w-28">Last Updated</th>
              <th class="py-1.5 px-2.5 font-bold text-xs text-white text-center w-24">Actions</th>
            </tr>
          </thead>
          <tbody id="dashboard-tbody" class="font-sans text-xs">
            <!-- Populated via renderTableRows() -->
          </tbody>
        </table>
      </div>
      
      <div class="flex items-center justify-between text-xs text-gray-500 mt-2">
        <span id="table-count-label">Showing projects</span>
        <span>Click on any row to open the stage-gate project details</span>
      </div>

    </main>
  `;

  bindNavEvents();

  document.getElementById('btn-new-idea').addEventListener('click', () => showNewIdeaModal());

  const searchInput = document.getElementById('dashboard-search');
  const stageFilter = document.getElementById('dashboard-stage-filter');
  const ownerFilter = document.getElementById('dashboard-owner-filter');
  const workstreamFilter = document.getElementById('dashboard-workstream-filter');
  const tbody = document.getElementById('dashboard-tbody');
  const countLabel = document.getElementById('table-count-label');

  function renderTableRows() {
    const q = searchInput.value.toLowerCase().trim();
    const stage = stageFilter.value;
    const owner = ownerFilter ? ownerFilter.value : 'ALL';
    const workstream = workstreamFilter.value;

    const filtered = projects.filter(p => {
      const idStr = ('I' + (p.id || '')).toLowerCase();
      const matchQ = !q || p.title.toLowerCase().includes(q) || idStr.includes(q) || (p.suggester_name || '').toLowerCase().includes(q) || (p.suggester_email || '').toLowerCase().includes(q);
      const matchStage = stage === 'ALL' || (p.current_stage || 'D0').toUpperCase() === stage;
      const matchOwner = owner === 'ALL' || (p.suggester_name || p.suggester_email) === owner;
      const matchWorkstream = workstream === 'ALL' || (p.workstream || 'Operations').toLowerCase() === workstream.toLowerCase();
      return matchQ && matchStage && matchOwner && matchWorkstream;
    });

    countLabel.textContent = `Showing ${filtered.length} of ${projects.length} initiatives`;

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-8 text-gray-500">
            ${projects.length === 0 ? 'No initiatives recorded yet. Click "+ New Idea" to submit your first project.' : 'No projects found matching your search and filter criteria.'}
          </td>
        </tr>
      `;
      return;
    }

    const stageColors = {
      'D0': 'bg-blue-50 text-blue-800 border-blue-300',
      'D1': 'bg-amber-50 text-amber-800 border-amber-300',
      'D2': 'bg-orange-50 text-orange-800 border-orange-300',
      'D3': 'bg-indigo-50 text-indigo-800 border-indigo-300',
      'D4': 'bg-green-50 text-green-800 border-green-300'
    };

    tbody.innerHTML = filtered.map((proj, idx) => {
      const stageUpper = (proj.current_stage || 'D0').toUpperCase();
      const badgeStyle = stageColors[stageUpper] || 'bg-gray-100 text-gray-800 border-gray-300';
      const updatedDate = proj.updated_at ? new Date(proj.updated_at).toLocaleDateString() : '-';
      const rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]';
      const shortId = typeof proj.id === 'string' && proj.id.length > 8 ? proj.id.slice(0, 8) : proj.id;

      return `
        <tr data-project-id="${proj.id}" class="${rowBg} hover:bg-[#EFF6FF] cursor-pointer border-b border-gray-200">
          <td class="py-1.5 px-2.5 text-center font-mono font-bold text-gray-700 border-r border-gray-200">I${shortId}</td>
          <td class="py-1.5 px-2.5 font-semibold text-gray-900 border-r border-gray-200">
            <div class="truncate max-w-[360px]" title="${proj.title}">${proj.title}</div>
            ${proj.description ? `<div class="text-[11px] text-gray-500 font-normal truncate max-w-[360px]">${proj.description}</div>` : ''}
          </td>
          <td class="py-1.5 px-2.5 text-center border-r border-gray-200">
            <span class="inline-block px-1.5 py-0.5 text-[11px] font-bold border ${badgeStyle}">${stageUpper}</span>
          </td>
          <td class="py-1.5 px-2.5 text-gray-800 border-r border-gray-200 truncate">${proj.suggester_name || proj.suggester_email?.split('@')[0]}</td>
          <td class="py-1.5 px-2.5 text-gray-600 border-r border-gray-200">${proj.workstream || 'Operations'}</td>
          <td class="py-1.5 px-2.5 text-gray-600 border-r border-gray-200">${proj.ebitda_category || 'Cost Reduction'}</td>
          <td class="py-1.5 px-2.5 text-gray-500 font-mono border-r border-gray-200">${updatedDate}</td>
          <td class="py-1.5 px-2.5 text-center">
            <button class="px-2 py-0.5 text-xs font-semibold bg-[#1F3864] hover:bg-[#152747] text-white border border-[#152747]">
              View
            </button>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('tr[data-project-id]').forEach(row => {
      row.addEventListener('click', () => {
        renderProjectDetail(row.dataset.projectId);
      });
    });
  }

  searchInput.addEventListener('input', renderTableRows);
  stageFilter.addEventListener('change', renderTableRows);
  if (ownerFilter) ownerFilter.addEventListener('change', renderTableRows);
  workstreamFilter.addEventListener('change', renderTableRows);

  document.querySelectorAll('.stage-filter-box').forEach(box => {
    box.addEventListener('click', () => {
      stageFilter.value = box.dataset.stage;
      renderTableRows();
    });
  });

  renderTableRows();
}

// ==========================================
// 5. ADMIN ALL PROJECTS CONSOLE (#admin)
// ==========================================

async function renderAdminConsole() {
  if (activeUser?.role !== 'admin') {
    showToast('Access denied. Admin console is restricted.', 'error');
    window.location.hash = '#dashboard';
    return;
  }

  document.title = "Executive Admin Console — Lakshya Innovation Portal";
  window.location.hash = '#admin';
  const app = document.getElementById('app');

  app.innerHTML = `
    ${getTopNavHtml('admin')}
    <main class="p-4 max-w-[1440px] mx-auto text-gray-800">
      <div class="p-8 text-center text-gray-500 font-sans text-xs">
        <div class="inline-block w-6 h-6 border-2 border-[#1F3864] border-t-transparent rounded-full animate-spin mb-2"></div>
        <p>Loading enterprise administrative console...</p>
      </div>
    </main>
  `;
  bindNavEvents();

  let projects = [];
  let users = [];
  let summary = { stageCounts: [], analytics: {} };

  try {
    const [pList, uList, dSum] = await Promise.all([
      api.getProjects().catch(() => []),
      api.getUsers().catch(() => []),
      api.getDashboardSummary().catch(() => ({ stageCounts: [], analytics: {} }))
    ]);
    projects = pList;
    users = uList;
    summary = dSum;
  } catch (err) {
    showToast('Error loading administrative data: ' + err.message, 'error');
  }

  const uniqueOwners = [...new Set(projects.map(p => p.suggester_name || p.suggester_email).filter(Boolean))].sort();
  const verifiedCount = users.filter(u => u.email_verified).length;
  const unverifiedCount = users.length - verifiedCount;

  let currentAdminTab = 'projects'; // 'projects' | 'users' | 'analytics'

  function renderAdminView() {
    app.innerHTML = `
      ${getTopNavHtml('admin')}
      
      <main class="p-3 md:p-4 max-w-[1440px] mx-auto text-gray-900">
        
        <!-- Header & Executive Stats -->
        <div class="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-gray-300">
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-base font-bold text-[#1F3864] uppercase tracking-tight">EXECUTIVE ADMIN MANAGEMENT CENTER</h1>
              <span class="text-[10px] px-2 py-0.5 font-bold bg-[#1F3864] text-white uppercase rounded-sm">Enterprise Super Admin</span>
            </div>
            <p class="text-xs text-gray-500 mt-0.5">Central control for all stage-gate initiatives, user roles, email verifications, and company-wide performance.</p>
          </div>

          <div class="flex flex-wrap items-center gap-2 font-mono text-xs">
            <div class="bg-white border border-gray-300 px-3 py-1.5 shadow-sm">
              <span class="text-gray-500">Initiatives:</span> <strong class="text-[#1F3864] font-bold text-sm">${projects.length}</strong>
            </div>
            <div class="bg-white border border-gray-300 px-3 py-1.5 shadow-sm">
              <span class="text-gray-500">Total Users:</span> <strong class="text-[#1F3864] font-bold text-sm">${users.length}</strong>
            </div>
            <div class="bg-white border border-green-300 px-3 py-1.5 shadow-sm">
              <span class="text-green-700">Verified:</span> <strong class="text-green-700 font-bold text-sm">${verifiedCount}</strong>
            </div>
            <div class="bg-white border border-amber-300 px-3 py-1.5 shadow-sm">
              <span class="text-amber-700">Unverified:</span> <strong class="text-amber-700 font-bold text-sm">${unverifiedCount}</strong>
            </div>
          </div>
        </div>

        <!-- Admin Navigation Tabs -->
        <div class="flex items-center gap-2 mb-3 border-b border-gray-300 text-xs font-semibold">
          <button id="admin-tab-projects" class="px-4 py-2 border-b-2 transition ${currentAdminTab === 'projects' ? 'border-[#1F3864] text-[#1F3864] bg-white font-bold' : 'border-transparent text-gray-500 hover:text-gray-800 bg-gray-50'}">
            📁 Company Initiatives (${projects.length})
          </button>
          <button id="admin-tab-users" class="px-4 py-2 border-b-2 transition ${currentAdminTab === 'users' ? 'border-[#1F3864] text-[#1F3864] bg-white font-bold' : 'border-transparent text-gray-500 hover:text-gray-800 bg-gray-50'}">
            👥 User &amp; Access Control (${users.length})
          </button>
        </div>

        <!-- TAB 1: ALL PROJECTS -->
        <div id="admin-view-projects" class="${currentAdminTab === 'projects' ? 'block' : 'hidden'}">
          <!-- Toolbar -->
          <div class="bg-[#F1F5F9] border border-gray-300 p-2.5 mb-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div class="flex flex-wrap items-center gap-2">
              <div class="flex items-center gap-1.5">
                <label class="font-semibold text-gray-700">Search:</label>
                <input id="admin-search" type="text" placeholder="Title, ID, Suggester..." class="bg-white border border-gray-300 px-2 py-1 w-48 sm:w-56 text-xs focus:outline-none focus:border-[#1F3864]" />
              </div>

              <div class="flex items-center gap-1.5">
                <label class="font-semibold text-gray-700">Owner:</label>
                <select id="admin-owner-filter" class="bg-white border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:border-[#1F3864]">
                  <option value="ALL">All Employees (${uniqueOwners.length})</option>
                  ${uniqueOwners.map(owner => `<option value="${owner}">${owner}</option>`).join('')}
                </select>
              </div>

              <div class="flex items-center gap-1.5">
                <label class="font-semibold text-gray-700">Stage:</label>
                <select id="admin-stage-filter" class="bg-white border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:border-[#1F3864]">
                  <option value="ALL">All Stages</option>
                  <option value="D0">D0 Validation</option>
                  <option value="D1">D1 Score Matrix</option>
                  <option value="D2">D2 Sign-Off</option>
                  <option value="D3">D3 Implementation</option>
                  <option value="D4">D4 Completed</option>
                </select>
              </div>

              <div class="flex items-center gap-1.5">
                <label class="font-semibold text-gray-700">Workstream:</label>
                <select id="admin-workstream-filter" class="bg-white border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:border-[#1F3864]">
                  <option value="ALL">All Workstreams</option>
                  <option value="Operations">Operations</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Production">Production</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Procurement">Procurement</option>
                  <option value="Quality">Quality</option>
                </select>
              </div>
            </div>

            <button id="btn-admin-new-idea" class="px-3.5 py-1.5 bg-[#1F3864] hover:bg-[#152747] text-white font-semibold text-xs border border-[#152747] transition">
              + New Initiative
            </button>
          </div>

          <!-- Table -->
          <div class="border border-gray-300 bg-white overflow-x-auto shadow-sm">
            <table class="excel-table w-full">
              <thead>
                <tr class="bg-[#1F3864] text-white">
                  <th class="py-2 px-2.5 font-bold text-xs text-white border-r border-[#2F5597] w-16 text-center">ID</th>
                  <th class="py-2 px-2.5 font-bold text-xs text-white border-r border-[#2F5597]">Title / Description</th>
                  <th class="py-2 px-2.5 font-bold text-xs text-white border-r border-[#2F5597] w-24 text-center">Stage</th>
                  <th class="py-2 px-2.5 font-bold text-xs text-white border-r border-[#2F5597] w-48">Owner / Suggester</th>
                  <th class="py-2 px-2.5 font-bold text-xs text-white border-r border-[#2F5597] w-28">Workstream</th>
                  <th class="py-2 px-2.5 font-bold text-xs text-white border-r border-[#2F5597] w-32">EBITDA Category</th>
                  <th class="py-2 px-2.5 font-bold text-xs text-white border-r border-[#2F5597] w-28">Last Updated</th>
                  <th class="py-2 px-2.5 font-bold text-xs text-white text-center w-36">Admin Actions</th>
                </tr>
              </thead>
              <tbody id="admin-projects-tbody" class="font-sans text-xs"></tbody>
            </table>
          </div>
          <div class="flex items-center justify-between text-xs text-gray-500 mt-2">
            <span id="admin-projects-count-label">Showing all projects</span>
            <span>Admin privileges: Full access to view, edit gates, and delete records</span>
          </div>
        </div>

        <!-- TAB 2: USER & ACCESS MANAGEMENT -->
        <div id="admin-view-users" class="${currentAdminTab === 'users' ? 'block' : 'hidden'}">
          <div class="bg-[#F1F5F9] border border-gray-300 p-2.5 mb-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div class="flex flex-wrap items-center gap-2">
              <div class="flex items-center gap-1.5">
                <label class="font-semibold text-gray-700">Search Users:</label>
                <input id="admin-users-search" type="text" placeholder="Name or Email..." class="bg-white border border-gray-300 px-2 py-1 w-56 text-xs focus:outline-none focus:border-[#1F3864]" />
              </div>

              <div class="flex items-center gap-1.5">
                <label class="font-semibold text-gray-700">Role:</label>
                <select id="admin-users-role-filter" class="bg-white border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:border-[#1F3864]">
                  <option value="ALL">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                  <option value="user">Employee</option>
                  <option value="customer">Customer</option>
                </select>
              </div>

              <div class="flex items-center gap-1.5">
                <label class="font-semibold text-gray-700">Status:</label>
                <select id="admin-users-status-filter" class="bg-white border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:border-[#1F3864]">
                  <option value="ALL">All Verification Statuses</option>
                  <option value="verified">Verified (Active)</option>
                  <option value="unverified">Pending Verification</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Users Table -->
          <div class="border border-gray-300 bg-white overflow-x-auto shadow-sm">
            <table class="excel-table w-full">
              <thead>
                <tr class="bg-[#1F3864] text-white">
                  <th class="py-2 px-2.5 font-bold text-xs text-white border-r border-[#2F5597] w-48">Full Name</th>
                  <th class="py-2 px-2.5 font-bold text-xs text-white border-r border-[#2F5597] w-64">Corporate Email</th>
                  <th class="py-2 px-2.5 font-bold text-xs text-white border-r border-[#2F5597] w-36 text-center">Assigned Role</th>
                  <th class="py-2 px-2.5 font-bold text-xs text-white border-r border-[#2F5597] w-32 text-center">Email Verification</th>
                  <th class="py-2 px-2.5 font-bold text-xs text-white border-r border-[#2F5597] w-24 text-center">Initiatives</th>
                  <th class="py-2 px-2.5 font-bold text-xs text-white border-r border-[#2F5597] w-32">Joined Date</th>
                  <th class="py-2 px-2.5 font-bold text-xs text-white text-center w-64">User Management Actions</th>
                </tr>
              </thead>
              <tbody id="admin-users-tbody" class="font-sans text-xs"></tbody>
            </table>
          </div>
          <div class="flex items-center justify-between text-xs text-gray-500 mt-2">
            <span id="admin-users-count-label">Showing all users</span>
            <span>Admins can adjust user roles, manually verify emails, or dispatch verification links.</span>
          </div>
        </div>

      </main>
    `;

    bindNavEvents();

    // Wire Tabs
    const tabProjects = document.getElementById('admin-tab-projects');
    const tabUsers = document.getElementById('admin-tab-users');
    const viewProjects = document.getElementById('admin-view-projects');
    const viewUsers = document.getElementById('admin-view-users');

    tabProjects.addEventListener('click', () => {
      currentAdminTab = 'projects';
      tabProjects.className = 'px-4 py-2 border-b-2 border-[#1F3864] text-[#1F3864] bg-white font-bold transition';
      tabUsers.className = 'px-4 py-2 border-b-2 border-transparent text-gray-500 hover:text-gray-800 bg-gray-50 transition';
      viewProjects.classList.remove('hidden');
      viewUsers.classList.add('hidden');
    });

    tabUsers.addEventListener('click', () => {
      currentAdminTab = 'users';
      tabUsers.className = 'px-4 py-2 border-b-2 border-[#1F3864] text-[#1F3864] bg-white font-bold transition';
      tabProjects.className = 'px-4 py-2 border-b-2 border-transparent text-gray-500 hover:text-gray-800 bg-gray-50 transition';
      viewUsers.classList.remove('hidden');
      viewProjects.classList.add('hidden');
      renderUsersRows();
    });

    document.getElementById('btn-admin-new-idea').addEventListener('click', () => showNewIdeaModal());

    // Projects Filtering
    const searchInput = document.getElementById('admin-search');
    const ownerFilter = document.getElementById('admin-owner-filter');
    const stageFilter = document.getElementById('admin-stage-filter');
    const workstreamFilter = document.getElementById('admin-workstream-filter');
    const projectsTbody = document.getElementById('admin-projects-tbody');
    const projectsCountLabel = document.getElementById('admin-projects-count-label');

    function renderProjectsRows() {
      const q = searchInput.value.toLowerCase().trim();
      const owner = ownerFilter.value;
      const stage = stageFilter.value;
      const workstream = workstreamFilter.value;

      const filtered = projects.filter(p => {
        const idStr = ('I' + (p.id || '')).toLowerCase();
        const matchQ = !q || p.title.toLowerCase().includes(q) || idStr.includes(q) || (p.suggester_name || '').toLowerCase().includes(q) || (p.suggester_email || '').toLowerCase().includes(q);
        const matchOwner = owner === 'ALL' || (p.suggester_name || p.suggester_email) === owner;
        const matchStage = stage === 'ALL' || (p.current_stage || 'D0').toUpperCase() === stage;
        const matchWorkstream = workstream === 'ALL' || (p.workstream || 'Operations').toLowerCase() === workstream.toLowerCase();
        return matchQ && matchOwner && matchStage && matchWorkstream;
      });

      projectsCountLabel.textContent = `Showing ${filtered.length} of ${projects.length} company initiatives`;

      if (filtered.length === 0) {
        projectsTbody.innerHTML = `<tr><td colspan="8" class="text-center py-8 text-gray-500">No initiatives match your filters.</td></tr>`;
        return;
      }

      const stageColors = {
        'D0': 'bg-blue-50 text-blue-800 border-blue-300',
        'D1': 'bg-amber-50 text-amber-800 border-amber-300',
        'D2': 'bg-orange-50 text-orange-800 border-orange-300',
        'D3': 'bg-indigo-50 text-indigo-800 border-indigo-300',
        'D4': 'bg-green-50 text-green-800 border-green-300'
      };

      projectsTbody.innerHTML = filtered.map((proj, idx) => {
        const stageUpper = (proj.current_stage || 'D0').toUpperCase();
        const badgeStyle = stageColors[stageUpper] || 'bg-gray-100 text-gray-800 border-gray-300';
        const updatedDate = proj.updated_at ? new Date(proj.updated_at).toLocaleDateString() : '-';
        const rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]';
        const shortId = typeof proj.id === 'string' && proj.id.length > 8 ? proj.id.slice(0, 8) : proj.id;

        return `
          <tr data-project-id="${proj.id}" class="${rowBg} hover:bg-[#EFF6FF] border-b border-gray-200">
            <td class="py-1.5 px-2.5 text-center font-mono font-bold text-gray-700 border-r border-gray-200">I${shortId}</td>
            <td class="py-1.5 px-2.5 font-semibold text-gray-900 border-r border-gray-200">
              <div class="truncate max-w-[320px]" title="${proj.title}">${proj.title}</div>
              ${proj.description ? `<div class="text-[11px] text-gray-500 font-normal truncate max-w-[320px]">${proj.description}</div>` : ''}
            </td>
            <td class="py-1.5 px-2.5 text-center border-r border-gray-200">
              <span class="inline-block px-1.5 py-0.5 text-[11px] font-bold border ${badgeStyle}">${stageUpper}</span>
            </td>
            <td class="py-1.5 px-2.5 text-gray-800 border-r border-gray-200">
              <div class="font-semibold truncate">${proj.suggester_name || 'User'}</div>
              <div class="text-[11px] text-gray-500 font-mono truncate">${proj.suggester_email || '-'}</div>
            </td>
            <td class="py-1.5 px-2.5 text-gray-600 border-r border-gray-200">${proj.workstream || 'Operations'}</td>
            <td class="py-1.5 px-2.5 text-gray-600 border-r border-gray-200">${proj.ebitda_category || 'Cost Reduction'}</td>
            <td class="py-1.5 px-2.5 text-gray-500 font-mono border-r border-gray-200">${updatedDate}</td>
            <td class="py-1.5 px-2.5 text-center">
              <div class="flex items-center justify-center gap-1.5">
                <button class="btn-view-proj px-2 py-0.5 text-xs font-semibold bg-[#1F3864] hover:bg-[#152747] text-white border border-[#152747] rounded-sm" data-id="${proj.id}">
                  Details
                </button>
                <button class="btn-delete-proj px-2 py-0.5 text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 rounded-sm" data-id="${proj.id}" data-title="${proj.title}">
                  Delete
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');

      // Wire View Details buttons
      projectsTbody.querySelectorAll('.btn-view-proj').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          renderProjectDetail(btn.dataset.id);
        });
      });

      // Wire Delete Project buttons
      projectsTbody.querySelectorAll('.btn-delete-proj').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const projId = btn.dataset.id;
          const projTitle = btn.dataset.title;
          showModal(
            'Delete Initiative',
            `Are you sure you want to permanently delete project "<strong>${projTitle}</strong>"? This action cannot be undone.`,
            'Delete Project',
            async () => {
              try {
                await api.deleteProject(projId);
                showToast(`Project "${projTitle}" deleted successfully.`, 'success');
                projects = projects.filter(p => p.id !== projId);
                renderProjectsRows();
              } catch (delErr) {
                showToast('Error deleting project: ' + delErr.message, 'error');
              }
            }
          );
        });
      });
    }

    searchInput.addEventListener('input', renderProjectsRows);
    ownerFilter.addEventListener('change', renderProjectsRows);
    stageFilter.addEventListener('change', renderProjectsRows);
    workstreamFilter.addEventListener('change', renderProjectsRows);

    renderProjectsRows();

    // Users Management
    const usersSearch = document.getElementById('admin-users-search');
    const usersRoleFilter = document.getElementById('admin-users-role-filter');
    const usersStatusFilter = document.getElementById('admin-users-status-filter');
    const usersTbody = document.getElementById('admin-users-tbody');
    const usersCountLabel = document.getElementById('admin-users-count-label');

    function renderUsersRows() {
      const q = usersSearch.value.toLowerCase().trim();
      const role = usersRoleFilter.value;
      const status = usersStatusFilter.value;

      const filtered = users.filter(u => {
        const matchQ = !q || (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
        const matchRole = role === 'ALL' || u.role === role;
        const matchStatus = status === 'ALL' || (status === 'verified' ? u.email_verified : !u.email_verified);
        return matchQ && matchRole && matchStatus;
      });

      usersCountLabel.textContent = `Showing ${filtered.length} of ${users.length} registered accounts`;

      if (filtered.length === 0) {
        usersTbody.innerHTML = `<tr><td colspan="7" class="text-center py-8 text-gray-500">No user accounts found matching your filters.</td></tr>`;
        return;
      }

      const roleBadges = {
        admin: 'bg-purple-100 text-purple-800 border-purple-300 font-bold',
        member: 'bg-blue-100 text-blue-800 border-blue-300 font-semibold',
        user: 'bg-gray-100 text-gray-800 border-gray-300 font-medium',
        customer: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold',
        approver: 'bg-amber-100 text-amber-800 border-amber-300 font-bold',
        lead: 'bg-indigo-100 text-indigo-800 border-indigo-300 font-bold',
      };

      usersTbody.innerHTML = filtered.map((u, idx) => {
        const isSelf = activeUser && activeUser.id === u.id;
        const roleBadge = roleBadges[u.role] || roleBadges.user;
        const createdDate = u.created_at ? new Date(u.created_at).toLocaleDateString() : '-';
        const isVerified = Boolean(u.email_verified);
        const rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]';

        return `
          <tr class="${rowBg} border-b border-gray-200">
            <td class="py-2 px-2.5 font-bold text-gray-900 border-r border-gray-200">
              ${u.name || 'User'}
              ${isSelf ? '<span class="ml-1 text-[10px] text-blue-600 font-normal">(You)</span>' : ''}
            </td>
            <td class="py-2 px-2.5 font-mono text-gray-700 border-r border-gray-200">${u.email}</td>
            <td class="py-2 px-2.5 text-center border-r border-gray-200">
              <select class="user-role-select text-xs font-semibold px-2 py-0.5 border rounded-sm ${roleBadge}" data-user-id="${u.id}" ${isSelf ? 'disabled title="You cannot change your own role"' : ''}>
                <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Admin</option>
                <option value="member" ${u.role === 'member' ? 'selected' : ''}>Member</option>
                <option value="user" ${u.role === 'user' ? 'selected' : ''}>Employee</option>
                <option value="customer" ${u.role === 'customer' ? 'selected' : ''}>Customer</option>
              </select>
            </td>
            <td class="py-2 px-2.5 text-center border-r border-gray-200">
              ${isVerified ? `
                <span class="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold bg-green-50 text-green-700 border border-green-300 rounded-sm">
                  <span>✔</span> Verified
                </span>
              ` : `
                <span class="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-300 rounded-sm">
                  <span>⚠️</span> Pending
                </span>
              `}
            </td>
            <td class="py-2 px-2.5 text-center font-mono font-bold text-gray-700 border-r border-gray-200">
              ${u.project_count || 0}
            </td>
            <td class="py-2 px-2.5 font-mono text-gray-500 border-r border-gray-200">${createdDate}</td>
            <td class="py-2 px-2.5 text-center">
              <div class="flex items-center justify-center gap-1.5 flex-wrap">
                <button class="btn-toggle-verify px-2 py-1 text-[11px] font-semibold ${isVerified ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300' : 'bg-green-50 hover:bg-green-100 text-green-700 border border-green-300'} rounded-sm transition" data-user-id="${u.id}" data-verified="${isVerified}">
                  ${isVerified ? 'Mark Unverified' : 'Activate &amp; Verify'}
                </button>
                ${!isVerified ? `
                  <button class="btn-resend-mail px-2 py-1 text-[11px] font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-300 rounded-sm transition" data-user-id="${u.id}" data-email="${u.email}">
                    Resend Email
                  </button>
                ` : ''}
                ${!isSelf ? `
                  <button class="btn-delete-user px-2 py-1 text-[11px] font-semibold bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 rounded-sm transition" data-user-id="${u.id}" data-email="${u.email}">
                    Delete
                  </button>
                ` : ''}
              </div>
            </td>
          </tr>
        `;
      }).join('');

      // Wire Role Change
      usersTbody.querySelectorAll('.user-role-select').forEach(select => {
        select.addEventListener('change', async () => {
          const userId = select.dataset.userId;
          const newRole = select.value;
          try {
            await api.updateUserRole(userId, newRole);
            showToast(`Role updated to "${newRole}" successfully.`, 'success');
            const uObj = users.find(x => x.id === userId);
            if (uObj) uObj.role = newRole;
            renderUsersRows();
          } catch (rErr) {
            showToast('Failed to update role: ' + rErr.message, 'error');
            renderUsersRows();
          }
        });
      });

      // Wire Toggle Verification
      usersTbody.querySelectorAll('.btn-toggle-verify').forEach(btn => {
        btn.addEventListener('click', async () => {
          const userId = btn.dataset.userId;
          const currentlyVerified = btn.dataset.verified === 'true';
          const newStatus = !currentlyVerified;

          try {
            await api.toggleUserVerification(userId, newStatus);
            showToast(`User verification set to ${newStatus ? 'Verified' : 'Unverified'}.`, 'success');
            const uObj = users.find(x => x.id === userId);
            if (uObj) uObj.email_verified = newStatus;
            renderUsersRows();
          } catch (vErr) {
            showToast('Failed to update verification: ' + vErr.message, 'error');
          }
        });
      });

      // Wire Resend Verification
      usersTbody.querySelectorAll('.btn-resend-mail').forEach(btn => {
        btn.addEventListener('click', async () => {
          const userId = btn.dataset.userId;
          const email = btn.dataset.email;
          btn.textContent = 'Sending...';
          btn.disabled = true;
          try {
            await api.resendUserVerification(userId);
            showToast(`Verification email dispatched to ${email}.`, 'success');
            btn.textContent = 'Sent ✔';
          } catch (mErr) {
            showToast('Error resending email: ' + mErr.message, 'error');
            btn.textContent = 'Resend Email';
            btn.disabled = false;
          }
        });
      });

      // Wire Delete User
      usersTbody.querySelectorAll('.btn-delete-user').forEach(btn => {
        btn.addEventListener('click', () => {
          const userId = btn.dataset.userId;
          const email = btn.dataset.email;
          showModal(
            'Delete User Account',
            `Are you sure you want to permanently delete user account "<strong>${email}</strong>"?`,
            'Delete Account',
            async () => {
              try {
                await api.deleteUser(userId);
                showToast(`User ${email} deleted successfully.`, 'success');
                users = users.filter(x => x.id !== userId);
                renderUsersRows();
              } catch (dErr) {
                showToast('Failed to delete user: ' + dErr.message, 'error');
              }
            }
          );
        });
      });
    }

    usersSearch.addEventListener('input', renderUsersRows);
    usersRoleFilter.addEventListener('change', renderUsersRows);
    usersStatusFilter.addEventListener('change', renderUsersRows);
  }

  renderAdminView();
}

// ==========================================
// 6. PROJECT DETAIL & WORKFLOW PAGE (#project/:id)
// ==========================================

async function renderProjectDetail(id) {
  document.title = `Project Details: ID ${id} — Lakshya`;
  window.location.hash = '#project/' + id;
  const app = document.getElementById('app');
  
  app.innerHTML = `
    ${getTopNavHtml('dashboard')}
    <main class="p-4 max-w-[1280px] mx-auto text-gray-800 text-xs">
      <div class="p-8 text-center text-gray-500">Loading project details...</div>
    </main>
  `;
  bindNavEvents();

  let proj = null;
  let history = [];
  try {
    const [p, h] = await Promise.all([api.getProject(id), api.getProjectHistory(id).catch(() => [])]);
    proj = p;
    history = h;
  } catch {
    proj = null;
  }

  if (!proj) {
    showToast('Project not found or access denied', 'error');
    window.location.hash = '#dashboard';
    renderDashboard();
    return;
  }

  const currentStage = (proj.current_stage || 'D0').toUpperCase();
  const stages = ['D0', 'D1', 'D2', 'D3', 'D4'];
  const stageIndex = stages.indexOf(currentStage);
  const currentStageIndex = stageIndex >= 0 ? stageIndex : 0;

  const stageLabels = {
    'D0': 'D0 Validation',
    'D1': 'D1 Score Matrix',
    'D2': 'D2 Sign-Off',
    'D3': 'D3 Implementation',
    'D4': 'D4 Completed'
  };

  const shortId = typeof proj.id === 'string' && proj.id.length > 8 ? proj.id.slice(0, 8) : proj.id;

  app.innerHTML = `
    ${getTopNavHtml('dashboard')}
    
    <main class="p-3 md:p-4 max-w-[1280px] mx-auto text-gray-900 text-xs">
      
      <!-- Top Action / Breadcrumb Bar -->
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-1.5 text-xs text-gray-600">
          <button id="btn-back-breadcrumb" class="text-[#1F3864] font-semibold hover:underline cursor-pointer">Dashboard</button>
          <span>&gt;&gt;</span>
          <span class="font-bold text-gray-800">Project Details: ID [${shortId}]</span>
        </div>
        <button id="btn-back-top" class="px-2.5 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 font-semibold">
          &lt; Return to Dashboard
        </button>
      </div>

      <!-- Header Banner Box -->
      <div class="bg-[#1F3864] text-white p-3 border border-[#152747] mb-3 flex flex-wrap items-center justify-between gap-2 shadow-sm">
        <div>
          <span class="text-[10px] text-[#D9E1F2] uppercase font-mono tracking-wider">PROJECT IDENTIFIER: ID [${shortId}]</span>
          <h1 class="text-sm md:text-base font-bold text-white uppercase">${proj.title}</h1>
        </div>
        <div class="text-right">
          <div class="text-[10px] text-[#D9E1F2] uppercase">CURRENT STATUS</div>
          <span class="inline-block bg-white text-[#1F3864] px-2 py-0.5 font-bold text-xs border border-white">
            STAGE [${currentStage}]: ${stageLabels[currentStage] || 'Under Review'}
          </span>
        </div>
      </div>

      <!-- Step Navigation: Plain Bracketed Labels (No D4 Financial Matrix link) -->
      <div class="bg-white border border-gray-300 p-2.5 mb-3 flex flex-wrap items-center justify-between gap-1 select-none">
        <div class="flex items-center gap-1 text-xs">
          <span class="font-bold text-gray-700">[Stage Workflow]:</span>
        </div>
        <div class="flex flex-wrap items-center gap-2 text-xs">
          <span class="px-2 py-0.5 bg-gray-100 text-gray-700 border border-gray-300 font-semibold">[Idea Info]</span>
          <span class="text-gray-400 font-bold">&gt;&gt;</span>
          
          ${stages.map((stg, idx) => {
            if (idx === currentStageIndex) {
              return `<span class="px-2.5 py-0.5 bg-[#1F3864] text-white font-bold border border-[#152747]">[${stg}: ${stageLabels[stg]}]</span>`;
            } else if (idx < currentStageIndex) {
              return `<span class="px-2.5 py-0.5 bg-green-50 text-green-800 border border-green-300 font-semibold">[✓ ${stg}]</span>`;
            } else {
              return `<span class="px-2.5 py-0.5 bg-gray-50 text-gray-400 border border-gray-200">[${stg}: ${stageLabels[stg]}]</span>`;
            }
          }).join('<span class="text-gray-400 font-bold">&gt;&gt;</span>')}
        </div>
      </div>

      <!-- 2-Column Grid: Left (Idea Info Table), Right (Stage Gate Inputs) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 mb-3">
        
        <!-- Left Column: Idea Details Table -->
        <div class="lg:col-span-5 border border-gray-300 bg-white">
          <div class="bg-[#F1F5F9] border-b border-gray-300 px-3 py-1.5 font-bold text-xs text-[#1F3864] uppercase">
            Initiative Master Information
          </div>
          <table class="excel-table w-full">
            <tbody>
              <tr>
                <td class="w-1/3 bg-[#F8FAFC] font-semibold text-gray-700 border-r border-b border-gray-200">Project ID</td>
                <td class="font-mono text-gray-900 border-b border-gray-200">I${proj.id}</td>
              </tr>
              <tr>
                <td class="bg-[#F8FAFC] font-semibold text-gray-700 border-r border-b border-gray-200">Title</td>
                <td class="font-bold text-gray-900 border-b border-gray-200">${proj.title}</td>
              </tr>
              <tr>
                <td class="bg-[#F8FAFC] font-semibold text-gray-700 border-r border-b border-gray-200">Description</td>
                <td class="text-gray-800 border-b border-gray-200">${proj.description || proj.title}</td>
              </tr>
              <tr>
                <td class="bg-[#F8FAFC] font-semibold text-gray-700 border-r border-b border-gray-200">Suggester / Owner</td>
                <td class="text-gray-900 border-b border-gray-200 font-semibold">${proj.suggester_name || '-'}</td>
              </tr>
              <tr>
                <td class="bg-[#F8FAFC] font-semibold text-gray-700 border-r border-b border-gray-200">Suggester Email</td>
                <td class="font-mono text-gray-700 border-b border-gray-200">${proj.suggester_email || '-'}</td>
              </tr>
              <tr>
                <td class="bg-[#F8FAFC] font-semibold text-gray-700 border-r border-b border-gray-200">Workstream</td>
                <td class="text-gray-900 border-b border-gray-200">${proj.workstream || 'Operations'}</td>
              </tr>
              <tr>
                <td class="bg-[#F8FAFC] font-semibold text-gray-700 border-r border-b border-gray-200">EBITDA Category</td>
                <td class="text-gray-900 border-b border-gray-200">${proj.ebitda_category || 'Cost Reduction'}</td>
              </tr>
              <tr>
                <td class="bg-[#F8FAFC] font-semibold text-gray-700 border-r border-b border-gray-200">Created Date</td>
                <td class="font-mono text-gray-600 border-b border-gray-200">${proj.created_at ? new Date(proj.created_at).toLocaleString() : '-'}</td>
              </tr>
              <tr>
                <td class="bg-[#F8FAFC] font-semibold text-gray-700 border-r border-b border-gray-200">Last Modified</td>
                <td class="font-mono text-gray-600 border-b border-gray-200">${proj.updated_at ? new Date(proj.updated_at).toLocaleString() : '-'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Right Column: Stage Gate Form Inputs -->
        <div class="lg:col-span-7 border border-gray-300 bg-white p-3.5 flex flex-col justify-between">
          <div>
            <div class="font-bold text-xs uppercase text-[#1F3864] border-b-2 border-[#1F3864] pb-1 mb-3">
              INPUT REQUIRED FOR ${currentStage} STAGE GATE REVIEW
            </div>

            <form id="stage-form" class="space-y-3">
              <!-- Lever Dropdown -->
              <div>
                <label class="block font-semibold text-gray-700 mb-1" for="stage-lever">
                  Select ${currentStage} Lever Category: <span class="text-red-600">*</span>
                </label>
                <select id="stage-lever" class="w-full bg-white border border-gray-400 px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#1F3864]">
                  <option value="">-- Select a value lever --</option>
                  <option value="automation" ${proj.lever === 'automation' ? 'selected' : ''}>Automation &amp; Digitization</option>
                  <option value="cost_saving" ${proj.lever === 'cost_saving' ? 'selected' : ''}>Process Optimization &amp; Yield Improvement</option>
                  <option value="scrap_reduction" ${proj.lever === 'scrap_reduction' ? 'selected' : ''}>Scrap &amp; Defect Reduction</option>
                  <option value="energy_saving" ${proj.lever === 'energy_saving' ? 'selected' : ''}>Energy &amp; Utility Conservation</option>
                  <option value="cycle_time" ${proj.lever === 'cycle_time' ? 'selected' : ''}>Cycle Time / Takt Time Reduction</option>
                </select>
              </div>

              <!-- Estimated Impact & Implementability (Plain Radio Buttons) -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div class="border border-gray-300 p-2.5 bg-[#F8FAFC]">
                  <label class="block font-bold text-gray-800 mb-1.5">Estimated Impact / Value:</label>
                  <div class="space-y-1">
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="impact" value="low" ${proj.impact === 'low' ? 'checked' : ''} class="text-[#1F3864]" />
                      <span>Low Value (&lt; Rs. 5 Lakhs)</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="impact" value="medium" ${proj.impact === 'medium' ? 'checked' : ''} class="text-[#1F3864]" />
                      <span>Medium Value (Rs. 5 - 25 Lakhs)</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="impact" value="high" ${(!proj.impact || proj.impact === 'high') ? 'checked' : ''} class="text-[#1F3864]" />
                      <span>High Value (&gt; Rs. 25 Lakhs)</span>
                    </label>
                  </div>
                  <div id="impact-error" class="text-red-600 text-[11px] mt-1 hidden">Impact selection is required</div>
                </div>

                <div class="border border-gray-300 p-2.5 bg-[#F8FAFC]">
                  <label class="block font-bold text-gray-800 mb-1.5">Implementability &amp; Effort:</label>
                  <div class="space-y-1">
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="implementability" value="high" ${proj.implementability === 'high' ? 'checked' : ''} class="text-[#1F3864]" />
                      <span>High Effort (Cross-functional / Capex)</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="implementability" value="mid" ${(!proj.implementability || proj.implementability === 'mid') ? 'checked' : ''} class="text-[#1F3864]" />
                      <span>Mid Effort (Standard rollout)</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="implementability" value="quick_win" ${proj.implementability === 'quick_win' ? 'checked' : ''} class="text-[#1F3864]" />
                      <span>Quick Win (&lt; 30 Days)</span>
                    </label>
                  </div>
                  <div id="impl-error" class="text-red-600 text-[11px] mt-1 hidden">Implementability selection is required</div>
                </div>
              </div>

              <!-- Comments / Justification -->
              <div>
                <label class="block font-semibold text-gray-700 mb-1" for="justification">
                  Reviewer Justification &amp; Gate Sign-Off Comments: <span class="text-red-600">*</span>
                </label>
                <textarea id="justification" rows="3" placeholder="Enter detailed technical justification for the ${currentStage} stage gate sign-off..." class="w-full bg-white border border-gray-400 p-2 text-xs font-mono focus:outline-none focus:border-[#1F3864]"></textarea>
                <div id="comments-error" class="text-red-600 text-[11px] mt-0.5 hidden">Comments must be at least 10 characters</div>
              </div>
            </form>
          </div>

          <!-- Bottom Action Buttons inside form -->
          <div class="mt-4 pt-3 border-t border-gray-300 flex items-center justify-between">
            <button id="save-progress-btn" type="button" class="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 font-semibold text-xs transition">
              Save Progress (Draft)
            </button>
            <button id="submit-approval-btn" type="button" class="px-4 py-1.5 bg-[#1F3864] hover:bg-[#152747] text-white border border-[#152747] font-semibold text-xs shadow-none transition">
              Submit for Approval &amp; Advance Stage &gt;&gt;
            </button>
          </div>
        </div>

      </div>

      <!-- Stage Audit History Table -->
      <div class="border border-gray-300 bg-white mb-3">
        <div class="bg-[#F1F5F9] border-b border-gray-300 px-3 py-1.5 font-bold text-xs text-[#1F3864] uppercase flex items-center justify-between">
          <span>Stage History &amp; Audit Trail</span>
          <span class="text-[10px] text-gray-500 font-normal">Chronological stage transitions</span>
        </div>
        <table class="excel-table w-full">
          <thead>
            <tr class="bg-gray-100 text-gray-700">
              <th class="w-40 border-r border-b border-gray-300">Timestamp</th>
              <th class="w-48 border-r border-b border-gray-300">Actor / Reviewer</th>
              <th class="w-24 border-r border-b border-gray-300 text-center">From Stage</th>
              <th class="w-24 border-r border-b border-gray-300 text-center">To Stage</th>
              <th class="border-b border-gray-300">Comments / Justification</th>
            </tr>
          </thead>
          <tbody>
            ${history.length > 0 ? history.map((h, i) => `
              <tr class="${i % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]'} border-b border-gray-200">
                <td class="font-mono text-gray-600 border-r border-gray-200">${new Date(h.created_at).toLocaleString()}</td>
                <td class="font-semibold text-gray-900 border-r border-gray-200">${h.actor_name || (h.actor_email ? h.actor_email.split('@')[0] : 'Reviewer')}</td>
                <td class="text-center font-bold font-mono text-gray-700 border-r border-gray-200">[${(h.from_stage || 'D0').toUpperCase()}]</td>
                <td class="text-center font-bold font-mono text-[#1F3864] border-r border-gray-200">[${(h.to_stage || 'D1').toUpperCase()}]</td>
                <td class="text-gray-800 font-mono">${h.comments || '-'}</td>
              </tr>
            `).join('') : `
              <tr>
                <td colspan="5" class="text-center py-4 text-gray-500 font-sans">
                  No historical stage transitions recorded for this project yet.
                </td>
              </tr>
            `}
          </tbody>
        </table>
      </div>

      <!-- Bottom Navigation Toolbar -->
      <div class="flex items-center justify-between border-t border-gray-300 pt-3">
        <button id="btn-back-bottom" class="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 font-semibold text-xs">
          &lt;&lt; Back to Dashboard
        </button>
      </div>

    </main>
  `;

  bindNavEvents();

  document.getElementById('btn-back-breadcrumb').addEventListener('click', () => renderDashboard());
  document.getElementById('btn-back-top').addEventListener('click', () => renderDashboard());
  document.getElementById('btn-back-bottom').addEventListener('click', () => renderDashboard());

  const saveBtn = document.getElementById('save-progress-btn');
  const submitBtn = document.getElementById('submit-approval-btn');
  const commentsInput = document.getElementById('justification');

  // Save Progress / Draft
  saveBtn.addEventListener('click', async () => {
    saveBtn.textContent = 'Saving...';
    saveBtn.disabled = true;
    try {
      const lever = document.getElementById('stage-lever').value;
      const impact = document.querySelector('input[name="impact"]:checked')?.value;
      const implementability = document.querySelector('input[name="implementability"]:checked')?.value;

      await api.saveDraft(id, { lever, impact, implementability });
      showToast('Project progress saved successfully as draft.', 'success');
    } catch (e) {
      showToast('Error saving draft: ' + e.message, 'error');
    } finally {
      saveBtn.textContent = 'Save Progress (Draft)';
      saveBtn.disabled = false;
    }
  });

  // Submit for Approval & Advance Stage
  submitBtn.addEventListener('click', async () => {
    const impactChecked = document.querySelector('input[name="impact"]:checked');
    const implChecked = document.querySelector('input[name="implementability"]:checked');
    const comments = commentsInput.value.trim();

    let hasError = false;
    if (!impactChecked) {
      document.getElementById('impact-error').classList.remove('hidden');
      hasError = true;
    } else {
      document.getElementById('impact-error').classList.add('hidden');
    }

    if (!implChecked) {
      document.getElementById('impl-error').classList.remove('hidden');
      hasError = true;
    } else {
      document.getElementById('impl-error').classList.add('hidden');
    }

    if (comments.length < 10) {
      document.getElementById('comments-error').classList.remove('hidden');
      commentsInput.focus();
      hasError = true;
    } else {
      document.getElementById('comments-error').classList.add('hidden');
    }

    if (hasError) return;

    const nextStageIndex = currentStageIndex + 1;
    const to_stage = nextStageIndex < stages.length ? stages[nextStageIndex] : currentStage;

    showModal(
      'Confirm Stage Gate Advancement',
      `Advance initiative "${proj.title}" from Stage [${currentStage}] to [${to_stage}]?`,
      'Confirm & Advance',
      async () => {
        submitBtn.textContent = 'Submitting...';
        submitBtn.disabled = true;
        try {
          await api.submitApproval(id, { to_stage, comments });
          showToast(`Initiative advanced to [${to_stage}].`, 'success');
          renderProjectDetail(id);
        } catch (err) {
          showToast('Error advancing stage: ' + err.message, 'error');
          submitBtn.textContent = 'Submit for Approval & Advance Stage >>';
          submitBtn.disabled = false;
        }
      }
    );
  });
}

// ==========================================
// 7. SUBMIT NEW IDEA MODAL
// ==========================================

function showNewIdeaModal() {
  const existing = document.getElementById('new-idea-modal');
  if (existing) existing.remove();

  const user = activeUser || { name: 'User', email: '' };

  const overlay = document.createElement('div');
  overlay.id = 'new-idea-modal';
  overlay.className = 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4';

  overlay.innerHTML = `
    <div class="bg-white border border-gray-400 shadow-2xl max-w-xl w-full text-xs overflow-hidden">
      <div class="bg-[#1F3864] text-white px-4 py-2 flex items-center justify-between">
        <h3 class="font-bold text-xs uppercase tracking-wider">SUBMIT NEW STAGE-GATE INITIATIVE (D0)</h3>
        <button id="close-idea-modal" class="text-white/80 hover:text-white font-bold text-sm leading-none">&times;</button>
      </div>

      <form id="new-idea-form" class="p-4 space-y-3 bg-white text-gray-800">
        <div>
          <label class="block font-bold text-gray-700 mb-1" for="new-title">
            Idea Title / Initiative Summary <span class="text-red-600">*</span>
          </label>
          <input type="text" id="new-title" required placeholder="e.g. Scrap Reduction in Furnace Line 2" class="w-full bg-white border border-gray-400 px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#1F3864]" />
        </div>

        <div>
          <label class="block font-semibold text-gray-700 mb-1" for="new-desc">
            Detailed Problem Statement &amp; Scope
          </label>
          <textarea id="new-desc" rows="2" placeholder="Describe the current operational challenge and proposed solution..." class="w-full bg-white border border-gray-400 p-2 text-xs focus:outline-none focus:border-[#1F3864]"></textarea>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-gray-700 mb-1" for="new-suggester-name">
              Suggester / Idea Owner Name <span class="text-red-600">*</span>
            </label>
            <input type="text" id="new-suggester-name" required value="${user.name || ''}" class="w-full bg-white border border-gray-400 px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#1F3864]" />
          </div>

          <div>
            <label class="block font-semibold text-gray-700 mb-1" for="new-suggester-email">
              Suggester Email <span class="text-red-600">*</span>
            </label>
            <input type="email" id="new-suggester-email" required value="${user.email || ''}" class="w-full bg-white border border-gray-400 px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#1F3864]" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-gray-700 mb-1" for="new-workstream">
              Target Workstream
            </label>
            <select id="new-workstream" class="w-full bg-white border border-gray-400 px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#1F3864]">
              <option value="Operations">Operations</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Production">Production</option>
              <option value="Engineering">Engineering</option>
              <option value="Procurement">Procurement</option>
              <option value="Quality">Quality</option>
            </select>
          </div>

          <div>
            <label class="block font-semibold text-gray-700 mb-1" for="new-ebitda">
              EBITDA Impact Category
            </label>
            <select id="new-ebitda" class="w-full bg-white border border-gray-400 px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#1F3864]">
              <option value="Cost Reduction">Cost Reduction</option>
              <option value="Revenue Growth">Revenue Growth</option>
              <option value="Quality Improvement">Quality Improvement</option>
              <option value="Safety & Compliance">Safety & Compliance</option>
            </select>
          </div>
        </div>

        <div class="pt-3 border-t border-gray-300 flex items-center justify-end gap-2">
          <button type="button" id="btn-cancel-idea" class="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 font-semibold text-xs">
            Cancel
          </button>
          <button type="submit" id="btn-submit-idea" class="px-4 py-1.5 bg-[#1F3864] hover:bg-[#152747] text-white border border-[#152747] font-semibold text-xs shadow-none">
            Submit Idea to D0
          </button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  overlay.querySelector('#close-idea-modal').onclick = close;
  overlay.querySelector('#btn-cancel-idea').onclick = close;

  overlay.querySelector('#new-idea-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('new-title').value.trim();
    const description = document.getElementById('new-desc').value.trim();
    const suggester_name = document.getElementById('new-suggester-name').value.trim();
    const suggester_email = document.getElementById('new-suggester-email').value.trim();
    const workstream = document.getElementById('new-workstream').value;
    const ebitda_category = document.getElementById('new-ebitda').value;

    const btn = document.getElementById('btn-submit-idea');
    btn.textContent = 'Submitting...';
    btn.disabled = true;

    try {
      await api.createProject({
        title,
        description,
        suggester_name,
        suggester_email,
        workstream,
        ebitda_category
      });
      showToast(`Initiative "${title}" submitted to D0 successfully!`, 'success');
      close();
      renderDashboard();
    } catch (err) {
      showToast('Error creating initiative: ' + err.message, 'error');
      btn.textContent = 'Submit Idea to D0';
      btn.disabled = false;
    }
  });
}

// ==========================================
// 8. PROFILE / ACCOUNT SETTINGS PAGE (#profile)
// ==========================================

async function renderProfile() {
  document.title = "User Account & Profile Settings — Lakshya";
  window.location.hash = '#profile';
  const app = document.getElementById('app');

  let profile = {};
  try {
    profile = await api.getProfile();
  } catch {
    profile = activeUser || { name: 'User', email: 'user@company.com', role: 'member' };
  }

  const roleLabel = (profile.role || 'member').toUpperCase();

  app.innerHTML = `
    ${getTopNavHtml('profile')}
    
    <main class="p-3 md:p-4 max-w-[1100px] mx-auto text-gray-900 text-xs">
      
      <!-- Page Header -->
      <div class="flex items-center justify-between mb-2">
        <div>
          <h1 class="text-base font-bold text-[#1F3864] uppercase tracking-tight">USER ACCOUNT &amp; PROFILE SETTINGS</h1>
          <p class="text-xs text-gray-500">Manage credentials and reviewer access settings.</p>
        </div>
        <button onclick="window.location.hash='#dashboard'" class="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 font-semibold text-xs">
          &lt; Return to Dashboard
        </button>
      </div>

      <!-- Thin horizontal divider -->
      <div class="border-b border-gray-300 mb-3"></div>

      <!-- Two Side-by-Side Panels -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        
        <!-- LEFT PANEL: PERSONAL INFORMATION -->
        <div class="border border-gray-300 bg-white shadow-sm flex flex-col">
          <div class="bg-[#1F3864] text-white px-3.5 py-2 font-bold text-xs uppercase flex justify-between items-center border-b border-[#152747]">
            <span>PERSONAL INFORMATION</span>
            <button id="profile-edit-btn" class="text-xs text-white underline hover:text-gray-200 cursor-pointer">Edit</button>
          </div>
          
          <div class="p-4 flex-1 flex flex-col justify-between">
            <form id="profile-name-form" class="space-y-4">
              <div>
                <label class="block text-gray-500 font-semibold text-xs mb-1">Full Name</label>
                <div id="name-display-container">
                  <span id="profile-name-val" class="text-sm font-bold text-gray-900">${profile.name || 'User'}</span>
                </div>
                <div id="name-edit-container" class="hidden mt-1">
                  <input type="text" id="profile-name-input" class="w-full bg-white border border-gray-400 px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#1F3864]" value="${profile.name || ''}" required />
                  <div class="flex gap-2 mt-2">
                    <button type="submit" id="btn-save-name" class="px-3 py-1 bg-[#1F3864] hover:bg-[#152747] text-white font-semibold text-xs border border-[#152747]">
                      Save
                    </button>
                    <button type="button" id="btn-cancel-name" class="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs border border-gray-300">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label class="block text-gray-500 font-semibold text-xs mb-1">
                  Email Address <span class="text-gray-400 font-normal">(Read-only)</span>
                </label>
                <div class="font-mono text-xs text-gray-700 bg-gray-50 border border-gray-200 px-2.5 py-1.5 select-all">
                  ${profile.email || ''}
                </div>
              </div>

              <div>
                <label class="block text-gray-500 font-semibold text-xs mb-1">Role / Access Level</label>
                <div class="text-xs font-bold text-[#1F3864] tracking-wide">
                  [${roleLabel}]
                </div>
              </div>
            </form>

            <div id="profile-name-status" class="hidden text-xs text-green-700 font-semibold pt-2"></div>
          </div>
        </div>

        <!-- RIGHT PANEL: SECURITY & PASSWORD -->
        <div class="border border-gray-300 bg-white shadow-sm flex flex-col">
          <div class="bg-[#1F3864] text-white px-3.5 py-2 font-bold text-xs uppercase border-b border-[#152747]">
            SECURITY &amp; PASSWORD
          </div>
          
          <form id="password-change-form" class="p-4 space-y-3.5 flex-1 flex flex-col justify-between">
            <div class="space-y-3">
              <div>
                <label class="block font-semibold text-gray-700 mb-1" for="current-pwd">Current Password</label>
                <input type="password" id="current-pwd" required placeholder="••••••••" class="w-full bg-white border border-gray-400 px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#1F3864]" />
              </div>

              <div>
                <label class="block font-semibold text-gray-700 mb-1" for="new-pwd">New Password <span class="text-gray-400 font-normal text-[10px]">(Min. 8 chars)</span></label>
                <input type="password" id="new-pwd" minlength="8" required placeholder="••••••••" class="w-full bg-white border border-gray-400 px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#1F3864]" />
              </div>

              <div>
                <label class="block font-semibold text-gray-700 mb-1" for="confirm-new-pwd">Confirm New Password</label>
                <input type="password" id="confirm-new-pwd" minlength="8" required placeholder="••••••••" class="w-full bg-white border border-gray-400 px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#1F3864]" />
              </div>
            </div>

            <div>
              <div id="pwd-status-msg" class="hidden text-xs font-semibold mb-2"></div>
              <button type="submit" id="btn-update-pwd" class="px-4 py-2 bg-[#1F3864] hover:bg-[#152747] text-white font-bold text-xs border border-[#152747] transition">
                Update Password
              </button>
            </div>
          </form>
        </div>

      </div>

    </main>
  `;

  bindNavEvents();

  const editBtn = document.getElementById('profile-edit-btn');
  const cancelBtn = document.getElementById('btn-cancel-name');
  const nameDisplay = document.getElementById('name-display-container');
  const nameEdit = document.getElementById('name-edit-container');
  const nameVal = document.getElementById('profile-name-val');
  const nameInput = document.getElementById('profile-name-input');
  const statusMsg = document.getElementById('profile-name-status');

  function toggleNameEdit(editing) {
    if (editing) {
      nameDisplay.classList.add('hidden');
      nameEdit.classList.remove('hidden');
      nameInput.value = nameVal.textContent.trim();
      nameInput.focus();
      editBtn.classList.add('hidden');
    } else {
      nameDisplay.classList.remove('hidden');
      nameEdit.classList.add('hidden');
      editBtn.classList.remove('hidden');
    }
  }

  editBtn.addEventListener('click', () => toggleNameEdit(true));
  cancelBtn.addEventListener('click', () => toggleNameEdit(false));

  document.getElementById('profile-name-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const newName = nameInput.value.trim();
    if (!newName) return;

    const saveBtn = document.getElementById('btn-save-name');
    saveBtn.textContent = 'Saving...';
    saveBtn.disabled = true;

    try {
      await api.updateProfile({ name: newName });
      nameVal.textContent = newName;
      if (activeUser) activeUser.name = newName;
      toggleNameEdit(false);
      statusMsg.textContent = 'Name updated successfully.';
      statusMsg.className = 'text-xs text-green-700 font-semibold pt-2 block';
      setTimeout(() => statusMsg.classList.add('hidden'), 3000);
    } catch (err) {
      statusMsg.textContent = 'Error updating name: ' + err.message;
      statusMsg.className = 'text-xs text-red-600 font-semibold pt-2 block';
    } finally {
      saveBtn.textContent = 'Save';
      saveBtn.disabled = false;
    }
  });

  const pwdForm = document.getElementById('password-change-form');
  const currentPwdInput = document.getElementById('current-pwd');
  const newPwdInput = document.getElementById('new-pwd');
  const confirmPwdInput = document.getElementById('confirm-new-pwd');
  const pwdStatusMsg = document.getElementById('pwd-status-msg');
  const pwdSubmitBtn = document.getElementById('btn-update-pwd');

  pwdForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const currentPassword = currentPwdInput.value;
    const newPassword = newPwdInput.value;
    const confirmPassword = confirmPwdInput.value;

    pwdStatusMsg.classList.add('hidden');

    if (newPassword !== confirmPassword) {
      pwdStatusMsg.textContent = 'New passwords do not match.';
      pwdStatusMsg.className = 'text-xs text-red-600 font-semibold mb-2 block';
      return;
    }

    if (newPassword.length < 8) {
      pwdStatusMsg.textContent = 'New password must be at least 8 characters long.';
      pwdStatusMsg.className = 'text-xs text-red-600 font-semibold mb-2 block';
      return;
    }

    pwdSubmitBtn.textContent = 'Updating...';
    pwdSubmitBtn.disabled = true;

    try {
      await api.changePassword(currentPassword, newPassword);
      pwdStatusMsg.textContent = 'Password updated successfully.';
      pwdStatusMsg.className = 'text-xs text-green-700 font-semibold mb-2 block';
      pwdForm.reset();
    } catch (err) {
      pwdStatusMsg.textContent = err.message || 'Error updating password.';
      pwdStatusMsg.className = 'text-xs text-red-600 font-semibold mb-2 block';
    } finally {
      pwdSubmitBtn.textContent = 'Update Password';
      pwdSubmitBtn.disabled = false;
    }
  });
}

// ==========================================
// 9. ROUTING & ROUTE GUARDS
// ==========================================

async function handleRouting() {
  const hash = window.location.hash || '#dashboard';

  // Extract base route
  const baseRoute = hash.split('?')[0];

  // Refresh active user from token
  await refreshActiveUser();

  // Public Unauthenticated Routes
  if (!activeUser) {
    if (baseRoute === '#verify' || window.location.pathname === '/verify') {
      await renderVerifyEmail();
    } else if (baseRoute === '#signup') {
      renderSignUp();
    } else if (baseRoute === '#forgot-password') {
      renderForgotPassword();
    } else if (baseRoute === '#reset-password') {
      renderResetPassword();
    } else {
      if (baseRoute !== '#signin') {
        window.location.hash = '#signin';
      }
      renderSignIn();
    }
    return;
  }

  // User is authenticated
  if (baseRoute === '#signin' || baseRoute === '#signup' || baseRoute === '#forgot-password' || baseRoute === '#reset-password' || baseRoute === '#login' || baseRoute === '#') {
    window.location.hash = '#dashboard';
    await renderDashboard();
  } else if (baseRoute === '#verify') {
    // If authenticated but clicked verify link, perform verification then go to dashboard
    await renderVerifyEmail();
  } else if (baseRoute === '#dashboard') {
    await renderDashboard();
  } else if (baseRoute === '#admin') {
    if (activeUser?.role !== 'admin') {
      showToast('Access restricted to administrators', 'error');
      window.location.hash = '#dashboard';
      await renderDashboard();
    } else {
      renderAdminConsole();
    }
  } else if (baseRoute.startsWith('#project/')) {
    const id = baseRoute.split('/')[1];
    renderProjectDetail(id);
  } else if (baseRoute === '#profile') {
    renderProfile();
  } else {
    window.location.hash = '#dashboard';
    await renderDashboard();
  }
}

window.addEventListener('hashchange', handleRouting);

handleRouting();

