// src/reports/TemperatureReport.jsx
import {
  Document, Page, Text, View,StyleSheet, Image, Svg, Line 
} from "@react-pdf/renderer";
import React from "react";
import Logo from "../global/Logo.png";

// Graph dimensions
const chartWidth = 500;
const chartHeight = 250;
const margin = 50;

const renderGraph = (data) => {
  if (!data || data.length < 2) return null;
  const minTemp = Math.min(...data.map(d => d.temp));
  const maxTemp = Math.max(...data.map(d => d.temp));
  const minTime = Math.min(...data.map((d) => d.time));
  const maxTime = Math.max(...data.map((d) => d.time));
  const yTicks = 5;
  const points = data.map((d) => {
    const time = Number(d.time); // ensure it's a number
    const x = margin + ((time - minTime) / (maxTime - minTime)) * (chartWidth - 2 * margin);
    const y = chartHeight - margin - ((d.temp - minTemp) / (maxTemp - minTemp)) * (chartHeight - 2 * margin);
    return { x, y, time, temp: d.temp };
  });
  
  const lines = points.slice(1).map((p, i) => (
    <Line
      key={`line-${i}`}
      x1={points[i].x}
      y1={points[i].y}
      x2={p.x}
      y2={p.y}
      stroke="#0070f3"
      strokeWidth={2}
    />
  ));

  
  const yLabels = Array.from({ length: yTicks + 1 }, (_, i) => {
    const t = minTemp + (i * (maxTemp - minTemp)) / yTicks;
    const y = chartHeight - margin - ((t - minTemp) / (maxTemp - minTemp)) * (chartHeight - 2 * margin);
    return (
      <React.Fragment key={`y-${i}`}>
        <Line x1={margin - 5} y1={y} x2={margin} y2={y} stroke="#999" />
        <Text
          x={margin - 10}
          y={y + 2}
          fontSize={7}
          fill="#000"
          textAnchor="end"
        >
          {t.toFixed(1)}
        </Text>
      </React.Fragment>
    );
  });
  
  const formatLabel = (timestamp) => {
    const date = new Date(Number(timestamp) * 1000); // convert to ms
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).replace(",", "");
  };
    
  const first = points[0];
  const last = points[points.length - 1];
    
  const xLabels = [
    <React.Fragment key="x-start">
      <Line x1={first.x} y1={chartHeight - margin} x2={first.x} y2={chartHeight - margin + 5} stroke="#999" />
      <Text
        x={first.x}
        y={chartHeight - margin + 14}
        fontSize={7}
        fill="#000"
        textAnchor="middle"
      >
        {formatLabel(first.time)}
      </Text>
    </React.Fragment>,
    <React.Fragment key="x-end">
      <Line x1={last.x} y1={chartHeight - margin} x2={last.x} y2={chartHeight - margin + 5} stroke="#999" />
      <Text
        x={last.x}
        y={chartHeight - margin + 14}
        fontSize={7}
        fill="#000"
        textAnchor="middle"
      >
        {formatLabel(last.time)}
      </Text>
    </React.Fragment>,
  ];
    
  return (
    <Svg width={chartWidth} height={chartHeight}>
      {/* Axes */}
      <Line x1={margin} y1={margin} x2={margin} y2={chartHeight - margin} stroke="#000" />
      <Line x1={margin} y1={chartHeight - margin} x2={chartWidth - margin} y2={chartHeight - margin} stroke="#000" />
  
      {/* Labels */}
      <Text
        x={chartWidth / 2}
        y={chartHeight - 2}
        fontSize={12}
        fill="#000"
        textAnchor="middle"
      >
          Tempo
      </Text>
      <Text
        x={-chartHeight / 2}
        y={15}
        fontSize={12}
        fill="#000"
        textAnchor="middle"
        transform={`rotate(-90)`}
      >
          Temperatura (°C)
      </Text>
  
      {/* Ticks & Labels */}
      {yLabels}
      {xLabels}
  
      {/* Data */}
      {lines}
    </Svg>
  );
};
// Styles
const styles = StyleSheet.create({
  page: {
    padding: 80,
    fontSize: 11,
    fontFamily: "Helvetica",
    color: "#333",
    position: "relative",
  },
  title: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 6,
    fontWeight: "bold",
    color: "rgb(42, 180, 234)",
  },
  subtitle: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 12,
    color: "#444",
  },
  section: {
    marginBottom: 25,
    paddingBottom: 10,
    borderBottom: "1 solid #ccc",
  },
  sectionHeader: {
    fontSize: 13,
    marginBottom: 8,
    fontWeight: "bold",
    color: "rgb(42, 180, 234)",
  },
  text: {
    marginBottom: 4,
    lineHeight: 1.5,
  },
  kpiGrid: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 6,
  },
  kpiItem: {
    width: "50%",
    marginBottom: 8,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#E0E7FF",
    fontWeight: "bold",
    borderBottom: "1 solid #ccc",
    padding: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1 solid #eee",
    padding: 4,
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
  },
});

