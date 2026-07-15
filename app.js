// ─── CONFIG ───────────────────────────────────────────────
const SUPABASE_URL = 'https://usgtjfnqejudlnomugyr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzZ3RqZm5xZWp1ZGxub211Z3lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4NjQ2MTUsImV4cCI6MjA5ODQ0MDYxNX0.aLgim0t-86B7YXBaKlFqfAyj5X-M2j5PBlFdP8VF2z4';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── STATE ────────────────────────────────────────────────
let state = {
  tasks: {}, metrics: {},
  habits: [], habitChecks: {},
  clients: [], finances: [], ideas: [],
  services: [], snapshots: [], testimonios: [], months: []
};
let currentWeek = 1;
let currentMetricWeek = 1;
let currentSection = 'dashboard';
let syncTimeout = null;

// ─── STORAGE ──────────────────────────────────────────────
function loadFromStorage() {
  try { const s = localStorage.getItem('png_tracker_v3'); if (s) state = { ...state, ...JSON.parse(s) }; } catch (e) { }
}
function saveToStorage() {
  try { localStorage.setItem('png_tracker_v3', JSON.stringify(state)); } catch (e) { }
}

// ─── SYNC STATUS ──────────────────────────────────────────
function setSyncStatus(status) {
  const dot = document.getElementById('sync-dot');
  const text = document.getElementById('sync-text');
  if (!dot || !text) return;
  dot.className = 'sync-dot';
  if (status === 'syncing') { dot.classList.add('syncing'); text.textContent = 'Guardando...'; }
  else if (status === 'ok') { text.textContent = 'Guardado ✓'; setTimeout(() => { text.textContent = 'Listo'; }, 2000); }
  else if (status === 'error') { dot.classList.add('error'); text.textContent = 'Sin conexión'; }
  else { text.textContent = 'Listo'; }
}

// ─── SUPABASE SYNC ────────────────────────────────────────
async function syncToSupabase() {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return;
  setSyncStatus('syncing');
  try {
    const { error } = await sb.from('tracker_state').upsert({
      id: user.id,
      tasks: state.tasks,
      metrics: state.metrics,
      habits: state.habits,
      habit_checks: state.habitChecks,
      clients: state.clients,
      finances: state.finances,
      ideas: state.ideas,
      services: state.services || [],
      snapshots: state.snapshots || [],
      testimonios: state.testimonios || [],
      months: state.months || [],
      updated_at: new Date().toISOString()
    });
    if (error) throw error;
    setSyncStatus('ok');
  } catch (e) { setSyncStatus('error'); }
}

async function loadFromSupabase() {
  try {
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return;
    const { data, error } = await sb.from('tracker_state').select('*').eq('id', user.id).single();
    if (error || !data) return;
    state.tasks = data.tasks || {};
    state.metrics = data.metrics || {};
    state.habits = data.habits || [];
    state.habitChecks = data.habit_checks || {};
    state.clients = data.clients || [];
    state.finances = data.finances || [];
    state.ideas = data.ideas || [];
    state.services = data.services || [];
    state.snapshots = data.snapshots || [];
    state.testimonios = data.testimonios || [];
    state.months = data.months || [];
    saveToStorage();
    refreshCurrentSection();
  } catch (e) { }
}

function scheduleSync() {
  saveToStorage();
  clearTimeout(syncTimeout);
  syncTimeout = setTimeout(syncToSupabase, 1500);
}

// ─── AUTH ─────────────────────────────────────────────────
async function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const errEl = document.getElementById('login-error');
  errEl.style.display = 'none';
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) { errEl.textContent = 'Email o contraseña incorrectos'; errEl.style.display = 'block'; }
}

async function doLogout() {
  await sb.auth.signOut();
  const ls = document.getElementById('login-screen');
  ls.style.display = '';
  document.getElementById('app-root').style.display = 'none';
}

// ─── ANIMACIONES LANDING ──────────────────────────────────
function animateLanding() {
  const els = document.querySelectorAll('.fade-up');
  els.forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), i * 100);
  });
}

function animateCounters() {
  document.querySelectorAll('.stat-number').forEach(el => {
    const target = parseInt(el.dataset.target);
    const duration = 1500;
    const step = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { current = target; clearInterval(timer); }
      el.textContent = Math.floor(current);
    }, 16);
  });
}

// ─── NAVIGATION ───────────────────────────────────────────
function navigate(section, el) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('section-' + section).classList.add('active');
  if (el) el.classList.add('active');
  currentSection = section;
  const titles = { dashboard: 'Dashboard', plan: 'Plan 30 días', habitos: 'Hábitos', clientes: 'Clientes', finanzas: 'Finanzas', ideas: 'Ideas', metricas: 'Métricas IG', comparar: 'Comparar', servicios: 'Servicios', mensajes: 'Mensajes' };
  document.getElementById('topbar-title').textContent = titles[section] || section;
  closeSidebarMobile();
  refreshCurrentSection();
}

function refreshCurrentSection() {
  if (currentSection === 'dashboard') renderDashboard();
  else if (currentSection === 'plan') renderWeek(currentWeek);
  else if (currentSection === 'habitos') renderHabitos();
  else if (currentSection === 'clientes') renderClientes();
  else if (currentSection === 'finanzas') renderFinanzas();
  else if (currentSection === 'ideas') renderIdeas();
  else if (currentSection === 'metricas') renderMetrics(currentMetricWeek);
  else if (currentSection === 'comparar') renderCompare();
  else if (currentSection === 'servicios') renderServicios();
  else if (currentSection === 'mensajes') renderMensajes();
  else if (currentSection === 'testimonios') renderTestimonios();
}

