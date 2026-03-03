"""Tests for the /farms endpoint."""

import pytest


@pytest.mark.anyio
async def test_list_farms_returns_three_farms(client):
    """GET /farms should return all 3 mock farms."""
    response = await client.get("/farms")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 3


@pytest.mark.anyio
async def test_farm_has_required_fields(client):
    """Each farm should have the expected fields."""
    response = await client.get("/farms")
    data = response.json()
    required_keys = {"farm_id", "name", "region", "field_count", "status", "coordinates"}
    for farm in data:
        assert required_keys.issubset(farm.keys()), f"Missing keys in farm: {farm}"
        assert "lat" in farm["coordinates"]
        assert "lng" in farm["coordinates"]


@pytest.mark.anyio
async def test_farm_ids_are_unique(client):
    """Farm IDs should be unique."""
    response = await client.get("/farms")
    data = response.json()
    farm_ids = [f["farm_id"] for f in data]
    assert len(farm_ids) == len(set(farm_ids))
