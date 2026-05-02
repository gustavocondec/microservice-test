# AGENTS Guide

Este archivo define la estructura y las reglas que deben seguir los agentes o desarrolladores al modificar este monorepo.

## Objetivo

- Mantener el monorepo consistente.
- Evitar complejidad innecesaria.
- Respetar una clean architecture ligera.
- Separar claramente dominio, aplicación e infraestructura.

## Estructura del repositorio

```text
apps/
  accounts-service/
  transactions-service/
  ai-service/
libs/
  contracts/
  shared/
```

## Estructura obligatoria por microservicio

Cada servicio en `apps/*` debe seguir esta base:

```text
src/
  domain/
    errors/
  application/
    services/
    ports/           # solo si el servicio necesita adaptadores externos
  infrastructure/
    http/
      dto/
    messaging/
    persistence/
      entities/
      migrations/
  app.module.ts
  main.ts
```

## Responsabilidad por capa

### `domain`

- Contiene reglas de negocio puras y errores de dominio.
- No debe depender de NestJS, TypeORM, Kafka ni HTTP.
- No colocar lógica de transporte o persistencia aquí.

### `application`

- Contiene casos de uso y servicios de aplicación.
- Orquesta entidades, repositorios, eventos y validaciones.
- Puede depender de puertos o contratos, pero no debe contener detalles de framework.

### `infrastructure`

- Contiene todo lo técnico:
  - controladores HTTP
  - DTOs
  - consumidores/publicadores Kafka
  - entidades TypeORM
  - migraciones
  - proveedores externos o mocks
- Aquí vive la integración con NestJS, PostgreSQL y Kafka.

## Librerías compartidas

### `libs/contracts`

Usar esta librería para:

- nombres de tópicos Kafka
- enums compartidos
- payloads de eventos
- contratos públicos entre servicios

No poner utilidades técnicas aquí.

### `libs/shared`

Usar esta librería solo para:

- configuración común
- bootstrap de base de datos
- utilidades de mensajería
- idempotencia de eventos
- helpers técnicos reutilizables

No poner lógica bancaria aquí.

## Reglas de diseño

- Cada microservicio es dueño de su base de datos.
- Ningún servicio debe escribir en la base de datos de otro.
- `accounts-service` es dueño del saldo.
- `transactions-service` es dueño del estado de la transacción.
- `ai-service` solo interpreta eventos; no ejecuta lógica bancaria.
- La comunicación entre servicios debe ser event-driven vía Kafka.
- Evitar patrones complejos que no aporten al reto: no agregar CQRS, event sourcing, sagas complejas ni módulos genéricos excesivos.

## Reglas de implementación

- Si agregas un endpoint nuevo:
  - crear DTO en `infrastructure/http/dto`
  - exponer controlador en `infrastructure/http`
  - delegar la lógica al servicio de `application`
- Si agregas un evento nuevo:
  - declarar tópico y payload en `libs/contracts`
  - crear publisher/consumer en `infrastructure/messaging`
  - manejar idempotencia cuando sea consumo crítico
- Si agregas persistencia nueva:
  - crear entidad en `infrastructure/persistence/entities`
  - crear migración en `infrastructure/persistence/migrations`
  - registrar ambas en `app.module.ts`
- Si agregas integración externa:
  - definir puerto en `application/ports`
  - implementar adaptador en `infrastructure`

## Convenciones

- Mantener nombres explícitos y simples.
- Preferir servicios pequeños con una responsabilidad clara.
- Validaciones HTTP en DTOs.
- Reglas de negocio en `application` o `domain`, no en controladores.
- No llamar Kafka directamente desde controladores.
- No duplicar contratos de eventos entre servicios.
- No introducir dependencias nuevas sin necesidad real.

## Pruebas

Cada cambio debería considerar:

- prueba unitaria para la regla de negocio afectada
- prueba e2e si cambia el contrato HTTP
- prueba del consumidor si cambia el comportamiento orientado a eventos

## Qué evitar

- lógica bancaria dentro de `ai-service`
- acceso directo entre bases de datos
- utilidades genéricas abstractas sin uso real
- carpetas adicionales si no agregan claridad
- mover reglas de negocio a controladores o entidades TypeORM

## Cómo extender el sistema

Si se agrega un nuevo caso de uso:

1. definir contrato si afecta eventos o tipos compartidos
2. crear/ajustar DTO HTTP si aplica
3. implementar caso de uso en `application/services`
4. agregar persistencia o mensajería en `infrastructure`
5. cubrir con pruebas
6. actualizar `README.md` si cambia el comportamiento público

## Archivos de referencia

- `README.md`: documentación técnica y operativa
- `PLAN.md`: plan de implementación acordado
- `docker-compose.yml`: infraestructura local
- `libs/contracts/src/*`: contratos compartidos
