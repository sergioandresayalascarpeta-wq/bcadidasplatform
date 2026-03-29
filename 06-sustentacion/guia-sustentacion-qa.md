# Guía de Sustentación — Director of Data Engineering
## adidas LAM Demand Forecasting Platform
### Preparación para 30 min presentación + 15 min Q&A

---

## PITCHES A DIFERENTES ALTITUDES

Memoriza estas tres versiones. Son lo más importante.

### ⚡ 30 segundos (elevator pitch)
> "Propongo construir la plataforma centralizada de Demand Forecasting para adidas LAM: un Databricks Lakehouse en AWS con arquitectura Medallion que unifica datos de los 4 canales en 6 países, habilita modelos ML para forecasting automatizado y reduce el WMAPE del 35-40% actual a menos del 20% en 12 meses, con un primer valor entregable en el mes 7."

### 🎯 2 minutos (cuando te piden resumir la propuesta)
> "El problema central es que adidas LAM hace forecasting en spreadsheets, con datos fragmentados en 7+ sistemas y latencias de T+2 a T+5. Eso se traduce en dos costos concretos: stockouts que pierden ventas, y overstock que erosiona margen con markdowns.
>
> La solución que propongo es una plataforma Databricks Lakehouse en AWS que resuelve esto en 4 fases a lo largo de 12 meses. La base es la arquitectura Medallion: Bronze para ingestión raw, Silver para datos limpios y un Unified Product Master que armoniza identidades de SKU a través de todos los sistemas, y Gold con tablas de features y outputs de forecast listos para negocio.
>
> Sobre eso construimos una estrategia ML híbrida: modelos estadísticos para volúmenes bajos, gradient boosting para canales con datos promocionales, y deep learning para eCommerce. Un ensemble combina las salidas y se optimiza por canal y país.
>
> El gobierno de datos corre sobre Unity Catalog con ownership por dominio, RBAC granular y cumplimiento de LGPD, LFPDPPP y Ley 25.326.
>
> Primer valor en el mes 7: forecasts ML en producción para Brasil eCommerce y Retail. Cobertura completa LAM en el mes 12. Steady-state cost de $22K-$31K/mes."

### 📊 5 minutos (apertura de la presentación)
Usa las notas de Slide 3, 4 y 5 del archivo `speaker-notes.md`.

---

## BLOQUE 1: PREGUNTAS DE NEGOCIO (C-Level / CFO / VP Commercial)

### P1: "¿Cuánto nos va a costar esto y cuál es el ROI?"
**Respuesta:**
> "El costo de infraestructura en steady state es $22K-$31K/mes, aproximadamente $300K-$380K en el año 1 solo en plataforma. El equipo de 10-12 personas es el costo principal.
>
> En cuanto al ROI: la industria de retail y apparel muestra de forma consistente que cada punto porcentual de mejora en forecast accuracy se traduce en 0.3-0.5% de reducción de inventario. Si asumimos que adidas LAM tiene un inventario de $500M (estimado conservador para la región), pasar de WMAPE ~38% a <20% — una mejora de ~18 puntos — podría representar entre $27M y $45M en reducción de capital inmovilizado, o ahorro de costo de carry del orden del 20-25% de ese valor anual.
>
> Adicionalmente, menos stockouts se traducen directamente en conversión capturada. Un 1% de mejora en fill rate en eCommerce LAM puede representar millones en revenue adicional.
>
> La plataforma se paga en el primer año solo con reducción de carry cost de inventario, sin contar el valor de revenue capturado."

*(Nota para ti: si te preguntan por datos específicos de adidas LAM que no tienes, responde con honestidad: "No tengo acceso a los números exactos de inventario LAM, pero puedo mostrarles el modelo de cálculo para que lo apliquemos con los números reales del negocio una vez esté adentro.")*

### P2: "¿Por qué 12 meses? ¿No podemos hacerlo más rápido?"
**Respuesta:**
> "La cronología está diseñada para entregar valor incremental, no para ser conservadora. En el mes 7 ya tenemos ML forecasts en producción para los dos mercados más grandes. El tiempo entre el mes 7 y el 12 es escala — extender a 4 canales y 6 países no requiere rediseño, solo onboarding.
>
> El riesgo de acortar está en la Fase 1: el Unified Product Master necesita validación real con el equipo de Product Data. Si aceleramos sin eso, los modelos ML aprenderán sobre datos desalineados y la precisión sufrirá. Es mejor hacer bien la base que llegar rápido con datos incorrectos."

