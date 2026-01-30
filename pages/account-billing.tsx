import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { parseCookies } from "nookies";
import { useState } from "react";
import { BsPlusCircleFill } from "react-icons/bs";
import { FaEdit, FaWallet } from "react-icons/fa";
import DashboardLayout from "../layouts/dashboardLayout";
import { ErrorMessages, User } from "../models";
import { GetUser } from "../services/admin/user";
import { formatUSDCurrency } from "../utils";
import RecentTransaction from "../components/billing/RecentTransaction";
import { useRefundOxypoint, useTopupOxypoint } from "../react-query";
import Swal from "sweetalert2";
import { RiRefundFill } from "react-icons/ri";
import SummaryTransaction from "../components/billing/SummaryTransaction";

type Props = {
  user: User;
};
function Index({ user }: Props) {
  const [selectedAmount, setSelectedAmount] = useState<number | "custom">(25);
  const [customAmount, setCustomAmount] = useState<number | "">("");
  const checkout = useTopupOxypoint();
  const refund = useRefundOxypoint();
  const current_money = formatUSDCurrency(user.oxyclick_points);
  const quickAmounts = [
    { amount: 25, label: "Quick top-up" },
    { amount: 50, label: "Popular choice" },
    { amount: 100, label: "Most common" },
    { amount: 200, label: "Great value" },
    { amount: 500, label: "High amount" },
  ];

  const handleTopup = async () => {
    try {
      let amount: number = 0;

      if (customAmount !== "") {
        amount = customAmount;
      }

      if (selectedAmount !== "custom") {
        amount = selectedAmount;
      }

      if (amount < 1) {
        throw new Error("Please topup money more than 1 dollar");
      }
      const url = await checkout.mutateAsync({
        amount: amount * 100,
      });
      window.location.href = url;
    } catch (error) {
      let result = error as ErrorMessages;
      Swal.fire({
        title: result.error,
        text: result.message.toString(),
        footer: "Error Code :" + result.statusCode?.toString(),
        icon: "error",
      });
    }
  };

  const handleRefund = async () => {
    const replacedText = "I want to refund";
    let content = document.createElement("div");
    content.innerHTML =
      "<div>Please type this</div> <strong>" +
      replacedText +
      "</strong> <div>to confirm refunding</div>";
    const { value } = await Swal.fire({
      title: "REFUND",
      input: "text",
      footer: "Please keep it mind if process this action, it cannot be undone",
      html: content,
      showCancelButton: true,
      inputValidator: (value) => {
        if (value !== replacedText) {
          return "Please Type Correctly";
        }
      },
    });
    if (value) {
      try {
        Swal.fire({
          html: "Loading....",
          allowEscapeKey: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        await refund.mutateAsync();
        Swal.fire(
          "Refund Success",
          "Your refund is completed, the money will arrive at your bank account 7 - 15 business days",
          "success",
        ).then((value) => {
          window.location.reload();
        });
      } catch (error) {
        let result = error as ErrorMessages;
        Swal.fire({
          title: result.error,
          text: result.message.toString(),
          footer: "Error Code :" + result.statusCode?.toString(),
          icon: "error",
        });
      }
    }
  };

  return (
    <DashboardLayout user={user}>
      <div className="min-h-screen bg-gray-100 p-8 font-sans">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Add Money to Wallet
              </h1>
              <p className="mt-1 text-gray-600">
                Choose your preferred amount and payment method
              </p>
            </div>
            <div className="flex items-center space-x-3 rounded-xl bg-white p-4 shadow-md">
              <div className="rounded-full bg-blue-100 p-2">
                <FaWallet className="text-xl text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Current Balance</p>
                <p className="text-lg font-bold text-gray-800">
                  {current_money}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Amount Selection */}
          <div className="mb-2 rounded-xl bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">
              Quick Amount Selection
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
              {quickAmounts.map((item) => (
                <button
                  key={item.amount}
                  className={`flex flex-col items-center justify-center rounded-lg border-2 p-4 transition-all duration-200
                  ${selectedAmount === item.amount ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 bg-white hover:border-blue-300"}`}
                  onClick={() => setSelectedAmount(item.amount)}
                >
                  <span className="text-lg font-bold">${item.amount}</span>
                  <span className="mt-1 text-xs text-gray-500">
                    {item.label}
                  </span>
                </button>
              ))}
              <button
                className={`flex flex-col items-center justify-center rounded-lg border-2 p-4 transition-all duration-200
                ${selectedAmount === "custom" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 bg-white hover:border-blue-300"}`}
                onClick={() => setSelectedAmount("custom")}
              >
                <FaEdit className="mb-1 text-xl" />
                <span className="text-lg font-bold">Custom</span>
              </button>
            </div>
          </div>

          {/* Enter Custom Amount */}
          {selectedAmount === "custom" && (
            <div className="mb-2 rounded-xl bg-white  p-6 shadow-md">
              <h2 className="mb-4 text-xl font-semibold text-gray-800">
                Enter Custom Amount
              </h2>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-medium text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(parseFloat(e.target.value))}
                  min="1"
                  max="10000"
                  placeholder="0.00"
                  className="w-full rounded-lg border border-gray-300 py-3 pl-8 pr-4 text-lg font-medium focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mt-2 flex justify-between text-sm text-gray-500">
                <span>Minimum: $1.00</span>
                <span>Maximum: $10,000.00</span>
              </div>
            </div>
          )}

          <div className="flex w-full items-center justify-start gap-3">
            <button
              disabled={checkout.isPending}
              onClick={handleTopup}
              className="mb-8 flex w-60 items-center justify-center gap-2 rounded-xl bg-white p-2 px-4 font-semibold text-icon-color shadow-md hover:bg-icon-color hover:text-white active:scale-105"
            >
              <BsPlusCircleFill className="text-xl" />
              {checkout.isPending ? "..Loading" : "Topup Money"}
            </button>
            <button
              disabled={refund.isPending}
              onClick={handleRefund}
              className="mb-8 flex w-60 items-center justify-center gap-2 rounded-xl bg-red-400 p-2 px-4 font-semibold text-white shadow-md hover:bg-red-600 hover:text-white active:scale-105"
            >
              <RiRefundFill className="text-xl" />
              {refund.isPending ? "..Loading" : "Refund Money"}
            </button>
          </div>
          <RecentTransaction />
          <SummaryTransaction user={user} />
        </div>
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