function toggleSidebar() { document.getElementById('sidebar').classList.toggle('open'); }
function closeSidebarMobile() { if (window.innerWidth <= 768) document.getElementById('sidebar').classList.remove('open'); }

// ─── MODALS ───────────────────────────────────────────────
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
function closeModalOutside(e, id) { if (e.target.id === id) closeModal(id); }

// ─── PLAN ─────────────────────────────────────────────────
function toggleTask(weekNum, dayIdx, taskIdx) {
  const key = `${weekNum}_${dayIdx}_${taskIdx}`;
  state.tasks[key] = !state.tasks[key];
  scheduleSync();
  renderWeek(weekNum);
  updatePlanProgress();
}

function getWeekProgress(weekNum) {
  const week = WEEKS[weekNum - 1];
  let total = 0, done = 0;
  week.days.forEach((day, di) => {
    day.tasks.forEach((_, ti) => { total++; if (state.tasks[`${weekNum}_${di}_${ti}`]) done++; });
  });
  return { total, done };
}

function updatePlanProgress() {
  let total = 0, done = 0;
  WEEKS.forEach(w => { const p = getWeekProgress(w.num); total += p.total; done += p.done; });
  const pct = total ? Math.round(done / total * 100) : 0;
  const badge = document.getElementById('plan-global-pct');
  const bar = document.getElementById('plan-global-bar');
  if (badge) badge.textContent = pct + '%';
  if (bar) bar.style.width = pct + '%';
}

function renderWeek(weekNum) {
  currentWeek = weekNum;
  const week = WEEKS[weekNum - 1];
  const { total, done } = getWeekProgress(weekNum);
  const pct = total ? Math.round(done / total * 100) : 0;

  let html = `<div class="week-header">
    <span class="week-badge">Semana ${week.num}</span>
    <div><div class="week-title">${week.title}</div><div class="week-goal">${week.goal}</div></div>
  </div>
  <div class="week-mini-progress"><div class="week-mini-fill" style="width:${pct}%"></div></div>`;

  week.days.forEach((day, di) => {
    html += `<div class="day-card"><div class="day-label">${day.label}</div>`;
    day.tasks.forEach((task, ti) => {
      const isDone = !!state.tasks[`${weekNum}_${di}_${ti}`];
      html += `<div class="task" onclick="toggleTask(${weekNum},${di},${ti})">
        <div class="task-check ${isDone ? 'done' : ''}"></div>
        <span class="task-text ${isDone ? 'done' : ''}">${task.text}</span>
        <span class="task-tag tag-${task.tag}">${task.tag}</span>
      </div>`;
    });
    html += `</div>`;
  });

  const cont = document.getElementById('week-container');
  if (cont) cont.innerHTML = html;
  updatePlanProgress();
}

function showWeek(n, btn) {
  document.querySelectorAll('#week-tabs .week-tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderWeek(n);
}

// ─── HÁBITOS ──────────────────────────────────────────────
function addHabit() {
  const name = document.getElementById('habit-name').value.trim();
  const icon = document.getElementById('habit-icon').value;
  if (!name) return;
  state.habits.push({ id: Date.now(), name, icon });
  document.getElementById('habit-name').value = '';
  scheduleSync();
  closeModal('modal-add-habit');
  renderHabitos();
}

function deleteHabit(id) {
  state.habits = state.habits.filter(h => h.id !== id);
  scheduleSync();
  renderHabitos();
}

function toggleHabitDay(habitId, dayKey) {
  const key = `${habitId}_${dayKey}`;
  state.habitChecks[key] = !state.habitChecks[key];
  scheduleSync();
  renderHabitos();
}

function getStreak(habitId) {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    if (state.habitChecks[`${habitId}_${d.toISOString().slice(0, 10)}`]) streak++;
    else if (i > 0) break;
  }
  return streak;
}

function renderHabitos() {
  const cont = document.getElementById('habitos-container');
  if (!cont) return;
  if (!state.habits.length) {
    cont.innerHTML = `<div class="empty-state"><div class="empty-icon">✦</div>No tenés hábitos todavía. Agregá uno para empezar.</div>`;
    return;
  }
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    days.push({ key: d.toISOString().slice(0, 10), label: ['D', 'L', 'M', 'X', 'J', 'V', 'S'][d.getDay()] });
  }
  const todayKey = new Date().toISOString().slice(0, 10);
  cont.innerHTML = state.habits.map(h => {
    const streak = getStreak(h.id);
    const daysHtml = days.map(d => {
      const checked = !!state.habitChecks[`${h.id}_${d.key}`];
      const isToday = d.key === todayKey;
      return `<div class="habit-day ${checked ? 'done' : ''} ${isToday && !checked ? 'today' : ''}" onclick="toggleHabitDay(${h.id},'${d.key}')">${d.label}</div>`;
    }).join('');
    return `<div class="habit-row">
      <span class="habit-icon">${h.icon}</span>
      <span class="habit-name">${h.name}</span>
      ${streak > 1 ? `<span class="habit-streak">🔥 ${streak}</span>` : ''}
      <div class="habit-days">${daysHtml}</div>
      <button class="habit-delete" onclick="deleteHabit(${h.id})">✕</button>
    </div>`;
  }).join('');
}

// ─── CLIENTES ─────────────────────────────────────────────
const STAGES = [
  { key: 'prospecto', label: 'Prospecto', color: '#0f766e' },
  { key: 'contactado', label: 'Contactado', color: '#f59e0b' },
  { key: 'propuesta', label: 'Propuesta enviada', color: '#2dd4bf' },
  { key: 'negociando', label: 'Negociando', color: '#a78bfa' },
  { key: 'cerrado', label: 'Cerrado ✓', color: '#22c55e' }
];

