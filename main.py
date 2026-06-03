# # """
# # OpsCopilot FastAPI Backend
# # Handles: CloudWatch queries, Gemini query generation, log fetching, intent extraction
# # """

# # import os
# # import time
# # import json
# # import asyncio
# # from datetime import datetime, timezone
# # from typing import Optional

# # import boto3
# # import google.generativeai as genai
# # from fastapi import FastAPI, HTTPException
# # from fastapi.middleware.cors import CORSMiddleware
# # from pydantic import BaseModel
# # from dotenv import load_dotenv

# # load_dotenv()

# # # ── Config ────────────────────────────────────────────────────────────────────
# # GEMINI_API_KEY  = os.getenv("VITE_GEMINI_API_KEY")
# # AWS_REGION      = os.getenv("VITE_AWS_REGION", "ap-south-1")
# # AWS_ACCESS_KEY  = os.getenv("VITE_AWS_ACCESS_KEY_ID")
# # AWS_SECRET_KEY  = os.getenv("VITE_AWS_SECRET_ACCESS_KEY")
# # LOG_GROUP       = os.getenv("VITE_AWS_LOG_GROUP", "/aws/ecs/payment-service")
# # USE_MOCK        = os.getenv("USE_MOCK_DATA", "true").lower() == "true"

# # # ── Init ──────────────────────────────────────────────────────────────────────
# # app = FastAPI(title="OpsCopilot API", version="2.0.0")

# # app.add_middleware(
# #     CORSMiddleware,
# #     allow_origins=["http://localhost:5173", "http://localhost:4173"],
# #     allow_methods=["*"],
# #     allow_headers=["*"],
# # )

# # if GEMINI_API_KEY:
# #     genai.configure(api_key=GEMINI_API_KEY)
# #     gemini = genai.GenerativeModel("gemini-2.5-flash")
# # else:
# #     gemini = None

# # # def get_cw_client():
# # #     return boto3.client(
# # #         "logs",
# # #         region_name=AWS_REGION,
# # #         aws_access_key_id=AWS_ACCESS_KEY,
# # #         aws_secret_access_key=AWS_SECRET_KEY,
# # #     )

# # def get_cw_client():
# #     return boto3.client(
# #         "logs",
# #         region_name=AWS_REGION,
# #         aws_access_key_id=AWS_ACCESS_KEY,
# #         aws_secret_access_key=AWS_SECRET_KEY,
# #         verify=False
# #     )

# # # ── Mock data (fallback when USE_MOCK=true or AWS creds missing) ───────────────
# # MOCK_LOGS = [
# #     {"timestamp": "2025-05-25T12:03:21Z", "level": "ERROR", "service": "payment-svc", "message": "PaymentGatewayTimeout: stripe API call exceeded 30s threshold, txn_id=txn_8821"},
# #     {"timestamp": "2025-05-25T12:03:22Z", "level": "ERROR", "service": "payment-svc", "message": "PaymentGatewayTimeout: retry #1 failed, txn_id=txn_8821"},
# #     {"timestamp": "2025-05-25T12:03:45Z", "level": "ERROR", "service": "payment-svc", "message": "DB connection pool exhausted: max_connections=20 reached, waiting=47"},
# #     {"timestamp": "2025-05-25T12:04:01Z", "level": "WARN",  "service": "payment-svc", "message": "Circuit breaker OPEN on payment-gateway after 5 consecutive failures"},
# #     {"timestamp": "2025-05-25T12:04:12Z", "level": "ERROR", "service": "payment-svc", "message": "PaymentGatewayTimeout: txn_id=txn_8834 rejected — circuit breaker open"},
# #     {"timestamp": "2025-05-25T12:04:33Z", "level": "ERROR", "service": "payment-svc", "message": "PaymentGatewayTimeout: txn_id=txn_8841 rejected — circuit breaker open"},
# #     {"timestamp": "2025-05-25T12:05:00Z", "level": "INFO",  "service": "payment-svc", "message": "HealthCheck: p99_latency=1160ms, SLA threshold=500ms — BREACH"},
# #     {"timestamp": "2025-05-25T12:05:15Z", "level": "ERROR", "service": "payment-svc", "message": "PaymentGatewayTimeout: txn_id=txn_8849 failed after max retries=3"},
# #     {"timestamp": "2025-05-25T12:05:30Z", "level": "WARN",  "service": "checkout-api", "message": "Upstream payment-svc responding slowly, increasing client timeout, latency=980ms"},
# #     {"timestamp": "2025-05-25T12:06:00Z", "level": "ERROR", "service": "checkout-api", "message": "HTTP 503 from payment-svc: Service Unavailable"},
# #     {"timestamp": "2025-05-25T12:06:45Z", "level": "INFO",  "service": "auth-svc",     "message": "Token validation successful for user_id=usr_4421"},
# #     {"timestamp": "2025-05-25T12:07:00Z", "level": "ERROR", "service": "payment-svc", "message": "SlowQuery detected: SELECT * FROM transactions WHERE status=pending took 8200ms"},
# # ]

# # MOCK_DEPLOYMENTS = [
# #     {"version": "v2.3.1", "service": "payment-svc",      "time": "10:01 UTC", "author": "Priya Sharma",  "status": "incident", "changes": "Refactored DB pool: max_pool_size 50→20 (unintentional)"},
# #     {"version": "v4.1.0", "service": "auth-svc",         "time": "06:45 UTC", "author": "Arjun Mehta",  "status": "healthy",  "changes": "JWT expiry updated, RS256 signing enabled"},
# #     {"version": "v1.9.2", "service": "checkout-api",     "time": "Yesterday", "author": "Sofia Chen",   "status": "warning",  "changes": "Cache TTL tuned 60s→300s"},
# # ]

# # MOCK_METRICS = {
# #     "payment_svc":  {"p99": 1160, "error_rate": 18.4, "db_timeouts_per_min": 130, "circuit_breaker": "OPEN"},
# #     "auth_svc":     {"p99": 45,   "error_rate": 0.02, "circuit_breaker": "CLOSED"},
# #     "checkout_api": {"p99": 780,  "error_rate": 4.1,  "circuit_breaker": "HALF_OPEN"},
# # }

# # # ── Pydantic models ────────────────────────────────────────────────────────────
# # class QueryRequest(BaseModel):
# #     natural_language: str
# #     log_group: Optional[str] = None

# # class LogFetchRequest(BaseModel):
# #     cw_query: str
# #     log_group: Optional[str] = None
# #     hours: Optional[int] = 2

# # class RCARequest(BaseModel):
# #     logs: list
# #     deployments: Optional[list] = None
# #     metrics: Optional[dict] = None

# # class IntentRequest(BaseModel):
# #     natural_language: str

# # # ── Helper: call Gemini ────────────────────────────────────────────────────────
# # # async def ask_gemini(prompt: str) -> str:
# # #     if not gemini:
# # #         raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured")
# # #     loop = asyncio.get_event_loop()
# # #     response = await loop.run_in_executor(None, lambda: gemini.generate_content(prompt))
# # #     return response.text.strip()

# # async def ask_gemini(prompt):

# #     for attempt in range(3):

# #         try:
# #             loop = asyncio.get_event_loop()

# #             response = await loop.run_in_executor(
# #                 None,
# #                 lambda: gemini.generate_content(prompt)
# #             )

# #             return response.text.strip()

# #         except Exception:

# #             if attempt == 2:
# #                 raise

# #             await asyncio.sleep(2)

# # # ── Helper: run CloudWatch query ───────────────────────────────────────────────
# # def run_cloudwatch_query(cw_query: str, log_group: str, hours: int = 2) -> list:
# #     client = get_cw_client()
# #     end_time   = int(time.time())
# #     start_time = end_time - (hours * 3600)