### P3: "¿Qué pasa si no llegamos al WMAPE < 20%?"
**Respuesta:**
> "El WMAPE < 20% es un target basado en benchmarks de implementaciones comparables en retail apparel. No es una promesa de llegada instantánea — es el objetivo del mes 12.
>
> Tenemos dos protecciones: primero, un baseline estadístico (Prophet/ETS) que típicamente logra WMAPE de 25-30% en semanas, lo cual ya es mejor que el estado actual. Segundo, el A/B testing y champion/challenger frameworks nos permiten promover nuevos modelos solo cuando hay evidencia de mejora.
>
> Si al mes 12 estamos en 22% y no en 20%, eso sigue siendo un logro significativo. El error sería no medir — esta plataforma hace que las métricas de accuracy sean auditables y visibles por primera vez."

### P4: "¿Cómo se alinea esto con la estrategia global de datos de adidas?"
**Respuesta:**
> "Databricks Lakehouse y AWS son la decisión de plataforma ya tomada por adidas a nivel global, por eso están como non-negotiable en el brief. La arquitectura Medallion es también el estándar corporativo. Lo que estamos diseñando en LAM sigue exactamente ese patrón, lo que facilita tanto la revisión de arquitectura por parte de los equipos globales, como la posibilidad de intercambiar patrones y playbooks con otras regiones.
>
> Específicamente, Unity Catalog con el modelo de governance que propongo es compatible con una federación de datos cross-regional si adidas decide en el futuro consolidar forecasting a nivel global."

---

## BLOQUE 2: PREGUNTAS TÉCNICAS PROFUNDAS

### P5: "¿Por qué Databricks y no SageMaker para el componente de ML?"
**Respuesta:**
> "SageMaker es una plataforma de ML excelente, pero para este caso específico Databricks tiene dos ventajas determinantes: primero, la integración nativa entre el data engineering (ETL), el feature store, el entrenamiento y el serving en una sola plataforma. Con SageMaker necesitaríamos múltiples servicios adicionales de AWS para tener paridad de funcionalidades, lo que aumenta complejidad operativa.
>
> Segundo, la decisión ya está tomada — el brief especifica Databricks como non-negotiable. Mi propuesta maximiza las capacidades de esa plataforma. Si la restricción no existiera, haría el mismo análisis y llegaría a la misma conclusión por la coherencia del stack."

### P6: "¿Por qué Delta Lake sobre Iceberg o Hudi?"
**Respuesta:**
> "Las tres son buenas opciones en 2026. Delta Lake es la elección correcta aquí por tres razones concretas: integración nativa con Databricks (Zero-ETL para Unity Catalog), tiempo de viaje (time travel) que es crítico para auditoría y reprocessing, y Z-ordering que optimiza las queries BI sobre Gold tables. Iceberg sería una buena alternativa si necesitáramos interoperabilidad multi-cloud; Hudi si el caso de uso primario fuera upserts de alta frecuencia. Ninguno de los dos ofrece ventaja suficiente para justificar salir del stack nativo de Databricks."

### P7: "Explícame Unity Catalog en términos simples — ¿por qué no solo IAM?"
**Respuesta:**
> "IAM controla quién puede llamar a qué API de AWS — es control de infraestructura. Unity Catalog controla quién puede leer qué tabla, columna, o fila dentro de Databricks — es control de datos.
>
> La diferencia práctica: con IAM solo, si le doy acceso a un usuario a S3, ve todos los archivos del bucket. Con Unity Catalog puedo decir: 'Este demand planner puede ver la tabla gold.forecast.outputs_v1, pero solo las filas donde country_code = 'BRA', y la columna de customer_id aparece enmascarada.' Esa granularidad es lo que necesitamos para LGPD, y lo que hace que governance sea operacional y no solo declarativa."

