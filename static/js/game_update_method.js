    /**
     * Actualiza todo el estado local y la interfaz con datos del backend.
     * @param {Object} data - Datos recibidos del backend
     */
    _updateFromData(data) {
        this.grid = data.grid;
        this.rows = data.rows;
        this.cols = data.cols;
        this.generation = data.generation;
        this.mode = data.mode;

        // Si la generación es 0, reiniciamos los datos del gráfico
        if (data.generation === 0) {
            this.chartData = { labels: [], sanos: [], enfermos: [], recuperados: [] };
            if (this.sirChart) {
                this.sirChart.data.labels = this.chartData.labels;
                this.sirChart.data.datasets[0].data = this.chartData.sanos;
                this.sirChart.data.datasets[1].data = this.chartData.enfermos;
                this.sirChart.data.datasets[2].data = this.chartData.recuperados;
                this.sirChart.update();
            }
        }

        // Actualizar estadísticas en pantalla
        const genEl = document.getElementById('stat-generation');
        const aliveEl = document.getElementById('stat-alive');
        const deadEl = document.getElementById('stat-dead');
        const totalEl = document.getElementById('stat-total');

        if (genEl) genEl.textContent = data.generation;

        if (data.mode === 'epidemic') {
            if (aliveEl) aliveEl.textContent = data.enfermos.toLocaleString();
            if (deadEl) deadEl.textContent = data.sanos.toLocaleString();
            if (totalEl) totalEl.textContent = data.recuperados.toLocaleString();

            // Actualizar Gráfico SIR
            if (!this.sirChart) this._initChart();
            if (this.sirChart) {
                // Solo añadir si es una generación nueva y no estamos en gen 0 (ya manejado arriba)
                if (data.generation > 0 && (this.chartData.labels.length === 0 || this.chartData.labels[this.chartData.labels.length - 1] !== data.generation)) {
                    this.chartData.labels.push(data.generation);
                    this.chartData.sanos.push(data.sanos);
                    this.chartData.enfermos.push(data.enfermos);
                    this.chartData.recuperados.push(data.recuperados);
                    
                    if (this.chartData.labels.length > 200) {
                        this.chartData.labels.shift();
                        this.chartData.sanos.shift();
                        this.chartData.enfermos.shift();
                        this.chartData.recuperados.shift();
                    }
                    this.sirChart.update('none');
                    
                    const dayEl = document.getElementById('chart-day');
                    if (dayEl) dayEl.textContent = data.generation;
                }
            }
        } else {
            if (aliveEl) aliveEl.textContent = data.alive.toLocaleString();
            if (deadEl) deadEl.textContent = data.dead.toLocaleString();
            if (totalEl) totalEl.textContent = data.total.toLocaleString();
        }

        // Sincronizar el selector de modo si es necesario
        const modeSelect = document.getElementById('select-mode');
        if (modeSelect && modeSelect.value !== data.mode) {
            const optionExists = Array.from(modeSelect.options).some(opt => opt.value === data.mode);
            if (optionExists) {
                modeSelect.value = data.mode;
                this._updateLegend();
            }
        }

        // Actualizar info del grid
        const gridInfoEl = document.getElementById('grid-info');
        if (gridInfoEl) {
            gridInfoEl.textContent = `${data.mode_name} | Grid: ${this.rows} × ${this.cols} | Gen: ${this.generation}`;
        }

        // Re-renderizar el canvas
        this._resizeCanvas();
        this._render();
    }
