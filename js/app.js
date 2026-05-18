let users = JSON.parse(localStorage.getItem('tp_users') || '[]');
let tasks = JSON.parse(localStorage.getItem('tp_tasks') || '[]');
let session = JSON.parse(localStorage.getItem('tp_session') || 'null');
let currentFilter = 'todas';
let taskIdCounter = parseInt(localStorage.getItem('tp_counter') || '1');

function save() {
    localStorage.setItem('tp_users', JSON.stringify(users));
    localStorage.setItem('tp_tasks', JSON.stringify(tasks));
    localStorage.setItem('tp_session', JSON.stringify(session));
    localStorage.setItem('tp_counter', String(taskIdCounter));
}

function today() {
    return new Date()
        .toISOString()
        .slice(0, 10);
}
function isOverdue(t) {
    return !t.done && t.date && t.date < today();
}

function showView(id) {
    document
        .querySelectorAll('.view')
        .forEach(v => v.classList.remove('active'));
    document
        .getElementById(id)
        .classList
        .add('active');
}

function init() {
    if (session) {
        showView('app-view');
        loadUser();
        renderTasks();
        openAddPanel();
    } else 
        showView('auth-view');
    }

function switchTab(tab) {
    document
        .querySelectorAll('.auth-tab')
        .forEach(
            (t, i) => t.classList.toggle('active', (i === 0 && tab === 'login') || (i === 1 && tab === 'register'))
        );
    document
        .getElementById('login-form')
        .style
        .display = tab === 'login'
            ? ''
            : 'none';
    document
        .getElementById('register-form')
        .style
        .display = tab === 'register'
            ? ''
            : 'none';
    hideError();
}

function showError(msg) {
    const el = document.getElementById('auth-error');
    el.textContent = msg;
    el
        .classList
        .add('show');
}
function hideError() {
    document
        .getElementById('auth-error')
        .classList
        .remove('show');
}

function doLogin() {
    const email = document
        .getElementById('login-email')
        .value
        .trim();
    const pass = document
        .getElementById('login-pass')
        .value;
    if (!email || !pass) 
        return showError('Rellena todos los campos.');
    let user = users.find(u => u.email === email && u.password === pass);
    if (!user) {
        user = {
            id: Date.now(),
            name: email.split('@')[0],
            email,
            password: pass
        };
        users.push(user);
    }
    session = {
        userId: user.id,
        name: user.name,
        email: user.email
    };
    save();
    showView('app-view');
    loadUser();
    renderTasks();
    openAddPanel();
    toast('Bienvenido, ' + user.name + ' 👋');
}

function doRegister() {
    const name = document
        .getElementById('reg-name')
        .value
        .trim();
    const email = document
        .getElementById('reg-email')
        .value
        .trim();
    const pass = document
        .getElementById('reg-pass')
        .value;
    if (!name || !email || !pass) 
        return showError('Rellena todos los campos.');
    if (pass.length < 6) 
        return showError('La contraseña debe tener al menos 6 caracteres.');
    if (users.find(u => u.email === email)) 
        return showError('Ya existe una cuenta con ese email.');
    const user = {
        id: Date.now(),
        name,
        email,
        password: pass
    };
    users.push(user);
    session = {
        userId: user.id,
        name,
        email
    };
    save();
    showView('app-view');
    loadUser();
    renderTasks();
    openAddPanel();
    toast('Cuenta creada. ¡Bienvenido!');
}

function doLogout() {
    session = null;
    save();
    showView('auth-view');
    hideError();
}

function loadUser() {
    document
        .getElementById('user-avatar')
        .textContent = session
        .name
        .slice(0, 2)
        .toUpperCase();
    document
        .getElementById('user-display')
        .textContent = session.name;
}

function myTasks() {
    return tasks.filter(t => t.userId === session.userId);
}

