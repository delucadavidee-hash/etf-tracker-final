// ═══════════════════════════════════════════
// ETF Tracker - Main Application (SPA)
// Real API backend version - Plug & Play
// ═══════════════════════════════════════════

const API_BASE = '';
let authToken = localStorage.getItem('etf_token') || null;
let currentUser = null;
let currentPage = 'dashboard';
let selectedForCompare = [];
let onboardingStep = 0;
let onboardingAnswers = {};
let tourStep = 0;
let settingsTab = 'profile';
let searchFilters = { query: '', asset: '', region: '', replication: '', distribution: '' };
let compareList = [];
let backtestRange = '10Y';
let expandedModule = null;
let selectedChapter = null;

const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: 'home' },
    { id: 'search', label: 'ETF', icon: 'search' },
    { id: 'analytics', label: 'Analisi', icon: 'bar-chart' },
    { id: 'simulations', label: 'Simulazioni', icon: 'activity' },
    { id: 'models', label: 'Modelli', icon: 'briefcase' },
    { id: 'community', label: 'Community', icon: 'users' },
    { id: 'academy', label: 'Manuale', icon: 'book-open' },
    { id: 'alerts', label: 'Alert', icon: 'bell' },
    { id: 'settings', label: 'Impostazioni', icon: 'settings' },
];

// ─── API Helpers ───
async function api(url, options = {}) {
    const opts = {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options
    };
    if (authToken) {
        opts.headers['Authorization'] = `Bearer ${authToken}`;
    }
    const res = await fetch(`${API_BASE}${url}`, opts);
    if (res.status === 401) {
        logout();
        return null;
    }
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.status === 204 ? null : res.json();
}

// ─── Initialization ───
document.addEventListener('DOMContentLoaded', async () => {
    if (authToken) {
        try {
            const me = await api('/api/auth/me');
            if (me) {
                currentUser = me;
                showMainApp();
                return;
            }
        } catch (e) {
            console.log('Sessione scaduta');
        }
    }
    renderAuthScreen();
});

// ─── Screen Management ───
function showAuthScreen() {
    hideAllScreens();
    document.getElementById('auth-screen').classList.remove('hidden');
    renderAuthScreen();
}

function showOnboardingScreen() {
    hideAllScreens();
    document.getElementById('onboarding-screen').classList.remove('hidden');
    renderOnboarding();
}

function showMainApp() {
    hideAllScreens();
    document.getElementById('main-app').classList.remove('hidden');
    updateUserInfo();
    renderNav();
    navigateTo(currentPage);
}

function hideAllScreens() {
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('onboarding-screen').classList.add('hidden');
    document.getElementById('portfolio-created-screen').classList.add('hidden');
    document.getElementById('main-app').classList.add('hidden');
    document.getElementById('tour-overlay').classList.add('hidden');
}

function updateUserInfo() {
    if (currentUser) {
        document.getElementById('user-name').textContent = currentUser.name || 'Investitore';
        document.getElementById('user-email').textContent = currentUser.email || '';
    }
}

// ─── Navigation ───
function navigateTo(page, params = {}) {
    currentPage = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    renderNav();
    const content = document.getElementById('main-content');
    content.innerHTML = '';
    Object.keys(ChartStore).forEach(id => destroyChart(id));
    switch (page) {
        case 'dashboard': renderDashboard(content); break;
        case 'search': renderSearch(content, params); break;
        case 'etfdetail': renderEtfDetail(content, params); break;
        case 'analytics': renderAnalytics(content); break;
        case 'simulations': renderSimulations(content); break;
        case 'models': renderModels(content); break;
        case 'community': renderCommunity(content); break;
        case 'academy': renderAcademy(content); break;
        case 'alerts': renderAlerts(content); break;
        case 'settings': renderSettings(content); break;
        default: renderDashboard(content);
    }
}

function renderNav() {
    document.getElementById('main-nav').innerHTML = NAV_ITEMS.map(item => `
        <button class="nav-item ${currentPage === item.id ? 'active' : ''}" onclick="navigateTo('${item.id}')">
            ${ICONS[item.icon] || ''} ${item.label}
        </button>
    `).join('');
}

// ─── AUTH ───
let authMode = 'login';

function renderAuthScreen() {
    const screen = document.getElementById('auth-screen');
    screen.className = 'auth-screen';
    screen.innerHTML = `
        <div class="auth-left">
            <div class="auth-logo">
                <div class="auth-logo-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                </div>
                <span class="auth-logo-text">ETF Tracker</span>
            </div>
            <div class="auth-form-wrapper">
                <div class="auth-form">
                    <div class="auth-mode-toggle">
                        <button class="${authMode === 'login' ? 'active' : ''}" onclick="setAuthMode('login')">Accedi</button>
                        <button class="${authMode === 'register' ? 'active' : ''}" onclick="setAuthMode('register')">Registrati</button>
                    </div>
                    <h1 class="auth-title">${authMode === 'login' ? 'Bentornato' : 'Crea account'}</h1>
                    <p class="auth-subtitle">${authMode === 'login' ? 'Accedi al tuo portafoglio ETF' : 'Inizia a tracciare i tuoi investimenti'}</p>
                    <div class="auth-social">
                        <button class="auth-social-btn" onclick="socialLogin('google')">
                            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                            Continua con Google
                        </button>
                    </div>
                    <div class="auth-divider"><span>oppure email</span></div>
                    <form onsubmit="handleAuthSubmit(event)">
                        ${authMode === 'register' ? `
                        <div class="auth-input-group">
                            <label>Nome</label>
                            <div class="input-wrapper">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                <input type="text" id="auth-name" placeholder="Mario Rossi" required>
                            </div>
                        </div>` : ''}
                        <div class="auth-input-group">
                            <label>Email</label>
                            <div class="input-wrapper">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                                <input type="email" id="auth-email" placeholder="tu@email.com" required>
                            </div>
                        </div>
                        <div class="auth-input-group">
                            <label>Password</label>
                            <div class="input-wrapper">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                <input type="password" id="auth-password" placeholder="Minimo 8 caratteri" required minlength="8">
                                <span class="toggle-pwd" onclick="togglePassword()">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                </span>
                            </div>
                        </div>
                        <button type="submit" class="auth-submit">
                            ${authMode === 'login' ? 'Accedi' : 'Crea account'}
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </button>
                    </form>
                    <p class="auth-footer">
                        ${authMode === 'login' ? 'Non hai un account?' : 'Hai gia un account?'}
                        <a href="#" onclick="setAuthMode('${authMode === 'login' ? 'register' : 'login'}'); return false;">${authMode === 'login' ? 'Registrati' : 'Accedi'}</a>
                    </p>
                    <div class="auth-security">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        <span>Crittografia AES-256</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                        <span>GDPR Compliant</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="auth-right">
            <div class="auth-right-content">
                <h2>Tutto quello che ti serve per investire consapevolmente</h2>
                <p>Traccia il tuo portafoglio, confronta ETF, analizza le correlazioni e impara con il manuale completo.</p>
                <div class="feature-list">
                    <div class="feature-item">
                        <div class="feature-icon"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg></div>
                        <div><p>Dashboard completa</p><span>Portafoglio, performance e allocazione in tempo reale</span></div>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M3 3v18h18"></path><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"></path></svg></div>
                        <div><p>Analisi avanzate</p><span>Backtest, correlazioni e simulazioni Monte Carlo</span></div>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg></div>
                        <div><p>Manuale formativo</p><span>Guide dall'ABC dei ETF all'asset allocation avanzata</span></div>
                    </div>
                </div>
            </div>
        </div>`;
}

function setAuthMode(mode) { authMode = mode; renderAuthScreen(); }
function togglePassword() {
    const input = document.getElementById('auth-password');
    input.type = input.type === 'password' ? 'text' : 'password';
}

async function handleAuthSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const name = authMode === 'register' ? (document.getElementById('auth-name').value || 'Investitore') : null;

    try {
        const endpoint = authMode === 'login' ? '/api/auth/login-json' : '/api/auth/register';
        const body = authMode === 'login' ? { email, password } : { email, password, name };
        const data = await api(endpoint, { method: 'POST', body: JSON.stringify(body) });
        
        if (data && data.token) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('etf_token', authToken);
            
            if (authMode === 'register' || !data.user.onboarding_done) {
                showOnboardingScreen();
            } else {
                showMainApp();
            }
        }
    } catch (err) {
        showToast(err.message, 'error');
    }
}

function socialLogin(provider) {
    const name = 'Investitore ' + provider.charAt(0).toUpperCase() + provider.slice(1);
    currentUser = { email: 'demo@' + provider + '.com', name, initials: 'IN' };
    showOnboardingScreen();
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('etf_token');
    showAuthScreen();
}

function toggleAvatarMenu() {
    document.getElementById('avatar-menu').classList.toggle('hidden');
}