function addClient() {
  const name = document.getElementById('client-name').value.trim();
  const type = document.getElementById('client-type').value.trim();
  const stage = document.getElementById('client-stage').value;
  const value = document.getElementById('client-value').value;
  const notes = document.getElementById('client-notes').value.trim();
  if (!name) return;
  state.clients.push({ id: Date.now(), name, type, stage, value, notes });
  ['client-name', 'client-type', 'client-value', 'client-notes'].forEach(id => document.getElementById(id).value = '');
  scheduleSync();
  closeModal('modal-add-client');
  renderClientes();
}

function openEditClient(id) {
  const c = state.clients.find(c => c.id === id);
  if (!c) return;
  document.getElementById('edit-client-id').value = id;
  document.getElementById('edit-client-name').value = c.name;
  document.getElementById('edit-client-type').value = c.type || '';
  document.getElementById('edit-client-stage').value = c.stage;
  document.getElementById('edit-client-value').value = c.value || '';
  document.getElementById('edit-client-notes').value = c.notes || '';
  openModal('modal-edit-client');
}

function saveEditClient() {
  const id = Number(document.getElementById('edit-client-id').value);
  const idx = state.clients.findIndex(c => c.id === id);
  if (idx === -1) return;
  state.clients[idx] = {
    id,
    name: document.getElementById('edit-client-name').value.trim(),
    type: document.getElementById('edit-client-type').value.trim(),
    stage: document.getElementById('edit-client-stage').value,
    value: document.getElementById('edit-client-value').value,
    notes: document.getElementById('edit-client-notes').value.trim()
  };
  scheduleSync();
  closeModal('modal-edit-client');
  renderClientes();
}

function deleteClient(id) {
  if (!confirm('¿Eliminás este cliente?')) return;
  state.clients = state.clients.filter(c => c.id !== id);
  scheduleSync();
  renderClientes();
}

function renderClientes() {
  const board = document.getElementById('pipeline-board');
  if (!board) return;
  board.innerHTML = STAGES.map(stage => {
    const clients = state.clients.filter(c => c.stage === stage.key);
    const cards = clients.length
      ? clients.map(c => `
        <div class="client-card" draggable="true"
          ondragstart="dragStart(event,${c.id})"
          ondragover="dragOver(event)"
          ondrop="dropClient(event,'${stage.key}')">
          <div class="client-name">${c.name}</div>
          ${c.type ? `<div class="client-type">${c.type}</div>` : ''}
          ${c.value ? `<div class="client-value">$${Number(c.value).toLocaleString('es-AR')}</div>` : ''}
          ${c.notes ? `<div class="client-notes-preview">${c.notes}</div>` : ''}
          ${c.nextStep ? `<div class="client-next-step">→ ${c.nextStep}</div>` : ''}
          ${c.followDate ? `<div class="client-follow-date">📅 ${c.followDate}</div>` : ''}
          <div class="client-actions">
            <span onclick="openEditClient(${c.id})">✏️ editar</span>
            <span onclick="openCRM(${c.id})">📋 CRM</span>
            <span onclick="deleteClient(${c.id})">✕ eliminar</span>
          </div>
        </div>`).join('')
      : `<div class="pipeline-empty">Sin clientes</div>`;
    return `<div class="pipeline-col"
      ondragover="dragOver(event)"
      ondrop="dropClient(event,'${stage.key}')">
      <div class="pipeline-col-header">
        <span class="pipeline-col-title" style="color:${stage.color}">${stage.label}</span>
        <span class="pipeline-col-count">${clients.length}</span>
      </div>
      ${cards}
    </div>`;
  }).join('');
}

// ─── DRAG & DROP ──────────────────────────────────────────
let draggedClientId = null;

function dragStart(event, id) {
  draggedClientId = id;
  event.dataTransfer.effectAllowed = 'move';
}

function dragOver(event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
}

function dropClient(event, newStage) {
  event.preventDefault();
  if (!draggedClientId) return;
  const idx = state.clients.findIndex(c => c.id === draggedClientId);
  if (idx !== -1) { state.clients[idx].stage = newStage; scheduleSync(); renderClientes(); }
  draggedClientId = null;
}

// ─── FINANZAS ─────────────────────────────────────────────
function addFinance() {
  const type = document.getElementById('finance-type').value;
  const desc = document.getElementById('finance-desc').value.trim();
  const amount = parseFloat(document.getElementById('finance-amount').value);
  const date = document.getElementById('finance-date').value || new Date().toISOString().slice(0, 10);
  if (!desc || !amount) return;
  state.finances.push({ id: Date.now(), type, desc, amount, date });
  ['finance-desc', 'finance-amount'].forEach(id => document.getElementById(id).value = '');
  scheduleSync();
  closeModal('modal-add-finance');
  renderFinanzas();
}

function deleteFinance(id) {
  state.finances = state.finances.filter(f => f.id !== id);
  scheduleSync();
  renderFinanzas();
}

function renderFinanzas() {
  const kpis = document.getElementById('finance-kpis');
  const list = document.getElementById('finance-list');
  if (!kpis || !list) return;
  const ingresos = state.finances.filter(f => f.type === 'ingreso').reduce((s, f) => s + f.amount, 0);
  const gastos = state.finances.filter(f => f.type === 'gasto').reduce((s, f) => s + f.amount, 0);
  const balance = ingresos - gastos;
  kpis.innerHTML = `
    <div class="kpi-card"><div class="kpi-label">Ingresos</div><div class="kpi-value" style="color:var(--success)">$${ingresos.toLocaleString('es-AR')}</div></div>
    <div class="kpi-card"><div class="kpi-label">Gastos</div><div class="kpi-value" style="color:var(--danger)">$${gastos.toLocaleString('es-AR')}</div></div>
    <div class="kpi-card"><div class="kpi-label">Balance</div><div class="kpi-value" style="color:${balance >= 0 ? 'var(--success)' : 'var(--danger)'}">$${balance.toLocaleString('es-AR')}</div></div>`;
  if (!state.finances.length) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">◐</div>Sin movimientos registrados.</div>`;
    return;
  }
  list.innerHTML = [...state.finances].sort((a, b) => b.date.localeCompare(a.date)).map(f => `
    <div class="finance-item">
      <span class="finance-type-badge badge-${f.type}">${f.type}</span>
      <span class="finance-desc">${f.desc}</span>
      <span class="finance-date">${f.date}</span>
      <span class="finance-amount ${f.type}">${f.type === 'ingreso' ? '+' : '-'}$${Number(f.amount).toLocaleString('es-AR')}</span>
      <button class="finance-delete" onclick="deleteFinance(${f.id})">✕</button>
    </div>`).join('');
}

