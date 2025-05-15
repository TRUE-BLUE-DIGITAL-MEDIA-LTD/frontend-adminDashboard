import { MdAccountCircle, MdDataUsage } from "react-icons/md";
import { User } from "../../models";
import { useGetPartnerByManager } from "../../react-query";
import SummaryList from "./SummaryList";
import { RequestUseGetHistories } from "../../react-query/account-history";

type Props = {
  user: User;
  filter: RequestUseGetHistories;
};
function SummaryUsageSimcard({ user, filter }: Props) {
  const partners = useGetPartnerByManager(user.id);

  return (
    <section className="w-full ">
      <span>Summary Usage Of Oxy SMS</span>
      <div className=" overflow-hidden rounded-md border">
        <table className="w-max min-w-full">
          <thead>
            <tr className=" bg-gray-300 p-2 text-black">
              <th>
                <div className="flex items-center justify-center gap-2">
                  <MdAccountCircle />
                  Account
                </div>
              </th>
              <th>
                <div className="flex items-center justify-center gap-2">
                  <MdDataUsage />
                  Total Usage
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {partners.isLoading
              ? "Loading.."
              : partners.data
                  ?.filter((p) => p.account)
                  .map((partner, index) => {
                    return (
                      <SummaryList
                        key={index}
                        partner={partner}
                        filter={filter}
                      />
                    );
                  })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default SummaryUsageSimcard;
