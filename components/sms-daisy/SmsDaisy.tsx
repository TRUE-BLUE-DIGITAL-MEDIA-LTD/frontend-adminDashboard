import { RiErrorWarningLine } from "react-icons/ri";
import Swal from "sweetalert2";
import { ErrorMessages, Partner, User } from "../../models";
import {
  useCancelSmsDaisy,
  useGetSmsDaisy,
  useGetSmsDaisyAccount,
} from "../../react-query";
import ActiveNumber from "./ActiveNumber";
import SmsDaisyAccount from "./SmsDaisyAccount";
import SelectService from "./SelectService";
import SmsDaisyHistory from "./SmsDaisyHistory";

type Props = {
  user: User & { partner: Partner | null };
};
function SmsDaisy({ user }: Props) {
  const activeNumbers = useGetSmsDaisy();
  const cancelSMS = useCancelSmsDaisy();
  const accounts = useGetSmsDaisyAccount();

  const handleCancelSMS = async (id: string) => {
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
      await cancelSMS.mutateAsync({
        smsDaisyId: id,
      });
      await activeNumbers.refetch();
      Swal.fire({
        title: "Success",
        text: "Operation has been successfully completed.",
        icon: "success",
      });
    } catch (error) {
      console.log(error);
      let result = error as ErrorMessages;
      Swal.fire({
        title: result.error ? result.error : "Something went wrong!",
        text: result.message.toString(),
        footer: result.statusCode
          ? "Error code: " + result.statusCode?.toString()
          : "",
        icon: "error",
      });
    }
  };
  return (
    <>
      <header className="mt-10 flex w-full flex-col items-center justify-center border-b pb-5">
        {(user.role === "manager" ||
          user.role === "admin" ||
          user.partner?.isAllowSmsDaisyAccount === true) && (
          <ul className="flex w-full flex-wrap items-center justify-center gap-3">
            {accounts.data?.map((a) => {
              return <SmsDaisyAccount key={a.id} account={a} user={user} />;
            })}
          </ul>
        )}
        <h1 className="text-4xl font-semibold text-gray-800">Oxy Day</h1>
        <span className="text-sm text-gray-500">
          SmsDay provides the opportunity to use short-term temp phone numbers
          from different countries at fair and affordable prices for receiving
          SMS messages.
        </span>
        {(user.role === "admin" || user.role === "manager") && (
          <h1 className="mt-5 flex items-center justify-center gap-2 text-3xl">
            Balance :{" "}
            <div className="rounded-sm bg-gradient-to-r from-gray-600 to-gray-800 px-2 text-white">
              {activeNumbers.data?.balance.toLocaleString()}$
            </div>
          </h1>
        )}
      </header>
      <main className="mt-5 flex w-full flex-col items-center gap-5 pb-20">
        <section className="flex w-10/12  flex-col items-start  justify-start gap-5 ">
          <h1 className="text-lg font-semibold">My numbers</h1>
          {!activeNumbers.data ||
            (activeNumbers.data.data.length === 0 && (
              <div className="flex  w-96 flex-col items-center justify-center gap-5 rounded-md bg-white p-5 ring-1 ring-gray-400 drop-shadow-xl">
                <RiErrorWarningLine className="text-5xl" />
                <h3 className="text-xl">No operations.</h3>
                <span className="text-sm">
                  Order a number and use it to register in the selected
                  app/website
                </span>
              </div>
            ))}
          <ul className=" grid w-full grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
            {activeNumbers.data?.data.map((number, index) => {
              return (
                <ActiveNumber
                  key={number.id}
                  smsDaisy={number}
                  onCancel={() => handleCancelSMS(number.id)}
                />
              );
            })}
          </ul>
        </section>
        <section className="flex w-full flex-col items-center justify-center gap-5">
          <SelectService activeNumbers={activeNumbers} />
          <SmsDaisyHistory activeNumbers={activeNumbers} />
        </section>
      </main>
    </>
  );
}

export default SmsDaisy;
