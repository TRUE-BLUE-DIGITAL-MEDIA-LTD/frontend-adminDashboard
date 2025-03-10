import { UseQueryResult } from "@tanstack/react-query";
import React, { useState } from "react";
import { ResponseGetAllAccountByPageService } from "../../../services/admin/account";
import { ErrorMessages, Pagination, Partner, User } from "../../../models";
import Swal from "sweetalert2";
import { TextField as TextFieldMUI } from "@mui/material";
import { UpdatePartnerService } from "../../../services/admin/partner";
import {
  Button,
  FieldError,
  Form,
  Input,
  Label,
  TextField,
} from "react-aria-components";
import { MenuItem } from "@mui/material";
import { InputNumber } from "primereact/inputnumber";
type UpdatePartnerProps = {
  accounts: UseQueryResult<ResponseGetAllAccountByPageService, Error>;
  setTriggerUpdatePartner: React.Dispatch<React.SetStateAction<boolean>>;
  partners: UseQueryResult<
    Pagination<
      Partner & {
        user: User;
      }
    >,
    Error
  >;
  selectPartner: Partner;
};
function UpdatePartner({
  accounts,
  setTriggerUpdatePartner,
  partners,
  selectPartner,
}: UpdatePartnerProps) {
  const [updatePartnerData, setUpdatePartnerData] = useState<{
    partnerId?: string;
    partnerName?: string;
    userId?: string;
    isAllowUsingSMSPVA?: boolean;
    dailyLimitSMSPVA?: number;
  }>({
    partnerId: selectPartner.affiliateId,
    partnerName: selectPartner.name,
    userId: selectPartner.userId,
    isAllowUsingSMSPVA: selectPartner.isAllowUsingSMSPVA,
    dailyLimitSMSPVA: selectPartner.dailyLimitSMSPVA,
  });

  const handleChangeupdatePartnerData = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setUpdatePartnerData((prev) => {
      return {
        ...prev,
        [e.target.name]: e.target.value,
      };
    });
  };

  const handleSummitUpdatePartner = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      Swal.fire({
        title: "Loading",
        text: "Please wait.",
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });
      if (
        !updatePartnerData?.userId ||
        !updatePartnerData?.partnerId ||
        !updatePartnerData?.partnerName
      ) {
        throw new Error("Please fill all the fields");
      }
      await UpdatePartnerService({
        query: {
          partnerId: selectPartner.id,
        },
        body: {
          userId: updatePartnerData?.userId,
          affiliateId: updatePartnerData?.partnerId,
          name: updatePartnerData?.partnerName,
          isAllowUsingSMSPVA: updatePartnerData.isAllowUsingSMSPVA,
          dailyLimitSMSPVA: updatePartnerData.dailyLimitSMSPVA,
        },
      });
      await partners.refetch();

      Swal.fire({
        title: "Success",
        text: "Partner updated successfully",
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
    <div
      className="fixed bottom-0 left-0 right-0 top-0 z-50 flex h-screen
      w-screen items-center justify-center font-Poppins "
    >
      <Form
        onSubmit={handleSummitUpdatePartner}
        className=" grid min-h-max  grid-cols-2 items-center
         justify-start gap-2 rounded-xl bg-white p-5 md:w-10/12 lg:w-7/12"
      >
        <TextField className="flex  flex-col gap-1" isRequired>
          <Label>Partner ID</Label>
          <Input
            value={updatePartnerData?.partnerId ?? ""}
            className="h-14 w-full rounded-sm border border-gray-400 bg-white p-2 outline-none transition
        duration-75 hover:border-black focus:drop-shadow-md"
            type="text"
            name="partnerId"
            onChange={handleChangeupdatePartnerData}
            maxLength={255}
          />
          <FieldError className="text-xs text-red-600" />
        </TextField>
        <TextField className="flex flex-col gap-1" isRequired>
          <Label>Partner Name</Label>
          <Input
            className="h-14 w-full rounded-sm border border-gray-400 bg-white p-2 outline-none transition
         duration-75 hover:border-black focus:drop-shadow-md"
            type="text"
            value={updatePartnerData?.partnerName ?? ""}
            name="partnerName"
            onChange={handleChangeupdatePartnerData}
            maxLength={255}
          />
          <FieldError className="text-xs text-red-600" />
        </TextField>
        <div className="flex flex-col">
          <Label>Partner Manager</Label>
          <TextFieldMUI
            required
            select
            className="h-14 w-full"
            value={updatePartnerData?.userId ?? ""}
          >
            {accounts.data?.accounts.map((account) => {
              return (
                <MenuItem
                  onClick={(e) => {
                    setUpdatePartnerData((prev) => {
                      return {
                        ...prev,
                        userId: e.currentTarget.dataset.value as string,
                      };
                    });
                  }}
                  key={account.id}
                  value={account.id}
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <span>{account.email}</span>
                  </div>
                </MenuItem>
              );
            })}
          </TextFieldMUI>
        </div>

        <div className="flex w-full flex-col gap-1">
          <span>Allow Partner To Access SMS PVA</span>
          <select
            value={updatePartnerData.isAllowUsingSMSPVA ? "allow" : "not-allow"}
            onChange={(e) => {
              setUpdatePartnerData((prev) => {
                return {
                  ...prev,
                  isAllowUsingSMSPVA: e.target.value === "allow" ? true : false,
                };
              });
            }}
            className="h-14 w-full rounded-sm border border-gray-400 bg-white p-2 outline-none transition
         duration-75 hover:border-black focus:drop-shadow-md"
          >
            <option value="allow">allow</option>
            <option value="not-allow">not allow</option>
          </select>
        </div>
        <TextField className="flex flex-col gap-1" isRequired>
          <Label>Daily Limit On Using PVA</Label>
          <InputNumber
            currency="USD"
            locale="en-US"
            mode="currency"
            className=" h-14 rounded-sm border border-gray-400 bg-white outline-none transition
         duration-75 hover:border-black focus:drop-shadow-md"
            type="text"
            value={updatePartnerData?.dailyLimitSMSPVA ?? 0}
            onChange={(e) => {
              setUpdatePartnerData((prev) => {
                return {
                  ...prev,
                  dailyLimitSMSPVA: Number(e.value),
                };
              });
            }}
          />
          <FieldError className="text-xs text-red-600" />
        </TextField>

        <Button
          type="submit"
          className="main-button col-span-2 mt-10 w-40 font-bold"
        >
          Update
        </Button>
      </Form>
      <footer
        onClick={() => {
          document.body.style.overflow = "auto";
          setTriggerUpdatePartner(() => false);
        }}
        className="fixed bottom-0 left-0 right-0 top-0 -z-10 h-screen w-screen bg-black/50 "
      ></footer>
    </div>
  );
}

export default UpdatePartner;