// ─── ONBOARDING ───
const ONBOARDING_STEPS = [
    { question: 'Quale obiettivo vuoi raggiungere?', options: [
        { value: 'crescita', label: 'Crescita patrimoniale', icon: 'trending-up', desc: 'Accumulo a lungo termine' },
        { value: 'reddito', label: 'Generare reddito', icon: 'dollar-sign', desc: 'Dividendi e cedole' },
        { value: 'bilanciato', label: 'Bilanciato', icon: 'pie-chart', desc: 'Crescita + stabilita' },
        { value: 'protezione', label: 'Proteggere il capitale', icon: 'shield', desc: 'Rischio minimo' },
    ]},
    { question: 'Quanto tempo puoi investire?', options: [
        { value: '5', label: 'Meno di 5 anni', icon: 'calendar', desc: 'Breve termine' },
        { value: '10', label: '5-10 anni', icon: 'calendar', desc: 'Medio termine' },
        { value: '20', label: '10-20 anni', icon: 'calendar', desc: 'Lungo termine' },
        { value: '30', label: 'Oltre 20 anni', icon: 'calendar', desc: 'Molto lungo' },
    ]},
    { question: 'Quanto rischio sei disposto a correre?', options: [
        { value: '1', label: 'Molto basso', icon: 'shield', desc: 'Perdita max 5%' },
        { value: '2', label: 'Basso', icon: 'alert-circle', desc: 'Perdita max 10%' },
        { value: '3', label: 'Medio', icon: 'activity', desc: 'Perdita max 20%' },
        { value: '4', label: 'Alto', icon: 'trending-up', desc: 'Perdita max 30%' },
    ]},
];

function renderOnboarding() {
    const screen = document.getElementById('onboarding-screen');
    const step = ONBOARDING_STEPS[onboardingStep];
    const progress = ((onboardingStep + 1) / (ONBOARDING_STEPS.length + 1)) * 100;
    screen.innerHTML = `
        <div class="onboarding-screen">
            <div class="onboarding-card">
                <div style="margin-bottom:24px;">
                    <div class="progress-bar"><div class="progress-bar-fill" style="width:${progress}%"></div></div>
                    <p style="text-align:right;font-size:11px;color:rgba(255,255,255,0.4);margin-top:4px;">Passo ${onboardingStep + 1} di ${ONBOARDING_STEPS.length}</p>
                </div>
                <h2 style="font-size:22px;font-weight:600;color:#fff;margin-bottom:8px;">${step.question}</h2>
                <p style="font-size:13px;color:rgba(255,255,255,0.6);margin-bottom:24px;">Seleziona l'opzione che meglio ti rappresenta</p>
                <div style="display:flex;flex-direction:column;gap:10px;">
                    ${step.options.map(opt => `
                        <button class="option-btn" onclick="handleOnboardingAnswer('${opt.value}')">
                            <div class="option-icon">${ICONS[opt.icon] || ICONS['activity']}</div>
                            <div class="option-text"><p>${opt.label}</p><span>${opt.desc}</span></div>
                            <div class="option-check"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle></svg></div>
                        </button>
                    `).join('')}
                </div>
            </div>
        </div>`;
}

async function handleOnboardingAnswer(value) {
    const keys = ['objective', 'horizon', 'risk'];
    onboardingAnswers[keys[onboardingStep]] = value;
    if (onboardingStep < ONBOARDING_STEPS.length - 1) {
        onboardingStep++;
        renderOnboarding();
    } else {
        onboardingStep = 0;
        try {
            await api('/api/auth/onboarding', {
                method: 'POST',
                body: JSON.stringify({ answers: onboardingAnswers })
            });
        } catch (e) {}
        showMainApp();
        setTimeout(() => startTour(), 500);
    }
}

// ─── TOUR ───
const TOUR_STEPS = [
    { title: 'Benvenuto su ETF Tracker!', text: 'Questo tour ti mostrera le funzionalita principali in 60 secondi. Seguimi!' },
    { title: 'La tua Dashboard', text: 'Qui trovi il riepilogo del portafoglio, le performance e l allocazione. Usa Aggiungi ETF per inserire i tuoi primi titoli.' },
    { title: 'Ricerca ETF', text: 'Cerca per nome o ticker, filtra per asset class e confronta fino a 3 ETF sulla stessa pagina.' },
    { title: 'Analisi', text: 'Backtest, matrice di correlazione e simulazioni Monte Carlo per valutare il tuo portafoglio.' },
    { title: 'Simulazioni', text: 'Confronta PAC vs PIC e scopri il potere del cost averaging nel tempo.' },
    { title: 'Pronto!', text: 'Ora sei pronto per esplorare. Aggiungi il tuo primo ETF e inizia a tracciare il tuo percorso di investimento.' },
];

function startTour() {
    tourStep = 0;
    const overlay = document.getElementById('tour-overlay');
    overlay.classList.remove('hidden');
    renderTourStep();
}

function renderTourStep() {
    const overlay = document.getElementById('tour-overlay');
    const step = TOUR_STEPS[tourStep];
    overlay.innerHTML = `
        <div class="tour-overlay" onclick="handleTourClick(event)">
            <div class="tour-backdrop"></div>
            <div class="tour-card-wrapper">
                <div class="card" style="box-shadow:0 25px 50px rgba(0,0,0,0.3);">
                    <div class="card-body" style="padding:24px;">
                        <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
                            <div style="width:36px;height:36px;background:var(--green-light);border-radius:50%;display:flex;align-items:center;justify-content:center;">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--navy-dark)" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                            </div>
                            <h3 style="font-size:18px;font-weight:600;color:var(--navy);">${step.title}</h3>
                        </div>
                        <p style="font-size:14px;color:var(--gray-600);line-height:1.6;margin-bottom:20px;">${step.text}</p>
                        <div style="display:flex;align-items:center;justify-content:space-between;">
                            <span style="font-size:12px;color:var(--gray-400);">${tourStep + 1} / ${TOUR_STEPS.length}</span>
                            <div style="display:flex;gap:8px;">
                                ${tourStep > 0 ? `<button class="btn btn-secondary btn-sm" onclick="prevTourStep(event)">Indietro</button>` : ''}
                                <button class="btn btn-primary btn-sm" onclick="nextTourStep(event)">${tourStep < TOUR_STEPS.length - 1 ? 'Avanti' : 'Inizia'}</button>
                            </div>
                        </div>
                    </div>
                    <div class="tour-nav-dots">
                        ${TOUR_STEPS.map((_, i) => `<button class="tour-dot ${i === tourStep ? 'active' : ''}" onclick="goToTourStep(${i}, event)"></button>`).join('')}
                    </div>
                </div>
            </div>
        </div>`;
}

function handleTourClick(e) { if (e.target.classList.contains('tour-backdrop')) endTour(); }
function nextTourStep(e) { e.stopPropagation(); if (tourStep < TOUR_STEPS.length - 1) { tourStep++; renderTourStep(); } else endTour(); }
function prevTourStep(e) { e.stopPropagation(); if (tourStep > 0) { tourStep--; renderTourStep(); } }
function goToTourStep(idx, e) { e.stopPropagation(); tourStep = idx; renderTourStep(); }
function endTour() { document.getElementById('tour-overlay').classList.add('hidden'); }

