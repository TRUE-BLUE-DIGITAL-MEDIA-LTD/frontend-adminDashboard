import React, { useState } from "react";
import { ErrorMessages, Pagination, Partner, User } from "../../../models";
import { MdCheck, MdCheckBox, MdClear, MdSettings } from "react-icons/md";
import { UseQueryResult } from "@tanstack/react-query";
import { UpdatePartnerService } from "../../../services/admin/partner";
import Swal from "sweetalert2";

type Props = {
  selectPartner: Partner;
  partners: UseQueryResult<
    Pagination<
      Partner & {
        user: User;
      }
    >,
    Error
  >;
};

function UpdatePermissionPartner({ selectPartner, partners }: Props) {
  const [permissionLists, setPermissionLists] = useState([
    {
      title: "Allow Using SMS Pva",
      allow: selectPartner.isAllowUsingSMSPVA,
      slug: "isAllowUsingSMSPVA",
    },
    {
      title: "Allow Using Oxy Text",
      allow: selectPartner.isAllowUsingSMS_TEXTVERIFIED,
      slug: "isAllowUsingSMS_TEXTVERIFIED",
    },
    {
      title: "Allow Using SMS Pool",
      allow: selectPartner.isAllowUsingSMSPOOL,
      slug: "isAllowUsingSMSPOOL",
    },
    {
      title: "Allow Manage SMS Pool Account",
      allow: selectPartner.isAllowSmsPoolAccount,
      slug: "isAllowSmsPoolAccount",
    },
    {
      title: "Allow Using SmsPin",
      allow: selectPartner.isAllowUsingSMS_Pinverify,
      slug: "isAllowUsingSMS_Pinverify",
    },
    {
      title: "Allow Manage SMS Pin Account",
      allow: selectPartner.isAllowSmsPinverifyAccount,
      slug: "isAllowSmsPinverifyAccount",
    },
  ]);

  const handleUpdatePermission = async (slug: string, isAllow: boolean) => {
    try {
      await UpdatePartnerService({
        query: {
          partnerId: selectPartner.id,
        },
        body: {
          [slug]: isAllow,
        },
      });
      await partners.refetch();
    } catch (error) {
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
    <div className="h-96 w-96 rounded-lg border bg-white p-5 md:w-10/12 lg:w-7/12">
      <h1 className="flex items-center justify-start gap-2 border-b text-lg font-semibold text-gray-800">
        <MdSettings /> Update Permission
      </h1>
      <ul className="mt-5 grid w-full grid-cols-2 gap-3">
        {permissionLists.map((permission, index) => {
          if (permission.allow === true) {
            return (
              <button
                key={index}
                onClick={async () => {
                  setPermissionLists((prev) => {
                    return prev.map((p) => {
                      if (p.slug !== permission.slug) {
                        return p;
                      }
                      return { ...p, allow: false };
                    });
                  });
                  await handleUpdatePermission(permission.slug, false);
                }}
                className="flex w-full items-center justify-between gap-2  rounded-lg border bg-green-300 p-2 text-green-700 hover:scale-105 active:scale-110"
              >
                <span>{permission.title}</span>
                <MdCheck />
              </button>
            );
          }
          return (
            <button
              key={index}
              onClick={async () => {
                setPermissionLists((prev) => {
                  return prev.map((p) => {
                    if (p.slug !== permission.slug) {
                      return p;
                    }
                    return { ...p, allow: true };
                  });
                });
                await handleUpdatePermission(permission.slug, true);
              }}
              className="flex w-full items-center justify-between gap-2 rounded-lg border bg-gray-200 p-2 text-gray-800 hover:scale-105 active:scale-110"
            >
              <span>{permission.title}</span>
              <MdClear />
            </button>
          );
        })}
      </ul>
    </div>
  );
}

export default UpdatePermissionPartner;
