import {
  Button,
  Checkbox,
  CircularProgress,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { parseCookies } from "nookies";
import React, { useRef, useState } from "react";
import Swal from "sweetalert2";
import { OxyEditor, type OxyEditorRef } from "@/editor";
import DashboardLayout from "../layouts/dashboardLayout";
import { User } from "../models";
import {
  GetAllLandingPageService,
  GetLandingPageService,
  UpdateLandingPageService,
} from "../services/admin/landingPage";
import { GetUser } from "../services/admin/user";

export default function MigrateLandingPage({ user }: { user: User }) {
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationQueue, setMigrationQueue] = useState<string[]>([]);
  const [currentMigratingId, setCurrentMigratingId] = useState<string | null>(
    null,
  );
  const [currentDesign, setCurrentDesign] = useState<any>(null);
  const [migrationStatus, setMigrationStatus] = useState<
    Record<string, "pending" | "success" | "error" | "skipped">
  >({});

  const emailEditorRef = useRef<OxyEditorRef | null>(null);

  if (user.role !== "admin") {
    return <div>Not allowed</div>;
  }

  const landingPagesQuery = useQuery({
    queryKey: ["landingpages-all", page],
    queryFn: () =>
      GetAllLandingPageService({ page, query: { searchField: "" } }),
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds =
        landingPagesQuery.data?.landingPages.map((lp) => lp.id) || [];
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const startMigration = async () => {
    if (selectedIds.length === 0) return;
    setIsMigrating(true);
    setMigrationQueue([...selectedIds]);
    setMigrationStatus((prev) => {
      const newStatus = { ...prev };
      selectedIds.forEach((id) => (newStatus[id] = "pending"));
      return newStatus;
    });
    processNext(selectedIds);
  };

  const processNext = async (queue: string[]) => {
    if (queue.length === 0) {
      setIsMigrating(false);
      setCurrentMigratingId(null);
      setCurrentDesign(null);
      Swal.fire("Done", "Migration completed", "success");
      return;
    }

    const nextId = queue[0];
    const remainingQueue = queue.slice(1);
    setMigrationQueue(remainingQueue);
    setCurrentMigratingId(nextId);

    try {
      const lp = await GetLandingPageService({ landingPageId: nextId });
      const parsedJson = JSON.parse(lp.json);

      // Check if it's already migrated (GrapesJS format) or old (Unlayer/MigrationStub)
      const needsMigration =
        parsedJson._oxyMigrationStub === "v1" ||
        (parsedJson.body && parsedJson.body.rows);

      if (needsMigration) {
        // Set current design to trigger the OxyEditor to mount and fire onReady
        setCurrentDesign(parsedJson);
      } else {
        // Skip
        setMigrationStatus((prev) => ({ ...prev, [nextId]: "skipped" }));
        processNext(remainingQueue);
      }
    } catch (error) {
      console.error("Failed to process landing page", nextId, error);
      setMigrationStatus((prev) => ({ ...prev, [nextId]: "error" }));
      processNext(remainingQueue);
    }
  };

  const handleEditorReady = () => {
    // Wait a brief moment to ensure GrapesJS has fully parsed and rendered the design
    setTimeout(() => {
      if (!emailEditorRef.current?.editor) {
        setMigrationStatus((prev) => ({
          ...prev,
          [currentMigratingId as string]: "error",
        }));
        processNext(migrationQueue);
        return;
      }

      emailEditorRef.current.editor.exportHtml(async (data) => {
        const { design, html, css } = data;
        const fullHtml = `
<style>${css ?? ""}</style>
</head>
<body>${html}</body>
</html>`;

        try {
          await UpdateLandingPageService({
            query: { id: currentMigratingId as string },
            body: {
              html: fullHtml,
              json: JSON.stringify(design),
            },
          });
          setMigrationStatus((prev) => ({
            ...prev,
            [currentMigratingId as string]: "success",
          }));
        } catch (err) {
          console.error(
            "Failed to update landing page",
            currentMigratingId,
            err,
          );
          setMigrationStatus((prev) => ({
            ...prev,
            [currentMigratingId as string]: "error",
          }));
        }

        // Process next item
        processNext(migrationQueue);
      });
    }, 1500); // 1.5 seconds delay for parsing
  };

  return (
    <DashboardLayout user={user}>
      <div className="w-full">
        <div className="mt-20 flex w-full justify-start bg-white">
          <div className="ml-20 w-full border-b-2 pb-2 pt-20 text-2xl font-bold">
            <span className="text-icon-color">M</span>igrate Landing Pages
          </div>
        </div>

        <div className="mx-20 my-10">
          <div className="mb-4 flex items-center justify-between">
            <Button
              variant="contained"
              color="primary"
              disabled={isMigrating || selectedIds.length === 0}
              onClick={startMigration}
            >
              Migrate Selected ({selectedIds.length})
            </Button>
            {isMigrating && (
              <div className="flex items-center gap-2 font-semibold text-blue-600">
                <CircularProgress size={20} />
                Migrating {currentMigratingId}...
              </div>
            )}
          </div>

          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={
                      selectedIds.length > 0 &&
                      landingPagesQuery.data?.landingPages?.length ===
                        selectedIds.length
                    }
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Domain</TableCell>
                <TableCell>Language</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {landingPagesQuery.isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : (
                landingPagesQuery.data?.landingPages.map((lp) => (
                  <TableRow key={lp.id}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedIds.includes(lp.id)}
                        onChange={() => handleSelectOne(lp.id)}
                      />
                    </TableCell>
                    <TableCell>{lp.name}</TableCell>
                    <TableCell>{lp.domain?.name || "-"}</TableCell>
                    <TableCell>{lp.language}</TableCell>
                    <TableCell>
                      {migrationStatus[lp.id] === "pending" && (
                        <span className="text-yellow-600">Pending</span>
                      )}
                      {migrationStatus[lp.id] === "success" && (
                        <span className="font-bold text-green-600">
                          Success
                        </span>
                      )}
                      {migrationStatus[lp.id] === "error" && (
                        <span className="font-bold text-red-600">Error</span>
                      )}
                      {migrationStatus[lp.id] === "skipped" && (
                        <span className="text-gray-500">Skipped</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {landingPagesQuery.data && (
            <div className="mt-4 flex justify-center">
              <Pagination
                count={landingPagesQuery.data.totalPages}
                page={page}
                onChange={(_, p) => setPage(p)}
              />
            </div>
          )}
        </div>

        {/* Hidden Editor for Migration */}
        <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
          {currentDesign && currentMigratingId && (
            <OxyEditor
              key={currentMigratingId}
              ref={emailEditorRef}
              mode="page"
              initialDesign={currentDesign}
              onReady={handleEditorReady}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  try {
    const cookies = parseCookies(context);
    const accessToken = cookies.access_token;
    const user = await GetUser({ access_token: accessToken });

    if (user.TOTPenable === false) {
      return {
        redirect: {
          permanent: false,
          destination: "/auth/setup-totp",
        },
      };
    }

    return {
      props: {
        user,
      },
    };
  } catch (err) {
    const node = process.env.NODE_ENV;
    return {
      redirect: {
        permanent: false,
        destination:
          node === "development"
            ? "/auth/sign-in"
            : "https://home.oxyclick.com",
      },
    };
  }
};
