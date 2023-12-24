import React from "react";
import SpinLoading from "./spinLoading";

function FullLoading() {
  return (
    <div className="w-screen z-30 flex gap-5 items-center justify-center bg-white h-screen fixed top-0 bottom-0 right-0 left-0 m-auto">
      <SpinLoading />
      <span
        className="animate-gradient font-bold text-transparent text-6xl py-10 text-center font-Poppins
     bg-clip-text "
      >
        loading ....
      </span>
    </div>
  );
}

export default FullLoading;
