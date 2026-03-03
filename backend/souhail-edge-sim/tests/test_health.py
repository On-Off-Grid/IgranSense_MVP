"""Smoke tests for the health and root endpoints."""

import pytest


@pytest.mark.anyio
async def test_health_returns_200(client):
    """GET /health should return 200 with healthy status."""
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


@pytest.mark.anyio
async def test_root_returns_api_info(client):
    """GET / should return API name and version."""
    response = await client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "name" in data
    assert "version" in data
    assert data["status"] == "running"
