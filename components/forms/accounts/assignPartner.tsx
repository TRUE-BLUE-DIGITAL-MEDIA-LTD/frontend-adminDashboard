import React, { useState } from "react";
import {
  Button,
  Form,
  Input,
  Label,
  SearchField,
  TextField,
} from "react-aria-components";
import { MenuItem, Pagination, TextField as TextFieldMUI } from "@mui/material";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { ResponseGetAllAccountByPageService } from "../../../services/admin/account";
import { ErrorMessages, Partner, User } from "../../../models";
import { GetPartnerByPageService } from "../../../services/admin/partner";
import { IoSearchCircleSharp } from "react-icons/io5";
import Swal from "sweetalert2";
import {
  AssignPartnerToUserService,
  UnAssignPartnerToUserService,
} from "../../../services/admin/user";

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

type AssignPartnerProps = {
  accounts: UseQueryResult<ResponseGetAllAccountByPageService, Error>;
  setTriggerAssignPartner: React.Dispatch<React.SetStateAction<boolean>>;
  selectAccount: User & {
    partner: Partner | null;
  };
};
function AssignPartner({
  accounts,
  setTriggerAssignPartner,
  selectAccount,
}: AssignPartnerProps) {
  const [selectPartner, setSelectPartner] = useState<Partner>();
  const [searchField, setSearchField] = useState("");
  const [page, setPage] = useState(1);
  const partners = useQuery({
    queryKey: ["partners", { page: page, searchField: searchField }],
    queryFn: () =>
      GetPartnerByPageService({
        page: page,
        searchField: searchField,
        limit: 20,
      }),
  });

  const handleAssignPartnerToUser = async ({
    partnerId,
  }: {
    partnerId: string;
  }) => {
    try {
      Swal.fire({
        title: "Loading",
        text: "Please wait.",
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });

      const update = await AssignPartnerToUserService({
        partnerId: partnerId,
        userId: selectAccount.id,
      });
      await accounts.refetch();
      document.body.style.overflow = "auto";
      setTriggerAssignPartner(() => false);
      Swal.fire({
        title: "Success",
        text: "Assign partner successfully",
        icon: "success",
      });
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
  };

  const handleUnassignPartnerToUser = async () => {
    try {
      Swal.fire({
        title: "Loading",
        text: "Please wait.",
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });
      const update = await UnAssignPartnerToUserService({
        userId: selectAccount.id,
      });
      await accounts.refetch();
      document.body.style.overflow = "auto";
      setTriggerAssignPartner(() => false);
      Swal.fire({
        title: "Success",
        text: "Unassign partner successfully",
        icon: "success",
      });
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
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-Poppins">
      <Form className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 text-zinc-100 shadow-2xl">
        <header className="flex shrink-0 flex-col gap-3 border-b border-white/10 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Assign partner</h2>
            <p className="text-xs text-zinc-500">
              Connect a partner to this user account
            </p>
          </div>
          <div className="flex items-center gap-2">
            <SearchField
              value={searchField}
              onChange={(e) => {
                setSearchField(() => e);
              }}
              className="relative flex w-56 flex-col sm:w-64"
            >
              <Input
                placeholder="Search name or manager"
                className="h-10 appearance-none rounded-full border border-white/10 bg-black/40 py-2 pl-10 pr-4 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-main-color"
              />
              <IoSearchCircleSharp className="absolute bottom-0 left-2 top-0 m-auto text-2xl text-main-color" />
            </SearchField>
            <button
              type="button"
              onClick={() => {
                document.body.style.overflow = "auto";
                setTriggerAssignPartner(() => false);
              }}
              className="rounded-lg px-2 py-1 text-zinc-400 hover:bg-white/5 hover:text-white"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </header>
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-4 sm:px-6">
          {partners.isLoading
            ? [...Array(5)].map((_, index) => (
                <div
                  key={index}
                  className="h-16 animate-pulse rounded-xl border border-white/5 bg-zinc-800/60"
                />
              ))
            : partners?.data?.data.map((partner) => {
                const isAssigned = partner.id === selectAccount.partner?.id;
                return (
                  <div
                    key={partner.id}
                    className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 transition ${
                      isAssigned
                        ? "border-emerald-500/30 bg-emerald-500/10"
                        : "border-white/10 bg-black/30 hover:bg-white/5"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-white">
                        {partner.name}
                      </p>
                      <p className="truncate text-xs text-zinc-500">
                        ID {partner.affiliateId}
                        {partner.manager?.email
                          ? ` · ${partner.manager.email}`
                          : ""}
                      </p>
                    </div>
                    {isAssigned ? (
                      <Button
                        onPress={handleUnassignPartnerToUser}
                        className="shrink-0 rounded-full border border-rose-500/40 bg-rose-500/20 px-3 py-1.5 text-xs font-medium text-rose-300 transition hover:bg-rose-500/30"
                      >
                        Unassign
                      </Button>
                    ) : (
                      <Button
                        onPress={() =>
                          handleAssignPartnerToUser({
                            partnerId: partner.id,
                          })
                        }
                        className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1.5 text-xs font-medium text-emerald-300 transition hover:bg-emerald-500/25"
                      >
                        Assign
                      </Button>
                    )}
                  </div>
                );
              })}
        </div>
        <div className="flex shrink-0 justify-center border-t border-white/10 px-6 py-3">
          <div className="rounded-full border border-white/15 bg-white/5 px-3 py-2">
            <Pagination
              onChange={(e, page) => setPage(page)}
              count={partners?.data?.meta.total || 1}
              color="primary"
              sx={paginationSx}
            />
          </div>
        </div>
      </Form>
      <footer
        onClick={() => {
          document.body.style.overflow = "auto";
          setTriggerAssignPartner(() => false);
        }}
        className="fixed inset-0 -z-10 bg-black/70"
      ></footer>
    </div>
  );
}


export default AssignPartner;
