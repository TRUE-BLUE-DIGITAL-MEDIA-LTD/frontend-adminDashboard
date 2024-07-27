import { useQuery, UseQueryResult } from "@tanstack/react-query";
import React from "react";
import { GetUser, SignInAsAnoterUserService } from "../../services/admin/user";
import { destroyCookie, parseCookies, setCookie } from "nookies";
import { User } from "../../models";
import Swal from "sweetalert2";

type ImpresonateNavBarProps = {
  impersonateUser: UseQueryResult<User | undefined, Error>;
};
function ImpersonateNavBar({ impersonateUser }: ImpresonateNavBarProps) {
  const handleStopImpersonate = async ({ email }: { email: string }) => {
    try {
      Swal.fire({
        title: "Backing to Original User",
        html: "Loading....",
        allowEscapeKey: false,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      const cookies = parseCookies();
      const impersonate_access_token = cookies.impersonate_access_token;
      setCookie(null, "access_token", impersonate_access_token, {
        maxAge: 30 * 24 * 60 * 60, // Cookie expiration time in seconds (e.g., 30 days)
        path: "/", // Cookie path (can be adjusted based on your needs)
      });
      destroyCookie(null, "impersonate_access_token");

      window.location.reload();
      Swal.fire({
        title: "Success",
        html: `Successfully Back to ${impersonateUser.data?.name}`,
        icon: "success",
      });
    } catch (err: any) {
      console.log(err);
      Swal.fire("error!", err.message?.toString(), "error");
    }
  };
  return (
    <nav className="sticky top-0 flex h-14 w-full justify-end bg-white p-3 font-Poppins">
      <div className="flex items-center justify-center gap-2">
        <p className="text-lg font-normal">{impersonateUser.data?.email}</p>
        {impersonateUser.data && (
          <button
            onClick={() =>
              handleStopImpersonate({
                email: impersonateUser.data?.email as string,
              })
            }
            className=" rounded-md bg-gray-800 px-3 py-1 font-semibold  
         text-white transition hover:bg-gray-900 active:scale-105"
          >
            Stop Impersonate
          </button>
        )}
      </div>
    </nav>
  );
}

export default ImpersonateNavBar;
