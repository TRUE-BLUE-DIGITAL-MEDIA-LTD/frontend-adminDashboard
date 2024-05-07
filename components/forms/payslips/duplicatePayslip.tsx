import { UseQueryResult } from "@tanstack/react-query";
import { Calendar } from "primereact/calendar";
import { Nullable } from "primereact/ts-helpers";
import React, { useState } from "react";
import { Button, Form, Label, TextField } from "react-aria-components";
import {
  DuplicatePaySlipService,
  ResponseGetAllPayslipByMonthsService,
} from "../../../services/admin/payslip";
import { ErrorMessages } from "../../../models";
import Swal from "sweetalert2";
type DuplicatePayslipProps = {
  setTriggerDuplicatePayslip: React.Dispatch<React.SetStateAction<boolean>>;
  currentRecordDate: Date;
  payslips: UseQueryResult<ResponseGetAllPayslipByMonthsService, Error>;
};
function DuplicatePayslip({
  setTriggerDuplicatePayslip,
  currentRecordDate,
  payslips,
}: DuplicatePayslipProps) {
  const [targetRecord, setTargetRecord] = useState<Nullable<Date | null>>();

  const handleDulicatePayslip = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      if (!targetRecord) {
        throw new Error("Please select target date");
      }

      Swal.fire({
        title: "Loading...",
        text: "Please wait.",
        didOpen: () => {
          Swal.showLoading();
        },
      });
      await DuplicatePaySlipService({
        currentRecordDate: currentRecordDate.toISOString(),
        targetRecordDate: targetRecord.toISOString(),
      });
      await payslips.refetch();
      Swal.fire({
        title: "Success",
        text: "Payslip duplicated",
        icon: "success",
      });
    } catch (error) {
      console.log(error);
      let result = error as ErrorMessages;
      Swal.fire({
        title: result.error ? result.error : "เกิดข้อผิดพลาด",
        text: result.message.toString(),
        footer: result.statusCode
          ? "รหัสข้อผิดพลาด: " + result.statusCode?.toString()
          : "",
        icon: "error",
      });
    }
  };
  return (
    <div className=" fixed bottom-0 left-0 right-0 top-0 z-50 flex h-screen w-screen items-center justify-center">
      <Form
        onSubmit={handleDulicatePayslip}
        className="mt-5 flex  w-96 flex-col  items-center gap-5 rounded-lg bg-gray-200 p-5 ring-1 ring-gray-400"
      >
        <TextField className="flex flex-col items-start justify-center gap-2">
          <Label className="">
            Pick Target Date (เลือกเดืิอนที่จะทำการ copy)
          </Label>
          <Calendar
            value={targetRecord}
            onChange={(e) => {
              if (!e.value) return;
              const year = e.value?.getFullYear();
              const month = e.value?.getMonth();
              const middleOfMonth = new Date(year, month, 15);
              setTargetRecord(middleOfMonth);
            }}
            view="month"
            className="w-full"
            dateFormat="mm/yy"
          />
        </TextField>

        <Button
          type="submit"
          className="rounded-lg bg-blue-400 px-10 py-2 font-bold text-black ring-black transition duration-150
hover:bg-blue-600 active:scale-105 active:ring-2"
        >
          Create
        </Button>
      </Form>
      <footer
        onClick={() => setTriggerDuplicatePayslip(() => false)}
        className="fixed bottom-0 left-0 right-0 top-0 -z-10  h-screen w-screen bg-black/20 backdrop-blur-sm "
      ></footer>
    </div>
  );
}

export default DuplicatePayslip;