# #     resp = client.start_query(
# #         logGroupName=log_group,
# #         startTime=start_time,
# #         endTime=end_time,
# #         queryString=cw_query,
# #     )
# #     query_id = resp["queryId"]

# #     # Poll until complete (max 30s)
# #     for _ in range(30):
# #         time.sleep(1)
# #         result = client.get_query_results(queryId=query_id)
# #         if result["status"] in ("Complete", "Failed", "Cancelled"):
# #             break

# #     if result["status"] != "Complete":
# #         raise HTTPException(status_code=500, detail=f"CloudWatch query {result['status']}")

# #     # Flatten results into list of dicts
# #     logs = []
# #     for row in result.get("results", []):
# #         entry = {field["field"]: field["value"] for field in row}
# #         logs.append({
# #             "timestamp": entry.get("@timestamp", ""),
# #             "message":   entry.get("@message", ""),
# #             "logStream": entry.get("@logStream", ""),
# #             "level":     "ERROR" if "ERROR" in entry.get("@message", "") else
# #                          "WARN"  if "WARN"  in entry.get("@message", "") else "INFO",
# #             "service":   log_group.split("/")[-1],
# #         })
# #     return logs

# # SERVICE_LOG_GROUPS = {
# #     "payment-svc": "/aws/ecs/payment-service",
# #     "auth-svc": "/aws/ecs/auth-service",
# #     "checkout-api": "/aws/ecs/checkout-api",
# #     "notification-svc": "/aws/ecs/notification-service"
# # }

# # # ── Endpoints ──────────────────────────────────────────────────────────────────

# # @app.get("/health")
# # def health():
# #     return {
# #         "status": "ok",
# #         "gemini": bool(gemini),
# #         "aws_configured": bool(AWS_ACCESS_KEY),
# #         "use_mock": USE_MOCK,
# #         "log_group": LOG_GROUP,
# #     }


# # @app.post("/generate-query")
# # async def generate_query(req: QueryRequest):
# #     """Phase 1 — Ask Gemini to generate a CloudWatch Insights query."""
# #     prompt = f"""You are an AWS CloudWatch Logs Insights expert.

# # Convert this natural language request into a valid CloudWatch Logs Insights query.
# # Return ONLY the raw query — no explanation, no markdown, no backticks.

# # Request: {req.natural_language}

# # Rules:
# # - Use fields, filter, stats, sort, limit syntax
# # - Common log fields: @timestamp, @message, @logStream, @logGroup
# # - For error queries: filter @message like /ERROR|exception|failed/
# # - Always add: sort @timestamp desc | limit 100
# # """
# #     cw_query = await ask_gemini(prompt)
# #     # Strip markdown fences if Gemini adds them anyway
# #     cw_query = cw_query.replace("```sql", "").replace("```", "").strip()
# #     return {"cw_query": cw_query, "log_group": req.log_group or LOG_GROUP}


# # @app.post("/extract-intent")
# # async def extract_intent(req: IntentRequest):
# #     """Phase 3 — Extract structured intent from natural language."""
# #     prompt = f"""Extract search intent from this log query. Return ONLY valid JSON, no markdown.

# # Query: "{req.natural_language}"

# # Return exactly:
# # {{
# #   "service": "<service name or null>",
# #   "time_range_hours": <integer, default 2>,
# #   "severity": "<error|warn|info|all>",
# #   "search_pattern": "<keyword or regex pattern>",
# #   "log_group_hint": "<guessed log group suffix or null>"
# # }}"""
# #     raw = await ask_gemini(prompt)
# #     raw = raw.replace("```json", "").replace("```", "").strip()
# #     try:
# #         intent = json.loads(raw)
# #     except json.JSONDecodeError:
# #         intent = {"service": None, "time_range_hours": 2, "severity": "error", "search_pattern": "", "log_group_hint": None}
# #     return intent


# # @app.post("/fetch-logs")
# # async def fetch_logs(req: LogFetchRequest):
# #     """Phase 2 — Fetch logs from CloudWatch (or mock)."""
# #     # log_group = req.log_group or LOG_GROUP

# #     intent_service = req.log_group

# #     log_group = SERVICE_LOG_GROUPS.get(
# #         intent_service,
# #         LOG_GROUP
# #     )

# #     # if USE_MOCK or not AWS_ACCESS_KEY:
# #     #     # Filter mock logs based on the query string
# #     #     q = req.cw_query.lower()
# #     #     filtered = [
# #     #         l for l in MOCK_LOGS
# #     #         if any(kw in l["message"].lower() for kw in ["error", "warn", "timeout", "circuit", "payment", "slow", "pool"])
# #     #     ]
# #     #     return {
# #     #         "source": "mock",
# #     #         "log_group": log_group,
# #     #         "count": len(filtered),
# #     #         "logs": filtered,
# #     #     }

# #     # try:
# #     #     logs = run_cloudwatch_query(req.cw_query, log_group, req.hours or 2)
# #     #     return {"source": "cloudwatch", "log_group": log_group, "count": len(logs), "logs": logs}
# #     # except Exception as e:
# #     #     raise HTTPException(status_code=500, detail=str(e))

# #     if USE_MOCK:
# #         query = req.cw_query.lower()
# #         filtered = []

# #         for log in MOCK_LOGS:

# #            text = (
# #                log["message"] + " " +
# #                log["service"] + " " +
# #                log["level"]
# #            ).lower()

# #            if any(word in text for word in query.split()):
# #                filtered.append(log)

# #         if not filtered:
# #             filtered = MOCK_LOGS

# #         return {
# #             "source": "mock",
# #             "log_group": log_group,
# #             "count": len(filtered),
# #             "logs": filtered,
# #         }
# #     try:
# #         logs = run_cloudwatch_query(
# #             req.cw_query,
# #             log_group,
# #             req.hours or 2
# #         )

# #         return {
# #             "source": "cloudwatch",
# #             "log_group": log_group,
# #             "count": len(logs),
# #             "logs": logs
# #         }

# #     except Exception as e:
# #         raise HTTPException(
# #            status_code=500,
# #         detail=str(e)
# #         )

# # @app.post("/analyze-logs")
# # async def analyze_logs(req: RCARequest):
# #     """Phase 4+5 — Full RCA with log + deployment + metric correlation."""
# #     log_text = "\n".join(
# #         f"[{l.get('timestamp','')}] [{l.get('level','')}] [{l.get('service','')}] {l.get('message','')}"
# #         for l in req.logs[:50]  # cap tokens
# #     )

# #     deploy_text = ""
# #     if req.deployments:
# #         deploy_text = "\n\nRecent deployments:\n" + "\n".join(
# #             f"- {d.get('version')} {d.get('service')} at {d.get('time')} by {d.get('author')}: {d.get('changes')}"
# #             for d in req.deployments
# #         )

# #     metrics_text = ""
# #     if req.metrics:
# #         metrics_text = "\n\nCurrent metrics:\n" + json.dumps(req.metrics, indent=2)

# #     prompt = f"""You are an expert SRE performing root cause analysis.

# # Analyze these logs{' and correlate with deployments/metrics' if req.deployments else ''}:

# # LOGS:
# # {log_text}
# # {deploy_text}
# # {metrics_text}

# # Provide your analysis in this EXACT format:

# # ROOT_CAUSE:
# # <specific technical root cause — name config values, error types, deployment versions>

# # EVIDENCE:
# # • <evidence 1 with specific numbers from logs>
# # • <evidence 2>
# # • <evidence 3>

# # FAILURE_CHAIN:
# # <A → B → C → user impact using arrows>

