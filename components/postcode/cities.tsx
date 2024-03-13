import React from "react";
import { ResponseGetPostalCodesByStateService } from "../../services/tools/postcode";

function Cities({ cities }: { cities: ResponseGetPostalCodesByStateService }) {
  return (
    <ul className="mt-5  grid w-10/12 grid-cols-1 gap-5 md:grid-cols-3 2xl:grid-cols-5">
      {Object.values(cities.results)
        .flat()
        .map((city, index) => (
          <li
            className=" flex flex-col items-start justify-center rounded-md bg-blue-100  p-5 ring-blue-900 transition duration-100 hover:bg-blue-200 hover:ring-2"
            key={index}
          >
            <span>
              <span className="font-bold">Country : </span> {city.state}{" "}
              {city.country_code}
            </span>
            <span>
              <span className="font-bold">Provice Or State : </span>
              {city.province}
            </span>
            <span>
              <span className="font-bold">City : </span>
              {city.city}
            </span>
            <span>
              <span className="font-bold">Postcode : </span>
              {city.postal_code}
            </span>
          </li>
        ))}
    </ul>
  );
}

export default Cities;
