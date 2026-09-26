import React, { useState } from "react";
import { ErrorMessages, Pagination, Partner, User } from "../../../models";
import { MdCheck, MdCheckBox, MdClear, MdSettings } from "react-icons/md";
import { UseQueryResult } from "@tanstack/react-query";
import { useGetUser } from "../../../react-query";
import { UpdatePartnerService } from "../../../services/admin/partner";
import Swal from "sweetalert2";

type Props = {
  selectPartner: Partner;
  partners: UseQueryResult<
    Pagination<
      Partner & {
        manager: User;
      }
    >,
    Error
  >;
};

function UpdatePermissionPartner({ selectPartner, partners }: Props) {
  const user = useGetUser();
  const [permissionLists, setPermissionLists] = useState([
    {
      title: "Allow Using Oxy Pva",
      allow: selectPartner.isAllowUsingSMSPVA,
      slug: "isAllowUsingSMSPVA",
    },
    {
      title: "Allow Using Oxy Text",
      allow: selectPartner.isAllowUsingSMS_TEXTVERIFIED,
      slug: "isAllowUsingSMS_TEXTVERIFIED",
    },
    {
      title: "Allow Using Oxy Pool",
      allow: selectPartner.isAllowUsingSMSPOOL,
      slug: "isAllowUsingSMSPOOL",
    },
    {
      title: "Allow Using Oxy BOW",
      allow: selectPartner.isAllowUsingSmsBower,
      slug: "isAllowUsingSmsBower",
    },
    {
      title: "Allow Using Oxy Berry",
      allow: selectPartner.isAllowUsingSmsBerry,
      slug: "isAllowUsingSmsBerry",
    },
    {
      title: "Allow Manage Oxy Pool Account",
      allow: selectPartner.isAllowSmsPoolAccount,
      slug: "isAllowSmsPoolAccount",
    },
    {
      title: "Allow Using Oxy Pin",
      allow: selectPartner.isAllowUsingSMS_Pinverify,
      slug: "isAllowUsingSMS_Pinverify",
    },
    {
      title: "Allow Manage Oxy Pin Account",
      allow: selectPartner.isAllowSmsPinverifyAccount,
      slug: "isAllowSmsPinverifyAccount",
    },
    {
      title: "Allow Using Oxy Virtual",
      allow: selectPartner.isAllowUsingSMS_Virtualsms,
      slug: "isAllowUsingSMS_Virtualsms",
    },
    {
      title: "Allow Manage Oxy Virtual Account",
      allow: selectPartner.isAllowSMS_VirtualsmsAccount,
      slug: "isAllowSMS_VirtualsmsAccount",
    },
    {
      title: "Allow Using Oxy Bulk",
      allow: selectPartner.isAllowUsingSmsBulk,
      slug: "isAllowUsingSmsBulk",
    },
    {
      title: "Allow Manage Oxy Bulk Account",
      allow: selectPartner.isAllowManageSmsBulkAccount,
      slug: "isAllowManageSmsBulkAccount",
    },
    {
      title: "Allow Manage Oxy Berry Account",
      allow: selectPartner.isAllowSmsDaisyAccount,
      slug: "isAllowSmsDaisyAccount",
    },
    {
      title: "Allow Using OxyGT",
      allow: selectPartner.isAllowUsingSmsGetatext,
      slug: "isAllowUsingSmsGetatext",
    },
    {
      title: "Allow Manage OxyGT Account",
      allow: selectPartner.isAllowManageSmsGetatextAccount,
      slug: "isAllowManageSmsGetatextAccount",
    },
    {
      title: "Allow Manage Partner",
      allow: selectPartner.isAllowManagePartner,
      slug: "isAllowManagePartner",
    },
    {
      title: "Allow Bonus System",
      allow: selectPartner.isAllowBonuSystem,
      slug: "isAllowBonuSystem",
    },
    {
      title: "Allow Cloud Phone",
      allow: selectPartner.isAllowCloudPhone,
      slug: "isAllowCloudPhone",
    },
    {
      title: "Allow Manage Domain",
      allow: selectPartner.isAllowDomainManage,
      slug: "isAllowDomainManage",
    },
    {
      title: "Allow Manage Landing Page",
      allow: selectPartner.isAllowLandingPageManage,
      slug: "isAllowLandingPageManage",
    },
    {
      title: "Allow Manage Oxy Sms",
      allow: selectPartner.isAllowOxySms,
      slug: "isAllowOxySms",
    },
    {
      title: "Allow show wallet",
      allow: selectPartner.isShowWallet,
      slug: "isShowWallet",
    },
    {
      title: "Allow Create Domain",
      allow: selectPartner.isAllowCreateDomain,
      slug: "isAllowCreateDomain",
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
    <ul className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
      {permissionLists.map((permission, index) => {
        if (
          permission.slug === "isAllowCreateDomain" &&
          user.data?.role !== "admin"
        ) {
          return null;
        }

        if (permission.allow === true) {
          return (
            <button
              key={index}
              type="button"
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
              className="flex w-full items-center justify-between gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-left text-sm text-emerald-300 transition hover:bg-emerald-500/20"
            >
              <span>{permission.title}</span>
              <MdCheck className="shrink-0" />
            </button>
          );
        }
        return (
          <button
            key={index}
            type="button"
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
            className="flex w-full items-center justify-between gap-2 rounded-xl border border-line bg-panel-raised px-3 py-2.5 text-left text-sm text-fg-muted transition hover:bg-hover"
          >
            <span>{permission.title}</span>
            <MdClear className="shrink-0" />
          </button>
        );
      })}
    </ul>
  );
}


export default UpdatePermissionPartner;