# # CONFIDENCE: <High/Medium/Low>

# # RECOMMENDED_ACTIONS:
# # 1. <immediate action with exact command if possible>
# # 2. <short-term fix>
# # 3. <long-term prevention>
# # """
# #     analysis = await ask_gemini(prompt)
# #     return {"analysis": analysis, "log_count": len(req.logs)}


# # @app.get("/deployments")
# # def get_deployments():
# #     """Return recent deployment history (mock or real)."""
# #     return {"deployments": MOCK_DEPLOYMENTS}


# # @app.get("/metrics")
# # def get_metrics():
# #     """Return current service metrics (mock or real)."""
# #     return {"metrics": MOCK_METRICS}


# # @app.get("/test-aws")
# # def test_aws():
# #     try:
# #         client = boto3.client(
# #             "logs",
# #             region_name=AWS_REGION,
# #             aws_access_key_id=AWS_ACCESS_KEY,
# #             aws_secret_access_key=AWS_SECRET_KEY,
# #             verify=False
# #         )

# #         response = client.describe_log_groups(limit=20)

# #         return {
# #             "success": True,
# #             "groups": [
# #                 g["logGroupName"]
# #                 for g in response["logGroups"]
# #             ]
# #         }

# #     except Exception as e:
# #         return {
# #             "success": False,
# #             "error": str(e)
# #         }
    

# # @app.get("/debug-aws")
# # def debug_aws():
# #     return {
# #         "access_key_present": bool(AWS_ACCESS_KEY),
# #         "secret_key_present": bool(AWS_SECRET_KEY),
# #         "access_key_prefix": AWS_ACCESS_KEY[:8] if AWS_ACCESS_KEY else None,
# #         "region": AWS_REGION
# #     }
















# # """
# # OpsCopilot FastAPI Backend
# # Handles: CloudWatch queries, Gemini query generation, log fetching, intent extraction
# # """

# # import os
# # import time
# # import json
# # import asyncio
# # from datetime import datetime, timezone
# # from typing import Optional

# # import boto3
# # import google.generativeai as genai
# # from fastapi import FastAPI, HTTPException
# # from fastapi.middleware.cors import CORSMiddleware
# # from pydantic import BaseModel
# # from dotenv import load_dotenv

# # import urllib3
# # urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# # load_dotenv()

# # # ── Config ────────────────────────────────────────────────────────────────────
# # GEMINI_API_KEY  = os.getenv("VITE_GEMINI_API_KEY")
# # AWS_REGION      = os.getenv("VITE_AWS_REGION", "ap-south-1")
# # AWS_ACCESS_KEY  = os.getenv("VITE_AWS_ACCESS_KEY_ID")
# # AWS_SECRET_KEY  = os.getenv("VITE_AWS_SECRET_ACCESS_KEY")
# # LOG_GROUP       = os.getenv("VITE_AWS_LOG_GROUP", "payment-service")
# # USE_MOCK        = os.getenv("USE_MOCK_DATA", "true").lower() == "true"
# # # ── Init ──────────────────────────────────────────────────────────────────────
# # app = FastAPI(title="OpsCopilot API", version="2.0.0")

# # app.add_middleware(
# #     CORSMiddleware,
# #     allow_origins=["http://localhost:5173", "http://localhost:4173"],
# #     allow_methods=["*"],
# #     allow_headers=["*"],
# # )

# # if GEMINI_API_KEY:
# #     genai.configure(api_key=GEMINI_API_KEY)
# #     gemini = genai.GenerativeModel("gemini-2.5-flash")
# # else:
# #     gemini = None

# # def get_cw_client():
# #     return boto3.client(
# #         "logs",
# #         region_name=AWS_REGION,
# #         aws_access_key_id=AWS_ACCESS_KEY,
# #         aws_secret_access_key=AWS_SECRET_KEY,
# #         verify=False
# #     )

# # # ── Mock data (fallback when USE_MOCK=true or AWS creds missing) ───────────────
# # MOCK_LOGS = [
# #     {"timestamp": "2025-05-25T12:03:21Z", "level": "ERROR", "service": "payment-svc", "message": "PaymentGatewayTimeout: stripe API call exceeded 30s threshold, txn_id=txn_8821"},
# #     {"timestamp": "2025-05-25T12:03:22Z", "level": "ERROR", "service": "payment-svc", "message": "PaymentGatewayTimeout: retry #1 failed, txn_id=txn_8821"},
# #     {"timestamp": "2025-05-25T12:03:45Z", "level": "ERROR", "service": "payment-svc", "message": "DB connection pool exhausted: max_connections=20 reached, waiting=47"},
# #     {"timestamp": "2025-05-25T12:04:01Z", "level": "WARN",  "service": "payment-svc", "message": "Circuit breaker OPEN on payment-gateway after 5 consecutive failures"},
# #     {"timestamp": "2025-05-25T12:04:12Z", "level": "ERROR", "service": "payment-svc", "message": "PaymentGatewayTimeout: txn_id=txn_8834 rejected — circuit breaker open"},
# #     {"timestamp": "2025-05-25T12:04:33Z", "level": "ERROR", "service": "payment-svc", "message": "PaymentGatewayTimeout: txn_id=txn_8841 rejected — circuit breaker open"},
# #     {"timestamp": "2025-05-25T12:05:00Z", "level": "INFO",  "service": "payment-svc", "message": "HealthCheck: p99_latency=1160ms, SLA threshold=500ms — BREACH"},
# #     {"timestamp": "2025-05-25T12:05:15Z", "level": "ERROR", "service": "payment-svc", "message": "PaymentGatewayTimeout: txn_id=txn_8849 failed after max retries=3"},
# #     {"timestamp": "2025-05-25T12:05:30Z", "level": "WARN",  "service": "checkout-api", "message": "Upstream payment-svc responding slowly, increasing client timeout, latency=980ms"},
# #     {"timestamp": "2025-05-25T12:06:00Z", "level": "ERROR", "service": "checkout-api", "message": "HTTP 503 from payment-svc: Service Unavailable"},
# #     {"timestamp": "2025-05-25T12:06:45Z", "level": "INFO",  "service": "auth-svc",     "message": "Token validation successful for user_id=usr_4421"},
# #     {"timestamp": "2025-05-25T12:07:00Z", "level": "ERROR", "service": "payment-svc", "message": "SlowQuery detected: SELECT * FROM transactions WHERE status=pending took 8200ms"},
# # ]

# # MOCK_DEPLOYMENTS = [
# #     {"version": "v2.3.1", "service": "payment-svc",      "time": "10:01 UTC", "author": "Priya Sharma",  "status": "incident", "changes": "Refactored DB pool: max_pool_size 50→20 (unintentional)"},
# #     {"version": "v4.1.0", "service": "auth-svc",         "time": "06:45 UTC", "author": "Arjun Mehta",  "status": "healthy",  "changes": "JWT expiry updated, RS256 signing enabled"},
# #     {"version": "v1.9.2", "service": "checkout-api",     "time": "Yesterday", "author": "Sofia Chen",   "status": "warning",  "changes": "Cache TTL tuned 60s→300s"},
# # ]

# # MOCK_METRICS = {
# #     "payment_svc":  {"p99": 1160, "error_rate": 18.4, "db_timeouts_per_min": 130, "circuit_breaker": "OPEN"},
# #     "auth_svc":     {"p99": 45,   "error_rate": 0.02, "circuit_breaker": "CLOSED"},
# #     "checkout_api": {"p99": 780,  "error_rate": 4.1,  "circuit_breaker": "HALF_OPEN"},
# # }

# # # ── Pydantic models ────────────────────────────────────────────────────────────
# # class QueryRequest(BaseModel):
# #     natural_language: str
# #     log_group: Optional[str] = None

