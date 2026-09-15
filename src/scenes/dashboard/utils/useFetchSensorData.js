import axios from "axios";
import { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";

const useFetchSensorData = () => {
  const user = JSON.parse(localStorage.getItem("profile"));
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [devices, setDevices] = useState([]);
  const [filteredSensors, setFilteredSensors] = useState([]);

  const [selectedDevice, setSelectedDevice] = useState(null);
  const [types, setTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(types[0] ? types[0] : null);

  const [startDate, setStartDate] = useState(() => {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - 1);
    return currentDate;
  });
  const [endDate, setEndDate] = useState(new Date());

  const isInitialized = useRef(false);

  // company único e consistente, usado em todas as chamadas
  const company = user?.company;

  const fetchDevices = async () => {
    try {
      const url = `https://08mwl5gxyj.execute-api.sa-east-1.amazonaws.com/devices?company=${encodeURIComponent(company)}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response was not ok");

      const jsonData = await response.json();
      return jsonData.device_ids || [];
    } catch (error) {
      console.error("Error fetching devices:", error);
      return [];
    }
  };

  const fetchSensorData = async () => {
    try {
      const response = await axios.get(
        `https://nrsx9ksod5.execute-api.sa-east-1.amazonaws.com/prod/sensors?company=${encodeURIComponent(company)}`
      );
      const jsonData = response?.data || [];

      const hasNoType = jsonData.some((item) => !item.type);
      const uniqueTypes = [...new Set(jsonData.map((item) => item.type).filter(Boolean))];

      if (hasNoType) {
        uniqueTypes.push("Sem Local");
      }

      setTypes(uniqueTypes);
      setDevices(jsonData);

      return jsonData;
    } catch (error) {
      console.error("Error fetching sensor data:", error);
      return [];
    }
  };

  const refreshDevices = async () => {
    const fetchedDevices = await fetchDevices();
    const fetchedSensorData = await fetchSensorData();
    const missingDevices = fetchedDevices.filter(
      (device) => !fetchedSensorData.some((sensor) => sensor.device_id === device)
    );

    // Promise.all em vez de forEach com async solto — evita corrida
    // entre os posts e garante que dá pra saber quando terminou
    await Promise.all(
      missingDevices.map(async (device) => {
        try {
          await axios.post("https://nrsx9ksod5.execute-api.sa-east-1.amazonaws.com/prod/sensors", {
            device_id: device,
            company: "Dumb_company",
            type: "miscelaneous",
          });
        } catch (error) {
          console.error(`Failed to create device ${device}:`, error);
        }
      })
    );

    // só refaz o fetch UMA vez, depois de todos os posts terminarem
    if (missingDevices.length > 0) {
      await fetchSensorData();
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp || isNaN(timestamp)) {
      console.error("Invalid timestamp:", timestamp);
      return "Invalid Date";
    }

    const date = new Date(timestamp * 1000);

    if (isNaN(date.getTime())) {
      console.error("Date creation failed for timestamp:", timestamp);
      return "Invalid Date";
    }
    return date.toLocaleString();
  };

  // Roda UMA ÚNICA VEZ na montagem — não depende mais de `devices`,
  // então não entra em loop com o próprio setDevices() de dentro dele
  useEffect(() => {
    const fetchSensorDataAndSetType = async () => {
      const sensorData = await fetchSensorData();

      if (!isInitialized.current) {
        if (sensorData.length > 0) {
          const defaultType = sensorData[0].type || null;
          setSelectedType(defaultType);
          setFilteredSensors(sensorData.filter((device) => device.type === defaultType));
        } else {
          setSelectedType(null);
          setFilteredSensors([]);
        }
        isInitialized.current = true;
      }
    };

    fetchSensorDataAndSetType();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const fetchPackageData = async () => {
      if (!selectedDevice) return;

      try {
        setIsLoading(true);

        const startTimestamp = Math.floor(startDate.getTime() / 1000);
        const endTimestamp = Math.floor(endDate.getTime() / 1000);

        const response = await fetch(
          `https://08mwl5gxyj.execute-api.sa-east-1.amazonaws.com/device-data?company=${encodeURIComponent(company)}&device_id=${selectedDevice}&start_date=${startTimestamp}&end_date=${endTimestamp}`
        );
        if (!response.ok) throw new Error("Network response was not ok");

        const jsonData = await response.json();
        const sortedData = jsonData.sort((a, b) => a.timestamp - b.timestamp);

        const formatData = (deviceData) => {
          return [
            {
              id: "temperature",
              color: "hsl(214, 70%, 50%)",
              data: deviceData.map((item) => ({
                x: item.timestamp,
                y: item.temperature,
                voltage: item.voltage,
                rssi: item.RSSI,
                packages: item.count,
                formattedX: formatTimestamp(item.timestamp),
              })),
            },
            {
              id: "N",
              color: "hsl(153, 70%, 50%)",
              data: deviceData.map((item) => ({
                x: item.timestamp,
                y: item.N,
                formattedX: formatTimestamp(item.timestamp),
              })),
            },
          ];
        };
        setData(formatData(sortedData));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPackageData();
    const intervalId = setInterval(fetchPackageData, 600000);
    return () => clearInterval(intervalId);
  }, [selectedDevice, startDate, endDate]);

  const downloadExcel = () => {
    if (data.length === 0) return;

    const worksheetData = data[0].data.map((item, index) => ({
      Timestamp: formatTimestamp(item.x),
      Temperature: item.y,
      N: data[1]?.data[index]?.y || "No Data",
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "SensorData");

    XLSX.writeFile(workbook, "sensor_report.xlsx");
  };

  const downloadAll = () => {
    if (data.length === 0) return;

    const worksheetData = data[0].data.map((item, index) => ({
      Timestamp: formatTimestamp(item.x),
      Raw_Timestamp: item.x || "No Data",
      Temperature: item.y,
      N: data[1]?.data[index]?.y || "No Data",
      Voltage: item.voltage || "No Data",
      RSSI: item.rssi || "No Data",
      Packages: item.packages || "No Data",
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "SensorData");

    XLSX.writeFile(workbook, "sensor_report.xlsx");
  };

  return {
    isLoading,
    types,
    setTypes,
    filteredSensors,
    setFilteredSensors,
    selectedType,
    setSelectedType,
    data,
    downloadAll,
    downloadExcel,
    setData,
    devices,
    selectedDevice,
    setSelectedDevice,
    startDate,
    formatTimestamp,
    setStartDate,
    endDate,
    setEndDate,
    refreshDevices,
  };
};

export default useFetchSensorData;