// ─── IDEAS ────────────────────────────────────────────────
function addIdea() {
  const title = document.getElementById('idea-title').value.trim();
  const format = document.getElementById('idea-format').value;
  const niche = document.getElementById('idea-niche').value;
  const notes = document.getElementById('idea-notes').value.trim();
  if (!title) return;
  state.ideas.push({ id: Date.now(), title, format, niche, notes });
  ['idea-title', 'idea-notes'].forEach(id => document.getElementById(id).value = '');
  scheduleSync();
  closeModal('modal-add-idea');
  renderIdeas();
}

function deleteIdea(id) {
  state.ideas = state.ideas.filter(i => i.id !== id);
  scheduleSync();
  renderIdeas();
}

function renderIdeas() {
  const cont = document.getElementById('ideas-container');
  if (!cont) return;
  if (!state.ideas.length) {
    cont.innerHTML = `<div class="empty-state"><div class="empty-icon">✧</div>No hay ideas guardadas todavía.</div>`;
    return;
  }
  cont.innerHTML = `<div class="ideas-grid">${state.ideas.map(i => `
    <div class="idea-card">
      <button class="idea-delete" onclick="deleteIdea(${i.id})">✕</button>
      <div class="idea-badges">
        <span class="idea-badge badge-${i.format}">${i.format}</span>
        <span class="idea-badge badge-${i.niche}">${i.niche}</span>
      </div>
      <div class="idea-title">${i.title}</div>
      ${i.notes ? `<div class="idea-notes">${i.notes}</div>` : ''}
    </div>`).join('')}</div>`;
}

// ─── SERVICIOS ────────────────────────────────────────────
function addServicio() {
  const name = document.getElementById('serv-name').value.trim();
  const desc = document.getElementById('serv-desc').value.trim();
  const price = document.getElementById('serv-price').value;
  const currency = document.getElementById('serv-currency').value;
  const unit = document.getElementById('serv-unit').value; if (!name) return;
  if (!state.services) state.services = [];
  state.services.push({ id: Date.now(), name, desc, price, currency: currency || 'ARS', unit });['serv-name', 'serv-desc', 'serv-price'].forEach(id => document.getElementById(id).value = '');
  scheduleSync();
  closeModal('modal-add-servicio');
  renderServicios();
}

function openEditServicio(id) {
  const s = (state.services || []).find(s => s.id === id);
  if (!s) return;
  document.getElementById('edit-serv-id').value = id;
  document.getElementById('edit-serv-name').value = s.name;
  document.getElementById('edit-serv-desc').value = s.desc || '';
  document.getElementById('edit-serv-price').value = s.price || '';
  document.getElementById('edit-serv-currency').value = s.currency || 'ARS';
  document.getElementById('edit-serv-unit').value = s.unit || 'por mes';
  openModal('modal-edit-servicio');
}

function saveEditServicio() {
  const id = Number(document.getElementById('edit-serv-id').value);
  const idx = (state.services || []).findIndex(s => s.id === id);
  if (idx === -1) return;
  state.services[idx] = {
    id,
    name: document.getElementById('edit-serv-name').value.trim(),
    desc: document.getElementById('edit-serv-desc').value.trim(),
    price: document.getElementById('edit-serv-price').value,
    currency: document.getElementById('edit-serv-currency').value || 'ARS',
    unit: document.getElementById('edit-serv-unit').value
  };
  scheduleSync();
  closeModal('modal-edit-servicio');
  renderServicios();
}

function deleteServicio(id) {
  state.services = (state.services || []).filter(s => s.id !== id);
  scheduleSync();
  renderServicios();
}

function renderServicios() {
  const cont = document.getElementById('servicios-container');
  if (!cont) return;
  const services = state.services || [];
  if (!services.length) {
    cont.innerHTML = `<div class="empty-state"><div class="empty-icon">◈</div>No tenés servicios cargados todavía.</div>`;
    return;
  }
  cont.innerHTML = `<div class="services-grid">${services.map(s => `
    <div class="service-card">
      <button class="idea-delete" onclick="deleteServicio(${s.id})">✕</button>
      <div class="service-name">${s.name}</div>
<div class="service-price">${s.currency === 'USD' ? 'U$D' : '$'}${Number(s.price).toLocaleString('es-AR')} <span class="service-unit">${s.unit}</span></div>      ${s.desc ? `<div class="service-desc">${s.desc}</div>` : ''}
      <div style="display:flex;gap:8px;margin-top:10px">
        <button class="btn-secondary" style="flex:1" onclick="openEditServicio(${s.id})">✏️ Editar</button>
        <button class="btn-primary" style="flex:1" onclick="generarPresupuesto(${s.id})">Presupuesto</button>
      </div>
    </div>`).join('')}</div>`;
}

