import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { Form } from "react-aria-components";
import Swal from "sweetalert2";
import { Category, ErrorMessages, Partner } from "../../../models";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-Poppins">
      <Form className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-line bg-panel text-fg shadow-2xl">
        <header className="flex shrink-0 items-center justify-between border-b border-line px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-fg">Assign category</h2>
            <p className="text-xs text-fg-subtle">{selectPartner.name}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setTriggerAssignCategory(() => false);
              document.body.style.overflow = "auto";
            }}
            className="rounded-lg px-2 py-1 text-fg-muted hover:bg-hover hover:text-fg"
            aria-label="Close"
          >
            ✕
          </button>
        </header>
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-4 sm:px-6">
          {categorys.isLoading || categoryOnPartners.isLoading
            ? [...Array(5)].map((_, index) => (
                <div
                  key={index}
                  className="h-14 animate-pulse rounded-xl border border-line bg-panel-raised/60"
                />
              ))
            : categoryOnPartnerData?.map((category) => {
                return (
                  <label
                    key={category.id}
                    className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 transition ${
                      category.isChecking
                        ? "border-emerald-500/30 bg-emerald-500/10"
                        : "border-line bg-surface/30 hover:bg-hover"
                    }`}
                  >
                    <span className="font-medium text-fg">
                      {category.title}
                    </span>
                    {category.isLoading ? (
                      <div className="h-5 w-5 animate-pulse rounded bg-panel-raised" />
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
                        className="h-4 w-4 accent-main-color"
                      />
                    )}
                  </label>
                );
              })}
        </div>
      </Form>
      <footer
        onClick={() => {
          setTriggerAssignCategory(() => false);
          document.body.style.overflow = "auto";
        }}
        className="fixed inset-0 -z-10 bg-scrim"
      ></footer>
    </div>
  );
}


export default AssignCategory;
