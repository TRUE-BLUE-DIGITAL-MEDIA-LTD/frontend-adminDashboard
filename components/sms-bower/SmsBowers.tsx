import { RiErrorWarningLine } from "react-icons/ri";
import Swal from "sweetalert2";
import { ErrorMessages, Partner, User } from "../../models";
import {
  useCancelSmsBower,
  useGetActiveSmsBowerNumbers,
  useGetSmsBowerAccounts,
} from "../../react-query/sms-bower";
import SelectService from "./SelectService";
import SmsBowerAccount from "./SmsBowerAccount";
import SmsBowerCard from "./SmsBowerCard";

type Props = {
  user: User & { partner: Partner | null };
};

function SmsBowers({ user }: Props) {
  const activeNumbers = useGetActiveSmsBowerNumbers();
  const cancelSMS = useCancelSmsBower();
  const accounts = useGetSmsBowerAccounts();

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
        id: id,
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
          user.partner?.isAllowManageSmsBowerAccount === true) && (
          <ul className="flex w-full flex-wrap items-center justify-center gap-3">
            {accounts.data?.map((a) => {
              return <SmsBowerAccount key={a.id} account={a} user={user} />;
            })}
          </ul>
        )}
        <h1 className="text-4xl font-semibold text-gray-800">Oxy Bow</h1>
        <span className="text-sm text-gray-500">
          OxyBow provides the opportunity to use short-term temp phone numbers
          from different countries at fair and affordable prices for receiving
          SMS messages.
        </span>
      </header>
      <main className="mt-5 flex w-full flex-col items-center gap-5 pb-20">
        <section className="flex w-10/12  flex-col items-start  justify-start gap-5 ">
          <h1 className="text-lg font-semibold">My numbers</h1>
          {!activeNumbers.data ||
            (activeNumbers.data.length === 0 && (
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
            {activeNumbers.data?.map((number) => {
              return (
                <SmsBowerCard
                  key={number.id}
                  smsBower={number}
                  onCancel={handleCancelSMS}
                />
              );
            })}
          </ul>
        </section>
        <section className="flex w-full flex-col items-center justify-center gap-5">
          <SelectService activeNumbers={activeNumbers} />
        </section>
      </main>
    </>
  );
}

export default SmsBowers;
