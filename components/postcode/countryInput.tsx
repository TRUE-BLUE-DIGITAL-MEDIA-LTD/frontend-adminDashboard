import React, { Fragment } from "react";
import { Combobox, Transition } from "@headlessui/react";
import { FaAngleDown, FaCheck } from "react-icons/fa6";
import { Country } from "./postcode";

interface CountryInput {
  handleChangeQueryPostcode: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setQueryPostcode: React.Dispatch<
    React.SetStateAction<{
      country: string;
      province: string;
    }>
  >;
  setSelected: React.Dispatch<
    React.SetStateAction<{
      country: Country;
      province: string;
    }>
  >;
  selected: {
    country: Country;
    province: string;
  };
  queryPostcode: {
    country: string;
    province: string;
  };
  countries: Country[];
}

function CountryInput({
  handleChangeQueryPostcode,
  setQueryPostcode,
  setSelected,
  selected,
  queryPostcode,
  countries,
}: CountryInput) {
  const filteredCountries =
    queryPostcode.country === ""
      ? countries
      : countries.filter((country) =>
          country.name
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(queryPostcode.country.toLowerCase().replace(/\s+/g, "")),
        );
  return (
    <Combobox
      value={selected.country}
      onChange={(country: Country) => {
        return setSelected((prev) => {
          return {
            ...prev,
            country: country,
          };
        });
      }}
    >
      <div className="relative mt-1 ">
        <label>Select A Country</label>
        <div className="relative w-80 cursor-default text-left shadow-md ">
          <Combobox.Input
            name="country"
            className="w-full appearance-none rounded-md border-none bg-white py-5 pl-3 pr-10 text-sm leading-5 text-black ring-2 ring-black focus:bg-icon-color"
            displayValue={(country: Country) => {
              return country.name;
            }}
            onChange={handleChangeQueryPostcode}
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
            <FaAngleDown />
          </Combobox.Button>
        </div>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterLeave={() =>
            setQueryPostcode((prev) => {
              return {
                ...prev,
                country: "",
              };
            })
          }
        >
          <Combobox.Options className="absolute z-40 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
            {filteredCountries.length === 0 && queryPostcode.country !== "" ? (
              <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                Nothing found.
              </div>
            ) : (
              filteredCountries.map((person) => (
                <Combobox.Option
                  key={person.id}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? "bg-icon-color text-white" : "text-gray-900"
                    }`
                  }
                  value={person}
                >
                  {({ selected, active }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? "font-medium" : "font-normal"
                        }`}
                      >
                        {person.name}
                      </span>
                      {selected ? (
                        <span
                          className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                            active ? "text-white" : "text-teal-600"
                          }`}
                        >
                          <FaCheck />
                        </span>
                      ) : null}
                    </>
                  )}
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </Transition>
      </div>
    </Combobox>
  );
}

export default CountryInput;