// Component
const TemperatureReport = ({ device, startDate, endDate, data }) => {
  
  const formatDate = (date) =>
    new Date(date).toLocaleString("pt-BR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatDateTime = (date) =>
    new Date(date).toLocaleString("pt-BR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const metadata = {
    dateRange: `${formatDate(startDate)} – ${formatDate(endDate)}`,
  };
  const minTemp = data && data.length ? Math.min(...data.map(d => d.temp)) : null;
  const maxTemp = data && data.length ? Math.max(...data.map(d => d.temp)) : null;
  let percentInRange = "100%";
  if (device?.maxTemp != null && device?.minTemp != null && data && data.length) {
    const inRangeCount = data.filter(
      (d) => d.temp >= device.minTemp && d.temp <= device.maxTemp
    ).length;
    const percentage = (inRangeCount / data.length) * 100;
    percentInRange = `${percentage.toFixed(1)}%`;
  }
  let totalAlerts = 0;
  if (device?.notifications?.length && startDate && endDate) {
    const start = new Date(startDate).getTime() / 1000;
    const end = new Date(endDate).getTime() / 1000;
    totalAlerts = device.notifications.filter((n) => {
      const triggeredAt = Number(n.details?.triggeredAt); // converte a string para número

      return triggeredAt >= start && triggeredAt <= end;
    }).length;
  }
  let longestViolation = null;
  if (device?.notifications?.length) {
    const start = new Date(startDate).getTime() / 1000;
    const end = new Date(endDate).getTime() / 1000;

    const violations = device.notifications
      .filter((n) =>
        n.details?.triggeredAt &&
      n.details?.solvedAt &&
      Number(n.details.triggeredAt) >= start &&
      Number(n.details.triggeredAt) <= end
      )
      .map((n) => Number(n.details.solvedAt) - Number(n.details.triggeredAt));

  
    if (violations.length) {
      const maxDuration = Math.max(...violations); // in seconds

      const hours = Math.floor(maxDuration / 3600);
      const minutes = Math.floor((maxDuration % 3600) / 60);
      const seconds = maxDuration % 60;

      if (hours > 0) {
        longestViolation = `${hours}h ${minutes}m`;
      } else if (minutes > 0) {
        longestViolation = `${minutes} minutos`;
      } else {
        longestViolation = `${seconds} segundos`;
      }
    }
  }
  const kpis = {
    averageTemp: data && data.length
      ? `${(data.reduce((sum, d) => sum + d.temp, 0) / data.length).toFixed(1)}°C`
      : "N/A",
    maxTemp: maxTemp !== null ? `${maxTemp.toFixed(1)}°C` : "N/A",
    minTemp: minTemp !== null ? `${minTemp.toFixed(1)}°C` : "N/A",
    percentInRange,
    totalAlerts,
    longestViolation: longestViolation || "N/A",
  };
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Title */}
        <Text style={styles.title}>Relatório de Monitoramento de Temperatura</Text>
        <Text style={styles.subtitle}>
          {device?.device_id} -  {device?.company}/{device?.type}
        </Text>
        <Text style={styles.subtitle}>Período: {metadata.dateRange}</Text>
        <Text style={{ ...styles.subtitle, marginBottom: 30 }}>
        Gerado em: {formatDateTime(new Date())}
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Resumo</Text>
          {(() => {
            const percentage = parseFloat(kpis.percentInRange.replace("%", ""));
            let summaryText = "";

            if (percentage === 100) {
              summaryText = "As temperaturas estiveram sempre dentro da faixa esperada.";
            } else if (percentage >= 90) {
              summaryText = "As temperaturas estiveram normalmente dentro da faixa esperada.";
            } else if (percentage >= 70) {
              summaryText = "Houve diversas ocorrências de temperaturas fora da faixa esperada.";
            } else {
              summaryText = "A maioria das leituras esteve fora da faixa recomendada, indicando um possível problema.";
            }

            summaryText += ` Foram emitidos ${kpis.totalAlerts} alertas`;
            if (kpis.longestViolation !== "N/A") {
              summaryText += ` e o maior tempo fora das especificações foi de ${kpis.longestViolation}.`;
            } else {
              summaryText += ".";
            }

            return <Text style={styles.text}>{summaryText}</Text>;
          })()}
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Evolução da temperatura</Text>
          <View style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
            {renderGraph(data)}
          </View>
        </View>

        {/* KPIs */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Indicadores de Performance</Text>
          <View style={styles.kpiGrid}>
            {Object.entries(kpis).map(([label, value], i) => {
              let displayLabel = label;
              if (label === "maxTemp") displayLabel = "Temperatura máxima";
              else if (label === "minTemp") displayLabel = "Temperatura mínima";
              else if (label === "averageTemp") displayLabel = "Temperatura média";
              else if (label === "percentInRange") displayLabel = "Tempo dentro da faixa";
              else if (label === "totalAlerts") displayLabel = "Alertas totais";
              else if (label === "longestViolation") displayLabel = "Maior tempo fora da faixa";

              return (
                <View key={i} style={styles.kpiItem}>
                  <Text>
                    <Text style={{ fontWeight: "bold" }}>{displayLabel}:</Text> {value}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Notificações</Text>

          {device?.notifications?.filter(n => {
            const triggeredAt = Number(n.details?.triggeredAt);
            const start = new Date(startDate).getTime() / 1000;
            const end = new Date(endDate).getTime() / 1000;
            return triggeredAt >= start && triggeredAt <= end;
          }).length > 0 ? (
              <>
                <View style={styles.tableHeader}>
                  <Text style={{ ...styles.tableCell, flex: 1.5 }}>Horário</Text>
                  <Text style={{ ...styles.tableCell, flex: 2.5 }}>Tipo</Text>
                  <Text style={{ ...styles.tableCell, flex: 1 }}>Temperatura (°C)</Text>
                  <Text style={{ ...styles.tableCell, flex: 1 }}>Justificado</Text>
                </View>
                {device.notifications
                  .filter(n => {
                    const triggeredAt = Number(n.details?.triggeredAt);
                    const start = new Date(startDate).getTime() / 1000;
                    const end = new Date(endDate).getTime() / 1000;
                    return triggeredAt >= start && triggeredAt <= end;
                  })
                  .map((n, i) => {
                    const temps = n.details?.temperatureHistory?.map(t => t.temperature) || [];
                    const avgTemp =
                  temps.length > 0
                    ? (temps.reduce((sum, t) => sum + t, 0) / temps.length).toFixed(1)
                    : "N/A";
                    return (
                      <View key={i} style={styles.tableRow}>
                        <Text style={{ ...styles.tableCell, flex: 1.5 }}>
                          {new Date(Number(n.details?.triggeredAt) * 1000).toLocaleString("pt-BR")}
                        </Text>
                        <Text style={{ ...styles.tableCell, flex: 2.5 }}>
                          {n.type === "TemperatureTooHigh" ? "Temperatura acima dos limites" : "N/A"}
                        </Text>
                        <Text style={{ ...styles.tableCell, flex: 1 }}>
                          {avgTemp || "Sem mensagem"}
                        </Text>
                        <Text style={{ ...styles.tableCell, flex: 1 }}>
                          {n.details?.justificationProvided ? "Sim" : "Não"}
                        </Text>
                      </View>);
                  })}
              </>
            ) : (
              <Text>Não houveram notificações no período informado.</Text>
            )}
        </View>
        <View
          style={{
            position: "absolute",
            bottom: 30,
            right: 40,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Image
            src={Logo}
            style={{ width: 80, height: 40, objectFit: "contain", marginRight: 10 }}
          />
          <Text style={{ fontSize: 8, color: "#777" }}>
          Relatório gerado por Coldtag Solutions · https://www.coldtagsolutions.com
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default TemperatureReport;