function addTask() {
    const title = document
        .getElementById('new-title')
        .value
        .trim();
    if (!title) 
        return toast('El título es obligatorio.', true);
    tasks.push({
        id: taskIdCounter++,
        userId: session.userId,
        title,
        desc: document
            .getElementById('new-desc')
            .value
            .trim(),
        priority: document
            .getElementById('new-priority')
            .value,
        category: document
            .getElementById('new-cat')
            .value,
        date: document
            .getElementById('new-date')
            .value,
        done: false,
        createdAt: new Date().toISOString()
    });
    save();
    renderTasks();
    document
        .getElementById('new-title')
        .value = '';
    document
        .getElementById('new-desc')
        .value = '';
    document
        .getElementById('new-date')
        .value = '';
    document
        .getElementById('new-priority')
        .value = 'media';
    document
        .getElementById('new-cat')
        .value = 'personal';
    document
        .getElementById('new-title')
        .focus();
    toast('Tarea añadida ✓');
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    save();
    renderTasks();
    toast('Tarea eliminada');
}

function toggleDone(id) {
    const t = tasks.find(t => t.id === id);
    if (t) {
        t.done = !t.done;
        save();
        renderTasks();
    }
}

function openEdit(id) {
    const t = tasks.find(t => t.id === id);
    if (!t) 
        return;
    document
        .getElementById('edit-id')
        .value = id;
    document
        .getElementById('edit-title')
        .value = t.title;
    document
        .getElementById('edit-desc')
        .value = t.desc;
    document
        .getElementById('edit-priority')
        .value = t.priority;
    document
        .getElementById('edit-cat')
        .value = t.category || 'personal';
    document
        .getElementById('edit-date')
        .value = t.date;
    document
        .getElementById('edit-modal')
        .classList
        .add('open');
}

function closeModal() {
    document
        .getElementById('edit-modal')
        .classList
        .remove('open');
}

function saveEdit() {
    const id = parseInt(document.getElementById('edit-id').value);
    const t = tasks.find(t => t.id === id);
    const title = document
        .getElementById('edit-title')
        .value
        .trim();
    if (!t || !title) 
        return toast('El título es obligatorio.', true);
    t.title = title;
    t.desc = document
        .getElementById('edit-desc')
        .value
        .trim();
    t.priority = document
        .getElementById('edit-priority')
        .value;
    t.category = document
        .getElementById('edit-cat')
        .value;
    t.date = document
        .getElementById('edit-date')
        .value;
    save();
    closeModal();
    renderTasks();
    toast('Tarea actualizada ✓');
}

function setFilter(f, el) {
    currentFilter = f;
    document
        .querySelectorAll('.pill')
        .forEach(p => p.classList.remove('active'));
    el
        .classList
        .add('active');
    renderTasks();
}

const CAT_LABELS = {
    personal: 'Personal',
    trabajo: 'Trabajo',
    estudio: 'Estudio',
    otro: 'Otro'
};
const CAT_COLORS = {
    personal: 'var(--blue)',
    trabajo: 'var(--warn)',
    estudio: 'var(--accent)',
    otro: 'var(--text-dim)'
};