# # class LogFetchRequest(BaseModel):
# #     cw_query: str
# #     log_group: Optional[str] = None
# #     hours: Optional[int] = 2

# # class RCARequest(BaseModel):
# #     logs: list
# #     deployments: Optional[list] = None
# #     metrics: Optional[dict] = None

# # class IntentRequest(BaseModel):
# #     natural_language: str

# # # ── Helper: call Gemini ────────────────────────────────────────────────────────
# # async def ask_gemini(prompt: str) -> str:
# #     if not gemini:
# #         raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured")
# #     loop = asyncio.get_event_loop()
# #     response = await loop.run_in_executor(None, lambda: gemini.generate_content(prompt))
# #     return response.text.strip()

# # # ── Helper: run CloudWatch query ───────────────────────────────────────────────
# # def run_cloudwatch_query(cw_query: str, log_group: str, hours: int = 2) -> list:
# #     client = get_cw_client()
# #     end_time   = int(time.time())
# #     start_time = end_time - (hours * 3600)

# #     print("LOG GROUP:", log_group)
# #     print("REGION:", AWS_REGION)
# #     print("QUERY:", cw_query)

# #     resp = client.start_query(
# #         logGroupName=log_group,
# #         startTime=start_time,
# #         endTime=end_time,
# #         queryString=cw_query,
# #     )
# #     query_id = resp["queryId"]

# #     # Poll until complete (max 30s)
# #     for _ in range(30):
# #         time.sleep(1)
# #         result = client.get_query_results(queryId=query_id)
# #         if result["status"] in ("Complete", "Failed", "Cancelled"):
# #             break

# #     if result["status"] != "Complete":
# #         raise HTTPException(status_code=500, detail=f"CloudWatch query {result['status']}")

# #     # Flatten results into list of dicts
# #     logs = []
# #     for row in result.get("results", []):
# #         entry = {field["field"]: field["value"] for field in row}
# #         logs.append({
# #             "timestamp": entry.get("@timestamp", ""),
# #             "message":   entry.get("@message", ""),
# #             "logStream": entry.get("@logStream", ""),
# #             "level":     "ERROR" if "ERROR" in entry.get("@message", "") else
# #                          "WARN"  if "WARN"  in entry.get("@message", "") else "INFO",
# #             "service":   log_group.split("/")[-1],
# #         })
# #     return logs

# # # ── Endpoints ──────────────────────────────────────────────────────────────────

# # @app.get("/health")
# # def health():
# #     return {
# #         "status": "ok",
# #         "gemini": bool(gemini),
# #         "aws_configured": bool(AWS_ACCESS_KEY),
# #         "use_mock": USE_MOCK,
# #         "log_group": LOG_GROUP,
# #     }


# # @app.post("/generate-query")
# # async def generate_query(req: QueryRequest):
# #     """Phase 1 — Ask Gemini to generate a CloudWatch Insights query."""
# #     prompt = f"""You are an AWS CloudWatch Logs Insights expert.

# # Convert this natural language request into a valid CloudWatch Logs Insights query.
# # Return ONLY the raw query — no explanation, no markdown, no backticks.

# # Request: {req.natural_language}

# # Rules:
# # - Use CloudWatch Logs Insights syntax only
# # - DO NOT use regex flags such as /i, /g, /m
# # - CloudWatch Logs Insights does not support JavaScript regex flags
# # - Always add: sort @timestamp desc | limit 100
# # """
# #     cw_query = await ask_gemini(prompt)
# #     # Strip markdown fences if Gemini adds them anyway
# #     cw_query = cw_query.replace("```sql", "").replace("```", "").strip()

# #     cw_query = cw_query.replace("/i", "")
# #     return {"cw_query": cw_query, "log_group": req.log_group or LOG_GROUP}


# # @app.post("/extract-intent")
# # async def extract_intent(req: IntentRequest):
# #     """Phase 3 — Extract structured intent from natural language."""
# #     prompt = f"""Extract search intent from this log query. Return ONLY valid JSON, no markdown.

# # Query: "{req.natural_language}"

# # Return exactly:
# # {{
# #   "service": "<service name or null>",
# #   "time_range_hours": <integer, default 2>,
# #   "severity": "<error|warn|info|all>",
# #   "search_pattern": "<keyword or regex pattern>",
# #   "log_group_hint": "<guessed log group suffix or null>"
# # }}"""
# #     try:
# #         raw = await ask_gemini(prompt)

# #         print("GEMINI RESPONSE:")
# #         print(raw)

# #         raw = raw.replace("```json", "").replace("```", "").strip()

# #         intent = json.loads(raw)

# #         return intent

# #     except Exception as e:
# #         print("EXTRACT INTENT ERROR:")
# #         print(repr(e))

# #         raise HTTPException(
# #             status_code=500,
# #             detail=str(e)
# #         )
# #     # raw = await ask_gemini(prompt)
# #     # raw = raw.replace("```json", "").replace("```", "").strip()
# #     # try:
# #     #     intent = json.loads(raw)
# #     # except json.JSONDecodeError:
# #     #     intent = {"service": None, "time_range_hours": 2, "severity": "error", "search_pattern": "", "log_group_hint": None}
# #     # return intent


# # @app.post("/fetch-logs")
# # async def fetch_logs(req: LogFetchRequest):
# #     """Phase 2 — Fetch logs from CloudWatch (or mock)."""
# #     log_group = req.log_group or LOG_GROUP

# #     if USE_MOCK or not AWS_ACCESS_KEY:
# #         # Filter mock logs based on the query string
# #         q = req.cw_query.lower()
# #         filtered = [
# #             l for l in MOCK_LOGS
# #             if any(kw in l["message"].lower() for kw in ["error", "warn", "timeout", "circuit", "payment", "slow", "pool"])
# #         ]
# #         return {
# #             "source": "mock",
# #             "log_group": log_group,
# #             "count": len(filtered),
# #             "logs": filtered,
# #         }

# #     try:
# #         logs = run_cloudwatch_query(req.cw_query, log_group, req.hours or 2)
# #         return {"source": "cloudwatch", "log_group": log_group, "count": len(logs), "logs": logs}
# #     except Exception as e:
# #         print("FETCH LOGS ERROR:", repr(e))
# #         raise HTTPException(status_code=500, detail=str(e))


# # @app.post("/analyze-logs")
# # async def analyze_logs(req: RCARequest):
# #     """Phase 4+5 — Full RCA with log + deployment + metric correlation."""
# #     log_text = "\n".join(
# #         f"[{l.get('timestamp','')}] [{l.get('level','')}] [{l.get('service','')}] {l.get('message','')}"
# #         for l in req.logs[:50]  # cap tokens
# #     )

# #     deploy_text = ""
# #     if req.deployments:
# #         deploy_text = "\n\nRecent deployments:\n" + "\n".join(
# #             f"- {d.get('version')} {d.get('service')} at {d.get('time')} by {d.get('author')}: {d.get('changes')}"
# #             for d in req.deployments
# #         )

# #     metrics_text = ""
# #     if req.metrics:
# #         metrics_text = "\n\nCurrent metrics:\n" + json.dumps(req.metrics, indent=2)

# #     prompt = f"""You are an expert SRE performing root cause analysis.

# # Analyze these logs{' and correlate with deployments/metrics' if req.deployments else ''}:

# # LOGS:
# # {log_text}
# # {deploy_text}
# # {metrics_text}

# # Provide your analysis in this EXACT format:

# # ROOT_CAUSE:
# # <specific technical root cause — name config values, error types, deployment versions>

