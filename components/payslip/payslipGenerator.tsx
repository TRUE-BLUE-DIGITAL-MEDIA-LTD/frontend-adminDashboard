import React, { useRef, useState } from "react";
import {
  Button,
  FieldError,
  Form,
  Input,
  Key,
  Label,
  TextArea,
  TextField,
} from "react-aria-components";
import { Calendar } from "primereact/calendar";
import { Nullable } from "primereact/ts-helpers";
import { useQuery } from "@tanstack/react-query";
import {
  CreatePaySlipService,
  DeletePayslipService,
  GetAllPayslipByMonthsService,
} from "../../services/admin/payslip";
import moment from "moment";
import Swal from "sweetalert2";
import { Toast } from "primereact/toast";
import CreatePayslip from "../forms/payslips/createPayslip";
import { MdDelete, MdModeEdit, MdOutlineSummarize } from "react-icons/md";
import { Deduction, Payslip } from "../../models";
import UpdatePayslip from "../forms/payslips/updatePayslip";
import { FaPrint } from "react-icons/fa6";
import Link from "next/link";
import { DownloadExcelPayslipService } from "../../services/excel/payslip";
import { SiMicrosoftexcel } from "react-icons/si";
import { IoCreateSharp, IoDuplicateSharp } from "react-icons/io5";
import DuplicatePayslip from "../forms/payslips/duplicatePayslip";

