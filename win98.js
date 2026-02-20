// main.js - Windows 98 OS Logic

let zIndexCounter = 100;

function attemptLogin() {
    const user = document.getElementById('username')?.value;
    const pass = document.getElementById('password')?.value;

    if (user === 'user' && pass === 'passwd') {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('desktop-env').classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        // Auto-open Profile window on login
        setTimeout(() => openWindow('home'), 200);

        // Fetch Projects
        setTimeout(() => fetchGitHubProjects(), 500);
    } else {
        showError('Invalid username or password. (Hint: user / passwd)');
    }
}

// Check for enter key on password input
document.addEventListener('DOMContentLoaded', () => {
    const passInput = document.getElementById('password');
    if (passInput) {
        passInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                attemptLogin();
            }
        });
    }

    // Make windows draggable
    document.querySelectorAll('.os-window').forEach(win => {
        makeDraggable(win);
        // Ensure they can be brought to front by clicking anywhere inside
        win.addEventListener('mousedown', () => bringToFront(win.id));
    });

    updateClock();
});

function showError(msg) {
    document.getElementById('error-msg').innerText = msg;
    const modal = document.getElementById('error-modal');
    modal.style.display = 'flex';
    modal.style.zIndex = ++zIndexCounter;
}

function closeError() {
    document.getElementById('error-modal').style.display = 'none';
}

function openWindow(id) {
    const win = document.getElementById(id);
    if (!win) return;

    // Show window if hidden
    win.style.display = 'block';
    bringToFront(id);

    // Toggle taskbar active state
    updateTaskbar(id);
}

function closeWindow(id) {
    const win = document.getElementById(id);
    if (win) {
        win.style.display = 'none';
    }
    const btn = document.querySelector(`.taskbar-button[data-window="${id}"]`);
    if (btn) btn.classList.remove('active');
}

function bringToFront(id) {
    const win = document.getElementById(id);
    if (win) {
        zIndexCounter++;
        win.style.zIndex = zIndexCounter;
    }
    updateTaskbar(id);
}

function updateTaskbar(activeId) {
    document.querySelectorAll('.taskbar-button').forEach(btn => {
        if (btn.dataset.window === activeId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Handle Start Menu close
    document.getElementById('start-menu')?.classList.add('hidden');
}

function toggleStartMenu() {
    const menu = document.getElementById('start-menu');
    if (menu.classList.contains('hidden')) {
        menu.classList.remove('hidden');
        menu.style.zIndex = ++zIndexCounter;
    } else {
        menu.classList.add('hidden');
    }
}

// Close start menu when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('#start-menu') && !e.target.closest('.start-button')) {
        document.getElementById('start-menu')?.classList.add('hidden');
    }
});

function updateClock() {
    const now = new Date();

    // Modern Clock logic
    const modernClock = document.getElementById('modern-clock');
    if (modernClock) {
        let h = now.getHours().toString().padStart(2, '0');
        let m = now.getMinutes().toString().padStart(2, '0');
        let s = now.getSeconds().toString().padStart(2, '0');
        modernClock.innerText = `${h}:${m}:${s}`;
    }

    // Windows 98 Clock Logic
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    const clockIcon = document.getElementById('win98-clock');
    if (clockIcon) {
        clockIcon.innerText = hours + ':' + minutes + ' ' + ampm;
    }
}
setInterval(updateClock, 1000);

// Draggable functionality
function makeDraggable(element) {
    const titleBar = element.querySelector('.title-bar');
    if (!titleBar) return;

    let isDragging = false;
    let offsetX = 0, offsetY = 0;

    titleBar.addEventListener('mousedown', (e) => {
        if (e.target.tagName.toLowerCase() === 'button') return;
        isDragging = true;

        if (!element.classList.contains('dragged')) {
            element.classList.add('dragged');
            const rect = element.getBoundingClientRect();
            element.style.transform = 'none';
            element.style.left = rect.left + 'px';
            element.style.top = rect.top + 'px';
        }

        offsetX = e.clientX - parseFloat(element.style.left || 0);
        offsetY = e.clientY - parseFloat(element.style.top || 0);
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        let x = e.clientX - offsetX;
        let y = e.clientY - offsetY;

        // Prevent dragging above top screen
        if (y < 0) y = 0;

        element.style.left = x + 'px';
        element.style.top = y + 'px';
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
}

// Fetch GitHub Projects
async function fetchGitHubProjects() {
    const container = document.getElementById('github-projects-container');
    if (!container) return;

    try {
        const response = await fetch('https://api.github.com/users/Hackb07/repos?sort=updated&per_page=20');
        if (!response.ok) throw new Error('API Error');

        const repos = await response.json();

        // Remove loading
        container.innerHTML = '';
        container.classList.remove('content-start', 'flex-col', 'items-center', 'justify-center');

        repos.forEach(repo => {
            const anchor = document.createElement('a');
            anchor.href = repo.html_url;
            anchor.target = '_blank';
            anchor.className = 'flex flex-col items-center group cursor-pointer p-2 hover:bg-blue-100 outline-none focus:bg-blue-800 focus:text-white transition-colors h-32';

            // Format name securely (truncate if needed)
            const displayName = repo.name.length > 20 ? repo.name.substring(0, 18) + '...' : repo.name;
            const langText = repo.language ? `(${repo.language})` : '';

            anchor.innerHTML = `
                <img src="https://win98icons.alexmeub.com/icons/png/directory_open_file_mydocs-4.png" class="w-10 h-10 mb-2">
                <span class="text-xs text-center group-focus:text-white break-words w-full px-1">
                    ${displayName}<br><span class="opacity-80">${langText}</span>
                </span>
            `;
            container.appendChild(anchor);
        });

    } catch (e) {
        container.innerHTML = `
            <div class="col-span-full text-center text-red-600 py-10 flex flex-col items-center justify-center gap-2">
                <img src="https://win98icons.alexmeub.com/icons/png/msg_error-0.png" class="w-8 h-8">
                C:\\Error: Failed to connect to GitHub.
            </div>
        `;
    }

    // Time Travel Glitch Animation
    let yearInterval;
    function startGlitchAnimation() {
        // Hide button and show warning
        document.getElementById('time-travel-btn').style.display = 'none';
        const glitchText = document.getElementById('glitch-text');
        glitchText.style.opacity = '1';
        glitchText.classList.add('animate-pulse');

        // Start Glitch CSS
        const introScreen = document.getElementById('intro-screen');
        introScreen.classList.add('time-travel-glitch');

        // Countdown the year
        const yearSpan = document.querySelector('#modern-year span');
        let currentYear = 2026;

        yearInterval = setInterval(() => {
            currentYear -= 1;
            yearSpan.innerText = currentYear;

            // As year goes down, text color gets more distorted
            if (currentYear < 2010) yearSpan.style.color = 'red';
            if (currentYear < 2000) yearSpan.style.color = '#39ff14';

            if (currentYear <= 1998) {
                clearInterval(yearInterval);
                finishTimeTravel();
            }
        }, 80); // Speed of year countdown
    }

    function finishTimeTravel() {
        const introScreen = document.getElementById('intro-screen');
        // Stop random glitch, start zoom effect
        introScreen.classList.remove('time-travel-glitch');
        introScreen.classList.add('time-travel-zoom');

        // Remove intro screen entirely after zoom finishes
        setTimeout(() => {
            introScreen.style.display = 'none';
        }, 900);
    }
}
