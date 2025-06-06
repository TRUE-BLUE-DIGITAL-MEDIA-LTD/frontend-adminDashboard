import { Pagination } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import Head from "next/head";
import Image from "next/image";
import { parseCookies } from "nookies";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { Nullable } from "primereact/ts-helpers";
import { ReactNode, useEffect, useState } from "react";
import { IconType } from "react-icons";
import { BiCategoryAlt, BiImages } from "react-icons/bi";
import { BsDeviceSsdFill } from "react-icons/bs";
import { FaSms, FaUserFriends } from "react-icons/fa";
import {
  FaListCheck,
  FaMoneyBillTrendUp,
  FaPager,
  FaTags,
  FaUser,
} from "react-icons/fa6";
import { FcSms } from "react-icons/fc";
import { GiPayMoney } from "react-icons/gi";
import { GrDomain } from "react-icons/gr";
import { IoSearchCircleSharp } from "react-icons/io5";
import {
  MdDomain,
  MdEmail,
  MdOutlineConnectWithoutContact,
  MdOutlineMoneyOff,
  MdSimCard,
} from "react-icons/md";
import SpinLoading from "../components/loadings/spinLoading";
import DashboardLayout from "../layouts/dashboardLayout";
import { HistoryRecord, Partner, User } from "../models";
import { GetAllAccountByPageService } from "../services/admin/account";
import { GetUser } from "../services/admin/user";
import { GetHistoryRecordService } from "../services/history-record";
import { getRandomSlateShade, getSlateColorStyle } from "../utils/random";
import { useGetHistories } from "../react-query/account-history";
import SummaryUsageSimcard from "../components/simCard/SummaryUsageSimcard";

const actionsWithIcons = [
  { title: "user", icon: <FaUser /> },
  { title: "partner", icon: <FaUserFriends /> },
  { title: "bonus-rate", icon: <FaMoneyBillTrendUp /> },
  { title: "responsibility-on-partner", icon: <MdDomain /> },
  { title: "simcard", icon: <MdSimCard /> },
  { title: "smspva", icon: <FaSms /> },
  { title: "landing-page", icon: <FaPager /> },
  { title: "domain", icon: <GrDomain /> },
  { title: "category", icon: <BiCategoryAlt /> },
  { title: "email", icon: <MdEmail /> },
  { title: "payslip", icon: <GiPayMoney /> },
  { title: "deduction-on-payslip", icon: <MdOutlineMoneyOff /> },
  { title: "device-user", icon: <BsDeviceSsdFill /> },
  { title: "message-on-simcard", icon: <FcSms /> },
  { title: "tag-on-simcard", icon: <FaTags /> },
  { title: "simcard-on-partner", icon: <MdOutlineConnectWithoutContact /> },
  { title: "category-on-partner", icon: <FaListCheck /> },
  { title: "image-library", icon: <BiImages /> },
] as const;

type ActionListKey = (typeof actionsWithIcons)[number]["title"];

