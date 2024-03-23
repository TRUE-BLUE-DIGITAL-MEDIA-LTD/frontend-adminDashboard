import { Calendar } from "primereact/calendar";
import { Toast } from "primereact/toast";
import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  FieldError,
  Form,
  Input,
  Label,
  TextField,
} from "react-aria-components";
import { Payslip } from "../../../models";
import { UseQueryResult } from "@tanstack/react-query";
import {
  ResponseGetAllPayslipByMonthsService,
  UpdatePayslipService,
} from "../../../services/admin/payslip";
import Swal from "sweetalert2";

type UpdatePayslipProps = {
  selectPayslip: Payslip;
  payslips: UseQueryResult<ResponseGetAllPayslipByMonthsService, Error>;
  setSelectPayslip: React.Dispatch<React.SetStateAction<Payslip | undefined>>;
};
function UpdatePayslip({
  selectPayslip,
  payslips,
  setSelectPayslip,
}: UpdatePayslipProps) {
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
  }>({
    name: selectPayslip.name,
    startDate: selectPayslip.startDate,
    salary: selectPayslip.salary.toLocaleString(),
    socialSecurity: selectPayslip.socialSecurity.toLocaleString(),
    bonus: selectPayslip.bonus.toLocaleString(),
    tax: selectPayslip.tax.toLocaleString(),
    deduction: selectPayslip.deduction.toLocaleString(),
    note: selectPayslip.note,
  });

  useEffect(() => {
    setPayslipData({
      name: selectPayslip.name,
      startDate: selectPayslip.startDate,
      salary: selectPayslip.salary.toLocaleString(),
      socialSecurity: selectPayslip.socialSecurity.toLocaleString(),
      bonus: selectPayslip.bonus.toLocaleString(),
      tax: selectPayslip.tax.toLocaleString(),
      deduction: selectPayslip.deduction.toLocaleString(),
      note: selectPayslip.note,
    });
  }, [selectPayslip]);

  const handleUpdatePaySlip = async (e: React.FormEvent) => {
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

      await UpdatePayslipService({
        query: {
          payslipId: selectPayslip.id,
        },
        body: {
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
        },
      });
      await payslips.refetch();
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Payslip updated successfully",
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
      onSubmit={handleUpdatePaySlip}
      className="mt-5 flex  w-full flex-col  items-center gap-5 rounded-lg bg-gray-200 p-5 ring-1 ring-gray-400"
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
        <div className="flex justify-center gap-5">
          <Button
            type="submit"
            className="rounded-lg bg-blue-400 px-10 py-2 font-bold text-black ring-black transition duration-150
hover:bg-blue-600 active:scale-105 active:ring-2"
          >
            Update
          </Button>
          <Button
            onPress={() => setSelectPayslip(undefined)}
            className="rounded-lg bg-red-400 px-10 py-2 font-bold text-black ring-black transition duration-150
hover:bg-red-600 active:scale-105 active:ring-2"
          >
            Cancel
          </Button>
        </div>
      )}
    </Form>
  );
}

export default UpdatePayslip;
