import React, { useState } from "react";
import { Domain } from "../../../models";
import { UseQueryResult } from "@tanstack/react-query";
import {
  CreateDomainService,
  ResponseGetAllDomainsByPage,
} from "../../../services/admin/domain";
import Swal from "sweetalert2";
import { TextField } from "@mui/material";
import SpinLoading from "../../loadings/spinLoading";
interface DomainCreate {
  setTriggerCreateDomain: React.Dispatch<React.SetStateAction<boolean>>;
  domains: UseQueryResult<ResponseGetAllDomainsByPage, Error>;
}
function DomainCreate({ setTriggerCreateDomain, domains }: DomainCreate) {
  const [domainName, setDomainName] = useState<string>();
  const [isVaildDomain, setIsVildDomain] = useState(true);
  const domainPattern = /^(www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    setDomainName(inputValue);

    if (domainPattern.test(inputValue)) {
      setIsVildDomain(() => true);
      // Input is a valid domain with "www"
      console.log("Valid domain:", inputValue);
    } else {
      setIsVildDomain(() => false);
      // Input is not a valid domain with "www"
      console.log("Invalid domain:", inputValue);
    }
  };

  const handleCreateDomain = async () => {
    try {
      setIsLoading(() => true);
      await CreateDomainService({ domainName: domainName as string });
      Swal.fire("success", "create domain successfully", "success");
      domains.refetch();
      setIsLoading(() => false);
    } catch (err: any) {
      setIsLoading(() => false);
      console.log(err);
      Swal.fire(
        "error!",
        err?.props?.response?.data?.message?.toString(),
        "error"
      );
    }
  };
  return (
    <div className="w-screen font-Poppins h-screen fixed top-0 bottom-0 right-0 left-0 m-auto z-50 flex items-center justify-center">
      <main className="w-96 h-max flex flex-col gap-5  justify-start items-center p-4 rounded-lg bg-white">
        <h3 className="text-lg font-bold text-main-color">Fill Information</h3>
        <TextField
          onChange={handleChange}
          name="domainName"
          fullWidth
          color={isVaildDomain ? "success" : "warning"}
          helperText={isVaildDomain ? "" : "Invalid domain"}
          placeholder="www.example.com"
          label="domain name"
          id="fullWidth"
        />
        {isLoading ? (
          <SpinLoading />
        ) : isVaildDomain ? (
          <button
            onClick={handleCreateDomain}
            className="px-5 py-1 rounded-full text-white font-normal text-lg bg-blue-500 hover:bg-blue-700
     transition duration-150 active:scale-110"
          >
            Create
          </button>
        ) : (
          <button className="px-5 py-1 rounded-full text-white font-normal text-lg bg-slate-500">
            Create
          </button>
        )}
      </main>
      <footer
        onClick={() => {
          setTriggerCreateDomain(() => false);
          document.body.style.overflow = "auto";
        }}
        className="w-screen h-screen fixed right-0 left-0 top-0 bottom-0 m-auto -z-10 bg-black/30 "
      ></footer>
    </div>
  );
}

export default DomainCreate;
