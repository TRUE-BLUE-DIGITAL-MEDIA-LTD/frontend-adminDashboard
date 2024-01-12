import React, { Fragment, useState } from "react";
import { Combobox, Transition } from "@headlessui/react";
import { FaAngleDown, FaCheck } from "react-icons/fa6";
import { QueryFilterLandingPages } from "../../pages";

interface Searchbar {
  title: "Categories" | "Languages" | "Domains";
  items: {
    id: string;
    option: string;
  }[];
  setQueryFilterLandingPages: React.Dispatch<
    React.SetStateAction<QueryFilterLandingPages>
  >;
}
function Searchbar({ items, title, setQueryFilterLandingPages }: Searchbar) {
  const [selected, setSelected] = useState();
  const [query, setQuery] = useState("");

  const filterdSearchOptions =
    query === ""
      ? items
      : items.filter((list) =>
          list.option
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(query.toLowerCase().replace(/\s+/g, ""))
        );

  const handleOnChangeCombobox = (value: Searchbar["items"][0]) => {
    setQueryFilterLandingPages((prev) => {
      if (title === "Categories") {
        return {
          ...prev,
          categoryId: value.id,
        };
      } else if (title === "Domains") {
        return {
          ...prev,
          domainId: value.id,
        };
      } else if (title === "Languages") {
        return {
          ...prev,
          language: value.id,
        };
      } else {
        return {
          ...prev,
        };
      }
    });
  };
  return (
    <Combobox
      value={selected}
      onChange={(value: Searchbar["items"][0]) => handleOnChangeCombobox(value)}
    >
      <div className="relative mt-1 font-Poppins">
        <label className="text-sm text-icon-color">{title}</label>
        <div className="relative">
          <Combobox.Input
            className="w-full border-none appearance-none bg-slate-100 rounded-lg overflow-hidden outline-icon-color  py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 "
            displayValue={(list: { id: string; option: string }) => list.option}
            onChange={(event) => setQuery(event.target.value)}
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
          afterLeave={() => setQuery("")}
        >
          <Combobox.Options className="absolute mt-1 z-50 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
            {filterdSearchOptions.length === 0 && query !== "" ? (
              <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                Nothing found.
              </div>
            ) : (
              filterdSearchOptions.map((list) => (
                <Combobox.Option
                  key={list.id}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? "bg-teal-600 text-white" : "text-gray-900"
                    }`
                  }
                  value={list}
                >
                  {({ selected, active }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? "font-medium" : "font-normal"
                        }`}
                      >
                        {list.option}
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

export default Searchbar;
