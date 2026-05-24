from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from routes.analyze import router as analyze_router
import time
import logging

# Configure structured production logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("InterviewMirror-AI-Engine")

app = FastAPI(
    title="InterviewMirror AI - Media Analytics Engine",
    version="1.0.0",
    description="High-performance Computer Vision (MediaPipe) and Speech (Whisper AI) service."
)

# 1. DevSecOps: Custom Secure Headers Middleware (Helmet equivalents)
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    # Performance logging
    start_time = time.time()
    response: Response = await call_next(request)
    duration = time.time() - start_time
    response.headers["X-Process-Time-Seconds"] = f"{round(duration, 4)}"

    # Hardened Security Headers
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Content-Security-Policy"] = "default-src 'self'; frame-ancestors 'none'"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
    return response

# 2. Configure CORS for Node.js API Gateway integrations
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to internal VPC or Node.js gateway host
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

# 3. Simple Client IP Rate Limiter Middleware
IP_REQUEST_LOGS = {}
RATE_LIMIT_WINDOW = 60.0 # 1 minute
MAX_REQUESTS_PER_WINDOW = 60

@app.middleware("http")
async def client_rate_limiting(request: Request, call_next):
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    
    # Prune expired logs
    if client_ip in IP_REQUEST_LOGS:
        IP_REQUEST_LOGS[client_ip] = [t for t in IP_REQUEST_LOGS[client_ip] if now - t < RATE_LIMIT_WINDOW]
    else:
        IP_REQUEST_LOGS[client_ip] = []

    # Check limit
    if len(IP_REQUEST_LOGS[client_ip]) >= MAX_REQUESTS_PER_WINDOW:
        logger.warning(f"Rate limit exceeded for IP: {client_ip}")
        return Response(
            content='{"detail": "Too many requests. Please throttle your client connections."}',
            status_code=429,
            media_type="application/json"
        )
        
    IP_REQUEST_LOGS[client_ip].append(now)
    return await call_next(request)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "interviewmirror-ai-engine",
        "model_loaded": {
            "mediapipe_pose": True,
            "mediapipe_face": True,
            "whisper_base": True
        }
    }

# Register namespaces
app.include_router(analyze_router, prefix="/api/v1")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
