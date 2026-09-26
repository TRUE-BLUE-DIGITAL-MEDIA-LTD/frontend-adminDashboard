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
  "& .MuiInputLabel-root": { color: "rgb(var(--fg-muted))" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#00ABE4" },
  "& .MuiOutlinedInput-root": {
    color: "rgb(var(--fg))",
    backgroundColor: "rgb(var(--surface) / 0.4)",
    "& fieldset": { borderColor: "var(--line)" },
    "&:hover fieldset": { borderColor: "var(--line-strong)" },
    "&.Mui-focused fieldset": { borderColor: "#00ABE4" },
  },
  "& .MuiFormHelperText-root": { color: "rgb(var(--fg-muted))" },
  "& .MuiSvgIcon-root": { color: "rgb(var(--fg-muted))" },
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
        className="relative z-10 flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-line bg-panel text-fg shadow-2xl"
      >
        <header className="flex shrink-0 items-center justify-between border-b border-line px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-fg">Create partner</h2>
            <p className="text-xs text-fg-subtle">Link an affiliate to a manager</p>
          </div>
          <button
            type="button"
            onClick={() => {
              document.body.style.overflow = "auto";
              setTriggerCreateParter(() => false);
            }}
            className="rounded-lg px-2 py-1 text-fg-muted hover:bg-hover hover:text-fg"
            aria-label="Close"
          >
            ✕
          </button>
        </header>
        <div className="flex flex-col gap-4 overflow-y-auto px-6 py-5">
          <TextField className="flex flex-col gap-1.5" isRequired>
            <Label className="text-xs font-medium text-fg-muted">Affiliate ID</Label>
            <Input
              className="h-11 w-full rounded-lg border border-line bg-surface/40 px-3 py-2 text-sm text-fg placeholder:text-fg-subtle outline-none focus:border-main-color focus:ring-1 focus:ring-main-color/40"
              type="text"
              name="affiliateId"
              onChange={handleChangeCreatePartnerData}
              maxLength={255}
            />
            <FieldError className="text-xs text-red-600" />
          </TextField>
          <TextField className="flex flex-col gap-1.5" isRequired>
            <Label className="text-xs font-medium text-fg-muted">Partner name</Label>
            <Input
              className="h-11 w-full rounded-lg border border-line bg-surface/40 px-3 py-2 text-sm text-fg placeholder:text-fg-subtle outline-none focus:border-main-color focus:ring-1 focus:ring-main-color/40"
              type="text"
              name="partnerName"
              onChange={handleChangeCreatePartnerData}
              maxLength={255}
            />
            <FieldError className="text-xs text-red-600" />
          </TextField>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium text-fg-muted">Partner manager</Label>
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
                      bgcolor: "rgb(var(--panel))",
                      color: "rgb(var(--fg))",
                      border: "1px solid var(--line)",
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
        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-line px-6 py-4">
          <Button
            type="button"
            onPress={() => {
              document.body.style.overflow = "auto";
              setTriggerCreateParter(() => false);
            }}
            className="rounded-full px-4 py-2 text-sm font-medium text-fg-muted transition hover:bg-hover hover:text-fg"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="rounded-full bg-fg px-5 py-2 text-sm font-semibold text-surface transition hover:bg-main-color hover:text-white"
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
        className="fixed inset-0 -z-10 bg-scrim"
      ></footer>
    </div>
  );
}


export default CreatePartner;
