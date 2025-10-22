import { MenuItem, TextField as TextFieldMUI } from "@mui/material";
import { UseQueryResult } from "@tanstack/react-query";
import { InputNumber } from "primereact/inputnumber";
import React, { useState } from "react";
import {
  Button,
  FieldError,
  Form,
  Input,
  Label,
  TextField,
} from "react-aria-components";
import Swal from "sweetalert2";
import { ErrorMessages, Pagination, Partner, User } from "../../../models";
import { useTopupWithOutOxypoint } from "../../../react-query";
import { ResponseGetAllAccountByPageService } from "../../../services/admin/account";
import { UpdatePartnerService } from "../../../services/admin/partner";
type UpdatePartnerProps = {
  accounts: UseQueryResult<ResponseGetAllAccountByPageService, Error>;
  setTriggerUpdatePartner: React.Dispatch<React.SetStateAction<boolean>>;
  partners: UseQueryResult<
    Pagination<
      Partner & {
        manager: User;
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
    managerId?: string;
    refill_oxyclick_points: number;
    smartLink?: string;
  }>({
    partnerId: selectPartner.affiliateId,
    partnerName: selectPartner.name,
    managerId: selectPartner.managerId,
    refill_oxyclick_points: selectPartner.refill_oxyclick_points / 100,
    smartLink: selectPartner.smartLink,
  });
  const createTopup = useTopupWithOutOxypoint();
  const [topup, setTopup] = useState<number | undefined>();
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
        !updatePartnerData?.managerId ||
        !updatePartnerData?.partnerId ||
        !updatePartnerData?.partnerName
      ) {
        throw new Error("Please fill all the fields");
      }

      if (topup && topup > 0) {
        await createTopup.mutateAsync({
          amount: topup * 100,
          partnerId: selectPartner.id,
        });
      }

      await UpdatePartnerService({
        query: {
          partnerId: selectPartner.id,
        },
        body: {
          managerId: updatePartnerData?.managerId,
          affiliateId: updatePartnerData?.partnerId,
          name: updatePartnerData?.partnerName,

          refill_oxyclick_points:
            updatePartnerData.refill_oxyclick_points * 100,

          smartLink: updatePartnerData.smartLink,
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
    } finally {
      setTopup(0);
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
            value={updatePartnerData?.managerId ?? ""}
          >
            {accounts.data?.accounts.map((account) => {
              return (
                <MenuItem
                  onClick={(e) => {
                    setUpdatePartnerData((prev) => {
                      return {
                        ...prev,
                        managerId: e.currentTarget.dataset.value as string,
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

        <TextField className="flex flex-col gap-1" isRequired>
          <Label>Daily Refill Credit</Label>
          <InputNumber
            currency="USD"
            locale="en-US"
            mode="currency"
            className=" h-14 rounded-sm border border-gray-400 bg-white outline-none transition
         duration-75 hover:border-black focus:drop-shadow-md"
            type="text"
            value={updatePartnerData?.refill_oxyclick_points ?? 0}
            onChange={(e) => {
              setUpdatePartnerData((prev) => {
                return {
                  ...prev,
                  refill_oxyclick_points: Number(e.value),
                };
              });
            }}
          />
          <FieldError className="text-xs text-red-600" />
        </TextField>
        <TextField className="flex flex-col gap-1">
          <Label>Smart Link</Label>
          <Input
            className="h-14 w-full rounded-sm border border-gray-400 bg-white p-2 outline-none transition
         duration-75 hover:border-black focus:drop-shadow-md"
            type="text"
            value={updatePartnerData?.smartLink ?? ""}
            name="smartLink"
            onChange={handleChangeupdatePartnerData}
            maxLength={255}
          />
          <FieldError className="text-xs text-red-600" />
        </TextField>
        <TextField className="relative flex flex-col gap-1">
          <Label>Topup</Label>
          <InputNumber
            currency="USD"
            locale="en-US"
            mode="currency"
            className=" h-14 rounded-sm border border-gray-400 bg-white  outline-none transition
         duration-75 hover:border-black focus:drop-shadow-md"
            type="text"
            value={topup}
            onChange={(e) => {
              setTopup(() => e.value ?? 0);
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
