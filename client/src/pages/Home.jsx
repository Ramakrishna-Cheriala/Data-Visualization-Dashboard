import React, { useState, useEffect } from "react";
import axios from "axios";
import Papa from "papaparse";
import Applayout from "../components/Layout/Applayout";
import "./styles.css";
import bgImage from "../assets/bg.jpg";
import { server } from "../constants/config";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import {
  setColumnDetails,
  setFilePath,
  setTotalColumns,
  setTotalMissingValues,
  setTotalRows,
} from "../redux/reducer/misc";
import toast from "react-hot-toast";

const Home = () => {
  const dispatch = useDispatch();
  const [fileData, setFileData] = useState([]);
  const [renderedData, setRenderedData] = useState([]);
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [rowCount, setRowCount] = useState(0);
  const [columnInfo, setColumnInfo] = useState({});

  const { filePath } = useSelector((state) => state.misc);

  const handleFileUpload = async (event) => {
    event.preventDefault();
    setIsFileUploaded(true);
    const formData = new FormData();
    // console.log(server);
    formData.append("file", event.target.files[0]);
    const responce = await axios.post(
      `${server}/api/v1/file/upload`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    if (responce.data.success) {
      setRowCount(responce.data.rowCount);
      setColumnInfo(responce.data.columnInfo);
      // console.log(responce.data.rowCount);
      dispatch(setFilePath(responce.data.filePath));
      dispatch(setTotalRows(responce.data.rowCount));
      dispatch(setTotalColumns(responce.data.columnCount));
      dispatch(setColumnDetails(responce.data.columnInfo));
      dispatch(setTotalMissingValues(responce.data.totalMissingValues));
      toast.success("File uploaded successfully");
    } else {
      console.log(responce.data.message);
      toast.error("Error uploading file");
    }
  };

  const { totalRows, totalColumns, totalMissingValues, columnDetails } =
    useSelector((state) => state.misc);

  return (
    <Applayout>
      {!filePath ? (
        <div
          className="w-full flex items-center justify-center h-screen overflow-x-auto"
          style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="text-center animate-fade-in-down">
            <h1 className="text-9xl font-bold mb-4 animate-text-pop">
              Welcome to the Future of Data Visualization
            </h1>
            <p className="text-lg mb-4 animate-text-slide-up">
              Upload your CSV file below to explore your data and create
              interactive visualizations!
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="file-input file-input-bordered file-input-primary w-full max-w-xs text-xl mb-4 animate-pop-in"
            />
          </div>
        </div>
      ) : (
        <div className="w-full h-screen overflow-x-auto">
          <h1 className="text-3xl text-white pt-3 pl-3">File Information</h1>
          <div className="grid grid-cols-3 gap-4 p-6">
            <div className="card w-96 h-48 bg-primary text-primary-content">
              <div className="card-body">
                <h2 className="card-title text-3xl">Rows Count</h2>
                {totalRows ? (
                  <p className="text-5xl pt-4">{totalRows}</p>
                ) : (
                  <p className="text-5xl pt-4">0</p>
                )}
              </div>
            </div>
            {/*  */}
            <div className="card w-96 bg-secondary text-primary-content">
              <div className="card-body">
                <h2 className="card-title text-3xl">Column Count</h2>
                {totalColumns ? (
                  <p className="text-5xl pt-4">{totalColumns}</p>
                ) : (
                  <p className="text-5xl pt-4">0</p>
                )}
              </div>
            </div>
            {/*  */}
            <div className="card w-96 bg-accent text-primary-content">
              <div className="card-body">
                <h2 className="card-title text-3xl">Missing Values</h2>
                {totalMissingValues ? (
                  <p className="text-5xl pt-4">{totalMissingValues}</p>
                ) : (
                  <p className="text-5xl pt-4">0</p>
                )}
              </div>
            </div>
          </div>
          <div className="text-3xl text-white pt-3 pl-3">
            Column Information
          </div>
          <div className="p-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 ">
                <tr>
                  <th className="px-6 py-3 text-center text-base font-medium text-gray-500 uppercase tracking-wider ">
                    Column Name
                  </th>
                  <th className="px-6 py-3 text-center text-base font-medium text-gray-500 uppercase tracking-wider">
                    Data Type
                  </th>
                  <th className="px-6 py-3 text-center text-base font-medium text-gray-500 uppercase tracking-wider">
                    Missing Values
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 text-xl text-center">
                {Object.entries(columnDetails).map(([columnName, info]) => (
                  <tr key={columnName}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {columnName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {Object.values(info).includes(true)
                        ? Object.entries(info).find(
                            ([key, value]) => value === true
                          )
                        : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {info.missingValues}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Applayout>
  );
};

export default Home;
