import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  FieldError,
  Form,
  Input,
  Label,
  TextArea,
  TextField,
} from "react-aria-components";
import Swal from "sweetalert2";
import {
  CreateDeductionService,
  CreatePaySlipService,
  ResponseGetAllPayslipByMonthsService,
} from "../../../services/admin/payslip";
import moment from "moment";
import { Toast } from "primereact/toast";
import { Nullable } from "primereact/ts-helpers";
import { UseQueryResult } from "@tanstack/react-query";
import { Calendar } from "primereact/calendar";
import { IoAddCircle } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import { v4 as uuidv4 } from "uuid";
import {
  GetSignURLService,
  UploadSignURLService,
} from "../../../services/cloud-storage";
import Image from "next/image";
import TextEditor from "../../common/TextEditor";

type CreatePayslipProps = {
  recordDate: Nullable<Date | null>;
  payslips: UseQueryResult<ResponseGetAllPayslipByMonthsService, Error>;
  setTriggerCreatePayslip: React.Dispatch<React.SetStateAction<boolean>>;
};
function CreatePayslip({
  recordDate,
  payslips,
  setTriggerCreatePayslip,
}: CreatePayslipProps) {
  const [loading, setLoading] = useState(false);
  const toast = useRef<Toast>(null);
  const [loadingLogo, setLoadingLogo] = useState(false);
  const [payslipData, setPayslipData] = useState<{
    name?: string;
    startDate?: string;
    salary?: string;
    socialSecurity?: string;
    bonus?: string;
    tax?: string;
    address?: string;
    logo?: string;
    deductions: {
      id: string;
      title: string;
      value: string;
    }[];
    note?: string;
  }>({
    deductions: [
      {
        id: uuidv4(),
        title: "",
        value: "0",
      },
    ],
  });

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setLoadingLogo(true);

      const file = e.target.files?.[0];
      if (!file) {
        throw new Error("No file selected");
      }
      const signURL = await GetSignURLService({
        fileName: file.name,
        fileType: file.type,
        category: "image-library",
      });
      const upload = await UploadSignURLService({
        contentType: file.type,
        file,
        signURL: signURL.signURL,
      });
      setPayslipData((prev) => ({
        ...prev,
        logo: signURL.originalURL,
      }));
      setLoadingLogo(false);
    } catch (error: any) {
      setLoadingLogo(false);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.message,
      });
    }
  };

  const handleCreatePaySlip = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      setLoading(true);
      if (
        !payslipData?.name ||
        !payslipData.startDate ||
        !payslipData.salary ||
        !payslipData.socialSecurity ||
        !payslipData.bonus ||
        !payslipData.tax
      ) {
        throw new Error("Please fill all required fields");
      }

      const create = await CreatePaySlipService({
        recordDate: moment(recordDate).toISOString() as string,
        name: payslipData?.name,
        startDate: payslipData?.startDate,
        salary: parseInt(payslipData.salary.replace(/,/g, ""), 10),
        socialSecurity: parseInt(
          payslipData.socialSecurity.replace(/,/g, ""),
          10,
        ),
        address: payslipData?.address || "",
        logo: payslipData?.logo || "",
        bonus: parseInt(payslipData.bonus.replace(/,/g, ""), 10),
        tax: parseInt(payslipData.tax.replace(/,/g, ""), 10),
        note: payslipData?.note,
      });
      if (payslipData.deductions && payslipData.deductions?.length > 0) {
        await Promise.all(
          payslipData.deductions.map((deduction) =>
            CreateDeductionService({
              payslipId: create.id,
              title: deduction.title,
              value: parseInt(deduction.value.replace(/,/g, ""), 10),
            }),
          ),
        );
      }

      await payslips.refetch();
      setPayslipData({
        deductions: [
          {
            id: uuidv4(),
            title: "",
            value: "0",
          },
        ],
      });
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Payslip created successfully",
      });
      setLoading(false);
      setTriggerCreatePayslip(() => false);
    } catch (error: any) {
      setLoading(false);
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
      });
    }
  };
  const handleChangePayslipData = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value, type } = e.target;
    setPayslipData((prev) => ({
      ...prev,
      [name]: Number(value.replace(/\D/g, "")).toLocaleString(),
    }));
  };

  const handleAddMoreDeduction = () => {
    setPayslipData((prev) => ({
      ...prev,
      deductions: [
        ...(prev?.deductions || [{ id: uuidv4(), title: "", value: "" }]),
        {
          id: uuidv4(),
          title: "",
          value: "",
        },
      ],
    }));
  };

  const handleDeleteDeduction = ({ id }: { id: string }) => {
    setPayslipData((prev) => ({
      ...prev,
      deductions: prev?.deductions?.filter((deduction) => deduction.id !== id),
    }));
  };
  return (
    <div className=" fixed bottom-0 left-0 right-0 top-0 z-50 flex h-screen w-screen items-center justify-center">
      <Form
        onSubmit={handleCreatePaySlip}
        className="max mt-5 flex w-8/12 flex-col  items-center gap-5  rounded-lg bg-gray-100 p-5 ring-2  ring-black "
      >
        <Toast ref={toast} />
        <div className="max-h-96 w-full overflow-y-auto">
          <div className="grid w-full max-w-full grid-cols-1 items-center justify-center gap-2 md:grid-cols-4">
            <TextField
              className="flex flex-col"
              aria-label="Name / Description"
              isRequired
            >
              <Label>Name / Description</Label>
              <Input
                placeholder="Name / Description"
                className="rounded-lg border-2 border-gray-600 bg-white p-2 outline-none transition duration-75 focus:drop-shadow-md"
                type="text"
                name="name"
                value={payslipData?.name}
                onChange={(e) => {
                  setPayslipData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }));
                }}
                maxLength={255}
              />
              <FieldError className="text-xs text-red-700" />
            </TextField>
            <TextField
              isRequired
              className="flex flex-col"
              aria-label="Start Date"
            >
              <Label>Start Date</Label>
              <Calendar
                required
                value={
                  payslipData?.startDate
                    ? new Date(payslipData?.startDate)
                    : undefined
                }
                onChange={(e) => {
                  setPayslipData((prev) => ({
                    ...prev,
                    startDate: e.value?.toISOString(),
                  }));
                }}
                className="rounded-lg border-2 border-gray-600 bg-white  outline-none transition duration-75 focus:drop-shadow-md"
                name="startDate"
                dateFormat="dd/mm/yy"
              />

              <FieldError className="text-xs text-red-700" />
            </TextField>
            <TextField
              isRequired
              className="flex flex-col"
              aria-label="Salary (THB)"
            >
              <Label>Salary (THB)</Label>
              <Input
                placeholder="Salary (THB)"
                className="rounded-lg border-2 border-gray-600 bg-white p-2 outline-none transition duration-75 focus:drop-shadow-md"
                type="text"
                value={payslipData?.salary}
                onChange={handleChangePayslipData}
                inputMode="numeric"
                name="salary"
              />
              <FieldError className="text-xs text-red-700" />
            </TextField>
            <TextField
              isRequired
              className="flex flex-col"
              aria-label="Social Security"
            >
              <Label>Social Security</Label>
              <Input
                placeholder="Social Security"
                className="rounded-lg border-2 border-gray-600 bg-white p-2 outline-none transition duration-75 focus:drop-shadow-md"
                type="text"
                value={payslipData?.socialSecurity}
                onChange={handleChangePayslipData}
                inputMode="numeric"
                name="socialSecurity"
              />
              <FieldError className="text-xs text-red-700" />
            </TextField>
            <TextField
              isRequired
              className="flex flex-col"
              aria-label="Commission /Allowance"
            >
              <Label>Commission /Allowance</Label>
              <Input
                placeholder="Commission /Allowance"
                className="rounded-lg border-2 border-gray-600 bg-white p-2 outline-none transition duration-75 focus:drop-shadow-md"
                type="text"
                value={payslipData?.bonus}
                onChange={handleChangePayslipData}
                inputMode="numeric"
                name="bonus"
              />
              <FieldError className="text-xs text-red-700" />
            </TextField>
            <TextField isRequired className="flex flex-col" aria-label="tax">
              <Label>tax</Label>
              <Input
                placeholder="tax"
                className="rounded-lg border-2 border-gray-600 bg-white p-2 outline-none transition duration-75 focus:drop-shadow-md"
                type="text"
                value={payslipData?.tax}
                onChange={handleChangePayslipData}
                inputMode="numeric"
                name="tax"
              />
              <FieldError className="text-xs text-red-700" />
            </TextField>
          </div>
          <div className="w-full">
            <h3>Other Deducations</h3>
            {payslipData?.deductions?.map((deduction, index) => {
              return (
                <div
                  key={index}
                  className="grid w-full grid-cols-3 gap-5 border-b-2  border-gray-200 pb-2"
                >
                  <TextField
                    isRequired
                    className="flex flex-col"
                    aria-label="tax"
                  >
                    <Label>title</Label>
                    <Input
                      value={deduction.title}
                      onChange={(e) => {
                        setPayslipData((prev) => ({
                          ...prev,
                          deductions: prev?.deductions?.map((item) => {
                            if (item.id === deduction.id) {
                              return {
                                ...item,
                                title: e.target.value,
                              };
                            }
                            return item;
                          }),
                        }));
                      }}
                      placeholder="title"
                      className="rounded-lg border-2 border-gray-600 bg-white p-2 outline-none transition duration-75 focus:drop-shadow-md"
                      type="text"
                      inputMode="numeric"
                      name="tax"
                    />
                    <FieldError className="text-xs text-red-700" />
                  </TextField>
                  <TextField
                    isRequired
                    className="flex flex-col"
                    aria-label="tax"
                  >
                    <Label>value</Label>
                    <Input
                      placeholder="value"
                      className="rounded-lg border-2 border-gray-600 bg-white p-2 outline-none transition duration-75 focus:drop-shadow-md"
                      type="text"
                      value={deduction.value}
                      onChange={(e) => {
                        setPayslipData((prev) => ({
                          ...prev,
                          deductions: prev?.deductions?.map((item) => {
                            if (item.id === deduction.id) {
                              return {
                                ...item,
                                value: Number(
                                  e.target.value.replace(/\D/g, ""),
                                ).toLocaleString(),
                              };
                            }
                            return item;
                          }),
                        }));
                      }}
                      inputMode="numeric"
                      name="tax"
                    />
                    <FieldError className="text-xs text-red-700" />
                  </TextField>
                  <div className="flex  items-end justify-start gap-3 ">
                    {payslipData.deductions?.length === index + 1 && (
                      <button
                        type="button"
                        onClick={handleAddMoreDeduction}
                        className=" flex h-12 w-28 items-center justify-center gap-2
             rounded-lg bg-green-300 text-xl text-green-600 ring-black transition duration-100
              hover:bg-green-400 focus:drop-shadow-lg active:scale-105
         active:ring-2"
                      >
                        <IoAddCircle />
                        Add
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteDeduction({ id: deduction.id })
                      }
                      className=" flex h-12 w-28 items-center justify-center gap-2
             rounded-lg bg-red-300 text-xl text-red-600 ring-black transition duration-100
              hover:bg-red-400 focus:drop-shadow-lg active:scale-105
         active:ring-2"
                    >
                      <MdDelete />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
            {payslipData.deductions?.length === 0 && (
              <button
                type="button"
                onClick={handleAddMoreDeduction}
                className=" flex h-12 w-28 items-center justify-center gap-2
             rounded-lg bg-green-300 text-xl text-green-600 ring-black transition duration-100
              hover:bg-green-400 focus:drop-shadow-lg active:scale-105
         active:ring-2"
              >
                <IoAddCircle />
                Add
              </button>
            )}
          </div>
          <div className="my-5 flex items-end gap-5">
            <label className="flex w-max flex-col items-start justify-center gap-2">
              <span>Upload Logo</span>
              <input
                onChange={handleUploadLogo}
                type="file"
                accept="image/png, image/gif, image/jpeg"
                className=""
              />
            </label>
            {loadingLogo && <div>Loading...</div>}
            {payslipData.logo && !loadingLogo && (
              <div className="relative h-20 w-20 rounded-md">
                <Image
                  src={payslipData.logo}
                  alt="logo"
                  fill
                  className="object-contain"
                />
              </div>
            )}
          </div>
          <TextField className="mt-5 flex w-full flex-col" aria-label="note">
            <Label>Address</Label>
            <div className="h-80 w-full">
              <TextEditor
                allowMenu={false}
                value={payslipData?.address || ""}
                onChange={(content) => {
                  setPayslipData((prev) => ({
                    ...prev,
                    address: content,
                  }));
                }}
              />
            </div>
            <FieldError className="text-xs text-red-700" />
          </TextField>
          <TextField className="mt-5 flex w-full flex-col" aria-label="note">
            <Label>Note</Label>
            <TextArea
              value={payslipData?.note}
              onChange={(e) => {
                setPayslipData((prev) => ({
                  ...prev,
                  note: e.target.value,
                }));
              }}
              placeholder="note"
              className="h-40 w-full resize-none
           rounded-lg border-2 border-gray-600 bg-white p-2 outline-none transition duration-75 focus:drop-shadow-md"
              name="note"
            />
            <FieldError className="text-xs text-red-700" />
          </TextField>
        </div>
        {loading ? (
          <div
            className="animate-pulse rounded-lg  bg-gray-400 px-10 py-2 font-bold text-black ring-black transition duration-150
  hover:bg-gray-600 active:scale-105 active:ring-2"
          >
            Loading...
          </div>
        ) : (
          <Button
            type="submit"
            className="rounded-lg bg-green-400 px-10 py-2 font-bold text-black ring-black transition duration-150
   hover:bg-green-600 active:scale-105 active:ring-2"
          >
            Create
          </Button>
        )}
      </Form>
      <footer
        onClick={() => setTriggerCreatePayslip(() => false)}
        className="fixed bottom-0 left-0 right-0 top-0 -z-10  h-screen w-screen bg-black/50 "
      ></footer>
    </div>
  );
}

export default CreatePayslip;
