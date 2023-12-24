import React from "react";
import { ResponseGetPostalCodesByStateService } from "../../services/tools/postcode";

function Cities({ cities }: { cities: ResponseGetPostalCodesByStateService }) {
  return (
    <ul className="w-10/12  grid grid-cols-5 gap-5 mt-5">
      {Object.values(cities.results)
        .flat()
        .map((city, index) => (
          <li
            className=" bg-blue-100 hover:bg-blue-200 transition duration-100 hover:ring-2 ring-blue-900  p-5 rounded-md flex flex-col justify-center items-start"
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
