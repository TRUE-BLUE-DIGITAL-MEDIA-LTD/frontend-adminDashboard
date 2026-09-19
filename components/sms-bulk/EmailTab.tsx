import Swal from "sweetalert2";
import { RiErrorWarningLine } from "react-icons/ri";
import {
  useCancelSmsBulkEmail,
  useCompleteSmsBulkEmail,
  useGetSmsBulkEmail,
  useReorderSmsBulkEmail,
} from "../../react-query";
import ActiveEmail from "./ActiveEmail";
import EmailHistory from "./EmailHistory";
import SelectEmailDomain from "./SelectEmailDomain";
import { SmsBulkProps } from "./SmsBulk";
import { showLoading, showSmsBulkError } from "./SmsTab";

function EmailTab({ user }: SmsBulkProps) {
  const activeEmails = useGetSmsBulkEmail({ userId: user.id });
  const cancelEmail = useCancelSmsBulkEmail();
  const completeEmail = useCompleteSmsBulkEmail();
  const reorderEmail = useReorderSmsBulkEmail();

  const handleCancel = async (id: string) => {
    try {
      showLoading();
      await cancelEmail.mutateAsync({ smsBulkEmailId: id });
      await activeEmails.refetch();
      Swal.fire({ title: "Success", text: "Email cancelled. Held points will be refunded shortly.", icon: "success" });
    } catch (error) {
      showSmsBulkError(error);
    }
  };

  const handleDone = async (id: string) => {
    const confirm = await Swal.fire({
      title: "Mark as done?",
      text: "The email moves to History.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Done",
    });
    if (!confirm.isConfirmed) return;
    try {
      showLoading();
      await completeEmail.mutateAsync({ smsBulkEmailId: id });
      await activeEmails.refetch();
      Swal.fire({ title: "Success", text: "Email marked as done.", icon: "success" });
    } catch (error) {
      showSmsBulkError(error);
      activeEmails.refetch();
    }
  };

  const handleReorder = async (id: string) => {
    const confirm = await Swal.fire({
      title: "Reorder this address?",
      text: "The same address is re-opened for another OTP and you are charged again.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Reorder",
    });
    if (!confirm.isConfirmed) return;
    try {
      showLoading();
      await reorderEmail.mutateAsync({ smsBulkEmailId: id });
      await activeEmails.refetch();
      Swal.fire({ title: "Success", text: "Address re-opened. Waiting for the next OTP.", icon: "success" });
    } catch (error) {
      showSmsBulkError(error);
    }
  };

  return (
    <>
      <section className="flex w-10/12 flex-col items-start justify-start gap-5">
        <h1 className="text-lg font-semibold">My emails</h1>
        {(!activeEmails.data || activeEmails.data.data.length === 0) && (
          <div className="flex w-96 flex-col items-center justify-center gap-5 rounded-md bg-white p-5 ring-1 ring-gray-400 drop-shadow-xl">
            <RiErrorWarningLine className="text-5xl" />
            <h3 className="text-xl">No operations.</h3>
            <span className="text-sm">Order an email address and use it to register on the target site</span>
          </div>
        )}
        <ul className="grid w-full grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {activeEmails.data?.data.map((email) => (
            <ActiveEmail
              key={email.id}
              email={email}
              onCancel={handleCancel}
              onDone={handleDone}
              onReorder={handleReorder}
            />
          ))}
        </ul>
      </section>
      <section className="flex w-full flex-col items-center justify-center gap-5">
        <SelectEmailDomain activeEmails={activeEmails} />
        <EmailHistory onReorder={handleReorder} />
      </section>
    </>
  );
}

export default EmailTab;
