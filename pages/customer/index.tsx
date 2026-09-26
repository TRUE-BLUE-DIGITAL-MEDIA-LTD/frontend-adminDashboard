import { Box, Button, Pagination, Skeleton, TextField } from "@mui/material";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import { FormEvent, useState } from "react";
import { MdDelete } from "react-icons/md";
import { SiMicrosoftexcel } from "react-icons/si";
import Swal from "sweetalert2";
import * as XLSX from "xlsx-js-style";
import { loadingNumber } from "../../data/loadingNumber";
import DashboardLayout from "../../layouts/dashboardLayout";
import { User } from "../../models";
import { GetUser } from "../../services/admin/user";
import {
  DeleteCustomerService,
  GetCustomerByPageService,
} from "../../services/customer";

/** Render a customer's multi-step form answers as compact key:value chips. */
function AnswersCell({
  answers,
}: {
  answers: Record<string, string> | null | undefined;
}) {
  const entries = Object.entries(answers ?? {});
  if (entries.length === 0) return <span>-</span>;
  return (
    <div className="flex max-w-64 flex-wrap justify-center gap-1">
      {entries.map(([key, value]) => (
        <span
          key={key}
          className="whitespace-nowrap rounded-full bg-blue-500/10 px-2 py-0.5 text-xs text-blue-900 dark:text-blue-400"
        >
          {key}: {value}
        </span>
      ))}
    </div>
  );
}

