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
        className="relative z-10 flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 text-zinc-100 shadow-2xl"
        onSubmit={handleSubmit}
      >
        <header className="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Edit account</h2>
            <p className="text-xs text-zinc-500">Update profile and role</p>
          </div>
          <button
            type="button"
            onClick={() => {
              document.body.style.overflow = "auto";
              setTriggerEditAccount(() => false);
            }}
            className="rounded-lg px-2 py-1 text-zinc-400 hover:bg-white/5 hover:text-white"
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
                    bgcolor: "#18181b",
                    color: "#f4f4f5",
                    border: "1px solid rgba(255,255,255,0.1)",
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
        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-white/10 px-6 py-4">
          <button
            type="button"
            onClick={() => {
              document.body.style.overflow = "auto";
              setTriggerEditAccount(() => false);
            }}
            className="rounded-full px-4 py-2 text-sm font-medium text-zinc-400 transition hover:bg-white/5 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black transition hover:bg-main-color hover:text-white"
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
        className="fixed inset-0 -z-10 bg-black/70"
      ></footer>
    </div>
  );
}


export default EditAccount;
