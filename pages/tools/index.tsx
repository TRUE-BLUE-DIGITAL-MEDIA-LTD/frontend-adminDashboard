import React, { useEffect, useState } from "react";
import { User } from "../../models";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { parseCookies } from "nookies";
import { GetUser } from "../../services/admin/user";
import countries from "../../data/postcode/countries.json";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  GetPostalCodesByStateService,
  GetProvincesInCountryService,
} from "../../services/tools/postcode";
import DashboardLayout from "../../layouts/dashboardLayout";
import { toolsData } from "../../data/tools";
import CountryInput from "../../components/postcode/countryInput";
import ProvinceInput from "../../components/postcode/provinceInput";
import { Skeleton } from "@mui/material";
import { loadingNumber } from "../../data/loadingNumber";
import Cities from "../../components/postcode/cities";
export interface Country {
  id: number;
  alpha2: string;
  alpha3: string;
  name: string;
}
function Index({ user }: { user: User }) {
  const [queryPostcode, setQueryPostcode] = useState({
    country: "",
    province: "",
  });
  const [selected, setSelected] = useState<{
    country: Country;
    province: string;
  }>({
    country: countries.find((country) => country.id === 826) as Country,
    province: "",
  });

  const provinces = useQuery({
    queryKey: ["provinces", selected.country.id],
    queryFn: () =>
      GetProvincesInCountryService({ countryCode: selected.country.alpha2 }),
    placeholderData: keepPreviousData,
  });

  const postalCodes = useQuery({
    queryKey: ["postalCodes"],
    queryFn: () =>
      GetPostalCodesByStateService({
        country: selected.country.alpha2,
        state_name: selected.province,
      }),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (selected.province && selected.country) {
      postalCodes.refetch();
    }
  }, [selected.province, selected.country]);

  useEffect(() => {
    if (selected.country) {
      provinces.refetch();
      setQueryPostcode((prev) => {
        return {
          ...prev,
          province: "",
        };
      });
      setSelected((prev) => {
        return {
          ...prev,
          province: "",
        };
      });
    }
  }, [selected.country]);

  const handleChangeQueryPostcode = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setQueryPostcode((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };
  return (
    <DashboardLayout user={user}>
      <header className="w-full mt-40 font-Poppins flex-col gap-10 flex items-center justify-center">
        <ul>
          {toolsData.map((tool, index) => {
            return (
              <li
                className={`flex flex-col bg-white text-black select-none hover:text-white active:ring-2 ring-black hover:scale-110 transition duration-100
             hover:bg-main-color cursor-pointer justify-center items-center p-3 gap-2 w-72 h-28 
            py-4 rounded-xl drop-shadow-lg`}
                key={index}
              >
                <h3 className="text-lg flex justify-center items-center gap-2 font-semibold">
                  {tool.title} {<tool.icon />}
                </h3>
                <span className="text-center text-sm">{tool.description}</span>
              </li>
            );
          })}
        </ul>
        <section className="flex gap-5 flex-col items-center justify-center">
          <CountryInput
            handleChangeQueryPostcode={handleChangeQueryPostcode}
            setQueryPostcode={setQueryPostcode}
            setSelected={setSelected}
            selected={selected}
            queryPostcode={queryPostcode}
            countries={countries}
          />
          {provinces.isFetching ? (
            <Skeleton width="100%" height={100} />
          ) : (
            provinces.data && (
              <ProvinceInput
                handleChangeQueryPostcode={handleChangeQueryPostcode}
                setQueryPostcode={setQueryPostcode}
                setSelected={setSelected}
                selected={selected}
                queryPostcode={queryPostcode}
                provinces={provinces.data}
              />
            )
          )}
        </section>
      </header>
      <main className="flex w-full justify-center mb-5">
        {postalCodes.isFetching ? (
          <ul className="w-10/12  grid grid-cols-5 gap-5">
            {loadingNumber.map((list) => {
              return <Skeleton animation="wave" key={list} height={200} />;
            })}
          </ul>
        ) : (
          postalCodes.data && <Cities cities={postalCodes.data} />
        )}
      </main>
    </DashboardLayout>
  );
}

export default Index;

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  try {
    const cookies = parseCookies(context);
    const accessToken = cookies.access_token;
    const user = await GetUser({ access_token: accessToken });
    return {
      props: {
        user,
      },
    };
  } catch (err) {
    return {
      redirect: {
        permanent: false,
        destination: "/auth/sign-in",
      },
    };
  }
};
