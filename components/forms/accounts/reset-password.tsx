import React, { useState } from "react";
import { User } from "../../../models";
import Swal from "sweetalert2";
import { ResetPasswordAccountService } from "../../../services/admin/account";
import { Button, TextField } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
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
    <div className="fixed bottom-0 left-0 right-0 top-0 z-50 m-auto flex h-screen w-screen items-center justify-center">
      <form
        className="flex h-max w-96 flex-col items-center justify-start gap-4 rounded-xl bg-white p-7"
        onSubmit={handleSubmit}
      >
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
        <button type="submit" className="main-button w-40 font-bold">
          Enter
        </button>
      </form>
      <footer
        onClick={() => {
          document.body.style.overflow = "auto";
          setTriggerResetPassword(false);
        }}
        className="fixed bottom-0 left-0 right-0 top-0 -z-10 m-auto h-screen w-screen bg-black/30"
      ></footer>
    </div>
  );
}

export default ResetPassword;
