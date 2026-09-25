import React, { useState } from "react";
import { Role, User } from "../../../models";
import { UseQueryResult } from "@tanstack/react-query";
import {
  EditAccountService,
  ResponseGetAllAccountByPageService,
} from "../../../services/admin/account";
import Swal from "sweetalert2";
import { MenuItem, TextField } from "@mui/material";
import { accountListsRole } from "../../../data/accoutListsRoles";

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

interface EditAccount {
  setTriggerEditAccount: React.Dispatch<React.SetStateAction<boolean>>;
  selectAccount: User;
  accounts: UseQueryResult<ResponseGetAllAccountByPageService, Error>;
}
interface EditFormDataAccount {
  email: string;
  name: string;
  role: Role;
}
interface ErrorFormData {
  email?: string;
  name?: string;
  role?: string;
}
function EditAccount({
  setTriggerEditAccount,
  selectAccount,
  accounts,
}: EditAccount) {
  const [formData, setFormData] = useState<EditFormDataAccount>({
    email: selectAccount.email,
    name: selectAccount.name,
    role: selectAccount.role,
  });

  const [errors, setErrors] = useState<ErrorFormData>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Basic validation
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      Swal.fire({
        title: "Update An Acount",
        html: "Loading....",
        allowEscapeKey: false,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      await EditAccountService({
        email: formData.email,
        name: formData.name,
        role: formData.role,
        userId: selectAccount.id,
      });
      await accounts.refetch();
      Swal.fire("success", "Successfully Update Account", "success");
      // Reset form and close modal
      setFormData({
        email: "",
        name: "",
        role: "manager",
      });

      setErrors({});
      document.body.style.overflow = "auto";
      setTriggerEditAccount(false);
    } catch (err: any) {
      console.log(err);
      Swal.fire("error!", err.message?.toString(), "error");
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <form
        className="relative z-10 flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-line bg-panel text-fg shadow-2xl"
        onSubmit={handleSubmit}
      >
        <header className="flex shrink-0 items-center justify-between border-b border-line px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-fg">Edit account</h2>
            <p className="text-xs text-fg-subtle">Update profile and role</p>
          </div>
          <button
            type="button"
            onClick={() => {
              document.body.style.overflow = "auto";
              setTriggerEditAccount(() => false);
            }}
            className="rounded-lg px-2 py-1 text-fg-muted hover:bg-hover hover:text-fg"
            aria-label="Close"
          >
            ✕
          </button>
        </header>
        <div className="flex flex-col gap-4 overflow-y-auto px-6 py-5">
          <TextField
            name="email"
            type="email"
            placeholder="example@oxyclick.com"
            label="Email"
            fullWidth
            value={formData.email}
            onChange={handleChange}
            error={Boolean(errors.email)}
            helperText={errors.email}
            sx={darkFieldSx}
          />
          <TextField
            type="text"
            placeholder="Mr.Example"
            name="name"
            label="Name"
            fullWidth
            value={formData.name}
            onChange={handleChange}
            error={Boolean(errors.name)}
            helperText={errors.name}
            sx={darkFieldSx}
          />
          <TextField
            select
            label="Role"
            fullWidth
            name="role"
            value={formData.role}
            onChange={handleChange}
            error={Boolean(errors.role)}
            helperText={errors.role}
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
            {accountListsRole.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </div>
        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-line px-6 py-4">
          <button
            type="button"
            onClick={() => {
              document.body.style.overflow = "auto";
              setTriggerEditAccount(() => false);
            }}
            className="rounded-full px-4 py-2 text-sm font-medium text-fg-muted transition hover:bg-hover hover:text-fg"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-full bg-fg px-5 py-2 text-sm font-semibold text-surface transition hover:bg-main-color hover:text-white"
          >
            Save
          </button>
        </div>
      </form>
      <footer
        onClick={() => {
          document.body.style.overflow = "auto";
          setTriggerEditAccount(() => false);
        }}
        className="fixed inset-0 -z-10 bg-scrim"
      ></footer>
    </div>
  );
}


export default EditAccount;
