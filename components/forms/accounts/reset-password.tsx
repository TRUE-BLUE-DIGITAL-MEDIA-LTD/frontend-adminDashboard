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
        <button type="submit" className="buttonSuccess w-40 font-bold">
          Enter
        </button>
      </form>
      <footer
        onClick={() => {
          document.body.style.overflow = "auto";
          setTriggerResetPassword(false);
        }}
        className="w-screen h-screen fixed right-0 left-0 top-0 bottom-0 m-auto -z-10 bg-black/30"
      ></footer>
    </div>
  );
}

export default ResetPassword;
