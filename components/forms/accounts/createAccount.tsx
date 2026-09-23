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
import { Role } from "../../../models";

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

interface CreateAccount {
  setTriggerCreateAccount: React.Dispatch<React.SetStateAction<boolean>>;
  accounts: UseQueryResult<ResponseGetAllAccountByPageService, Error>;
}

interface FormDataCreateUser {
  email: string;
  name: string;
  password: string;
  role: Role;
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
    role: "manager",
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
          role: "manager",
        });

        setErrors({});
        document.body.style.overflow = "auto";
        setTriggerCreateAccount(false);
      }
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
            <h2 className="text-lg font-semibold text-white">Create account</h2>
            <p className="text-xs text-zinc-500">Add a new Control Center user</p>
          </div>
          <button
            type="button"
            onClick={() => {
              document.body.style.overflow = "auto";
              setTriggerCreateAccount(false);
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
            type={showPassword ? "text" : "password"}
            placeholder="Type initial password"
            name="password"
            label="Password"
            InputProps={{
              endAdornment: showPassword ? (
                <Button onClick={() => setShowPassword(() => false)} sx={{ color: "#a1a1aa", minWidth: 0 }}>
                  <Visibility />
                </Button>
              ) : (
                <Button onClick={() => setShowPassword(() => true)} sx={{ color: "#a1a1aa", minWidth: 0 }}>
                  <VisibilityOff />
                </Button>
              ),
            }}
            fullWidth
            value={formData.password}
            onChange={handleChange}
            error={Boolean(errors.password)}
            helperText={errors.password}
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
              setTriggerCreateAccount(false);
            }}
            className="rounded-full px-4 py-2 text-sm font-medium text-zinc-400 transition hover:bg-white/5 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black transition hover:bg-main-color hover:text-white"
          >
            Create
          </button>
        </div>
      </form>
      <footer
        onClick={() => {
          document.body.style.overflow = "auto";
          setTriggerCreateAccount(false);
        }}
        className="fixed inset-0 -z-10 bg-black/70"
      ></footer>
    </div>
  );
}


export default CreateAccount;
