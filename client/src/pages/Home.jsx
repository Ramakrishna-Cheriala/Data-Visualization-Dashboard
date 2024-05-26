import React, { useState, useEffect } from "react";
import axios from "axios";
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
import { CiEdit } from "react-icons/ci";
import { MdDelete, MdEdit, MdCancel } from "react-icons/md";

const cols = [
  "Column Name",
  "Data Type",
  "Missing Values",
  "Percentage of Missing Values",
  "Edit",
];

let editColDict = {
  option: "",
  column: "",
  method: "",
  const_value: "",
  fill_type: "",
};

const Home = () => {
  const dispatch = useDispatch();
  const [fileData, setFileData] = useState([]);
  const [renderedData, setRenderedData] = useState([]);
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [rowCount, setRowCount] = useState(0);
  const [columnInfo, setColumnInfo] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [colNameEdit, setColNameEdit] = useState(false);
  const [editColumnInfo, setEditColumnInfo] = useState("");
  const [fillNullValue, setFillNullValue] = useState("Option");
  const [customValue, setCustomValue] = useState();
  const [editInfo, setEditInfo] = useState([]);
  const [isDelete, setIsDelete] = useState(false);
  const [finalEditInfo, setFinalEditInfo] = useState([]);

  const {
    filePath,
    totalRows,
    totalColumns,
    totalMissingValues,
    columnDetails,
  } = useSelector((state) => state.misc);

  const [editColumnName, setEditColumnName] = useState(editColumnInfo);
  // const [colNameEdit, setColNameEdit] = useState(false);

  useEffect(() => {
    setFillNullValue("Option");
    setEditColumnName("");
    setColNameEdit(false);
  }, [editColumnInfo]);

  const handleFileUpload = async (event) => {
    event.preventDefault();
    setIsFileUploaded(true);
    const formData = new FormData();
    // console.log(server);
    formData.append("file", event.target.files[0]);
    const responce = await axios.post(`${server}/dashboard/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    console.log(responce.data.success);
    if (responce.data.success) {
      setRowCount(responce.data.rowCount);
      setColumnInfo(responce.data.columnInfo);
      dispatch(setFilePath(responce.data.fileId));
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

  const FillOptionButton = ({
    name,
    editColumnInfo,
    method,
    fill_type = "",
    const_value = "",
  }) => {
    return (
      <>
        <button
          className=""
          onClick={() => {
            setFillNullValue(name);

            const existingRecordIndex = finalEditInfo.findIndex(
              (record) => record.col_name === editColumnInfo
            );

            if (existingRecordIndex !== -1) {
              // Update existing record
              finalEditInfo[existingRecordIndex].method = method;
              finalEditInfo[existingRecordIndex].fill_type = fill_type;
              finalEditInfo[existingRecordIndex].const_value = const_value;
            } else {
              // Insert new record
              finalEditInfo.push({
                col_name: editColumnInfo,
                handle_null_values: true,
                method: method,
                fill_type: fill_type,
                custom_value: const_value,
                is_delete: false,
                is_rename: false,
                new_name: false,
              });
            }
          }}
        >
          {name}
        </button>
      </>
    );
  };

  console.log(finalEditInfo);

  const handleSubmit = () => {
    if (finalEditInfo.length > 0) {
      axios
        .post(`${server}/dashboard/edit/${filePath}`, finalEditInfo)
        .then((responce) => {
          if (responce.data.success) {
            toast.success(responce.data.message);
            dispatch(setColumnDetails(responce.data.columnInfo));
            dispatch(setTotalRows(responce.data.rowCount));
            dispatch(setTotalColumns(responce.data.columnCount));
            dispatch(setTotalMissingValues(responce.data.totalMissingValues));
            setFinalEditInfo([]);
            setIsEdit(false);
          } else {
            toast.error(responce.data.message);
          }
        })
        .catch((error) => {
          console.log(error);
          toast.error("Something went wrong");
        });
    }
  };

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
          <div>
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
                    {cols.map((col) => (
                      <th
                        className="px-6 py-3 text-center text-base font-medium text-gray-500 uppercase tracking-wider"
                        key={col}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 text-xl text-center">
                  {Object.entries(columnDetails).map(([columnName, info]) => (
                    <tr key={columnName}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {columnName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                        {info.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                        {info.missing_values}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                        {info.threshold}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                        <button
                          onClick={() => {
                            setIsEdit(true), setEditColumnInfo(columnName);
                          }}
                        >
                          <CiEdit className="text-2xl " />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {isEdit ? (
            <>
              <div className="w-full bg-zinc-100 mt-4 p-3">
                <div className="flex items-center justify-between w-full">
                  <h1 className="flex text-3xl text-black pb-2">
                    Column Name: {editColumnInfo}{" "}
                    {colNameEdit ? (
                      <div className="flex">
                        <input
                          type="text"
                          placeholder="Type here"
                          value={editColumnName}
                          onChange={(e) => setEditColumnName(e.target.value)}
                          className="input input-bordered w-full max-w-xs bg-white text-black ml-4 border-black"
                        />
                        <button
                          className="btn btn-outline btn-success ml-2"
                          onClick={() => {
                            const existingRecordIndex = finalEditInfo.findIndex(
                              (record) => record.col_name === editColumnInfo
                            );

                            if (existingRecordIndex !== -1) {
                              // Update existing record
                              finalEditInfo[
                                existingRecordIndex
                              ].is_rename = true;
                              finalEditInfo[existingRecordIndex].new_name =
                                editColumnName;
                            } else {
                              // Insert new record
                              finalEditInfo.push({
                                col_name: editColumnInfo,
                                is_rename: true,
                                new_name: editColumnName,
                                is_delete: false,
                                handle_null_values: false,
                              });
                              setEditColumnName(editColumnName);
                            }
                          }}
                        >
                          Save
                        </button>
                        <button
                          className="btn btn-outline btn-error ml-2"
                          onClick={() => setColNameEdit(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <MdEdit
                          className="ml-4 text-xl mt-2 cursor-pointer"
                          onClick={() => setColNameEdit(true)}
                        />
                      </>
                    )}
                  </h1>
                  <div></div>
                </div>

                <h1 className="text-3xl text-black pb-2">Column Details:</h1>
                {Object.entries(columnDetails).map(
                  ([columnName, info]) =>
                    columnName === editColumnInfo && (
                      <div
                        key={columnName}
                        className="grid grid-cols-4 gap-4 text-black mt-2"
                      >
                        <CardInfo
                          title={"Type"}
                          content={info.type}
                          color={"primary"}
                        />
                        <CardInfo
                          title={"Missing Values:"}
                          content={
                            info.missing_values ? info.missing_values : "-"
                          }
                          color={"secondary"}
                        />
                        <CardInfo
                          title={"Mean:"}
                          content={info.mean ? info.mean : "-"}
                          color={"accent"}
                        />
                        <CardInfo
                          title={"Median:"}
                          content={info.median ? info.median : "-"}
                          color={"primary"}
                        />
                        <CardInfo
                          title={"Mode:"}
                          content={info.mode ? info.mode : "-"}
                          color={"secondary"}
                        />
                        <CardInfo
                          title={"Max Value:"}
                          content={info.max ? info.max : "-"}
                          color={"accent"}
                        />
                        <CardInfo
                          title={"Min Value:"}
                          content={info.min ? info.min : "-"}
                          color={"primary"}
                        />
                        <CardInfo
                          title={"Missing values Percentage:"}
                          content={info.threshold ? info.threshold : "-"}
                          color={"secondary"}
                        />
                      </div>
                    )
                )}
                {columnInfo[editColumnInfo]["missing_values"] > 0 && (
                  <div>
                    <div className="flex items-center mt-4 w-full">
                      <span className="text-lg mr-2 text-black">
                        Fill Missing Columns by:
                      </span>
                      <div className="dropdown dropdown-hover dropdown-top">
                        <div
                          tabIndex={0}
                          role="button"
                          className="btn m-1 bg-gray-50 text-black hover:bg-gray-300"
                        >
                          {fillNullValue}
                        </div>
                        <ul
                          tabIndex={0}
                          className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
                        >
                          <li>
                            <button
                              className=""
                              onClick={() => setFillNullValue("Option")}
                            >
                              Option
                            </button>
                          </li>
                          <li>
                            <input
                              type="text"
                              placeholder="Custom Value"
                              className="input input-bordered w-full max-w-xs bg-white text-black  border-black"
                              onChange={(e) => {
                                setFillNullValue(e.target.value);

                                const existingRecordIndex =
                                  finalEditInfo.findIndex(
                                    (record) =>
                                      record.col_name === editColumnInfo
                                  );

                                if (existingRecordIndex !== -1) {
                                  // Update existing record
                                  finalEditInfo[existingRecordIndex].method =
                                    "constant";
                                  finalEditInfo[
                                    existingRecordIndex
                                  ].const_value = e.target.value;
                                } else {
                                  // Insert new record
                                  finalEditInfo.push({
                                    col_name: editColumnInfo,
                                    handle_null_values: true,
                                    method: "constant",
                                    custom_value: e.target.value,
                                  });
                                }
                              }}
                            />
                          </li>
                          <li>
                            <FillOptionButton
                              name={"Mean"}
                              editColumnInfo={editColumnInfo}
                              method={"mean"}
                            />
                          </li>
                          <li>
                            <FillOptionButton
                              name={"Median"}
                              editColumnInfo={editColumnInfo}
                              method={"median"}
                            />
                          </li>
                          <li>
                            <FillOptionButton
                              name={"Mode"}
                              editColumnInfo={editColumnInfo}
                              method={"mode"}
                            />
                          </li>

                          <li>
                            <FillOptionButton
                              name={"Forward Fill"}
                              editColumnInfo={editColumnInfo}
                              method={"forward_backward_fill"}
                              fill_type={"ffill"}
                            />
                          </li>
                          <li>
                            <FillOptionButton
                              name={"Backward Fill"}
                              editColumnInfo={editColumnInfo}
                              method={"forward_backward_fill"}
                              fill_type={"bfill"}
                            />
                          </li>
                        </ul>
                      </div>
                      <div className="text-xl text-black mr-5 ml-5"> or </div>

                      <>
                        <button
                          className="btn btn-active text-white btn-error ml-2"
                          onClick={() => {
                            setIsDelete(true);
                            // const filteredFinalEditInfo = finalEditInfo.filter(
                            //   (record) => record.column !== editColumnInfo
                            // );
                            // const editColDict = {
                            //   option: "delete_column",
                            //   column: editColumnInfo,
                            // };
                            // setFinalEditInfo([
                            //   ...filteredFinalEditInfo,
                            //   editColDict,
                            // ]);
                            const existingRecordIndex = finalEditInfo.findIndex(
                              (record) => record.col_name === editColumnInfo
                            );

                            if (existingRecordIndex !== -1) {
                              // Update existing record
                              finalEditInfo[
                                existingRecordIndex
                              ].handle_null_values = false;
                              (finalEditInfo[existingRecordIndex].method = ""),
                                (finalEditInfo[
                                  existingRecordIndex
                                ].is_delete = true);
                            } else {
                              // Insert new record
                              finalEditInfo.push({
                                col_name: editColumnInfo,
                                is_delete: true,
                              });
                            }
                          }}
                        >
                          Delete Column
                        </button>
                      </>
                    </div>
                  </div>
                )}

                <div className="flex w-full justify-end p-4">
                  <button
                    className="btn btn-outline btn-error ml-2"
                    onClick={() => {
                      setIsEdit(false);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
              <div className="w-full flex justify-end">
                <button
                  className="btn btn-active btn-accent mr-3"
                  onClick={handleSubmit}
                >
                  Save
                </button>
              </div>
            </>
          ) : (
            <></>
          )}
        </div>
      )}
    </Applayout>
  );
};

const CardInfo = ({ title, content, color }) => {
  return (
    <div className={`card w-56 bg-${color} text-primary-content `}>
      <div className="card-body">
        <h2 className="card-title text-xl">{title}</h2>
        <p className="text-3xl pt-2">{content}</p>
      </div>
    </div>
  );
};

export default Home;
