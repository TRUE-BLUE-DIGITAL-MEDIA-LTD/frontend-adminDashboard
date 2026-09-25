import React, { useState } from "react";
import { User } from "../../../models";
import Swal from "sweetalert2";
import { ResetPasswordAccountService } from "../../../services/admin/account";
import { Button, TextField } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

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
        className="relative z-10 flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-line bg-panel text-fg shadow-2xl"
        onSubmit={handleSubmit}
      >
        <header className="flex shrink-0 items-center justify-between border-b border-line px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-fg">Reset password</h2>
            <p className="text-xs text-fg-subtle">
              Set a new password for this account
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              document.body.style.overflow = "auto";
              setTriggerResetPassword(false);
            }}
            className="rounded-lg px-2 py-1 text-fg-muted hover:bg-hover hover:text-fg"
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
                <Button onClick={() => setShowPassword(() => false)} sx={{ color: "rgb(var(--fg-muted))", minWidth: 0 }}>
                  <Visibility />
                </Button>
              ) : (
                <Button onClick={() => setShowPassword(() => true)} sx={{ color: "rgb(var(--fg-muted))", minWidth: 0 }}>
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
        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-line px-6 py-4">
          <button
            type="button"
            onClick={() => {
              document.body.style.overflow = "auto";
              setTriggerResetPassword(false);
            }}
            className="rounded-full px-4 py-2 text-sm font-medium text-fg-muted transition hover:bg-hover hover:text-fg"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-full bg-fg px-5 py-2 text-sm font-semibold text-surface transition hover:bg-main-color hover:text-white"
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
        className="fixed inset-0 -z-10 bg-scrim"
      ></footer>
    </div>
  );
}


export default ResetPassword;
