# Business Case & ROI — adidas LAM Demand Forecasting Platform
*Basado en benchmarks de industria (retail apparel)*

---

## El modelo de valor

La plataforma genera valor en tres vectores cuantificables:

### Vector 1: Reducción de inventario por mejora de accuracy

**Relación establecida en la industria:**
- Cada punto porcentual de mejora en WMAPE permite reducir safety stock en ~0.3-0.5%
- Esta relación está documentada en estudios de Gartner, McKinsey (Global Fashion Agenda), y en implementaciones de Oracle y SAP IBP en retail apparel

**Aplicando al caso de adidas LAM:**

| Escenario | WMAPE Actual | WMAPE Target | Mejora | Reducción inventory |
|-----------|-------------|-------------|--------|---------------------|
| Conservador | 38% | 22% | 16pp | ~5-8% |
| Base | 38% | 20% | 18pp | ~5-9% |
| Optimista | 40% | 18% | 22pp | ~7-11% |

**Si adidas LAM maneja un inventario de $400M-$600M USD (estimado para una operación regional de esta escala en apparel):**

| Inventario | 7% reducción | 9% reducción |
|-----------|-------------|-------------|
| $400M | $28M liberados | $36M liberados |
| $500M | $35M liberados | $45M liberados |
| $600M | $42M liberados | $54M liberados |

**Costo de carry del inventario (costo del capital + warehousing + obsolescencia):**
En retail apparel, el costo de carry es típicamente 20-30% del valor de inventario anual.

Si se liberan $35M de inventario (escenario base, $500M de inventario):
- Ahorro anual de carry cost: $35M × 25% = **$8.75M/año**

---

### Vector 2: Reducción de stockouts → Revenue capturado

**Relación establecida:**
- Estudios del IHL Group (2023-2024) estiman que stockouts en retail representan en promedio 4-8% de revenue potencial no capturado
- En eCommerce, la tasa de abandono por out-of-stock es aún mayor: un cliente que no encuentra el producto tiene más opciones de ir a la competencia online

**Estimado conservador:**
Si la mejora de forecasting reduce stockouts en 30% (benchmark de implementaciones similares):
- Revenue adicional capturado: depende del tamaño de LAM, pero incluso para una operación de $1B-$2B en revenue, un 1% de mejora = $10M-$20M

---

### Vector 3: Reducción de markdowns por overstock

**Relación establecida:**
- En fashion/apparel, un forecast más preciso reduce los excesos de inventario que terminan en markdown
- Cada punto de mejora de accuracy puede reducir markdown rate en 0.1-0.2 puntos porcentuales
- Los márgenes en apparel son del orden de 40-60% gross margin; los markdowns erosionan directamente ese margen

---

## Inversión vs. Retorno (año 1)

### Inversión año 1

| Componente | Estimado |
|-----------|----------|
| Infraestructura (Databricks + AWS) × 12 meses | $250K - $370K |
| Equipo (salarios, desde Phase 0) | $1.2M - $2M* |
| Licencias, herramientas adicionales (Fivetran, etc.) | $100K - $150K |
| **Total año 1** | **~$1.6M - $2.5M** |

*\*El costo de equipo varía enormemente por país y seniority. El rango asume una mezcla de talento LAM.*

### Retorno conservador (año 1, solo carry cost de inventario)

Usando el escenario más conservador ($400M inventario, 5% reducción, 20% carry cost):
- Ahorro carry cost: $400M × 5% × 20% = **$4M/año** (a partir de mes 7-12 con impacto gradual)
- Impacto del primer año: ~50% del potencial anual dado el ramp-up = **$2M en año 1**

### Retorno en estado maduro (año 2+)

- Carry cost savings: $4M-$9M/año
- Revenue capturado por reducción de stockouts: $5M-$20M (dependiendo de escala)
- Reducción de markdowns: $2M-$5M
- **Total potencial año 2+: $11M-$34M/año**

### Payback period estimado

| Escenario | Inversión Año 1 | ROI Año 2 (conservador) | Payback |
|-----------|----------------|------------------------|---------|
| Conservador | $2M | $11M | < 3 meses de año 2 |
| Base | $2.5M | $18M | < 2 meses de año 2 |

---

## Cómo presentar esto en el panel

**Versión para CFO/C-level (30 segundos):**
> "La inversión total en año 1, incluyendo infraestructura y equipo, es del orden de $1.6M-$2.5M. El retorno en estado maduro, basado en benchmarks de industria de reducción de carry cost de inventario y mejora de fill rate, está en el rango de $11M-$34M anuales. El payback period en año 2 es de semanas, no de meses. El activo que construimos — datos limpios, modelos entrenados, equipo capacitado — tiene valor compuesto año sobre año."

**Si no tienen los datos de inventario:**
> "No tengo acceso a los números específicos de inventario de adidas LAM, y no quiero hacer proyecciones sin datos reales. Lo que sí puedo decirles es el modelo de cálculo y los benchmarks de industria, para que podamos aplicarlo juntos con los números reales una vez esté adentro."

---

## Benchmarks de referencia

- **McKinsey (2024):** Retailers que implementan forecasting ML avanzado reportan 15-30% de reducción de costos de inventario
- **Gartner Supply Chain Top 25 (2023-2024):** Las empresas en el top cuartil de supply chain maturity tienen WMAPE 40-50% menor que el promedio de la industria
- **Nike, Adidas Global (reportes públicos):** Ambas compañías han reportado iniciativas de ML forecasting como parte de sus estrategias de inventory efficiency en los últimos 3 años
- **IHL Group (2024):** Los stockouts en retail global representan $1.77 trillion en ventas perdidas anuales
