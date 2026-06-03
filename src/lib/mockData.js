export const MOCK_LOGS = [
  { id: 1, ts: '2025-05-25T12:03:21Z', level: 'ERROR', service: 'payment-svc', message: 'PaymentGatewayTimeout: stripe API call exceeded 30s threshold', meta: { txn_id: 'txn_8821', duration_ms: 30412 } },
  { id: 2, ts: '2025-05-25T12:03:22Z', level: 'ERROR', service: 'payment-svc', message: 'PaymentGatewayTimeout: retry #1 failed for txn_id=txn_8821', meta: { retry: 1, txn_id: 'txn_8821' } },
  { id: 3, ts: '2025-05-25T12:03:45Z', level: 'ERROR', service: 'payment-svc', message: 'DB connection pool exhausted: max_connections=20 reached', meta: { pool_size: 20, waiting: 47 } },
  { id: 4, ts: '2025-05-25T12:04:01Z', level: 'WARN',  service: 'payment-svc', message: 'Circuit breaker OPEN on payment-gateway after 5 consecutive failures', meta: { failures: 5, state: 'OPEN' } },
  { id: 5, ts: '2025-05-25T12:04:12Z', level: 'ERROR', service: 'payment-svc', message: 'PaymentGatewayTimeout: txn_id=txn_8834 rejected — circuit breaker open', meta: { txn_id: 'txn_8834' } },
  { id: 6, ts: '2025-05-25T12:04:33Z', level: 'ERROR', service: 'payment-svc', message: 'PaymentGatewayTimeout: txn_id=txn_8841 rejected — circuit breaker open', meta: { txn_id: 'txn_8841' } },
  { id: 7, ts: '2025-05-25T12:05:00Z', level: 'INFO',  service: 'payment-svc', message: 'HealthCheck: p99_latency=1160ms (SLA threshold: 500ms) — BREACH', meta: { p99: 1160, sla: 500 } },
  { id: 8, ts: '2025-05-25T12:05:15Z', level: 'ERROR', service: 'payment-svc', message: 'PaymentGatewayTimeout: txn_id=txn_8849 failed after max retries=3', meta: { txn_id: 'txn_8849', retries: 3 } },
  { id: 9, ts: '2025-05-25T12:05:30Z', level: 'WARN',  service: 'checkout-api', message: 'Upstream payment-svc responding slowly, increasing client timeout', meta: { upstream_latency: 980 } },
  { id: 10,ts: '2025-05-25T12:06:00Z', level: 'ERROR', service: 'checkout-api', message: 'HTTP 503 from payment-svc: Service Unavailable', meta: { status: 503 } },
  { id: 11,ts: '2025-05-25T12:06:45Z', level: 'INFO',  service: 'auth-svc',    message: 'Token validation successful for user_id=usr_4421', meta: { user_id: 'usr_4421' } },
  { id: 12,ts: '2025-05-25T12:07:00Z', level: 'ERROR', service: 'payment-svc', message: 'SlowQuery detected: SELECT * FROM transactions WHERE status=pending took 8.2s', meta: { query_ms: 8200, table: 'transactions' } },
];

export const MOCK_DEPLOYMENTS = [
  { id: 'd1', version: 'v2.3.1', service: 'payment-svc', time: '2025-05-25T10:01:00Z', timeLabel: '10:01 UTC — 2h 14m ago', author: 'Priya Sharma', status: 'incident', changes: 'Refactored DB connection pool: max_pool_size changed 50→20 (unintentional)', commit: 'a7f3c91', pr: '#482' },
  { id: 'd2', version: 'v4.1.0', service: 'auth-svc',    time: '2025-05-25T06:45:00Z', timeLabel: '06:45 UTC — 5h 30m ago', author: 'Arjun Mehta',  status: 'healthy',  changes: 'JWT expiry config updated, RS256 signing enabled', commit: 'b2e9d44', pr: '#479' },
  { id: 'd3', version: 'v1.9.2', service: 'checkout-api',time: '2025-05-24T16:20:00Z', timeLabel: 'Yesterday 16:20 UTC',    author: 'Sofia Chen',   status: 'warning',  changes: 'Cache TTL tuned from 60s to 300s, minor latency increase noted', commit: 'c5f8a12', pr: '#471' },
  { id: 'd4', version: 'v3.0.5', service: 'notification-svc', time: '2025-05-24T09:00:00Z', timeLabel: 'Yesterday 09:00 UTC', author: 'Ravi Kumar', status: 'healthy', changes: 'Email template engine upgraded to v3', commit: 'd1c7b88', pr: '#468' },
];

