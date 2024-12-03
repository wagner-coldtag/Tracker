import { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx"; // Import xlsx

const useFetchSensorData = () => {
  const user = JSON.parse(localStorage.getItem("profile"));
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [devices, setDevices] = useState([]);
  const [filteredSensors, setFilteredSensors] = useState([]);

  const [selectedDevice, setSelectedDevice] = useState(null);
  const [ types, setTypes ] = useState([]);
  const [selectedType, setSelectedType] = useState(null);

  const [startDate, setStartDate] = useState(() => {
    const currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() - 1);  // Subtract one month
    return currentDate;
  });
  const [endDate, setEndDate] = useState(new Date());

  const fetchDevices = async () => {
    try {
      const company = user.company;
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
      const company = user.Company;  // Get the user's company
      const response = await axios.get(`https://nrsx9ksod5.execute-api.sa-east-1.amazonaws.com/prod/sensors?company=${company}`);
      const jsonData = response?.data || [];
      console.log(response);
      setTypes([...new Set(jsonData.map(item => item.type))]);

      const fetchedDevices = jsonData.map((item) => item);
      setDevices(fetchedDevices);

      return fetchedDevices;
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
    console.log(missingDevices);

    missingDevices.forEach(async (device) => {
      try {
        await axios.post("https://nrsx9ksod5.execute-api.sa-east-1.amazonaws.com/prod/sensors", {
          device_id: device,
          company: "Dumb_company",
          type: "miscelaneous"
        });
        console.log(`Device ${device} created successfully`);
        fetchSensorData();

      } catch (error) {
        console.error(`Failed to create device ${device}:`, error);
      }
    });
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp || isNaN(timestamp)) {
      console.error("Invalid timestamp:", timestamp);
      return "Invalid Date"; // Handle invalid timestamp
    }

    const date = new Date(timestamp * 1000); // Assuming timestamp is in seconds

    if (isNaN(date.getTime())) {
      console.error("Date creation failed for timestamp:", timestamp);
      return "Invalid Date";
    }
    return date.toLocaleString(); // For display purposes
  };

  useEffect(() => {
    fetchSensorData();
  }, []);

  useEffect(() => {
    const fetchPackageData = async () => {
      if (!selectedDevice) return; // Don't fetch if no device is selected

      try {
        setIsLoading(true);
        console.log(isLoading);


        const response = await fetch(`https://08mwl5gxyj.execute-api.sa-east-1.amazonaws.com/device-data?company=CompanyA&device_id=${selectedDevice.device_id}`);
        if (!response.ok) throw new Error("Network response was not ok");

        const jsonData = await response.json();
        const sortedData = jsonData.sort((a, b) => a.timestamp - b.timestamp);

        // Format data with date filtering
        const formatData = (deviceData) => {
          return [
            {
              id: "temperature",
              color: "hsl(214, 70%, 50%)",
              data: deviceData
                .filter(item => item.timestamp && !isNaN(item.timestamp))
                .filter(item => {
                  // Filter by start and end date
                  const itemDate = new Date(item.timestamp * 1000);
                  return itemDate >= startDate && itemDate <= endDate;
                })
                .map(item => {
                  return {
                    x: item.timestamp, // Keep the raw timestamp
                    y: item.temperature,
                    voltage: item.voltage,
                    rssi: item.RSSI,
                    packages: item.count,
                    formattedX: formatTimestamp(item.timestamp), // Store formatted timestamp for display
                  };
                })
            },
            {
              id: "N",
              color: "hsl(153, 70%, 50%)",
              data: deviceData
                .filter(item => item.timestamp && !isNaN(item.timestamp))
                .map(item => ({
                  x: item.timestamp, // Keep the raw timestamp
                  y: item.N,
                  formattedX: formatTimestamp(item.timestamp), // Store formatted timestamp for display
                }))
            }
          ];
        };
        setData(formatData(sortedData.filter(item => item.device_id === selectedDevice?.device_id)));
        setIsLoading(false);

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchPackageData();
    const intervalId = setInterval(fetchPackageData, 600000); // Fetch data every 10 minutes
    return () => clearInterval(intervalId);
  }, [selectedDevice, startDate, endDate]);

  const downloadExcel = () => {
    if (data.length === 0) return;

    const worksheetData = data[0].data.map((item, index) => ({
      Timestamp: formatTimestamp(item.x),
      Temperature: item.y,
      N: data[1]?.data[index]?.y || "No Data" // Add N data if available, else 'No Data'
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


  return { isLoading, types, setTypes, filteredSensors, setFilteredSensors, selectedType, setSelectedType, data, downloadAll, downloadExcel, setData, devices, selectedDevice, setSelectedDevice, startDate, formatTimestamp, setStartDate, endDate, setEndDate, refreshDevices };
};

export default useFetchSensorData;
