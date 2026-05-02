# Plan de solución del reto Arkano

## Resumen

- Construir un monorepo con NestJS para tres microservicios: `accounts-service`, `transactions-service` y `ai-service`.
- Usar PostgreSQL con una base independiente por servicio.
- Usar Kafka como bus de eventos obligatorio.
- Mantener una clean architecture ligera: `domain`, `application` e `infrastructure`.
- Resolver el microservicio LLM con un proveedor mock intercambiable por uno real.

## Monorepo e infraestructura

- Estructura raíz con `apps/*` y `libs/*`.
- `libs/contracts` para contratos de eventos, enums y tópicos Kafka.
- `libs/shared` para utilidades técnicas mínimas: configuración, bootstrap de DB, idempotencia y cliente Kafka.
- `docker compose` como modo principal de ejecución.
- Kafka en modo KRaft.
- Tres contenedores PostgreSQL: uno para cuentas, uno para transacciones y uno para AI.
- Un contenedor `kafka-init` que crea los tópicos antes de iniciar los servicios.

## Accounts Service

- Responsabilidad: clientes, cuentas y saldos.
- Endpoints:
  - `POST /clients`
  - `POST /accounts`
  - `GET /accounts/:accountId`
  - `GET /clients/:clientId/accounts`
  - `GET /health`
- Reglas:
  - una cuenta pertenece a un cliente existente
  - saldo inicial no negativo
  - saldo nunca menor a cero
- Eventos publicados:
  - `client.created`
  - `account.created`
  - `balance.updated`
  - `transaction.completed`
  - `transaction.rejected`
- Evento consumido:
  - `transaction.requested`

## Transactions Service

- Responsabilidad: registrar depósitos, retiros y transferencias y seguir su estado.
- Endpoints:
  - `POST /transactions`
  - `GET /transactions/:transactionId`
  - `GET /health`
- Flujo:
  - guarda la transacción en estado `PENDING`
  - valida `idempotencyKey`
  - publica `transaction.requested`
  - consume `transaction.completed` o `transaction.rejected`
  - actualiza a `COMPLETED` o `REJECTED`
- Reglas:
  - evitar duplicados por `idempotencyKey`
  - no mover saldo directamente
  - delegar la mutación de saldo a `accounts-service`

## AI Service

- Responsabilidad: traducir eventos técnicos a mensajes comprensibles y resumir historial.
- Endpoints:
  - `GET /explanations/transactions/:transactionId`
  - `GET /summaries/accounts/:accountId`
  - `GET /health`
- Eventos consumidos:
  - `transaction.completed`
  - `transaction.rejected`
- Estrategia:
  - persistir insights en su propia base
  - generar explicación con `MockLlmProvider`
  - dejar un puerto (`LlmPort`) listo para reemplazar el proveedor

## Contratos públicos

- Payload mínimo de transacción:
  - `type`: `DEPOSIT | WITHDRAW | TRANSFER`
  - `amount`
  - `sourceAccountId` cuando aplica
  - `targetAccountId` cuando aplica
  - `idempotencyKey`
- Metadata común de eventos:
  - `eventId`
  - `eventType`
  - `occurredAt`
  - `correlationId`
- Tópicos Kafka:
  - `client.created`
  - `account.created`
  - `balance.updated`
  - `transaction.requested`
  - `transaction.completed`
  - `transaction.rejected`

## Idempotencia y fallos

- `transactions-service` usa unicidad por `idempotencyKey`.
- Los consumidores críticos usan tabla `processed_events`.
- Los errores de negocio terminan en `transaction.rejected`.
- Los errores técnicos quedan como fallos retriables del consumidor/broker.

## Persistencia

- PostgreSQL en los tres servicios.
- TypeORM como ORM.
- Migraciones incluidas y ejecutadas al arranque.

## Pruebas

- Unitarias:
  - saldo inicial inválido
  - cliente inexistente al crear cuenta
  - retiro con fondos insuficientes
  - transferencia válida
  - deduplicación por `idempotencyKey`
  - explicación mock y resumen determinístico
- E2E:
  - contratos HTTP de los tres servicios
  - flujo funcional smoke de transferencia

## Documentación esperada

- README con arquitectura general
- descripción del bus de eventos
- flujo de transferencia
- rol del microservicio LLM
- instrucciones de ejecución con Docker
