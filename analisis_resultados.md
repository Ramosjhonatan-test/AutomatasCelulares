# Análisis de Resultados: Simulación de Fenómenos Complejos

Este documento analiza el comportamiento de los diversos modelos de autómatas celulares implementados en la plataforma, evaluando su sensibilidad a las configuraciones iniciales y las dinámicas emergentes observadas.

## 1. El Juego de la Vida (Conway)
**Configuración Recomendada:** Densidad 30% - 40%.
- **Cumplimiento de Reglas:** Se ha verificado la implementación estricta de las reglas solicitadas:
  * **Supervivencia:** Célula viva con 2 o 3 vecinos permanece viva.
  * **Superpoblación:** Célula viva con >3 vecinos muere.
  * **Aislamiento:** Célula viva con <2 vecinos muere.
  * **Reproducción:** Célula muerta con exactamente 3 vecinos vuelve a la vida.
- **Observaciones:** Con densidades bajas (<20%), la vida suele extinguirse rápidamente. Con densidades altas (>50%), la sobrepoblación causa una extinción masiva inicial.
- **Dinámicas Emergentes:** Se observaron "Osciladores" y "Estructuras Estables" frecuentes. En grids grandes (100x100), aparecen patrones complejos que persisten indefinidamente.

## 2. Incendio Forestal
**Configuración Recomendada:** Densidad 60% (Bosque denso).
- **Observaciones:** Existe un "punto crítico" de densidad. Si la densidad de árboles es baja, el fuego se extingue sin propagarse mucho. Si es alta, un solo rayo puede consumir casi todo el bosque.
- **Efecto de Regeneración:** La probabilidad de crecimiento espontáneo permite que el sistema entre en un ciclo infinito de incendio-recuperación.

## 3. Propagación de Epidemia (SIR) - [Modelo asignado por CI: 13054261]
**Configuración Recomendada:** Densidad 1-5% infectados iniciales.
- **Observaciones:** El modelo SIR muestra claramente la "curva epidémica". Los infectados (rojo) aumentan rápidamente mientras la población susceptible (azul) disminuye.
- **Inmunidad de Rebaño:** Los nodos grises (recuperados) actúan como barreras físicas contra la propagación, simulando de manera efectiva la inmunidad adquirida.

## 4. Depredador-Presa
**Configuración Recomendada:** Densidad presas 30%, predadores 5%.
- **Observaciones:** Este modelo es el más inestable. Es común que los depredadores consuman todas las presas y luego mueran de hambre, o que las presas se reproduzcan sin control si los depredadores se extinguen.
- **Equilibrio:** Se logran estados de equilibrio dinámico solo con tasas de reproducción y mortalidad muy afinadas.

## 5. Crecimiento Urbano
**Configuración Recomendada:** Densidad inicial 5% (Núcleos urbanos).
- **Observaciones:** El crecimiento es radial y depende de la proximidad a zonas ya urbanizadas. Los obstáculos (zonas restringidas) moldean la expansión, creando patrones similares a la urbanización real.

## 6. Tráfico Vehicular
**Configuración Recomendada:** Densidad 35%.
- **Observaciones:** A densidades bajas, el tráfico fluye libremente (flujo laminar). Al superar el 40-50%, se forman "atascamientos fantasma" donde los vehículos se detienen sin una causa externa aparente más que la densidad misma.

---
*Este análisis forma parte de la Práctica 2 de Modelado y Simulación de Sistemas.*
