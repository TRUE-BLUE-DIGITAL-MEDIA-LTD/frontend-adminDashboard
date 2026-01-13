import { UseQueryResult, useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { FaUserPlus } from "react-icons/fa6";
import {
  DeletePartnerService,
  GetPartnerByPageService,
} from "../../../services/admin/partner";
import { Pagination } from "@mui/material";
import { BiSolidMessageSquareEdit } from "react-icons/bi";
import { MdDelete, MdSettings } from "react-icons/md";
import { Input, SearchField } from "react-aria-components";
import { IoSearchCircleSharp } from "react-icons/io5";
import CreatePartner from "./createPartner";
import { ResponseGetAllAccountByPageService } from "../../../services/admin/account";
import UpdatePartner from "./updatePartner";
import { ErrorMessages, Partner, User } from "../../../models";
import Swal from "sweetalert2";
import AssignDomain from "./assignDomain";
import AssignPhoneNumber from "./assignPhoneNumber";
import AssignCategory from "./assignCategory";
import { useGetPartners } from "../../../react-query";
import UpdatePermissionPartner from "./updatePermissionPartner";
import PopupLayout from "../../../layouts/PopupLayout";

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
  const [triggerUpdatePermission, setTriggerUpdatePermission] = useState(false);
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
    <section className="flex h-max w-full max-w-7xl flex-col items-center justify-start gap-5 rounded-lg bg-white p-5 shadow-lg">
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

      {triggerUpdatePermission && selectPartner && (
        <PopupLayout
          onClose={() => {
            setTriggerUpdatePermission(() => false);
            setSelectPartner(undefined);
          }}
        >
          <UpdatePermissionPartner
            partners={partners}
            selectPartner={selectPartner}
          />
        </PopupLayout>
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

      <header className="flex w-full flex-col items-center justify-between gap-2 md:flex-row">
        <h1 className="rext-xl flex items-center gap-3 text-lg font-bold text-gray-800 2xl:text-3xl">
          <FaUserPlus />
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
              className="flex items-center justify-center gap-2 rounded-2xl bg-blue-500 px-4 py-2 text-white shadow-md
   transition duration-150 ease-in-out hover:bg-blue-600 active:scale-95"
            >
              <FaUserPlus />
              <span className="text-xs 2xl:text-base">Create Partner</span>
            </button>
          </div>
        )}
      </header>
      <div className="h-96 w-full justify-center overflow-auto">
        <table className=" w-max min-w-full table-auto text-center">
          <thead className="sticky top-0 z-20 bg-gray-100">
            <tr className="text-sm font-bold text-gray-700">
              <th className="p-4">Affiliate ID</th>
              <th className="p-4">Name</th>
              <th className="p-4">Partner Manager</th>
              <th className="p-4">Assign Phone Number</th>
              <th className="p-4">Assign Domain</th>
              <th className="p-4">Assign Category</th>
              <th className="p-4">Permission</th>
              {(user.role === "admin" || user.role === "manager") && (
                <th className="p-4">Options</th>
              )}
            </tr>
          </thead>
          <tbody>
            {partners.isLoading
              ? [...Array(5)].map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="p-4">
                      <div className="mx-auto h-4 w-20 rounded bg-gray-300"></div>
                    </td>
                    <td className="p-4">
                      <div className="mx-auto h-4 w-40 rounded bg-gray-300"></div>
                    </td>
                    <td className="p-4">
                      <div className="mx-auto h-4 w-40 rounded bg-gray-300"></div>
                    </td>
                    <td className="p-4">
                      <div className="mx-auto h-8 w-32 rounded bg-gray-300"></div>
                    </td>
                    <td className="p-4">
                      <div className="mx-auto h-8 w-32 rounded bg-gray-300"></div>
                    </td>
                    <td className="p-4">
                      <div className="mx-auto h-8 w-32 rounded bg-gray-300"></div>
                    </td>
                    <td className="p-4">
                      <div className="mx-auto h-8 w-40 rounded bg-gray-300"></div>
                    </td>
                    <td className="p-4">
                      <div className="mx-auto flex justify-center gap-2">
                        <div className="h-6 w-6 rounded bg-gray-300"></div>
                        <div className="h-6 w-6 rounded bg-gray-300"></div>
                      </div>
                    </td>
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
                      className="border-b border-gray-200 py-5 hover:bg-gray-50"
                      key={partner.id}
                    >
                      <td className="p-4 font-semibold text-black">
                        {partner.affiliateId}
                      </td>
                      <td className="p-4 font-semibold text-black">
                        {partner.name}
                      </td>
                      <td className="p-4 font-semibold text-black">
                        {partner.manager?.email}
                      </td>

                      <td className="p-4 font-semibold text-black">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => {
                              setSelectPartner(partner);
                              setTriggerAssignNumber(() => true);
                              document.body.style.overflow = "hidden";
                            }}
                            className="rounded-2xl bg-green-500 px-5 py-2 text-white shadow-md
                           transition duration-150 hover:bg-green-600"
                          >
                            phone number
                          </button>
                        </div>
                      </td>

                      <td className="p-4 font-semibold text-black">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => {
                              setSelectPartner(partner);
                              setTriggerAssignDomain(() => true);
                              document.body.style.overflow = "hidden";
                            }}
                            className="rounded-2xl bg-green-500 px-5 py-2 text-white shadow-md
                           transition duration-150 hover:bg-green-600"
                          >
                            domain
                          </button>
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-black">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => {
                              setSelectPartner(partner);
                              setTriggerAssignCategory(() => true);
                              document.body.style.overflow = "hidden";
                            }}
                            className="rounded-2xl bg-green-500 px-5 py-2 text-white shadow-md
                           transition duration-150 hover:bg-green-600"
                          >
                            category
                          </button>
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-black">
                        <div className="flex w-full items-center justify-center">
                          <button
                            onClick={() => {
                              setSelectPartner(partner);
                              document.body.style.overflow = "hidden";
                              setTriggerUpdatePermission(() => true);
                            }}
                            className="flex items-center justify-center gap-1 rounded-2xl bg-gray-800 px-5 py-2 text-white shadow-md hover:bg-gray-900 active:ring-2"
                          >
                            <MdSettings /> Permission Setting
                          </button>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex w-full items-center justify-center gap-3">
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
      <div className="mt-5 flex justify-center">
        <Pagination
          onChange={(e, page) => setPage(page)}
          count={partners?.data?.meta.total || 1}
          color="primary"
        />
      </div>
    </section>
  );
}

export default PartnerTable;
