import Swal from "sweetalert2";
import { RiErrorWarningLine } from "react-icons/ri";
import { ErrorMessages } from "../../models";
import {
  useCancelSmsBulk,
  useCompleteSmsBulk,
  useGetSmsBulk,
  useResendSmsBulk,
} from "../../react-query";
import ActiveNumber from "./ActiveNumber";
import SelectService from "./SelectService";
import { SmsBulkProps } from "./SmsBulk";
import SmsHistory from "./SmsHistory";

export function showSmsBulkError(error: unknown) {
  const result = error as ErrorMessages;
  Swal.fire({
    title: result.error ? result.error : "Something went wrong!",
    text: result.message?.toString(),
    footer: result.statusCode ? "Error code: " + result.statusCode : "",
    icon: "error",
  });
}

export function showLoading() {
  Swal.fire({
    title: "Loading",
    html: "Please wait.",
    allowEscapeKey: false,
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
  });
}

function SmsTab({ user }: SmsBulkProps) {
  const activeNumbers = useGetSmsBulk({ userId: user.id });
  const cancelSms = useCancelSmsBulk();
  const completeSms = useCompleteSmsBulk();
  const resendSms = useResendSmsBulk();

  const handleCancel = async (id: string) => {
    try {
      showLoading();
      await cancelSms.mutateAsync({ smsBulkId: id });
      await activeNumbers.refetch();
      Swal.fire({ title: "Success", text: "Number cancelled. Held points will be refunded shortly.", icon: "success" });
    } catch (error) {
      showSmsBulkError(error);
    }
  };

  const handleDone = async (id: string) => {
    const confirm = await Swal.fire({
      title: "Mark as done?",
      text: "The number moves to History and new SMS are no longer tracked.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Done",
    });
    if (!confirm.isConfirmed) return;
    try {
      showLoading();
      await completeSms.mutateAsync({ smsBulkId: id });
      await activeNumbers.refetch();
      Swal.fire({ title: "Success", text: "Number marked as done.", icon: "success" });
    } catch (error) {
      showSmsBulkError(error);
      activeNumbers.refetch();
    }
  };

  const handleResend = async (id: string) => {
    try {
      showLoading();
      await resendSms.mutateAsync({ smsBulkId: id });
      Swal.fire({ title: "Requested", text: "The provider will send another SMS to this number.", icon: "success" });
    } catch (error) {
      showSmsBulkError(error);
    }
  };

  return (
    <>
      <section className="flex w-10/12 flex-col items-start justify-start gap-5">
        <h1 className="text-lg font-semibold">My numbers</h1>
        {(!activeNumbers.data || activeNumbers.data.data.length === 0) && (
          <div className="flex w-96 flex-col items-center justify-center gap-5 rounded-md bg-white p-5 ring-1 ring-gray-400 drop-shadow-xl">
            <RiErrorWarningLine className="text-5xl" />
            <h3 className="text-xl">No operations.</h3>
            <span className="text-sm">Order a number and use it to register in the selected app/website</span>
          </div>
        )}
        <ul className="grid w-full grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {activeNumbers.data?.data.map((number) => (
            <ActiveNumber
              key={number.id}
              sms={number}
              onCancel={handleCancel}
              onDone={handleDone}
              onResend={handleResend}
            />
          ))}
        </ul>
      </section>
      <section className="flex w-full flex-col items-center justify-center gap-5">
        <SelectService activeNumbers={activeNumbers} />
        <SmsHistory />
      </section>
    </>
  );
}

export default SmsTab;
