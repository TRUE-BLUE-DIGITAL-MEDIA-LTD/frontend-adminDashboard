import {
  Alert,
  Autocomplete,
  MenuItem,
  Snackbar,
  Tab,
  Tabs,
  TextField,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import React, { useEffect, useRef, useState } from "react";
import { BiUpload } from "react-icons/bi";
import Swal from "sweetalert2";
import { languages } from "../../data/languages";
import DashboardLayout from "../../layouts/dashboardLayout";
import {
  Category,
  Language,
  LandingPage,
  Message,
  Translations,
  User,
} from "../../models";
import {
  DomainWithLandingPage,
  GetAllDomains,
} from "../../services/admin/domain";
import {
  GetLandingPageService,
  TranslateLandingPageService,
  UpdateLandingPageService,
  UploadURLSingtureFavorIconService,
} from "../../services/admin/landingPage";
import { GetUser } from "../../services/admin/user";
import { Dropdown } from "primereact/dropdown";
import { OxyEditor, type OxyEditorRef } from "@/editor";
import { MdDomainVerification } from "react-icons/md";
import SpinLoading from "../../components/loadings/spinLoading";
import { GetAllCategories } from "../../services/admin/categories";
import AiDesign from "../../components/common/AiDesign";
import { TranslateAllDialog } from "@/editor/react/TranslateAllDialog";
import ImportDesignDialog from "../../components/landingPages/ImportDesignDialog";
import {
  extractImportedTranslationState,
  parseDesignJson,
} from "../../utils/importDesign";
interface UpdateLandingPageData {
  name: string;
  title: string;
  description: string;
  imageLink: string;
  mainButton: string;
  directLink: string;
  domainId: string;
  language: Language;
  categoryId: string;
  secondOffer: string;
  backOffer: string;
  googleAnalyticsId: string | null;
  route: string | undefined | null;
  primaryLanguage: Language;
  supportedLanguages: Language[];
  translations: Translations;
}

function Index({ user }: { user: User }) {
  // Kept the variable name to minimize churn in the AiDesign + save call
  // sites below. OxyEditorRef has the same `{ editor }` shape as
  // react-email-editor's EditorRef, so existing accessors keep working.
  const emailEditorRef = useRef<OxyEditorRef | null>(null);
  const router = useRouter();
  const [isLoadingUploadIcon, setIsLoadingUploadIcon] = useState(false);
  const [icon, setIcon] = useState<string | null>();
  const [blurEditor, setBlurEditor] = useState(true);
  const domains = useQuery({
    queryKey: ["domains-list"],
    queryFn: () => GetAllDomains(),
  });

  const categories = useQuery({
    queryKey: ["categories-list"],
    queryFn: () => GetAllCategories(),
  });

  const landingPage = useQuery({
    queryKey: ["landingpage", router.query.landingPageId as string],
    queryFn: () =>
      GetLandingPageService({
        landingPageId: router.query.landingPageId as string,
      }),
  });

  // redirect to page 404 if landing page not found
  if (landingPage.error) {
    router.push("/404");
  }
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<Message>({
    status: "success",
    message: "",
  });
  const [open, setOpen] = useState(false);
  const [translateDialogOpen, setTranslateDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [translateProgress, setTranslateProgress] = useState<
    Partial<
      Record<Language, { processed: number; total: number; failed?: string }>
    >
  >({});
  // Bumped after a successful Update so OxyEditor remounts with the freshly-
  // saved data — lets the user verify what landed in the DB without reloading
  // the whole page.
  const [editorReloadKey, setEditorReloadKey] = useState(0);
  const [landingPageData, setLandingPageData] = useState<UpdateLandingPageData>(
    {
      name: "",
      title: "",
      description: "",
      imageLink: "",
      mainButton: "",
      directLink: "",
      domainId: "",
      categoryId: "",
      language: "en",
      googleAnalyticsId: "",
      secondOffer: "",
      backOffer: "",
      route: "",
      primaryLanguage: "en",
      supportedLanguages: ["en"],
      translations: { en: { strings: {}, title: "", description: "" } },
    },
  );
  const [currentLanguage, setCurrentLanguage] = useState<Language>("en");

  useEffect(() => {
    if (landingPage.data) {
      setLandingPageData(() => {
        return {
          name: landingPage.data.name,
          title: landingPage.data.title,
          description: landingPage.data.description,
          imageLink: landingPage.data.backgroundImage,
          mainButton: landingPage.data.mainButton,
          directLink: landingPage.data.directLink as string,
          domainId: landingPage?.data?.domain?.id as string,
          language: landingPage?.data?.language,
          categoryId: landingPage.data?.categoryId as string,
          googleAnalyticsId: landingPage?.data?.googleAnalyticsId as string,
          secondOffer: landingPage?.data?.secondOffer as string,
          backOffer: landingPage?.data?.backOffer as string,
          route: landingPage.data.route,
          primaryLanguage:
            landingPage.data.primaryLanguage ?? landingPage.data.language,
          supportedLanguages: landingPage.data.supportedLanguages ?? [
            landingPage.data.language,
          ],
          translations: landingPage.data.translations ?? {},
        };
      });
      setIcon(() => landingPage?.data?.icon);
      setCurrentLanguage(
        landingPage.data.primaryLanguage ?? landingPage.data.language,
      );
    }
  }, [landingPage.data]);

  // No onReady-driven loadDesign: the editor is rendered only after the
  // landingPage query resolves (see the JSX below), so `initialDesign`
  // is sufficient. Drops the old Unlayer onReady wiring entirely.

  const handleChangeLandingPageData = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    setLandingPageData((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleUpdateLandingPage = async (
    designData: any | undefined,
    htmlData: string | undefined,
  ) => {
    try {
      setIsLoading(() => true);
      const design = designData;
      const html = htmlData;

      const json = JSON.stringify(design);

      await UpdateLandingPageService({
        query: {
          id: router?.query?.landingPageId as string,
        },
        body: {
          title:
            landingPageData.translations[landingPageData.primaryLanguage]
              ?.title ?? landingPageData.title,
          description:
            landingPageData.translations[landingPageData.primaryLanguage]
              ?.description ?? landingPageData.description,
          language: landingPageData.primaryLanguage,
          domainId: landingPageData?.domainId,
          ...(blurEditor === false && { html }),
          ...(blurEditor === false && { json }),
          route:
            !landingPageData.route || landingPageData.route === ""
              ? null
              : landingPageData.route,
          backgroundImage: landingPageData.imageLink,
          mainButton: landingPageData.mainButton,
          directLink:
            landingPageData.directLink === ""
              ? null
              : landingPageData.directLink,
          name: landingPageData.name,
          icon: icon,
          categoryId: landingPageData.categoryId,
          googleAnalyticsId: landingPageData?.googleAnalyticsId as string,
          secondOffer:
            landingPageData.secondOffer === ""
              ? null
              : landingPageData.secondOffer,
          backOffer:
            landingPageData.backOffer === "" ? null : landingPageData.backOffer,
          ...(landingPageData.route && { route: landingPageData.route }),
          primaryLanguage: landingPageData.primaryLanguage,
          supportedLanguages: landingPageData.supportedLanguages,
          translations: landingPageData.translations,
        },
      });
      setMessage(() => {
        return {
          status: "success",
          message: "update successfully",
        };
      });
      const domain = domains?.data?.filter(
        (list) => list.id === landingPageData.domainId,
      );

      Swal.fire({
        icon: "success",
        title: "success",
        text: "update successfully",
        footer: `<a target="_blank" href=${
          "https://" + domain?.[0]?.name
        }>click to open : ${domain?.[0]?.name}</a>`,
      });
      // Pull the freshly-saved row, then remount the editor against it so the
      // canvas reflects exactly what's now persisted (e.g. data-i18n keys
      // stamped by the i18n plugin land in `json` only after this save).
      await landingPage.refetch();
      setEditorReloadKey((k) => k + 1);
      setIsLoading(() => false);
      setOpen(() => true);
    } catch (err: any) {
      if (err.message === "Unauthorized") {
        location.reload();
      }
      setOpen(() => true);
      setIsLoading(() => false);
      setMessage(() => {
        return {
          status: "error",
          message: err.message?.toString()
            ? err.message?.toString()
            : "something went worng",
        };
      });
    }
  };

  // Copies another landing page's design + translated strings into local
  // state only — nothing persists until the user clicks update. SEO
  // title/description per language are kept from the current page. Thrown
  // errors are surfaced inline by ImportDesignDialog, which stays open.
  const handleImportDesign = async (source: LandingPage) => {
    const editor = emailEditorRef.current?.editor;
    if (!editor) {
      throw new Error("Editor is not ready — click SHOW first");
    }
    const design = parseDesignJson(source.json);
    editor.loadDesign(design);
    // The old design's undo stack is meaningless against the new canvas.
    editor.clearHistory();
    const imported = extractImportedTranslationState(
      source,
      landingPageData.translations,
    );
    setLandingPageData((prev) => ({ ...prev, ...imported }));
    setCurrentLanguage(imported.primaryLanguage);
    setMessage({
      status: "success",
      message: `Design imported from "${source.name}" — click update to save`,
    });
    setOpen(true);
  };

  const handleClose = (event: React.SyntheticEvent | Event, reason: string) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  //handle icon image update
  const handleFileInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    try {
      setIsLoadingUploadIcon(() => true);
      const file = event.target.files?.[0];
      const formFiles = new FormData();
      formFiles.append("file", file as File);
      const res = await UploadURLSingtureFavorIconService({ formFiles });
      setMessage(() => {
        return {
          status: "success",
          message: "Successfully Uploaded Image",
        };
      });
      setOpen(() => true);
      setIcon(() => res.originalURL);
      setIsLoadingUploadIcon(() => false);
    } catch (err) {
      setIsLoadingUploadIcon(() => false);
      console.log(err);
    }
  };

  return (
    <DashboardLayout user={user}>
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert variant="filled" severity={message?.status}>
          {message?.message}
        </Alert>
      </Snackbar>
      <div className="w-full ">
        <div className="mt-20 flex w-full justify-start bg-white">
          <div className="ml-20 w-full border-b-2 pb-2 pt-20 text-2xl font-bold">
            <span className="text-icon-color">U</span>pdate Landing Page
          </div>
        </div>
        <div className="ml-20 mt-4 flex gap-3">
          <button
            disabled={blurEditor || !landingPage.data}
            onClick={() => setImportDialogOpen(true)}
            title={
              blurEditor
                ? "Show the editor first"
                : "Copy a design from another landing page"
            }
            className="main-button disabled:cursor-not-allowed disabled:opacity-50"
          >
            Import design
          </button>
        </div>
        <main className="relative my-10   font-Poppins 2xl:w-full">
          {blurEditor ? (
            <div
              className="z-10  flex h-full min-h-[40rem] w-full  items-center
            justify-center bg-black text-xl font-semibold text-black "
            >
              <button
                onClick={() => {
                  if (confirm("Show Editor?")) {
                    setBlurEditor(() => false);
                  }
                }}
                className="main-button"
              >
                SHOW
              </button>
            </div>
          ) : landingPage.data ? (
            <OxyEditor
              // Changing key forces React to unmount + remount the editor,
              // which re-runs the mount effect with the latest initialDesign
              // from the refetched lander. Bumped on every successful save.
              key={editorReloadKey}
              ref={emailEditorRef}
              mode="page"
              // EditorInstance.loadDesign auto-detects Unlayer designs
              // (body.rows) vs GrapesJS project data (pages), so the
              // stringified JSON saved by the legacy editor loads
              // straight through. The multi-form custom tool is now a
              // built-in component type — no customJS shim needed.
              initialDesign={JSON.parse(landingPage.data.json)}
              height="40rem"
              style={{ width: "100%" }}
              isAdmin={user?.role !== "user"}
              showBlocksPanel
              showLayersPanel
              showPropertiesPanel
              showDeviceToolbar
              primaryLanguage={landingPageData.primaryLanguage}
              supportedLanguages={landingPageData.supportedLanguages}
              currentLanguage={currentLanguage}
              translations={landingPageData.translations}
              onTranslationsChange={(next) =>
                setLandingPageData((p) => ({
                  ...p,
                  translations: next as Translations,
                }))
              }
              onCurrentLanguageChange={(lang) =>
                setCurrentLanguage(lang as Language)
              }
              onRequestTranslateAll={() => setTranslateDialogOpen(true)}
            />
          ) : (
            <div
              className="flex h-[40rem] w-4/5 items-center justify-center"
              aria-busy="true"
              aria-label="Loading editor"
            >
              <SpinLoading />
            </div>
          )}

          {landingPage.data && (
            <AiDesign
              landingPageId={landingPage.data.id}
              onSuccess={(html: string) => {
                emailEditorRef.current?.editor?.setHtml(html);
              }}
            />
          )}
          <TranslateAllDialog
            open={translateDialogOpen}
            primary={landingPageData.primaryLanguage}
            supported={landingPageData.supportedLanguages}
            onClose={() => setTranslateDialogOpen(false)}
            progress={translateProgress}
            onTranslate={async ({ sourceLanguage, targetLanguages, scope }) => {
              setTranslateProgress({});
              // Pull the editor's live HTML so the backend translates against
              // the current canvas — picks up edits the user hasn't saved yet.
              // `exportHtml` is callback-based, so wrap it in a Promise.
              const currentHtml = await new Promise<string | undefined>(
                (resolve) => {
                  const editor = emailEditorRef.current?.editor;
                  if (!editor) return resolve(undefined);
                  editor.exportHtml(({ html }) => resolve(html));
                },
              );
              await TranslateLandingPageService({
                landingPageId: router.query.landingPageId as string,
                sourceLanguage: sourceLanguage as Language,
                targetLanguages: targetLanguages as Language[],
                scope,
                ...(currentHtml !== undefined ? { html: currentHtml } : {}),
                onEvent: (e) => {
                  if (
                    e.type === "string" &&
                    e.key &&
                    typeof e.value === "string"
                  ) {
                    setLandingPageData((p) => {
                      const lang = e.lang as Language;
                      const existing = p.translations[lang] ?? {
                        strings: {},
                        title: "",
                        description: "",
                      };
                      const next = { ...existing };
                      if (e.key === "_seo_title") next.title = e.value!;
                      else if (e.key === "_seo_description")
                        next.description = e.value!;
                      else
                        next.strings = {
                          ...existing.strings,
                          [e.key!]: e.value!,
                        };
                      return {
                        ...p,
                        translations: { ...p.translations, [lang]: next },
                      };
                    });
                    setTranslateProgress((p) => ({
                      ...p,
                      [e.lang]: {
                        processed: (p[e.lang as Language]?.processed ?? 0) + 1,
                        total: p[e.lang as Language]?.total ?? 0,
                      },
                    }));
                  } else if (e.type === "language-error") {
                    setTranslateProgress((p) => ({
                      ...p,
                      [e.lang]: {
                        processed: p[e.lang as Language]?.processed ?? 0,
                        total: p[e.lang as Language]?.total ?? 0,
                        failed: e.message ?? "failed",
                      },
                    }));
                  }
                },
              });
              await landingPage.refetch();
            }}
          />
          <ImportDesignDialog
            open={importDialogOpen}
            currentLandingPageId={router.query.landingPageId as string}
            onClose={() => setImportDialogOpen(false)}
            onImport={handleImportDesign}
          />
        </main>

        <div className="flex w-full justify-start">
          <div className="ml-20 w-full border-b-2 pb-2 text-2xl font-bold">
            General Information
          </div>
        </div>
        <div className="flex w-full flex-col items-center justify-center gap-5 py-5">
          <div className="grid w-10/12 grid-cols-2 gap-5 2xl:grid-cols-3">
            <TextField
              onChange={handleChangeLandingPageData}
              name="name"
              label="name of your landing page"
              variant="outlined"
              required
              value={landingPageData.name}
            />
            <TextField
              required
              select
              name="primaryLanguage"
              label="Primary language"
              value={landingPageData.primaryLanguage}
              onChange={(e) => {
                const v = e.target.value as Language;
                setLandingPageData((p) => ({
                  ...p,
                  primaryLanguage: v,
                  supportedLanguages: Array.from(
                    new Set([...p.supportedLanguages, v]),
                  ),
                }));
              }}
              helperText="Source language for AI translation"
            >
              {languages?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.name}
                </MenuItem>
              ))}
            </TextField>

            <Autocomplete
              multiple
              options={languages.map((l) => l.value)}
              getOptionLabel={(v) =>
                languages.find((l) => l.value === v)?.name ?? v
              }
              value={landingPageData.supportedLanguages}
              onChange={(_, value) => {
                const next = value as Language[];
                if (!next.includes(landingPageData.primaryLanguage)) {
                  next.push(landingPageData.primaryLanguage);
                }
                setLandingPageData((p) => ({ ...p, supportedLanguages: next }));
              }}
              renderInput={(params) => (
                <TextField {...params} label="Supported languages" />
              )}
            />
            <TextField
              onChange={handleChangeLandingPageData}
              name="route"
              label="add route example /profile/oxy"
              variant="outlined"
              value={landingPageData.route}
            />
          </div>
        </div>
        <div className="flex w-full justify-start">
          <div className="ml-20 w-full border-b-2 pb-2 text-2xl font-bold">
            SEO Information
          </div>
        </div>
        <div className="flex w-full items-center justify-center gap-5 py-5">
          <div className="grid w-10/12 grid-cols-2 gap-5 2xl:grid-cols-3">
            <div style={{ gridColumn: "span 2" }}>
              <Tabs
                value={currentLanguage}
                onChange={(_, v) => setCurrentLanguage(v as Language)}
                variant="scrollable"
              >
                {landingPageData.supportedLanguages.map((lang) => (
                  <Tab
                    key={lang}
                    value={lang}
                    label={
                      languages.find((l) => l.value === lang)?.name ?? lang
                    }
                  />
                ))}
              </Tabs>
              {landingPageData.supportedLanguages.map((lang) => {
                const t = landingPageData.translations[lang] ?? {
                  strings: {},
                  title: "",
                  description: "",
                };
                return currentLanguage === lang ? (
                  <div
                    key={lang}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      paddingTop: 12,
                    }}
                  >
                    <TextField
                      label="Title"
                      value={t.title}
                      onChange={(e) => {
                        setLandingPageData((p) => ({
                          ...p,
                          translations: {
                            ...p.translations,
                            [lang]: { ...t, title: e.target.value },
                          },
                        }));
                      }}
                    />
                    <TextField
                      label="Description"
                      value={t.description}
                      onChange={(e) => {
                        setLandingPageData((p) => ({
                          ...p,
                          translations: {
                            ...p.translations,
                            [lang]: { ...t, description: e.target.value },
                          },
                        }));
                      }}
                    />
                  </div>
                ) : null;
              })}
            </div>
            <TextField
              onChange={handleChangeLandingPageData}
              name="imageLink"
              label="image link"
              variant="outlined"
              required
              value={landingPageData.imageLink}
            />
            <div className=" flex w-full gap-2">
              <div className="flex w-full  flex-col gap-1">
                <label
                  htmlFor="dropzone-file"
                  className="flex h-10 w-full cursor-pointer items-center justify-center
         gap-2 rounded-md bg-white px-2 text-xl ring-2 ring-black transition duration-100 hover:scale-105 "
                >
                  <BiUpload />
                  <input
                    id="dropzone-file"
                    onChange={handleFileInputChange}
                    type="file"
                    accept="image/png, image/jpeg"
                    className="hidden"
                  />
                  <span className="text-sm">Upload Favicon</span>
                </label>
                <span className="text-xs ">
                  The most common size is 16x16 pixels
                </span>
              </div>
              {icon ? (
                <div className="flex h-full w-20 items-center justify-center overflow-hidden rounded-lg ring-2 ring-black">
                  {isLoadingUploadIcon ? (
                    <div className="h-full w-full animate-pulse bg-blue-500"></div>
                  ) : (
                    <div className="relative h-10 w-10  bg-transparent">
                      <Image
                        src={icon}
                        fill
                        onLoad={() => setIsLoadingUploadIcon(() => true)}
                        onLoadingComplete={() =>
                          setIsLoadingUploadIcon(() => false)
                        }
                        alt="icon"
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 33vw"
                        quality={65}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className="flex h-full w-20 items-center justify-center
           overflow-hidden rounded-lg ring-2 ring-black"
                >
                  {isLoadingUploadIcon ? (
                    <div className="h-full w-full animate-pulse bg-blue-500"></div>
                  ) : (
                    <div className="relative h-10 w-10  bg-transparent"></div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex w-full justify-start">
          <div className="ml-20 w-full border-b-2 pb-2 text-2xl font-bold">
            Affiliate Link
          </div>
        </div>
        <div className="flex w-full flex-col flex-wrap items-center justify-center gap-5 py-5">
          <div className="grid w-10/12 grid-cols-2 gap-5 2xl:grid-cols-3">
            <TextField
              onChange={handleChangeLandingPageData}
              name="mainButton"
              label="main button"
              variant="outlined"
              required
              value={landingPageData.mainButton}
            />
            <TextField
              onChange={handleChangeLandingPageData}
              name="directLink"
              label="direct Link (Optional)"
              variant="outlined"
              value={landingPageData.directLink}
            />
            <TextField
              onChange={handleChangeLandingPageData}
              name="secondOffer"
              label="Second Offer (Optional)"
              variant="outlined"
              value={landingPageData.secondOffer}
            />
            <TextField
              onChange={handleChangeLandingPageData}
              name="backOffer"
              label="Back Offer (Optional)"
              variant="outlined"
              value={landingPageData.backOffer}
            />
          </div>
        </div>
        <div className="flex w-full justify-start">
          <div className="ml-20 w-full border-b-2 pb-2 text-2xl font-bold">
            Others
          </div>
        </div>
        <div className="flex w-full flex-col items-center justify-center gap-5 py-5">
          <div className="grid w-10/12 grid-cols-2 gap-5 2xl:grid-cols-3">
            <div className="flex w-full flex-col ">
              <label>Select domain</label>
              <Dropdown
                filter
                placeholder="Select Domain"
                value={domains.data?.find(
                  (d) => d.id === landingPageData.domainId,
                )}
                options={domains.data}
                onChange={(e) => {
                  const value: DomainWithLandingPage = e.value;
                  setLandingPageData((prev) => {
                    return {
                      ...prev,
                      domainId: value.id,
                    };
                  });
                }}
                itemTemplate={(domain: DomainWithLandingPage) => {
                  return (
                    <div className="flex w-full items-center justify-between gap-2">
                      <span>{domain.name}</span>
                      {domain?.landingPages?.length > 0 && (
                        <span className="flex items-center justify-center gap-1 rounded-sm bg-icon-color px-5 text-white">
                          own <MdDomainVerification />
                        </span>
                      )}
                    </div>
                  );
                }}
                optionLabel="name"
                loading={domains.isLoading}
                className="h-14 w-full text-left text-3xl ring-1 ring-gray-400"
              />
            </div>

            <div className="flex w-full flex-col ">
              <label>Select category</label>
              <Dropdown
                placeholder="Select category"
                value={categories.data?.find(
                  (d) => d.id === landingPageData.categoryId,
                )}
                options={categories.data}
                onChange={(e) => {
                  const value: Category = e.value;
                  setLandingPageData((prev) => {
                    return {
                      ...prev,
                      categoryId: value.id,
                    };
                  });
                }}
                itemTemplate={(category: Category) => {
                  return (
                    <div className="flex  items-center justify-start gap-2">
                      <span>{category.title}</span>
                    </div>
                  );
                }}
                optionLabel="title"
                loading={categories.isLoading}
                className="h-14 w-full text-left text-3xl ring-1 ring-gray-400"
              />
            </div>
          </div>
        </div>
        <div className="flex w-full justify-center pb-10">
          <button
            disabled={isLoading}
            onClick={() => {
              if (emailEditorRef.current?.editor) {
                emailEditorRef.current?.editor?.exportHtml((data) => {
                  const { design, html, css } = data;
                  // Wrap GrapesJS' html + css into a single self-contained
                  // document — matches what Unlayer's exportHtml used to
                  // return, so the saved record is independently servable
                  // without the backend needing to know about the editor.
                  const fullHtml = `
                  <style>${css ?? ""}</style>
                  </head>
                  <body>${html}</body>
                  </html>`;
                  handleUpdateLandingPage(design, fullHtml);
                });
              } else {
                handleUpdateLandingPage(undefined, undefined);
              }
            }}
            className="flex w-40 items-center justify-center rounded-full bg-main-color py-2 font-Poppins text-lg text-white transition duration-150 hover:scale-105 active:bg-blue-700"
          >
            {isLoading ? <SpinLoading /> : "update"}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Index;

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
    return {
      redirect: {
        permanent: false,
        destination: "https://home.oxyclick.com",
      },
    };
  }
};
