# IgranSense Hardware Specification

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FARM LEVEL                               │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  Field 1    │  │  Field 2    │  │  Field 3    │              │
│  │  Sensors    │  │  Sensors    │  │  Sensors    │  ...         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
│         │                │                │                      │
│         └────────────────┼────────────────┘                      │
│                          │ LoRa 868 MHz                          │
│                          ▼                                       │
│              ┌───────────────────────┐                           │
│              │   Edge Gateway (MDC)   │                          │
│              │   Raspberry Pi 4       │                          │
│              └───────────┬───────────┘                           │
│                          │ WiFi/4G/Ethernet                      │
└──────────────────────────┼──────────────────────────────────────┘
                           │
                           ▼
               ┌───────────────────────┐
               │    Cloud Dashboard    │
               │    (Optional sync)    │
               └───────────────────────┘
```

## Edge Gateway (MDC - Main Data Concentrator)

### Primary Option: Raspberry Pi 4 Model B

| Specification | Value |
|---------------|-------|
| Processor | Broadcom BCM2711, Quad-core Cortex-A72 @ 1.5GHz |
| RAM | 4GB LPDDR4-3200 (recommended) |
| Storage | 32GB microSD (Class 10) |
| Connectivity | 2.4/5GHz WiFi, Gigabit Ethernet, Bluetooth 5.0 |
| Power | 5V DC, 3A via USB-C |
| Operating Temp | 0°C to 50°C |

### LoRa Module

| Specification | Value |
|---------------|-------|
| Module | RAK2245 Pi HAT or Dragino LoRa GPS HAT |
| Frequency | 868 MHz (EU) / 915 MHz (US) |
| Sensitivity | -148 dBm |
| TX Power | Up to +20 dBm |
| Range | 2-15 km (line of sight) |

### Enclosure Requirements
- IP65 rated outdoor enclosure
- Ventilation for heat dissipation
- DIN rail mounting option
- Cable glands for sensor connections

## Field Sensor Node

### Microcontroller: ESP32-WROOM-32

| Specification | Value |
|---------------|-------|
| Processor | Xtensa dual-core 32-bit @ 240MHz |
| RAM | 520 KB SRAM |
| Flash | 4 MB |
| WiFi | 802.11 b/g/n (backup mode) |
| Power | 3.3V, deep sleep: 10μA |
| Operating Temp | -40°C to +85°C |

### LoRa Transceiver: SX1276

| Specification | Value |
|---------------|-------|
| Frequency | 868/915 MHz |
| Modulation | LoRa / FSK |
| Sensitivity | -148 dBm |
| TX Power | +20 dBm max |
| Current (TX) | 120 mA @ +20dBm |

## Sensors

### Soil Moisture: Capacitive v2.0

| Specification | Value |
|---------------|-------|
| Operating Voltage | 3.3V - 5V |
| Output | Analog (0-3V) |
| Measurement Range | 0-100% VWC |
| Accuracy | ±3% (after calibration) |
| Probe Length | 98mm |
| Lifespan | 2+ years (no corrosion) |

**Note**: Resistive sensors not recommended due to electrolysis degradation.

### Temperature/Humidity: DHT22 / AM2302

| Specification | Value |
|---------------|-------|
| Temperature Range | -40°C to +80°C |
| Temperature Accuracy | ±0.5°C |
| Humidity Range | 0-100% RH |
| Humidity Accuracy | ±2% RH |
| Sampling Rate | 0.5 Hz (2s minimum) |

### Alternative: SHT31 (Higher Accuracy)

| Specification | Value |
|---------------|-------|
| Temperature Accuracy | ±0.2°C |
| Humidity Accuracy | ±1.5% RH |
| Interface | I2C |
| Power | 2.4-5.5V |

## Power System

### Solar Panel

| Specification | Value |
|---------------|-------|
| Type | Monocrystalline |
| Power | 6W (sensor node) / 20W (gateway) |
| Voltage | 6V / 12V |
| Size | 200×170mm / 350×280mm |

### Battery

| Specification | Value |
|---------------|-------|
| Type | LiFePO4 (recommended) or Li-ion |
| Capacity | 6000mAh (sensor) / 20000mAh (gateway) |
| Voltage | 3.7V / 12V |
| Charge Controller | TP4056 / MPPT module |

### Power Budget (Sensor Node)

| State | Current | Duration | Energy/Day |
|-------|---------|----------|------------|
| Deep Sleep | 10μA | 23.5h | 0.235 mAh |
| Active (reading) | 50mA | 10s×6/hr | 0.83 mAh |
| LoRa TX | 120mA | 1s×6/hr | 0.20 mAh |
| **Total** | | | **~30 mAh/day** |

With 6000mAh battery: **~200 days** autonomy (no solar).

## NDVI Data Source

### Satellite Imagery (Current Implementation)

| Source | Resolution | Revisit | Cost |
|--------|------------|---------|------|
| Sentinel-2 | 10m | 5 days | Free |
| Planet Labs | 3m | Daily | Paid |
| Landsat 8 | 30m | 16 days | Free |

### Future: Drone-Based NDVI

| Specification | Value |
|---------------|-------|
| Camera | Modified RGB or Multispectral (RedEdge-MX) |
| Flight Altitude | 50-100m |
| Resolution | 2-5 cm/pixel |
| Coverage | 20 ha/flight |

## Bill of Materials (Per Field Unit)

| Component | Unit Cost (USD) | Quantity |
|-----------|-----------------|----------|
| ESP32 DevKit | $8 | 1 |
| SX1276 LoRa Module | $6 | 1 |
| Capacitive Soil Sensor | $4 | 1 |
| DHT22 Temp/Humidity | $5 | 1 |
| 6W Solar Panel | $15 | 1 |
| 6000mAh LiFePO4 | $12 | 1 |
| Charge Controller | $3 | 1 |
| Waterproof Enclosure | $8 | 1 |
| Cables & Connectors | $5 | 1 |
| **Total per node** | **~$66** | |

### Gateway Cost

| Component | Unit Cost (USD) |
|-----------|-----------------|
| Raspberry Pi 4 (4GB) | $55 |
| LoRa HAT | $30 |
| 32GB microSD | $10 |
| 20W Solar Panel | $35 |
| 20Ah Battery | $40 |
| Enclosure (IP65) | $25 |
| **Total** | **~$195** |

## Installation Guidelines

1. **Sensor Placement**
   - Soil sensor at 15cm depth (root zone)
   - Away from irrigation emitters (50cm minimum)
   - Representative of field conditions

2. **Solar Panel Orientation**
   - South-facing (Northern Hemisphere)
   - 30-45° tilt angle for Morocco
   - Clear of shadows 9AM-3PM

3. **LoRa Antenna**
   - Vertically oriented
   - Above crop canopy
   - Line of sight to gateway preferred

---

*Version: 1.0*  
*Last Updated: February 28, 2026*
