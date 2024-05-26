import axios from "axios";
import React, { useEffect, useState } from "react";
import { BsFileEarmarkBarGraph } from "react-icons/bs";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import { useSelector } from "react-redux";
import { server } from "../constants/config";
import BarChart from "../components/charts/BarChart";
import BarChartComponent from "../components/charts/Bar2";
import LineChart from "../components/charts/LineChart";

const DataVisualization = () => {
  const cols = ["a", "b", "c", "d", "e", "f", "g", "h"];

  const [selectedColumns, setSelectedColumns] = useState([]);
  const [chartData, setChartData] = useState(null);
  const { filePath, columnDetails } = useSelector((state) => state.misc);

  const handleColumnChange = (e) => {
    const { checked, value } = e.target;
    setSelectedColumns((prevColumns) =>
      checked
        ? [...prevColumns, value]
        : prevColumns.filter((col) => col !== value)
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      if (selectedColumns.length >= 1) {
        const responce = await axios.post(
          `${server}/dashboard/plots/${filePath}`,
          selectedColumns
        );
        console.log(responce.data);
        if (responce.data.success) {
          setChartData(responce.data.data);
        }
      }
    };

    fetchData();
  }, [selectedColumns]);
  console.log(chartData);
  return (
    <div className="flex">
      <div className="w-72 h-screen bg-gray-800">
        <div className="flex">
          <button
            className="tooltip tooltip-info tooltip-right ml-2"
            data-tip="Back"
            onClick={() => window.history.back()}
          >
            <IoArrowBackCircleOutline className="text-2xl  mt-3" />
          </button>
          <h1 className="flex text-2xl text-white mt-4 ml-2">
            <BsFileEarmarkBarGraph className="mt-1 mr-2" />
            Data Visualization
          </h1>
        </div>
        <div>
          <h1 className="text-xl text-white mt-4 ml-4">Select Columns</h1>
          {Object.entries(columnDetails).map(([colName, info]) => (
            <div key={colName} className="form-control">
              <label className="cursor-pointer label">
                <span className="label-text ml-2 text-base">{colName}</span>
                <input
                  type="checkbox"
                  checked={selectedColumns.includes(colName)}
                  onChange={handleColumnChange}
                  value={colName}
                  className="checkbox checkbox-info mr-3"
                />
              </label>
            </div>
          ))}
        </div>
      </div>
      <div className="w-full h-screen overflow-x-auto">
        {chartData && <BarChart data={chartData} />}
        {chartData && <LineChart data={chartData} />}
      </div>
    </div>
  );
};

export default DataVisualization;
