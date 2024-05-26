import React, { useState, useEffect } from "react";
import Applayout from "../components/Layout/Applayout";
import axios from "axios";
import { server } from "../constants/config";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

const FileData = () => {
  const [csvData, setCsvData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const { filePath, totalRows } = useSelector((state) => state.misc);

  useEffect(() => {
    fetchData();
  }, [page, filePath]); // Fetch data whenever page changes

  const fetchData = async () => {
    try {
      const response = await axios.get(`${server}/dashboard/view/${filePath}`, {
        params: {
          page: page,
        },
      });

      // console.log(JSON.parse(response.data));
      const responseData = response.data.replace(/NaN/g, "null");
      const jsonData = JSON.parse(responseData);
      if (jsonData.success) {
        // If it's the first page, set data directly
        if (page === 1) {
          setCsvData(jsonData.data);
          setTotalPages(jsonData.totalPages);
          toast.success("Data fetched successfully");
        } else {
          // If it's not the first page, append new data to existing data
          setCsvData((prevData) => [...prevData, ...jsonData.data]);
        }
      } else {
        console.log(response.data.message);
        toast.error("Error fetching data");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleLoadMore = () => {
    setPage((prevPage) => prevPage + 1); // Increment page to fetch next page of data
  };

  return (
    <Applayout>
      <div className="h-full overflow-x-auto overflow-y-auto">
        <div className="overflow-x-auto m-2 overflow-y-auto">
          <table className="table table-pin-rows table-pin-cols bg-white text-black">
            <thead>
              <tr className="text-base text-white ">
                {csvData.length > 0 && (
                  <th className="border border-gray-400">S.No</th>
                )}
                {csvData.length > 0 &&
                  Object.keys(csvData[0]).map((key) => (
                    <th className="border border-gray-400" key={key}>
                      {key}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {csvData.map((row, index) => (
                <tr key={index}>
                  <td className="border border-gray-400">{index + 1}</td>
                  {Object.values(row).map((value, index) => (
                    <td className="border border-gray-400" key={index}>
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {page < totalPages && (
          <div className="flex justify-center my-4">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={handleLoadMore}
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </Applayout>
  );
};

export default FileData;
