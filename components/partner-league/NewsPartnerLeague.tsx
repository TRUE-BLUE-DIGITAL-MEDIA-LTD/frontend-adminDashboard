import React from "react";
import {
  MdAlignHorizontalLeft,
  MdGraphicEq,
  MdNewspaper,
  MdTimer,
} from "react-icons/md";
import { useGetNewsPartnerLeagueTable } from "../../react-query";
import { FaAward, FaCrown } from "react-icons/fa6";
import { timeAgo } from "../../utils";

function NewsPartnerLeague() {
  const news = useGetNewsPartnerLeagueTable();
  return (
    <div className="h-max min-h-96  w-full max-w-7xl overflow-hidden rounded-lg border">
      <section className="flex w-full items-center justify-between bg-gradient-to-l from-slate-50 to-slate-300 p-3">
        <div className="flex items-center justify-center gap-3">
          <MdNewspaper className="text-gray-800" />
          <span className="text-lg font-semibold">
            Regional Performance News
          </span>
        </div>
        <div className="flex items-center justify-center gap-3">
          <div className="h-2 w-2 animate-ping rounded-full bg-green-400" />
          <span className="text-sm font-normal text-gray-400">
            Last Update:{" "}
            {timeAgo({
              pastTime: new Date(news.dataUpdatedAt).toISOString(),
            })}
          </span>
        </div>
      </section>
      <ul className="grid w-full grid-cols-2 gap-2 p-3">
        {news.data?.map((data, index) => {
          return (
            <li key={index} className="h-max w-full ">
              <div className="w-full">
                <span className="text-lg font-semibold">{data.country}</span>
              </div>
              <section className="flex flex-col gap-3">
                <div className="flex min-h-40 w-full flex-col gap-3 rounded-lg border bg-gray-100 p-3">
                  <div className="flex items-center justify-start gap-2 font-semibold text-gray-700">
                    <MdAlignHorizontalLeft /> <span>Top 5 Regions - EVR%</span>
                  </div>
                  <ul className="flex w-full flex-col gap-3">
                    {data.evr_list.map((list, index_evr) => {
                      return (
                        <ListNews
                          key={index_evr}
                          list={list}
                          index={index_evr}
                        />
                      );
                    })}
                  </ul>
                </div>
                <div className="flex min-h-40 w-full flex-col gap-3 rounded-lg border bg-gray-100 p-3">
                  <div className="flex items-center justify-start gap-2 font-semibold text-gray-700">
                    <MdAlignHorizontalLeft /> <span>Top 5 Regions - CVR%</span>
                  </div>
                  <ul className="flex w-full flex-col gap-3">
                    {data.cvr_list.map((list, index_evr) => {
                      return (
                        <ListNews
                          key={index_evr}
                          list={list}
                          index={index_evr}
                        />
                      );
                    })}
                  </ul>
                </div>
                <div className="flex min-h-40 w-full flex-col gap-3 rounded-lg border bg-gray-100 p-3">
                  <div className="flex items-center justify-start gap-2 font-semibold text-gray-700">
                    <MdAlignHorizontalLeft />
                    <span>Top 5 Combined CVR% & EVR%</span>
                  </div>
                  <ul className="flex w-full flex-col gap-3">
                    {data.combine_list.map((list, index_evr) => {
                      return (
                        <ListNews
                          key={index_evr}
                          list={list}
                          index={index_evr}
                        />
                      );
                    })}
                  </ul>
                </div>
              </section>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default NewsPartnerLeague;

type PropsListNews = {
  list: { region: string; number: number; percent: number };
  index: number;
};
function ListNews({ list, index }: PropsListNews) {
  const position = index + 1;
  let text_color = "text-yellow-600";

  if (position === 1) {
    text_color = "text-yellow-600";
  } else if (position === 2) {
    text_color = "text-gray-400";
  } else if (position === 3) {
    text_color = "text-orange-500";
  } else {
    text_color = "text-black";
  }
  return (
    <li key={index} className="flex w-full items-center justify-between">
      <div className="flex items-center justify-center gap-2">
        {position === 1 ? (
          <div className="flex items-center space-x-3">
            <div className="gradient-gold flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white">
              1
            </div>
            <i className={`text-lg ${text_color}`}>
              <FaCrown />
            </i>
          </div>
        ) : position === 2 ? (
          <div className="flex items-center space-x-3">
            <div className="gradient-silver flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white">
              2
            </div>
            <i className={`${text_color}`}>
              <FaAward />
            </i>
          </div>
        ) : position === 3 ? (
          <div className="flex items-center space-x-3">
            <div className="gradient-bronze flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white">
              3
            </div>
            <i className={`${text_color}`}>
              <FaAward />
            </i>
          </div>
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600">
            {position}
          </div>
        )}
        <span className={`font-semibold ${text_color}`}>{list.region}</span>
      </div>
      <div>
        <span className={`${text_color} font-bold`}>
          {list.percent.toFixed(2)}%
        </span>{" "}
        <span className="text-xs font-light text-gray-600">
          ({list.number})
        </span>
      </div>
    </li>
  );
}
