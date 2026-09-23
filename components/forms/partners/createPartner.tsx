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


const darkFieldSx = {
  "& .MuiInputLabel-root": { color: "#a1a1aa" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#00ABE4" },
  "& .MuiOutlinedInput-root": {
    color: "#ffffff",
    backgroundColor: "rgba(0,0,0,0.4)",
    "& fieldset": { borderColor: "rgba(255,255,255,0.12)" },
    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.25)" },
    "&.Mui-focused fieldset": { borderColor: "#00ABE4" },
  },
  "& .MuiFormHelperText-root": { color: "#a1a1aa" },
  "& .MuiSvgIcon-root": { color: "#a1a1aa" },
};

type CreatePartnerProps = {
  accounts: UseQueryResult<ResponseGetAllAccountByPageService, Error>;
  setTriggerCreateParter: React.Dispatch<React.SetStateAction<boolean>>;
  partners: UseQueryResult<
    Pagination<
      Partner & {
        manager: User;
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
    managerId?: string;
    affiliateId?: string;
    partnerName?: string;
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
        !createPartnerData?.managerId ||
        !createPartnerData?.partnerName ||
        !createPartnerData?.affiliateId
      ) {
        throw new Error("Please fill all the fields");
      }
      const createPartner = await CreatePartnerService({
        affiliateId: createPartnerData?.affiliateId,
        managerId: createPartnerData.managerId,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-Poppins">
      <Form
        onSubmit={handleSummitCreatePartner}
        className="relative z-10 flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 text-zinc-100 shadow-2xl"
      >
        <header className="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Create partner</h2>
            <p className="text-xs text-zinc-500">Link an affiliate to a manager</p>
          </div>
          <button
            type="button"
            onClick={() => {
              document.body.style.overflow = "auto";
              setTriggerCreateParter(() => false);
            }}
            className="rounded-lg px-2 py-1 text-zinc-400 hover:bg-white/5 hover:text-white"
            aria-label="Close"
          >
            ✕
          </button>
        </header>
        <div className="flex flex-col gap-4 overflow-y-auto px-6 py-5">
          <TextField className="flex flex-col gap-1.5" isRequired>
            <Label className="text-xs font-medium text-zinc-400">Affiliate ID</Label>
            <Input
              className="h-11 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-main-color focus:ring-1 focus:ring-main-color/40"
              type="text"
              name="affiliateId"
              onChange={handleChangeCreatePartnerData}
              maxLength={255}
            />
            <FieldError className="text-xs text-red-600" />
          </TextField>
          <TextField className="flex flex-col gap-1.5" isRequired>
            <Label className="text-xs font-medium text-zinc-400">Partner name</Label>
            <Input
              className="h-11 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-main-color focus:ring-1 focus:ring-main-color/40"
              type="text"
              name="partnerName"
              onChange={handleChangeCreatePartnerData}
              maxLength={255}
            />
            <FieldError className="text-xs text-red-600" />
          </TextField>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium text-zinc-400">Partner manager</Label>
            <TextFieldMUI
              required
              select
              className="w-full"
              value={createPartnerData?.managerId ?? ""}
              helperText="Select the partner manager"
              sx={darkFieldSx}
              SelectProps={{
                MenuProps: {
                  PaperProps: {
                    sx: {
                      bgcolor: "#18181b",
                      color: "#f4f4f5",
                      border: "1px solid rgba(255,255,255,0.1)",
                    },
                  },
                },
              }}
            >
              {accounts.data?.accounts.map((account) => {
                return (
                  <MenuItem
                    onClick={(e) => {
                      setCreatePartnerData((prev) => {
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
        </div>
        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-white/10 px-6 py-4">
          <Button
            type="button"
            onPress={() => {
              document.body.style.overflow = "auto";
              setTriggerCreateParter(() => false);
            }}
            className="rounded-full px-4 py-2 text-sm font-medium text-zinc-400 transition hover:bg-white/5 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black transition hover:bg-main-color hover:text-white"
          >
            Create
          </Button>
        </div>
      </Form>
      <footer
        onClick={() => {
          document.body.style.overflow = "auto";
          setTriggerCreateParter(() => false);
        }}
        className="fixed inset-0 -z-10 bg-black/70"
      ></footer>
    </div>
  );
}


export default CreatePartner;