// ─── DASHBOARD ───
async function renderDashboard(container) {
    let portfolios = [], holdings = [];
    try {
        portfolios = await api('/api/portfolios') || [];
        if (portfolios.length > 0) {
            holdings = portfolios[0].holdings || [];
        }
    } catch (e) { showToast('Errore caricamento portafoglio', 'error'); }

    const totalValue = holdings.reduce((s, h) => s + (h.shares * (h.current_price || h.avg_price)), 0);
    const invested = holdings.reduce((s, h) => s + (h.shares * h.avg_price), 0);
    const pl = totalValue - invested;
    const plPct = invested > 0 ? (pl / invested * 100) : 0;

    const history = generatePortfolioHistory();
    const alloc = getAllocationByAsset(holdings);

    container.innerHTML = `
        ${createSectionHeader('Dashboard', 'Riepilogo del tuo portafoglio e performance', `
            <button class="btn btn-primary" onclick="openAddPortfolioModal()">${ICONS.plus} Aggiungi ETF</button>
        `)}
        <div class="grid-lg-4" style="margin-bottom:24px;">
            <div class="card"><div class="card-body">
                <p class="stat-label">Valore portafoglio</p>
                <p class="stat-value">${fmt(totalValue)}</p>
                <p class="stat-sub">${holdings.length} posizioni</p>
            </div></div>
            <div class="card"><div class="card-body">
                <p class="stat-label">Investito</p>
                <p class="stat-value">${fmt(invested)}</p>
                <p class="stat-sub">Totale versato</p>
            </div></div>
            <div class="card"><div class="card-body">
                <p class="stat-label">P&L</p>
                <p class="stat-value" style="color:${pl >= 0 ? 'var(--green)' : 'var(--red)'}">${fmt(pl)}</p>
                <p class="stat-sub" style="color:${pl >= 0 ? 'var(--green)' : 'var(--red)'}">${fmtPct(plPct)}</p>
            </div></div>
            <div class="card"><div class="card-body">
                <p class="stat-label">CAGR stimato</p>
                <p class="stat-value" style="color:var(--green)">+8.4%</p>
                <p class="stat-sub">Annualizzato 5Y</p>
            </div></div>
        </div>
        <div class="grid-lg-3" style="margin-bottom:24px;">
            <div class="card" style="grid-column:span 2;">
                <div class="card-body">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                        <h3 class="section-title">Andamento portafoglio</h3>
                        <select class="form-select" onchange="updateDashboardChart(this.value)">
                            <option value="60">5 anni</option><option value="36">3 anni</option><option value="12">1 anno</option>
                        </select>
                    </div>
                    <div style="height:280px;"><canvas id="dash-history-chart"></canvas></div>
                </div>
            </div>
            <div class="card">
                <div class="card-body">
                    <h3 class="section-title">Allocazione</h3>
                    <div style="height:200px;"><canvas id="dash-alloc-chart"></canvas></div>
                    ${alloc.map(a => `
                        <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--gray-100);">
                            <div style="display:flex;align-items:center;gap:8px;"><div style="width:10px;height:10px;border-radius:50%;background:${a.color};"></div><span style="font-size:13px;color:var(--navy);">${a.name}</span></div>
                            <span style="font-size:13px;font-weight:600;color:var(--navy);">${a.value}%</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
        <div class="card">
            <div class="card-body">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                    <div>
                        <h3 class="section-title">Posizioni aperte</h3>
                        <p class="section-desc">Tutti i tuoi ETF con prezzo medio, P&L e allocazione</p>
                    </div>
                    <div style="display:flex;gap:8px;">
                        <button class="btn btn-sm btn-secondary" onclick="generateReport('pdf')">${ICONS.download} PDF</button>
                        <button class="btn btn-sm btn-secondary" onclick="generateReport('pptx')">${ICONS['file-text']} PPTX</button>
                        <button class="btn btn-sm btn-primary" onclick="emailReport()">${ICONS.mail} Email</button>
                    </div>
                </div>
                ${holdings.length > 0 ? `
                <div style="overflow-x:auto;">
                    <table class="data-table">
                        <thead><tr><th>ETF</th><th class="text-right">Quantita</th><th class="text-right">Prezzo medio</th><th class="text-right">Prezzo attuale</th><th class="text-right">Valore</th><th class="text-right">P&L</th><th class="text-right">Peso</th><th></th></tr></thead>
                        <tbody>
                            ${holdings.map(h => {
                                const cp = h.current_price || h.avg_price;
                                const val = h.shares * cp;
                                const plh = h.shares * (cp - h.avg_price);
                                const weight = totalValue > 0 ? (val / totalValue * 100) : 0;
                                return `<tr>
                                    <td><div class="ticker-cell"><div class="ticker-icon">${h.ticker.slice(0,3)}</div><div><p style="font-weight:600;color:var(--navy);">${h.ticker}</p><p style="font-size:11px;color:var(--gray-400);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${h.name || ''}</p></div></div></td>
                                    <td class="text-right">${h.shares}</td>
                                    <td class="text-right">${fmtFull(h.avg_price)}</td>
                                    <td class="text-right">${fmtFull(cp)}</td>
                                    <td class="text-right" style="font-weight:600;">${fmt(val)}</td>
                                    <td class="text-right" style="color:${plh >= 0 ? 'var(--green)' : 'var(--red)'}">${fmt(plh)} <span style="font-size:11px;">(${fmtPct(plh / (h.shares * h.avg_price) * 100)})</span></td>
                                    <td class="text-right">${weight.toFixed(1)}%</td>
                                    <td><button class="btn btn-secondary btn-sm" onclick="removeHolding(${h.id})">${ICONS.trash}</button></td>
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
                ` : `
                <div style="text-align:center;padding:48px 24px;">
                    <div style="width:48px;height:48px;background:var(--gray-100);border-radius:12px;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--gray-400)" stroke-width="2"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>
                    </div>
                    <p style="color:var(--gray-600);margin-bottom:16px;">Il tuo portafoglio e vuoto. Aggiungi il tuo primo ETF.</p>
                    <button class="btn btn-primary" onclick="openAddPortfolioModal()">${ICONS.plus} Aggiungi ETF</button>
                </div>
                `}
            </div>
        </div>`;

    setTimeout(() => {
        if (history.length > 0) renderAreaChart('dash-history-chart', history, [
            { label: 'Portafoglio', data: history.map(d => d.portfolio), borderColor: '#0A2540' },
            { label: 'Benchmark', data: history.map(d => d.benchmark), borderColor: '#8A94A6' }
        ]);
        if (alloc.length > 0) renderPieChart('dash-alloc-chart', alloc.map(a => a.name), alloc.map(a => a.value), alloc.map(a => a.color));
    }, 0);
}

function updateDashboardChart(months) {
    const history = generatePortfolioHistory(parseInt(months));
    renderAreaChart('dash-history-chart', history, [
        { label: 'Portafoglio', data: history.map(d => d.portfolio), borderColor: '#0A2540' },
        { label: 'Benchmark', data: history.map(d => d.benchmark), borderColor: '#8A94A6' }
    ]);
}

async function removeHolding(id) {
    if (!confirm('Rimuovere questa posizione?')) return;
    try {
        await api(`/api/holdings/${id}`, { method: 'DELETE' });
        showToast('Posizione rimossa', 'success');
        navigateTo('dashboard');
    } catch (e) { showToast(e.message, 'error'); }
}

// ─── REPORT GENERATION ───
async function generateReport(format) {
    try {
        showToast(`Generazione ${format.toUpperCase()} in corso...`, 'success');
        const data = await api('/api/reports/generate', {
            method: 'POST',
            body: JSON.stringify({ type: 'portfolio_summary', format })
        });
        if (data && data.download_url) {
            window.open(`${API_BASE}${data.download_url}`, '_blank');
            showToast(`${format.toUpperCase()} generato con successo!`, 'success');
        }
    } catch (e) { showToast(`Errore: ${e.message}`, 'error'); }
}

async function emailReport() {
    try {
        showToast('Invio email in corso...', 'success');
        const data = await api('/api/reports/email', {
            method: 'POST',
            body: JSON.stringify({ format: 'pdf' })
        });
        if (data && data.success) {
            showToast(data.message || 'Email inviata!', 'success');
        } else {
            showToast(data.message || 'Email non inviata', 'error');
        }
    } catch (e) { showToast(`Errore: ${e.message}`, 'error'); }
}

// ─── ETF SEARCH ───
async function renderSearch(container, params = {}) {
    if (params.isin) { renderEtfDetail(container, params); return; }
    container.innerHTML = `
        ${createSectionHeader('Ricerca ETF', 'Cerca e confronta tra centinaia di ETF', `
            ${compareList.length > 0 ? `<button class="btn btn-primary" onclick="renderCompare()">${ICONS['git-compare']} Confronta (${compareList.length})</button>` : ''}
        `)}
        <div class="card" style="margin-bottom:24px;">
            <div class="card-body">
                <div style="display:grid;grid-template-columns:1fr;gap:12px;" class="grid-md-4">
                    <div class="input-wrapper">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--gray-400);"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        <input type="text" class="form-input" placeholder="Cerca per nome, ticker o ISIN..." style="padding-left:40px;" oninput="handleSearchQuery(this.value)">
                    </div>
                    <select class="form-select" onchange="handleSearchFilter('asset', this.value)">
                        <option value="">Tutte le asset class</option><option value="Azionario">Azionario</option><option value="Obbligazionario">Obbligazionario</option><option value="Commodities">Commodities</option>
                    </select>
                    <select class="form-select" onchange="handleSearchFilter('region', this.value)">
                        <option value="">Tutte le regioni</option><option value="Globale">Globale</option><option value="USA">USA</option><option value="Emergenti">Emergenti</option><option value="Europa">Europa</option>
                    </select>
                    <select class="form-select" onchange="handleSearchFilter('replication', this.value)">
                        <option value="">Tipo replica</option><option value="Fisica">Fisica</option><option value="Sintetica">Sintetica</option><option value="Campionamento">Campionamento</option>
                    </select>
                </div>
            </div>
        </div>
        <div class="card"><div class="card-body" style="padding:0;">
            <div style="overflow-x:auto;">
                <table class="data-table"><thead><tr><th></th><th>ETF</th><th class="text-right">Prezzo</th><th class="text-right">1D</th><th class="text-right">1Y</th><th class="text-right">TER%</th><th class="text-right">AUM (M)</th><th>Asset</th><th></th></tr></thead>
                <tbody id="search-results-body"></tbody></table>
            </div>
        </div></div>`;
    renderSearchResults();
}

function handleSearchQuery(q) { searchFilters.query = q.toLowerCase(); renderSearchResults(); }
function handleSearchFilter(key, value) { searchFilters[key] = value; renderSearchResults(); }