function renderTasks() {
    let list = myTasks();
    const total = list.length;
    const done = list
        .filter(t => t.done)
        .length;
    const pending = total - done;
    const pct = total === 0
        ? 0
        : Math.round((done / total) * 100);

    document
        .getElementById('stat-total')
        .textContent = total;
    document
        .getElementById('stat-pending')
        .textContent = pending;
    document
        .getElementById('stat-done')
        .textContent = done;

    const bar = document.getElementById('progress-bar');
    document
        .getElementById('progress-pct')
        .textContent = pct + '%';
    bar.style.width = pct + '%';
    bar.style.background = pct === 100
        ? 'var(--accent)'
        : pct > 60
            ? 'var(--blue)'
            : pct > 30
                ? 'var(--warn)'
                : 'var(--danger)';

    if (currentFilter === 'pendiente') 
        list = list.filter(t => !t.done);
    if (currentFilter === 'completada') 
        list = list.filter(t => t.done);
    if (currentFilter === 'vencida') 
        list = list.filter(t => isOverdue(t));
    
    const q = document
        .getElementById('search-input')
        .value
        .trim()
        .toLowerCase();
    if (q) 
        list = list.filter(
            t => t.title.toLowerCase().includes(q) || (t.desc && t.desc.toLowerCase().includes(q))
        );
    
    const cat = document
        .getElementById('filter-cat')
        .value;
    if (cat) 
        list = list.filter(t => t.category === cat);
    
    const prio = {
        alta: 0,
        media: 1,
        baja: 2
    };
    list.sort((a, b) => {
        if (a.done !== b.done) 
            return a.done
                ? 1
                : -1;
        if (isOverdue(a) !== isOverdue(b)) 
            return isOverdue(a)
                ? -1
                : 1;
        return (prio[a.priority] || 1) - (prio[b.priority] || 1);
    });

    const container = document.getElementById('task-list');
    const empty = document.getElementById('empty-state');

    if (list.length === 0) {
        container.innerHTML = '';
        empty.style.display = '';
    } else {
        empty.style.display = 'none';
        container.innerHTML = list
            .map(t => {
                const ov = isOverdue(t);
                const cc = CAT_COLORS[t.category] || 'var(--text-dim)';
                const cl = CAT_LABELS[t.category] || t.category;
                return `
                        <div class="task-card ${t.done
                    ? 'done'
                    : ''} ${ov
                        ? 'overdue'
                        : ''}" id="tc-${t.id}">
                            <button class="task-check" onclick="toggleDone(${t.id})">
                                <span class="task-check-icon">✓</span>
                            </button>
                            <div class="task-body">
                                <div class="task-title">${escHtml(
                            t.title
                        )}</div>
                                <div class="task-meta">
                                    <span class="badge badge-${t.priority}">${t.priority}</span>
                                    <span class="badge-cat" style="color:${cc};border-color:${cc}">${cl}</span>
                                    ${t.date
                            ? `<span class="task-date ${ov
                                ? 'date-overdue'
                                : ''}">${ov
                                    ? '⚠ '
                                    : ''}${formatDate(t.date)}</span>`
                            : ''}
                                </div>
                                ${t.desc
                                ? `<div class="task-desc">${escHtml(t.desc)}</div>`
                                : ''}
                            </div>
                            <div class="task-actions">
                                <button class="btn btn-edit" onclick="openEdit(${t.id})">✎ Editar</button>
                                <button class="btn btn-danger" onclick="deleteTask(${t.id})">✕</button>
                            </div>
                        </div>`;
            })
            .join('');
    }
}

function openAddPanel() {
    const p = document.getElementById('add-panel');
    p
        .classList
        .add('open');
    document
        .getElementById('add-btn-label')
        .textContent = '✕ Cerrar';
    document
        .getElementById('new-title')
        .focus();
}

function toggleAddPanel() {
    const p = document.getElementById('add-panel');
    const open = p
        .classList
        .toggle('open');
    document
        .getElementById('add-btn-label')
        .textContent = open
            ? '✕ Cerrar'
            : '+ Nueva tarea';
    if (open) 
        document
            .getElementById('new-title')
            .focus();
    }

function toast(msg, isError = false) {
    const c = document.getElementById('toast-container');
    const t = document.createElement('div');
    t.className = 'toast' + (
        isError
            ? ' error'
            : ''
    );
    t.textContent = msg;
    c.appendChild(t);
    setTimeout(() => {
        t.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => t.remove(), 300);
    }, 2800);
}

function escHtml(s) {
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function formatDate(s) {
    if (!s) 
        return '';
    const [y, m, d] = s.split('-');
    return `${d}/${m}/${y}`;
}

document
    .getElementById('edit-modal')
    .addEventListener('click', function (e) {
        if (e.target === this) {
            closeModal();
        }
    });
document.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        const lf = document.getElementById('login-form');
        if (lf.style.display !== 'none' && document.getElementById('auth-view').classList.contains('active')) 
            doLogin();
        }
    });

