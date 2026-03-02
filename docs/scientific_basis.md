# IgranSense Scientific Basis

## Overview

IgranSense applies established agronomic principles through IoT sensor networks and edge computing to enable precision irrigation management for Mediterranean climate agriculture.

## Soil Moisture Thresholds

### Critical Threshold (18% VWC)
Below 18% volumetric water content (VWC), most vegetable crops experience:
- **Stomatal closure**: Reduced CO₂ uptake limits photosynthesis
- **Turgor loss**: Cell pressure drops, causing wilting
- **Yield impact**: Studies show 15-40% yield reduction when prolonged

**Reference**: Allen et al. (1998) FAO-56 Irrigation and Drainage Paper

### Warning Threshold (25% VWC)
The 18-25% range represents **Management Allowable Depletion (MAD)**:
- Crop can access water but efficiency decreases
- Root zone begins extracting from deeper soil layers
- Optimal time for scheduled irrigation

### Optimal Range (25-45% VWC)
Field capacity for most agricultural soils ranges 25-45% VWC:
- Sandy loam: 25-35%
- Clay loam: 35-45%
- Adequate oxygen availability for root respiration

## NDVI Interpretation

Normalized Difference Vegetation Index correlates with crop health:

| NDVI Range | Interpretation | Action |
|------------|----------------|--------|
| 0.70-1.00 | Healthy, vigorous canopy | Monitor only |
| 0.50-0.70 | Moderate stress or early growth | Investigate |
| 0.30-0.50 | Significant stress | Immediate intervention |
| < 0.30 | Severe stress or bare soil | Critical action |

**Formula**: NDVI = (NIR - Red) / (NIR + Red)

### NDVI + Soil Moisture Correlation
IgranSense correlates NDVI trends with soil moisture to distinguish:
- **Water stress**: Low soil moisture + declining NDVI
- **Nutrient deficiency**: Adequate moisture + declining NDVI
- **Disease/pest**: Localized NDVI drops with normal moisture

## Temperature Considerations

### Evapotranspiration Estimation
Using simplified Penman-Monteith reference evapotranspiration:

$$ET_0 = \frac{0.408 \Delta (R_n - G) + \gamma \frac{900}{T+273} u_2 (e_s - e_a)}{\Delta + \gamma (1 + 0.34 u_2)}$$

Temperature directly affects:
- Vapor pressure deficit (VPD)
- Crop water demand
- Irrigation scheduling recommendations

### Heat Stress Thresholds
- **>35°C**: Most vegetable crops show reduced photosynthetic efficiency
- **>40°C**: Risk of pollen sterility in tomatoes, peppers

## Edge Computing Advantages

### Latency Benefits
- Local rule evaluation: <10ms vs cloud: 200-500ms
- Critical for time-sensitive irrigation triggers
- Operates during network outages

### Data Reduction
- Raw sensor data: ~1KB/reading × 6 readings/hour × 24 hours = 144KB/sensor/day
- Aggregated alerts: ~200 bytes/day
- **99.8% bandwidth reduction** for limited connectivity

## References

1. Allen, R.G., et al. (1998). Crop evapotranspiration - Guidelines for computing crop water requirements. FAO Irrigation and drainage paper 56.

2. Huete, A.R. (1988). A soil-adjusted vegetation index (SAVI). Remote Sensing of Environment, 25(3), 295-309.

3. Steduto, P., et al. (2012). Crop yield response to water. FAO Irrigation and drainage paper 66.

4. Jones, H.G. (2004). Irrigation scheduling: advantages and pitfalls of plant-based methods. Journal of Experimental Botany, 55(407), 2427-2436.
