# 🦠 Simulador de Autómatas Celulares

¡Bienvenido al **Simulador de Autómatas Celulares**! Este proyecto fue desarrollado como parte de la **Práctica 2 de Modelado y Simulación de Sistemas (MSS-953)**. Presenta una plataforma interactiva, rápida y visualmente estimulante para visualizar y experimentar con varios modelos matemáticos que rigen el comportamiento complejo a través de reglas simples.

![Preview](https://raw.githubusercontent.com/Ramosjhonatan-test/AutomatasCelulares/main/static/img/favicon.svg) <!-- Cambia esto con un screenshot real luego -->

## 🚀 Características Principales

El proyecto se divide en dos módulos interactivos principales:

1. **Parte 1: El Juego de la Vida de Conway**
   - El modelo clásico de John Conway.
   - Observa cómo células simples mueren por soledad o sobrepoblación, o nacen por reproducción.
   - Controles completos de tiempo y generación, así como personalización de la densidad de inicio.

2. **Parte 2: Epidemiología SIR (Basado en CI del Estudiante)**
   - Un modelo dinámico de propagación de enfermedades basado en el modelo *Susceptible, Infectado, Recuperado*.
   - Las reglas personalizadas incluyen un contador de días en tiempo real de los enfermos, personas sanas y la curva total de víctimas/salvados.
   - Parámetros ajustables sobre la marcha (población, tasa de inicio, etc.).

## 🛠️ Tecnologías Utilizadas

- **Backend:** Flask (Python 3) para servir el juego e inicializar el autómata con respuestas rápidas de API en estado JSON.
- **Frontend:** Vanilla JavaScript y HTML5 Canvas para el renderizado más rápido posible. Las vistas están completamente en modo oscuro y personalizadas con variables puras en CSS con Glassmorphism y temas modernos.
- **Visuales & Gráficos:** Lucide Icons.
- **Math & Lógica:** NumPy para un cálculo ultra-rápido de matrices dispersas.

---

## 💻 Ejecución Local

Si deseas probar el simulador en tu entorno de desarrollo, sigue estos pasos:

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/Ramosjhonatan-test/AutomatasCelulares.git
   cd AutomatasCelulares
   ```

2. **(Opcional pero recomendado) Crear un Entorno Virtual e instalar dependencias:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # En Windows usa: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Ejecutar la Aplicación Flask:**
   ```bash
   python app.py
   ```
   *La aplicación estará viva en `http://localhost:5000/`.*

---

## ☁️ Despliegue en Vercel

Este repositorio está pre-configurado con un archivo `vercel.json` y `requirements.txt`, lo que lo hace "Zero-Config" y listo para Vercel Serverless.

1. Inicia sesión en tu cuenta de [Vercel](https://vercel.com/).
2. Toca en **Add New Project**.
3. Importa el repositorio desde tu cuenta de GitHub (búscalo como `AutomatasCelulares`).
4. En el paso de **Configure Project**, no es necesario cambiar la "Build Command" ni "Output Directory" ya que Vercel detectará el archivo Python gracias al archivo `vercel.json`.
5. Presiona **Deploy**. 

*En instantes recibirás un enlace de producción global y tu proyecto estará vivo.*

---
*Desarrollado y modelado por Univ. Jhonatan Ramos Collquehuanca.* 👨‍💻🪄