export const MOCK_METRICS = {
  payment_svc: { p50: 480, p95: 890, p99: 1160, error_rate: 18.4, rps: 340, circuit_breaker: 'OPEN', db_pool_used: 20, db_pool_max: 20, db_timeouts_per_min: 130 },
  auth_svc:    { p50: 12,  p95: 28,  p99: 45,   error_rate: 0.02, rps: 890, circuit_breaker: 'CLOSED' },
  checkout_api:{ p50: 220, p95: 510, p99: 780,  error_rate: 4.1,  rps: 290, circuit_breaker: 'HALF_OPEN' },
};

export const MOCK_SERVICES = [
  { name: 'payment-svc',       status: 'degraded', health: 38, uptime: '99.1%', region: 'ap-south-1', instances: 3 },
  { name: 'auth-svc',          status: 'healthy',  health: 98, uptime: '99.98%',region: 'ap-south-1', instances: 4 },
  { name: 'checkout-api',      status: 'warning',  health: 72, uptime: '99.4%', region: 'ap-south-1', instances: 2 },
  { name: 'notification-svc',  status: 'healthy',  health: 99, uptime: '99.99%',region: 'ap-south-1', instances: 2 },
  { name: 'inventory-svc',     status: 'healthy',  health: 95, uptime: '99.9%', region: 'ap-south-1', instances: 3 },
];

export const MOCK_DOCS = {
  readme: `## Payment Service

### Prerequisites
- Node.js 14+
- PostgreSQL 12
- Redis 5

### Running locally
\`\`\`bash
npm install
npm start
\`\`\`

### Configuration
- Port: 3000
- DB: postgresql://localhost:5432/payments
- Redis: redis://localhost:6379

### Environment variables
STRIPE_KEY=sk_test_xxx
DB_MAX_POOL=50`,
  actual: `{
  "engines": { "node": ">=18" },
  "scripts": {
    "start": "echo 'Deprecated: use npm run dev'",
    "dev": "ts-node-esm src/index.ts",
    "build": "tsc --outDir dist"
  }
}

# .env.example
PORT=4000
DATABASE_URL=postgresql://localhost:5432/payments_v2
REDIS_URL=redis://localhost:6379/1
STRIPE_SECRET_KEY=sk_live_xxx
DB_MAX_POOL=20
NODE_ENV=development
REQUIRE_AUTH=true`
};

export const TIMELINE_EVENTS = [
  { type: 'green',  time: '10:01 UTC', label: 'Deployment v2.3.1 pushed to production (payment-svc)' },
  { type: 'amber',  time: '10:04 UTC', label: 'DB connection pool utilization crossed 80% threshold' },
  { type: 'amber',  time: '10:07 UTC', label: 'DB pool fully exhausted (20/20 connections held)' },
  { type: 'red',    time: '10:09 UTC', label: 'First PaymentGatewayTimeout errors — rate 2→130/min' },
  { type: 'red',    time: '10:11 UTC', label: 'p99 latency SLA breach: 340ms → 1160ms (+241%)' },
  { type: 'red',    time: '10:13 UTC', label: 'Circuit breaker OPEN on payment-gateway (5 failures)' },
  { type: 'amber',  time: '10:15 UTC', label: 'Checkout API begins returning HTTP 503 to users' },
  { type: 'blue',   time: '10:18 UTC', label: 'PagerDuty alert fired — incident P1 opened' },
];
