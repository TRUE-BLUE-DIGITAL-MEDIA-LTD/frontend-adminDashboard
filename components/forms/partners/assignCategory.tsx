import React, { useEffect, useState } from "react";
import { Category, ErrorMessages, Partner, SimCard } from "../../../models";
import { useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { Form, Input, SearchField, TextArea } from "react-aria-components";
import { GetAllCategories } from "../../../services/admin/categories";
import {
  CreateCategoryOnPartnerService,
  DeleteCategoryOnPartnerService,
  GetCategoryPartnerByPartnerIdService,
} from "../../../services/categoryOnPartner";

type AssignCategoryProps = {
  selectPartner: Partner;
  setTriggerAssignCategory: (value: React.SetStateAction<boolean>) => void;
};
function AssignCategory({
  selectPartner,
  setTriggerAssignCategory,
}: AssignCategoryProps) {
  const [searchField, setSearchField] = useState<string>("");
  const [categoryOnPartnerData, setCategoryOnPartnerData] = useState<
    (Category & {
      isLoading: boolean;
      isChecking: boolean;
    })[]
  >([]);
  const [page, setPage] = useState<number>(1);

  const categoryOnPartners = useQuery({
    queryKey: ["categoryOnPartner", { partnerId: selectPartner.id }],
    queryFn: () =>
      GetCategoryPartnerByPartnerIdService({
        partnerId: selectPartner.id,
      }),
  });

  const categorys = useQuery({
    queryKey: ["categorys"],
    queryFn: () => GetAllCategories(),
  });

  useEffect(() => {
    categorys.refetch();
  }, []);

  useEffect(() => {
    if (categorys.data && categoryOnPartners.data) {
      setCategoryOnPartnerData(() => {
        return [
          ...categorys.data.map((category) => {
            return {
              ...category,
              isLoading: false,
              isChecking:
                categoryOnPartners.data?.some(
                  (categoryOnPartner) =>
                    categoryOnPartner.categoryId === category.id,
                ) ?? false,
            };
          }),
        ];
      });
    }
  }, [categoryOnPartners.data, categorys.data]);
  const handleAssignCategory = async ({
    partnerId,
    categoryId,
  }: {
    partnerId: string;
    categoryId: string;
  }) => {
    try {
      setCategoryOnPartnerData((prev) => {
        if (!prev) return prev;
        return [
          ...prev.map((category) => {
            if (category.id === categoryId) {
              return {
                ...category,
                isLoading: true,
              };
            }
            return category;
          }),
        ];
      });

      await CreateCategoryOnPartnerService({
        categoryId: categoryId,
        partnerId: partnerId,
      });
      await categoryOnPartners.refetch();

      setCategoryOnPartnerData((prev) => {
        if (!prev) return prev;
        return [
          ...prev.map((category) => {
            if (category.id === categoryId) {
              return {
                ...category,
                isLoading: false,
              };
            }
            return category;
          }),
        ];
      });
    } catch (error) {
      setCategoryOnPartnerData((prev) => {
        if (!prev) return prev;
        return [
          ...prev.map((category) => {
            if (category.id === categoryId) {
              return {
                ...category,
                isLoading: false,
              };
            }
            return category;
          }),
        ];
      });
      console.log(error);
      let result = error as ErrorMessages;
      Swal.fire({
        title: result.error,
        text: result.message.toString(),
        footer: "Error Code :" + result.statusCode?.toString(),
        icon: "error",
      });
    }
  };

  const handleDeleteCategoryOnPartner = async ({
    categoryId,
    categoryOnPartnerId,
  }: {
    categoryId: string;
    categoryOnPartnerId: string;
  }) => {
    try {
      setCategoryOnPartnerData((prev) => {
        if (!prev) return prev;
        return [
          ...prev.map((category) => {
            if (category.id === categoryId) {
              return {
                ...category,
                isLoading: true,
              };
            }
            return category;
          }),
        ];
      });

      await DeleteCategoryOnPartnerService({
        categoryOnPartnerId: categoryOnPartnerId,
      });
      await categoryOnPartners.refetch();
      setCategoryOnPartnerData((prev) => {
        if (!prev) return prev;
        return [
          ...prev.map((category) => {
            if (category.id === categoryId) {
              return {
                ...category,
                isLoading: false,
              };
            }
            return category;
          }),
        ];
      });
    } catch (error) {
      setCategoryOnPartnerData((prev) => {
        if (!prev) return prev;
        return [
          ...prev.map((category) => {
            if (category.id === categoryId) {
              return {
                ...category,
                isLoading: false,
              };
            }
            return category;
          }),
        ];
      });
      console.log(error);
      let result = error as ErrorMessages;
      Swal.fire({
        title: result.error,
        text: result.message.toString(),
        footer: "Error Code :" + result.statusCode?.toString(),
        icon: "error",
      });
    }
  };
  return (
    <div className="fixed bottom-0 left-0 right-0 top-0 z-50 flex h-screen w-screen  items-center justify-center gap-5 font-Poppins ">
      <Form className="flex h-[30rem] w-max flex-col items-center justify-start gap-2 rounded-xl bg-white p-7">
        <section className="flex h-max w-full flex-col items-center justify-start gap-5 rounded-lg  p-2 ring-2 ring-slate-300  md:w-max md:p-5">
          <header className="flex w-full flex-col items-center justify-center gap-2 ">
            <h1 className="flex w-full justify-center font-bold md:text-xl">
              Assign Category {selectPartner.name}
            </h1>
            {/* <SearchField
              value={searchField}
              onChange={(e) => {
                setSearchField(() => e);
              }}
              className="relative flex w-80 flex-col"
            >
              <Input
                placeholder="Search Phone Number Or Note"
                className=" bg-fourth-color h-10 appearance-none rounded-lg p-5 pl-10  outline-0 ring-2 ring-icon-color lg:w-full"
              />
              <IoSearchCircleSharp className="text-super-main-color absolute bottom-0 left-2 top-0 m-auto text-3xl" />
            </SearchField> */}
          </header>

          <div className=" h-60 w-[30rem] justify-center overflow-auto  ">
            <table className=" w-full table-auto ">
              <thead className="sticky top-0 z-20 h-14 border-b-2 border-black bg-gray-200 font-bold text-blue-700   drop-shadow-md ">
                <tr className=" h-14 w-full border-slate-400 font-normal  text-slate-600">
                  <th>Category</th>
                  <th>Assing Category</th>
                </tr>
              </thead>
              <tbody>
                {categorys.isLoading || categoryOnPartners.isLoading
                  ? [...Array(5)].map((_, index) => (
                      <tr key={index}>
                        <td className="h-10 w-20 animate-pulse border-4 border-transparent bg-gray-400 "></td>
                        <td className="h-10 w-20 animate-pulse border-4 border-transparent bg-gray-200 "></td>
                      </tr>
                    ))
                  : categoryOnPartnerData?.map((category) => {
                      const createAt = new Date(category?.createAt);
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
                          className=" h-12 border-b-[0.1px] border-gray-600 py-5 hover:bg-gray-200"
                          key={category.id}
                        >
                          <td className="h-10 truncate border-4 border-transparent font-semibold text-black">
                            {category.title}
                          </td>
                          <td className="truncate border-4 border-transparent  font-semibold text-black">
                            <div className="flex items-center justify-center">
                              {category.isLoading ? (
                                <div className="h-5 w-5 animate-pulse rounded-lg bg-slate-300"></div>
                              ) : (
                                <input
                                  onChange={(e) => {
                                    if (e.target.checked === true) {
                                      handleAssignCategory({
                                        partnerId: selectPartner.id,
                                        categoryId: category.id,
                                      });
                                    } else if (e.target.checked === false) {
                                      handleDeleteCategoryOnPartner({
                                        categoryId: category.id,
                                        categoryOnPartnerId:
                                          categoryOnPartners.data?.find(
                                            (categoryOnPartner) =>
                                              categoryOnPartner.categoryId ===
                                              category.id,
                                          )?.id || "",
                                      });
                                    }
                                  }}
                                  checked={category.isChecking}
                                  type="checkbox"
                                  className="h-5 w-5"
                                />
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>
        </section>
      </Form>

      <footer
        onClick={() => {
          setTriggerAssignCategory(() => false);
          document.body.style.overflow = "auto";
        }}
        className="fixed bottom-0 left-0 right-0 top-0 -z-10 h-screen w-screen bg-black/50 "
      ></footer>
    </div>
  );
}

export default AssignCategory;
