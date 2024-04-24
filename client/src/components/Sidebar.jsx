import React, { useState } from "react";
import { VscGraph, VscPreview } from "react-icons/vsc";
import {
  IoArrowBackCircleOutline,
  IoMenuOutline,
  IoHomeOutline,
} from "react-icons/io5";
import { Link } from "react-router-dom";
import { BsFileEarmarkBarGraph, BsInfoSquare } from "react-icons/bs";

const Sidebar = () => {
  const [openMenu, setOpenMenu] = useState(true);

  const toggleMenu = () => {
    setOpenMenu(!openMenu);
  };

  return (
    <div>
      <div
        className={`${
          openMenu ? "w-72" : "w-full"
        } h-full bg-gray-800 flex flex-col`}
      >
        {openMenu ? (
          <>
            <div className="w-full flex m-4 text-3xl text-gray-300">
              <VscGraph className="mt-1" />
              Dashboard
              <div className="mt-2 ml-12 text-gray-300 text-xl">
                <button
                  className="flex tooltip tooltip-info tooltip-bottom"
                  data-tip="Close"
                  onClick={toggleMenu}
                >
                  <IoArrowBackCircleOutline className="text-2xl" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <button
              className="text-white text-xl flex items-center tooltip tooltip-info tooltip-bottom pt-4 pl-6 "
              data-tip="Menu"
              onClick={toggleMenu}
            >
              <IoMenuOutline className="text-2xl" />
            </button>
          </>
        )}

        <div className="m-4">
          <SidebarButtons
            icon={<IoHomeOutline />}
            name="Home"
            toolTipInfo="Home"
            showName={openMenu}
            linkTo={"/"}
          />
          <SidebarButtons
            icon={<VscPreview />}
            name="Preview"
            toolTipInfo="Preview"
            showName={openMenu}
            linkTo={"/preview"}
          />
          <SidebarButtons
            icon={<BsFileEarmarkBarGraph />}
            name="Data Visualization"
            toolTipInfo="Data Visualization"
            showName={openMenu}
            linkTo={"/data"}
          />
        </div>
      </div>
    </div>
  );
};

const SidebarButtons = ({ icon, name, toolTipInfo, showName, linkTo }) => {
  return (
    <div className="w-full flex items-center p-2 text-2xl text-white">
      <Link to={linkTo}>
        <button
          className={
            showName ? "flex" : "flex tooltip tooltip-info tooltip-right"
          }
          data-tip={showName ? "" : toolTipInfo}
        >
          <div className="mt-1 mr-2">{icon}</div>
          {showName ? name : ""}
        </button>
      </Link>
    </div>
  );
};

export default Sidebar;