function Index({ user }: { user: User }) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [isAsc, setIsAsc] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const customers = useQuery({
    queryKey: ["customer", page],
    queryFn: () => GetCustomerByPageService({ page: page, limit: 20 }),
    placeholderData: keepPreviousData,
  });

  const [jumpToPageInput, setJumpToPageInput] = useState("");
  const totalPage = customers.data?.meta.lastPage ?? 1;
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

  const [isExporting, setIsExporting] = useState(false);

  const handleDownloadExcel = async () => {
    try {
      setIsExporting(true);
      // Pull every page; the endpoint is paginated only.
      const limit = 500;
      const first = await GetCustomerByPageService({ page: 1, limit });
      const all = [...first.data];
      for (let p = 2; p <= (first.meta.lastPage ?? 1); p++) {
        const next = await GetCustomerByPageService({ page: p, limit });
        all.push(...next.data);
      }

      // Form-answer keys are dynamic (defined per landing page form), so
      // give each key its own column, in first-seen order. A key that
      // collides with a fixed header (e.g. an editor naming an answer key
      // "Email") gets a suffixed header so it can't overwrite real data.
      const RESERVED_HEADERS = [
        "Email",
        "IP Address",
        "Country",
        "Landing Page",
        "Created At",
      ];
      const answerKeys: string[] = [];
      for (const customer of all) {
        for (const key of Object.keys(customer.formAnswers ?? {})) {
          if (!answerKeys.includes(key)) answerKeys.push(key);
        }
      }
      const answerColumns = answerKeys.map((key) => ({
        key,
        header: RESERVED_HEADERS.includes(key) ? `${key} (answer)` : key,
      }));

      const excelData = all.map((customer) => {
        const row: Record<string, string> = {
          Email: customer.email ?? "-",
          "IP Address": customer.ip ?? "-",
          Country: customer.country ?? "-",
        };
        for (const col of answerColumns) {
          row[col.header] = customer.formAnswers?.[col.key] ?? "-";
        }
        row["Landing Page"] = customer.landingPage?.name ?? "-";
        row["Created At"] = new Date(customer.createAt).toLocaleString("en-US");
        return row;
      });

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      worksheet["!cols"] = [
        { wch: 30 }, // Email
        { wch: 16 }, // IP Address
        { wch: 16 }, // Country
        ...answerKeys.map(() => ({ wch: 16 })),
        { wch: 24 }, // Landing Page
        { wch: 22 }, // Created At
      ];
      if (worksheet["!ref"]) {
        const range = XLSX.utils.decode_range(worksheet["!ref"]);
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const address = XLSX.utils.encode_cell({ r: 0, c: C });
          if (!worksheet[address]) continue;
          worksheet[address].s = {
            font: { bold: true },
            alignment: { horizontal: "center", vertical: "center" },
          };
        }
      }
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");
      const today = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(workbook, `customers-${today}.xlsx`);
    } catch (err: any) {
      console.log(err);
      Swal.fire("error!", err.message?.toString(), "error");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteCustomerEmail = async ({
    customerId,
  }: {
    customerId: string;
  }) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          Swal.fire({
            title: "Trying To Delete...",
            html: "Please Wait For A Moment",
            allowEscapeKey: false,
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });
          setIsLoading(() => true);
          await DeleteCustomerService({
            customerId: customerId,
          });
          Swal.fire("Deleted!", "Email Has Been Deleted", "success");
          await customers.refetch();
          setIsLoading(() => false);
        } catch (err: any) {
          setIsLoading(() => false);
          console.log(err);
          Swal.fire("error!", err.message?.toString(), "error");
        }
      }
    });
  };
  return (
    <DashboardLayout user={user}>
      <div className="min-h-screen w-full bg-surface font-Poppins text-fg">
        <header className="mx-auto flex w-full max-w-7xl flex-col items-start gap-2 px-4 pt-10 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-main-color">
            Leads
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-fg md:text-5xl">
            <span className="text-main-color">C</span>ustomers
          </h1>
        </header>
        <main className="mx-auto mt-8 flex w-full max-w-7xl flex-col items-center justify-center gap-5 px-4 pb-20 sm:px-6 lg:px-8">
          <div className="flex w-full justify-end">
            <Button
              variant="contained"
              color="success"
              disabled={isExporting || customers.isLoading}
              onClick={handleDownloadExcel}
              startIcon={<SiMicrosoftexcel />}
            >
              {isExporting ? "Exporting..." : "Download Excel"}
            </Button>
          </div>
          <div className="h-96 w-full overflow-hidden rounded-2xl border border-line bg-panel text-fg shadow-none md:h-[36rem]">
            <div className="h-full w-full overflow-auto">
            <table className="w-max min-w-full table-auto text-left text-sm">
              <thead className="h-12 border-b border-line text-xs font-semibold uppercase tracking-wide text-fg-muted">
                <tr className="sticky top-0 z-20 bg-panel/95">
                  <th className="group flex h-14 items-center  gap-2">
                    <span>Email</span>
                    <div className={`flex items-center `}></div>
                  </th>
                  <th>IP Address</th>
                  <th>Country</th>
                  <th>Answers</th>
                  <th>Landing Page</th>
                  <th className="group flex gap-2">
                    <span>Create At</span>
                    <div className={`flex items-center `}></div>
                  </th>
                  <th>Options</th>
                </tr>
              </thead>
              <tbody className="">
                {customers.isLoading
                  ? loadingNumber.map((list, index) => {
                      return (
                        <tr key={index}>
                          <td>
                            <Skeleton />
                          </td>
                          <td>
                            <Skeleton animation="wave" />
                          </td>
                          <td>
                            <Skeleton animation="wave" />
                          </td>
                          <td>
                            <Skeleton animation="wave" />
                          </td>
                          <td>
                            <Skeleton />
                          </td>
                          <td>
                            <Skeleton />
                          </td>
                          <td>
                            <Skeleton animation="wave" />
                          </td>
                        </tr>
                      );
                    })
                  : customers?.data?.data?.map((list, index) => {
                      const createAt = new Date(list?.createAt);
                      const formattedDatecreateAt = createAt.toLocaleDateString(
                        "en-US",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        },
                      );
                      return (
                        <tr
                          className="h-14 border-b border-line transition hover:bg-hover"
                          key={index}
                        >
                          {customers.isFetching ? (
                            <td>
                              <Skeleton animation="wave" />
                            </td>
                          ) : (
                            <td>{list?.email}</td>
                          )}
                          <td>
                            <div className="min-w-28 text-center">
                              {list?.ip ? list?.ip : "-"}
                            </div>
                          </td>
                          <td>
                            <div className="min-w-28 text-center">
                              {list?.country ? list?.country : "-"}
                            </div>
                          </td>
                          <td>
                            <div className="min-w-40 max-w-64 px-2 text-center text-sm">
                              <AnswersCell answers={list?.formAnswers} />
                            </div>
                          </td>

                          {customers.isFetching ? (
                            <td>
                              <Skeleton />
                            </td>
                          ) : (
                            <td>
                              <Link
                                href={`/landingpage/${list?.landingPageId}`}
                              >
                                <span className="text-blue-700 dark:text-blue-400 underline">
                                  {list?.landingPage?.name}
                                </span>
                              </Link>
                            </td>
                          )}

                          <td>
                            <div className="min-w-28 px-2 text-center">
                              {formattedDatecreateAt}
                            </div>
                          </td>

                          <td className="flex h-14 w-20 items-center justify-center gap-2">
                            <button
                              onClick={() =>
                                handleDeleteCustomerEmail({
                                  customerId: list.id,
                                })
                              }
                              className="text-3xl text-red-700 dark:text-red-400 transition duration-100 hover:scale-105 active:text-red-900"
                            >
                              <MdDelete />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
            </div>
          </div>
          <div className="mt-5 flex w-full justify-center">
            <Box className="mt-5 flex w-full flex-col items-center justify-center gap-4 md:flex-row">
              <Pagination
                onChange={(e, newPage) => setPage(newPage)}
                page={page}
                count={totalPage}
                color="primary"
                showFirstButton
                showLastButton
                sx={{
                  "& .MuiPaginationItem-root": {
                    color: "rgb(var(--fg))",
                    borderColor: "var(--line-strong)",
                  },
                  "& .MuiPaginationItem-root.Mui-selected": {
                    backgroundColor: "#00ABE4",
                    color: "#ffffff",
                    "&:hover": { backgroundColor: "#0096c7" },
                  },
                  "& .MuiPaginationItem-root:hover": {
                    backgroundColor: "rgba(0, 171, 228, 0.2)",
                  },
                  "& .MuiPaginationItem-icon": { color: "rgb(var(--fg))" },
                }}
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
        </main>
      </div>
    </DashboardLayout>
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
