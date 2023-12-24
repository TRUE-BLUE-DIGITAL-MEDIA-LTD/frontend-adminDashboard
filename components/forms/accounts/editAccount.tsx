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
      Swal.fire(
        "error!",
        err?.props?.response?.data?.message?.toString(),
        "error"
      );
    }
  };
  return (
    <div className="w-screen h-screen fixed z-50 top-0 bottom-0 right-0 left-0 m-auto flex items-center justify-center">
      <form
        className="w-96 h-max p-7 bg-white rounded-xl flex flex-col justify-start items-center gap-4"
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
        className="w-screen h-screen fixed right-0 left-0 top-0 bottom-0 m-auto -z-10 bg-black/30"
      ></footer>
    </div>
  );
}

export default EditAccount;
