import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import { getFieldDetail } from '../api/client';
import { getStatusColors, chartTooltipStyle, chartGridStroke, colors } from '../styles/tokens';
import { LoadingSpinner, ErrorBanner, Card, MetricCard, MetricCardSkeleton, TimeRangeToggle } from './shared';
import RecommendationExplainer from './RecommendationExplainer';
import FieldWeatherCard from './FieldWeatherCard';

// Format timestamp for chart display
function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit' });
}

// Format date for NDVI chart
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function FieldDetail() {
  const { fieldId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState(30); // 7, 30, or 90 days

  useEffect(() => {
    getFieldDetail(fieldId)
      .then(response => {
        setData(response);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [fieldId]);

  // Calculate trend based on recent values
  const calculateTrend = (values) => {
    if (!values || values.length < 2) return 'stable';
    const recent = values.slice(0, 5);
    const older = values.slice(5, 10);
    if (recent.length === 0 || older.length === 0) return 'stable';
    const recentAvg = recent.reduce((a, b) => a + b.value, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b.value, 0) / older.length;
    const diff = recentAvg - olderAvg;
    if (Math.abs(diff) < 1) return 'stable';
    return diff > 0 ? 'up' : 'down';
  };

  // Filter data by time range
  const filterByTimeRange = (dataArray, days) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return dataArray.filter(point => {
      const pointDate = new Date(point.timestamp || point.date);
      return pointDate >= cutoff;
    });
  };

  // Memoized filtered data
  const filteredData = useMemo(() => {
    if (!data) return null;
    return {
      soil: filterByTimeRange(data.soil_moisture_timeseries, timeRange),
      temp: filterByTimeRange(data.temperature_timeseries, timeRange),
      ndvi: filterByTimeRange(data.ndvi_timeseries, timeRange),
    };
  }, [data, timeRange]);

  if (loading) {
    return (
      <div>
        <div className="flex items-center gap-4 mb-6">
          <Link to="/" className="text-slate-400 hover:text-white">← Back</Link>
          <div className="h-8 w-40 bg-slate-700 rounded animate-pulse"></div>
        </div>
        <div className="h-20 bg-slate-800 rounded-lg mb-6 animate-pulse"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorBanner message={error} />;
  }

  // Check for empty data
  if (!data || !data.soil_moisture_timeseries?.length) {
    return (
      <div>
        <div className="flex items-center gap-4 mb-6">
          <Link to="/" className="text-slate-400 hover:text-white">← Back</Link>
          <h2 className="text-2xl font-bold text-white">{fieldId}</h2>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-white mb-2">No readings yet</h3>
          <p className="text-slate-400">No sensor readings available for this field. Check that sensors are online.</p>
        </div>
      </div>
    );
  }

  const { field, soil_moisture_timeseries, temperature_timeseries } = data;
  const triggers = data.triggers || [];
  const inlineWeather = data.weather || null;
  const fieldColors = getStatusColors(field.status);

  // Get status for soil moisture
  const getSoilStatus = (value) => {
    if (value < 18) return 'critical';
    if (value < 25) return 'warning';
    return 'ok';
  };

  // Get status for NDVI
  const getNdviStatus = (value) => {
    if (value < 0.35) return 'critical';
    if (value < 0.5) return 'warning';
    return 'ok';
  };

  // Calculate trends
  const soilTrend = calculateTrend(soil_moisture_timeseries);
  const tempTrend = calculateTrend(temperature_timeseries);

  // Prepare chart data using filtered data
  const soilData = [...(filteredData?.soil || [])].reverse().map(point => ({
    time: formatTimestamp(point.timestamp),
    value: point.value,
  }));

  const tempData = [...(filteredData?.temp || [])].reverse().map(point => ({
    time: formatTimestamp(point.timestamp),
    value: point.value,
  }));

  const ndviData = [...(filteredData?.ndvi || [])].reverse().map(point => ({
    date: formatDate(point.date),
    ndvi: point.mean_ndvi,
  }));

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link to="/" className="text-slate-400 hover:text-white">← Back</Link>
        <h2 className="text-2xl font-bold text-white">{field.name}</h2>
      </div>

      {/* Enhanced Status Banner */}
      <div className={`rounded-lg p-4 mb-6 border-l-4 ${fieldColors.bgSubtle} ${fieldColors.borderSubtle} border ${fieldColors.border}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <span className={`font-bold uppercase text-sm px-2 py-0.5 rounded ${fieldColors.bg} text-white`}>
              {field.status}
            </span>
            <span className={`text-sm ${fieldColors.text}`}>
              Soil: {field.soil_moisture_pct}% | NDVI: {field.ndvi.toFixed(2)}
            </span>
          </div>
        </div>
        <p className={`${fieldColors.text}`}>{field.recommendation}</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          icon="💧"
          label="Soil Moisture"
          value={field.soil_moisture_pct}
          unit="%"
          trend={soilTrend}
          status={getSoilStatus(field.soil_moisture_pct)}
          subtext={soilTrend === 'down' ? 'Decreasing' : soilTrend === 'up' ? 'Increasing' : 'Stable'}
        />
        <MetricCard
          icon="🌱"
          label="NDVI"
          value={field.ndvi.toFixed(2)}
          trend={ndviData.length > 1 ? (ndviData[ndviData.length-1]?.ndvi > ndviData[0]?.ndvi ? 'up' : 'down') : 'stable'}
          status={getNdviStatus(field.ndvi)}
          subtext="Vegetation health"
        />
        <MetricCard
          icon="🌡️"
          label="Temperature"
          value={tempData[tempData.length-1]?.value?.toFixed(1) || '--'}
          unit="°C"
          trend={tempTrend}
          subtext="Current reading"
        />
        <MetricCard
          icon="💦"
          label="Next Irrigation"
          value={field.status === 'critical' ? 'Now' : field.status === 'warning' ? '24h' : '48h+'}
          subtext={field.status === 'ok' ? 'No action needed' : 'Recommended'}
          status={field.status}
        />
      </div>

      {/* Recommendation Explainer & Inline Weather */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <RecommendationExplainer recommendation={field.recommendation} triggers={triggers} />
        <FieldWeatherCard weather={inlineWeather} />
      </div>

      {/* Time Range Toggle */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Sensor Data</h3>
        <TimeRangeToggle value={timeRange} onChange={setTimeRange} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Soil Moisture Chart */}
        <Card title="Soil Moisture (%)">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={soilData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} />
                <XAxis 
                  dataKey="time" 
                  stroke="#94a3b8" 
                  fontSize={10}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={12}
                  domain={[0, 50]}
                  tickLine={false}
                />
                <Tooltip contentStyle={chartTooltipStyle} />
                {/* Threshold bands */}
                <ReferenceArea y1={0} y2={18} fill={colors.status.critical.hex} fillOpacity={0.08} />
                <ReferenceArea y1={18} y2={25} fill={colors.status.warning.hex} fillOpacity={0.08} />
                <ReferenceArea y1={25} y2={50} fill={colors.status.ok.hex} fillOpacity={0.06} />
                <ReferenceLine y={18} stroke={colors.status.critical.hex} strokeDasharray="5 5" label={{ value: 'Critical', fill: colors.status.critical.hex, fontSize: 10 }} />
                <ReferenceLine y={25} stroke={colors.status.ok.hex} strokeDasharray="5 5" label={{ value: 'OK', fill: colors.status.ok.hex, fontSize: 10 }} />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={colors.status.info.hex} 
                  strokeWidth={2}
                  dot={false}
                  name="Soil Moisture"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Temperature Chart */}
        <Card title="Temperature (°C)">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tempData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} />
                <XAxis 
                  dataKey="time" 
                  stroke="#94a3b8" 
                  fontSize={10}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={12}
                  domain={[10, 40]}
                  tickLine={false}
                />
                <Tooltip contentStyle={chartTooltipStyle} />
                {/* Temperature threshold bands */}
                <ReferenceArea y1={10} y2={10} fill={colors.status.critical.hex} fillOpacity={0.08} />
                <ReferenceArea y1={35} y2={40} fill={colors.status.critical.hex} fillOpacity={0.08} />
                <ReferenceArea y1={10} y2={35} fill={colors.status.ok.hex} fillOpacity={0.06} />
                <ReferenceLine y={10} stroke={colors.status.info.hex} strokeDasharray="5 5" label={{ value: 'Cold', fill: colors.status.info.hex, fontSize: 10 }} />
                <ReferenceLine y={35} stroke={colors.status.critical.hex} strokeDasharray="5 5" label={{ value: 'Heat', fill: colors.status.critical.hex, fontSize: 10 }} />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={colors.status.warning.hex}
                  strokeWidth={2}
                  dot={false}
                  name="Temperature"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* NDVI Trend Chart */}
        <Card title="NDVI Trend (Weekly)" className="lg:col-span-2">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ndviData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} />
                <XAxis 
                  dataKey="date" 
                  stroke="#94a3b8" 
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={12}
                  domain={[0, 1]}
                  tickLine={false}
                />
                <Tooltip contentStyle={chartTooltipStyle} />
                {/* NDVI stress band */}
                <ReferenceArea y1={0} y2={0.35} fill={colors.status.critical.hex} fillOpacity={0.08} />
                <ReferenceLine y={0.35} stroke={colors.status.critical.hex} strokeDasharray="5 5" label={{ value: 'Stress', fill: colors.status.critical.hex, fontSize: 10 }} />
                <Bar 
                  dataKey="ndvi" 
                  fill={colors.status.ok.hex}
                  radius={[4, 4, 0, 0]}
                  name="NDVI"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
