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
    <div className="fixed bottom-0 left-0 right-0 top-0 z-50 flex h-screen  w-screen items-center justify-center font-Poppins ">
      <Form className="flex h-max w-max flex-col items-center justify-start gap-2 rounded-xl bg-white p-7">
        <section className="flex h-max w-full flex-col items-center justify-start gap-5 rounded-lg  p-2 ring-2 ring-slate-300  md:w-max md:p-5">
          <header className="flex w-full flex-col items-end justify-between gap-2 md:flex-row">
            <h1 className="rext-xl font-bold md:text-3xl">
              Assign Partner To User
            </h1>
            <SearchField
              value={searchField}
              onChange={(e) => {
                setSearchField(() => e);
              }}
              className="relative mt-10 flex w-80 flex-col"
            >
              <Input
                placeholder="Search Name Or Partner Manager"
                className=" bg-fourth-color h-10 appearance-none rounded-lg p-5 pl-10  outline-0 ring-2 ring-icon-color lg:w-full"
              />
              <IoSearchCircleSharp className="text-super-main-color absolute bottom-0 left-2 top-0 m-auto text-3xl" />
            </SearchField>
          </header>
          <div className=" h-60 w-80 justify-center overflow-auto  md:w-[45rem] 2xl:w-[60rem] ">
            <table className=" w-full table-auto ">
              <thead className="sticky top-0 z-20 h-14 border-b-2 border-black bg-gray-200 font-bold text-blue-700   drop-shadow-md ">
                <tr className=" h-14 w-full border-slate-400 font-normal  text-slate-600">
                  <th>Affiliate ID</th>
                  <th>Name</th>
                  <th>Partner Manager</th>
                  <th>Assing To User</th>
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
                            {partner.manager?.email}
                          </td>
                          <td className="truncate border-4 border-transparent  font-semibold text-black">
                            <div className="flex items-center justify-center">
                              {partner.id === selectAccount.partner?.id ? (
                                <Button
                                  onPress={handleUnassignPartnerToUser}
                                  className="rounded-md bg-red-300 px-4 py-1 
                              text-red-800 transition duration-100 hover:bg-red-800 hover:text-red-300 active:scale-105 "
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
                                  className="rounded-md bg-green-300 px-4 py-1 
                              text-green-800 transition duration-100 hover:bg-green-800 hover:text-green-300 active:scale-105 "
                                >
                                  Assign
                                </Button>
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
      </Form>
      <footer
        onClick={() => {
          document.body.style.overflow = "auto";
          setTriggerAssignPartner(() => false);
        }}
        className="fixed bottom-0 left-0 right-0 top-0 -z-10 h-screen w-screen bg-black/50 "
      ></footer>
    </div>
  );
}

export default AssignPartner;