# # EVIDENCE:
# # • <evidence 1 with specific numbers from logs>
# # • <evidence 2>
# # • <evidence 3>

# # FAILURE_CHAIN:
# # <A → B → C → user impact using arrows>

# # CONFIDENCE: <High/Medium/Low>

# # RECOMMENDED_ACTIONS:
# # 1. <immediate action with exact command if possible>
# # 2. <short-term fix>
# # 3. <long-term prevention>
# # """
# #     analysis = await ask_gemini(prompt)
# #     return {"analysis": analysis, "log_count": len(req.logs)}


# # @app.get("/deployments")
# # def get_deployments():
# #     """Return recent deployment history (mock or real)."""
# #     return {"deployments": MOCK_DEPLOYMENTS}


# # @app.get("/metrics")
# # def get_metrics():
# #     """Return current service metrics (mock or real)."""
# #     return {"metrics": MOCK_METRICS}













# """
# OpsCopilot FastAPI Backend - working
# Handles: CloudWatch queries, Gemini query generation, log fetching, intent extraction
# """

# import os
# import time
# import json
# import asyncio
# from datetime import datetime, timezone
# from typing import Optional

# import boto3
# import google.generativeai as genai
# from fastapi import FastAPI, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel
# from dotenv import load_dotenv

# import urllib3
# urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# load_dotenv()

# # ── Config ────────────────────────────────────────────────────────────────────
# GEMINI_API_KEY  = os.getenv("VITE_GEMINI_API_KEY")
# AWS_REGION      = os.getenv("VITE_AWS_REGION", "ap-south-1")
# AWS_ACCESS_KEY  = os.getenv("VITE_AWS_ACCESS_KEY_ID")
# AWS_SECRET_KEY  = os.getenv("VITE_AWS_SECRET_ACCESS_KEY")
# LOG_GROUP       = os.getenv("VITE_AWS_LOG_GROUP", "payment-service")
# USE_MOCK        = os.getenv("USE_MOCK_DATA", "true").lower() == "true"

# # ── Init ──────────────────────────────────────────────────────────────────────
# app = FastAPI(title="OpsCopilot API", version="2.0.0")

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:5173", "http://localhost:4173"],
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# if GEMINI_API_KEY:
#     genai.configure(api_key=GEMINI_API_KEY)
#     gemini = genai.GenerativeModel("gemini-2.5-flash")
# else:
#     gemini = None

# def get_cw_client():
#     return boto3.client(
#         "logs",
#         region_name=AWS_REGION,
#         aws_access_key_id=AWS_ACCESS_KEY,
#         aws_secret_access_key=AWS_SECRET_KEY,
#         verify=False
#     )

# # ── Mock data (fallback when USE_MOCK=true or AWS creds missing) ───────────────
# MOCK_LOGS = [
#     {"timestamp": "2025-05-25T12:03:21Z", "level": "ERROR", "service": "payment-svc", "message": "PaymentGatewayTimeout: stripe API call exceeded 30s threshold, txn_id=txn_8821"},
#     {"timestamp": "2025-05-25T12:03:22Z", "level": "ERROR", "service": "payment-svc", "message": "PaymentGatewayTimeout: retry #1 failed, txn_id=txn_8821"},
#     {"timestamp": "2025-05-25T12:03:45Z", "level": "ERROR", "service": "payment-svc", "message": "DB connection pool exhausted: max_connections=20 reached, waiting=47"},
#     {"timestamp": "2025-05-25T12:04:01Z", "level": "WARN",  "service": "payment-svc", "message": "Circuit breaker OPEN on payment-gateway after 5 consecutive failures"},
#     {"timestamp": "2025-05-25T12:04:12Z", "level": "ERROR", "service": "payment-svc", "message": "PaymentGatewayTimeout: txn_id=txn_8834 rejected — circuit breaker open"},
#     {"timestamp": "2025-05-25T12:04:33Z", "level": "ERROR", "service": "payment-svc", "message": "PaymentGatewayTimeout: txn_id=txn_8841 rejected — circuit breaker open"},
#     {"timestamp": "2025-05-25T12:05:00Z", "level": "INFO",  "service": "payment-svc", "message": "HealthCheck: p99_latency=1160ms, SLA threshold=500ms — BREACH"},
#     {"timestamp": "2025-05-25T12:05:15Z", "level": "ERROR", "service": "payment-svc", "message": "PaymentGatewayTimeout: txn_id=txn_8849 failed after max retries=3"},
#     {"timestamp": "2025-05-25T12:05:30Z", "level": "WARN",  "service": "checkout-api", "message": "Upstream payment-svc responding slowly, increasing client timeout, latency=980ms"},
#     {"timestamp": "2025-05-25T12:06:00Z", "level": "ERROR", "service": "checkout-api", "message": "HTTP 503 from payment-svc: Service Unavailable"},
#     {"timestamp": "2025-05-25T12:06:45Z", "level": "INFO",  "service": "auth-svc",     "message": "Token validation successful for user_id=usr_4421"},
#     {"timestamp": "2025-05-25T12:07:00Z", "level": "ERROR", "service": "payment-svc", "message": "SlowQuery detected: SELECT * FROM transactions WHERE status=pending took 8200ms"},
# ]

# MOCK_DEPLOYMENTS = [
#     {"version": "v2.3.1", "service": "payment-svc",      "time": "10:01 UTC", "author": "Priya Sharma",  "status": "incident", "changes": "Refactored DB pool: max_pool_size 50→20 (unintentional)"},
#     {"version": "v4.1.0", "service": "auth-svc",         "time": "06:45 UTC", "author": "Arjun Mehta",  "status": "healthy",  "changes": "JWT expiry updated, RS256 signing enabled"},
#     {"version": "v1.9.2", "service": "checkout-api",     "time": "Yesterday", "author": "Sofia Chen",   "status": "warning",  "changes": "Cache TTL tuned 60s→300s"},
# ]

# MOCK_METRICS = {
#     "payment_svc":  {"p99": 1160, "error_rate": 18.4, "db_timeouts_per_min": 130, "circuit_breaker": "OPEN"},
#     "auth_svc":     {"p99": 45,   "error_rate": 0.02, "circuit_breaker": "CLOSED"},
#     "checkout_api": {"p99": 780,  "error_rate": 4.1,  "circuit_breaker": "HALF_OPEN"},
# }

# # ── Pydantic models ────────────────────────────────────────────────────────────
# class QueryRequest(BaseModel):
#     natural_language: str
#     log_group: Optional[str] = None

# class LogFetchRequest(BaseModel):
#     cw_query: str
#     log_group: Optional[str] = None
#     hours: Optional[int] = 2

# class RCARequest(BaseModel):
#     logs: list
#     deployments: Optional[list] = None
#     metrics: Optional[dict] = None

# class IntentRequest(BaseModel):
#     natural_language: str

# # ── Helper: call Gemini ────────────────────────────────────────────────────────
# async def ask_gemini(prompt: str) -> str:
#     if not gemini:
#         raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured")
#     loop = asyncio.get_event_loop()
#     response = await loop.run_in_executor(None, lambda: gemini.generate_content(prompt))
#     return response.text.strip()

# # ── Helper: run CloudWatch query ───────────────────────────────────────────────
# def run_cloudwatch_query(cw_query: str, log_group: str, hours: int = 2) -> list:
#     client = get_cw_client()
#     end_time   = int(time.time())
#     start_time = end_time - (hours * 3600)

#     print("LOG GROUP:", log_group)
#     print("REGION:", AWS_REGION)
#     print("QUERY:", cw_query)

#     resp = client.start_query(
#         logGroupName=log_group,
#         startTime=start_time,
#         endTime=end_time,
#         queryString=cw_query,
#     )
#     query_id = resp["queryId"]

