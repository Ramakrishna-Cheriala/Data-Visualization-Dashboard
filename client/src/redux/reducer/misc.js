import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  filePath: "",
  totalRows: null,
  totalColumns: null,
  totalMissingValues: null,
  sideBarOpen: true,
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
    setSideBarOpen: (state, action) => {
      state.sideBarOpen = action.payload;
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
  setSideBarOpen,
} = miscSlice.actions;
