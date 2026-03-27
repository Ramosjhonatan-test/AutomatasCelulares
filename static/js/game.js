/**
 * ============================================================================
 *  Juego de la Vida de Conway — Controlador JavaScript
 *  Materia: MSS-953 Modelado y Simulación de Sistemas
 *  Práctica 2: Modelado con autómatas celulares
 * ============================================================================
 */

class GameController {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.container = document.getElementById('canvas-container');

        this.grid = [];
        this.rows = 50;
        this.cols = 50;
        this.generation = 0;
        this.isRunning = false;
        this.intervalId = null;
        this.speed = 200;
        this.startGeneration = 0;
        this.mode = 'conway';
        this.clientId = Math.random().toString(36).substring(2, 15);

        this.colorSchemes = {
            conway: { 0: '#151b2e', 1: '#00d4aa', grid: '#1e2740', glow: 'rgba(0, 212, 170, 0.3)', names: { 0: 'Muerta', 1: 'Viva' } },
            forest_fire: { 0: '#0a0a0a', 1: '#22c55e', 2: '#ef4444', grid: '#1a1a1a', glow: 'rgba(239, 68, 68, 0.3)', names: { 0: 'Ceniza', 1: 'Árbol', 2: 'Fuego' } },
            epidemic: { 0: '#0f172a', 1: '#3b82f6', 2: '#ef4444', 3: '#64748b', grid: '#1e293b', glow: 'rgba(239, 68, 68, 0.3)', names: { 0: 'Vacío', 1: 'Sano', 2: 'Enfermo', 3: 'Recuperado' } },
            predator_prey: { 0: '#0f172a', 1: '#facc15', 2: '#d946ef', grid: '#1e293b', glow: 'rgba(217, 70, 239, 0.2)', names: { 0: 'Vacío', 1: 'Presa', 2: 'Predador' } },
            urban: { 0: '#1e293b', 1: '#f97316', 2: '#475569', grid: '#0f172a', glow: 'rgba(249, 115, 22, 0.2)', names: { 0: 'Vacío', 1: 'Urbano', 2: 'Zona Restringida' } },
            traffic: { 0: '#334155', 1: '#38bdf8', 2: '#020617', grid: '#1e293b', glow: 'rgba(56, 189, 248, 0.2)', names: { 0: 'Calle', 1: 'Auto', 2: 'Bloqueo' } }
        };