#     # Poll until complete (max 30s)
#     for _ in range(30):
#         time.sleep(1)
#         result = client.get_query_results(queryId=query_id)
#         if result["status"] in ("Complete", "Failed", "Cancelled"):
#             break

#     if result["status"] != "Complete":
#         raise HTTPException(status_code=500, detail=f"CloudWatch query {result['status']}")

#     # Flatten results into list of dicts
#     logs = []
#     for row in result.get("results", []):
#         entry = {field["field"]: field["value"] for field in row}
#         logs.append({
#             "timestamp": entry.get("@timestamp", ""),
#             "message":   entry.get("@message", ""),
#             "logStream": entry.get("@logStream", ""),
#             "level":     "ERROR" if "ERROR" in entry.get("@message", "") else
#                          "WARN"  if "WARN"  in entry.get("@message", "") else "INFO",
#             "service":   log_group.split("/")[-1],
#         })
#     return logs

# # ── Endpoints ──────────────────────────────────────────────────────────────────

# @app.get("/health")
# def health():
#     return {
#         "status": "ok",
#         "gemini": bool(gemini),
#         "aws_configured": bool(AWS_ACCESS_KEY),
#         "use_mock": USE_MOCK,
#         "log_group": LOG_GROUP,
#     }


# @app.post("/generate-query")
# async def generate_query(req: QueryRequest):
#     """Phase 1 — Ask Gemini to generate a CloudWatch Insights query."""
#     prompt = f"""You are an AWS CloudWatch Logs Insights expert.

# Convert this natural language request into a valid CloudWatch Logs Insights query.
# Return ONLY the raw query — no explanation, no markdown, no backticks.

# Request: {req.natural_language}

# Rules:
# - Use CloudWatch Logs Insights syntax only
# - DO NOT use regex flags such as /i, /g, /m
# - CloudWatch Logs Insights does not support JavaScript regex flags
# - Always add: sort @timestamp desc | limit 100
# """
#     cw_query = await ask_gemini(prompt)
#     # Strip markdown fences if Gemini adds them anyway
#     cw_query = cw_query.replace("```sql", "").replace("```", "").strip()

#     # Remove unsupported regex flags
#     cw_query = cw_query.replace("/i", "").replace("/g", "").replace("/m", "")

#     return {"cw_query": cw_query, "log_group": req.log_group or LOG_GROUP}


# @app.post("/extract-intent")
# async def extract_intent(req: IntentRequest):
#     """Phase 3 — Extract structured intent from natural language."""
#     prompt = f"""Extract search intent from this log query. Return ONLY valid JSON, no markdown.

# Query: "{req.natural_language}"

# Return exactly:
# {{
#   "service": "<service name or null>",
#   "time_range_hours": <integer, default 2>,
#   "severity": "<error|warn|info|all>",
#   "search_pattern": "<keyword or regex pattern>",
#   "log_group_hint": "<guessed log group suffix or null>"
# }}"""
#     try:
#         raw = await ask_gemini(prompt)

#         print("GEMINI RESPONSE:")
#         print(raw)

#         raw = raw.replace("```json", "").replace("```", "").strip()

#         intent = json.loads(raw)

#         return intent

#     except Exception as e:
#         print("EXTRACT INTENT ERROR:")
#         print(repr(e))

#         raise HTTPException(
#             status_code=500,
#             detail=str(e)
#         )


# @app.post("/fetch-logs")
# async def fetch_logs(req: LogFetchRequest):
#     """Phase 2 — Fetch logs from CloudWatch (or mock)."""

#     # ── FIX: Map short service names to full log group names ──────────────────
#     SERVICE_MAP = {
#         "payment":  "payment-service",
#         "auth":     "auth-service",
#         "checkout": "checkout-api",
#     }

#     log_group = SERVICE_MAP.get(
#         req.log_group,
#         req.log_group or LOG_GROUP
#     )

#     if USE_MOCK or not AWS_ACCESS_KEY:
#         # Filter mock logs based on the query string
#         q = req.cw_query.lower()
#         filtered = [
#             l for l in MOCK_LOGS
#             if any(kw in l["message"].lower() for kw in ["error", "warn", "timeout", "circuit", "payment", "slow", "pool"])
#         ]
#         return {
#             "source": "mock",
#             "log_group": log_group,
#             "count": len(filtered),
#             "logs": filtered,
#         }

#     try:
#         logs = run_cloudwatch_query(req.cw_query, log_group, req.hours or 2)
#         return {"source": "cloudwatch", "log_group": log_group, "count": len(logs), "logs": logs}
#     except Exception as e:
#         print("FETCH LOGS ERROR:", repr(e))
#         raise HTTPException(status_code=500, detail=str(e))


# @app.post("/analyze-logs")
# async def analyze_logs(req: RCARequest):
#     """Phase 4+5 — Full RCA with log + deployment + metric correlation."""
#     log_text = "\n".join(
#         f"[{l.get('timestamp','')}] [{l.get('level','')}] [{l.get('service','')}] {l.get('message','')}"
#         for l in req.logs[:50]  # cap tokens
#     )

#     deploy_text = ""
#     if req.deployments:
#         deploy_text = "\n\nRecent deployments:\n" + "\n".join(
#             f"- {d.get('version')} {d.get('service')} at {d.get('time')} by {d.get('author')}: {d.get('changes')}"
#             for d in req.deployments
#         )

#     metrics_text = ""
#     if req.metrics:
#         metrics_text = "\n\nCurrent metrics:\n" + json.dumps(req.metrics, indent=2)

#     prompt = f"""You are an expert SRE performing root cause analysis.

# Analyze these logs{' and correlate with deployments/metrics' if req.deployments else ''}:

# LOGS:
# {log_text}
# {deploy_text}
# {metrics_text}

# Provide your analysis in this EXACT format:

# ROOT_CAUSE:
# <specific technical root cause — name config values, error types, deployment versions>

# EVIDENCE:
# • <evidence 1 with specific numbers from logs>
# • <evidence 2>
# • <evidence 3>

# FAILURE_CHAIN:
# <A → B → C → user impact using arrows>

# CONFIDENCE: <High/Medium/Low>

# RECOMMENDED_ACTIONS:
# 1. <immediate action with exact command if possible>
# 2. <short-term fix>
# 3. <long-term prevention>
# """
#     analysis = await ask_gemini(prompt)
#     return {"analysis": analysis, "log_count": len(req.logs)}


# @app.get("/deployments")
# def get_deployments():
#     """Return recent deployment history (mock or real)."""
#     return {"deployments": MOCK_DEPLOYMENTS}


# @app.get("/metrics")
# def get_metrics():
#     """Return current service metrics (mock or real)."""
#     return {"metrics": MOCK_METRICS}




















import os
import time
import json
import asyncio
import random
import string
from datetime import datetime, timezone
from typing import Optional

from fastapi import Body

import boto3
import google.generativeai as genai
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

load_dotenv()

# ── Config ────────────────────────────────────────────────────────────────────
GEMINI_API_KEY  = os.getenv("VITE_GEMINI_API_KEY")
AWS_REGION      = os.getenv("VITE_AWS_REGION", "ap-south-1")
AWS_ACCESS_KEY  = os.getenv("VITE_AWS_ACCESS_KEY_ID")
AWS_SECRET_KEY  = os.getenv("VITE_AWS_SECRET_ACCESS_KEY")
LOG_GROUP       = os.getenv("VITE_AWS_LOG_GROUP", "payment-service")
USE_MOCK        = os.getenv("USE_MOCK_DATA", "true").lower() == "true"

