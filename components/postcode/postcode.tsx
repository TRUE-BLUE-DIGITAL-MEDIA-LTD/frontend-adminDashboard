import React, { useEffect, useState } from "react";
import countries from "../../data/postcode/countries.json";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  GetPostalCodesByStateService,
  GetProvincesInCountryService,
} from "../../services/tools/postcode";
import CountryInput from "./countryInput";
import { Skeleton } from "@mui/material";
import ProvinceInput from "./provinceInput";
import { loadingNumber } from "../../data/loadingNumber";
import Cities from "./cities";

export interface Country {
  id: number;
  alpha2: string;
  alpha3: string;
  name: string;
}
function Postcode() {
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
    <div>
      <header className="w-full  font-Poppins flex-col gap-10 flex items-center justify-center">
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
    </div>
  );
}

export default Postcode;
