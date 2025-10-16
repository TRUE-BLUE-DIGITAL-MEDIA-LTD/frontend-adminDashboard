import { UseQueryResult } from "@tanstack/react-query";
import moment from "moment";
import Image from "next/image";
import { FormEvent, useState } from "react";
import Swal from "sweetalert2";
import { countries } from "../../data/country";
import { services } from "../../data/services";
import { ErrorMessages, SmsPva, User } from "../../models";
import { useGetByPageSmsPva } from "../../react-query";
import { Box, Button, Pagination, TextField } from "@mui/material";

type Props = {
  user: User;
};
function SmsPvaHistory({ user }: Props) {
  const [page, setPage] = useState(1);
  const history = useGetByPageSmsPva({
    page: page,
    limit: 20,
  });
  const [jumpToPageInput, setJumpToPageInput] = useState("");
  const totalPage = history.data?.totalPage ?? 1;
  // ✅ 2. Create the handler function for form submission
  const handleJumpToPage = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevents the browser from reloading the page
    const targetPage = parseInt(jumpToPageInput, 10);

    // Validate the input
    if (!isNaN(targetPage) && targetPage >= 1 && targetPage <= totalPage) {
      setPage(targetPage); // Set the new page
      setJumpToPageInput(""); // Clear the input field
    }
  };

  return (
    <>
      <header className="flex flex-col items-center">
        <h1 className="text-xl font-semibold text-black">All Verifications</h1>
        <h1 className="text-lg font-semibold text-gray-400">
          A history of all verifications.
        </h1>
      </header>
      <div className="mt-1 overflow-auto lg:w-10/12 xl:w-10/12 2xl:w-7/12">
        <table className="w-max min-w-full border">
          <thead>
            <tr className="bg-gray-300">
              <th>Date</th>
              <th>Phone Number</th>
              <th>Country</th>
              <th>SMS</th>
              <th>Service</th>
            </tr>
          </thead>
          <tbody>
            {history.data?.data.map((sms) => {
              return <ItemHistory key={sms.id} sms={sms} />;
            })}
          </tbody>
        </table>
        <div className="mt-5 flex w-full justify-center">
          <Box className="mt-5 flex w-full flex-col items-center justify-center gap-4 md:flex-row">
            <Pagination
              onChange={(e, newPage) => setPage(newPage)}
              page={page}
              count={totalPage}
              color="primary"
              showFirstButton
              showLastButton
            />
            <Box
              component="form"
              onSubmit={handleJumpToPage}
              className="flex items-center gap-2"
            >
              <TextField
                label="Page"
                type="number"
                size="small"
                variant="outlined"
                value={jumpToPageInput}
                onChange={(e) => setJumpToPageInput(e.target.value)}
                sx={{ width: "100px" }}
              />
              <Button type="submit" variant="contained">
                Go
              </Button>
            </Box>
          </Box>
        </div>
      </div>
    </>
  );
}

export default SmsPvaHistory;

type PropsItemHistory = {
  sms: SmsPva;
};
function ItemHistory({ sms }: PropsItemHistory) {
  const country = countries.find((c) => c.code === sms.country);
  const service = services.find((c) => c.code === sms.serviceCode);
  return (
    <tr key={sms.id} className="h-16 border-b">
      <td>
        <section className="flex flex-col gap-1 px-2">
          <span className="font-semibold leading-none">
            {moment(sms.createAt).format("DD MMMM YYYY")}
          </span>
          <span className="text-xs text-gray-500">
            At {moment(sms.createAt).format("HH:mm")}
          </span>
        </section>
      </td>
      <td>
        <div className="flex items-center justify-center gap-1 px-2">
          {sms.phoneNumber}
        </div>
      </td>
      <td>
        <div className="flex items-center justify-center">
          <div className="relative h-5 w-5 overflow-hidden">
            <Image
              src={country?.flag ?? ""}
              fill
              alt="flag"
              className="object-contain"
            />
          </div>
        </div>
      </td>
      <td>
        <div className="flex w-40 items-center justify-center gap-1 text-center">
          {sms.isGetSms === true ? (
            <div className=" w-40 rounded-md bg-green-200 px-2 text-sm text-green-600">
              SMS ${sms.price}
            </div>
          ) : (
            <div className="w-20 rounded-md bg-red-200 px-2 text-sm text-red-600">
              NO SMS
            </div>
          )}
        </div>
      </td>
      <td>
        <div className="flex items-center justify-center gap-2 px-2">
          {service?.title ?? "Not Found"}
        </div>
      </td>
    </tr>
  );
}