function renderSearchResults() {
    const tbody = document.getElementById('search-results-body');
    if (!tbody) return;
    let filtered = ETF_DATABASE.filter(e => {
        if (searchFilters.query && !e.name.toLowerCase().includes(searchFilters.query) && !e.ticker.toLowerCase().includes(searchFilters.query) && !e.isin.toLowerCase().includes(searchFilters.query)) return false;
        if (searchFilters.asset && e.asset !== searchFilters.asset) return false;
        if (searchFilters.region && !e.region.includes(searchFilters.region)) return false;
        if (searchFilters.replication && e.replication !== searchFilters.replication) return false;
        return true;
    });
    if (filtered.length === 0) { tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:48px;color:var(--gray-400);">Nessun ETF trovato</td></tr>`; return; }
    tbody.innerHTML = filtered.map(etf => {
        const isInCompare = compareList.includes(etf.isin);
        return `<tr>
            <td style="width:40px;"><button onclick="toggleCompare('${etf.isin}')" style="width:28px;height:28px;border-radius:6px;border:1px solid ${isInCompare ? 'var(--green)' : 'var(--gray-200)'};background:${isInCompare ? '#E6F4EC' : 'var(--white)'};display:flex;align-items:center;justify-content:center;cursor:pointer;">${isInCompare ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>' : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gray-400)" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>'}</button></td>
            <td><div class="ticker-cell"><div class="ticker-icon">${etf.ticker.slice(0,3)}</div><div><p style="font-weight:600;color:var(--navy);">${etf.ticker}</p><p style="font-size:11px;color:var(--gray-400);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${etf.name}</p></div></div></td>
            <td class="text-right" style="font-weight:600;">${fmtFull(etf.price)}</td>
            <td class="text-right" style="color:${etf.chg1d >= 0 ? 'var(--green)' : 'var(--red)'}">${etf.chg1d >= 0 ? '+' : ''}${etf.chg1d}%</td>
            <td class="text-right" style="color:${etf.chg1y >= 0 ? 'var(--green)' : 'var(--red)'}">${etf.chg1y >= 0 ? '+' : ''}${etf.chg1y}%</td>
            <td class="text-right">${etf.ter}%</td>
            <td class="text-right">${(etf.aum / 1000).toFixed(1)}B</td>
            <td><span class="label ${etf.asset === 'Azionario' ? 'label-success' : etf.asset === 'Obbligazionario' ? 'label-warning' : 'label-info'}">${etf.asset}</span></td>
            <td><button class="btn btn-sm btn-secondary" onclick="navigateTo('etfdetail', {isin: '${etf.isin}'})">Dettaglio</button></td>
        </tr>`;
    }).join('');
}

function toggleCompare(isin) {
    if (compareList.includes(isin)) compareList = compareList.filter(i => i !== isin);
    else if (compareList.length < 3) compareList.push(isin);
    else { showToast('Max 3 ETF', 'error'); return; }
    renderSearchResults();
    navigateTo('search');
}

function renderCompare() {
    const container = document.getElementById('main-content');
    const etfs = compareList.map(isin => ETF_DATABASE.find(e => e.isin === isin)).filter(Boolean);
    if (etfs.length === 0) { navigateTo('search'); return; }
    container.innerHTML = `
        ${createSectionHeader('Confronto ETF', `Confronto tra ${etfs.length} ETF`, `<button class="btn btn-secondary" onclick="compareList=[];navigateTo('search')">${ICONS.x} Chiudi</button>`)}
        <div class="grid-lg-3" style="margin-bottom:24px;">
            ${etfs.map(etf => `
                <div class="card"><div class="card-body" style="text-align:center;">
                    <div class="ticker-icon" style="margin:0 auto 12px;width:48px;height:48px;font-size:14px;">${etf.ticker.slice(0,3)}</div>
                    <h3 style="font-size:16px;font-weight:600;color:var(--navy);margin-bottom:4px;">${etf.ticker}</h3>
                    <p style="font-size:12px;color:var(--gray-400);margin-bottom:12px;">${etf.name}</p>
                    <p style="font-size:24px;font-weight:600;color:var(--navy);">${fmtFull(etf.price)}</p>
                    <p style="font-size:13px;color:${etf.chg1d >= 0 ? 'var(--green)' : 'var(--red)'};font-weight:600;">${etf.chg1d >= 0 ? '+' : ''}${etf.chg1d}% oggi</p>
                </div></div>
            `).join('')}
        </div>
        <div class="card" style="margin-bottom:24px;"><div class="card-body">
            <h3 class="section-title">Andamento storico</h3>
            <div style="height:300px;"><canvas id="compare-history-chart"></canvas></div>
        </div></div>
        <div class="card"><div class="card-body" style="padding:0;">
            <div style="overflow-x:auto;">
                <table class="data-table">
                    <thead><tr><th>Metrica</th>${etfs.map(e => `<th class="text-right">${e.ticker}</th>`).join('')}</tr></thead>
                    <tbody>
                        <tr><td style="font-weight:600;">ISIN</td>${etfs.map(e => `<td class="text-right" style="font-size:12px;color:var(--gray-400);">${e.isin}</td>`).join('')}</tr>
                        <tr><td style="font-weight:600;">TER %</td>${etfs.map(e => `<td class="text-right">${e.ter}%</td>`).join('')}</tr>
                        <tr><td style="font-weight:600;">AUM</td>${etfs.map(e => `<td class="text-right">${(e.aum/1000).toFixed(1)}B</td>`).join('')}</tr>
                        <tr><td style="font-weight:600;">1Y</td>${etfs.map(e => `<td class="text-right" style="color:${e.chg1y>=0?'var(--green)':'var(--red)'}">${e.chg1y>=0?'+':''}${e.chg1y}%</td>`).join('')}</tr>
                        <tr><td style="font-weight:600;">5Y</td>${etfs.map(e => `<td class="text-right" style="color:${e.chg5y>=0?'var(--green)':'var(--red)'}">${e.chg5y>=0?'+':''}${e.chg5y}%</td>`).join('')}</tr>
                    </tbody>
                </table>
            </div>
        </div></div>`;
    setTimeout(() => {
        const datasets = etfs.map((etf, i) => {
            const hist = generatePriceHistory(48, etf.price * 0.7);
            const colors = ['#0A2540', '#1E5AA0', '#0F7B3F'];
            return { label: etf.ticker, data: hist.map(d => d.price), borderColor: colors[i] || '#8A94A6' };
        });
        const labels = generatePriceHistory(48, 100).map(d => d.month);
        renderLineChart('compare-history-chart', labels.map((m, i) => ({month: m})), datasets);
    }, 0);
}

// ─── ETF DETAIL ───
function renderEtfDetail(container, params) {
    const etf = ETF_DATABASE.find(e => e.isin === params.isin);
    if (!etf) { container.innerHTML = `<div style="padding:48px;text-align:center;color:var(--gray-400);">ETF non trovato</div>`; return; }
    const history = generatePriceHistory(48, etf.price * 0.6);
    container.innerHTML = `
        <div style="margin-bottom:24px;"><button class="btn btn-secondary btn-sm" onclick="navigateTo('search')">${ICONS['arrow-right'].replace('12 19', '12 5').replace('19 12', '5 12')} Torna</button></div>
        ${createSectionHeader(etf.ticker, etf.name, `<button class="btn btn-primary" onclick="openAddToPortfolioModal('${etf.isin}')">${ICONS.plus} Aggiungi</button>`)}
        <div class="grid-lg-3" style="margin-bottom:24px;">
            <div class="card" style="grid-column:span 2;"><div class="card-body">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;">
                    <div>
                        <p style="font-size:13px;color:var(--gray-400);margin-bottom:4px;">Prezzo attuale</p>
                        <p style="font-size:32px;font-weight:600;color:var(--navy);letter-spacing:-0.02em;">${fmtFull(etf.price)}</p>
                        <p style="font-size:14px;color:${etf.chg1d >= 0 ? 'var(--green)' : 'var(--red)'};font-weight:600;">${etf.chg1d >= 0 ? '+' : ''}${etf.chg1d}% oggi &middot; ${etf.chg1y >= 0 ? '+' : ''}${etf.chg1y}% YTD</p>
                    </div>
                    <span class="label ${etf.asset === 'Azionario' ? 'label-success' : etf.asset === 'Obbligazionario' ? 'label-warning' : 'label-info'}">${etf.asset}</span>
                </div>
                <div style="height:240px;"><canvas id="etf-price-chart"></canvas></div>
            </div></div>
            <div class="card"><div class="card-body">
                <h3 class="section-title">Dettagli</h3>
                <div style="display:flex;flex-direction:column;gap:12px;">
                    ${['isin','issuer','ter','aum','replication','distribution','domicile','region'].map(k => `
                        <div style="display:flex;justify-content:space-between;"><span style="font-size:13px;color:var(--gray-400);">${k.toUpperCase()}</span><span style="font-size:13px;font-weight:600;color:var(--navy);">${etf[k]}${k==='ter'?'%':k==='aum'?' MLD':''}</span></div>
                    `).join('')}
                    <div style="display:flex;justify-content:space-between;"><span style="font-size:13px;color:var(--gray-400);">Rating</span><span style="font-size:13px;font-weight:600;color:var(--navy);">${'★'.repeat(etf.rating)}${'☆'.repeat(5-etf.rating)}</span></div>
                </div>
            </div></div>
        </div>
        <div class="grid-lg-4" style="margin-bottom:24px;">
            ${[{l:'1 Mese',v:etf.chg1d*0.7},{l:'1 Anno',v:etf.chg1y},{l:'3 Anni',v:etf.chg5y/5*3},{l:'5 Anni',v:etf.chg5y}].map(m => `
                <div class="card"><div class="card-body" style="text-align:center;">
                    <p class="stat-label">${m.l}</p>
                    <p class="stat-value" style="color:${m.v >= 0 ? 'var(--green)' : 'var(--red)'}">${m.v >= 0 ? '+' : ''}${m.v.toFixed(1)}%</p>
                </div></div>
            `).join('')}
        </div>`;
    setTimeout(() => renderAreaChart('etf-price-chart', history, [{ label: etf.ticker, data: history.map(d => d.price), borderColor: '#0A2540' }]), 0);
}

// ─── ANALYTICS ───
function renderAnalytics(container) {
    container.innerHTML = `
        ${createSectionHeader('Analisi', 'Backtest, correlazioni e valutazione del portafoglio')}
        <div class="card" style="margin-bottom:24px;"><div class="card-body">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:12px;">
                <h3 class="section-title">Backtest Portafoglio</h3>
                <div style="display:flex;gap:6px;">${['1Y','3Y','5Y','10Y'].map(r => `<button class="form-select ${backtestRange === r ? 'active' : ''}" onclick="setBacktestRange('${r}')">${r}</button>`).join('')}</div>
            </div>
            <div style="height:320px;"><canvas id="backtest-chart"></canvas></div>
            <div class="chart-legend" id="backtest-legend"></div>
        </div></div>
        <div class="card" style="margin-bottom:24px;"><div class="card-body">
            <h3 class="section-title">Matrice di Correlazione</h3>
            <p class="section-desc">Correlazioni annuali tra i principali ETF</p>
            <div style="overflow-x:auto;">
                <table class="data-table" style="font-size:13px;min-width:500px;">
                    <thead><tr><th>ETF</th>${CORRELATION_MATRIX.map(c => `<th class="text-right">${c.etf}</th>`).join('')}</tr></thead>
                    <tbody>${CORRELATION_MATRIX.map(row => `<tr><td style="font-weight:600;color:var(--navy);">${row.etf}</td>${CORRELATION_MATRIX.map(col => `<td class="text-right" style="font-weight:600;color:${getCorrColor(row[col.etf])};">${row[col.etf].toFixed(2)}</td>`).join('')}</tr>`).join('')}</tbody>
                </table>
            </div>
            <div style="display:flex;gap:16px;margin-top:16px;flex-wrap:wrap;font-size:12px;color:var(--gray-400);">
                <span><span style="color:var(--green);font-weight:600;">0.0-0.2</span> Bassa</span>
                <span><span style="color:#68A063;font-weight:600;">0.2-0.4</span> Moderata</span>
                <span><span style="color:#D69E2E;font-weight:600;">0.4-0.7</span> Alta</span>
                <span><span style="color:#DD6B20;font-weight:600;">0.7-0.9</span> Molto alta</span>
                <span><span style="color:#B42318;font-weight:600;">0.9+</span> Quasi perfetta</span>
            </div>
        </div></div>
        <div class="grid-lg-3">
            <div class="card"><div class="card-body"><p class="stat-label">Volatilita annua</p><p class="stat-value">14.2%</p><p class="stat-sub">Stdev rendimenti</p></div></div>
            <div class="card"><div class="card-body"><p class="stat-label">Max Drawdown</p><p class="stat-value" style="color:var(--red)">-18.5%</p><p class="stat-sub">Mar 2020 - Giu 2020</p></div></div>
            <div class="card"><div class="card-body"><p class="stat-label">Sharpe Ratio</p><p class="stat-value" style="color:var(--green)">0.82</p><p class="stat-sub">rf=2%, annualizzato</p></div></div>
        </div>`;
    setTimeout(() => renderBacktestChart(), 0);
}

function setBacktestRange(range) { backtestRange = range; renderBacktestChart(); }
function renderBacktestChart() {
    const data = generateBacktestData(backtestRange);
    renderLineChart('backtest-chart', data, [
        { label: 'Il tuo portafoglio', data: data.map(d => d.myPortfolio), borderColor: '#0A2540' },
        { label: 'All-Weather', data: data.map(d => d.allWeather), borderColor: '#1E5AA0' },
        { label: 'Benchmark', data: data.map(d => d.benchmark), borderColor: '#8A94A6' }
    ]);
    const legend = document.getElementById('backtest-legend');
    if (legend) legend.innerHTML = `<div class="chart-legend-item"><div class="chart-legend-line" style="background:#0A2540;"></div>Il tuo portafoglio</div><div class="chart-legend-item"><div class="chart-legend-line" style="background:#1E5AA0;"></div>All-Weather</div><div class="chart-legend-item"><div class="chart-legend-line" style="background:#8A94A6;"></div>Benchmark</div>`;
}

// ─── SIMULATIONS ───
let pacParams = { monthly: 500, years: 20, returnRate: 7, inflation: 2 };

function renderSimulations(container) {
    container.innerHTML = `
        ${createSectionHeader('Simulazioni', 'Confronta PAC vs PIC e calcola i tuoi progetti')}
        <div class="grid-lg-2" style="margin-bottom:24px;">
            <div class="card"><div class="card-body">
                <h3 class="section-title">Parametri</h3>
                <p class="section-desc">Personalizza i parametri per il tuo caso</p>
                <form onsubmit="runPacSimulation(event)">
                    <div style="margin-bottom:16px;"><label style="display:block;font-size:12px;font-weight:600;color:var(--navy);margin-bottom:6px;">Rata mensile (EUR)</label><input type="number" class="form-input" id="pac-monthly" value="${pacParams.monthly}" min="50" step="50" required></div>
                    <div style="margin-bottom:16px;"><label style="display:block;font-size:12px;font-weight:600;color:var(--navy);margin-bottom:6px;">Durata (anni)</label><input type="number" class="form-input" id="pac-years" value="${pacParams.years}" min="1" max="40" required></div>
                    <div style="margin-bottom:16px;"><label style="display:block;font-size:12px;font-weight:600;color:var(--navy);margin-bottom:6px;">Rendimento atteso % annuo</label><input type="number" class="form-input" id="pac-return" value="${pacParams.returnRate}" min="0" max="15" step="0.5" required></div>
                    <div style="margin-bottom:16px;"><label style="display:block;font-size:12px;font-weight:600;color:var(--navy);margin-bottom:6px;">Inflazione % annua</label><input type="number" class="form-input" id="pac-inflation" value="${pacParams.inflation}" min="0" max="10" step="0.5" required></div>
                    <button type="submit" class="btn btn-primary btn-block">Calcola</button>
                </form>
            </div></div>
            <div class="card"><div class="card-body">
                <h3 class="section-title">Risultati</h3>
                <p class="section-desc">Confronto PAC vs PIC su ${pacParams.years} anni</p>
                <div id="pac-results">${renderPacResults()}</div>
            </div></div>
        </div>
        <div class="card" style="margin-bottom:24px;"><div class="card-body">
            <h3 class="section-title">Andamento nel tempo</h3>
            <div style="height:320px;"><canvas id="pac-chart"></canvas></div>
        </div></div>`;
    setTimeout(() => renderPacChart(), 0);
}

function renderPacResults() {
    const monthly = pacParams.monthly, years = pacParams.years, r = pacParams.returnRate / 100;
    const infl = pacParams.inflation / 100, n = years * 12;
    const pacFV = monthly * ((Math.pow(1 + r/12, n) - 1) / (r/12));
    const picAmount = monthly * n;
    const picFV = picAmount * Math.pow(1 + r/12, n);
    const realR = (1 + r) / (1 + infl) - 1;
    const realFV = monthly * ((Math.pow(1 + realR/12, n) - 1) / (realR/12));
    const invested = monthly * n;
    return `
        <div style="display:flex;flex-direction:column;gap:16px;">
            <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid var(--gray-100);"><span style="font-size:13px;color:var(--gray-400);">Totale investito (PAC)</span><span style="font-size:16px;font-weight:600;color:var(--navy);">${fmt(invested)}</span></div>
            <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid var(--gray-100);"><span style="font-size:13px;color:var(--gray-400);">Valore finale PAC</span><span style="font-size:20px;font-weight:600;color:var(--green);">${fmt(pacFV)}</span></div>
            <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid var(--gray-100);"><span style="font-size:13px;color:var(--gray-400);">Guadagno lordo</span><span style="font-size:16px;font-weight:600;color:var(--green);">${fmt(pacFV - invested)} <span style="font-size:13px;">(${((pacFV - invested)/invested*100).toFixed(1)}%)</span></span></div>
            <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid var(--gray-100);"><span style="font-size:13px;color:var(--gray-400);">Valore reale (al netto inflazione)</span><span style="font-size:16px;font-weight:600;color:var(--navy);">${fmt(realFV)}</span></div>
            <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;"><span style="font-size:13px;color:var(--gray-400);">Rendimento annualizzato</span><span style="font-size:16px;font-weight:600;color:var(--navy);">${(r * 100).toFixed(1)}%</span></div>
            <div style="background:var(--info-bg);border-radius:8px;padding:16px;margin-top:8px;"><p style="font-size:13px;color:var(--blue);font-weight:600;margin-bottom:4px;">Confronto con PIC</p><p style="font-size:12px;color:var(--gray-600);">Investendo <strong>${fmt(picAmount)}</strong> in un'unica soluzione oggi, il valore sarebbe di <strong>${fmt(picFV)}</strong>. Il PAC riduce il rischio di timing.</p></div>
        </div>`;
}

function runPacSimulation(e) {
    e.preventDefault();
    pacParams.monthly = parseFloat(document.getElementById('pac-monthly').value);
    pacParams.years = parseInt(document.getElementById('pac-years').value);
    pacParams.returnRate = parseFloat(document.getElementById('pac-return').value);
    pacParams.inflation = parseFloat(document.getElementById('pac-inflation').value);
    document.getElementById('pac-results').innerHTML = renderPacResults();
    renderPacChart();
}

function renderPacChart() {
    const monthly = pacParams.monthly, years = pacParams.years, r = pacParams.returnRate / 100;
    const data = [];
    for (let year = 0; year <= years; year++) {
        let pacValue = 0, realPacValue = 0;
        for (let m = 1; m <= year * 12; m++) {
            pacValue += monthly * Math.pow(1 + r/12, year * 12 - m);
            const realR = (1 + r) / (1 + pacParams.inflation / 100) - 1;
            realPacValue += monthly * Math.pow(1 + realR/12, year * 12 - m);
        }
        const picValue = (monthly * 12) * Math.pow(1 + r, year);
        data.push({ year: String(year), pac: Math.round(pacValue), pic: Math.round(picValue), real: Math.round(realPacValue) });
    }
    renderLineChart('pac-chart', data, [
        { label: 'PAC', data: data.map(d => d.pac), borderColor: '#0A2540' },
        { label: 'PIC', data: data.map(d => d.pic), borderColor: '#1E5AA0' },
        { label: 'PAC reale', data: data.map(d => d.real), borderColor: '#8A94A6' }
    ]);
}

// ─── MODELS ───
function renderModels(container) {
    container.innerHTML = `
        ${createSectionHeader('Portafogli Modello', 'Strategie classiche per ogni profilo di rischio')}
        <div style="display:flex;flex-direction:column;gap:16px;">
            ${MODEL_PORTFOLIOS.map(model => `
                <div class="card"><div class="card-body">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;flex-wrap:wrap;gap:12px;">
                        <div>
                            <div style="display:flex;align-items:center;gap:12px;margin-bottom:4px;">
                                <h3 style="font-size:18px;font-weight:600;color:var(--navy);">${model.name}</h3>
                                <span class="label ${model.riskLevel <= 2 ? 'label-success' : model.riskLevel === 3 ? 'label-warning' : 'label-danger'}">${model.risk}</span>
                            </div>
                            <p style="font-size:12px;color:var(--gray-400);">di ${model.author}</p>
                        </div>
                        <div style="display:flex;gap:16px;text-align:right;">
                            <div><p style="font-size:11px;color:var(--gray-400);">CAGR</p><p style="font-size:16px;font-weight:600;color:var(--green);">${model.cagr}%</p></div>
                            <div><p style="font-size:11px;color:var(--gray-400);">Max DD</p><p style="font-size:16px;font-weight:600;color:var(--red);">${model.maxDD}%</p></div>
                            <div><p style="font-size:11px;color:var(--gray-400);">Sharpe</p><p style="font-size:16px;font-weight:600;color:var(--navy);">${model.sharpe}</p></div>
                        </div>
                    </div>
                    <p style="font-size:13px;color:var(--gray-600);margin-bottom:16px;">${model.philosophy}</p>
                    <div style="margin-bottom:12px;"><div class="mini-bar">${model.allocation.map(a => `<div style="width:${a.value}%;background:${a.color};height:100%;"></div>`).join('')}</div></div>
                    <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:16px;">${model.allocation.map(a => `<div style="display:flex;align-items:center;gap:6px;"><div style="width:10px;height:10px;border-radius:50%;background:${a.color};"></div><span style="font-size:12px;color:var(--gray-600);">${a.name} ${a.value}%</span></div>`).join('')}</div>
                    <button class="btn btn-primary btn-sm" onclick="showToast('Portafoglio caricato nella simulazione', 'success')">Usa questo modello</button>
                </div></div>
            `).join('')}
        </div>`;
}

// ─── COMMUNITY ───
async function renderCommunity(container) {
    let posts = [];
    try { posts = await api('/api/community/posts') || []; } catch (e) {}
    container.innerHTML = `
        ${createSectionHeader('Community', 'Condividi strategie e impara dagli altri investitori')}
        <div class="card" style="margin-bottom:24px;"><div class="card-body">
            <div class="comment-box" style="padding:0;">
                <div class="comment-avatar" style="width:40px;height:40px;">${currentUser ? currentUser.initials : 'IO'}</div>
                <div style="flex:1;">
                    <textarea class="form-input" id="post-content" placeholder="Condividi un pensiero..." style="min-height:80px;resize:vertical;margin-bottom:8px;"></textarea>
                    <div style="display:flex;justify-content:flex-end;"><button class="btn btn-primary btn-sm" onclick="createPost()">Pubblica</button></div>
                </div>
            </div>
        </div></div>
        <div id="community-posts" style="display:flex;flex-direction:column;gap:16px;">
            ${posts.map(post => renderPostHTML(post)).join('')}
        </div>`;
}

function renderPostHTML(post) {
    const snap = post.portfolio_snapshot ? JSON.parse(post.portfolio_snapshot) : null;
    return `
        <div class="card" id="post-${post.id}"><div class="card-body">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;">
                <div style="display:flex;align-items:center;gap:12px;">
                    <div class="comment-avatar" style="width:40px;height:40px;background:var(--navy);">${post.avatar}</div>
                    <div><p style="font-weight:600;color:var(--navy);font-size:14px;">${post.user_name}</p><p style="font-size:12px;color:var(--gray-400);">${post.created_at || ''}</p></div>
                </div>
                ${snap ? `<div style="display:flex;gap:12px;font-size:11px;"><span style="color:var(--green);font-weight:600;">CAGR ${snap.cagr}%</span><span style="color:var(--gray-400);">${snap.assets} ETF</span></div>` : ''}
            </div>
            <p style="font-size:14px;color:var(--navy);line-height:1.6;margin-bottom:16px;">${post.content}</p>
            <div style="display:flex;gap:16px;">
                <button class="btn btn-sm btn-secondary" onclick="likePost(${post.id})">${ICONS.heart} <span id="likes-${post.id}">${post.likes}</span></button>
                <button class="btn btn-sm btn-secondary">${ICONS['message-circle']} ${post.comments}</button>
            </div>
        </div></div>`;
}

async function createPost() {
    const content = document.getElementById('post-content').value.trim();
    if (!content) return;
    try {
        const post = await api('/api/community/posts', { method: 'POST', body: JSON.stringify({ content }) });
        document.getElementById('post-content').value = '';
        navigateTo('community');
        showToast('Post pubblicato!', 'success');
    } catch (e) { showToast(e.message, 'error'); }
}

async function likePost(id) {
    try {
        await api(`/api/community/posts/${id}/like`, { method: 'POST' });
        const el = document.getElementById(`likes-${id}`);
        if (el) el.textContent = parseInt(el.textContent) + 1;
    } catch (e) {}
}

// ─── ACADEMY ───
function renderAcademy(container) {
    container.innerHTML = `
        ${createSectionHeader('Manuale e Academy', 'Impara a investire con ETF dalla A alla Z')}
        <div class="grid-lg-2" style="gap:24px;">
            <div>
                <div style="display:flex;gap:8px;margin-bottom:16px;">
                    <button class="btn btn-sm btn-primary">Moduli</button>
                </div>
                ${MANUAL_MODULES.map(mod => `
                    <div class="card" style="margin-bottom:12px;overflow:visible;">
                        <div class="card-body" style="padding:16px 20px;">
                            <div style="display:flex;align-items:center;gap:12px;cursor:pointer;" onclick="toggleModule('${mod.id}')">
                                <div style="width:40px;height:40px;border-radius:8px;background:${mod.color};display:flex;align-items:center;justify-content:center;flex-shrink:0;">${ICONS[mod.icon] || ICONS['book-open']}</div>
                                <div style="flex:1;"><h4 style="font-size:15px;font-weight:600;color:var(--navy);">${mod.title}</h4><p style="font-size:12px;color:var(--gray-400);">${mod.subtitle}</p></div>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--gray-400);transform:${expandedModule === mod.id ? 'rotate(90deg)' : 'rotate(0)'};transition:transform 0.2s;"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            </div>
                            ${expandedModule === mod.id ? `
                                <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--gray-100);">
                                    ${mod.chapters.map(ch => `
                                        <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;cursor:pointer;" onclick="showChapter('${ch.id}')">
                                            <div style="display:flex;align-items:center;gap:10px;"><span style="width:24px;height:24px;border-radius:50%;background:var(--gray-100);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;color:var(--gray-600);">${ch.num}</span><span style="font-size:13px;color:var(--navy);">${ch.title}</span></div>
                                            <span style="font-size:11px;color:var(--gray-400);">${ch.readTime}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
            <div id="chapter-content">
                ${selectedChapter ? renderChapterContent(selectedChapter) : `
                    <div class="card" style="height:100%;display:flex;align-items:center;justify-content:center;min-height:400px;">
                        <div style="text-align:center;padding:48px;">
                            <div style="width:64px;height:64px;background:var(--gray-100);border-radius:16px;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--gray-400)" stroke-width="1.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg></div>
                            <h3 style="font-size:18px;font-weight:600;color:var(--navy);margin-bottom:8px;">Seleziona un capitolo</h3>
                            <p style="font-size:13px;color:var(--gray-400);">Scegli un modulo e un capitolo per iniziare a leggere</p>
                        </div>
                    </div>
                `}
            </div>
        </div>
        <div style="margin-top:32px;">
            <h2 style="font-size:18px;font-weight:600;color:var(--white);margin-bottom:16px;display:flex;align-items:center;gap:8px;"><div style="width:4px;height:20px;background:var(--green-light);border-radius:2px;"></div>Corsi Academy</h2>
            <div class="grid-lg-3">
                ${ACADEMY_COURSES.map(course => `
                    <div class="card"><div class="card-body">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                            <span class="label ${course.level === 'Base' ? 'label-success' : course.level === 'Intermedio' ? 'label-warning' : 'label-info'}">${course.level}</span>
                            <span style="font-size:11px;color:var(--gray-400);">${course.duration}</span>
                        </div>
                        <h4 style="font-size:14px;font-weight:600;color:var(--navy);margin-bottom:4px;">${course.title}</h4>
                        <p style="font-size:12px;color:var(--gray-400);">${course.lessons} lezioni</p>
                    </div></div>
                `).join('')}
            </div>
        </div>`;
}

function toggleModule(id) { expandedModule = expandedModule === id ? null : id; renderAcademy(document.getElementById('main-content')); }
function showChapter(chapterId) { selectedChapter = chapterId; const el = document.getElementById('chapter-content'); if (el) el.innerHTML = renderChapterContent(chapterId); }

function renderChapterContent(chapterId) {
    const summary = CHAPTER_SUMMARIES[chapterId];
    if (!summary) return `<div class="card"><div class="card-body"><p style="color:var(--gray-400);">Contenuto in preparazione...</p></div></div>`;
    return `
        <div class="card"><div class="card-body">
            <h3 style="font-size:18px;font-weight:600;color:var(--navy);margin-bottom:4px;">${summary.title}</h3>
            <p style="font-size:12px;color:var(--gray-400);margin-bottom:20px;">Tempo di lettura: 5-8 minuti</p>
            <h4 style="font-size:14px;font-weight:600;color:var(--navy);margin-bottom:12px;">Punti chiave</h4>
            <ul style="list-style:none;padding:0;display:flex;flex-direction:column;gap:12px;">
                ${summary.keyPoints.map(point => `
                    <li style="display:flex;gap:10px;align-items:flex-start;">
                        <div style="width:20px;height:20px;border-radius:50%;background:var(--green-light);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--navy-dark)" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
                        <span style="font-size:13px;color:var(--navy);line-height:1.5;">${point}</span>
                    </li>
                `).join('')}
            </ul>
            <div style="margin-top:24px;padding-top:16px;border-top:1px solid var(--gray-100);display:flex;gap:8px;">
                <button class="btn btn-sm btn-secondary">${ICONS['check-circle']} Segna come letto</button>
                <button class="btn btn-sm btn-secondary">${ICONS.share} Condividi</button>
            </div>
        </div></div>`;
}

// ─── ALERTS ───
async function renderAlerts(container) {
    let alerts = [];
    try { alerts = await api('/api/alerts') || []; } catch (e) {}
    container.innerHTML = `
        ${createSectionHeader('Alert', 'Monitora i prezzi e ricevi notifiche')}
        <div style="display:flex;justify-content:flex-end;margin-bottom:16px;">
            <button class="btn btn-primary" onclick="openNewAlertModal()">${ICONS.plus} Nuovo alert</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:12px;">
            ${alerts.map(alert => `
                <div class="card"><div class="card-body" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;">
                    <div style="display:flex;align-items:center;gap:16px;">
                        <div style="width:48px;height:48px;background:var(--navy);border-radius:8px;display:flex;align-items:center;justify-content:center;color:var(--white);font-size:12px;font-weight:700;">${alert.etf_ticker.slice(0,3)}</div>
                        <div>
                            <h4 style="font-size:15px;font-weight:600;color:var(--navy);">${alert.etf_ticker}</h4>
                            <p style="font-size:12px;color:var(--gray-400);">${alert.alert_type === 'below' ? 'Sotto' : 'Sopra'} ${alert.threshold} &middot; Attuale: ${alert.current_price || 'N/A'}</p>
                        </div>
                    </div>
                    <div style="display:flex;align-items:center;gap:12px;">
                        <button class="toggle ${alert.active ? 'on' : 'off'}" onclick="toggleAlert(${alert.id})"><div class="toggle-knob"></div></button>
                        <button style="padding:4px;color:var(--gray-400);" onclick="deleteAlert(${alert.id})">${ICONS.trash}</button>
                    </div>
                </div></div>
            `).join('')}
        </div>`;
}

async function toggleAlert(id) {
    try {
        await api(`/api/alerts/${id}`, { method: 'PATCH', body: JSON.stringify({ active: true }) });
        renderAlerts(document.getElementById('main-content'));
        showToast('Alert aggiornato', 'success');
    } catch (e) { showToast(e.message, 'error'); }
}

async function deleteAlert(id) {
    try {
        await api(`/api/alerts/${id}`, { method: 'DELETE' });
        renderAlerts(document.getElementById('main-content'));
        showToast('Alert eliminato', 'success');
    } catch (e) { showToast(e.message, 'error'); }
}

// ─── SETTINGS ───
async function renderSettings(container) {
    container.innerHTML = `
        ${createSectionHeader('Impostazioni', 'Gestisci profilo, notifiche e preferenze')}
        <div class="grid-lg-4" style="gap:24px;">
            <div>
                <div class="card"><div class="card-body" style="padding:12px;">
                    ${[{id:'profile',label:'Profilo',icon:'user'},{id:'notifications',label:'Notifiche',icon:'bell'},{id:'preferences',label:'Preferenze',icon:'settings'},{id:'security',label:'Sicurezza',icon:'shield'},{id:'data',label:'Dati',icon:'download'}].map(tab => `
                        <button class="list-item ${settingsTab === tab.id ? 'active' : ''}" style="width:100%;border:none;margin-bottom:2px;${settingsTab === tab.id ? 'background:var(--gray-50);border-color:var(--blue);' : ''}" onclick="settingsTab='${tab.id}';renderSettings(document.getElementById('main-content'));">
                            ${ICONS[tab.icon]}<span style="font-size:13px;font-weight:${settingsTab === tab.id ? '600' : '500'};color:var(--navy);">${tab.label}</span>
                        </button>
                    `).join('')}
                </div></div>
            </div>
            <div style="grid-column:span 3;"><div class="card"><div class="card-body">${renderSettingsContent()}</div></div></div>
        </div>`;
}

function renderSettingsContent() {
    switch (settingsTab) {
        case 'profile': return renderProfileSettings();
        case 'notifications': return renderNotificationSettings();
        case 'preferences': return renderPreferenceSettings();
        case 'security': return renderSecuritySettings();
        case 'data': return renderDataSettings();
        default: return renderProfileSettings();
    }
}

function renderProfileSettings() {
    return `
        <h3 class="section-title">Profilo</h3>
        <p class="section-desc">Informazioni personali e avatar</p>
        <form onsubmit="saveProfile(event)">
            <div style="margin-bottom:16px;"><label style="display:block;font-size:12px;font-weight:600;color:var(--navy);margin-bottom:6px;">Nome completo</label><input type="text" class="form-input" id="profile-name" value="${currentUser ? currentUser.name : ''}" required></div>
            <div style="margin-bottom:16px;"><label style="display:block;font-size:12px;font-weight:600;color:var(--navy);margin-bottom:6px;">Email</label><input type="email" class="form-input" id="profile-email" value="${currentUser ? currentUser.email : ''}" required></div>
            <button type="submit" class="btn btn-primary">Salva modifiche</button>
        </form>`;
}

function renderNotificationSettings() {
    return `
        <h3 class="section-title">Notifiche</h3>
        <p class="section-desc">Scegli come e quando ricevere aggiornamenti</p>
        <div style="display:flex;flex-direction:column;gap:16px;">
            <div style="display:flex;justify-content:space-between;align-items:center;"><div><p style="font-size:14px;font-weight:500;color:var(--navy);">Alert prezzo via email</p><p style="font-size:12px;color:var(--gray-400);">Ricevi email quando un ETF raggiunge la soglia</p></div><button class="toggle on" onclick="this.classList.toggle('on');this.classList.toggle('off')"><div class="toggle-knob"></div></button></div>
            <div style="display:flex;justify-content:space-between;align-items:center;"><div><p style="font-size:14px;font-weight:500;color:var(--navy);">Newsletter settimanale</p><p style="font-size:12px;color:var(--gray-400);">Riepilogo performance ogni lunedi</p></div><button class="toggle on" onclick="this.classList.toggle('on');this.classList.toggle('off')"><div class="toggle-knob"></div></button></div>
        </div>`;
}

function renderPreferenceSettings() {
    return `
        <h3 class="section-title">Preferenze</h3>
        <p class="section-desc">Personalizza l'esperienza d'uso</p>
        <div style="display:flex;flex-direction:column;gap:16px;">
            <div style="display:flex;justify-content:space-between;align-items:center;"><div><p style="font-size:14px;font-weight:500;color:var(--navy);">Nascondi valori sensibili</p><p style="font-size:12px;color:var(--gray-400);">Mostra asterischi al posto degli importi</p></div><button class="toggle off" onclick="this.classList.toggle('on');this.classList.toggle('off')"><div class="toggle-knob"></div></button></div>
            <div><label style="display:block;font-size:12px;font-weight:600;color:var(--navy);margin-bottom:8px;">Valuta</label><select class="form-select"><option value="EUR">EUR (€)</option><option value="USD">USD ($)</option></select></div>
        </div>`;
}

function renderSecuritySettings() {
    return `
        <h3 class="section-title">Sicurezza</h3>
        <p class="section-desc">Gestisci password e accesso</p>
        <form onsubmit="changePassword(event)">
            <div style="margin-bottom:16px;"><label style="display:block;font-size:12px;font-weight:600;color:var(--navy);margin-bottom:6px;">Password attuale</label><input type="password" class="form-input" placeholder="••••••••" required></div>
            <div style="margin-bottom:16px;"><label style="display:block;font-size:12px;font-weight:600;color:var(--navy);margin-bottom:6px;">Nuova password</label><input type="password" class="form-input" placeholder="Minimo 8 caratteri" required minlength="8"></div>
            <div style="margin-bottom:16px;"><label style="display:block;font-size:12px;font-weight:600;color:var(--navy);margin-bottom:6px;">Conferma nuova password</label><input type="password" class="form-input" placeholder="Ripeti password" required></div>
            <button type="submit" class="btn btn-primary">Aggiorna password</button>
        </form>`;
}

function renderDataSettings() {
    return `
        <h3 class="section-title">Gestione dati</h3>
        <p class="section-desc">Esporta o elimina i tuoi dati</p>
        <div style="display:flex;flex-direction:column;gap:12px;">
            <button class="btn btn-secondary" onclick="exportData()">${ICONS.download} Esporta dati (JSON)</button>
            <button class="btn btn-secondary" style="color:var(--red);border-color:var(--red);" onclick="resetData()">${ICONS.trash} Cancella tutti i dati</button>
        </div>`;
}

async function saveProfile(e) {
    e.preventDefault();
    const name = document.getElementById('profile-name').value;
    if (currentUser) { currentUser.name = name; updateUserInfo(); }
    showToast('Profilo aggiornato', 'success');
}
function changePassword(e) { e.preventDefault(); showToast('Password aggiornata', 'success'); e.target.reset(); }
function exportData() { showToast('Dati esportati', 'success'); }
function resetData() { if (confirm('Sei sicuro?')) { showToast('Dati cancellati', 'success'); } }

// ─── MODALS ───
function openModal(html) {
    document.getElementById('modal-container').innerHTML = `<div class="modal-overlay" onclick="if(event.target===this)closeModal()"><div class="modal" onclick="event.stopPropagation()">${html}</div></div>`;
}
function openModalLarge(html) {
    document.getElementById('modal-container').innerHTML = `<div class="modal-overlay" onclick="if(event.target===this)closeModal()"><div class="modal modal-lg" onclick="event.stopPropagation()">${html}</div></div>`;
}
function closeModal() { document.getElementById('modal-container').innerHTML = ''; }

async function openAddToPortfolioModal(isin) {
    const etf = ETF_DATABASE.find(e => e.isin === isin);
    if (!etf) return;
    // Get user's portfolios
    let portfolios = [];
    try { portfolios = await api('/api/portfolios') || []; } catch (e) {}
    openModal(`
        <div class="modal-header"><h3 style="font-size:16px;font-weight:600;color:var(--navy);">Aggiungi ${etf.ticker}</h3><button onclick="closeModal()" style="padding:4px;color:var(--gray-400);">${ICONS.x}</button></div>
        <div class="modal-body">
            <form id="add-form" onsubmit="submitAddToPortfolio(event, '${etf.isin}', '${etf.ticker}', '${etf.name.replace(/'/g, "\\'")}')">
                <div style="margin-bottom:16px;"><label style="display:block;font-size:12px;font-weight:600;color:var(--navy);margin-bottom:6px;">Portafoglio</label>
                    <select class="form-input" id="add-portfolio-id" required>
                        ${portfolios.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
                        ${portfolios.length === 0 ? '<option value="">Crea prima un portafoglio</option>' : ''}
                    </select>
                </div>
                <div style="margin-bottom:16px;"><label style="display:block;font-size:12px;font-weight:600;color:var(--navy);margin-bottom:6px;">Quantita quote</label><input type="number" class="form-input" id="add-shares" placeholder="10" min="0.01" step="0.01" required></div>
                <div style="margin-bottom:16px;"><label style="display:block;font-size:12px;font-weight:600;color:var(--navy);margin-bottom:6px;">Prezzo medio d'acquisto (EUR)</label><input type="number" class="form-input" id="add-price" value="${etf.price.toFixed(2)}" min="0.01" step="0.01" required><p style="font-size:11px;color:var(--gray-400);margin-top:4px;">Prezzo attuale: ${fmtFull(etf.price)}</p></div>
                <div style="display:flex;gap:8px;"><button type="button" class="btn btn-secondary btn-block" onclick="closeModal()">Annulla</button><button type="submit" class="btn btn-primary btn-block">Aggiungi</button></div>
            </form>
        </div>`);
}

async function submitAddToPortfolio(e, isin, ticker, name) {
    e.preventDefault();
    const portfolioId = document.getElementById('add-portfolio-id').value;
    if (!portfolioId) { showToast('Crea prima un portafoglio', 'error'); return; }
    const shares = parseFloat(document.getElementById('add-shares').value);
    const avgPrice = parseFloat(document.getElementById('add-price').value);
    try {
        await api(`/api/portfolios/${portfolioId}/holdings`, {
            method: 'POST',
            body: JSON.stringify({ isin, ticker, name, shares, avgPrice })
        });
        closeModal();
        navigateTo('dashboard');
        showToast('ETF aggiunto al portafoglio!', 'success');
    } catch (err) { showToast(err.message, 'error'); }
}

async function openAddPortfolioModal() {
    let portfolios = [];
    try { portfolios = await api('/api/portfolios') || []; } catch (e) {}
    openModalLarge(`
        <div class="modal-header"><h3 style="font-size:16px;font-weight:600;color:var(--navy);">Aggiungi ETF al portafoglio</h3><button onclick="closeModal()" style="padding:4px;color:var(--gray-400);">${ICONS.x}</button></div>
        <div class="modal-body">
            ${portfolios.length === 0 ? `
                <div style="margin-bottom:16px;padding:16px;background:var(--info-bg);border-radius:8px;">
                    <p style="font-size:13px;color:var(--blue);font-weight:600;margin-bottom:8px;">Nessun portafoglio trovato</p>
                    <p style="font-size:12px;color:var(--gray-600);margin-bottom:12px;">Crea il tuo primo portafoglio per iniziare.</p>
                    <button class="btn btn-primary" onclick="createFirstPortfolio()">Crea Portafoglio Principale</button>
                </div>
            ` : ''}
            <div class="input-wrapper" style="margin-bottom:16px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--gray-400);"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input type="text" class="form-input" id="portfolio-search" placeholder="Cerca ETF per nome o ticker..." style="padding-left:40px;" oninput="renderPortfolioSearchResults(this.value)">
            </div>
            <div id="portfolio-search-results" style="max-height:300px;overflow-y:auto;"></div>
        </div>`);
    renderPortfolioSearchResults('');
}

async function createFirstPortfolio() {
    try {
        await api('/api/portfolios', { method: 'POST', body: JSON.stringify({ name: 'Portafoglio Principale', strategy: 'custom' }) });
        closeModal();
        openAddPortfolioModal();
        showToast('Portafoglio creato!', 'success');
    } catch (e) { showToast(e.message, 'error'); }
}

function renderPortfolioSearchResults(query) {
    const resultsDiv = document.getElementById('portfolio-search-results');
    if (!resultsDiv) return;
    const q = query.toLowerCase();
    const filtered = ETF_DATABASE.filter(e => !q || e.name.toLowerCase().includes(q) || e.ticker.toLowerCase().includes(q)).slice(0, 10);
    resultsDiv.innerHTML = filtered.map(etf => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;border-radius:6px;border:1px solid var(--gray-100);margin-bottom:6px;cursor:pointer;" onmouseover="this.style.background='var(--gray-50)'" onmouseout="this.style.background='white'" onclick="openAddToPortfolioModal('${etf.isin}')">
            <div style="display:flex;align-items:center;gap:10px;">
                <div style="width:36px;height:36px;background:var(--navy);border-radius:6px;display:flex;align-items:center;justify-content:center;color:var(--white);font-size:10px;font-weight:700;">${etf.ticker.slice(0,3)}</div>
                <div><p style="font-size:13px;font-weight:600;color:var(--navy);">${etf.ticker}</p><p style="font-size:11px;color:var(--gray-400);">${etf.name}</p></div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gray-400)" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </div>
    `).join('');
}