# ── Init ──────────────────────────────────────────────────────────────────────
app = FastAPI(title="OpsCopilot API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:4173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    gemini = genai.GenerativeModel("gemini-2.5-flash")
else:
    gemini = None

def get_cw_client():
    return boto3.client(
        "logs",
        region_name=AWS_REGION,
        aws_access_key_id=AWS_ACCESS_KEY,
        aws_secret_access_key=AWS_SECRET_KEY,
        verify=False
    )

# ── Mock data ──────────────────────────────────────────────────────────────────
MOCK_LOGS = [
    {"timestamp": "2025-05-25T12:03:21Z", "level": "ERROR", "service": "payment-svc", "message": "PaymentGatewayTimeout: stripe API call exceeded 30s threshold, txn_id=txn_8821"},
    {"timestamp": "2025-05-25T12:03:22Z", "level": "ERROR", "service": "payment-svc", "message": "PaymentGatewayTimeout: retry #1 failed, txn_id=txn_8821"},
    {"timestamp": "2025-05-25T12:03:45Z", "level": "ERROR", "service": "payment-svc", "message": "DB connection pool exhausted: max_connections=20 reached, waiting=47"},
    {"timestamp": "2025-05-25T12:04:01Z", "level": "WARN",  "service": "payment-svc", "message": "Circuit breaker OPEN on payment-gateway after 5 consecutive failures"},
    {"timestamp": "2025-05-25T12:04:12Z", "level": "ERROR", "service": "payment-svc", "message": "PaymentGatewayTimeout: txn_id=txn_8834 rejected — circuit breaker open"},
    {"timestamp": "2025-05-25T12:04:33Z", "level": "ERROR", "service": "payment-svc", "message": "PaymentGatewayTimeout: txn_id=txn_8841 rejected — circuit breaker open"},
    {"timestamp": "2025-05-25T12:05:00Z", "level": "INFO",  "service": "payment-svc", "message": "HealthCheck: p99_latency=1160ms, SLA threshold=500ms — BREACH"},
    {"timestamp": "2025-05-25T12:05:15Z", "level": "ERROR", "service": "payment-svc", "message": "PaymentGatewayTimeout: txn_id=txn_8849 failed after max retries=3"},
    {"timestamp": "2025-05-25T12:05:30Z", "level": "WARN",  "service": "checkout-api", "message": "Upstream payment-svc responding slowly, increasing client timeout, latency=980ms"},
    {"timestamp": "2025-05-25T12:06:00Z", "level": "ERROR", "service": "checkout-api", "message": "HTTP 503 from payment-svc: Service Unavailable"},
    {"timestamp": "2025-05-25T12:06:45Z", "level": "INFO",  "service": "auth-svc",     "message": "Token validation successful for user_id=usr_4421"},
    {"timestamp": "2025-05-25T12:07:00Z", "level": "ERROR", "service": "payment-svc", "message": "SlowQuery detected: SELECT * FROM transactions WHERE status=pending took 8200ms"},
]

MOCK_DEPLOYMENTS = [
    {"version": "v2.3.1", "service": "payment-svc",  "time": "10:01 UTC", "author": "Priya Sharma", "status": "incident", "changes": "Refactored DB pool: max_pool_size 50→20 (unintentional)"},
    {"version": "v4.1.0", "service": "auth-svc",     "time": "06:45 UTC", "author": "Arjun Mehta",  "status": "healthy",  "changes": "JWT expiry updated, RS256 signing enabled"},
    {"version": "v1.9.2", "service": "checkout-api", "time": "Yesterday", "author": "Sofia Chen",   "status": "warning",  "changes": "Cache TTL tuned 60s→300s"},
]

MOCK_METRICS = {
    "payment_svc":  {"p99": 1160, "error_rate": 18.4, "db_timeouts_per_min": 130, "circuit_breaker": "OPEN"},
    "auth_svc":     {"p99": 45,   "error_rate": 0.02, "circuit_breaker": "CLOSED"},
    "checkout_api": {"p99": 780,  "error_rate": 4.1,  "circuit_breaker": "HALF_OPEN"},
}

# ── Mock action responses ──────────────────────────────────────────────────────
def _rand_id(prefix, length=4):
    return f"{prefix}-{''.join(random.choices(string.digits, k=length))}"

ACTION_MOCK_RESPONSES = {
    "create_ticket": lambda req: {
        "status":    "success",
        "action":    "create_ticket",
        "ticket_id": _rand_id("INC"),
        "url":       f"https://gitlab.example.com/ops/incidents/-/issues/{random.randint(100,999)}",
        "title":     f"[{req.priority}] Incident: {req.owner_team} service degradation",
        "labels":    [req.priority, "incident", "auto-created"],
    },
    "notify_oncall": lambda req: {
        "status":  "success",
        "action":  "notify_oncall",
        "ref":     _rand_id("PAGE"),
        "channel": "#incidents",
        "message": f"🚨 {req.priority} incident detected — {req.owner_team} on-call notified via PagerDuty",
    },
    "prepare_rollback": lambda req: {
        "status": "success",
        "action": "prepare_rollback",
        "ref":    _rand_id("RB"),
        "target": "v2.3.0",
        "command": "aws ecs update-service --cluster prod --service payment-svc --task-definition payment-svc:prev",
    },
    "attach_runbook": lambda req: {
        "status":    "success",
        "action":    "attach_runbook",
        "ref":       _rand_id("DOC"),
        "note":      "Runbook snippet attached to incident ticket",
    },
    "attach_recovery": lambda req: {
        "status": "success",
        "action": "attach_recovery",
        "ref":    _rand_id("DOC"),
        "note":   "Recovery plan attached to incident ticket",
    },
    "generate_change_request": lambda req: {
        "status": "success",
        "action": "generate_change_request",
        "ref":    _rand_id("CR"),
        "note":   f"Change request raised for {req.owner_team} — pending CAB approval",
    },
    "page_management": lambda req: {
        "status":  "success",
        "action":  "page_management",
        "ref":     _rand_id("ESC"),
        "message": f"Engineering management paged — {req.priority} active incident",
    },
}

# ── Pydantic models ────────────────────────────────────────────────────────────
class QueryRequest(BaseModel):
    natural_language: str
    log_group: Optional[str] = None

class LogFetchRequest(BaseModel):
    cw_query: str
    log_group: Optional[str] = None
    hours: Optional[int] = 2

class RCARequest(BaseModel):
    logs: list
    deployments: Optional[list] = None
    metrics: Optional[dict] = None

class IntentRequest(BaseModel):
    natural_language: str

class IncidentCommandRequest(BaseModel):
    rca:      Optional[str] = None
    recovery: Optional[str] = None

class ExecuteActionRequest(BaseModel):
    action:           str
    priority:         Optional[str] = "P1"
    owner_team:       Optional[str] = "Engineering"
    escalation:       Optional[str] = "High"
    runbook_snippet:  Optional[str] = None
    recovery_snippet: Optional[str] = None

# ── Helper: call Gemini ────────────────────────────────────────────────────────
async def ask_gemini(prompt: str) -> str:
    if not gemini:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured")
    loop = asyncio.get_event_loop()
    response = await loop.run_in_executor(None, lambda: gemini.generate_content(prompt))
    return response.text.strip()

# ── Helper: run CloudWatch query ───────────────────────────────────────────────
def run_cloudwatch_query(cw_query: str, log_group: str, hours: int = 2) -> list:
    client = get_cw_client()
    end_time   = int(time.time())
    start_time = end_time - (hours * 3600)

    print("LOG GROUP:", log_group)
    print("REGION:", AWS_REGION)
    print("QUERY:", cw_query)

    resp = client.start_query(
        logGroupName=log_group,
        startTime=start_time,
        endTime=end_time,
        queryString=cw_query,
    )
    query_id = resp["queryId"]

    for _ in range(30):
        time.sleep(1)
        result = client.get_query_results(queryId=query_id)
        if result["status"] in ("Complete", "Failed", "Cancelled"):
            break

    if result["status"] != "Complete":
        raise HTTPException(status_code=500, detail=f"CloudWatch query {result['status']}")

    logs = []
    for row in result.get("results", []):
        entry = {field["field"]: field["value"] for field in row}
        logs.append({
            "timestamp": entry.get("@timestamp", ""),
            "message":   entry.get("@message", ""),
            "logStream": entry.get("@logStream", ""),
            "level":     "ERROR" if "ERROR" in entry.get("@message", "") else
                         "WARN"  if "WARN"  in entry.get("@message", "") else "INFO",
            "service":   log_group.split("/")[-1],
        })
    return logs

# ── Endpoints ──────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {
        "status": "ok",
        "gemini": bool(gemini),
        "aws_configured": bool(AWS_ACCESS_KEY),
        "use_mock": USE_MOCK,
        "log_group": LOG_GROUP,
    }


