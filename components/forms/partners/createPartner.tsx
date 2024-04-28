import { MenuItem } from "@mui/material";
import { TextField as TextFieldMUI } from "@mui/material";
import { UseQueryResult } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  Button,
  FieldError,
  Form,
  Input,
  Label,
  TextField,
} from "react-aria-components";
import { ResponseGetAllAccountByPageService } from "../../../services/admin/account";
import Swal from "sweetalert2";
import { ErrorMessages, Pagination, Partner, User } from "../../../models";
import { CreatePartnerService } from "../../../services/admin/partner";

type CreatePartnerProps = {
  accounts: UseQueryResult<ResponseGetAllAccountByPageService, Error>;
  setTriggerCreateParter: React.Dispatch<React.SetStateAction<boolean>>;
  partners: UseQueryResult<
    Pagination<
      Partner & {
        user: User;
      }
    >,
    Error
  >;
};
function CreatePartner({
  accounts,
  setTriggerCreateParter,
  partners,
}: CreatePartnerProps) {
  const [createPartnerData, setCreatePartnerData] = useState<{
    partnerId?: string;
    partnerName?: string;
    userId?: string;
  }>();

  const handleChangeCreatePartnerData = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setCreatePartnerData((prev) => {
      return {
        ...prev,
        [e.target.name]: e.target.value,
      };
    });
  };

  const handleSummitCreatePartner = async (e: React.FormEvent) => {
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
        !createPartnerData?.userId ||
        !createPartnerData?.partnerId ||
        !createPartnerData?.partnerName
      ) {
        throw new Error("Please fill all the fields");
      }
      const createPartner = await CreatePartnerService({
        userId: createPartnerData?.userId,
        affiliateId: createPartnerData?.partnerId,
        name: createPartnerData?.partnerName,
      });
      await partners.refetch();

      Swal.fire({
        title: "Success",
        text: "Partner created successfully",
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
      <Form
        onSubmit={handleSummitCreatePartner}
        className="flex h-max w-96 flex-col items-center justify-start gap-2 rounded-xl bg-white p-7"
      >
        <TextField className="flex flex-col gap-1" isRequired>
          <Label>Partner ID</Label>
          <Input
            className="h-14 w-80 rounded-sm border border-gray-400 bg-white p-2 outline-none transition
            duration-75 hover:border-black focus:drop-shadow-md"
            type="text"
            name="partnerId"
            onChange={handleChangeCreatePartnerData}
            maxLength={255}
          />
          <FieldError className="text-xs text-red-600" />
        </TextField>
        <TextField className="flex flex-col gap-1" isRequired>
          <Label>Partner Name</Label>
          <Input
            className="h-14 w-80 rounded-sm border border-gray-400 bg-white p-2 outline-none transition
             duration-75 hover:border-black focus:drop-shadow-md"
            type="text"
            name="partnerName"
            onChange={handleChangeCreatePartnerData}
            maxLength={255}
          />
          <FieldError className="text-xs text-red-600" />
        </TextField>
        <div className="flex flex-col">
          <Label>Partner Manager</Label>
          <TextFieldMUI
            required
            select
            className="h-14 w-80"
            value={createPartnerData?.userId ?? ""}
            helperText="Please select your partner manager here"
          >
            {accounts.data?.accounts.map((account) => {
              return (
                <MenuItem
                  onClick={(e) => {
                    setCreatePartnerData((prev) => {
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

        <Button type="submit" className="buttonSuccess mt-10 w-40 font-bold">
          Create
        </Button>
      </Form>
      <footer
        onClick={() => {
          document.body.style.overflow = "auto";
          setTriggerCreateParter(() => false);
        }}
        className="fixed bottom-0 left-0 right-0 top-0 -z-10 h-screen w-screen bg-black/50 "
      ></footer>
    </div>
  );
}

export default CreatePartner;