### P8: "¿Cómo funciona el Unified Product Master en la práctica?"
**Respuesta:**
> "Es un proceso de entity resolution en tres etapas. Primera etapa: match exacto por barcode EAN/UPC — cuando una zapatilla tiene el mismo código de barras en SAP, en el POS y en eCommerce, el match es determinístico. Eso resuelve aproximadamente el 70-80% de los casos.
>
> Segunda etapa: fuzzy matching sobre descripción, color, talla y categoría — algoritmo tipo TF-IDF o Levenshtein con un threshold de confianza configurado. Captura otros 15-20%.
>
> El 5-10% restante va a una tabla de mapping manual, mantenida por el equipo de Product Data como proceso operativo regular. SCD Type 2 para trackear cambios históricos — si un SKU cambia de categoría, mantenemos ambas versiones para no romper series de tiempo históricas.
>
> El KPI de éxito de esta capa es match rate >95%. Sin esto, los modelos ML no funcionan — no pueden ver el volumen total de un producto."

### P9: "¿Por qué no hacen real-time forecasting?"
**Respuesta:**
> "Porque el negocio no necesita real-time forecast — necesita near real-time data. La diferencia es importante.
>
> Los datos de POS y eCommerce se ingieren en near real-time (5 minutos de micro-batch) para asegurarnos de que las decisiones del Monday morning run tengan los datos más frescos posibles del fin de semana.
>
> Pero el forecast en sí mismo es un ciclo semanal: los demand planners lo consumen el lunes, se integra con SAP IBP para reposición, y la siguiente actualización es el lunes siguiente. Real-time scoring tiene sentido para casos de uso tipo 'cuánto vendo si hago una promo ahora', y eso lo habilitamos con el API de Model Serving para escenarios what-if. No como flujo primario.
>
> Esto también impacta costo significativamente: endpoints always-on son 3-5x más caros que batch scoring semanal para el mismo volumen."

### P10: "¿Cómo manejan el cold start para nuevos productos (NPI)?"
**Respuesta:**
> "Es uno de los problemas más difíciles en forecasting. Nuestra estrategia tiene tres capas: primero, priors a nivel de categoría — si lancemos una zapatilla running negra talla 42, usamos el patrón de demanda promedio de esa categoría para los primeros meses. Segundo, similitud de atributos — usando embeddings de características del producto (color, precio, género, categoría) para encontrar los productos históricos más similares y transferir su perfil de demanda. Tercero, para grandes lanzamientos con datos de pre-orden, los orders books dan una señal de demanda capturada antes del lanzamiento.
>
> El target de NPI es MAPE < 30% en las primeras 8 semanas. Es una barra más baja que para productos establecidos, y es honesta con la incertidumbre real del cold start."

### P11: "¿Qué pasa si la calidad de datos de SAP es mala?"
**Respuesta:**
> "Buen pregunta — y es el riesgo más probable en la realidad. Nuestra arquitectura está diseñada específicamente para esto. Bronze es append-only y raw: guardamos exactamente lo que llega de SAP sin transformar. Eso nos protege: si los datos de SAP tienen errores, podemos reprocessar Silver y Gold una vez que los errores estén corregidos, sin perder la fuente original.
>
> Las DLT Expectations en Silver son el mecanismo de defensa activo: nulos en campos críticos, referencias a product master inexistentes, valores fuera de rango — todo se detecta, se logea, y se enruta a una dead-letter table para investigación. Los planners ven en tiempo real qué porcentaje de registros pasó los quality gates.
>
> El mensaje para el equipo de IT y SAP Basis es: necesitamos su colaboración en las primeras semanas para entender la estructura de los datos y calibrar los quality gates. No asumimos que SAP es perfecto."

### P12: "¿Cómo garantizan la reproducibilidad de los modelos?"
**Respuesta:**
> "MLflow Model Registry es el mecanismo central. Cada experimento de entrenamiento registra: versión del código (git commit), versión de los datos (Delta table version), hiperparámetros, métricas de validación, y el modelo serializado. Cualquier forecast producido en el pasado es reproducible apuntando a la versión de modelo y la versión de datos correspondiente.
>
> Para los pipelines de datos, usamos Delta time travel — cada versión de una tabla Gold tiene un timestamp y puede consultarse como estaba en cualquier momento histórico. Eso es auditabilidad completa del pipeline end-to-end."

---

## BLOQUE 3: PREGUNTAS DE LIDERAZGO Y EJECUCIÓN