@app.post("/generate-query")
async def generate_query(req: QueryRequest):
    """Phase 1 — Ask Gemini to generate a CloudWatch Insights query."""
    prompt = f"""You are an AWS CloudWatch Logs Insights expert.

Convert this natural language request into a valid CloudWatch Logs Insights query.
Return ONLY the raw query — no explanation, no markdown, no backticks.

Request: {req.natural_language}

Rules:
- Use CloudWatch Logs Insights syntax only
- DO NOT use regex flags such as /i, /g, /m
- CloudWatch Logs Insights does not support JavaScript regex flags
- Always add: sort @timestamp desc | limit 100
"""
    cw_query = await ask_gemini(prompt)
    cw_query = cw_query.replace("```sql", "").replace("```", "").strip()
    cw_query = cw_query.replace("/i", "").replace("/g", "").replace("/m", "")
    return {"cw_query": cw_query, "log_group": req.log_group or LOG_GROUP}


@app.post("/extract-intent")
async def extract_intent(req: IntentRequest):
    """Phase 3 — Extract structured intent from natural language."""
    prompt = f"""Extract search intent from this log query. Return ONLY valid JSON, no markdown.

Query: "{req.natural_language}"

Return exactly:
{{
  "service": "<service name or null>",
  "time_range_hours": <integer, default 2>,
  "severity": "<error|warn|info|all>",
  "search_pattern": "<keyword or regex pattern>",
  "log_group_hint": "<guessed log group suffix or null>"
}}"""
    try:
        raw = await ask_gemini(prompt)
        print("GEMINI RESPONSE:", raw)
        raw = raw.replace("```json", "").replace("```", "").strip()
        return json.loads(raw)
    except Exception as e:
        print("EXTRACT INTENT ERROR:", repr(e))
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/fetch-logs")
async def fetch_logs(req: LogFetchRequest):
    """Phase 2 — Fetch logs from CloudWatch (or mock)."""
    SERVICE_MAP = {
        "payment":  "payment-service",
        "auth":     "auth-service",
        "checkout": "checkout-api",
    }
    log_group = SERVICE_MAP.get(req.log_group, req.log_group or LOG_GROUP)

    if USE_MOCK or not AWS_ACCESS_KEY:
        filtered = [
            l for l in MOCK_LOGS
            if any(kw in l["message"].lower() for kw in ["error", "warn", "timeout", "circuit", "payment", "slow", "pool"])
        ]
        return {"source": "mock", "log_group": log_group, "count": len(filtered), "logs": filtered}

    try:
        logs = run_cloudwatch_query(req.cw_query, log_group, req.hours or 2)
        return {"source": "cloudwatch", "log_group": log_group, "count": len(logs), "logs": logs}
    except Exception as e:
        print("FETCH LOGS ERROR:", repr(e))
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze-logs")
async def analyze_logs(req: RCARequest):
    """Phase 4+5 — Full RCA with log + deployment + metric correlation."""
    log_text = "\n".join(
        f"[{l.get('timestamp','')}] [{l.get('level','')}] [{l.get('service','')}] {l.get('message','')}"
        for l in req.logs[:50]
    )
    deploy_text = ""
    if req.deployments:
        deploy_text = "\n\nRecent deployments:\n" + "\n".join(
            f"- {d.get('version')} {d.get('service')} at {d.get('time')} by {d.get('author')}: {d.get('changes')}"
            for d in req.deployments
        )
    metrics_text = ""
    if req.metrics:
        metrics_text = "\n\nCurrent metrics:\n" + json.dumps(req.metrics, indent=2)

    prompt = f"""You are an expert SRE performing root cause analysis.

Analyze these logs{' and correlate with deployments/metrics' if req.deployments else ''}:

LOGS:
{log_text}
{deploy_text}
{metrics_text}

Provide your analysis in this EXACT format:

ROOT_CAUSE:
<specific technical root cause — name config values, error types, deployment versions>

EVIDENCE:
• <evidence 1 with specific numbers from logs>
• <evidence 2>
• <evidence 3>

FAILURE_CHAIN:
<A → B → C → user impact using arrows>

CONFIDENCE: <High/Medium/Low>

RECOMMENDED_ACTIONS:
1. <immediate action with exact command if possible>
2. <short-term fix>
3. <long-term prevention>
"""
    analysis = await ask_gemini(prompt)
    return {"analysis": analysis, "log_count": len(req.logs)}


@app.post("/incident-command")
async def incident_command(req: IncidentCommandRequest):
    """
    Gemini-powered Incident Commander.
    Reads RCA + recovery plan and returns a structured command decision.
    """
    rca_text      = req.rca      or "(not provided)"
    recovery_text = req.recovery or "(not provided)"

    prompt = f"""You are an Incident Commander.

Root Cause Analysis:
{rca_text[:1000]}

Recovery Plan:
{recovery_text[:600]}

Determine:
1. Priority (P1/P2/P3)
2. Owner Team
3. Escalation Level (Critical/High/Medium/Low)
4. Whether a ticket should be created (Yes/No)
5. Whether on-call should be notified (Yes/No)

Return EXACTLY this format — no extra text:

PRIORITY: <P1|P2|P3>
OWNER_TEAM: <team name>
ESCALATION_LEVEL: <Critical|High|Medium|Low>
REQUIRES_TICKET: <Yes|No>
NOTIFY_ONCALL: <Yes|No>
CONFIDENCE: <High|Medium|Low>
RATIONALE: <one sentence>
"""
    result = await ask_gemini(prompt)
    return {"command": result}


@app.post("/execute-action")
async def execute_action(req: ExecuteActionRequest):
    """
    Execute a single incident action (mock implementation).
    Returns structured response with ticket IDs / references.

    In production, swap each branch for real API calls:
      create_ticket    → GitLab Issues API
      notify_oncall    → PagerDuty / Slack
      prepare_rollback → AWS ECS / CodeDeploy API
      attach_*         → GitLab issue note API
    """
    action = req.action.lower()

    if action not in ACTION_MOCK_RESPONSES:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown action '{action}'. Valid actions: {list(ACTION_MOCK_RESPONSES.keys())}"
        )

    # Simulate a short processing delay so the UI animations are visible
    await asyncio.sleep(0.4)

    response_fn = ACTION_MOCK_RESPONSES[action]
    return response_fn(req)


@app.get("/deployments")
def get_deployments():
    return {"deployments": MOCK_DEPLOYMENTS}


@app.get("/metrics")
def get_metrics():
    return {"metrics": MOCK_METRICS}
