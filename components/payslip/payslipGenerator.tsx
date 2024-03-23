import React, { useRef, useState } from "react";
import {
  Button,
  FieldError,
  Form,
  Input,
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
import { MdDelete, MdModeEdit } from "react-icons/md";
import { Payslip } from "../../models";
import UpdatePayslip from "../forms/payslips/updatePayslip";
import { FaPrint } from "react-icons/fa6";
import Link from "next/link";

function PayslipGenerator() {
  const [recordDate, setRecordDate] = useState<Nullable<Date | null>>(
    new Date(),
  );
  const [selectPayslip, setSelectPayslip] = useState<Payslip>();
  const payslips = useQuery({
    queryKey: ["payslips", moment(recordDate).format("MM-YYYY")],
    queryFn: () =>
      GetAllPayslipByMonthsService({
        recordDate: moment(recordDate).toISOString() as string,
      }),
  });

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

  return (
    <div className="flex w-full flex-col items-center ">
      <header className="mt-28 flex flex-col items-center justify-center py-5">
        <h1 className="font-Poppins text-4xl font-semibold md:text-7xl">
          <span className="text-icon-color">Pay</span>
          <span>slip Generator</span>
        </h1>
      </header>
      <main className="flex w-80 flex-col items-center justify-start gap-5 py-10 lg:w-[45rem] xl:w-[60rem]  ">
        <TextField className="flex flex-col items-start justify-center gap-2">
          <Label className="">Pick Record Date</Label>
          <Calendar
            value={recordDate}
            onChange={(e) => {
              setRecordDate(e.value);
            }}
            view="month"
            dateFormat="mm/yy"
          />
        </TextField>
        {!selectPayslip && (
          <CreatePayslip recordDate={recordDate} payslips={payslips} />
        )}
        {selectPayslip && (
          <UpdatePayslip
            selectPayslip={selectPayslip}
            payslips={payslips}
            setSelectPayslip={setSelectPayslip}
          />
        )}
        <div className="w-full rounded-lg bg-gray-100 p-5 ring-1 ring-gray-300">
          <Link
            href={`/payslip/${moment(recordDate).toISOString()}`}
            className="my-5 flex w-max items-center justify-center gap-2 rounded-lg bg-green-400 px-10 py-2 font-bold text-black ring-black transition duration-150
hover:bg-green-600 active:scale-105 active:ring-2"
          >
            <FaPrint />
            Generate Payslip
          </Link>
          <div className="h-96 w-full overflow-auto ">
            <table className="mt-5 w-max table-auto border-collapse border-black ">
              <thead>
                <tr className="sticky top-0 z-40 border-2 border-black bg-gray-200 drop-shadow-md">
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
                    Bonus /Allowance
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
                            {payslip.deduction.toLocaleString()}
                          </td>
                          <td className="max-w-96 break-words border-2 border-black px-4 py-2">
                            {payslip.note}
                          </td>
                          <td className="border-2 border-black px-4 py-2">
                            <div className="flex w-full items-center justify-center gap-2">
                              <button
                                onClick={() => setSelectPayslip(payslip)}
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
      </main>
    </div>
  );
}

export default PayslipGenerator;
