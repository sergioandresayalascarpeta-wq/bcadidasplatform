# Technical Q&A + Flashcards (adidas LAM)

Este documento es una guía rápida para:
- Entender requerimientos técnicos en lenguaje simple
- Tener respuestas cortas para preguntas difíciles
- Practicar con flashcards antes de la presentación

## 1) Traducción simple del requerimiento

### A. Integración con AWS (S3, MSK/Kinesis, Lambda, cross-account/cross-region)
Cuando piden esto, te están pidiendo explicar:
- **Dónde vive el dato** (`S3`: raw/bronze/silver/gold, checkpoints, logs)
- **Cómo llega en streaming** (`MSK/Kinesis`: POS, eCommerce events)
- **Qué dispara procesos automáticamente** (`Lambda`: eventos de llegada de archivos o señales)
- **Cómo se comparte entre cuentas AWS** (cross-account: IAM roles, bucket policies, acceso controlado)
- **Cómo se opera entre regiones** (cross-region: residencia de datos, latencia, DR, replicación selectiva)

Respuesta corta de speaker:
> "El flujo es S3 como lake, MSK/Kinesis para streaming, Lambda para triggers event-driven. Diseñamos políticas cross-account para compartir datos de forma segura entre dominios y reglas cross-region para cumplir residencia de datos y continuidad operativa en LAM."

### B. Escalabilidad, tolerancia a fallos y costo
Te piden demostrar que la plataforma:
- Escala de 2 países a toda LAM sin rediseñar
- Sigue operando aunque falle una fuente/job/stream
- Optimiza gasto con políticas y autoescalado

Puntos clave:
- **Escalabilidad:** particionado por país/canal/fecha, plantillas reutilizables por mercado
- **Fault tolerance:** checkpoints, retries, dead-letter handling, reprocess desde Bronze
- **Costo:** cluster policies, autoscaling, spot + on-demand, auto-termination, SQL serverless

Respuesta corta de speaker:
> "Escalamos por diseño con particiones y despliegues templateados; mantenemos resiliencia con checkpoints/retries/reprocess; y controlamos costo con cluster policies, autoscaling y estrategia spot/on-demand."

### C. Estrategia de cómputo separada (ETL vs ML training vs serving)
Te piden que no mezcles cargas distintas en el mismo cómputo:
- **ETL:** Jobs Clusters / DLT (efímeros, programados)
- **BI:** SQL Warehouses (aislados para analítica)
- **ML training:** clusters de ML (CPU/GPU según modelo)
- **Serving/inference:** Model Serving endpoints (what-if), batch scoring para forecast semanal

Respuesta corta de speaker:
> "Separamos computación por tipo de carga: ETL en jobs, entrenamiento ML en clusters dedicados, BI en SQL Warehouses y serving en endpoints. Eso mejora performance, evita competencia de recursos y reduce costos."

## 2) Mapa de carpetas del proyecto (rápido de memorizar)

```text
bcadidas/
├─ README.md
├─ notebooklm-output-and-presentation.md
├─ 01-architecture/
│  ├─ architecture-diagram.md
│  ├─ data-flow-detail.md
│  └─ infrastructure-diagram.md
├─ 02-technical-proposal/
│  └─ technical-proposal.md
├─ 03-roadmap/
│  └─ roadmap.md
├─ 04-presentation/
│  ├─ presentation.md
│  └─ speaker-notes.md
└─ 05-study/
   └─ technical-qa-flashcards.md
```

## 3) Flashcards (Q/A)

### Flashcard 1
**Q:** ¿Por qué S3 en esta arquitectura?  
**A:** Porque es el data lake central para Bronze/Silver/Gold, con alta durabilidad, costo eficiente y buena integración con Delta/Databricks.

### Flashcard 2
**Q:** ¿Cuándo usar MSK vs Kinesis?  
**A:** MSK para streams estructurados con mayor control Kafka; Kinesis para ingestión masiva AWS-native (ej. clickstream).

### Flashcard 3
**Q:** ¿Para qué Lambda en este caso?  
**A:** Para disparar pipelines o validaciones ante eventos (ej. archivo nuevo en S3), evitando procesos manuales.

### Flashcard 4
**Q:** ¿Qué es cross-account?  
**A:** Compartir/consumir datos y servicios entre cuentas AWS distintas con IAM roles/policies seguras.

### Flashcard 5
**Q:** ¿Qué es cross-region?  
**A:** Operar/replicar entre regiones para residencia de datos, menor latencia regional y continuidad ante fallas.

### Flashcard 6
**Q:** ¿Cómo diseñamos escalabilidad para LAM?  
**A:** Particionado por país/canal/fecha, pipelines parametrizados por mercado y autoescalado de cómputo.

### Flashcard 7
**Q:** ¿Cómo garantizamos tolerancia a fallos?  
**A:** Checkpoints, retries, dead-letter handling y reprocessing desde Bronze (source of truth).

### Flashcard 8
**Q:** ¿Cómo optimizamos costo?  
**A:** Cluster policies, autoscaling, spot + on-demand, auto-termination y SQL serverless para consumo BI.

### Flashcard 9
**Q:** ¿Por qué separar ETL, training y serving?  
**A:** Porque tienen patrones de uso distintos; separarlos evita contención, mejora SLA y optimiza costo.

### Flashcard 10
**Q:** ¿Qué compute type para ETL?  
**A:** Jobs Clusters / DLT, efímeros y agendados.

### Flashcard 11
**Q:** ¿Qué compute type para BI?  
**A:** SQL Warehouses dedicados.

### Flashcard 12
**Q:** ¿Qué compute type para inferencia?  
**A:** Batch scoring para forecast semanal + Model Serving endpoints para escenarios what-if.

## 4) Puntos técnicos para enfatizar en Q&A (speaker cheat sheet)

- "No hacemos 'real-time forecasting' porque el negocio consume ciclo semanal; sí hacemos near real-time ingestion para mejor frescura."
- "Bronze append-only es el seguro operativo: si algo falla en Silver/Gold, re-procesamos sin pérdida."
- "Unity Catalog es la columna vertebral de gobernanza: RBAC fino, lineage y audit."
- "El diseño multi-país se apoya en parametrización por `country_code`, no en pipelines aislados por país."
- "La separación de cómputo evita que entrenamientos pesados afecten ETL o BI."

## 5) Mini guion de 45 segundos (si te preguntan por arquitectura)

> "La plataforma usa S3 como data lake central, MSK/Kinesis para streaming y Lambda para activación event-driven. Opera con arquitectura Medallion para garantizar calidad progresiva y re-procesamiento confiable desde Bronze. A escala LAM, resolvemos crecimiento y resiliencia con particionado, autoscaling y estrategias de fault tolerance. En costos, aplicamos cluster policies, spot/on-demand y separación de cómputo entre ETL, entrenamiento ML e inferencia, usando Jobs Clusters, SQL Warehouses y Model Serving según cada carga."

