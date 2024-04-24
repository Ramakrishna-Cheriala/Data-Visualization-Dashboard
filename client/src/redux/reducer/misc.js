import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  filePath: "",
  totalRows: null,
  totalColumns: null,
  totalMissingValues: null,
  columnDetails: {},
};

const miscSlice = createSlice({
  name: "misc",
  initialState,
  reducers: {
    setFilePath: (state, action) => {
      state.filePath = action.payload;
    },
    setTotalRows: (state, action) => {
      state.totalRows = action.payload;
    },
    setTotalColumns: (state, action) => {
      state.totalColumns = action.payload;
    },
    setTotalMissingValues: (state, action) => {
      state.totalMissingValues = action.payload;
    },
    setColumnDetails: (state, action) => {
      state.columnDetails = action.payload;
    },
  },
});

export default miscSlice;
export const {
  setFilePath,
  setTotalRows,
  setTotalColumns,
  setTotalMissingValues,
  setColumnDetails,
} = miscSlice.actions;