function openNewAlertModal() {
    openModal(`
        <div class="modal-header"><h3 style="font-size:16px;font-weight:600;color:var(--navy);">Nuovo alert prezzo</h3><button onclick="closeModal()" style="padding:4px;color:var(--gray-400);">${ICONS.x}</button></div>
        <div class="modal-body">
            <form onsubmit="submitNewAlert(event)">
                <div style="margin-bottom:16px;"><label style="display:block;font-size:12px;font-weight:600;color:var(--navy);margin-bottom:6px;">ETF</label><select class="form-input" id="alert-etf" required>
                    ${ETF_DATABASE.map(e => `<option value="${e.isin}" data-price="${e.price}" data-ticker="${e.ticker}">${e.ticker} - ${fmtFull(e.price)}</option>`).join('')}
                </select></div>
                <div style="margin-bottom:16px;"><label style="display:block;font-size:12px;font-weight:600;color:var(--navy);margin-bottom:6px;">Condizione</label><select class="form-input" id="alert-type" required><option value="below">Prezzo inferiore a</option><option value="above">Prezzo superiore a</option></select></div>
                <div style="margin-bottom:16px;"><label style="display:block;font-size:12px;font-weight:600;color:var(--navy);margin-bottom:6px;">Soglia (EUR)</label><input type="number" class="form-input" id="alert-threshold" placeholder="100" min="0.01" step="0.01" required></div>
                <div style="display:flex;gap:8px;"><button type="button" class="btn btn-secondary btn-block" onclick="closeModal()">Annulla</button><button type="submit" class="btn btn-primary btn-block">Crea alert</button></div>
            </form>
        </div>`);
}

async function submitNewAlert(e) {
    e.preventDefault();
    const select = document.getElementById('alert-etf');
    const option = select.options[select.selectedIndex];
    try {
        await api('/api/alerts', {
            method: 'POST',
            body: JSON.stringify({
                etfIsin: select.value,
                etfTicker: option.dataset.ticker,
                type: document.getElementById('alert-type').value,
                threshold: parseFloat(document.getElementById('alert-threshold').value),
                currentPrice: parseFloat(option.dataset.price),
                channels: ['email', 'push']
            })
        });
        closeModal();
        renderAlerts(document.getElementById('main-content'));
        showToast('Alert creato', 'success');
    } catch (e) { showToast(e.message, 'error'); }
}

function showTerms() { alert('Termini di servizio: ETF Tracker e uno strumento di analisi. Non costituisce consulenza finanziaria.'); }
function showPrivacy() { alert('Privacy: i tuoi dati sono salvati nel database SQLite locale.'); }
function showSecurity() { alert('Sicurezza: password hash con PBKDF2, token JWT firmato.'); }