### P13: "¿Cómo manejas a stakeholders que no quieren cambiar su proceso de forecasting?"
**Respuesta:**
> "La resistencia al cambio en forecasting es predecible y hay que planificarla. Los demand planners han construido su proceso actual durante años; decirles que están equivocados no funciona.
>
> Mi enfoque tiene tres pasos: primero, los involucro desde el diseño — los planners son quienes conocen las excepciones del negocio, las temporadas especiales, los eventos locales que ningún modelo captura automáticamente. El sistema que construimos tiene un módulo de override manual que les da control. Segundo, el shadow mode de 4 semanas: el modelo corre en paralelo con el proceso actual, y mostramos la comparación de accuracy semana a semana. El modelo se gana la confianza, no la exige. Tercero, empezamos con los SKUs más fáciles de predecir — categorías core, canales maduros — y expandimos gradualmente.
>
> El riesgo no es técnico: es organizacional. Y la solución es inversión en change management, no en ingeniería."

### P14: "¿Cómo priorizas si hay conflicto entre lo que pide Data Engineering y lo que pide Commercial o Supply Chain?"
**Respuesta:**
> "Los conflictos de prioridad son inevitables y la solución es claridad de proceso, no política.
>
> La estructura que propongo tiene data product owners por dominio — un dueño de datos en Demand Planning, uno en Commercial, uno en Supply Chain. Los conflictos escalan con una matrix de impacto: ¿cuántos usuarios afecta? ¿afecta un KPI de negocio o una necesidad operativa? ¿hay fecha límite de negocio?
>
> A nivel de Director, mi rol es arbitrar esos conflictos cuando no se resuelven en el equipo, y ser transparente con los stakeholders sobre las implicaciones de cada decisión de prioridad. Lo que no hago es dejar que la priorización sea implícita — si decidimos posponer algo, lo documentamos, comunicamos y acordamos."

### P15: "¿Cuánto tiempo tarda en haber valor visible para el negocio?"
**Respuesta:**
> "Hay dos hitos de valor antes del mes 7. En el mes 2-3, con el pipeline Bronze-to-Gold corriendo para Brasil y México, los planners tienen por primera vez un dashboard unificado de demanda cross-canal. No es ML todavía, pero ya es un salto enorme sobre el estado actual de spreadsheets.
>
> En el mes 5, el Unified Product Master completo les permite ver cuánto se vendió de un producto específico en todos los canales — algo que hoy no pueden hacer.
>
> El primer valor de ML — forecasts automatizados en producción — es el mes 7. Esa es la promesa central."

### P16: "¿Cómo manejas la deuda técnica en un equipo que está construyendo desde cero y con presión de entregar?"
**Respuesta:**
> "La deuda técnica gestionada conscientemente no es el problema — la deuda técnica acumulada sin visibilidad sí lo es.
>
> Mi práctica es: en cada sprint, reservamos un porcentaje del capacity para refactoring y documentación — no negociable, aunque haya presión de entrega. Cada pipeline que entra a producción tiene una ficha de arquitectura y un propietario nombrado. Las decisiones técnicas tomadas bajo presión (shortcuts) se documentan como 'decisiones deliberadas de deuda' con una fecha tentativa de resolución.
>
> El riesgo mayor en un greenfield como este es construir rápido y crear una plataforma que solo entiende el equipo original. Eso es un pasivo organizacional. La documentación y los standards desde el día 1 son la inversión."

### P17: "¿Tienes experiencia directa con Databricks?"
**Respuesta:**
> "Tengo experiencia con los conceptos de plataformas de lakehouse y las decisiones de arquitectura que rodean al stack de Databricks — arquitectura Medallion, Delta Lake, Unity Catalog, MLflow. He trabajado con pipelines de datos a escala y con infraestructura ML de producción.
>
> Lo que sería honesto decir es que el dominio de todos los detalles de configuración de Databricks se profundiza con el uso diario. Para eso el equipo que construiría con un Platform Engineer senior con experiencia específica en Databricks. Mi rol como Director es asegurar que la arquitectura sea correcta y que el equipo tenga las capacidades necesarias — no ser el experto de menor nivel en cada herramienta."

