"""
Vercel Serverless Function entry point.

Exposes the FastAPI app as an ASGI handler.
Strips the /api prefix so that FastAPI routes (e.g. /fields) match
requests coming in as /api/fields.
"""

import sys
from pathlib import Path

# Add the backend package to Python path so `from app.main import ...` works
_backend_dir = str(Path(__file__).resolve().parent.parent / "backend" / "souhail-edge-sim")
sys.path.insert(0, _backend_dir)

from app.main import app as fastapi_app  # noqa: E402


async def app(scope, receive, send):
    """ASGI wrapper that strips the /api prefix before forwarding to FastAPI."""
    if scope["type"] in ("http", "websocket"):
        path = scope.get("path", "")
        if path.startswith("/api"):
            scope = dict(scope, path=path[4:] or "/")
    await fastapi_app(scope, receive, send)
