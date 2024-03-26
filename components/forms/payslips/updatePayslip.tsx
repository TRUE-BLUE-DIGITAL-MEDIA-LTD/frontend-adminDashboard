import { Calendar } from "primereact/calendar";
import { Toast } from "primereact/toast";
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
import { Deduction, Payslip } from "../../../models";
import { UseQueryResult } from "@tanstack/react-query";
import {
  CreateDeductionService,
  DeleteDeductionService,
  ResponseGetAllPayslipByMonthsService,
  UpdateDeductionService,
  UpdatePayslipService,
} from "../../../services/admin/payslip";
import Swal from "sweetalert2";
import { MdDelete } from "react-icons/md";
import { IoAddCircle } from "react-icons/io5";
import { v4 as uuidv4 } from "uuid";

type UpdatePayslipProps = {
  selectPayslip: Payslip & { deductions: Deduction[] | [] };
  payslips: UseQueryResult<ResponseGetAllPayslipByMonthsService, Error>;
  setSelectPayslip: React.Dispatch<
    React.SetStateAction<
      | (Payslip & {
          deductions: Deduction[];
        })
      | undefined
    >
  >;
  toast: React.RefObject<Toast>;
};
function UpdatePayslip({
  selectPayslip,
  payslips,
  setSelectPayslip,
  toast,
}: UpdatePayslipProps) {
  const [loading, setLoading] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const [payslipData, setPayslipData] = useState<{
    name?: string;
    startDate?: string;
    salary?: string;
    socialSecurity?: string;
    bonus?: string;
    tax?: string;
    deductions?: {
      uuid?: string;
      id?: string;
      title: string;
      value: string;
    }[];
    note?: string;
  }>({
    name: selectPayslip.name,
    startDate: selectPayslip.startDate,
    salary: selectPayslip.salary.toLocaleString(),
    socialSecurity: selectPayslip.socialSecurity.toLocaleString(),
    bonus: selectPayslip.bonus.toLocaleString(),
    tax: selectPayslip.tax.toLocaleString(),
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
      note: selectPayslip.note,
      deductions:
        selectPayslip.deductions.length > 0
          ? selectPayslip.deductions.map((deduction) => {
              return {
                id: deduction.id,
                title: deduction.title,
                value: deduction.value.toLocaleString(),
              };
            })
          : [{ uuid: uuidv4(), title: "", value: "" }],
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
        !payslipData.tax
      ) {
        throw new Error("Please fill all required fields");
      }

      const payslip = await UpdatePayslipService({
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
          note: payslipData?.note,
        },
      });
      const oldDeductions = payslipData.deductions?.filter(
        (deduction) => deduction.id,
      );
      const newDeductions = payslipData.deductions?.filter(
        (deduction) => deduction.uuid,
      );

      await Promise.all([
        ...(oldDeductions?.map((deduction) => {
          return UpdateDeductionService({
            query: { deductionId: deduction.id as string },
            body: {
              title: deduction.title,
              value: parseInt(deduction.value.replace(/,/g, ""), 10),
            },
          });
        }) || []),
        ...(newDeductions?.map((deduction) => {
          return CreateDeductionService({
            title: deduction.title,
            value: parseInt(deduction.value.replace(/,/g, ""), 10),
            payslipId: payslip.id,
          });
        }) || []),
      ]);
      await payslips.refetch();
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Payslip updated successfully",
      });
      setLoading(false);
      setSelectPayslip(undefined);
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
        ...(prev?.deductions || [{ uuid: uuidv4(), title: "", value: "" }]),
        {
          uuid: uuidv4(),
          title: "",
          value: "",
        },
      ],
    }));
  };

  const handleDeleteDeduction = async ({
    id,
    uuid,
  }: {
    id?: string;
    uuid?: string;
  }) => {
    if (uuid) {
      setPayslipData((prev) => ({
        ...prev,
        deductions: prev?.deductions?.filter(
          (deduction) => deduction.uuid !== uuid,
        ),
      }));
    } else if (id) {
      try {
        setLoadingDelete(true);
        await DeleteDeductionService({ deductionId: id });
        setPayslipData((prev) => ({
          ...prev,
          deductions: prev?.deductions?.filter(
            (deduction) => deduction.id !== id,
          ),
        }));

        await payslips.refetch();
        setLoadingDelete(false);
      } catch (error: any) {
        setLoadingDelete(false);
        console.error(error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message,
        });
      }
    }
  };
  return (
    <Form
      onSubmit={handleUpdatePaySlip}
      className="mt-5 flex  w-full flex-col  items-center gap-5 rounded-lg bg-gray-200 p-5 ring-1 ring-gray-400"
    >
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
      </div>
      <div className="w-full">
        <h3>Other Deducations</h3>
        {payslipData?.deductions?.map((deduction, index) => {
          return (
            <div
              key={index}
              className="grid w-full grid-cols-3 gap-5 border-b-2  border-gray-200 pb-2"
            >
              <TextField isRequired className="flex flex-col" aria-label="tax">
                <Label>title</Label>
                <Input
                  value={deduction.title}
                  onChange={(e) => {
                    setPayslipData((prev) => ({
                      ...prev,
                      deductions: prev?.deductions?.map((item) => {
                        if (item.id && item.id === deduction.id) {
                          return {
                            ...item,
                            title: e.target.value,
                          };
                        } else if (item.uuid && item.uuid === deduction.uuid) {
                          return {
                            ...item,
                            title: e.target.value,
                          };
                        } else {
                          return item;
                        }
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
              <TextField isRequired className="flex flex-col" aria-label="tax">
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
                        if (item.id && item.id === deduction.id) {
                          return {
                            ...item,
                            value: Number(
                              e.target.value.replace(/\D/g, ""),
                            ).toLocaleString(),
                          };
                        } else if (item.uuid && item.uuid === deduction.uuid) {
                          return {
                            ...item,
                            value: Number(
                              e.target.value.replace(/\D/g, ""),
                            ).toLocaleString(),
                          };
                        } else {
                          return item;
                        }
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
                    onClick={handleAddMoreDeduction}
                    type="button"
                    className=" flex h-12 w-28 items-center justify-center gap-2
             rounded-lg bg-green-300 text-xl text-green-600 ring-black transition duration-100
              hover:bg-green-400 focus:drop-shadow-lg active:scale-105
         active:ring-2"
                  >
                    <IoAddCircle />
                    Add
                  </button>
                )}
                {loadingDelete ? (
                  <div
                    className=" flex h-12 w-28 animate-pulse items-center justify-center
             gap-2 rounded-lg bg-gray-300 text-xl text-gray-600 ring-black transition duration-100
              hover:bg-gray-400 focus:drop-shadow-lg active:scale-105
         active:ring-2"
                  >
                    loading
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      if (deduction.id) {
                        handleDeleteDeduction({ id: deduction.id });
                      } else {
                        handleDeleteDeduction({ uuid: deduction.uuid });
                      }
                    }}
                    type="button"
                    className=" flex h-12 w-28 items-center justify-center gap-2
             rounded-lg bg-red-300 text-xl text-red-600 ring-black transition duration-100
              hover:bg-red-400 focus:drop-shadow-lg active:scale-105
         active:ring-2"
                  >
                    <MdDelete />
                    Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <TextField className="flex w-full flex-col" aria-label="note">
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
