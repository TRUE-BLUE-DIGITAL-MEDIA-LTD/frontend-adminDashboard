import { useState } from "react";
import Countdown from "react-countdown";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import Swal from "sweetalert2";
import { ErrorMessages, SmsGetatext, SmsGetatextMessage } from "../../models";
import { useCompleteSmsGetatext } from "../../react-query/sms-getatext";

type Props = {
  smsGetatext: SmsGetatext & { messages: SmsGetatextMessage[] };
  onCancel: (id: string) => void;
};

function SmsGetatextCard({ smsGetatext, onCancel }: Props) {
  const completeNumber = useCompleteSmsGetatext();
  const [triggerHide, setTriggerHide] = useState(false);

  const handleCompleteSms = async () => {
    try {
      await completeNumber.mutateAsync(smsGetatext.id);
      Swal.fire({
        title: "Success",
        text: "Number marked as completed successfully.",
        icon: "success",
      });
    } catch (error) {
      console.log(error);
      let result = error as ErrorMessages;
      Swal.fire({
        title: result.error ? result.error : "Something went wrong!",
        text: result.message?.toString() || "Unknown error",
        footer: result.statusCode
          ? "Error code: " + result.statusCode?.toString()
          : "",
        icon: "error",
      });
    }
  };

  const handleCancelSms = async () => {
    try {
      const result = await Swal.fire({
        title: "Cancel Rental",
        text: "Are you sure you want to cancel this number?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, cancel it!",
      });

      if (result.isConfirmed) {
        onCancel(smsGetatext.id);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className=" w-full rounded-md bg-white p-3 ring-1 ring-gray-400 drop-shadow-xl">
      {triggerHide === false && (
        <div className="flex flex-col  gap-2 ">
          <div className="flex  items-center justify-start gap-2 border-b border-gray-400 pb-2">
            <h3 className="text-lg font-semibold">
              +1 {smsGetatext.phoneNumber}
            </h3>
          </div>
          <div className="flex w-full items-center justify-end gap-2">
            <h3 className="flex h-8 items-center justify-center rounded-sm bg-green-200 p-1 px-3 text-sm font-normal">
              <Countdown
                date={new Date(smsGetatext.expireAt)}
                intervalDelay={0}
                precision={3}
                onComplete={() => {}}
                renderer={({ days, hours, minutes, seconds }) => {
                  if (days > 0) {
                    return (
                      <span>
                        {days}d {hours}:{minutes}:{seconds}
                      </span>
                    );
                  }
                  return (
                    <span>
                      {hours}:{minutes}:{seconds}
                    </span>
                  );
                }}
              />
            </h3>

            <div className="flex items-center justify-center gap-1">
              <button
                disabled={completeNumber.isPending}
                onClick={handleCompleteSms}
                className="flex h-8 items-center justify-center rounded-sm bg-blue-300 p-1 px-3 text-blue-700 disabled:bg-blue-200"
              >
                {completeNumber.isPending ? "Loading..." : "Complete"}
              </button>
              <button
                onClick={handleCancelSms}
                className="flex h-8 items-center justify-center rounded-sm bg-red-300 p-1 px-3 text-red-700"
              >
                cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {triggerHide === false && (
        <div className="mt-2 flex w-full justify-start gap-2">
          <span>
            {smsGetatext.serviceCode} : ({smsGetatext.price}$)
          </span>
        </div>
      )}
      {triggerHide === false && (
        <div className="py-2">
          {smsGetatext.messages.length > 0 ? (
            <ul className="flex max-h-40 flex-col overflow-auto">
              {smsGetatext.messages.map((sms) => {
                return (
                  <li key={sms.id} className="flex w-full flex-col gap-1 py-2 ">
                    <span>Code: {sms.text}</span>
                    <span>
                      Received: {new Date(sms.receviedAt).toLocaleString()}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p>
              An SMS with a code will appear here after you use the number to
              receive SMS
            </p>
          )}
        </div>
      )}
      <div className="flex h-5 w-full justify-end ">
        <button
          onClick={() => setTriggerHide((prev) => !prev)}
          className="flex items-center justify-center gap-2 rounded-lg border p-1 px-2 hover:bg-gray-800 hover:text-white"
        >
          {triggerHide === false ? (
            <>
              <IoMdEyeOff /> hide
            </>
          ) : (
            <>
              <IoMdEye /> show
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default SmsGetatextCard;