function PayslipGenerator() {
  const toast = useRef<Toast>(null);
  const [loadingExcel, setLoadingExcel] = useState(false);
  const [triggerUpdatePayslip, setTriggerUpdatePayslip] = useState(false);
  const [triggerCreatePayslip, setTriggerCreatePayslip] = useState(false);
  const [triggerDuplicatePayslip, setTriggerDuplicatePayslip] = useState(false);
  const [recordDate, setRecordDate] = useState<Nullable<Date | null>>(() => {
    const cuurentDate = new Date();
    const year = cuurentDate.getFullYear();
    const month = cuurentDate.getMonth();
    const middleOfMonth = new Date(year, month, 15);
    return middleOfMonth;
  });
  const [overallData, setOverallData] = useState<{
    companySocialSecurity?: string;
    consultingFee?: string;
  }>();
  const [selectPayslip, setSelectPayslip] = useState<
    Payslip & { deductions: Deduction[] }
  >();
  const payslips = useQuery({
    queryKey: ["payslips", moment(recordDate).format("MM-YYYY")],
    queryFn: () =>
      GetAllPayslipByMonthsService({
        recordDate: moment(recordDate).toISOString() as string,
      }),
  });

  const handleChangePayslipData = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value, type } = e.target;
    setOverallData((prev) => ({
      ...prev,
      [name]: Number(value.replace(/\D/g, "")).toLocaleString(),
    }));
  };

  const handleDeletePayslip = async ({
    payslipId,
    name,
  }: {
    payslipId: string;
    name: string;
  }) => {
    let content = document.createElement("div");
    content.innerHTML =
      "<div>Please type</div> <strong>" +
      "delete" +
      "</strong> <div>to confirm deleting</div>";
    const { value } = await Swal.fire({
      title: "Delete Payslip",
      input: "text",
      footer: "This action is irreversible.",
      html: content,
      showCancelButton: true,
      inputValidator: (value) => {
        if (value !== "delete") {
          return "Please Type Correctly";
        }
      },
    });
    if (value) {
      try {
        Swal.fire({
          title: "Trying To Delete",
          html: "Loading....",
          allowEscapeKey: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        await DeletePayslipService({
          payslipId: payslipId,
        });
        await payslips.refetch();
        Swal.fire("Deleted!", "Your payslip has been deleted.", "success");
      } catch (err: any) {
        console.log(err);
        Swal.fire("error!", err.message?.toString(), "error");
      }
    }
  };

  const handleDownloadExcelPayslip = async () => {
    try {
      setLoadingExcel(true);
      await DownloadExcelPayslipService({
        recordDate: moment(recordDate).toISOString(),
        companySocialSecurity: overallData?.companySocialSecurity
          ? parseInt(overallData?.companySocialSecurity.replace(/,/g, ""), 10)
          : 0,
        consultingFee: overallData?.consultingFee
          ? parseInt(overallData?.consultingFee.replace(/,/g, ""), 10)
          : 0,
      });
      setLoadingExcel(false);
    } catch (err: any) {
      setLoadingExcel(false);
      console.log(err);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: err.message,
        life: 3000,
      });
    }
  };

  return (
    <div className="flex w-full flex-col items-center ">
      <Toast ref={toast} />
      <header className="mt-28 flex flex-col items-center justify-center py-5">
        <h1 className="font-Poppins text-4xl font-semibold md:text-7xl">
          <span className="text-icon-color">Pay</span>
          <span>slip Generator</span>
        </h1>
      </header>
      <main className="flex w-11/12 flex-col items-center justify-start gap-5 py-10  ">
        <TextField className="flex flex-col items-start justify-center gap-2">
          <Label className="">Pick Record Date</Label>
          <Calendar
            className="rounded-md border ring-1"
            value={recordDate}
            onChange={(e) => {
              if (!e.value) return;
              const year = e.value?.getFullYear();
              const month = e.value?.getMonth();
              const middleOfMonth = new Date(year, month, 15);
              setRecordDate(middleOfMonth);
            }}
            view="month"
            dateFormat="mm/yy"
          />
        </TextField>
        {triggerCreatePayslip && (
          <CreatePayslip
            setTriggerCreatePayslip={setTriggerCreatePayslip}
            recordDate={recordDate}
            payslips={payslips}
          />
        )}
        {triggerUpdatePayslip && selectPayslip && (
          <UpdatePayslip
            setTriggerUpdatePayslip={setTriggerUpdatePayslip}
            toast={toast}
            selectPayslip={selectPayslip}
            payslips={payslips}
            setSelectPayslip={setSelectPayslip}
          />
        )}

        {triggerDuplicatePayslip && recordDate && (
          <DuplicatePayslip
            payslips={payslips}
            setTriggerDuplicatePayslip={setTriggerDuplicatePayslip}
            currentRecordDate={recordDate}
          />
        )}

        <div className="w-full rounded-lg bg-gray-100 p-5 ring-1 ring-gray-300">
          <Form>
            <div className="flex w-full justify-center gap-5 border-b-2">
              <Button
                onPress={() => {
                  setTriggerDuplicatePayslip(true);
                }}
                className="my-5 flex w-max items-center justify-center gap-2 rounded-lg bg-green-400 px-10 py-2 font-bold text-black ring-black transition duration-150
hover:bg-green-600 active:scale-105 active:ring-2"
              >
                <IoDuplicateSharp />
                Duplicate Payslip
              </Button>
              <Button
                onPress={() => setTriggerCreatePayslip(true)}
                className="my-5 flex w-max items-center justify-center gap-2 rounded-lg bg-green-400 px-10 py-2 font-bold text-black ring-black transition duration-150
hover:bg-green-600 active:scale-105 active:ring-2"
              >
                <IoCreateSharp />
                Create Payslip
              </Button>
            </div>
            {!overallData?.companySocialSecurity ||
            !overallData?.consultingFee ? (
              <div className="flex w-full gap-5">
                <Button
                  type="submit"
                  className="my-5 flex w-max items-center justify-center gap-2 rounded-lg bg-gray-400 px-10 py-2 font-bold text-black ring-black transition duration-150
hover:bg-green-600 active:scale-105 active:ring-2"
                >
                  <FaPrint />
                  Generate Payslip (NOT READY)
                </Button>

                <Button
                  type="submit"
                  className="my-5 flex w-max items-center justify-center gap-2 rounded-lg bg-gray-400 px-10 py-2 font-bold text-black ring-black transition duration-150
hover:bg-green-600 active:scale-105 active:ring-2"
                >
                  <SiMicrosoftexcel />
                  Download Excel (NOT READY)
                </Button>
              </div>
            ) : (
              <div className="flex w-full gap-5">
                <Link
                  role="button"
                  href={`/payslip/${moment(recordDate).toISOString()}?consultingFee=${overallData?.consultingFee && parseInt(overallData?.consultingFee.replace(/,/g, ""), 10)}&companySocialSecurity=${overallData?.companySocialSecurity && parseInt(overallData?.companySocialSecurity.replace(/,/g, ""), 10)}`}
                  className="my-5 flex w-max items-center justify-center gap-2 rounded-lg bg-green-400 px-10 py-2 font-bold text-black ring-black transition duration-150
hover:bg-green-600 active:scale-105 active:ring-2"
                >
                  <FaPrint />
                  Generate Payslip
                </Link>
                {loadingExcel ? (
                  <div
                    className="my-5 flex w-max animate-pulse items-center justify-center gap-2 rounded-lg bg-green-400 px-10 py-2 font-bold text-black ring-black transition duration-150
hover:bg-green-600 active:scale-105 active:ring-2"
                  >
                    <SiMicrosoftexcel />
                    loading
                  </div>
                ) : (
                  <Button
                    onPress={handleDownloadExcelPayslip}
                    className="my-5 flex w-max items-center justify-center gap-2 rounded-lg bg-green-400 px-10 py-2 font-bold text-black ring-black transition duration-150
hover:bg-green-600 active:scale-105 active:ring-2"
                  >
                    <SiMicrosoftexcel />
                    Download Excel
                  </Button>
                )}
              </div>
            )}

            <div className="flex w-full  gap-5">
              <TextField
                isRequired
                className="flex flex-col"
                aria-label="consultingFee"
              >
                <Label>ค่าปรึกษาบัญชี</Label>
                <Input
                  placeholder="consultingFee"
                  className="rounded-lg border-2 border-gray-600 bg-white p-2 outline-none transition duration-75 focus:drop-shadow-md"
                  type="text"
                  value={overallData?.consultingFee}
                  onChange={handleChangePayslipData}
                  inputMode="numeric"
                  name="consultingFee"
                />
                <FieldError className="text-xs text-red-700" />
              </TextField>
              <TextField
                isRequired
                className="flex flex-col"
                aria-label="companySocialSecurity"
              >
                <Label>ค่าประกันสังคมจากบริษัท</Label>
                <Input
                  placeholder="companySocialSecurity"
                  className="rounded-lg border-2 border-gray-600 bg-white p-2 outline-none transition duration-75 focus:drop-shadow-md"
                  type="text"
                  value={overallData?.companySocialSecurity}
                  onChange={handleChangePayslipData}
                  inputMode="numeric"
                  name="companySocialSecurity"
                />
                <FieldError className="text-xs text-red-700" />
              </TextField>
            </div>
          </Form>

          <div className="h-96 w-full overflow-auto ">
            <table className="mt-5 w-max table-auto border-collapse border-black ">
              <thead>
                <tr className="sticky top-0 z-30 border-2 border-black bg-gray-200 drop-shadow-md">
                  <th className="border-2 border-black px-4 py-2">Date</th>
                  <th className="sticky left-0 border-2 border-black bg-gray-200 px-4 py-2">
                    Name / Description
                  </th>
                  <th className="border-2 border-black px-4 py-2">
                    Start Date
                  </th>
                  <th className="border-2 border-black px-4 py-2">
                    Salary (THB)
                  </th>
                  <th className="border-2 border-black px-4 py-2">
                    Social Security
                  </th>
                  <th className="border-2 border-black px-4 py-2">
                    Commission /Allowance
                  </th>
                  <th className="border-2 border-black px-4 py-2">Tax</th>
                  <th className="border-2 border-black px-4 py-2">Deduction</th>
                  <th className="border-2 border-black px-4 py-2">Note</th>
                  <th className="border-2 border-black px-4 py-2">Options</th>
                </tr>
              </thead>
              <tbody>
                {payslips.isLoading
                  ? [...Array(5)].map((_, index) => {
                      return (
                        <tr key={index} className="bg-white">
                          <td className="animate-pulse  border-2 border-black px-4 py-2">
                            Loading...
                          </td>
                          <td className="sticky left-0 max-w-20 animate-pulse truncate border-2 border-black bg-white px-4 py-2 md:max-w-96">
                            Loading...
                          </td>
                          <td className="animate-pulse border-2 border-black px-4 py-2">
                            Loading...
                          </td>
                          <td className="animate-pulse border-2 border-black px-4 py-2">
                            Loading...
                          </td>
                          <td className="animate-pulse border-2 border-black px-4 py-2">
                            Loading...
                          </td>
                          <td className="animate-pulse border-2 border-black px-4 py-2">
                            Loading...
                          </td>
                          <td className="animate-pulse border-2 border-black px-4 py-2">
                            Loading...
                          </td>
                          <td className="animate-pulse border-2 border-black px-4 py-2">
                            Loading...
                          </td>
                          <td className="animate-pulse border-2 border-black px-4 py-2">
                            Loading...
                          </td>
                        </tr>
                      );
                    })
                  : payslips.data?.map((payslip, index) => {
                      return (
                        <tr key={index} className="bg-white">
                          <td className="border-2  border-black px-4 py-2">
                            {moment(payslip.recordDate).format("MM/YYYY")}
                          </td>
                          <td className="sticky left-0 max-w-20 truncate border-2 border-black bg-white px-4 py-2 md:max-w-96">
                            {payslip.name}
                          </td>
                          <td className="border-2 border-black px-4 py-2">
                            {moment(payslip.startDate).format("DD/MM/YYYY")}
                          </td>
                          <td className="border-2 border-black px-4 py-2 font-bold text-green-600">
                            {payslip.salary.toLocaleString()}
                          </td>
                          <td className="border-2 border-black px-4 py-2">
                            {payslip.socialSecurity.toLocaleString()}
                          </td>
                          <td className="border-2 border-black px-4 py-2">
                            {payslip.bonus.toLocaleString()}
                          </td>
                          <td className="border-2 border-black px-4 py-2">
                            {payslip.tax.toLocaleString()}
                          </td>
                          <td className="border-2 border-black px-4 py-2">
                            {payslip.deductions.map((deduction, index) => {
                              return (
                                <div key={index}>
                                  {deduction.title} :{" "}
                                  {deduction.value.toLocaleString()}
                                </div>
                              );
                            })}
                          </td>
                          <td className="max-w-96 break-words border-2 border-black px-4 py-2">
                            {payslip.note}
                          </td>
                          <td className="border-2 border-black px-4 py-2">
                            <div className="flex w-full items-center justify-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectPayslip(payslip);
                                  setTriggerUpdatePayslip(true);
                                }}
                                className="flex items-center justify-center rounded-full bg-green-700 
                              p-2 text-xl text-white transition duration-100 hover:bg-green-800 active:scale-105"
                              >
                                <MdModeEdit />
                              </button>
                              <button
                                onClick={() =>
                                  handleDeletePayslip({
                                    payslipId: payslip.id,
                                    name: payslip.name,
                                  })
                                }
                                className="flex items-center justify-center rounded-full bg-red-700 
                              p-2 text-xl text-white transition duration-100 hover:bg-red-800 active:scale-105"
                              >
                                <MdDelete />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>
        </div>
        <div className="w-full rounded-lg bg-gray-100 p-5 ring-1 ring-gray-300">
          <h2 className="flex items-center justify-start gap-2 text-xl font-semibold text-black">
            <MdOutlineSummarize />
            Summary
          </h2>
          <ul className="mt-5 grid w-full grid-cols-4 gap-5">
            <li className="flex flex-col">
              <span>Total Salary</span>
              <span className="font-semibold">
                {payslips.data
                  ?.reduce((acc, payslip) => {
                    return acc + payslip.salary;
                  }, 0)
                  .toLocaleString()}
              </span>
            </li>
            <li className="flex flex-col">
              <span>Total Social Security</span>
              <span className="font-semibold">
                {payslips.data
                  ?.reduce((acc, payslip) => {
                    return acc + payslip.socialSecurity;
                  }, 0)
                  .toLocaleString()}
              </span>
            </li>
            <li className="flex flex-col">
              <span>Total Commission</span>
              <span className="font-semibold">
                {payslips.data
                  ?.reduce((acc, payslip) => {
                    return acc + payslip.bonus;
                  }, 0)
                  .toLocaleString()}
              </span>
            </li>
            <li className="flex flex-col">
              <span> Total Tax</span>
              <span className="font-semibold">
                {payslips.data
                  ?.reduce((acc, payslip) => {
                    return acc + payslip.tax;
                  }, 0)
                  .toLocaleString()}
              </span>
            </li>
            <li className="flex flex-col">
              <span> Total Deduction</span>
              <span className="font-semibold">
                {payslips.data
                  ?.reduce((acc, payslip) => {
                    return (
                      acc +
                      payslip.deductions.reduce((acc, deduction) => {
                        return acc + deduction.value;
                      }, 0)
                    );
                  }, 0)
                  .toLocaleString()}
              </span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}

export default PayslipGenerator;
