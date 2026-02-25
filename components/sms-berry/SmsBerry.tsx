import { RiErrorWarningLine } from "react-icons/ri";
import { User, Partner } from "../../models";
import { useGetActiveSmsBerryNumbers } from "../../react-query/sms-berry";
import ActiveNumber from "./ActiveNumber";
import SelectService from "./SelectService";

type Props = {
  user: User & { partner: Partner | null };
};

function SmsBerry({ user }: Props) {
  const activeNumbers = useGetActiveSmsBerryNumbers();

  return (
    <>
      <header className="mt-10 flex w-full flex-col items-center justify-center border-b pb-5">
        <h1 className="text-4xl font-semibold text-gray-800">Oxy Berry</h1>
        <span className="text-sm text-gray-500">
          OxyBerry provides the opportunity to use short-term temp phone numbers
          from different countries at fair and affordable prices for receiving
          SMS messages.
        </span>
      </header>
      <main className="mt-5 flex w-full flex-col items-center gap-5 pb-20">
        <section className="flex w-10/12 flex-col items-start justify-start gap-5">
          <h1 className="text-lg font-semibold">My numbers</h1>
          {!activeNumbers.data || activeNumbers.data.length === 0 ? (
            <div className="flex w-96 flex-col items-center justify-center gap-5 rounded-md bg-white p-5 ring-1 ring-gray-400 drop-shadow-xl">
              <RiErrorWarningLine className="text-5xl" />
              <h3 className="text-xl">No operations.</h3>
              <span className="text-center text-sm">
                Order a number and use it to register in the selected
                app/website
              </span>
            </div>
          ) : (
            <ul className="grid w-full grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
              {activeNumbers.data.map((number) => (
                <ActiveNumber key={number.id} smsBerry={number} />
              ))}
            </ul>
          )}
        </section>
        <section className="flex w-full flex-col items-center justify-center gap-5">
          <SelectService activeNumbers={activeNumbers} />
        </section>
      </main>
    </>
  );
}

export default SmsBerry;