// ════════ APP TAB SWITCHING ════════
function switchAppTab(tab) {
    const main = document.querySelector('.app-main');
    const focus = document.getElementById('focus-panel');
    document
        .querySelectorAll('.nav-tab')
        .forEach(t => t.classList.remove('active'));
    document
        .getElementById('tab-' + tab)
        .classList
        .add('active');
    if (tab === 'tasks') {
        main.style.display = '';
        focus.style.display = 'none';
    } else {
        main.style.display = 'none';
        focus.style.display = 'flex';
    }
}

// ════════ POMODORO ════════
const MODES = {
    work: {
        label: 'Modo trabajo',
        mins: 25,
        color: 'var(--accent)'
    },
    short: {
        label: 'Descanso corto',
        mins: 5,
        color: 'var(--blue)'
    },
    long: {
        label: 'Descanso largo',
        mins: 15,
        color: 'var(--warn)'
    }
};
let currentMode = 'work';
let pomoDuration = 25 * 60;
let pomoRemaining = 25 * 60;
let pomoRunning = false;
let pomoInterval = null;
let pomoSessions = 0;
const CIRCUM = 2 * Math.PI * 88; // r=88

function setMode(mode) {
    currentMode = mode;
    document
        .querySelectorAll('.pomo-mode')
        .forEach(b => b.classList.remove('active'));
    document
        .getElementById('mode-' + mode)
        .classList
        .add('active');
    const m = MODES[mode];
    pomoDuration = m.mins * 60;
    pomoRemaining = pomoDuration;
    clearInterval(pomoInterval);
    pomoRunning = false;
    document
        .getElementById('pomo-play')
        .textContent = '▶';
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const m = MODES[currentMode];
    const mins = Math
        .floor(pomoRemaining / 60)
        .toString()
        .padStart(2, '0');
    const secs = (pomoRemaining % 60)
        .toString()
        .padStart(2, '0');
    document
        .getElementById('pomo-time')
        .textContent = `${mins}:${secs}`;
    document
        .getElementById('pomo-label')
        .textContent = m.label;
    const frac = pomoRemaining / pomoDuration;
    const offset = CIRCUM * (1 - frac);
    const ring = document.getElementById('ring-progress');
    ring.style.strokeDashoffset = offset;
    ring.style.stroke = m.color;
}

function toggleTimer() {
    if (pomoRunning) {
        clearInterval(pomoInterval);
        pomoRunning = false;
        document
            .getElementById('pomo-play')
            .textContent = '▶';
    } else {
        pomoRunning = true;
        document
            .getElementById('pomo-play')
            .textContent = '⏸';
        pomoInterval = setInterval(() => {
            if (pomoRemaining <= 0) {
                clearInterval(pomoInterval);
                pomoRunning = false;
                document
                    .getElementById('pomo-play')
                    .textContent = '▶';
                if (currentMode === 'work') {
                    pomoSessions = Math.min(pomoSessions + 1, 4);
                    updateDots();
                    toast('¡Sesión completada! Tómate un descanso 🎉');
                    showFocusTip('break');
                    if (pomoSessions >= 4) {
                        pomoSessions = 0;
                        updateDots();
                    }
                } else {
                    toast('¡Descanso terminado! Vuelve al trabajo 💪');
                    showFocusTip('work');
                }
            } else {
                pomoRemaining--;
                updateTimerDisplay();
            }
        }, 1000);
    }
}

function resetTimer() {
    clearInterval(pomoInterval);
    pomoRunning = false;
    pomoRemaining = pomoDuration;
    document
        .getElementById('pomo-play')
        .textContent = '▶';
    updateTimerDisplay();
}

