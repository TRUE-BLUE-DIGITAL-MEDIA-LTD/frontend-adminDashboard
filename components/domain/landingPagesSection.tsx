import { TextField } from "@mui/material";
import Link from "next/link";
import React from "react";
import { MdList, MdOutlineArtTrack, MdRemoveCircle } from "react-icons/md";
import { InputUpdateDomainService } from "../../services/admin/domain";

type LandingPagesSectionProps = {
  landingPages: { name?: string; id: string; percent: number }[];
  setDomainData: React.Dispatch<React.SetStateAction<InputUpdateDomainService>>;
  onRemoveLandingPage: (input: { landingPageId: string }) => void;
  totalPercent: number;
  distributionValid: boolean;
};

function LandingPagesSection({
  landingPages,
  setDomainData,
  onRemoveLandingPage,
  totalPercent,
  distributionValid,
}: LandingPagesSectionProps) {
  if (landingPages.length === 0) return null;
  return (
    <section className="rounded-xl border bg-panel p-6 shadow-sm">
      <h2 className="mb-6 flex items-center gap-2 border-b pb-3 text-xl font-semibold text-fg">
        <MdList className="text-purple-600" /> Linked Landing Pages
        <span className="ml-2 flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/15 text-xs font-bold text-purple-700 dark:text-purple-400">
          {landingPages.length}
        </span>
        <span
          className={`ml-auto rounded-full px-3 py-1 text-xs font-bold ${
            distributionValid
              ? "bg-green-500/15 text-green-700 dark:text-green-400"
              : "bg-red-500/15 text-red-700 dark:text-red-400"
          }`}
        >
          Total: {totalPercent}% / 100%
        </span>
      </h2>
      <ul className="flex flex-col gap-4">
        {landingPages.map((landingPage) => (
          <li
            className="flex flex-col items-center justify-between gap-4 rounded-lg border bg-panel-raised p-4 transition hover:bg-hover sm:flex-row"
            key={landingPage.id}
          >
            <Link
              target="_blank"
              href={`/landingpage/${landingPage.id}`}
              className="flex flex-1 items-center gap-3 font-medium text-blue-600 hover:text-blue-800 hover:underline"
            >
              <MdOutlineArtTrack className="text-xl" />
              <span className="truncate">{landingPage.name}</span>
            </Link>
            <div className="flex w-full items-center gap-4 sm:w-auto">
              <TextField
                type="number"
                value={landingPage?.percent}
                size="small"
                className="w-32 bg-panel"
                onChange={(e) =>
                  setDomainData((prev) => {
                    const landingPages = [...prev.landingPages];
                    const index = landingPages.findIndex(
                      (list) => list.id === landingPage.id,
                    );
                    if (index !== -1) {
                      landingPages[index] = {
                        ...landingPages[index],
                        percent: Number(e.target.value),
                      };
                    }
                    return { ...prev, landingPages };
                  })
                }
                label="Probability (%)"
                variant="outlined"
              />
              <button
                onClick={() =>
                  onRemoveLandingPage({
                    landingPageId: landingPage.id,
                  })
                }
                className="flex items-center gap-2 rounded-md bg-red-500/10 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-600 hover:text-white active:scale-95"
              >
                <MdRemoveCircle /> Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default LandingPagesSection;
