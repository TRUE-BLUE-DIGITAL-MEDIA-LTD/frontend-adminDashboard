import { OxyEditor, type OxyEditorRef } from "@/editor";
import {
  importUnlayerDesign,
  parseUnlayerDesignString,
  type UnlayerDesign,
} from "@/editor/compat";
import { promises as fs } from "fs";
import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import path from "path";
import { useRef } from "react";

const FALLBACK_UNLAYER_DESIGN: UnlayerDesign = {
  body: {
    rows: [
      {
        cells: [1],
        columns: [
          {
            contents: [
              {
                type: "heading",
                values: {
                  text: "Pick a fixture to load",
                  headingType: "h1",
                  fontSize: "28px",
                  color: "#1B3C53",
                  textAlign: "center",
                },
              },
              {
                type: "text",
                values: {
                  text: "<p>Use the dropdown at the top to load one of the JSON fixtures from editor/fixtures/raw.</p>",
                  color: "#456882",
                  textAlign: "center",
                  lineHeight: "150%",
                },
              },
            ],
            values: { padding: "24px", backgroundColor: "#ffffff" },
          },
        ],
        values: { backgroundColor: "#fafaf8", padding: "24px" },
      },
    ],
    values: {
      contentWidth: "640px",
      backgroundColor: "#f3f4f6",
      fontFamily: { label: "Inter", value: "Inter, system-ui, sans-serif" },
    },
  },
};

interface EditorPreviewPageProps {
  landingRaw: string | null;
  landingError: string | null;
  fixtureFiles: string[];
  currentFixture: string | null;
}

export const getServerSideProps: GetServerSideProps<
  EditorPreviewPageProps
> = async (ctx) => {
  const fixturesDir = path.join(process.cwd(), "editor", "fixtures", "raw");

  let fixtureFiles: string[] = [];
  try {
    const entries = await fs.readdir(fixturesDir);
    fixtureFiles = entries.filter((f) => f.endsWith(".json")).sort();
  } catch (err) {
    return {
      props: {
        landingRaw: null,
        landingError: `Cannot read fixtures directory: ${
          (err as Error).message
        }`,
        fixtureFiles: [],
        currentFixture: null,
      },
    };
  }

  const requested =
    typeof ctx.query.fixture === "string" ? ctx.query.fixture : null;
  const currentFixture =
    requested && fixtureFiles.includes(requested)
      ? requested
      : fixtureFiles[0] ?? null;

  if (!currentFixture) {
    return {
      props: {
        landingRaw: null,
        landingError: "No fixture files found in editor/fixtures/raw",
        fixtureFiles,
        currentFixture: null,
      },
    };
  }

  try {
    const file = await fs.readFile(
      path.join(fixturesDir, currentFixture),
      "utf8",
    );
    const landingRaw = unwrapFixture(file);
    return {
      props: { landingRaw, landingError: null, fixtureFiles, currentFixture },
    };
  } catch (err) {
    return {
      props: {
        landingRaw: null,
        landingError: (err as Error).message,
        fixtureFiles,
        currentFixture,
      },
    };
  }
};

/**
 * Fixtures in editor/fixtures/raw/ come in three shapes (depending on which
 * Unlayer export was used to generate them):
 *
 *   1. Top-level JSON-encoded string of the design.
 *      e.g. `"{\"counters\":...,\"body\":{...}}"`
 *   2. Wrapped object: { "json": "<stringified design>" }
 *      e.g. `{ "json": "{\"counters\":...,\"body\":{...}}" }`
 *   3. Plain design object at the top level: `{ "counters": ..., "body": ... }`
 *
 * Normalize all three to a single JSON-string the client can pass to
 * `parseUnlayerDesignString`.
 */
function unwrapFixture(file: string): string {
  const outer = JSON.parse(file);
  if (typeof outer === "string") return outer;
  if (outer && typeof outer === "object") {
    const obj = outer as Record<string, unknown>;
    if (typeof obj.json === "string") return obj.json;
    if ("body" in obj) return JSON.stringify(obj);
  }
  throw new Error(
    `Unrecognized fixture shape — expected a JSON string, { json: string }, or a design object with a 'body' field. Got: ${typeof outer}`,
  );
}

export default function EditorPreviewPage({
  landingRaw,
  landingError,
  fixtureFiles,
  currentFixture,
}: EditorPreviewPageProps) {
  const ref = useRef<OxyEditorRef | null>(null);
  const router = useRouter();

  const initialHtml = (() => {
    try {
      const design = landingRaw
        ? parseUnlayerDesignString(landingRaw)
        : FALLBACK_UNLAYER_DESIGN;
      return importUnlayerDesign(design).html;
    } catch {
      return importUnlayerDesign(FALLBACK_UNLAYER_DESIGN).html;
    }
  })();

  function handleFixtureChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    router.push(
      { pathname: "/dev/editor-preview", query: { fixture: next } },
      undefined,
      { scroll: false },
    );
  }

  // Force OxyEditor to remount when the fixture changes so `initialHtml` is
  // re-applied. Without this, GrapesJS holds onto the previous canvas state.
  const editorKey = currentFixture ?? "fallback";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div className="oxy-fixture-bar">
        <span className="oxy-fixture-bar__label">Fixture</span>
        <select
          value={currentFixture ?? ""}
          onChange={handleFixtureChange}
          disabled={fixtureFiles.length === 0}
          className="oxy-fixture-bar__select"
        >
          {fixtureFiles.length === 0 && (
            <option value="">No fixtures available</option>
          )}
          {fixtureFiles.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
        <span className="oxy-fixture-bar__count">
          {fixtureFiles.length} fixture{fixtureFiles.length === 1 ? "" : "s"}
        </span>
        {landingError && (
          <span className="oxy-fixture-bar__error">{landingError}</span>
        )}
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <OxyEditor
          key={editorKey}
          ref={ref}
          mode="page"
          initialHtml={initialHtml}
          height="100%"
          showBlocksPanel
          showLayersPanel
          showPropertiesPanel
          showDeviceToolbar
        />
      </div>
    </div>
  );
}
