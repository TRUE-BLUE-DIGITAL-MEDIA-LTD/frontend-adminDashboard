import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  FieldError,
  Form,
  Input,
  Label,
  TextField,
} from "react-aria-components";
import Swal from "sweetalert2";
import {
  CreatePaySlipService,
  ResponseGetAllPayslipByMonthsService,
} from "../../../services/admin/payslip";
import moment from "moment";
import { Toast } from "primereact/toast";
import { Nullable } from "primereact/ts-helpers";
import { UseQueryResult } from "@tanstack/react-query";
import { Calendar } from "primereact/calendar";
type CreatePayslipProps = {
  recordDate: Nullable<Date | null>;
  payslips: UseQueryResult<ResponseGetAllPayslipByMonthsService, Error>;
};
function CreatePayslip({ recordDate, payslips }: CreatePayslipProps) {
  const [loading, setLoading] = useState(false);
  const toast = useRef<Toast>(null);
  const [payslipData, setPayslipData] = useState<{
    name?: string;
    startDate?: string;
    salary?: string;
    socialSecurity?: string;
    bonus?: string;
    tax?: string;
    deduction?: string;
    note?: string;
  }>();

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
        !payslipData.tax ||
        !payslipData.deduction
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
        bonus: parseInt(payslipData.bonus.replace(/,/g, ""), 10),
        tax: parseInt(payslipData.tax.replace(/,/g, ""), 10),
        deduction: parseInt(payslipData.deduction.replace(/,/g, ""), 10),
        note: payslipData?.note,
      });
      await payslips.refetch();
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Payslip created successfully",
      });
      setLoading(false);
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
  return (
    <Form
      onSubmit={handleCreatePaySlip}
      className="mt-5 flex  w-full flex-col  items-center gap-5 rounded-lg bg-gray-100 p-5 ring-1 ring-gray-300"
    >
      <Toast ref={toast} />
      <div className="grid w-max max-w-full grid-cols-1 items-center justify-center gap-2 md:grid-cols-4">
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
        <TextField isRequired className="flex flex-col" aria-label="Start Date">
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
          aria-label="Bonus /Allowance"
        >
          <Label>Bonus /Allowance</Label>
          <Input
            placeholder="Bonus /Allowance"
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

        <TextField isRequired className="flex flex-col" aria-label="deduction">
          <Label>deduction</Label>
          <Input
            placeholder="deduction"
            className="rounded-lg border-2 border-gray-600 bg-white p-2 outline-none transition duration-75 focus:drop-shadow-md"
            type="text"
            value={payslipData?.deduction}
            onChange={handleChangePayslipData}
            inputMode="numeric"
            name="deduction"
          />
          <FieldError className="text-xs text-red-700" />
        </TextField>
        <TextField className="flex flex-col" aria-label="note">
          <Label>note</Label>
          <Input
            value={payslipData?.note}
            onChange={(e) => {
              setPayslipData((prev) => ({
                ...prev,
                note: e.target.value,
              }));
            }}
            placeholder="note"
            className="rounded-lg border-2 border-gray-600 bg-white p-2 outline-none transition duration-75 focus:drop-shadow-md"
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
  );
}

export default CreatePayslip;
