import React from "react";
import { GrFormClose } from "react-icons/gr";
import * as crypto from "crypto";
import { IoMdClose } from "react-icons/io";
import { FiPlus } from "react-icons/fi";
import SpinLoading from "../loadings/spinLoading";
import { useCreateSimCard } from "../../react-query";
import { ErrorMessages } from "../../models";
import Swal from "sweetalert2";

type Props = {
  onClose: () => void;
};
function AddSimCardFromExcel({ onClose }: Props) {
  const create = useCreateSimCard();
  const [textData, setTextData] = React.useState("");
  const tableRef = React.useRef<HTMLDivElement>(null);
  const [simcardData, setSimcardData] = React.useState<
    { id: string; phoneNumber: string; iccid: string; error?: string }[]
  >([]);
  const [loading, setLoading] = React.useState(false);
  const [successLists, setSuccessList] = React.useState<
    {
      id: string;
      phoneNumber: string;
      iccid: string;
    }[]
  >([]);
  const [errorLists, setErrorList] = React.useState<
    {
      id: string;
      phoneNumber: string;
      iccid: string;
      error: string;
    }[]
  >([]);

  React.useEffect(() => {
    if (textData === "") {
      setSimcardData([]);
      setErrorList([]);
      setSuccessList([]);
      return;
    }

    const data = textData.split("\n").map((item) => {
      const [iccid, phoneNumber] = item.split("\t");
      return {
        id: crypto.randomBytes(16).toString("hex"),
        iccid,
        phoneNumber,
      };
    });

    setSimcardData(data.filter((item) => item.phoneNumber && item.iccid));
  }, [textData]);
  const handleCreateSimCard = async () => {
    setLoading(true);
    setErrorList([]);
    setSuccessList([]);
    for (const item of simcardData) {
      try {
        const data = await create.mutateAsync({
          phoneNumber: item.phoneNumber,
          iccid: item.iccid,
        });
        setSuccessList((prev) => [...prev, item]);
      } catch (error) {
        let result = error as ErrorMessages;
        setSimcardData((prev) => {
          return prev.map((sim) =>
            sim.id === item.id ? { ...sim, error: result?.message } : sim,
          );
        });
        setErrorList((prev) => [...prev, { ...item, error: result?.message }]);
      }
    }
    setLoading(false);
    Swal.fire({
      title: "Add Sim Card From Excel",
      text: "Add sim card from excel successfully",
      footer: "You can check fail list on the console",
      icon: "success",
      confirmButtonText: "Ok",
    });
  };
  return (
    <div className="h-5/6 overflow-hidden rounded-md bg-white p-3 font-Poppins xl:w-5/12">
      <div className="flex items-center justify-between border-b pb-2">
        <h2 className="text-lg font-bold">Add Sim Card From Excel</h2>
        <button
          onClick={() => {
            document.body.style.overflow = "auto";
            onClose();
          }}
          className="flex h-7 w-7 items-center justify-center rounded-md border hover:bg-gray-100"
        >
          <GrFormClose />
        </button>
      </div>
      <div className="mt-5 flex flex-col">
        {simcardData.length > 0 ? (
          <div ref={tableRef} className="h-96 w-full overflow-auto">
            <table className="w-max min-w-full">
              <thead>
                <tr className="sticky top-0 h-10 bg-gray-200">
                  <th className="text-left">ICCID</th>
                  <th className="text-left">Phone Number</th>
                  <th className="text-left">Action</th>
                  <th className="text-left">ERROR MESSAGE</th>
                </tr>
              </thead>

              <tbody>
                {simcardData.map((item, index, array) => (
                  <ListPhoneNumber
                    tableRef={tableRef}
                    length={array.length}
                    index={index}
                    data={item}
                    key={index}
                    setData={setSimcardData}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <>
            <textarea
              value={textData}
              onChange={(e) => setTextData(e.target.value)}
              className=" mt-2 h-96 w-full resize-none rounded-md border p-2"
              placeholder="Paste your excel data here"
            ></textarea>
            <span className="text-sm text-red-500">
              **Please make sure the data is in the correct format. The data
              must be in the following format: | ICCID | Phone Number |
            </span>
          </>
        )}
      </div>
      {simcardData.length > 0 && (
        <div className="mt-5 flex w-full  items-center justify-start gap-3 ">
          <button
            disabled={loading}
            onClick={async () => {
              await handleCreateSimCard();
              console.error("fail", errorLists);
            }}
            className=" flex h-10 w-32 items-center justify-center rounded-md
         bg-blue-500 p-1 text-white transition hover:bg-blue-600 active:scale-105"
          >
            {loading ? <SpinLoading /> : "Add Sim Card"}
          </button>
          <div className="flex h-full flex-col items-center ">
            <div className="flex w-full items-center justify-center gap-2 border-b pb-1">
              <div className="font-semibold text-green-600">
                {successLists.length.toLocaleString()} success
              </div>
              <div className="font-semibold text-red-600">
                {errorLists.length.toLocaleString()} fail
              </div>
            </div>
            <span className="font-semibold">{simcardData.length} total</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddSimCardFromExcel;

type ListPhoneNumberProps = {
  tableRef: React.RefObject<HTMLDivElement>;
  length: number;
  data: { id: string; phoneNumber: string; iccid: string; error?: string };
  setData: React.Dispatch<
    React.SetStateAction<
      {
        id: string;
        phoneNumber: string;
        iccid: string;
      }[]
    >
  >;
  index: number;
};
const ListPhoneNumber = React.memo(
  ({ data, setData, index, length, tableRef }: ListPhoneNumberProps) => {
    return (
      <tr key={data.id}>
        <td>
          <input
            value={data.phoneNumber}
            onChange={(e) => {
              setData((prev) =>
                prev.map((item) =>
                  item.id === data.id
                    ? { ...item, phoneNumber: e.target.value }
                    : item,
                ),
              );
            }}
            className="h-10 w-40 rounded-md border p-1 "
          />
        </td>
        <td>
          <input
            value={data.iccid}
            onChange={(e) => {
              setData((prev) =>
                prev.map((item) =>
                  item.id === data.id
                    ? { ...item, iccid: e.target.value }
                    : item,
                ),
              );
            }}
            className="h-10 w-40 rounded-md border p-1 "
          />
        </td>
        <td>
          <div className="flex items-center justify-start gap-2 px-5">
            <button
              title="Delete Row"
              type="button"
              className="rounded bg-red-100 p-1 text-red-500"
              onClick={() => {
                setData((prev) => {
                  return prev.filter((simPrev) => simPrev.id !== data.id);
                });
              }}
            >
              <IoMdClose />
            </button>

            {length - 1 === index && (
              <button
                title="Add Row"
                type="button"
                className="rounded bg-green-100 p-1 text-green-500"
                onClick={() => {
                  setData((prev) => {
                    return [
                      ...prev,
                      {
                        id: crypto.randomBytes(16).toString("hex"),
                        phoneNumber: "",
                        iccid: "",
                      },
                    ];
                  });

                  setTimeout(() => {
                    tableRef.current?.scrollTo({
                      top: tableRef.current.scrollHeight,
                      behavior: "smooth",
                    });
                  }, 200);
                }}
              >
                <FiPlus />
              </button>
            )}
          </div>
        </td>
        <td>
          <span className="w-max text-red-500">{data?.error}</span>
        </td>
      </tr>
    );
  },
);

ListPhoneNumber.displayName = "ListPhoneNumber";
