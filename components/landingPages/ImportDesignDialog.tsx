import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Pagination,
  TextField,
} from "@mui/material";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { LandingPage } from "../../models";
import {
  GetAllLandingPageService,
  GetLandingPageService,
} from "../../services/admin/landingPage";
import SpinLoading from "../loadings/spinLoading";

export interface ImportDesignDialogProps {
  open: boolean;
  currentLandingPageId: string;
  onClose(): void;
  /**
   * Called with the full source record after the user confirms.
   * Throw to keep the dialog open showing the error; resolve to close it.
   */
  onImport(source: LandingPage): Promise<void>;
}

interface ListRow {
  id: string;
  updateAt: string;
  name: string;
  language: string;
  domain?: { name: string } | null;
  category?: { title: string } | null;
}

export default function ImportDesignDialog({
  open,
  currentLandingPageId,
  onClose,
  onImport,
}: ImportDesignDialogProps) {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ListRow | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce the search box into the query key so we don't hit the
  // server on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const list = useQuery({
    queryKey: ["import-design-list", page, search],
    queryFn: () =>
      GetAllLandingPageService({
        page,
        ...(search ? { query: { searchField: search } } : {}),
      }),
    enabled: open,
    placeholderData: keepPreviousData,
  });

  const rows: ListRow[] = (list.data?.landingPages ?? []).filter(
    (row) => row.id !== currentLandingPageId,
  );

  const handleClose = () => {
    if (isImporting) return;
    setSelected(null);
    setError(null);
    onClose();
  };

  const handleConfirm = async () => {
    if (!selected) return;
    try {
      setIsImporting(true);
      setError(null);
      const source = await GetLandingPageService({
        landingPageId: selected.id,
      });
      await onImport(source);
      setSelected(null);
      onClose();
    } catch (err: any) {
      setError(err?.message?.toString() || "Failed to import design");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>Import design from another landing page</DialogTitle>
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {selected ? (
          <Alert severity="warning">
            Importing from <strong>{selected.name}</strong> will replace the
            current canvas and translated strings. Your SEO titles and
            descriptions are kept. Unsaved editor changes will be lost.
            Nothing is saved until you click update.
          </Alert>
        ) : (
          <div className="flex flex-col gap-3">
            <TextField
              fullWidth
              size="small"
              label="Search landing pages"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            {list.isLoading ? (
              <div className="flex justify-center py-10">
                <SpinLoading />
              </div>
            ) : list.isError ? (
              <Alert severity="error">
                Failed to load landing pages. Close and try again.
              </Alert>
            ) : rows.length === 0 ? (
              <div className="py-10 text-center text-sm text-gray-500">
                No other landing pages found
              </div>
            ) : (
              <ul className="m-0 flex list-none flex-col gap-1 p-0">
                {rows.map((row) => (
                  <li key={row.id}>
                    <button
                      type="button"
                      onClick={() => setSelected(row)}
                      className="flex w-full items-center justify-between gap-3 rounded-md border border-gray-200 px-3 py-2 text-left hover:bg-gray-50"
                    >
                      <span className="font-semibold">{row.name}</span>
                      <span className="flex shrink-0 gap-3 text-xs text-gray-500">
                        {row.domain?.name && <span>{row.domain.name}</span>}
                        {row.category?.title && (
                          <span>{row.category.title}</span>
                        )}
                        <span>{row.language}</span>
                        <span>
                          {new Date(row.updateAt).toLocaleDateString()}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {(list.data?.totalPages ?? 0) > 1 && (
              <div className="flex justify-center">
                <Pagination
                  count={list.data?.totalPages ?? 1}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                />
              </div>
            )}
          </div>
        )}
      </DialogContent>
      <DialogActions>
        {selected ? (
          <>
            <Button onClick={() => setSelected(null)} disabled={isImporting}>
              Back
            </Button>
            <Button
              variant="contained"
              color="warning"
              onClick={handleConfirm}
              disabled={isImporting}
            >
              {isImporting ? "Importing…" : "Replace current design"}
            </Button>
          </>
        ) : (
          <Button onClick={handleClose}>Cancel</Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