        this._bindEvents();
        this._loadState();
        this._updateLegend();
    }

    _showToast(title, message, icon = 'info', duration = 4000) {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<i data-lucide="${icon}" class="toast-icon"></i><div class="toast-body"><div class="toast-title">${title}</div><div class="toast-message">${message}</div></div><button class="toast-close"><i data-lucide="x" style="width:14px;height:14px;"></i></button>`;
        container.appendChild(toast);
        toast.querySelector('.toast-close').onclick = () => { toast.classList.add('toast-exit'); setTimeout(() => toast.remove(), 300); };
        if (window.lucide) lucide.createIcons({ nodes: [toast] });
        setTimeout(() => { if (toast.parentElement) { toast.classList.add('toast-exit'); setTimeout(() => toast.remove(), 300); } }, duration);
    }

    async _loadState() {
        try {
            const response = await fetch(`/api/state?client_id=${this.clientId}`);
            const data = await response.json();
            this._updateFromData(data);
        } catch (error) { console.error('Error al cargar estado:', error); }
    }

    async _stepOnce() {
        try {
            const preAlive = this.currentAlive;
            const preEnfermos = this.currentEnfermos;

            const response = await fetch('/api/step', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ client_id: this.clientId })
            });
            const data = await response.json();
            this._updateFromData(data);
            
            // Verificar límite de iteraciones definido por el usuario
            const target = parseInt(document.getElementById('input-iterations')?.value) || 0;
            if (this.isRunning && target > 0 && data.generation >= target) {
                this.pause();
                this._showFinalReport(data);
                return;
            }

            if (this.isRunning && data.alive === 0 && preAlive > 0 && this.mode === 'conway') {
                this.pause();
                this._showToast('Simulación finalizada', 'Todas las células murieron.', 'alert-circle');
            } else if (this.isRunning && data.enfermos === 0 && preEnfermos > 0 && this.mode === 'epidemic') {
                this.pause();
                const init = this.initialStats || {};
                const msg = `
                    <div style="margin-top: 6px; line-height: 1.6;">
                        Días transcurridos: <b>${data.generation}</b><br>
                        Sanos (Sobrevivientes): <b>${init.sanos || 0} → ${data.sanos}</b><br>
                        Contagiados Iniciales: <b>${init.enfermos || 0}</b><br>
                        Total Recuperados: <b>${data.recuperados}</b><br>
                    </div>
                `;
                this._showToast('Epidemia Erradicada', msg, 'shield-check', 10000);
            }
        } catch (error) { console.error('Error al avanzar:', error); }
    }

    async _resetGame() {
        try {
            const rows = parseInt(document.getElementById('input-rows')?.value) || 50;
            const cols = parseInt(document.getElementById('input-cols')?.value) || 50;
            const density = parseInt(document.getElementById('input-density')?.value || 30) / 100;
            const mode = document.getElementById('select-mode')?.value || 'conway';
            const response = await fetch('/api/reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rows, cols, density, mode, client_id: this.clientId })
            });
            const data = await response.json();
            this._updateFromData(data);
        } catch (error) { console.error('Error al reiniciar:', error); }
    }

    async _clearGrid() {
        try {
            const response = await fetch('/api/clear', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ client_id: this.clientId })
            });
            const data = await response.json();
            this._updateFromData(data);
        } catch (error) { console.error('Error al limpiar:', error); }
    }

    async _toggleCell(row, col) {
        try {
            const response = await fetch('/api/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ row, col, client_id: this.clientId })
            });
            const data = await response.json();
            this._updateFromData(data);
        } catch (error) { console.error('Error al alternar:', error); }
    }

    async _applyConfig(silent = false) {
        try {
            const rows = parseInt(document.getElementById('input-rows')?.value) || 50;
            const cols = parseInt(document.getElementById('input-cols')?.value) || 50;
            const density = parseInt(document.getElementById('input-density')?.value || 30) / 100;
            
            let mode = 'conway';
            const pageType = document.body.dataset.page;
            const modeSelect = document.getElementById('select-mode');

            if (pageType === 'parte2') mode = 'epidemic';
            else if (pageType === 'parte1') mode = 'conway';
            else if (modeSelect) mode = modeSelect.value || 'conway';

            const response = await fetch('/api/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rows, cols, density, mode, client_id: this.clientId })
            });
            const data = await response.json();
            this._updateFromData(data);
            if (!silent) Object.keys(data).length && this._showToast('Configuración aplicada', `Modo: ${data.mode_name}`, 'settings');
        } catch (error) { console.error('Error al aplicar:', error); }
    }

    _updateFromData(data) {
        this.currentAlive = data.alive;
        this.currentEnfermos = data.enfermos;
        
        if (data.generation === 0) {
            this.initialStats = { sanos: data.sanos, enfermos: data.enfermos, recuperados: data.recuperados };
        }

        this.grid = data.grid;
        this.rows = data.rows;
        this.cols = data.cols;
        this.generation = data.generation;
        this.mode = data.mode;

        document.getElementById('stat-generation').textContent = data.generation;
        if (data.mode === 'epidemic') {
            document.getElementById('stat-alive').textContent = data.enfermos.toLocaleString();
            document.getElementById('stat-dead').textContent = data.sanos.toLocaleString();
            document.getElementById('stat-total').textContent = data.recuperados.toLocaleString();
        } else {
            document.getElementById('stat-alive').textContent = data.alive.toLocaleString();
            document.getElementById('stat-dead').textContent = data.dead.toLocaleString();
            document.getElementById('stat-total').textContent = data.total.toLocaleString();
        }

        const modeSelect = document.getElementById('select-mode');
        if (modeSelect && modeSelect.value !== data.mode) {
            modeSelect.value = data.mode;
            this._updateLegend();
        }

        this._resizeCanvas();
        this._render();
    }

    _showFinalReport(data) {
        let title = "Simulación Finalizada";
        let msg = "";
        let icon = "clipboard-check";

        if (this.mode === 'epidemic') {
            title = "Reporte Final de Epidemia";
            icon = "activity";
            msg = `
                <div style="margin-top: 8px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px;">
                    <p>Días alcanzados: <strong>${data.generation}</strong></p>
                    <p style="color: #ef4444;">Enfermos actuales: <strong>${data.enfermos}</strong></p>
                    <p style="color: #3b82f6;">Sanos: <strong>${data.sanos}</strong></p>
                    <p style="color: #94a3b8;">Recuperados: <strong>${data.recuperados}</strong></p>
                </div>
            `;
        } else {
            title = "Reporte Final Conway";
            icon = "layout-grid";
            msg = `
                <div style="margin-top: 8px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px;">
                    <p>Generaciones: <strong>${data.generation}</strong></p>
                    <p style="color: #00d4aa;">Células Vivas: <strong>${data.alive}</strong></p>
                    <p style="color: #94a3b8;">Células Muertas: <strong>${data.dead}</strong></p>
                </div>
            `;
        }
        this._showToast(title, msg, icon, 12000);
    }



    _updateLegend() {
        const container = document.getElementById('legend-container');
        if (!container) return;
        const scheme = this.colorSchemes[this.mode] || this.colorSchemes.conway;
        container.innerHTML = '';
        for (const [state, name] of Object.entries(scheme.names)) {
            const item = document.createElement('div');
            item.className = 'legend-item';
            item.innerHTML = `<div class="legend-color" style="background-color: ${scheme[state]}"></div><span>${name}</span>`;
            container.appendChild(item);
        }
    }

    _resizeCanvas() {
        const padding = 32;
        const cellW = Math.floor((this.container.clientWidth - padding) / this.cols);
        const cellH = Math.floor((this.container.clientHeight - padding) / this.rows);
        this.cellSize = Math.max(3, Math.min(cellW, cellH));
        this.canvas.width = this.cellSize * this.cols;
        this.canvas.height = this.cellSize * this.rows;
    }

    _render() {
        const ctx = this.ctx;
        const size = this.cellSize;
        const scheme = this.colorSchemes[this.mode] || this.colorSchemes.conway;
        ctx.fillStyle = scheme[0];
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        if (size > 4) {
            ctx.strokeStyle = scheme.grid;
            ctx.lineWidth = 0.5;
            for (let c = 0; c <= this.cols; c++) { ctx.beginPath(); ctx.moveTo(c * size, 0); ctx.lineTo(c * size, this.canvas.height); ctx.stroke(); }
            for (let r = 0; r <= this.rows; r++) { ctx.beginPath(); ctx.moveTo(0, r * size); ctx.lineTo(this.canvas.width, r * size); ctx.stroke(); }
        }
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const state = this.grid[r][c];
                if (state > 0) {
                    ctx.fillStyle = scheme[state] || scheme[1];
                    ctx.fillRect(c * size + 1, r * size + 1, size - 2, size - 2);
                }
            }
        }
    }

    play() {
        if (this.isRunning) return;
        this.isRunning = true;
        document.getElementById('btn-play').disabled = true;
        document.getElementById('btn-pause').disabled = false;
        this.intervalId = setInterval(() => this._stepOnce(), this.speed);
    }

    pause() {
        this.isRunning = false;
        if (this.intervalId) { clearInterval(this.intervalId); this.intervalId = null; }
        document.getElementById('btn-play').disabled = false;
        document.getElementById('btn-pause').disabled = true;
    }

    _bindEvents() {
        const ids = ['btn-play', 'btn-pause', 'btn-step', 'btn-reset', 'btn-clear', 'btn-apply'];
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                if (id === 'btn-play') el.onclick = () => this.play();
                if (id === 'btn-pause') el.onclick = () => this.pause();
                if (id === 'btn-step') el.onclick = () => { this.pause(); this._stepOnce(); };
                if (id === 'btn-reset') el.onclick = () => { this.pause(); this._resetGame(); };
                if (id === 'btn-clear') el.onclick = () => { this.pause(); this._clearGrid(); };
                if (id === 'btn-apply') el.onclick = () => { this.pause(); this._applyConfig(); };
            }
        });

        const density = document.getElementById('input-density');
        if (density) density.oninput = (e) => { document.getElementById('density-value').textContent = `${e.target.value}%`; };

        const speed = document.getElementById('input-speed');
        if (speed) speed.oninput = (e) => {
            this.speed = parseInt(e.target.value);
            document.getElementById('speed-value').textContent = `${this.speed}ms`;
            if (this.isRunning) { clearInterval(this.intervalId); this.intervalId = setInterval(() => this._stepOnce(), this.speed); }
        };

        const iterInput = document.getElementById('input-iterations');
        if (iterInput) {
            iterInput.oninput = (e) => {
                const val = parseInt(e.target.value) || 0;
                const display = document.getElementById('iterations-limit-value');
                if (display) display.textContent = val > 0 ? val : '∞';
            };
        }

        this.canvas.onclick = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const col = Math.floor((e.clientX - rect.left) / this.cellSize);
            const row = Math.floor((e.clientY - rect.top) / this.cellSize);
            if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) this._toggleCell(row, col);
        };

        document.querySelectorAll('.btn-preset').forEach(btn => {
            btn.onclick = () => {
                const size = parseInt(btn.dataset.size);
                document.getElementById('input-rows').value = size;
                document.getElementById('input-cols').value = size;
                this._applyConfig();
            };
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) lucide.createIcons();
    window.gameController = new GameController();
    
    // Auto-configurar
    const pageType = document.body.dataset.page;
    if (pageType === 'parte1' || pageType === 'parte2') {
        setTimeout(() => {
            window.gameController._applyConfig(true);
        }, 50);
    }
});
