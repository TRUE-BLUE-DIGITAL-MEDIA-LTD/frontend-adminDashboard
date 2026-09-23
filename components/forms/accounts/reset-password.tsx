import React, { useState } from "react";
import { User } from "../../../models";
import Swal from "sweetalert2";
import { ResetPasswordAccountService } from "../../../services/admin/account";
import { Button, TextField } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

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

interface ResetPassword {
  setTriggerResetPassword: React.Dispatch<React.SetStateAction<boolean>>;
  selectAccount: User;
}
function ResetPassword({
  setTriggerResetPassword,
  selectAccount,
}: ResetPassword) {
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ password?: string | null }>({});
  const [formData, setFormData] = useState({
    password: "",
  });
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
      await ResetPasswordAccountService({
        newPassword: formData.password,
        userId: selectAccount.id,
      });

      Swal.fire("success", "Successfully Reset Password", "success");
      // Reset form and close modal
      setFormData({
        password: "",
      });
      setErrors({});
      document.body.style.overflow = "auto";
      setTriggerResetPassword(false);
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
            <h2 className="text-lg font-semibold text-white">Reset password</h2>
            <p className="text-xs text-zinc-500">
              Set a new password for this account
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              document.body.style.overflow = "auto";
              setTriggerResetPassword(false);
            }}
            className="rounded-lg px-2 py-1 text-zinc-400 hover:bg-white/5 hover:text-white"
            aria-label="Close"
          >
            ✕
          </button>
        </header>
        <div className="flex flex-col gap-4 overflow-y-auto px-6 py-5">
          <TextField
            type={showPassword ? "text" : "password"}
            placeholder="Type new password"
            name="password"
            label="New password"
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
        </div>
        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-white/10 px-6 py-4">
          <button
            type="button"
            onClick={() => {
              document.body.style.overflow = "auto";
              setTriggerResetPassword(false);
            }}
            className="rounded-full px-4 py-2 text-sm font-medium text-zinc-400 transition hover:bg-white/5 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black transition hover:bg-main-color hover:text-white"
          >
            Reset
          </button>
        </div>
      </form>
      <footer
        onClick={() => {
          document.body.style.overflow = "auto";
          setTriggerResetPassword(false);
        }}
        className="fixed inset-0 -z-10 bg-black/70"
      ></footer>
    </div>
  );
}


export default ResetPassword;
