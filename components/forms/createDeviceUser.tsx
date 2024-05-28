import React, { useState } from "react";
import {
  Button,
  FieldError,
  Form,
  Input,
  Label,
  TextField,
} from "react-aria-components";
import Swal from "sweetalert2";
import { ErrorMessages } from "../../models";
import {
  CreateDeviceUserService,
  ResponseGetDeviceUsersService,
} from "../../services/simCard/deviceUser";
import { UseQueryResult } from "@tanstack/react-query";
import { ResponseGetSimCardByPageService } from "../../services/simCard/simCard";

type CreateDeviceUserProps = {
  setTrigger: (value: boolean) => void;
  simCards: UseQueryResult<ResponseGetSimCardByPageService, Error>;
  deviceUser: UseQueryResult<ResponseGetDeviceUsersService, Error>;
};
function CreateDeviceUser({
  setTrigger,
  simCards,
  deviceUser,
}: CreateDeviceUserProps) {
  const [portNumber, setPortNumber] = useState<string>();

  const handleCreateDeviceUser = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    try {
      e.preventDefault();
      if (!portNumber) throw new Error("Port Number is required");
      Swal.fire({
        title: "Creating Device User",
        text: "Please wait...",
        showConfirmButton: false,
        allowOutsideClick: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });
      await CreateDeviceUserService({ portNumber: portNumber });
      await deviceUser.refetch();
      await simCards.refetch();
      Swal.fire({
        title: "Device User Created",
        text: "Device User has been created successfully",
        icon: "success",
      });
    } catch (error) {
      let result = error as ErrorMessages;
      Swal.fire({
        title: result.error,
        text: result.message.toString(),
        footer: "Error Code :" + result.statusCode?.toString(),
        icon: "error",
      });
    }
  };
  return (
    <div
      className="fixed bottom-0 left-0 right-0 top-0 z-50 m-auto flex h-screen w-screen items-center justify-center 
    font-Poppins"
    >
      <Form
        onSubmit={handleCreateDeviceUser}
        className="flex h-max w-96 flex-col gap-5 rounded-lg border 
         border-gray-100 bg-gradient-to-r from-gray-50  to-gray-200 
        p-5 drop-shadow-xl"
      >
        <Label className="text-center text-2xl font-bold">
          Create Device User
        </Label>
        <TextField>
          <Label>Port Number</Label>
          <Input
            onWheelCapture={(e) => {
              e.currentTarget.blur();
            }}
            value={portNumber}
            onChange={(e) => setPortNumber(e.target.value)}
            required
            type="number"
            placeholder="Port Number"
            inputMode="numeric"
            className="h-10 w-full rounded-md border border-gray-300 p-5"
          />
          <FieldError className="text-xs text-red-700" />
        </TextField>
        <Button
          type="submit"
          className="rounded-md bg-green-300 p-2 text-green-600
         transition hover:bg-green-400 active:scale-105"
        >
          Create
        </Button>
      </Form>
      <footer
        onClick={() => setTrigger(false)}
        className="fixed bottom-0 left-0 right-0 top-0 -z-10 m-auto h-screen w-screen
        bg-white/30 backdrop-blur-md "
      ></footer>
    </div>
  );
}

export default CreateDeviceUser;
