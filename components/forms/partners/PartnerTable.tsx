import { UseQueryResult } from "@tanstack/react-query";
import React, { useState } from "react";
import { FaUserPlus } from "react-icons/fa6";
import { DeletePartnerService } from "../../../services/admin/partner";
import { Pagination } from "@mui/material";
import { BiSolidMessageSquareEdit } from "react-icons/bi";
import { MdCategory, MdDelete, MdLanguage, MdPhone, MdSettings } from "react-icons/md";
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


const paginationSx = {
  "& .MuiPaginationItem-root": { color: "#ffffff" },
  "& .MuiPaginationItem-root.Mui-selected": {
    backgroundColor: "#00ABE4",
    color: "#ffffff",
  },
  "& .MuiPaginationItem-root:hover": {
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  "& .MuiPaginationItem-icon": { color: "#ffffff" },
};

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
    <section className="flex h-max w-full max-w-7xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 text-zinc-100">
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
          title="Permission settings"
          maxWidthClassName="max-w-4xl"
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

      <header className="flex flex-col gap-4 border-b border-white/5 px-5 py-5 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-white md:text-2xl">
            <FaUserPlus className="text-[#62C7D8]" />
            Everflow Partner Management
          </h1>
          <p className="text-sm text-zinc-500">
            Search partners and manage domains, numbers, and permissions.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <SearchField
            value={searchField}
            onChange={(e) => {
              setSearchField(() => e);
            }}
            className="relative flex w-56 flex-col 2xl:w-72"
          >
            <Input
              placeholder="Search name or manager"
              className="h-10 appearance-none rounded-full border border-white/10 bg-black/40 py-2 pl-10 pr-4 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-main-color"
            />
            <IoSearchCircleSharp className="absolute bottom-0 left-2 top-0 m-auto text-2xl text-main-color" />
          </SearchField>
          {user.role === "admin" && (
            <button
              onClick={() => {
                document.body.style.overflow = "hidden";
                setTriggerCreateParter(() => true);
              }}
              className="inline-flex items-center gap-2 rounded-full border border-white bg-white px-4 py-2 text-sm font-semibold text-black transition hover:border-main-color hover:bg-main-color hover:text-white active:scale-95"
            >
              <FaUserPlus />
              Create Partner
            </button>
          )}
        </div>
      </header>

      <div className="max-h-96 overflow-auto">
        <table className="w-full min-w-[800px] table-fixed text-left text-sm">
          <thead className="sticky top-0 z-20 border-b border-white/5 bg-zinc-900/95 backdrop-blur">
            <tr className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              <th className="px-5 py-3">Partner</th>
              <th className="px-3 py-3">Manager</th>
              <th className="w-56 px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {partners.isLoading
              ? [...Array(5)].map((_, index) => (
                  <tr key={index} className="animate-pulse border-b border-white/5">
                    <td className="px-5 py-4">
                      <div className="space-y-2">
                        <div className="h-3 w-36 rounded bg-zinc-700" />
                        <div className="h-2.5 w-20 rounded bg-zinc-800" />
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <div className="h-3 w-40 rounded bg-zinc-700" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="ml-auto flex justify-end gap-2">
                        <div className="h-8 w-8 rounded-lg bg-zinc-700" />
                        <div className="h-8 w-8 rounded-lg bg-zinc-700" />
                        <div className="h-8 w-8 rounded-lg bg-zinc-700" />
                      </div>
                    </td>
                  </tr>
                ))
              : partners?.data?.data.map((partner) => {
                  return (
                    <tr
                      className="border-b border-white/5 transition hover:bg-white/5"
                      key={partner.id}
                    >
                      <td className="px-5 py-3.5">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-white">
                            {partner.name}
                          </p>
                          <p className="truncate text-xs text-zinc-500">
                            ID {partner.affiliateId}
                          </p>
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <span className="truncate text-xs text-zinc-400">
                          {partner.manager?.email || "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            title="Assign phone number"
                            onClick={() => {
                              setSelectPartner(partner);
                              setTriggerAssignNumber(() => true);
                              document.body.style.overflow = "hidden";
                            }}
                            className="rounded-lg p-2 text-emerald-300 transition hover:bg-emerald-500/10"
                          >
                            <MdPhone className="text-base" />
                          </button>
                          <button
                            title="Assign domain"
                            onClick={() => {
                              setSelectPartner(partner);
                              setTriggerAssignDomain(() => true);
                              document.body.style.overflow = "hidden";
                            }}
                            className="rounded-lg p-2 text-emerald-300 transition hover:bg-emerald-500/10"
                          >
                            <MdLanguage className="text-base" />
                          </button>
                          <button
                            title="Assign category"
                            onClick={() => {
                              setSelectPartner(partner);
                              setTriggerAssignCategory(() => true);
                              document.body.style.overflow = "hidden";
                            }}
                            className="rounded-lg p-2 text-emerald-300 transition hover:bg-emerald-500/10"
                          >
                            <MdCategory className="text-base" />
                          </button>
                          <button
                            title="Permission settings"
                            onClick={() => {
                              setSelectPartner(partner);
                              document.body.style.overflow = "hidden";
                              setTriggerUpdatePermission(() => true);
                            }}
                            className="rounded-lg p-2 text-zinc-300 transition hover:bg-white/5"
                          >
                            <MdSettings className="text-base" />
                          </button>
                          {(user.role === "admin" || user.role === "manager") && (
                            <button
                              title="Edit partner"
                              onClick={() => {
                                setSelectPartner(partner);
                                document.body.style.overflow = "hidden";
                                setTriggerUpdatePartner(() => true);
                              }}
                              className="rounded-lg p-2 text-main-color transition hover:bg-main-color/10 hover:text-white"
                            >
                              <BiSolidMessageSquareEdit className="text-base" />
                            </button>
                          )}
                          {user.role === "admin" && (
                            <button
                              title="Delete partner"
                              onClick={() =>
                                handleDeletePartner({
                                  partnerId: partner.id,
                                  name: partner.name,
                                })
                              }
                              className="rounded-lg p-2 text-rose-400 transition hover:bg-rose-500/10 hover:text-rose-300"
                            >
                              <MdDelete className="text-base" />
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
      <div className="flex justify-center border-t border-white/5 px-5 py-4">
        <div className="rounded-full border border-white/15 bg-white/5 px-3 py-2">
          <Pagination
            onChange={(e, page) => setPage(page)}
            count={partners?.data?.meta.total || 1}
            color="primary"
            sx={paginationSx}
          />
        </div>
      </div>
    </section>
  );
}


export default PartnerTable;
