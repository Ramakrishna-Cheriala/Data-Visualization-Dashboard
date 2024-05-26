import React from "react";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const LineChart = ({ data }) => {
  const options = {
    scales: {
      x: {
        title: {
          display: true,
          text: "Category Labels",
        },
      },
      y: {
        title: {
          display: true,
          text: "Value",
        },
      },
    },
    plugins: {
      legend: {
        display: true, // Ensure legend is displayed
        labels: {
          // Customize legend text color if needed
          // color: (context) => context.datasetIndex % 2 === 0 ? 'black' : 'gray'
        },
      },
    },
  };

  // Generate an array of random colors for each dataset (up to 10 datasets)
  const generateColors = () => {
    const colors = [];
    for (let i = 0; i < Math.min(data.datasets.length, 10); i++) {
      const r = Math.floor(Math.random() * 256);
      const g = Math.floor(Math.random() * 256);
      const b = Math.floor(Math.random() * 256);
      colors.push(`rgba(${r}, ${g}, ${b}, 0.7)`);
    }
    return colors;
  };

  const randomColors = generateColors();

  return (
    <div className="w-full h-full bg-white">
      <Line
        options={options}
        data={{
          ...data,
          datasets: data.datasets.map((dataset, index) => ({
            ...dataset,
            backgroundColor: randomColors[index],
          })),
        }}
      />
    </div>
  );
};

export default LineChart;
