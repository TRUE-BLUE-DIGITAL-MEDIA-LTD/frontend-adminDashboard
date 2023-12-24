import { UseQueryResult } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  CreateAccountService,
  ResponseGetAllAccountByPageService,
} from "../../../services/admin/account";
import Swal from "sweetalert2";
import { Button, MenuItem, TextField } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { accountListsRole } from "../../../data/accoutListsRoles";
interface CreateAccount {
  setTriggerCreateAccount: React.Dispatch<React.SetStateAction<boolean>>;
  accounts: UseQueryResult<ResponseGetAllAccountByPageService, Error>;
}

interface FormDataCreateUser {
  email: string;
  name: string;
  password: string;
  role: "admin" | "editor";
}
interface ErrorFormData {
  email?: string;
  name?: string;
  password?: string;
  role?: string;
}
function CreateAccount({ setTriggerCreateAccount, accounts }: CreateAccount) {
  const [formData, setFormData] = useState<FormDataCreateUser>({
    email: "",
    name: "",
    password: "",
    role: "editor",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<ErrorFormData>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Basic validation
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const newErrors: ErrorFormData = {};
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      }
      if (!formData.name.trim()) {
        newErrors.name = "Name is required";
      }
      if (!formData.password.trim()) {
        newErrors.password = "Password is required";
      }
      if (!formData.role) {
        newErrors.role = "Role is required";
      }
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
      } else {
        Swal.fire({
          title: "Creating An Acount",
          html: "Loading....",
          allowEscapeKey: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
        await CreateAccountService({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          role: formData.role,
        });
        await accounts.refetch();
        Swal.fire("success", "Successfully Create Account", "success");
        // Reset form and close modal
        setFormData({
          email: "",
          name: "",
          password: "",
          role: "editor",
        });

        setErrors({});
        document.body.style.overflow = "auto";
        setTriggerCreateAccount(false);
      }
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
    <div className="z-50 w-screen h-screen fixed top-0 bottom-0 right-0 left-0 m-auto flex items-center justify-center">
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
          type={showPassword ? "text" : "password"}
          placeholder="Type initial password"
          name="password"
          label="Password"
          InputProps={{
            endAdornment: showPassword ? (
              <Button onClick={() => setShowPassword(() => false)}>
                <Visibility />
              </Button>
            ) : (
              <Button onClick={() => setShowPassword(() => true)}>
                <VisibilityOff />
              </Button>
            ),
          }}
          fullWidth
          value={formData.password}
          onChange={handleChange}
          error={Boolean(errors.password)}
          helperText={errors.password}
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
        <button className="buttonSuccess w-40 font-bold">Enter</button>
      </form>
      <footer
        onClick={() => {
          document.body.style.overflow = "auto";
          setTriggerCreateAccount(false);
        }}
        className="w-screen h-screen fixed right-0 left-0 top-0 bottom-0 m-auto -z-10 bg-black/30"
      ></footer>
    </div>
  );
}

export default CreateAccount;
