import React from "react";
import Sidebar from "../Sidebar";

const Applayout = ({ children }) => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="w-full h-screen">{children}</div>
    </div>
  );
};

export default Applayout;
