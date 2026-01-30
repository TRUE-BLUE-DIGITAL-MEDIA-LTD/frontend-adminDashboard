import { IconType } from "react-icons";
import { Transaction, TransactionStatus, TransactionType } from "../../models";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { FaUndo } from "react-icons/fa";
import { formatCurrency, formatUSDCurrency } from "../../utils";
import { useGetTransacntionOxypoint } from "../../react-query";
import { FormEvent, useState } from "react";
import { Box, Button, Pagination, TextField } from "@mui/material";

const RecentTransaction: React.FC = () => {
  const [page, setPage] = useState(1);

  const getTransactionAppearance = (
    type: TransactionType,
  ): { Icon: IconType; colors: string } => {
    switch (type) {
      case TransactionType.TOPUP:
        return { Icon: FaPlus, colors: "bg-green-100 text-green-600" };
      case TransactionType.SPEND:
        return { Icon: FaMinus, colors: "bg-red-100 text-red-600" };
      case TransactionType.REFUND:
        return { Icon: FaUndo, colors: "bg-purple-100 text-purple-600" };
      default:
        return { Icon: FaPlus, colors: "bg-gray-100 text-gray-600" };
    }
  };

  const getAmountPrefix = (type: TransactionType): string => {
    return type === TransactionType.SPEND ? "-" : "+";
  };

  const getAmountColor = (
    type: TransactionType,
    status: TransactionStatus,
  ): string => {
    if (status === TransactionStatus.FAILED) return "text-red-500";
    if (type === TransactionType.SPEND) return "text-red-600";
    return "text-green-600";
  };

  const transactions = useGetTransacntionOxypoint({
    page: page,
    limit: 10,
  });
  const [jumpToPageInput, setJumpToPageInput] = useState("");

  const totalPage = transactions.data?.totalPage ?? 1;
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

  return (
    <div className="rounded-xl bg-white p-6 shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">
          Recent Transactions
        </h2>
      </div>
      <div className="space-y-3">
        {transactions.data?.data.map((tx) => {
          const { Icon, colors } = getTransactionAppearance(tx.type);
          const amountPrefix = getAmountPrefix(tx.type);
          const amountColor = getAmountColor(tx.type, tx.status);

          return (
            <div
              key={tx.id}
              className={`flex items-center justify-between rounded-lg p-3 transition-colors duration-200 ${tx.status === TransactionStatus.FAILED ? "bg-red-50" : "bg-gray-50 hover:bg-gray-100"}`}
            >
              {/* Left side: Icon + Text */}
              <div className="flex items-center space-x-4">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${colors}`}
                >
                  <Icon />
                </div>
                <div>
                  <div className="flex gap-1">
                    <div
                      className={`flex w-max items-center justify-center rounded-xl px-2 text-xs font-semibold text-gray-800 ${colors}`}
                    >
                      {tx.type}{" "}
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      {tx.detail}
                    </span>
                  </div>

                  <p className="font  text-sm text-gray-500">
                    {new Date(tx.createAt).toLocaleString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </p>
                </div>
              </div>
              {/* Right side: Amount + Fee */}
              <div className="text-right">
                <p className={`font-bold ${amountColor}`}>
                  {tx.status === TransactionStatus.FAILED
                    ? "Failed"
                    : `${amountPrefix}${formatUSDCurrency(tx.amount)}`}
                </p>
              </div>
            </div>
          );
        })}
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
    </div>
  );
};

export default RecentTransaction;
