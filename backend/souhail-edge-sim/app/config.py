"""Configuration settings for the Edge Simulation Service."""

from pathlib import Path

# Base directory of the app
BASE_DIR = Path(__file__).resolve().parent.parent

# Data directory for JSON files
DATA_DIR = BASE_DIR / "data"

# API settings
API_TITLE = "IgranSense Edge Simulation Service"
API_VERSION = "0.1.0"
API_DESCRIPTION = """
FastAPI-based Edge Simulation Service for IgranSense.

Reads local JSON files (sensors, readings, NDVI snapshots, rules),
computes field status using agronomic rules, generates alerts,
and exposes a REST API for the dashboard.

This simulates the behavior of the real edge micro data center (MDC).
"""
