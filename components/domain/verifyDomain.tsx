import { useQuery } from "@tanstack/react-query";
import React from "react";
import { VerifyDomainService } from "../../services/netlify/dns";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

function VerifyDomain({ domainName }: { domainName: string }) {
  const verify = useQuery({
    queryKey: ["verifyDomain", domainName],
    queryFn: () => VerifyDomainService({ domainName }),
    refetchInterval: 1000 * 10,
    staleTime: 1000 * 10,
  });
  return (
    <div className="font-Poppins">
      {verify.isLoading && (
        <div className="font-extrabold text-gray-600">Loading...</div>
      )}
      {verify.data?.results[0].result === true ? (
        <div className=" flex w-max  items-center  justify-center gap-2  rounded-lg bg-green-300 px-1 text-center font-bold uppercase  text-green-800">
          <FaCheckCircle />
          Netlify DNS
        </div>
      ) : (
        verify.data?.results[0].result === false && (
          <div className=" flex w-max items-center justify-center gap-2  rounded-lg bg-red-300 px-1 text-center font-bold uppercase  text-red-800">
            <FaTimesCircle />
            Verification Failed
          </div>
        )
      )}
    </div>
  );
}

export default VerifyDomain;