*(Nota: adapta esta respuesta a tu experiencia real. Si tienes más o menos experiencia en Databricks, ajusta el lenguaje.)*

### P18: "¿Cómo te aseguras de que el equipo de 10-12 personas rinde y entrega en timeline?"
**Respuesta:**
> "Tres principios: claridad de ownership, visibilidad de progreso, y cultura de decir 'no sé' sin miedo.
>
> Cada workstream del roadmap tiene un dueño nombrado. No hay ambigüedad de quién decide cuando hay un blocker. El seguimiento no es burocrático — es un Slack update diario + demo semanal real (no slides, código funcionando o datos en el sistema). Y un ambiente donde los ingenieros pueden decir 'esto va a tardar más de lo que estimé' sin represalia, porque la información temprana sobre riesgos es lo que permite replannear antes de que sea crítico."

---

## BLOQUE 4: PREGUNTAS TÉCNICAS DE GOVERNANCE Y COMPLIANCE

### P19: "¿Cómo funciona LGPD en la práctica dentro de esta arquitectura?"
**Respuesta:**
> "LGPD aplica principalmente a datos personales en clickstream y POS: customer_id, device_id, transaction IDs que pueden linkarse a personas.
>
> En Bronze: guardamos esos datos raw porque necesitamos la historia completa para reprocessing. El acceso está restringido al rol data_engineer con justificación de negocio.
>
> En Silver y Gold: aplicamos tokenización o enmascaramiento — el customer_id real nunca aparece en tablas Silver/Gold accesibles a planners o analistas. Unity Catalog dynamic views aplican el masking automáticamente según el rol del usuario.
>
> Residencia de datos: toda la plataforma corre en sa-east-1 (São Paulo). Los datos de Brasil no salen de esa región sin consentimiento explícito y control de transferencia cross-border.
>
> Para requests de acceso y eliminación (DSAR): Delta time travel facilita la identificación y el 'tombstoning' de registros de un individuo específico en todas las tablas donde aparece."

### P20: "¿Qué pasa si hay un data breach?"
**Respuesta:**
> "La arquitectura tiene cuatro capas de defensa. Preventiva: KMS encryption at rest en todos los buckets S3, TLS 1.2+ en tránsito, PrivateLink entre Databricks y AWS sin exposición a internet público. Detectiva: CloudTrail + Unity Catalog audit logs registran cada acceso con quién, qué, cuándo. Aislante: RBAC granular limita el blast radius — si una cuenta es comprometida, el atacante solo ve lo que ese rol tiene acceso. Responsiva: runbook de incident response con pasos de contención, notificación a reguladores (LGPD requiere notificación en 72 horas), y evidencia en logs para investigación forense."

---

## BLOQUE 5: PREGUNTAS DE CONTEXTO Y VISIÓN

### P21: "¿Cómo ves esto evolucionando en 3 años?"
**Respuesta:**
> "En 3 años veo tres evoluciones naturales. Primero, de forecasting a planificación integrada: la plataforma conecta forecasts con supply chain en tiempo real, habilitando replenishment automatizado con menos intervención manual. Segundo, democratización: más equipos de negocio usando el dato directamente a través del self-service portal, no solo demand planning. Tercero, inteligencia de mercado: los modelos en LAM empiezan a incorporar señales de competidores, trends de redes sociales, y datos alternativos — evolucionando de forecasting reactivo a proactivo.
>
> El activo más valioso que construimos en el año 1 no es el modelo de ML — es el dataset histórico unificado y el Unified Product Master. Eso se convierte en el fundamento de cualquier caso de uso analítico que adidas LAM quiera construir después."

### P22: "¿Qué harías diferente si el presupuesto fuera la mitad?"
**Respuesta:**
> "Priorizaría la capa de datos sobre la capa de ML. Bronze-to-Gold pipeline y el Unified Product Master son el 80% del valor. Un modelo estadístico simple (Prophet) corriendo sobre datos bien limpios supera a un modelo sofisticado corriendo sobre datos sucios.
>
> Con presupuesto restringido: Fases 0, 1, y 2 básica (modelos estadísticos, no deep learning). Postergamos Fase 3 (DL, ensemble) y Fase 4 (full LAM) al año 2. El self-service portal también sería year 2.
>
> El team sería más pequeño: 1 Platform Engineer, 1 Data Architect, 1-2 Data Engineers, 1 ML Engineer. Sin BI Developer en Fase 1 — empezamos con SQL queries directas antes de construir dashboards."

