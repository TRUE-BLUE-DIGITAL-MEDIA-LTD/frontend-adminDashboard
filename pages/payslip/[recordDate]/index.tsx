import { GetServerSideProps, GetServerSidePropsContext } from "next";
import React, { use, useEffect } from "react";
import { GetAllPayslipByMonthsService } from "../../../services/admin/payslip";
import { Deduction, Payslip } from "../../../models";
import { parseCookies } from "nookies";
import Image from "next/image";
import moment from "moment";
import { MdOutlineSummarize } from "react-icons/md";

function Index({
  payslips,
  companySocialSecurity,
  consultingFee,
}: {
  payslips: (Payslip & { deductions: Deduction[] })[];
  companySocialSecurity: string;
  consultingFee: string;
}) {
  useEffect(() => {
    window.print();
  }, []);

  return (
    <>
      {payslips.map((payslip, index) => {
        return (
          <div
            className={`${index === 0 ? "break-after-avoid" : "print"} flex  flex-col items-center justify-start gap-5 p-5 font-Poppins`}
            key={payslip.id}
          >
            <div className="flex w-11/12 justify-between">
              <div className="flex w-max flex-col items-start justify-center gap-5">
                <h1 className="text-4xl font-bold">Payslip</h1>
              </div>
              <div className="flex w-max flex-col items-end gap-5">
                <div className="relative h-24 w-72 overflow-hidden">
                  <Image
                    fill
                    alt="logo"
                    className="object-contain"
                    src={
                      payslip.logo
                        ? payslip.logo
                        : "https://storage.googleapis.com/storage-oxyclick/public/logoDTST.jpg"
                    }
                  />
                </div>
                {payslip.address ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: payslip.address,
                    }}
                  />
                ) : (
                  <div className="flex w-max flex-col items-end">
                    <h1 className="text-sm font-bold">
                      บริษัท ดีทีเอสที จำกัด
                    </h1>
                    <h1 className="text-sm font-bold">Tax ID: 0445559000236</h1>
                    <h1 className="text-sm font-normal">
                      139/70 ถนนถีนานนท์ ตำบลตลาด
                    </h1>
                    <h1 className="text-sm font-normal">
                      อำเภอเมือง จังหวัดมหาสารคาม 44000
                    </h1>
                  </div>
                )}
              </div>
            </div>
            <ul className="mt-5 grid w-11/12 grid-cols-2 border-t-2 border-gray-300 py-5">
              <li>
                <h2 className="text-sm font-semibold">Employee name</h2>
                {payslip.engName && (
                  <h2 className="font-noraml text-sm">{payslip.engName}</h2>
                )}
                <h2 className="font-noraml text-sm">{payslip.name}</h2>
              </li>
              <li>
                <h2 className="text-sm font-semibold">Pay Period</h2>
                <h2 className="font-noraml text-sm">
                  {moment(payslip.recordDate)
                    .startOf("month")
                    .format("DD MMMM YYYY")}{" "}
                  -{" "}
                  {moment(payslip.recordDate)
                    .endOf("month")
                    .format("DD MMMM YYYY")}
                </h2>
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
                  <td className=" flex h-full flex-col justify-center px-4 py-5 text-sm">
                    <h1 className="flex w-full justify-between">
                      <span className="font-bold">Basic Salary {"  "}</span>
                      {payslip.salary.toLocaleString()} THB
                    </h1>
                    <h1 className="flex w-full justify-between">
                      <span className="font-bold">
                        Commission /Allowance {"  "}
                      </span>
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
                    <div className="flex w-full justify-between">
                      <span className="font-bold">Other Deductions {"  "}</span>
                      <div>
                        {payslip.deductions.map((deduction, index) => {
                          return (
                            <div
                              className="flex w-full justify-end"
                              key={index}
                            >
                              {deduction.title} :{" "}
                              {deduction.value.toLocaleString()} THB
                            </div>
                          );
                        })}
                      </div>
                    </div>
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
                        payslip.deductions.reduce(
                          (previousValue, currentValue) => {
                            return previousValue + currentValue.value;
                          },
                          0,
                        ) +
                        payslip.socialSecurity +
                        payslip.tax
                      ).toLocaleString()}{" "}
                      THB
                    </h1>
                  </td>
                </tr>
                <tr className="border-2 border-gray-200">
                  <td className="px-4 py-5 text-lg"></td>
                  <td className="px-4 py-5 text-lg">
                    <h1 className="flex w-full justify-between">
                      <span className="font-bold">Net Payment {"  "}</span>
                      {(
                        payslip.salary +
                        payslip.bonus -
                        (payslip.deductions.reduce(
                          (previousValue, currentValue) => {
                            return previousValue + currentValue.value;
                          },
                          0,
                        ) +
                          payslip.socialSecurity +
                          payslip.tax)
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
      })}

      <div className="print flex w-full flex-col items-center gap-5 ">
        <table className="mt-5 w-96 table-auto border-collapse border-black ">
          <thead>
            <tr className=" border-2 border-black bg-gray-200 drop-shadow-md">
              <th className="border-2 border-black px-2">No.</th>
              <th className="sticky left-0 border-2 border-black bg-gray-200 px-2">
                Name / Description
              </th>
              <th className="border-2 border-black px-2">Start Date</th>
              <th className="border-2 border-black px-2">Salary (THB)</th>
              <th className="border-2 border-black px-2">Social Security</th>
              <th className="border-2 border-black px-2">
                Commission /Allowance
              </th>
              <th className="border-2 border-black px-2">Tax</th>
              <th className="border-2 border-black px-2">Deduction</th>
              <th className="border-2 border-black px-2">Note</th>
            </tr>
          </thead>
          <tbody>
            {payslips?.map((payslip, index) => {
              return (
                <tr key={index} className="">
                  <td className="border-2  border-black px-2 text-center font-semibold">
                    {index + 1}
                  </td>
                  <td className="border-2 border-black  px-2 ">
                    {payslip.name}
                  </td>
                  <td className="border-2 border-black px-2">
                    {moment(payslip.startDate).format("DD/MM/YYYY")}
                  </td>
                  <td className="border-2 border-black px-2 font-bold text-green-600">
                    {payslip.salary.toLocaleString()}
                  </td>
                  <td className="border-2 border-black px-2">
                    {payslip.socialSecurity.toLocaleString()}
                  </td>
                  <td className="border-2 border-black px-2">
                    {payslip.bonus.toLocaleString()}
                  </td>
                  <td className="border-2 border-black px-2">
                    {payslip.tax.toLocaleString()}
                  </td>
                  <td className="border-2 border-black px-2">
                    {payslip.deductions.map((deduction, index) => {
                      return (
                        <div key={index}>
                          {deduction.title} : {deduction.value.toLocaleString()}
                        </div>
                      );
                    })}
                  </td>
                  <td className="max-w-96 break-words border-2 border-black px-2">
                    {payslip.note}
                  </td>
                </tr>
              );
            })}
            <tr>
              <td className="border-2  border-black px-2 text-center font-semibold">
                สรุป
              </td>
              <td className="border-2 border-black px-2"></td>
              <td className="border-2 border-black px-2"></td>
              <td className="border-2 border-black px-2 font-bold text-green-600">
                {payslips
                  ?.reduce((acc, payslip) => {
                    return acc + payslip.salary;
                  }, 0)
                  .toLocaleString()}
              </td>
              <td className="border-2 border-black px-2">
                {payslips
                  ?.reduce((acc, payslip) => {
                    return acc + payslip.socialSecurity;
                  }, 0)
                  .toLocaleString()}
              </td>
              <td className="border-2 border-black px-2">
                {payslips
                  ?.reduce((acc, payslip) => {
                    return acc + payslip.bonus;
                  }, 0)
                  .toLocaleString()}
              </td>
              <td className="border-2 border-black px-2">
                {payslips
                  ?.reduce((acc, payslip) => {
                    return acc + payslip.tax;
                  }, 0)
                  .toLocaleString()}
              </td>
              <td className="border-2 border-black px-2">
                {payslips
                  ?.reduce((acc, payslip) => {
                    return (
                      acc +
                      payslip.deductions.reduce((acc, deduction) => {
                        return acc + deduction.value;
                      }, 0)
                    );
                  }, 0)
                  .toLocaleString()}
              </td>
              <td className="border-2 border-black px-2"></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="print w-full rounded-lg bg-gray-100 p-5 ring-1 ring-gray-300">
        <h2 className="flex items-center justify-start gap-2 text-xl font-semibold text-black">
          Summary <MdOutlineSummarize />{" "}
          {moment(payslips[0].recordDate).format("MMMM YYYY")}
        </h2>
        <ul className="mt-5 grid w-full grid-cols-1 gap-5">
          <li className="grid w-full grid-cols-2">
            <span className="text-xl">รายการ</span>
            <span className="font-semibold">ยอดเงิน</span>
          </li>
          <li className="grid w-full grid-cols-2">
            <span className="text-xl">ค่าประกันสังคมจากบริษัท</span>
            <span className="font-semibold">
              {Number(companySocialSecurity).toLocaleString()}
            </span>
          </li>
          <li className="grid w-full grid-cols-2">
            <span className="text-xl">ประกันสังคมพนักงาน</span>
            <span className="font-semibold">
              {payslips
                ?.reduce((acc, payslip) => {
                  return acc + payslip.socialSecurity;
                }, 0)
                .toLocaleString()}
            </span>
          </li>
          <li className="grid w-full grid-cols-2">
            <span className="text-xl">ค่าปรึกษาบัญชี</span>
            <span className="font-semibold">
              {Number(consultingFee).toLocaleString()}
            </span>
          </li>
          <li className="grid w-full grid-cols-2">
            <span className="text-xl">Total Tax</span>
            <span className="font-semibold">
              {payslips
                ?.reduce((acc, payslip) => {
                  return acc + payslip.tax;
                }, 0)
                .toLocaleString()}
            </span>
          </li>
          <li className="grid w-full grid-cols-2">
            <span className="text-xl">
              Total To Transfer - ยอดรวมที่ต้องโอน
            </span>
            <span className="text-xl font-semibold">
              {(
                Number(companySocialSecurity) +
                payslips?.reduce((acc, payslip) => {
                  return acc + payslip.socialSecurity;
                }, 0) +
                Number(consultingFee) +
                payslips?.reduce((acc, payslip) => {
                  return acc + payslip.tax;
                }, 0)
              ).toLocaleString()}
            </span>
          </li>
        </ul>
      </div>
    </>
  );
}

export default Index;

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext,
) => {
  const cookies = parseCookies(ctx);
  const accessToken = cookies.access_token;
  const recordDate = ctx.query.recordDate;
  const { companySocialSecurity, consultingFee } = ctx.query;

  const payslips = await GetAllPayslipByMonthsService({
    recordDate: recordDate as string,
    accessToken: accessToken,
  });
  return {
    props: {
      payslips,
      companySocialSecurity,
      consultingFee,
    },
  };
};
