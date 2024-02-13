import React, { Fragment } from "react";
import { DefinedQueryObserverResult } from "@tanstack/react-query";
import { ResponseGetProvincesInCountryService } from "../../services/tools/postcode";
import { Combobox, Transition } from "@headlessui/react";
import { FaAngleDown, FaCheck } from "react-icons/fa6";
import { Country } from "./postcode";
interface ProvinceInput {
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
  provinces: ResponseGetProvincesInCountryService;
}
function ProvinceInput({
  handleChangeQueryPostcode,
  setQueryPostcode,
  setSelected,
  selected,
  queryPostcode,
  provinces,
}: ProvinceInput) {
  const filteredProvince =
    queryPostcode.province === ""
      ? provinces?.results
      : provinces?.results?.filter((province) =>
          province
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(queryPostcode.province.toLowerCase().replace(/\s+/g, ""))
        );

  return (
    <Combobox
      value={selected.province}
      onChange={(province) => {
        return setSelected((prev) => {
          return {
            ...prev,
            province: province,
          };
        });
      }}
    >
      <div className="relative mt-1 ">
        <label>Select A Province Or State</label>
        <div className="relative cursor-default w-96 text-left shadow-md ">
          <Combobox.Input
            name="province"
            className="w-full focus:bg-icon-color bg-white ring-2 ring-black rounded-md appearance-none border-none py-5 pl-3 pr-10 text-sm leading-5 text-black"
            displayValue={(province: string) => {
              return province;
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
                province: "",
              };
            })
          }
        >
          <Combobox.Options className="absolute mt-1 max-h-60 w-full z-40 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
            {filteredProvince.length === 0 && queryPostcode.province !== "" ? (
              <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                Nothing found.
              </div>
            ) : (
              filteredProvince.map((province, index) => (
                <Combobox.Option
                  key={index}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? "bg-icon-color text-white" : "text-gray-900"
                    }`
                  }
                  value={province}
                >
                  {({ selected, active }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? "font-medium" : "font-normal"
                        }`}
                      >
                        {province}
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

export default ProvinceInput;