### P23: "¿Qué tres cosas harías en los primeros 90 días como Director?"
**Respuesta:**
> "Primero: escucha activa. Primeros 30 días hablando con demand planners, supply chain, commercial, IT y SAP Basis para entender los pain points reales, no los asumidos. El diseño que propongo puede necesitar ajustes una vez conozca el contexto específico de adidas LAM desde adentro.
>
> Segundo: infraestructura y equipo. Días 30-60: kickoff de Phase 0, provisionar los ambientes AWS/Databricks, contratar los primeros perfiles críticos (Platform Engineer, Data Architect). Sin fundación no hay nada.
>
> Tercero: primer quick win visible. Días 60-90: un dashboard de demanda básico — aunque sea solo Brasil, solo eCommerce — que muestre a los stakeholders que la plataforma está produciendo algo. Construir confianza organizacional en el equipo y en el proyecto temprano."

---

## BLOQUE 6: PREGUNTAS TRAMPA O INESPERADAS

### P24: "¿No está Databricks muy caro para LAM?"
**Respuesta:**
> "El costo de la plataforma es $22K-$31K/mes en steady state. El costo relevante no es el precio de la plataforma — es el costo de no tenerla.
>
> Cada punto de WMAPE de exceso sobre el 20% objetivo se traduce en inventario inmovilizado innecesario. Para la escala de adidas LAM, eso representa decenas de millones de dólares en capital de trabajo. La plataforma se paga sola.
>
> Dicho eso, $22K-$31K/mes incluye todas las optimizaciones de costo que propongo: 70% spot instances, SQL serverless, scale-to-zero para Model Serving. Sin esas optimizaciones el costo sería significativamente mayor."

### P25: "¿Cómo compara tu propuesta con lo que hacen otras regiones de adidas?"
**Respuesta:**
> "No tengo visibilidad directa de lo que hacen otras regiones en detalle. Lo que sí sé es que la elección de plataforma (Databricks + AWS + Medallion) es corporativa, lo que sugiere que hay patrones establecidos a nivel global. LAM tiene especificidades que justifican adaptar esos patrones: la heterogeneidad de mercados, las regulaciones específicas de Brasil/México/Argentina, y los canales B2B con visibilidad limitada de datos (Franchise).
>
> Si en el proceso de onboarding encontrara que hay un playbook global establecido, mi primer paso sería entenderlo profundamente antes de proponer variaciones. Es más eficiente aprender de lo que ya funciona."

### P26: "¿Cuánto tiempo lleva construir el Unified Product Master?"
**Respuesta:**
> "Es la actividad más larga y más riesgosa de la Fase 1. El proceso técnico de entity resolution toma 3-4 semanas. Pero la validación del negocio — que el equipo de Product Data revise los matches, corrija errores, construya la tabla de mapping manual — es un proceso iterativo que puede tomar 6-8 semanas con dedicación parcial del equipo.
>
> El plan contempla esto: la ingesta de SAP (Fivetran) empieza en semana 5, y el Unified Product Master tiene 4 semanas dedicadas de construcción + validación. El match rate del 95% es el exit criteria de esta fase, no una aspiración."

### P27: "¿Y si los datos de Franchise son tan limitados que el modelo no aprende nada?"
**Respuesta:**
> "Franchise es el canal más difícil y lo reconozco en la estrategia. La solución de modelo para Franchise no es deep learning — es statistical methods con priors jerárquicos: el modelo de Franchise de una categoría 'aprende' del patrón de Retail de esa misma categoría en el mismo país.
>
> El target de accuracy para Franchise es WMAPE ≤24%, más generoso que los otros canales, porque la limitación de datos es real. Eso es honesto con el negocio. Y el objetivo a mediano plazo (Fase 3) es extender el acceso a datos de sell-out de franquiciados — que hoy no existe — para mejorar progresivamente esa capa."