function generarPresupuesto(serviceId) {
  const s = (state.services || []).find(s => s.id === serviceId);
  if (!s) return;
  document.getElementById('presup-service-id').value = serviceId;
  document.getElementById('presup-service-name').textContent = s.name;
  document.getElementById('presup-price').textContent = `$${Number(s.price).toLocaleString('es-AR')} ${s.unit}`;
  const clientSelect = document.getElementById('presup-client');
  clientSelect.innerHTML = `<option value="">Sin cliente específico</option>` +
    state.clients.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  document.getElementById('presup-output').textContent = '';
  openModal('modal-presupuesto');
}

function generarTextPresupuesto() {
  const serviceId = Number(document.getElementById('presup-service-id').value);
  const clientId = Number(document.getElementById('presup-client').value);
  const s = (state.services || []).find(s => s.id === serviceId);
  const c = state.clients.find(c => c.id === clientId);
  if (!s) return;

  const texto = `Hola${c ? ` ${c.name}` : ''}! 👋

Te comparto el detalle de lo que podemos hacer juntos:

📌 *${s.name}*
${s.desc ? s.desc + '\n' : ''}
💰 Inversión: ${s.currency === 'USD' ? 'U$D' : '$'}${Number(s.price).toLocaleString('es-AR')} ${s.unit}
Si te interesa arrancamos cuando quieras. Cualquier duda estoy acá.

— Pablo Granados
@pablogranados.png`;

  document.getElementById('presup-output').textContent = texto;
}

function copiarPresupuesto() {
  const text = document.getElementById('presup-output').textContent;
  if (!text) return;
  navigator.clipboard.writeText(text);
  const btn = document.getElementById('btn-copiar-presup');
  btn.textContent = '✓ Copiado';
  setTimeout(() => { btn.textContent = 'Copiar'; }, 2000);
}

// ─── MENSAJES ─────────────────────────────────────────────
function generarMensaje() {
  const clientId = Number(document.getElementById('msg-client').value);
  const tipo = document.getElementById('msg-tipo').value;
  const canal = document.getElementById('msg-canal').value;
  const extra = document.getElementById('msg-extra').value.trim();
  const outputEl = document.getElementById('msg-output');

  const c = state.clients.find(c => c.id === clientId);
  const nombre = c ? c.name : '[nombre]';
  const negocio = c?.type || '[tipo de negocio]';

  const plantillas = {
    'primer-contacto': `Hola ${nombre}! 👋\n\nVi lo que están haciendo con ${negocio} y me pareció muy interesante.\n\nSoy Pablo, me dedico a la edición de video y creación de contenido para marcas. Ayudo a negocios como el tuyo a destacar en redes con contenido profesional.\n\n¿Te interesaría que charlemos sobre cómo podríamos trabajar juntos?\n\n— Pablo | @pablogranados.png`,
    'seguimiento': `Hola ${nombre}, ¿cómo estás?\n\nTe escribí hace unos días y quería saber si tuviste oportunidad de ver mi mensaje.\n\nQuedo disponible para cualquier consulta cuando quieras.\n\n— Pablo | @pablogranados.png`,
    'propuesta': `Hola ${nombre}! 👋\n\nComo te comenté, acá te paso el detalle de lo que podemos hacer juntos para ${negocio}.\n\n[Pegá acá el presupuesto generado desde Servicios]\n\nCualquier duda estoy disponible. ¿Arrancamos?\n\n— Pablo | @pablogranados.png`,
    'reactivar': `Hola ${nombre}, ¿cómo va todo?\n\nHace un tiempo habíamos hablado y quería retomar el contacto.\n\nTengo algunas ideas nuevas que creo que le pueden venir muy bien a ${negocio}. ¿Tenés unos minutos para charlar?\n\n— Pablo | @pablogranados.png`,
    'cierre': `Hola ${nombre}! 👋\n\nQuedamos en hablar sobre la propuesta y quería saber si pudiste revisarla.\n\nEstoy listo para arrancar cuando vos quieras. ¿Cerramos?\n\n— Pablo | @pablogranados.png`
  };

  let texto = plantillas[tipo] || plantillas['primer-contacto'];
  if (extra) texto += `\n\nNota: ${extra}`;
  if (canal === 'Instagram DM') texto = texto.replace('— Pablo | @pablogranados.png', '— Pablo');

  outputEl.textContent = texto;
  outputEl.style.display = 'block';
  document.getElementById('btn-copiar-msg').style.display = 'block';
}

function copiarMensaje() {
  const text = document.getElementById('msg-output').textContent;
  if (!text) return;
  navigator.clipboard.writeText(text);
  const btn = document.getElementById('btn-copiar-msg');
  btn.textContent = '✓ Copiado';
  setTimeout(() => { btn.textContent = 'Copiar'; }, 2000);
}

function renderMensajes() {
  const clientSelect = document.getElementById('msg-client');
  if (!clientSelect) return;
  clientSelect.innerHTML = `<option value="">Sin cliente específico</option>` +
    state.clients.map(c => `<option value="${c.id}">${c.name}${c.type ? ` · ${c.type}` : ''}</option>`).join('');
}

// ─── MÉTRICAS ─────────────────────────────────────────────
function renderMetrics(weekNum) {
  currentMetricWeek = weekNum;
  const targets = TARGETS[weekNum - 1];
  const cont = document.getElementById('metric-container');
  if (!cont) return;
  cont.innerHTML = `<div class="metrics-grid">${METRIC_FIELDS.map(f => {
    const val = state.metrics[`${weekNum}_${f.key}`] || '';
    const suffix = f.key === 'engagement' ? '%' : '';
    return `<div class="metric-card">
      <div class="metric-label">${f.label}</div>
      <div class="metric-value" id="mv_${weekNum}_${f.key}">${val ? val + suffix : '–'}</div>
      <input class="metric-input" type="number" step="0.1" placeholder="${f.placeholder}" value="${val}"
        oninput="updateMetric(${weekNum},'${f.key}',this.value)" />
      <div class="metric-target">Meta: ${targets[f.key]}${suffix}</div>
    </div>`;
  }).join('')}</div>
  <button class="btn-primary" style="margin-top:1rem" onclick="saveMetricSnapshot(${weekNum})">💾 Guardar snapshot semana ${weekNum}</button>
  <div id="snapshots-${weekNum}" style="margin-top:1rem"></div>`;
  renderSnapshots(weekNum);
}

