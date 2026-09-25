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

          smartLink: !updatePartnerData.smartLink
            ? null
            : updatePartnerData.smartLink,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-Poppins">
      <Form
        onSubmit={handleSummitUpdatePartner}
        className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-line bg-panel text-fg shadow-2xl"
      >
        <header className="flex shrink-0 items-center justify-between border-b border-line px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-fg">Update partner</h2>
            <p className="text-xs text-fg-subtle">
              Edit profile, refill, and top-up
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              document.body.style.overflow = "auto";
              setTriggerUpdatePartner(() => false);
            }}
            className="rounded-lg px-2 py-1 text-fg-muted hover:bg-hover hover:text-fg"
            aria-label="Close"
          >
            ✕
          </button>
        </header>
        <div className="grid grid-cols-1 gap-4 overflow-y-auto px-6 py-5 md:grid-cols-2">
          <TextField className="flex flex-col gap-1.5" isRequired>
            <Label className="text-xs font-medium text-fg-muted">
              Partner ID
            </Label>
            <Input
              value={updatePartnerData?.partnerId ?? ""}
              className="h-11 w-full rounded-lg border border-line bg-surface/40 px-3 py-2 text-sm text-fg outline-none focus:border-main-color focus:ring-1 focus:ring-main-color/40"
              type="text"
              name="partnerId"
              onChange={handleChangeupdatePartnerData}
              maxLength={255}
            />
            <FieldError className="text-xs text-red-600" />
          </TextField>
          <TextField className="flex flex-col gap-1.5" isRequired>
            <Label className="text-xs font-medium text-fg-muted">
              Partner name
            </Label>
            <Input
              className="h-11 w-full rounded-lg border border-line bg-surface/40 px-3 py-2 text-sm text-fg outline-none focus:border-main-color focus:ring-1 focus:ring-main-color/40"
              type="text"
              value={updatePartnerData?.partnerName ?? ""}
              name="partnerName"
              onChange={handleChangeupdatePartnerData}
              maxLength={255}
            />
            <FieldError className="text-xs text-red-600" />
          </TextField>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium text-fg-muted">
              Partner manager
            </Label>
            <TextFieldMUI
              required
              select
              className="w-full"
              value={updatePartnerData?.managerId ?? ""}
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

          <TextField className="flex flex-col gap-1.5" isRequired>
            <Label className="text-xs font-medium text-fg-muted">
              Daily refill credit
            </Label>
            <InputNumber
              currency="USD"
              locale="en-US"
              mode="currency"
              className="h-11 rounded-lg border border-line bg-surface/40 text-fg outline-none focus:border-main-color"
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
          <TextField className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium text-fg-muted">
              Smart link
            </Label>
            <Input
              className="h-11 w-full rounded-lg border border-line bg-surface/40 px-3 py-2 text-sm text-fg outline-none focus:border-main-color focus:ring-1 focus:ring-main-color/40"
              type="text"
              value={updatePartnerData?.smartLink ?? ""}
              name="smartLink"
              onChange={handleChangeupdatePartnerData}
              maxLength={255}
            />
            <FieldError className="text-xs text-red-600" />
          </TextField>
          <TextField className="relative flex flex-col gap-1.5">
            <Label className="text-xs font-medium text-fg-muted">Topup</Label>
            <InputNumber
              currency="USD"
              locale="en-US"
              mode="currency"
              className="h-11 rounded-lg border border-line bg-surface/40 text-fg outline-none focus:border-main-color"
              type="text"
              value={topup}
              onChange={(e) => {
                setTopup(() => e.value ?? 0);
              }}
            />
            <FieldError className="text-xs text-red-600" />
          </TextField>
        </div>
        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-line px-6 py-4">
          <Button
            type="button"
            onPress={() => {
              document.body.style.overflow = "auto";
              setTriggerUpdatePartner(() => false);
            }}
            className="rounded-full px-4 py-2 text-sm font-medium text-fg-muted transition hover:bg-hover hover:text-fg"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="rounded-full bg-fg px-5 py-2 text-sm font-semibold text-surface transition hover:bg-main-color hover:text-white"
          >
            Update
          </Button>
        </div>
      </Form>
      <footer
        onClick={() => {
          document.body.style.overflow = "auto";
          setTriggerUpdatePartner(() => false);
        }}
        className="fixed inset-0 -z-10 bg-scrim"
      ></footer>
    </div>
  );
}

export default UpdatePartner;