function skipTimer() {
    clearInterval(pomoInterval);
    pomoRunning = false;
    pomoRemaining = 0;
    document
        .getElementById('pomo-play')
        .textContent = '▶';
    updateTimerDisplay();
}

function updateDots() {
    document
        .querySelectorAll('.pomo-dot')
        .forEach((d, i) => {
            d
                .classList
                .toggle('filled', i < pomoSessions);
        });
}

// ════════ MUSIC PLAYER ════════
var PLAYLISTS = {
    'youtube-lofi':      'https://www.youtube.com/embed/jfKfPfyJRdk',
    'youtube-lofi2':     'https://www.youtube.com/embed/5qap5aO4i9A',
    'youtube-classical': 'https://www.youtube.com/embed/mPZkdNFkNps',
    'youtube-nature':    'https://www.youtube.com/embed/eKFTSSKCzWA',
    'youtube-focus':     'https://www.youtube.com/embed/WPni755-Krg',
    'youtube-ambient':   'https://www.youtube.com/embed/DWcJFNfaw9c',
};

function loadPlaylist(key, el) {
    document
        .querySelectorAll('.playlist-item')
        .forEach(p => p.classList.remove('active'));
    el
        .classList
        .add('active');
    const iframe = document.getElementById('music-player');
    iframe.src = PLAYLISTS[key];
    iframe.height = key.startsWith('youtube')
        ? '200'
        : '152';
}

function loadCustomUrl() {
    const raw = document
        .getElementById('custom-url')
        .value
        .trim();
    if (!raw) 
        return toast('Pega una URL primero.', true);
    let embedUrl = raw;
    if (raw.includes('spotify.com') && !raw.includes('/embed/')) {
        embedUrl = raw
            .replace('open.spotify.com/', 'open.spotify.com/embed/')
            .split('?')[0] + '?utm_source=generator';
    }
    if (raw.includes('youtube.com/watch')) {
        try {
            const vid = new URL(raw)
                .searchParams
                .get('v');
            if (vid) 
                embedUrl = 'https://www.youtube.com/embed/' + vid;
            }
        catch (e) {}
    }
    if (raw.includes('youtu.be/')) {
        const vid = raw
            .split('youtu.be/')[1]
            .split('?')[0];
        embedUrl = 'https://www.youtube.com/embed/' + vid;
    }
    document
        .querySelectorAll('.playlist-item')
        .forEach(p => p.classList.remove('active'));
    const iframe = document.getElementById('music-player');
    iframe.src = embedUrl;
    iframe.height = embedUrl.includes('youtube')
        ? '200'
        : '152';
    document
        .getElementById('custom-url')
        .value = '';
    toast('Playlist cargada ✓');
}

// ════════ FOCUS TIPS ════════
const TIPS = {
    work: [
        'Silencia el teléfono y cierra redes sociales. El foco profundo empieza con cer' +
                'o interrupciones.',
        'Trabaja en UNA sola tarea. La multitarea reduce la productividad hasta un 40%.',
        'Si algo te distrae, escríbelo y vuelve a tu tarea. Vacía la mente sin perder e' +
                'l hilo.',
        'Bebe agua antes de empezar. La hidratación mejora la concentración notablement' +
                'e.'
    ],
    break: [
        'Levántate, estira el cuerpo y mira un punto lejano. Tu cerebro lo agradecerá.', 'Respira profundo 4 veces. Inhala 4s, sostén 4s, exhala 4s. Resetea tu mente.', 'Aléjate de la pantalla y da un pequeño paseo. El movimiento reactiva el cerebr' +
                'o.',
        '¡Buen trabajo! Aprovecha para hidratarte y prepararte para la siguiente sesión' +
                '.'
    ]
};

function showFocusTip(type) {
    const arr = TIPS[type] || TIPS.work;
    const tip = arr[Math.floor(Math.random() * arr.length)];
    document
        .getElementById('focus-tip')
        .textContent = tip;
}

buildTrackList();
updateTimerDisplay();
init();