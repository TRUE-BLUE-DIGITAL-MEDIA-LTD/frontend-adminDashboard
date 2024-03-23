import { GetServerSideProps, GetServerSidePropsContext } from "next";
import React, { use, useEffect } from "react";
import { GetAllPayslipByMonthsService } from "../../../services/admin/payslip";
import { Payslip } from "../../../models";
import { parseCookies } from "nookies";
import Image from "next/image";
import moment from "moment";

function Index({ payslips }: { payslips: Payslip[] }) {
  useEffect(() => {
    window.print();
  }, []);
  return payslips.map((payslip, index) => {
    return (
      <div
        className={`${index === 0 ? "break-after-avoid" : "print"} flex  flex-col items-center justify-start gap-5 p-5 font-Poppins`}
        key={payslip.id}
      >
        <div className="flex w-full justify-between">
          <div className="flex w-max flex-col items-start justify-center gap-5">
            <h1 className="text-4xl font-bold">Payslip</h1>
          </div>
          <div className="flex w-max flex-col items-start gap-5">
            <div className="relative h-24  w-40 overflow-hidden">
              <Image
                fill
                alt="logo"
                className="object-contain"
                src="https://storage.googleapis.com/storage-oxyclick/public/logoDTST.jpg"
              />
            </div>
            <div>
              <h1 className="text-sm font-bold">บริษัท ดีทีเอสที จำกัด</h1>
              <h1 className="text-sm font-bold">Tax ID: 0445559000236</h1>
              <h1 className="text-sm font-normal">
                139/70 ถนนถีนานนท์ ตำบลตลาด
              </h1>
              <h1 className="text-sm font-normal">
                อำเภอเมือง จังหวัดมหาสารคาม 44000
              </h1>
            </div>
          </div>
        </div>
        <ul className="mt-5 grid w-11/12 grid-cols-3 border-t-2 border-gray-300 py-5">
          <li>
            <h2 className="text-sm font-semibold">Company</h2>
            <h2 className="font-noraml text-sm">WKR Recruitment Co., Ltd.</h2>
          </li>
          <li>
            <h2 className="text-sm font-semibold">Start Date</h2>
            <h2 className="font-noraml text-sm">
              {moment(payslip.startDate).format("DD/MM/YYYY")}
            </h2>
          </li>
          <li>
            <h2 className="text-sm font-semibold">Employee name</h2>
            <h2 className="font-noraml text-sm">{payslip.name}</h2>
          </li>
        </ul>
        <table className="w-11/12 table-auto border-collapse  ">
          <thead>
            <tr className=" bg-gray-200  ">
              <th className="px-4 py-5">Payments</th>
              <th className="px-4 py-5">Deductions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="">
              <td className="px-4 py-5 text-sm">
                <h1 className="flex w-full justify-between">
                  <span className="font-bold">Basic Salary {"  "}</span>
                  {payslip.salary.toLocaleString()} THB
                </h1>
                <h1 className="flex w-full justify-between">
                  <span className="font-bold">Bonus /Allowance {"  "}</span>
                  {payslip.bonus.toLocaleString()} THB
                </h1>
              </td>
              <td className="px-4 py-5 text-sm">
                <h1 className="flex w-full justify-between">
                  <span className="font-bold">Social Security {"  "}</span>
                  {payslip.socialSecurity.toLocaleString()} THB
                </h1>
                <h1 className="flex w-full justify-between">
                  <span className="font-bold">Tax {"  "}</span>
                  {payslip.tax.toLocaleString()} THB
                </h1>
                <h1 className="flex w-full justify-between">
                  <span className="font-bold">Other Deduction {"  "}</span>
                  {payslip.deduction.toLocaleString()} THB
                </h1>
              </td>
            </tr>
            <tr className="border-2 border-gray-200">
              <td className="px-4 py-5 text-lg">
                <h1 className="flex w-full justify-between">
                  <span className="font-bold">Total Payments {"  "}</span>
                  {(payslip.salary + payslip.bonus).toLocaleString()} THB
                </h1>
              </td>
              <td className="px-4 py-5 text-lg">
                <h1 className="flex w-full justify-between">
                  <span className="font-bold">Total Deductions {"  "}</span>
                  {(
                    payslip.deduction +
                    payslip.socialSecurity +
                    payslip.tax
                  ).toLocaleString()}{" "}
                  THB
                </h1>
              </td>
            </tr>
          </tbody>
        </table>
        <div className="mt-5 flex w-11/12 flex-col">
          <h2 className="text-lg font-semibold">Note</h2>
          <div className="line-clamp-3 max-h-40 w-full  break-words">
            {payslip.note}
          </div>
        </div>
      </div>
    );
  });
}

export default Index;

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext,
) => {
  const cookies = parseCookies(ctx);
  const accessToken = cookies.access_token;
  const recordDate = ctx.query.recordDate;
  const payslips = await GetAllPayslipByMonthsService({
    recordDate: recordDate as string,
    accessToken: accessToken,
  });
  return {
    props: {
      payslips,
    },
  };
};