type ActionMethodKey = "create" | "update" | "delete" | "get";
function Index({ user }: { user: User }) {
  const [page, setPage] = useState<number>(1);
  const [dateStart, setDateStart] = useState<{
    actual?: Nullable<Date | null>;
    delay?: Nullable<Date | null>;
  }>();
  const [dateEnd, setDateEnd] = useState<{
    actual?: Nullable<Date | null>;
    delay?: Nullable<Date | null>;
  }>();

  const [selectUser, setSelectUser] = useState<User>();
  const [totalPage, setTotalPage] = useState<number>(1);
  const [historyRecords, setHistoryRecords] = useState<
    (HistoryRecord & { user: User })[]
  >([]);
  const [filter, setFilter] = useState<{
    action?: { title: ActionListKey; icon: IconType };
    data?: string;
    startDate?: string;
    endDate?: string;
    sms_oxy?: boolean;
  }>({
    action: undefined,
    data: "",
    sms_oxy: false,
  });
  const account = useQuery({
    queryKey: ["account", { page: 1, limit: 100 }],
    queryFn: () => GetAllAccountByPageService({ page: 1, limit: 100 }),
    enabled: user.role === "admin" || user.role === "manager",
  });

  const history = useGetHistories({
    page,
    limit: 100,
    filter: {
      action: filter.action?.title,
      data: filter.data,
      startDate: dateStart?.actual,
      endDate: dateEnd?.actual,
      userId: selectUser?.id,
      sms_oxy: filter.sms_oxy ?? false,
    },
  });

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      setDateStart((prev) => {
        return {
          ...prev,
          actual: prev?.delay,
        };
      });
    }, 2000);

    return () => clearTimeout(delayDebounceFn);
  }, [dateStart]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      setDateEnd((prev) => {
        return {
          ...prev,
          actual: prev?.delay,
        };
      });
    }, 2000);

    return () => clearTimeout(delayDebounceFn);
  }, [dateEnd]);

  useEffect(() => {
    if (history.data) {
      setTotalPage(history.data.meta.lastPage);
      setHistoryRecords(() => history.data?.data);
    }
  }, [history.data]);

  return (
    <>
      <Head>
        <title>Account History</title>
        <meta name="description" content="Account History" />
      </Head>
      <DashboardLayout user={user}>
        <main className="flex min-h-screen w-full flex-col items-center justify-start gap-2 p-20 font-Poppins">
          <div className="flex w-full">
            <h1 className="text-2xl font-semibold">Account History</h1>
          </div>
          <header className="py flex w-full flex-wrap justify-start gap-3 border-t border-gray-200 p-2">
            {(user.role === "admin" || user.role === "manager") &&
              filter.sms_oxy === false && (
                <div className={`flex flex-col`}>
                  <label className="text-xs ">Select User</label>
                  <Dropdown
                    value={selectUser}
                    onChange={(e) => {
                      setPage(1);
                      setSelectUser(() => e.value);
                    }}
                    options={account?.data?.accounts}
                    placeholder="Select User"
                    valueTemplate={(
                      option: User & {
                        partner: Partner | null;
                      },
                    ) => {
                      if (!option) return <>No user select</>;
                      return (
                        <span className="font-semibold leading-none">
                          {option.name}
                        </span>
                      );
                    }}
                    showClear
                    loading={account.isLoading}
                    itemTemplate={(
                      option: User & {
                        partner: Partner | null;
                      },
                    ) => (
                      <section className="flex items-center gap-2">
                        <div className="relative h-10 w-10 rounded-lg ">
                          <Image
                            src={option.image}
                            layout="fill"
                            alt="user image"
                            objectFit="cover"
                            className="rounded-lg"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold leading-none">
                            {option.name}
                          </span>
                          <span className="text-xs">{option.email}</span>
                        </div>
                      </section>
                    )}
                    className={`h-10 w-72 rounded  border border-gray-400 text-gray-800 `}
                  />
                </div>
              )}

            {filter.sms_oxy === false && (
              <div className="flex flex-col">
                <label className="text-xs ">Select Action</label>
                <Dropdown
                  value={filter.action}
                  onChange={(e) => {
                    setPage(1);
                    setFilter((prev) => {
                      return { ...prev, action: e.value };
                    });
                  }}
                  optionLabel="title"
                  options={actionsWithIcons as any}
                  placeholder="Select Action"
                  valueTemplate={(option: {
                    title: string;
                    icon: ReactNode;
                  }) => (
                    <div className="flex items-center gap-2">
                      {option?.icon}
                      <span>{option?.title}</span>
                    </div>
                  )}
                  showClear
                  itemTemplate={(option: {
                    title: string;
                    icon: ReactNode;
                  }) => (
                    <div className="flex items-center gap-2">
                      {option.icon}
                      <span>{option.title}</span>
                    </div>
                  )}
                  className="h-10 w-72 rounded  border border-gray-400 text-gray-800 "
                />
              </div>
            )}
            {filter.sms_oxy === false && (
              <label className="flex flex-col">
                <span className="text-xs">Seach Description</span>
                <div className="relative  flex flex-col">
                  <input
                    value={filter.data}
                    onChange={(e) => {
                      setPage(1);
                      setFilter((prev) => {
                        return { ...prev, data: e.target.value };
                      });
                    }}
                    type="text"
                    placeholder="Search Description"
                    className="h-10 w-72 rounded border border-gray-400 p-2 pl-10 text-gray-800 outline-none  focus:ring-2 active:ring-2"
                  />
                  <IoSearchCircleSharp className="text-super-main-color absolute bottom-0 left-2 top-0 m-auto text-3xl" />
                </div>
              </label>
            )}
            <label className="flex flex-col">
              <span className="text-xs">Pick Time Start</span>
              <Calendar
                className="h-10 w-72 rounded  border border-gray-400 text-gray-800 "
                value={dateStart?.delay}
                showTime
                hourFormat="24"
                onChange={(e) =>
                  setDateStart((prev) => ({
                    ...prev,
                    delay: e.value,
                  }))
                }
                readOnlyInput
                hideOnRangeSelection
                showButtonBar
                showIcon
              />
            </label>
            <label className="flex flex-col">
              <span className="text-xs">Pick Time End</span>
              <Calendar
                className="h-10 w-72 rounded  border border-gray-400 text-gray-800 "
                value={dateEnd?.delay}
                showTime
                hourFormat="24"
                onChange={(e) => {
                  setDateEnd((prev) => ({
                    ...prev,
                    delay: e.value,
                  }));
                }}
                readOnlyInput
                hideOnRangeSelection
                showButtonBar
                showIcon
              />
            </label>
            <label className="flex  w-72 items-center justify-center  gap-2 rounded-md border border-gray-400  px-2">
              <span className="text-xs">Check Oxy SMS usage</span>
              {account.isLoading ? (
                <SpinLoading />
              ) : (
                <input
                  checked={filter.sms_oxy}
                  onChange={(e) => {
                    setFilter((prev) => {
                      if (e.target.checked === true) {
                        setSelectUser(() => account.data?.accounts[0]);
                        const startDate = new Date();
                        const endDate = new Date();
                        startDate.setHours(0, 0, 0, 0);
                        endDate.setHours(23, 59, 59, 999);
                        setDateStart((prev) => ({
                          actual: startDate,
                          delay: startDate,
                        }));
                        setDateEnd((prev) => ({
                          actual: endDate,
                          delay: endDate,
                        }));
                        return {
                          ...prev,
                          data: "Active simcard: ",
                          action: {
                            title: "simcard",
                            icon: (<MdSimCard />) as unknown as IconType,
                          },
                          sms_oxy: e.target.checked,
                        };
                      } else {
                        return {
                          ...prev,
                          sms_oxy: e.target.checked,
                        };
                      }
                    });
                  }}
                  className="h-10 w-5"
                  type="checkbox"
                />
              )}
            </label>
          </header>
          {filter.sms_oxy === true ? (
            <SummaryUsageSimcard
              user={user}
              filter={{
                page,
                limit: 100,
                filter: {
                  action: filter.action?.title,
                  data: filter.data,
                  startDate: dateStart?.actual,
                  endDate: dateEnd?.actual,
                  userId: undefined,
                  sms_oxy: filter.sms_oxy ?? false,
                },
              }}
            />
          ) : (
            <>
              <div
                className="  min-h-60 w-full justify-center overflow-auto
           rounded-lg border border-gray-200  "
              >
                <table className="w-max min-w-full border-collapse ">
                  <thead className="">
                    <tr className="sticky top-0 z-20 h-10 bg-gray-300 font-semibold">
                      <td className="pl-5">Account</td>
                      <td>Create At</td>
                      <td>Action</td>
                      <td>Description</td>
                    </tr>
                  </thead>
                  <tbody>
                    {history.isLoading
                      ? [...Array(10)].map((list, index) => {
                          const randomShade = getRandomSlateShade();
                          return (
                            <tr
                              key={index}
                              className="h-14 border-b border-gray-200 hover:bg-gray-100"
                            >
                              <td
                                className="animate-pulse"
                                style={getSlateColorStyle(randomShade)}
                              ></td>
                              <td
                                className="animate-pulse"
                                style={getSlateColorStyle(randomShade)}
                              ></td>
                              <td
                                className="animate-pulse"
                                style={getSlateColorStyle(randomShade)}
                              ></td>
                              <td
                                className="animate-pulse"
                                style={getSlateColorStyle(randomShade)}
                              ></td>
                            </tr>
                          );
                        })
                      : historyRecords.map((record, index) => {
                          const action: ActionListKey = record.action.split(
                            ".",
                          )[0] as ActionListKey;

                          const method: ActionMethodKey = record.action.split(
                            ".",
                          )[1] as ActionMethodKey;

                          let icon: ReactNode = <FaUser />;
                          if (action === "user") {
                            icon = <FaUser />;
                          } else if (action === "partner") {
                            icon = <FaUserFriends />;
                          } else if (action === "bonus-rate") {
                            icon = <FaMoneyBillTrendUp />;
                          } else if (action === "responsibility-on-partner") {
                            icon = <MdDomain />;
                          } else if (action === "category") {
                            icon = <BiCategoryAlt />;
                          } else if (action === "category-on-partner") {
                            icon = <FaListCheck />;
                          } else if (action === "deduction-on-payslip") {
                            icon = <MdOutlineMoneyOff />;
                          } else if (action === "device-user") {
                            icon = <BsDeviceSsdFill />;
                          } else if (action === "domain") {
                            icon = <GrDomain />;
                          } else if (action === "email") {
                            icon = <MdEmail />;
                          } else if (action === "image-library") {
                            icon = <BiImages />;
                          } else if (action === "landing-page") {
                            icon = <FaPager />;
                          } else if (action === "message-on-simcard") {
                            icon = <FcSms />;
                          } else if (action === "payslip") {
                            icon = <GiPayMoney />;
                          } else if (action === "simcard") {
                            icon = <MdSimCard />;
                          } else if (action === "simcard-on-partner") {
                            icon = <MdOutlineConnectWithoutContact />;
                          } else if (action === "tag-on-simcard") {
                            icon = <FaTags />;
                          }
                          return (
                            <tr
                              key={index}
                              className="h-14 border-b border-gray-200 hover:bg-gray-100"
                            >
                              <td className="pl-5">
                                <section className="flex items-center gap-2">
                                  <span>{index + 1}</span>
                                  <div className="relative h-10 w-10 rounded-lg ">
                                    <Image
                                      src={record.user.image}
                                      layout="fill"
                                      alt="user image"
                                      objectFit="cover"
                                      className="rounded-lg"
                                    />
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <span className="font-semibold leading-none">
                                      {record.user.name}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {record.user.email}
                                    </span>
                                  </div>
                                </section>
                              </td>
                              <td>
                                <div className="flex flex-col gap-1">
                                  <span className="font-semibold leading-none">
                                    {moment(record.createAt).format(
                                      "DD MMMM YYYY",
                                    )}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    At {moment(record.createAt).format("HH:mm")}
                                  </span>
                                </div>
                              </td>
                              <td>
                                <section
                                  className={`flex items-center gap-2
                            ${method === "create" ? "text-green-800" : method === "get" ? "text-blue-800" : method === "update" ? "text-yellow-600" : "text-red-800"} 
                            `}
                                >
                                  {icon} <span>{record.action}</span>
                                </section>
                              </td>
                              <td className="max-w-40 text-wrap break-words p-2 text-sm">
                                {record.data}
                              </td>
                            </tr>
                          );
                        })}
                  </tbody>
                </table>
              </div>
              <Pagination
                onChange={(e, page) => setPage(page)}
                page={page}
                count={totalPage}
                color="primary"
              />
            </>
          )}
        </main>
      </DashboardLayout>
    </>
  );
}

export default Index;

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  try {
    const cookies = parseCookies(context);
    const accessToken = cookies.access_token;
    const user = await GetUser({ access_token: accessToken });
    if (user.TOTPenable === false) {
      return {
        redirect: {
          permanent: false,
          destination: "/auth/setup-totp",
        },
      };
    }
    return {
      props: {
        user,
      },
    };
  } catch (err) {
    return {
      redirect: {
        permanent: false,
        destination: "https://home.oxyclick.com",
      },
    };
  }
};
