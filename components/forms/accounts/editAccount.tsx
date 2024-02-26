import React, { useState } from "react";
import { User } from "../../../models";
import { UseQueryResult } from "@tanstack/react-query";
import {
  EditAccountService,
  ResponseGetAllAccountByPageService,
} from "../../../services/admin/account";
import Swal from "sweetalert2";
import { MenuItem, TextField } from "@mui/material";
import { accountListsRole } from "../../../data/accoutListsRoles";
interface EditAccount {
  setTriggerEditAccount: React.Dispatch<React.SetStateAction<boolean>>;
  selectAccount: User;
  accounts: UseQueryResult<ResponseGetAllAccountByPageService, Error>;
}
interface EditFormDataAccount {
  email: string;
  name: string;
  role: "admin" | "editor";
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
        role: "editor",
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
    <div className="fixed bottom-0 left-0 right-0 top-0 z-50 m-auto flex h-screen w-screen items-center justify-center">
      <form
        className="flex h-max w-96 flex-col items-center justify-start gap-4 rounded-xl bg-white p-7"
        onSubmit={handleSubmit}
      >
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
        >
          {accountListsRole.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        <button type="submit" className="buttonSuccess w-40 font-bold">
          Enter
        </button>
      </form>
      <footer
        onClick={() => {
          document.body.style.overflow = "auto";
          setTriggerEditAccount(() => false);
        }}
        className="fixed bottom-0 left-0 right-0 top-0 -z-10 m-auto h-screen w-screen bg-black/30"
      ></footer>
    </div>
  );
}

export default EditAccount;