function updateMetric(weekNum, key, value) {
  state.metrics[`${weekNum}_${key}`] = value;
  const suffix = key === 'engagement' ? '%' : '';
  const el = document.getElementById(`mv_${weekNum}_${key}`);
  if (el) el.textContent = value ? value + suffix : '–';
  scheduleSync();
}

function showMetricWeek(n, btn) {
  document.querySelectorAll('#metric-week-tabs .week-tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderMetrics(n);
}

function saveMetricSnapshot(weekNum) {
  if (!state.snapshots) state.snapshots = [];
  const snap = { id: Date.now(), week: weekNum, date: new Date().toLocaleDateString('es-AR'), data: {} };
  METRIC_FIELDS.forEach(f => { snap.data[f.key] = state.metrics[`${weekNum}_${f.key}`] || '–'; });
  state.snapshots.push(snap);
  scheduleSync();
  renderSnapshots(weekNum);
}

function deleteSnapshot(id) {
  state.snapshots = (state.snapshots || []).filter(s => s.id !== id);
  scheduleSync();
  renderSnapshots(currentMetricWeek);
}

function renderSnapshots(weekNum) {
  const cont = document.getElementById(`snapshots-${weekNum}`);
  if (!cont) return;
  const snaps = (state.snapshots || []).filter(s => s.week === weekNum);
  if (!snaps.length) return;
  cont.innerHTML = `<div class="dash-card-title" style="margin-bottom:8px">Snapshots guardados</div>` +
    snaps.map(s => `
      <div class="finance-item" style="flex-wrap:wrap;gap:8px">
        <span style="font-size:12px;color:var(--text2)">${s.date}</span>
        ${METRIC_FIELDS.map(f => `<span style="font-size:12px"><b>${f.label.split(' ')[0]}:</b> ${s.data[f.key]}</span>`).join(' · ')}
        <button class="finance-delete" onclick="deleteSnapshot(${s.id})">✕</button>
      </div>`).join('');
}

// ─── COMPARAR ─────────────────────────────────────────────
function renderCompare() {
  const cont = document.getElementById('compare-container');
  if (!cont) return;
  let hasData = false;
  let html = '';
  METRIC_FIELDS.forEach(f => {
    const suffix = f.key === 'engagement' ? '%' : '';
    html += `<div class="compare-section"><div class="compare-section-title">${f.label}</div>`;
    WEEKS.forEach((w, wi) => {
      const val = parseFloat(state.metrics[`${w.num}_${f.key}`]) || 0;
      const target = TARGETS[wi][f.key];
      const pct = target ? Math.min(100, Math.round(val / target * 100)) : 0;
      if (val > 0) hasData = true;
      html += `<div class="comparison-row">
        <span class="comparison-label">Sem ${w.num} · meta ${target}${suffix}</span>
        <div class="bar-wrap"><div class="bar-fill ${pct >= 100 ? 'over' : ''}" style="width:${pct}%"></div></div>
        <span class="bar-value">${val || '–'}${val && suffix ? suffix : ''}</span>
      </div>`;
    });
    html += `</div>`;
  });
  if (!hasData) html = `<div class="empty-state"><div class="empty-icon">▦</div>Cargá métricas primero para ver la comparativa.</div>`;
  cont.innerHTML = html;
}

// ─── DASHBOARD ────────────────────────────────────────────
function renderDashboard() {
  const todayEl = document.getElementById('today-date');
  if (todayEl) todayEl.textContent = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
  const start = new Date('2026-07-01');
  const today = new Date();
  const dayNum = Math.floor((today - start) / 86400000) + 1;
  const dayEl = document.getElementById('plan-day-counter');
  if (dayEl) dayEl.textContent = `Día ${dayNum} del plan`;
  let totalTasks = 0, doneTasks = 0;
  WEEKS.forEach(w => { const p = getWeekProgress(w.num); totalTasks += p.total; doneTasks += p.done; });
  const ingresos = state.finances.filter(f => f.type === 'ingreso').reduce((s, f) => s + f.amount, 0);
  const cerrados = state.clients.filter(c => c.stage === 'cerrado').length;
  const todayKey = new Date().toISOString().slice(0, 10);
  const habitsDone = state.habits.filter(h => state.habitChecks[`${h.id}_${todayKey}`]).length;

  const kpiGrid = document.getElementById('kpi-grid');
  if (kpiGrid) kpiGrid.innerHTML = `
    <div class="kpi-card"><div class="kpi-label">Plan completado</div><div class="kpi-value">${totalTasks ? Math.round(doneTasks / totalTasks * 100) : 0}%</div><div class="kpi-sub">${doneTasks} de ${totalTasks} tareas</div></div>
    <div class="kpi-card"><div class="kpi-label">Ingresos</div><div class="kpi-value" style="color:var(--success)">$${ingresos.toLocaleString('es-AR')}</div></div>
    <div class="kpi-card"><div class="kpi-label">Clientes cerrados</div><div class="kpi-value">${cerrados}</div><div class="kpi-sub">de ${state.clients.length} en pipeline</div></div>
    <div class="kpi-card"><div class="kpi-label">Hábitos hoy</div><div class="kpi-value">${habitsDone}/${state.habits.length || 0}</div></div>`;

  const planProg = document.getElementById('dash-plan-progress');
  if (planProg) planProg.innerHTML = WEEKS.map(w => {
    const { total, done } = getWeekProgress(w.num);
    const pct = total ? Math.round(done / total * 100) : 0;
    return `<div style="margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
        <span style="color:var(--text2)">Semana ${w.num} · ${w.title}</span><span style="font-weight:600">${pct}%</span>
      </div>
      <div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
    </div>`;
  }).join('');

  const dashHab = document.getElementById('dash-habitos');
  if (dashHab) dashHab.innerHTML = state.habits.length
    ? state.habits.map(h => {
      const done = !!state.habitChecks[`${h.id}_${todayKey}`];
      return `<div style="display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid var(--border)">
          <span>${h.icon}</span><span style="flex:1;font-size:13px">${h.name}</span><span>${done ? '✅' : '⬜'}</span></div>`;
    }).join('')
    : `<div style="font-size:13px;color:var(--text3)">Agregá hábitos desde la sección Hábitos.</div>`;

  const dashCli = document.getElementById('dash-clientes');
  if (dashCli) dashCli.innerHTML = STAGES.map(s => {
    const count = state.clients.filter(c => c.stage === s.key).length;
    return `<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border);font-size:13px">
      <span style="color:${s.color};font-size:11px;font-weight:700;min-width:130px">${s.label}</span>
      <span style="font-weight:600">${count}</span></div>`;
  }).join('');

  const dashIdeas = document.getElementById('dash-ideas');
  if (dashIdeas) {
    const recent = [...state.ideas].slice(-4).reverse();
    dashIdeas.innerHTML = recent.length
      ? recent.map(i => `<div style="padding:7px 0;border-bottom:1px solid var(--border)">
          <div style="font-size:12px;font-weight:600">${i.title}</div>
          <div style="font-size:11px;color:var(--text2);margin-top:2px">${i.format} · ${i.niche}</div>
        </div>`).join('')
      : `<div style="font-size:13px;color:var(--text3)">Sin ideas guardadas.</div>`;
  }

  // Alertas de seguimiento
  const hoy = new Date().toISOString().slice(0, 10);
  const vencidos = state.clients.filter(c => c.followDate && c.followDate <= hoy && c.stage !== 'cerrado');
  if (vencidos.length) {
    const alertEl = document.getElementById('dash-alerts');
    if (alertEl) alertEl.innerHTML = vencidos.map(c => `
      <div class="alert-item">
        📅 <b>${c.name}</b> — seguimiento ${c.followDate === hoy ? 'hoy' : 'vencido el ' + c.followDate}
        <span onclick="openCRM(${c.id})" style="color:var(--teal);cursor:pointer;margin-left:8px">Ver CRM →</span>
      </div>`).join('');
  }
}

// ─── CRM ──────────────────────────────────────────────────
function openCRM(clientId) {
  const c = state.clients.find(c => c.id === clientId);
  if (!c) return;
  if (!c.history) c.history = [];
  document.getElementById('crm-client-name').textContent = c.name;
  document.getElementById('crm-client-id').value = clientId;
  document.getElementById('crm-next-step').value = c.nextStep || '';
  document.getElementById('crm-follow-date').value = c.followDate || '';
  document.getElementById('crm-history').innerHTML = c.history.length
    ? [...c.history].reverse().map(h => `
        <div class="crm-history-item">
          <span class="crm-history-date">${h.date}</span>
          <span class="crm-history-text">${h.text}</span>
          <button onclick="deleteCRMEntry(${clientId},${h.id})">✕</button>
        </div>`).join('')
    : `<div style="font-size:13px;color:var(--text3)">Sin historial todavía.</div>`;
  openModal('modal-crm');
}

function saveCRMNextStep() {
  const id = Number(document.getElementById('crm-client-id').value);
  const idx = state.clients.findIndex(c => c.id === id);
  if (idx === -1) return;
  state.clients[idx].nextStep = document.getElementById('crm-next-step').value.trim();
  state.clients[idx].followDate = document.getElementById('crm-follow-date').value;
  scheduleSync();
  renderClientes();
  closeModal('modal-crm');
}

function addCRMEntry() {
  const id = Number(document.getElementById('crm-client-id').value);
  const text = document.getElementById('crm-new-entry').value.trim();
  if (!text) return;
  const idx = state.clients.findIndex(c => c.id === id);
  if (idx === -1) return;
  if (!state.clients[idx].history) state.clients[idx].history = [];
  state.clients[idx].history.push({ id: Date.now(), date: new Date().toLocaleDateString('es-AR'), text });
  document.getElementById('crm-new-entry').value = '';
  scheduleSync();
  openCRM(id);
}

function deleteCRMEntry(clientId, entryId) {
  const idx = state.clients.findIndex(c => c.id === clientId);
  if (idx === -1) return;
  state.clients[idx].history = (state.clients[idx].history || []).filter(h => h.id !== entryId);
  scheduleSync();
  openCRM(clientId);
}

// ─── MULTI-MES ────────────────────────────────────────────
let currentMonth = 0; // 0 = mes original del plan

function renderMonthTabs() {
  const cont = document.getElementById('month-tabs');
  if (!cont) return;
  const months = state.months || [];
  let html = `<button class="week-tab ${currentMonth === 0 ? 'active' : ''}" onclick="switchMonth(0,this)">Mes 1</button>`;
  months.forEach((m, i) => {
    html += `<button class="week-tab ${currentMonth === i + 1 ? 'active' : ''}" onclick="switchMonth(${i + 1},this)">${m.name}</button>`;
  });
  cont.innerHTML = html;
}

function switchMonth(idx, btn) {
  currentMonth = idx;
  document.querySelectorAll('#month-tabs .week-tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  if (idx === 0) {
    currentWeek = 1;
    renderWeek(1);
    document.getElementById('week-tabs').style.display = 'flex';
  } else {
    document.getElementById('week-tabs').style.display = 'none';
    renderCustomMonth(idx - 1);
  }
}

function renderCustomMonth(monthIdx) {
  const month = (state.months || [])[monthIdx];
  if (!month) return;
  const cont = document.getElementById('week-container');
  if (!cont) return;

  let html = `<div class="week-header">
    <span class="week-badge">${month.name}</span>
    <div><div class="week-title">${month.name}</div><div class="week-goal">${month.tasks.filter(t => state.tasks['m' + monthIdx + '_' + t.id]).length} de ${month.tasks.length} tareas completadas</div></div>
  </div>`;

  const pct = month.tasks.length ? Math.round(month.tasks.filter(t => state.tasks['m' + monthIdx + '_' + t.id]).length / month.tasks.length * 100) : 0;
  html += `<div class="week-mini-progress"><div class="week-mini-fill" style="width:${pct}%"></div></div>`;

  html += `<div class="day-card"><div class="day-label">Tareas del mes</div>`;
  month.tasks.forEach(t => {
    const key = 'm' + monthIdx + '_' + t.id;
    const isDone = !!state.tasks[key];
    html += `<div class="task" onclick="toggleCustomTask('${key}')">
      <div class="task-check ${isDone ? 'done' : ''}"></div>
      <span class="task-text ${isDone ? 'done' : ''}">${t.text}</span>
      <span class="task-tag tag-${t.tag || 'interaccion'}">${t.tag || 'tarea'}</span>
    </div>`;
  });
  html += `</div>`;
  cont.innerHTML = html;
}

function toggleCustomTask(key) {
  state.tasks[key] = !state.tasks[key];
  scheduleSync();
  const monthIdx = currentMonth - 1;
  renderCustomMonth(monthIdx);
}

function createNewMonth() {
  const name = document.getElementById('new-month-name').value.trim();
  const type = document.getElementById('new-month-type').value;
  if (!name) return;

  if (!state.months) state.months = [];

  let tasks = [];
  if (type === 'template') {
    // Recicla estructura del Mes 1 con tareas vacías para completar
    WEEKS.forEach(w => {
      w.days.forEach(d => {
        d.tasks.forEach(t => {
          tasks.push({ id: Date.now() + Math.random(), text: t.text, tag: t.tag });
        });
      });
    });
  } else {
    // Mes en blanco con 5 tareas vacías de ejemplo
    tasks = [
      { id: Date.now() + 1, text: 'Tarea 1 del mes', tag: 'interaccion' },
      { id: Date.now() + 2, text: 'Tarea 2 del mes', tag: 'reel' },
      { id: Date.now() + 3, text: 'Tarea 3 del mes', tag: 'carrusel' },
      { id: Date.now() + 4, text: 'Tarea 4 del mes', tag: 'historia' },
      { id: Date.now() + 5, text: 'Tarea 5 del mes', tag: 'interaccion' },
    ];
  }

  state.months.push({ id: Date.now(), name, tasks });
  scheduleSync();
  closeModal('modal-new-month');
  document.getElementById('new-month-name').value = '';
  renderMonthTabs();
  switchMonth(state.months.length, null);
}

// ─── TESTIMONIOS ──────────────────────────────────────────
function addTestimonio() {
  const name = document.getElementById('test-name').value.trim();
  const business = document.getElementById('test-business').value.trim();
  const quote = document.getElementById('test-quote').value.trim();
  if (!name || !quote) return;
  if (!state.testimonios) state.testimonios = [];
  state.testimonios.push({ id: Date.now(), name, business, quote });
  ['test-name', 'test-business', 'test-quote'].forEach(id => document.getElementById(id).value = '');
  scheduleSync();
  closeModal('modal-add-testimonio');
  renderTestimonios();
}

function deleteTestimonio(id) {
  state.testimonios = (state.testimonios || []).filter(t => t.id !== id);
  scheduleSync();
  renderTestimonios();
}

function renderTestimonios() {
  const cont = document.getElementById('testimonios-container');
  if (!cont) return;
  const testimonios = state.testimonios || [];
  if (!testimonios.length) {
    cont.innerHTML = `<div class="empty-state"><div class="empty-icon">💬</div>No hay testimonios todavía.<br>Cuando tengas uno, aparecerá acá y podrás mostrarlo en la landing.</div>`;
    return;
  }
  cont.innerHTML = `<div class="ideas-grid">${testimonios.map(t => `
    <div class="idea-card">
      <button class="idea-delete" onclick="deleteTestimonio(${t.id})">✕</button>
      <div style="font-size:20px;color:var(--teal);margin-bottom:8px">"</div>
      <div class="idea-title" style="font-style:italic;font-weight:400">${t.quote}</div>
      <div style="margin-top:10px;font-size:12px;font-weight:700">${t.name}</div>
      ${t.business ? `<div style="font-size:11px;color:var(--text2)">${t.business}</div>` : ''}
    </div>`).join('')}</div>`;
}

// ─── INIT ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('finance-date').value = new Date().toISOString().slice(0, 10);
  animateLanding();
  setTimeout(animateCounters, 400);

  sb.auth.onAuthStateChange((event, session) => {
    const loginScreen = document.getElementById('login-screen');
    const appRoot = document.getElementById('app-root');
    if (session) {
      loginScreen.style.display = 'none';
      appRoot.style.display = 'flex';
      loadFromStorage();
      renderDashboard();
      renderMonthTabs();
      loadFromSupabase();
    } else {
      loginScreen.style.display = '';
      appRoot.style.display = 'none';
    }
  });
});