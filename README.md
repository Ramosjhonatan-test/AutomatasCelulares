# 🧬 Juego de la Vida de Conway

**Materia:** MSS-953 Modelado y Simulación de Sistemas  
**Práctica 2:** Modelado con autómatas celulares

Aplicación web interactiva que implementa el Juego de la Vida de John Conway utilizando Flask (Python) y HTML/CSS/JavaScript.

---

## 📋 Reglas del Juego de la Vida

El Juego de la Vida es un **autómata celular** donde cada célula en una cuadrícula puede estar **viva** o **muerta**. En cada generación, se aplican estas reglas simultáneamente:

| Regla | Condición | Resultado |
|-------|-----------|-----------|
| Soledad | Célula **viva** con **< 2** vecinos vivos | **Muere** |
| Supervivencia | Célula **viva** con **2 o 3** vecinos vivos | **Sobrevive** |
| Sobrepoblación | Célula **viva** con **> 3** vecinos vivos | **Muere** |
| Reproducción | Célula **muerta** con **exactamente 3** vecinos vivos | **Revive** |

---

## 🚀 Cómo ejecutar el proyecto

### Paso 1: Requisitos previos

Asegúrate de tener **Python 3.8+** instalado. Verifica con:

```bash
python --version
```

### Paso 2: Instalar dependencias

Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
pip install flask numpy
```

### Paso 3: Ejecutar la aplicación

```bash
python app.py
```

### Paso 4: Abrir en el navegador

Abre tu navegador web y visita:

```
http://127.0.0.1:5000
```

---

## 🎮 Controles de la interfaz

| Control | Acción |
|---------|--------|
| ▶ **Iniciar** | Inicia la simulación automática |
| ⏸ **Pausar** | Pausa la simulación |
| ⏭ **Paso** | Avanza una sola generación |
| 🔄 **Reiniciar** | Genera nueva configuración aleatoria |
| 🗑️ **Limpiar** | Limpia todo el grid |
| **Click en celda** | Alterna el estado de una célula |

### Atajos de teclado

| Tecla | Acción |
|-------|--------|
| `Espacio` | Iniciar / Pausar |
| `N` | Siguiente paso |
| `R` | Reiniciar |
| `C` | Limpiar |

---

## 🗂 Estructura del proyecto

```
Practica 2/
├── app.py                  # Backend Flask (servidor + lógica del juego)
├── README.md               # Este archivo
├── templates/
│   └── index.html          # Interfaz web principal
└── static/
    ├── css/
    │   └── style.css       # Estilos de la interfaz
    └── js/
        └── game.js         # Controlador JavaScript (lógica del frontend)
```

---

## 🔌 API del Backend

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/` | Página principal |
| `GET` | `/api/state` | Obtener estado actual |
| `POST` | `/api/step` | Avanzar una generación |
| `POST` | `/api/reset` | Reiniciar con config aleatoria |
| `POST` | `/api/config` | Cambiar tamaño y densidad |
| `POST` | `/api/toggle` | Alternar una celda específica |
| `POST` | `/api/clear` | Limpiar todo el grid |

---

## ⚙️ Tecnologías utilizadas

- **Backend:** Python 3 + Flask + NumPy
- **Frontend:** HTML5 + CSS3 + JavaScript (Vanilla)
- **Renderizado:** Canvas API (para rendimiento con grids grandes)
