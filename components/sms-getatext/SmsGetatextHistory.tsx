import { UseQueryResult, useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import { FormEvent, useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import { ErrorMessages, SmsGetatext, SmsGetatextMessage } from "../../models";
import {
  useGetHistorySmsGetatext,
  useReRentSmsGetatext,
} from "../../react-query/sms-getatext";
import { Box, Button, Pagination, TextField } from "@mui/material";

type Props = {
  activeNumbers: UseQueryResult<any, Error>;
};

function SmsGetatextHistory({ activeNumbers }: Props) {
  const [page, setPage] = useState(1);
  const history = useGetHistorySmsGetatext({
    page: page,
    limit: 20,
  });
  const [jumpToPageInput, setJumpToPageInput] = useState("");
  const totalPage = history.data?.totalPage ?? 1;

  const queryClient = useQueryClient();
  const reRent = useReRentSmsGetatext();

  const handleReRent = async (id: string) => {
    try {
      Swal.fire({
        title: "Loading",
        html: "Please wait.",
        allowEscapeKey: false,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      const result = await reRent.mutateAsync({ id });
      await queryClient.invalidateQueries({
        queryKey: ["sms-getatext-active-numbers"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["sms-getatext-balance"],
      });
      Swal.fire({
        title: "Success",
        html: `Number <b>+${result.phoneNumber}</b> rented again.<br/>Expires at ${moment(
          result.expireAt,
        ).format("DD MMMM YYYY HH:mm")}`,
        icon: "success",
      });
    } catch (error) {
      console.log(error);
      const result = error as ErrorMessages;
      Swal.fire({
        title: result.error ? result.error : "Something went wrong!",
        text: result.message?.toString(),
        footer: result.statusCode
          ? "Error code: " + result.statusCode?.toString()
          : "",
        icon: "error",
      });
    }
  };

  const prevActiveIds = useRef<string[] | null>(null);

  useEffect(() => {
    if (!activeNumbers.data) return;
    const currentIds = activeNumbers.data.map((n: SmsGetatext) => n.id);
    if (prevActiveIds.current !== null) {
      const removed = prevActiveIds.current.some(
        (id) => !currentIds.includes(id),
      );
      if (removed) {
        queryClient.invalidateQueries({ queryKey: ["sms-getatext-history"] });
      }
    }
    prevActiveIds.current = currentIds;
  }, [activeNumbers.data, queryClient]);

  const handleJumpToPage = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const targetPage = parseInt(jumpToPageInput, 10);

    if (!isNaN(targetPage) && targetPage >= 1 && targetPage <= totalPage) {
      setPage(targetPage);
      setJumpToPageInput("");
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
              <th className="px-2 py-1">Date</th>
              <th className="px-2 py-1">Phone Number</th>
              <th className="px-2 py-1">Country</th>
              <th className="px-2 py-1">SMS</th>
              <th className="px-2 py-1">Delay</th>
              <th className="px-2 py-1">Service</th>
              <th className="px-2 py-1">Action</th>
            </tr>
          </thead>
          <tbody>
            {history.data?.data?.map(
              (sms: SmsGetatext & { messages: SmsGetatextMessage[] }) => {
                return (
                  <ItemHistory
                    key={sms.id}
                    sms={sms}
                    onReRent={handleReRent}
                    disabled={reRent.isPending}
                  />
                );
              },
            )}
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

export default SmsGetatextHistory;

type PropsItemHistory = {
  sms: SmsGetatext & { messages: SmsGetatextMessage[] };
  onReRent: (id: string) => void;
  disabled: boolean;
};

function formatDelay(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}h ${mins}m ${secs}s`;
  }
  return `${mins}m ${secs}s`;
}

function ItemHistory({ sms, onReRent, disabled }: PropsItemHistory) {
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
          +{sms.phoneNumber}
        </div>
      </td>
      <td>
        <div className="flex items-center justify-center">{sms.country}</div>
      </td>
      <td>
        <div className="flex w-40 flex-col items-center justify-center gap-1 text-center">
          {sms.messages && sms.messages.length > 0 ? (
            sms.messages.map((m) => (
              <div
                key={m.id}
                className="w-40 rounded-md bg-green-200 px-2 text-sm text-green-600"
              >
                {m.text}
              </div>
            ))
          ) : (
            <div className="w-20 rounded-md bg-red-200 px-2 text-sm text-red-600">
              NO SMS
            </div>
          )}
        </div>
      </td>
      <td>
        <div className="flex flex-col items-center justify-center gap-1 text-center">
          {sms.messages && sms.messages.length > 0 ? (
            sms.messages.map((m) => {
              const delaySeconds = moment(m.createAt).diff(
                moment(m.receviedAt),
                "seconds",
              );
              return (
                <div key={m.id} className="text-sm">
                  {formatDelay(delaySeconds)}
                </div>
              );
            })
          ) : (
            <div className="text-sm">-</div>
          )}
        </div>
      </td>
      <td>
        <div className="flex items-center justify-center gap-2 px-2">
          {sms.serviceCode}
        </div>
      </td>
      <td>
        <div className="flex items-center justify-center px-2">
          <Button
            size="small"
            variant="outlined"
            disabled={disabled}
            onClick={() => onReRent(sms.id)}
          >
            Re-rent
          </Button>
        </div>
      </td>
    </tr>
  );
}
