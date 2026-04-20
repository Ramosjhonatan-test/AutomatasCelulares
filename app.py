"""
===============================================================================
 Juego de la Vida de Conway — Backend Flask
 Materia: MSS-953 Modelado y Simulación de Sistemas
 Práctica 2: Modelado con autómatas celulares
===============================================================================
 Este archivo contiene el servidor Flask y toda la lógica del Juego de la Vida.
 
 Reglas de Conway:
   1. Una célula permanece VIVA si tiene en su vecindad 2 o 3 células vivas.
   2. Una célula MUERE debido a superpoblación si hay más de 3 células vivas en su vecindad.
   3. Una célula MUERE a causa del aislamiento si hay menos de 2 células vivas en su vecindad.
   4. Una célula muerta VUELVE A LA VIDA si hay exactamente 3 células vivas en su vecindad.
===============================================================================
"""

from flask import Flask, render_template, jsonify, request
import numpy as np
import random

# ─── Crear la aplicación Flask ───────────────────────────────────────────────
app = Flask(__name__)


# =============================================================================
# Clase principal: SimulationEngine
# =============================================================================
class SimulationEngine:
    """
    Representa el estado y la lógica de múltiples modelos de autómatas celulares.
    """
    
    MODES = {
        'conway': 'Juego de la Vida (Conway)',
        'forest_fire': 'Incendio Forestal',
        'epidemic': 'Propagación de Epidemia (SIR)',
        'predator_prey': 'Depredador-Presa',
        'urban': 'Crecimiento Urbano',
        'traffic': 'Tráfico Vehicular (2D Simplificado)'
    }

    def __init__(self, rows=50, cols=50, density=0.3, mode='conway'):
        self.rows = rows
        self.cols = cols
        self.density = density
        self.mode = mode
        self.generation = 0
        self.grid = self._generate_initial_grid()

    def _generate_initial_grid(self):
        if self.mode == 'conway' or self.mode == 'urban':
            return (np.random.random((self.rows, self.cols)) < self.density).astype(int)
        elif self.mode == 'forest_fire':
            # 1: Tree, 2: Burning, 0: Empty
            grid = np.zeros((self.rows, self.cols), dtype=int)
            trees = (np.random.random((self.rows, self.cols)) < self.density)
            grid[trees] = 1
            # Randomly start one fire
            if self.rows > 0 and self.cols > 0:
                grid[self.rows//2, self.cols//2] = 2
            return grid
        elif self.mode == 'epidemic':
            # 0: Empty, 1: Susceptible, 2: Infected, 3: Recovered
            grid = np.zeros((self.rows, self.cols), dtype=int)
            # 1. Distribuir población (Sanos) - Densidad fija alta para la ciudad
            people = (np.random.random((self.rows, self.cols)) < 0.7)
            grid[people] = 1 
            
            # 2. Infectar según la densidad elegida (Infectados Iniciales)
            infected_mask = (grid == 1) & (np.random.random((self.rows, self.cols)) < self.density)
            grid[infected_mask] = 2
            
            # 3. Fuerza un paciente cero si la probabilidad falló (y hay población)
            if np.sum(grid == 2) == 0 and np.sum(grid == 1) > 0:
                people_indices = np.argwhere(grid == 1)
                if len(people_indices) > 0:
                    idx = random.choice(people_indices)
                    grid[idx[0], idx[1]] = 2
            return grid
        elif self.mode == 'predator_prey':
            # 0: Empty, 1: Prey, 2: Predator
            grid = np.zeros((self.rows, self.cols), dtype=int)
            r = np.random.random((self.rows, self.cols))
            grid[r < self.density] = 1 # Preys
            grid[np.logical_and(r >= self.density, r < self.density + 0.05)] = 2 # Predators (5%)
            return grid
        elif self.mode == 'traffic':
            # 0: Empty, 1: Vehicle East, 2: Obstacle
            grid = np.zeros((self.rows, self.cols), dtype=int)
            r = np.random.random((self.rows, self.cols))
            grid[r < self.density] = 1 
            grid[np.logical_and(r >= 0.9, r < 0.95)] = 2 # Obstacles
            return grid
        return np.zeros((self.rows, self.cols), dtype=int)

    def _get_neighbors(self, row, col):
        """Standard 8-neighbor count for Conway (Fixed borders)."""
        count = 0
        for dr in [-1, 0, 1]:
            for dc in [-1, 0, 1]:
                if dr == 0 and dc == 0: continue
                r, c = row + dr, col + dc
                if 0 <= r < self.rows and 0 <= c < self.cols:
                    if self.grid[r, c] == 1: count += 1
        return count

    def _get_all_neighbor_states(self, row, col):
        """Returns counts of each state in the 8-neighborhood (Fixed borders)."""
        neighbor_states = {}
        for dr in [-1, 0, 1]:
            for dc in [-1, 0, 1]:
                if dr == 0 and dc == 0: continue
                r, c = row + dr, col + dc
                if 0 <= r < self.rows and 0 <= c < self.cols:
                    state = self.grid[r, c]
                    neighbor_states[state] = neighbor_states.get(state, 0) + 1
        return neighbor_states

    def step(self):
        new_grid = self.grid.copy()
        
        if self.mode == 'conway':
            for r in range(self.rows):
                for c in range(self.cols):
                    n = self._get_neighbors(r, c)
                    if self.grid[r, c] == 1:
                        new_grid[r, c] = 1 if n in [2, 3] else 0
                    else:
                        new_grid[r, c] = 1 if n == 3 else 0

        elif self.mode == 'forest_fire':
            p_grow = 0.01  # Probabilidad de crecimiento espontáneo
            p_burn = 0.001 # Probabilidad de rayo (fuego espontáneo)
            for r in range(self.rows):
                for c in range(self.cols):
                    state = self.grid[r, c]
                    neighbors = self._get_all_neighbor_states(r, c)
                    if state == 2: # Burning
                        new_grid[r, c] = 0 # Becomes Ash/Empty
                    elif state == 1: # Tree
                        if neighbors.get(2, 0) > 0 or random.random() < p_burn:
                            new_grid[r, c] = 2 # Catch fire!
                    elif state == 0: # Empty
                        if random.random() < p_grow:
                            new_grid[r, c] = 1 # Grow tree
        
        elif self.mode == 'epidemic':
            p_inf = 0.25 # Prob of infection from a sick neighbor
            p_rec = 0.15 # Prob of recovery each turn
            for r in range(self.rows):
                for c in range(self.cols):
                    state = self.grid[r, c]
                    neighbors = self._get_all_neighbor_states(r, c)
                    if state == 1: # Susceptible (Sano)
                        # Se infecta si tiene vecinos infectados
                        if neighbors.get(2, 0) > 0 and random.random() < p_inf:
                            new_grid[r, c] = 2
                    elif state == 2: # Infected (Enfermo)
                        if random.random() < p_rec:
                            new_grid[r, c] = 3
                    # State 3 (Recovered) stays 3. State 0 (Empty) stays 0.
        
        elif self.mode == 'predator_prey':
            for r in range(self.rows):
                for c in range(self.cols):
                    state = self.grid[r, c]
                    neighbors = self._get_all_neighbor_states(r, c)
                    if state == 1: # Prey
                        # Preys die if overcrowded or too many predators
                        if neighbors.get(1, 0) > 6 or neighbors.get(2, 0) > 2:
                            new_grid[r, c] = 0
                        # Preys multiply slowly
                        elif neighbors.get(0, 0) > 0 and random.random() < 0.1:
                            # This is a bit tricky for CA, but we can spawn in empty neighbor
                            pass 
                    elif state == 2: # Predator
                        # Predators die of starvation if no prey
                        if neighbors.get(1, 0) == 0:
                            new_grid[r, c] = 0
                    elif state == 0: # Empty
                        # Prey reproduction
                        if neighbors.get(1, 0) >= 2 and random.random() < 0.2:
                            new_grid[r, c] = 1
                        # Predator arrival
                        elif neighbors.get(2, 0) >= 1 and neighbors.get(1, 0) >= 1:
                            new_grid[r, c] = 2

        elif self.mode == 'urban':
            p_growth = 0.05
            for r in range(self.rows):
                for c in range(self.cols):
                    state = self.grid[r, c]
                    if state == 0:
                        neighbors = self._get_all_neighbor_states(r, c)
                        if neighbors.get(1, 0) > 0 and random.random() < p_growth * neighbors.get(1, 0):
                            new_grid[r, c] = 1

        elif self.mode == 'traffic':
            # Nagel-Schreckenberg simplified east movement
            new_grid = np.zeros_like(self.grid)
            # Copy obstacles
            new_grid[self.grid == 2] = 2
            for r in range(self.rows):
                for c in range(self.cols):
                    if self.grid[r, c] == 1: # Vehicle
                        next_c = (c + 1) % self.cols
                        if self.grid[r, next_c] == 0:
                            new_grid[r, next_c] = 1
                        else:
                            new_grid[r, c] = 1 # Stay put (jam)

        self.grid = new_grid
        self.generation += 1

    def reset(self, rows=None, cols=None, density=None, mode=None):
        if rows is not None: self.rows = rows
        if cols is not None: self.cols = cols
        if density is not None: self.density = density
        if mode is not None: self.mode = mode
        self.generation = 0
        self.grid = self._generate_initial_grid()

    def toggle_cell(self, row, col):
        if 0 <= row < self.rows and 0 <= col < self.cols:
            if self.mode in ['conway', 'urban']:
                self.grid[row, col] = 1 - self.grid[row, col]
            elif self.mode == 'epidemic':
                self.grid[row, col] = (self.grid[row, col] + 1) % 4
            else:
                self.grid[row, col] = (self.grid[row, col] + 1) % 3

    def clear(self):
        self.grid = np.zeros((self.rows, self.cols), dtype=int)
        self.generation = 0

    def get_state(self):
        alive_count = int(np.sum(self.grid > 0))
        total = self.rows * self.cols
        state_dict = {
            'grid': self.grid.tolist(),
            'rows': self.rows,
            'cols': self.cols,
            'generation': self.generation,
            'alive': alive_count,
            'dead': total - alive_count,
            'total': total,
            'mode': self.mode,
            'mode_name': self.MODES.get(self.mode, 'Desconocido')
        }
        
        if self.mode == 'epidemic':
            state_dict['sanos'] = int(np.sum(self.grid == 1))
            state_dict['enfermos'] = int(np.sum(self.grid == 2))
            state_dict['recuperados'] = int(np.sum(self.grid == 3))

        return state_dict


# ─── Almacén de instancias por cliente ────────────────────────────────────────
games_instances = {}

def get_game():
    """Obtiene la instancia del juego para el cliente actual basándose en un client_id enviado desde el frontend."""
    client_id = None
    if request.method == 'GET':
        client_id = request.args.get('client_id')
    elif request.is_json:
        data = request.get_json() or {}
        client_id = data.get('client_id')
        
    if not client_id:
        client_id = 'default'
        
    if client_id not in games_instances:
        games_instances[client_id] = SimulationEngine(rows=50, cols=50, density=0.3, mode='conway')
        
    return games_instances[client_id]


# =============================================================================
# Rutas de la aplicación
# =============================================================================

@app.route('/')
def index():
    """Ruta principal: Landing page con selección de partes."""
    return render_template('landing.html')


@app.route('/parte1')
def parte1():
    """Parte 1: El Juego de la Vida de Conway."""
    return render_template('parte1.html')


@app.route('/parte2')
def parte2():
    """Parte 2: Aplicación Fenómeno Real (Dígito 1 -> Propagación de epidemias)."""
    return render_template('parte2.html')


@app.route('/legacy_full')
def legacy_full():
    """Ruta anterior con todos los modos (para referencia)."""
    return render_template('index.html')


@app.route('/api/state', methods=['GET'])
def get_state():
    """
    API: Obtener el estado actual de la simulación.
    
    Returns:
        JSON con la matriz, generación y estadísticas.
    """
    game = get_game()
    return jsonify(game.get_state())


@app.route('/api/step', methods=['POST'])
def step():
    """
    API: Avanzar una generación en la simulación.
    
    Returns:
        JSON con el nuevo estado después de aplicar las reglas.
    """
    game = get_game()
    game.step()
    return jsonify(game.get_state())


@app.route('/api/reset', methods=['POST'])
def reset():
    """
    API: Reiniciar la simulación con configuración aleatoria.
    Acepta parámetros opcionales: rows, cols, density, mode.
    
    Returns:
        JSON con el estado reiniciado.
    """
    game = get_game()
    data = request.get_json() or {}
    rows = data.get('rows', game.rows)
    cols = data.get('cols', game.cols)
    density = data.get('density', game.density)
    mode = data.get('mode', game.mode)
    game.reset(rows=rows, cols=cols, density=density, mode=mode)
    return jsonify(game.get_state())


@app.route('/api/config', methods=['POST'])
def config():
    """
    API: Cambiar la configuración del juego (tamaño, densidad y modo).
    Reinicia la simulación con los nuevos parámetros.
    
    Parámetros JSON:
        rows (int): Nuevo número de filas.
        cols (int): Nuevo número de columnas.
        density (float): Nueva densidad inicial.
        mode (str): Nuevo modo de simulación.
    
    Returns:
        JSON con el nuevo estado.
    """
    game = get_game()
    data = request.get_json() or {}
    rows = data.get('rows', 50)
    cols = data.get('cols', 50)
    density = data.get('density', 0.3)
    mode = data.get('mode', 'conway')
    game.reset(rows=rows, cols=cols, density=density, mode=mode)
    return jsonify(game.get_state())


@app.route('/api/toggle', methods=['POST'])
def toggle():
    """
    API: Alternar el estado de una célula específica.
    
    Parámetros JSON:
        row (int): Fila de la célula.
        col (int): Columna de la célula.
    
    Returns:
        JSON con el estado actualizado.
    """
    game = get_game()
    data = request.get_json() or {}
    row = data.get('row', 0)
    col = data.get('col', 0)
    game.toggle_cell(row, col)
    return jsonify(game.get_state())


@app.route('/api/clear', methods=['POST'])
def clear():
    """
    API: Limpiar toda la matriz (todas las células mueren).
    
    Returns:
        JSON con el estado limpio.
    """
    game = get_game()
    game.clear()
    return jsonify(game.get_state())


# ─── Punto de entrada ───────────────────────────────────────────────────────
if __name__ == '__main__':
    print("=" * 60)
    print("  Juego de la Vida de Conway")
    print("  Abrir en el navegador: http://127.0.0.1:5000")
    print("=" * 60)
    app.run(debug=True, port=5000)
