import { UseQueryResult, useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { FaUserPlus } from "react-icons/fa6";
import {
  DeletePartnerService,
  GetPartnerByPageService,
} from "../../services/admin/partner";
import { Pagination } from "@mui/material";
import { BiSolidMessageSquareEdit } from "react-icons/bi";
import { MdDelete } from "react-icons/md";
import { Input, SearchField } from "react-aria-components";
import { IoSearchCircleSharp } from "react-icons/io5";
import CreatePartner from "../forms/partners/createPartner";
import { ResponseGetAllAccountByPageService } from "../../services/admin/account";
import UpdatePartner from "../forms/partners/updatePartner";
import { ErrorMessages, Partner, User } from "../../models";
import Swal from "sweetalert2";
import AssignDomain from "../forms/partners/assignDomain";
import AssignPhoneNumber from "../forms/partners/assignPhoneNumber";
import AssignCategory from "../forms/partners/assignCategory";
import { useGetPartners } from "../../react-query";

type PartnerProps = {
  accounts: UseQueryResult<ResponseGetAllAccountByPageService, Error>;
  user: User;
};
function PartnerTable({ accounts, user }: PartnerProps) {
  const [triggerCreatePartner, setTriggerCreateParter] = useState(false);
  const [triggerAssignNumber, setTriggerAssignNumber] = useState(false);
  const [triggerUpdatePartner, setTriggerUpdatePartner] = useState(false);
  const [triggerAssignDomain, setTriggerAssignDomain] = useState(false);
  const [triggerAssignCategory, setTriggerAssignCategory] = useState(false);

  const [selectPartner, setSelectPartner] = useState<Partner>();
  const [searchField, setSearchField] = useState("");
  const [page, setPage] = useState(1);

  const partners = useGetPartners({
    page: page,
    searchField: searchField,
    limit: 40,
  });

  const handleDeletePartner = async ({
    partnerId,
    name,
  }: {
    partnerId: string;
    name: string;
  }) => {
    let content = document.createElement("div");
    content.innerHTML =
      "<div>Please type this</div> <strong>" +
      "delete" +
      "</strong> <div>to confirm deleting</div>";
    const { value } = await Swal.fire({
      title: "Delete Domain",
      input: "text",
      footer: "Please type this 'delete' to confirm deleting",
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

        await DeletePartnerService({
          partnerId: partnerId,
        });
        await partners.refetch();
        Swal.fire("Deleted!", "Partner has been deleted", "success");
      } catch (error) {
        console.log(error);
        let result = error as ErrorMessages;
        Swal.fire({
          title: result.error,
          text: result.message.toString(),
          footer: "Error Code :" + result.statusCode?.toString(),
          icon: "error",
        });
      }
    }
  };
  return (
    <section className="flex h-max w-11/12 flex-col items-center justify-start gap-5 rounded-lg  p-2 ring-2 ring-slate-300  md:p-5">
      {triggerCreatePartner && (
        <CreatePartner
          partners={partners}
          setTriggerCreateParter={setTriggerCreateParter}
          accounts={accounts}
        />
      )}
      {triggerUpdatePartner && selectPartner && (
        <UpdatePartner
          partners={partners}
          setTriggerUpdatePartner={setTriggerUpdatePartner}
          accounts={accounts}
          selectPartner={selectPartner}
        />
      )}

      {triggerAssignDomain && selectPartner && (
        <AssignDomain
          selectPartner={selectPartner}
          setTriggerAssignDomain={setTriggerAssignDomain}
        />
      )}

      {triggerAssignCategory && selectPartner && (
        <AssignCategory
          selectPartner={selectPartner}
          setTriggerAssignCategory={setTriggerAssignCategory}
        />
      )}

      {triggerAssignNumber && selectPartner && (
        <AssignPhoneNumber
          user={user}
          setTriggerAssignNumber={setTriggerAssignNumber}
          selectPartner={selectPartner}
        />
      )}

      <header className="flex w-full flex-col items-end justify-between gap-2 md:flex-row">
        <h1 className="rext-xl text-lg font-bold 2xl:text-3xl">
          Everflow Partner Management
        </h1>
        <SearchField
          value={searchField}
          onChange={(e) => {
            setSearchField(() => e);
          }}
          className="relative mt-10 flex w-60 flex-col 2xl:w-80"
        >
          <Input
            placeholder="Search Name Or Partner Manager"
            className=" bg-fourth-color h-10 appearance-none rounded-lg p-5 pl-10  outline-0 ring-2 ring-icon-color lg:w-full"
          />
          <IoSearchCircleSharp className="text-super-main-color absolute bottom-0 left-2 top-0 m-auto text-3xl" />
        </SearchField>
        {user.role === "admin" && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => {
                document.body.style.overflow = "hidden";
                setTriggerCreateParter(() => true);
              }}
              className="flex items-center justify-center gap-1 rounded-xl bg-green-400 p-3 ring-black
   transition duration-150 ease-in hover:bg-green-500 active:scale-105 active:ring-2 active:drop-shadow-sm  "
            >
              <FaUserPlus />
              <span className="text-xs 2xl:text-base">create partner</span>
            </button>
          </div>
        )}
      </header>
      <div className=" h-96 w-full justify-center overflow-auto   ">
        <table className=" w-max min-w-full table-auto ">
          <thead className="sticky top-0 z-20 h-14 border-b-2 border-black bg-gray-200 font-bold text-blue-700   drop-shadow-md ">
            <tr className=" h-14 w-full border-slate-400 font-normal  text-slate-600">
              <th className="px-5">Affiliate ID</th>
              <th className="px-5">Name</th>
              <th className="px-5">Partner Manager</th>
              <th className="px-5">Assign Phone Number</th>
              <th className="px-5">Assign Domain</th>
              <th className="px-5">Assign Category</th>
              <th className="px-5">SMS PVA Permission</th>
              <th className="px-5">SMS POOL Permission</th>

              {user.role === "admin" && <th className="px-5">Options</th>}
            </tr>
          </thead>
          <tbody>
            {partners.isLoading
              ? [...Array(5)].map((_, index) => (
                  <tr key={index}>
                    <td className="h-10 w-20 animate-pulse border-4 border-transparent bg-gray-400 "></td>
                    <td className="h-10 w-60 animate-pulse border-4 border-transparent bg-gray-200 "></td>
                    <td className="h-10 w-20 animate-pulse border-4 border-transparent bg-gray-200 "></td>
                    <td className="h-10 w-40 animate-pulse border-4 border-transparent bg-gray-50 "></td>
                    <td className="h-12 w-96 animate-pulse border-4 border-transparent bg-gray-300 "></td>
                    <td className="h-10 w-20 animate-pulse border-4 border-transparent bg-gray-600 "></td>
                    <td className="h-10 w-40 animate-pulse border-4 border-transparent bg-gray-200 "></td>
                  </tr>
                ))
              : partners?.data?.data.map((partner) => {
                  const createAt = new Date(partner?.createAt);
                  const formattedDatecreateAt = createAt.toLocaleDateString(
                    "en-US",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    },
                  );
                  return (
                    <tr
                      className=" h-12 border-b-[0.1px] border-gray-600 py-5 hover:bg-gray-200"
                      key={partner.id}
                    >
                      <td className="h-10 truncate border-4 border-transparent font-semibold text-black">
                        {partner.affiliateId}
                      </td>
                      <td className="truncate border-4 border-transparent font-semibold text-black">
                        {partner.name}
                      </td>
                      <td className="truncate border-4 border-transparent font-semibold text-black">
                        {partner.user.email}
                      </td>

                      <td className="truncate border-4 border-transparent font-semibold text-black">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => {
                              setSelectPartner(partner);
                              setTriggerAssignNumber(() => true);
                              document.body.style.overflow = "hidden";
                            }}
                            className="rounded-md bg-green-400 px-5 py-1 text-black
                           transition duration-150 hover:bg-green-500"
                          >
                            phone number
                          </button>
                        </div>
                      </td>

                      <td className="truncate border-4 border-transparent font-semibold text-black">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => {
                              setSelectPartner(partner);
                              setTriggerAssignDomain(() => true);
                              document.body.style.overflow = "hidden";
                            }}
                            className="rounded-md bg-green-400 px-5 py-1 text-black
                           transition duration-150 hover:bg-green-500"
                          >
                            domain
                          </button>
                        </div>
                      </td>
                      <td className="truncate border-4 border-transparent font-semibold text-black">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => {
                              setSelectPartner(partner);
                              setTriggerAssignCategory(() => true);
                              document.body.style.overflow = "hidden";
                            }}
                            className="rounded-md bg-green-400 px-5 py-1 text-black
                           transition duration-150 hover:bg-green-500"
                          >
                            category
                          </button>
                        </div>
                      </td>
                      <td className="truncate border-4 border-transparent font-semibold text-black">
                        <div className="flex w-full items-center justify-center">
                          {partner.isAllowUsingSMSPVA ? (
                            <div className="w-full rounded-md bg-green-200 px-2 text-center text-green-500">
                              Allow
                            </div>
                          ) : (
                            <div className="w-full rounded-md bg-red-200 px-2 text-center text-red-500">
                              Deny
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="truncate border-4 border-transparent font-semibold text-black">
                        <div className="flex w-full items-center justify-center">
                          {partner.isAllowUsingSMSPOOL ? (
                            <div className="w-full rounded-md bg-green-200 px-2 text-center text-green-500">
                              Allow
                            </div>
                          ) : (
                            <div className="w-full rounded-md bg-red-200 px-2 text-center text-red-500">
                              Deny
                            </div>
                          )}
                        </div>
                      </td>
                      <td className=" border-4 border-transparent">
                        <div className="flex w-full gap-3">
                          <button
                            onClick={() => {
                              setSelectPartner(partner);
                              document.body.style.overflow = "hidden";
                              setTriggerUpdatePartner(() => true);
                            }}
                            className="text-3xl  text-blue-700 transition duration-100 hover:scale-105 active:text-blue-900"
                          >
                            <BiSolidMessageSquareEdit />
                          </button>

                          {user.role === "admin" && (
                            <button
                              onClick={() =>
                                handleDeletePartner({
                                  partnerId: partner.id,
                                  name: partner.name,
                                })
                              }
                              className="text-3xl text-red-700 transition duration-100 hover:scale-105 active:text-red-900"
                            >
                              <MdDelete />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>
      <Pagination
        onChange={(e, page) => setPage(page)}
        count={partners?.data?.meta.total || 1}
        color="primary"
      />
    </section>
  );
}

export default PartnerTable;
