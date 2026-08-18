import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Thermometer, Droplets, Cpu } from "lucide-react";
import AppShell from "../components/layout/AppShell.jsx";
import Card, { CardHeader } from "../components/ui/Card.jsx";
import StatCard from "../components/ui/StatCard.jsx";
import { LoadingState, ErrorState, EmptyState } from "../components/ui/States.jsx";
import { useDemoMode } from "../context/DemoModeContext.jsx";
import { usePlantContext } from "../context/PlantContext.jsx";
import { useApi } from "../api/useApi.js";

export default function EnvironmentalMonitoring() {
  return (
    <AppShell title="Environmental Monitoring">
      <MonitoringBody />
    </AppShell>
  );
}

function MonitoringBody() {
  const { selectedPlantId } = usePlantContext();
  const { demoMode } = useDemoMode();
  const api = useApi();
  const [readings, setReadings] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!selectedPlantId) return;
    setError(null);
    api.getSensorReadings(selectedPlantId).then(setReadings).catch((e) => setError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlantId]);

  if (!selectedPlantId) {
    return <EmptyState icon={Thermometer} title="No plant selected" description="Choose a plant from the top bar." />;
  }
  if (error) return <ErrorState description={error} />;
  if (!readings) return <LoadingState label="Reading sensor data" />;

  // Real API returns DESC order (newest first); mock is ASC — normalize
  const sorted = [...readings].sort(
    (a, b) => new Date(a.recorded_at || a.timestamp) - new Date(b.recorded_at || b.timestamp)
  );
  const latest = sorted[sorted.length - 1] || readings[0];
  const temp = latest.temperature ?? latest.temperatureC ?? 0;
  const hum = latest.humidity ?? latest.humidityPct ?? 0;

  const chartData = sorted.map((r) => ({
    time: new Date(r.recorded_at || r.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    Temperature: Number((r.temperature ?? r.temperatureC ?? 0).toFixed(1)),
    Humidity: Number((r.humidity ?? r.humidityPct ?? 0).toFixed(1)),
  }));

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard label="Temperature" value={temp.toFixed(1)} unit="°C" icon={Thermometer} />
        <StatCard label="Humidity" value={hum.toFixed(0)} unit="%" icon={Droplets} tone="accent" />
        <StatCard
          label="Sensor source"
          value={demoMode ? "Demo Sensor Mode" : latest.source === "esp32" ? "ESP32 (live)" : "Demo fallback"}
          icon={Cpu}
        />
      </div>

      <Card>
        <CardHeader
          title="Temperature &amp; humidity, last 12 readings"
          subtitle={demoMode ? "Simulated — ESP32 disconnected or Demo Mode is on" : "Live ESP32 + DHT sensor feed"}
        />
        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <AreaChart data={chartData} margin={{ left: -20, right: 10, top: 10 }}>
              <defs>
                <linearGradient id="tempFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="humFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="time" tick={{ fontSize: 12, fill: "var(--color-ink-muted)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "var(--color-ink-muted)" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: "1px solid var(--color-border)", fontSize: 13 }}
              />
              <Area type="monotone" dataKey="Temperature" stroke="var(--color-primary)" fill="url(#tempFill)" strokeWidth={2} />
              <Area type="monotone" dataKey="Humidity" stroke="var(--color-accent)" fill="url(#humFill)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
