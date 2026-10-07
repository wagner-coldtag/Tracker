// src/reports/TemperatureReport.jsx
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Svg,
  Line,
  Rect,
  Polyline,
} from "@react-pdf/renderer";
import React from "react";
import Logo from "../global/Logo.png";

/* ---------- Palette (same colors as the app) ---------- */
const BRAND = "#1BB5F7";
const BRAND_DARK = "#0B8FD6"; // readable on white for text
const ALERT = "#e5695a";
const ALERT_DARK = "#c9483a";
const INK = "#1f2a40";
const MUTED = "#6b7280";
const BORDER = "#e2e8f0";
const SURFACE = "#f5f8fb";
const BAND = "#e6f6fe";

/* ---------- Helpers ---------- */
const isValidLimit = (v) => v !== undefined && v !== null && v !== "" && !Number.isNaN(Number(v));

const formatDateTime = (date) =>
  new Date(date).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const formatAxisLabel = (seconds) =>
  new Date(Number(seconds) * 1000)
    .toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
    .replace(",", "");

const formatDuration = (s) => {
  if (!Number.isFinite(s) || s < 0) return "N/A";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m} min`;
  return `${sec} s`;
};

const NOTIFICATION_TYPES = {
  TemperatureTooHigh: "Temperatura acima do limite",
  TemperatureTooLow: "Temperatura abaixo do limite",
};
const typeLabel = (type) => NOTIFICATION_TYPES[type] ?? type ?? "N/A";

// Keeps the chart light for long periods, preserving peaks: each bucket keeps its min and max.
const downsample = (data, maxPoints = 400) => {
  if (data.length <= maxPoints) return data;
  const buckets = Math.floor(maxPoints / 2);
  const size = data.length / buckets;
  const out = [];
  for (let b = 0; b < buckets; b++) {
    const start = Math.floor(b * size);
    const end = Math.min(data.length, Math.floor((b + 1) * size));
    if (start >= end) continue;
    let minI = start;
    let maxI = start;
    for (let i = start; i < end; i++) {
      if (data[i].temp < data[minI].temp) minI = i;
      if (data[i].temp > data[maxI].temp) maxI = i;
    }
    if (minI === maxI) out.push(data[minI]);
    else if (minI < maxI) out.push(data[minI], data[maxI]);
    else out.push(data[maxI], data[minI]);
  }
  return out;
};

/* ---------- Chart ---------- */
const CHART_W = 515;
const CHART_H = 230;
const M = { top: 18, right: 16, bottom: 30, left: 38 };

const TemperatureChart = ({ data, min, max, hasMin, hasMax }) => {
  const sorted = [...data].sort((a, b) => a.time - b.time);
  const sampled = downsample(sorted);

  // Y domain covers the readings and the ideal range
  let low = Infinity;
  let high = -Infinity;
  for (const d of sorted) {
    if (d.temp < low) low = d.temp;
    if (d.temp > high) high = d.temp;
  }
  if (hasMin) low = Math.min(low, min);
  if (hasMax) high = Math.max(high, max);
  const yMin = Math.floor(low) - 1;
  const yMax = Math.ceil(high) + 1;

  const minTime = sorted[0].time;
  const maxTime = sorted[sorted.length - 1].time;
  const span = maxTime - minTime || 1;

  const plotW = CHART_W - M.left - M.right;
  const plotH = CHART_H - M.top - M.bottom;
  const plotBottom = M.top + plotH;
  const xFor = (t) => M.left + ((t - minTime) / span) * plotW;
  const yFor = (v) => M.top + (1 - (v - yMin) / (yMax - yMin)) * plotH;
  const isOut = (v) => (hasMax && v > max) || (hasMin && v < min);

  const points = sampled.map((d) => ({ x: xFor(d.time), y: yFor(d.temp), out: isOut(d.temp) }));

  // Group consecutive segments with the same state into runs (blue = in range, coral = out)
  const runs = [];
  let current = null;
  for (let i = 0; i < points.length - 1; i++) {
    const out = points[i].out || points[i + 1].out;
    if (!current || current.out !== out) {
      current = { out, points: [points[i]] };
      runs.push(current);
    }
    current.points.push(points[i + 1]);
  }

  const yTicks = Array.from({ length: 6 }, (_, i) => yMin + (i * (yMax - yMin)) / 5);
  const xTicks = Array.from({ length: 5 }, (_, i) => minTime + (i * span) / 4);

  return (
    <Svg width={CHART_W} height={CHART_H}>
      {/* Ideal range band */}
      {hasMin && hasMax && (
        <Rect x={M.left} y={yFor(max)} width={plotW} height={yFor(min) - yFor(max)} fill={BAND} />
      )}

      {/* Horizontal grid + Y labels */}
      {yTicks.map((t, i) => (
        <React.Fragment key={`y-${i}`}>
          <Line
            x1={M.left}
            y1={yFor(t)}
            x2={CHART_W - M.right}
            y2={yFor(t)}
            stroke="#e5e7eb"
            strokeWidth={0.5}
          />
          <Text x={M.left - 6} y={yFor(t) + 2.5} fontSize={7} fill={MUTED} textAnchor="end">
            {t.toFixed(1)}
          </Text>
        </React.Fragment>
      ))}

      {/* Limit lines */}
      {hasMax && (
        <>
          <Line
            x1={M.left}
            y1={yFor(max)}
            x2={CHART_W - M.right}
            y2={yFor(max)}
            stroke={ALERT}
            strokeWidth={0.8}
            strokeDasharray="4 3"
          />
          <Text x={CHART_W - M.right - 2} y={yFor(max) - 3} fontSize={7} fill={ALERT_DARK} textAnchor="end">
            {`Máx ${max}°`}
          </Text>
        </>
      )}
      {hasMin && (
        <>
          <Line
            x1={M.left}
            y1={yFor(min)}
            x2={CHART_W - M.right}
            y2={yFor(min)}
            stroke={ALERT}
            strokeWidth={0.8}
            strokeDasharray="4 3"
          />
          <Text x={CHART_W - M.right - 2} y={yFor(min) + 9} fontSize={7} fill={ALERT_DARK} textAnchor="end">
            {`Mín ${min}°`}
          </Text>
        </>
      )}

      {/* Bottom axis */}
      <Line x1={M.left} y1={plotBottom} x2={CHART_W - M.right} y2={plotBottom} stroke="#9ca3af" strokeWidth={0.8} />

      {/* Temperature line, colored by state */}
      {runs.map((run, i) => (
        <Polyline
          key={`run-${i}`}
          points={run.points.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke={run.out ? ALERT : BRAND}
          strokeWidth={1.6}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ))}

      {/* X ticks + labels */}
      {xTicks.map((t, i) => (
        <React.Fragment key={`x-${i}`}>
          <Line x1={xFor(t)} y1={plotBottom} x2={xFor(t)} y2={plotBottom + 4} stroke="#9ca3af" strokeWidth={0.8} />
          <Text
            x={xFor(t)}
            y={plotBottom + 14}
            fontSize={7}
            fill={MUTED}
            textAnchor={i === 0 ? "start" : i === xTicks.length - 1 ? "end" : "middle"}
          >
            {formatAxisLabel(t)}
          </Text>
        </React.Fragment>
      ))}

      <Text x={M.left} y={10} fontSize={7} fill={MUTED}>
        Temperatura (°C)
      </Text>
    </Svg>
  );
};

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  page: {
    paddingTop: 30,
    paddingHorizontal: 40,
    paddingBottom: 56,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: INK,
  },
  topBar: { position: "absolute", top: 0, left: 0, right: 0, height: 6, backgroundColor: BRAND },

  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  eyebrow: { fontSize: 8, letterSpacing: 1.2, color: BRAND_DARK, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  title: { fontSize: 18, fontFamily: "Helvetica-Bold", color: INK },

  metaBox: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: SURFACE,
    borderRadius: 6,
    paddingTop: 10,
    paddingHorizontal: 12,
    paddingBottom: 4,
    marginTop: 14,
    marginBottom: 16,
  },
  metaItem: { width: "50%", marginBottom: 8, paddingRight: 8 },
  metaLabel: { fontSize: 7, letterSpacing: 0.8, color: MUTED, marginBottom: 2 },
  metaValue: { fontSize: 10, fontFamily: "Helvetica-Bold", color: INK },

  banner: {
    borderLeftWidth: 4,
    borderLeftStyle: "solid",
    borderRadius: 4,
    padding: 10,
    marginBottom: 16,
  },
  bannerTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", marginBottom: 3 },
  text: { lineHeight: 1.4, color: INK },

  sectionTitleRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  sectionTitleBar: { width: 3, height: 12, backgroundColor: BRAND, borderRadius: 2, marginRight: 6 },
  sectionTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", color: INK },
  section: { marginBottom: 18 },

  kpiRow: { flexDirection: "row", marginBottom: 8 },
  kpiCard: {
    flex: 1,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: BORDER,
    borderLeftWidth: 3,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  kpiLabel: { fontSize: 7, letterSpacing: 0.6, color: MUTED, marginBottom: 3 },
  kpiValue: { fontSize: 15, fontFamily: "Helvetica-Bold" },

  legendRow: { flexDirection: "row", justifyContent: "center", marginTop: 4 },
  legendItem: { flexDirection: "row", alignItems: "center", marginHorizontal: 8 },
  legendSwatch: { width: 14, height: 3, borderRadius: 2, marginRight: 4 },
  legendText: { fontSize: 8, color: MUTED },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: BAND,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  tableHeaderCell: { fontSize: 8, fontFamily: "Helvetica-Bold", color: BRAND_DARK },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderBottomWidth: 0.5,
    borderBottomStyle: "solid",
    borderBottomColor: BORDER,
  },
  tableCell: { fontSize: 8.5, color: INK },

  footer: {
    position: "absolute",
    bottom: 22,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.5,
    borderTopStyle: "solid",
    borderTopColor: BORDER,
    paddingTop: 6,
  },
  footerText: { fontSize: 8, color: MUTED },
});

const COLS = { time: 1.3, type: 1.7, temp: 0.8, duration: 0.9, action: 2.1, justified: 0.9 };

/* ---------- Small components ---------- */
const MetaItem = ({ label, value }) => (
  <View style={styles.metaItem}>
    <Text style={styles.metaLabel}>{label}</Text>
    <Text style={styles.metaValue}>{value}</Text>
  </View>
);

const SectionTitle = ({ children }) => (
  <View style={styles.sectionTitleRow} minPresenceAhead={80}>
    <View style={styles.sectionTitleBar} />
    <Text style={styles.sectionTitle}>{children}</Text>
  </View>
);

/* ---------- Report ---------- */
const TemperatureReport = ({ device, startDate, endDate, data }) => {
  const readings = data ?? [];
  const hasMin = isValidLimit(device?.minTemp);
  const hasMax = isValidLimit(device?.maxTemp);
  const min = hasMin ? Number(device.minTemp) : null;
  const max = hasMax ? Number(device.maxTemp) : null;
  const hasLimits = hasMin || hasMax;

  // Reading statistics (plain loop: safe for large arrays)
  let stats = null;
  if (readings.length > 0) {
    let sum = 0;
    let low = Infinity;
    let high = -Infinity;
    let inRange = 0;
    for (const d of readings) {
      sum += d.temp;
      if (d.temp < low) low = d.temp;
      if (d.temp > high) high = d.temp;
      if ((!hasMax || d.temp <= max) && (!hasMin || d.temp >= min)) inRange += 1;
    }
    stats = {
      avg: sum / readings.length,
      low,
      high,
      percentInRange: hasLimits ? (inRange / readings.length) * 100 : null,
    };
  }

  // Notifications inside the selected period
  const startSec = new Date(startDate).getTime() / 1000;
  const endSec = new Date(endDate).getTime() / 1000;
  const notifications = (device?.notifications ?? [])
    .filter((n) => {
      const t = Number(n.details?.triggeredAt);
      return t >= startSec && t <= endSec;
    })
    .sort((a, b) => Number(a.details.triggeredAt) - Number(b.details.triggeredAt));
  const totalAlerts = notifications.length;

  // Longest violation among resolved alerts
  const durations = notifications
    .filter((n) => n.details?.solvedAt)
    .map((n) => Number(n.details.solvedAt) - Number(n.details.triggeredAt))
    .filter((s) => Number.isFinite(s) && s >= 0);
  const longestViolation = durations.length ? formatDuration(Math.max(...durations)) : null;

  // Status banner + summary sentence
  const percentage = stats?.percentInRange;
  let tone;
  let statusTitle;
  let summaryText;

  if (percentage == null) {
    tone = { color: MUTED, bg: SURFACE };
    statusTitle = "Faixa de temperatura não definida";
    summaryText = "Não foi possível avaliar a conformidade, pois este sensor não possui faixa ideal configurada.";
  } else if (percentage === 100) {
    tone = { color: BRAND_DARK, bg: "#eaf7fe" };
    statusTitle = "Todas as leituras dentro da faixa";
    summaryText = "As temperaturas estiveram sempre dentro da faixa esperada.";
  } else if (percentage >= 90) {
    tone = { color: ALERT_DARK, bg: "#fdf0ee" };
    statusTitle = "Leituras fora da faixa detectadas";
    summaryText = "As temperaturas estiveram normalmente dentro da faixa esperada.";
  } else if (percentage >= 70) {
    tone = { color: ALERT_DARK, bg: "#fdf0ee" };
    statusTitle = "Leituras fora da faixa detectadas";
    summaryText = "Houve diversas ocorrências de temperaturas fora da faixa esperada.";
  } else {
    tone = { color: ALERT_DARK, bg: "#fdf0ee" };
    statusTitle = "Atenção: maioria das leituras fora da faixa";
    summaryText = "A maioria das leituras esteve fora da faixa recomendada, indicando um possível problema.";
  }
  summaryText += totalAlerts === 1 ? " Foi emitido 1 alerta" : ` Foram emitidos ${totalAlerts} alertas`;
  summaryText += longestViolation
    ? ` e o maior tempo fora das especificações foi de ${longestViolation}.`
    : ".";

  const kpis = [
    {
      label: "TEMPERATURA MÉDIA",
      value: stats ? `${stats.avg.toFixed(1)}°C` : "N/A",
      color: BRAND_DARK,
    },
    {
      label: "TEMPERATURA MÍNIMA",
      value: stats ? `${stats.low.toFixed(1)}°C` : "N/A",
      color: stats && hasMin && stats.low < min ? ALERT_DARK : BRAND_DARK,
    },
    {
      label: "TEMPERATURA MÁXIMA",
      value: stats ? `${stats.high.toFixed(1)}°C` : "N/A",
      color: stats && hasMax && stats.high > max ? ALERT_DARK : BRAND_DARK,
    },
    {
      label: "TEMPO DENTRO DA FAIXA",
      value: percentage != null ? `${percentage.toFixed(1)}%` : "N/A",
      color: percentage != null && percentage < 100 ? ALERT_DARK : BRAND_DARK,
    },
    {
      label: "ALERTAS TOTAIS",
      value: String(totalAlerts),
      color: totalAlerts > 0 ? ALERT_DARK : BRAND_DARK,
    },
    {
      label: "MAIOR TEMPO FORA DA FAIXA",
      value: longestViolation ?? "N/A",
      color: longestViolation ? ALERT_DARK : BRAND_DARK,
    },
  ];

  const sensorLabel = device?.name
    ? `${device.name} (${device.device_id})`
    : device?.device_id ?? "N/A";
  const placeLabel = [device?.company, device?.type].filter(Boolean).join(" / ") || "N/A";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Top accent bar on every page */}
        <View fixed style={styles.topBar} />

        {/* Header */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={styles.eyebrow}>COLDTAG SOLUTIONS</Text>
            <Text style={styles.title}>Relatório de Monitoramento de Temperatura</Text>
          </View>
          <Image src={Logo} style={{ width: 90, height: 40, objectFit: "contain" }} />
        </View>

        <View style={styles.metaBox}>
          <MetaItem label="SENSOR" value={sensorLabel} />
          <MetaItem label="EMPRESA / LOCAL" value={placeLabel} />
          <MetaItem label="PERÍODO" value={`${formatDateTime(startDate)} – ${formatDateTime(endDate)}`} />
          <MetaItem label="GERADO EM" value={formatDateTime(new Date())} />
        </View>

        {/* Status + summary */}
        <View
          wrap={false}
          style={[styles.banner, { backgroundColor: tone.bg, borderLeftColor: tone.color }]}
        >
          <Text style={[styles.bannerTitle, { color: tone.color }]}>{statusTitle}</Text>
          <Text style={styles.text}>{summaryText}</Text>
        </View>

        {/* KPIs */}
        <View style={styles.section} wrap={false}>
          <SectionTitle>Indicadores de performance</SectionTitle>
          {[kpis.slice(0, 3), kpis.slice(3)].map((row, r) => (
            <View key={`kpi-row-${r}`} style={styles.kpiRow}>
              {row.map((kpi, i) => (
                <View
                  key={kpi.label}
                  style={[styles.kpiCard, { borderLeftColor: kpi.color }, i < 2 ? { marginRight: 8 } : null]}
                >
                  <Text style={styles.kpiLabel}>{kpi.label}</Text>
                  <Text style={[styles.kpiValue, { color: kpi.color }]}>{kpi.value}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* Chart */}
        <View style={styles.section} wrap={false}>
          <SectionTitle>Evolução da temperatura</SectionTitle>
          {readings.length >= 2 ? (
            <>
              <View style={{ alignItems: "center" }}>
                <TemperatureChart data={readings} min={min} max={max} hasMin={hasMin} hasMax={hasMax} />
              </View>
              <View style={styles.legendRow}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendSwatch, { backgroundColor: BRAND }]} />
                  <Text style={styles.legendText}>Dentro da faixa</Text>
                </View>
                {hasLimits && (
                  <View style={styles.legendItem}>
                    <View style={[styles.legendSwatch, { backgroundColor: ALERT }]} />
                    <Text style={styles.legendText}>Fora da faixa</Text>
                  </View>
                )}
                {hasMin && hasMax && (
                  <View style={styles.legendItem}>
                    <View style={[styles.legendSwatch, { backgroundColor: BAND, height: 8 }]} />
                    <Text style={styles.legendText}>Faixa ideal</Text>
                  </View>
                )}
              </View>
            </>
          ) : (
            <Text style={styles.text}>Dados insuficientes para gerar o gráfico neste período.</Text>
          )}
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <SectionTitle>Notificações</SectionTitle>

          {notifications.length > 0 ? (
            <>
              <View style={styles.tableHeader} wrap={false}>
                <Text style={[styles.tableHeaderCell, { flex: COLS.time }]}>Horário</Text>
                <Text style={[styles.tableHeaderCell, { flex: COLS.type }]}>Tipo</Text>
                <Text style={[styles.tableHeaderCell, { flex: COLS.temp }]}>Temp. (°C)</Text>
                <Text style={[styles.tableHeaderCell, { flex: COLS.duration }]}>Duração</Text>
                <Text style={[styles.tableHeaderCell, { flex: COLS.action }]}>Ação corretiva</Text>
                <Text style={[styles.tableHeaderCell, { flex: COLS.justified }]}>Justificado</Text>
              </View>

              {notifications.map((n, i) => {
                const temps = n.details?.temperatureHistory?.map((t) => t.temperature) ?? [];
                let tempLabel = "N/A";
                if (temps.length > 0) {
                  tempLabel = (temps.reduce((sum, t) => sum + t, 0) / temps.length).toFixed(1);
                } else if (typeof n.details?.currentTemperature === "number") {
                  tempLabel = n.details.currentTemperature.toFixed(1);
                }

                let durationLabel = "—";
                if (n.details?.solvedAt) {
                  durationLabel = formatDuration(Number(n.details.solvedAt) - Number(n.details.triggeredAt));
                } else if (!n.details?.solved) {
                  durationLabel = "Em aberto";
                }

                return (
                  <View
                    key={`${n.details.triggeredAt}-${i}`}
                    wrap={false}
                    style={[styles.tableRow, i % 2 === 1 ? { backgroundColor: SURFACE } : null]}
                  >
                    <Text style={[styles.tableCell, { flex: COLS.time }]}>
                      {formatDateTime(Number(n.details.triggeredAt) * 1000)}
                    </Text>
                    <Text style={[styles.tableCell, { flex: COLS.type }]}>{typeLabel(n.type)}</Text>
                    <Text style={[styles.tableCell, { flex: COLS.temp, fontFamily: "Helvetica-Bold" }]}>
                      {tempLabel}
                    </Text>
                    <Text
                      style={[
                        styles.tableCell,
                        { flex: COLS.duration },
                        durationLabel === "Em aberto" ? { color: ALERT_DARK } : null,
                      ]}
                    >
                      {durationLabel}
                    </Text>
                    <Text style={[styles.tableCell, { flex: COLS.action }]}>
                      {n.details?.correctiveMeasures || "—"}
                    </Text>
                    <Text style={[styles.tableCell, { flex: COLS.justified }]}>
                      {n.details?.justificationProvided ? "Sim" : "Não"}
                    </Text>
                  </View>
                );
              })}
            </>
          ) : (
            <Text style={styles.text}>Não houve notificações no período informado.</Text>
          )}
        </View>

        {/* Footer on every page */}
        <View fixed style={styles.footer}>
          <Text style={styles.footerText}>
            Relatório gerado por Coldtag Solutions · https://www.coldtagsolutions.com
          </Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
};

export default TemperatureReport;