### P28: "¿Por qué no usar una solución out-of-the-box como Anaplan o Blue Yonder para forecasting?"
**Respuesta:**
> "Anaplan y Blue Yonder son soluciones válidas para empresas que quieren velocidad de implementación sobre personalización. Para adidas LAM el contexto es diferente por tres razones: primero, la decisión de plataforma ya está tomada (Databricks + AWS) — integrar un sistema SaaS externo añade complejidad y costos de integración. Segundo, la diversidad de canales y mercados en LAM requiere un nivel de customización (modelos por canal, features específicas, regulaciones locales) que las soluciones out-of-the-box sirven mal. Tercero, y más importante desde la perspectiva de largo plazo: construir el capability in-house crea un activo organizacional — datos limpios, modelos entrenados, equipo capacitado — que tiene valor más allá del forecasting. No es solo un software; es una capacidad analítica de adidas LAM."

### P29: "¿Puedes explicarme WMAPE en términos que yo pueda entender?"
*(Para cuando un C-level no técnico lo pregunta)*
**Respuesta:**
> "WMAPE es la medida de qué tan lejos están nuestros pronósticos de la realidad, ponderada por el volumen de cada producto. En palabras simples: si pronosticamos vender 100 unidades de una zapatilla y vendemos 80, nuestro error en ese producto es 20%. El WMAPE promedia eso a través de todos los productos, dándole más peso a los que generan más revenue.
>
> Actualmente, adidas LAM está en aproximadamente 35-40% de error promedio. Nuestra propuesta apunta a <20% en 12 meses. Para que eso sea concreto: si hoy la diferencia entre lo que pronosticamos y lo que realmente necesitamos es de $10M en inventario mal distribuido, con WMAPE <20% esa diferencia se reduce a menos de $5M — eso es capital que se libera o se aplica donde realmente se necesita."

### P30: "Si tuvieras que poner en riesgo una de las 4 fases, ¿cuál sería?"
**Respuesta:**
> "Fase 4 es la más sacrificable sin impactar el valor central. El self-service portal y la expansión a Chile y Perú son valiosos, pero no son críticos para el ROI principal. Las dos primeras fases (datos correctos + ML para Brasil y México, que son los mercados de mayor volumen) capturan la mayor parte del impacto.
>
> Lo que no sacrificaría nunca es la Fase 0 — la infraestructura y governance. Un ahorro en la fundación es el error clásico que termina costando el doble cuando tienes que refactorizar una plataforma productiva."

---

## PREGUNTAS QUE TÚ DEBERÍAS HACER AL PANEL

Cuando te digan "¿tienes preguntas para nosotros?", estas demuestran pensamiento estratégico:

1. **"¿Cuál es la mayor frustración que tienen hoy los demand planners con el proceso actual?"** — Muestra que entiendes que la adopción del usuario es tan importante como la tecnología.

2. **"¿Tienen ya definido el presupuesto de equipo e infraestructura para esta iniciativa, o ese dimensionamiento es parte de lo que esperan que proponga?"** — Muestra que piensas en viabilidad, no solo en diseño.

3. **"¿Qué tan integrado está el equipo de datos con el equipo de supply chain y planeación comercial hoy? ¿Hay embajadores del negocio que trabajen cerca del área de datos?"** — Muestra que entiendes que el éxito no es solo técnico.

4. **"¿Hay alguna decisión de arquitectura global de adidas con la que esta propuesta pudiera estar en tensión?"** — Muestra que piensas en el contexto más amplio.

---

## CHEAT SHEET FINAL (para releer 10 minutos antes)

- **El problema**: spreadsheets, silos, T+2-T+5, WMAPE ~38%
- **La plataforma**: Databricks Lakehouse + AWS + Medallion (Bronze/Silver/Gold)
- **La clave técnica**: Unified Product Master → feature store → hybrid ML ensemble
- **La clave de governance**: Unity Catalog → RBAC granular → LGPD/LFPDPPP/Ley 25.326
- **El costo**: $22K-$31K/mes steady state, equipo de 10-12
- **Primer valor**: Mes 7 (ML forecasts Brasil eComm + Retail)
- **Target 12 meses**: WMAPE <20%, 95% cobertura, 80% adopción
- **Stakeholder approach**: shadow mode 4 semanas, data product owners por dominio
- **Si no sabes algo**: "No tengo ese dato específico, pero el modelo de cálculo que aplicaría es…"
