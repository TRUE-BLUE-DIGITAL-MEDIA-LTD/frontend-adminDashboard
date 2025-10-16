import Image from "next/image";
import React, { useEffect, useMemo } from "react";
import { Input, SearchField } from "react-aria-components";
import { FaRegCircle, FaRegCircleDot } from "react-icons/fa6";
import { IoSearchCircleSharp } from "react-icons/io5";
import { Countries, countries } from "../../data/country";

type SelectCountryProps = {
  selectCountry: string;
  onSelectCountry: (value: string) => void;
};
function SelectCountry({ selectCountry, onSelectCountry }: SelectCountryProps) {
  const originalCountries = useMemo(() => {
    return countries.filter((c) => c.sms_pva);
  }, []);
  const [query, setQuery] = React.useState<string>("");
  const [countriesData, setCountriesData] =
    React.useState<Countries>(originalCountries);
  const countryRef = React.useRef<HTMLLIElement>(null);
  const handleFilterCountry = (query: string) => {
    setQuery(query);
    if (query === "") {
      setCountriesData(originalCountries);
      return;
    }
    const filteredCountries = originalCountries.filter(
      (country) =>
        country.country.toLowerCase().includes(query.toLowerCase()) ||
        country.countryCode.toString().includes(query) ||
        country.code.includes(query),
    );

    setCountriesData(filteredCountries);
  };
  useEffect(() => {
    if (countryRef.current) {
      countryRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectCountry]);
  return (
    <section
      className="w-max rounded-lg border border-gray-100  bg-gradient-to-r 
 from-gray-50 to-gray-200 p-5 drop-shadow-xl"
    >
      <h2 className="text-lg font-semibold">Select Country</h2>
      <SearchField className="relative mb-2 flex w-full flex-col">
        <Input
          value={query}
          onChange={(e) => {
            handleFilterCountry(e.target.value);
          }}
          placeholder="Search Country"
          className="h-10 appearance-none rounded-md p-5 pl-10 outline-0  ring-1 ring-gray-500
       placeholder:text-sm lg:w-full"
        />
        <IoSearchCircleSharp className="text-super-main-color absolute bottom-0 left-2 top-0 m-auto text-3xl" />
      </SearchField>
      <ul className="flex h-96 w-96 flex-col gap-2 overflow-auto">
        {countriesData.map((country, index) => (
          <li
            ref={selectCountry === country.code ? countryRef : null}
            onClick={() => onSelectCountry(country.code as string)}
            key={index}
            className={`grid cursor-pointer grid-cols-4 items-center justify-between  
           hover:bg-gray-200 ${selectCountry === country.code ? "bg-gray-200" : ""}`}
          >
            <div className="relative h-10 w-10 overflow-hidden">
              <Image
                src={`/image/flags/1x1/${country.code}.svg`}
                fill
                alt="flag"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-contain"
              />
            </div>
            <div className="col-span-2 flex items-center justify-between gap-2">
              <span>{country.country}</span>
              <span className="text-xs text-gray-500">
                {country.countryCode}
              </span>
            </div>
            <div className="flex justify-end pr-5">
              {selectCountry === country.code ? (
                <FaRegCircleDot className="text-gray-800" />
              ) : (
                <FaRegCircle />
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default SelectCountry;
