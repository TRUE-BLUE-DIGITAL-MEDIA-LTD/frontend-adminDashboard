import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { parseCookies } from "nookies";
import React, { useEffect, useRef, useState } from "react";
import { GetUser } from "../../services/admin/user";
import {
  ErrorMessages,
  Language,
  Message,
  UnlayerMethods,
  User,
} from "../../models";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { GetAllDomains } from "../../services/admin/domain";
import {
  CreateLandingPageService,
  UploadURLSingtureFavorIconService,
} from "../../services/admin/landingPage";
import DashboardLayout from "../../layouts/dashboardLayout";
import { Alert, MenuItem, Skeleton, Snackbar, TextField } from "@mui/material";
import FullLoading from "../../components/loadings/fullLoading";
import dynamic from "next/dynamic";
import { languages } from "../../data/languages";
import { BiUpload } from "react-icons/bi";
import Image, { ImageLoaderProps } from "next/image";
import { GetAllCategories } from "../../services/admin/categories";
import { MdDomainVerification } from "react-icons/md";
import { Editor, EditorRef, EmailEditorProps } from "react-email-editor";
import Swal from "sweetalert2";
const EmailEditor = dynamic(() => import("react-email-editor"), {
  ssr: false,
});

interface CreateLandingPageData {
  name: string;
  title: string;
  description: string;
  backgroundImage: string;
  mainButton: string;
  directLink: string;
  domainId?: string;
  categoryId?: string;
  googleAnalyticsId?: string | null;
  language: Language;
  route?: string | undefined;
}

function Index({ user }: { user: User }) {
  const emailEditorRef = useRef<EditorRef | null>(null);
  const router = useRouter();
  const [isLoadingUploadIcon, setIsLoadingUploadIcon] = useState(false);
  const [icon, setIcon] = useState<string | null>();
  const [isLoadingEditor, setIsLoadingEditor] = useState(true);

  const domains = useQuery({
    queryKey: ["domains"],
    queryFn: () => GetAllDomains(),
  });

  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: () => GetAllCategories(),
  });

  const [isLoading, setIsLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [landingPageData, setLandingPageData] = useState<CreateLandingPageData>(
    {
      name: "",
      title: "",
      description: "",
      backgroundImage: "",
      mainButton: "",
      directLink: "",
      domainId: "",
      categoryId: "",
      googleAnalyticsId: "",
      language: "en",
      route: "",
    },
  );

  //trigger overflow hiden to the body
  useEffect(() => {
    document.body.style.overflow = "hidden";
  }, []);

  const handleOnReadyEmailEditor: EmailEditorProps["onReady"] = (unlayer) => {
    emailEditorRef.current = { editor: unlayer };
    unlayer.exportHtml((data) => {
      const { design, html } = data;
    });
    document.body.style.overflow = "auto";
    setIsLoadingEditor(() => false);
    // unlayer.loadDesign(json);
  };

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

  const handleCrateLandingPage = async () => {
    setIsLoading(() => true);
    if (!emailEditorRef?.current?.editor) return null;
    emailEditorRef?.current?.editor.exportHtml(async (data) => {
      try {
        const createLandingPageData: CreateLandingPageData = {
          title: landingPageData.title,
          backgroundImage: landingPageData.backgroundImage,
          mainButton: landingPageData.mainButton,
          directLink: landingPageData.directLink,
          name: landingPageData.name,
          language: landingPageData.language,
          description: landingPageData.description,
          googleAnalyticsId: landingPageData?.googleAnalyticsId,
          ...(landingPageData.route && { route: landingPageData.route }),
        };
        if (landingPageData.domainId) {
          createLandingPageData.domainId = landingPageData.domainId;
        }
        if (landingPageData.categoryId) {
          createLandingPageData.categoryId = landingPageData.categoryId;
        }
        const { design, html } = data;
        const json = JSON.stringify(design);
        await CreateLandingPageService({
          html: html,
          json: json,
          icon: icon,
          ...createLandingPageData,
        });
        Swal.fire({
          icon: "success",
          title: "Create Success",
        });
        setOpen(() => true);
        router.push("/");
        setIsLoading(() => false);
      } catch (error) {
        setIsLoading(() => false);
        let result = error as ErrorMessages;
        Swal.fire({
          title: result.error,
          text: result.message.toString(),
          footer: "Error Code :" + result.statusCode?.toString(),
          icon: "error",
        });
      }
    });
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
      {isLoadingEditor && <FullLoading />}
      <div className="w-full">
        <div className="mt-5 flex w-full justify-start bg-white">
          <div className="ml-20 w-full border-b-2 pb-2 pt-20 text-2xl font-bold">
            Create Landing Page
          </div>
        </div>
        <main className="relative my-10 font-Poppins">
          <EmailEditor
            ref={emailEditorRef}
            onReady={handleOnReadyEmailEditor}
            options={{ displayMode: "web" }}
            projectId={270222}
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
              name="language"
              label="Select"
              value={landingPageData.language}
              onChange={handleChangeLandingPageData}
              helperText="Please select language"
            >
              {languages?.map((option) => {
                return (
                  <MenuItem key={option.value} value={option.value}>
                    <div className="flex items-center justify-start gap-2">
                      <span>{option.name}</span>
                    </div>
                  </MenuItem>
                );
              })}
            </TextField>
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
        <div className="flex w-full flex-col flex-wrap items-center justify-center gap-5 py-5">
          <div className="grid w-10/12 grid-cols-2 gap-5 2xl:grid-cols-3">
            <TextField
              onChange={handleChangeLandingPageData}
              name="title"
              label="title"
              variant="outlined"
              required
              value={landingPageData.title}
            />
            <TextField
              onChange={handleChangeLandingPageData}
              name="description"
              label="description"
              variant="outlined"
              required
              value={landingPageData.description}
            />
            <TextField
              onChange={handleChangeLandingPageData}
              name="backgroundImage"
              label="image link"
              variant="outlined"
              required
              value={landingPageData.backgroundImage}
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

              <div className="flex h-full w-20 items-center justify-center overflow-hidden rounded-lg ring-2 ring-black">
                {isLoadingUploadIcon ? (
                  <div className="h-full w-full animate-pulse bg-blue-500"></div>
                ) : (
                  <div className="relative h-10 w-10  bg-transparent">
                    <Image
                      src={icon as string}
                      fill
                      alt="favicon upload"
                      onLoadStart={() => setIsLoadingUploadIcon(() => true)}
                      onLoad={() => setIsLoadingUploadIcon(() => false)}
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      quality={65}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex w-full justify-start">
          <div className="ml-20 w-full border-b-2 pb-2 text-2xl font-bold">
            Affiliate Link
          </div>
        </div>
        <div className="flex w-full flex-col items-center justify-center gap-5 py-5">
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
          </div>
        </div>
        <div className="flex w-full justify-start">
          <div className="ml-20 w-full border-b-2 pb-2 text-2xl font-bold">
            Domain Name (Optional)
          </div>
        </div>
        <div className="flex w-full flex-col items-center justify-center gap-5 py-5">
          <div className="grid w-10/12 grid-cols-2 gap-5 2xl:grid-cols-3">
            {domains.isLoading ? (
              <div>
                <Skeleton height={70} />
                <span className="animate-pulse">Domain Is Loading ..</span>
              </div>
            ) : (
              <TextField
                required
                select
                name="domainId"
                label="Select"
                onChange={handleChangeLandingPageData}
                helperText="Please select your domain name"
              >
                {domains?.data?.map((domain) => {
                  return (
                    <MenuItem key={domain.id} value={domain.id}>
                      <div className="flex w-full items-center justify-between gap-2">
                        <span>{domain.name}</span>
                        {domain?.landingPages?.length > 0 && (
                          <span className="flex items-center justify-center gap-1 rounded-sm bg-icon-color px-5 text-white">
                            own <MdDomainVerification />
                          </span>
                        )}
                      </div>
                    </MenuItem>
                  );
                })}
              </TextField>
            )}
            {categories.isLoading ? (
              <div>
                <Skeleton height={70} />
                <span className="animate-pulse">Domain Is Loading ..</span>
              </div>
            ) : (
              <TextField
                required
                select
                name="categoryId"
                label="Select"
                onChange={handleChangeLandingPageData}
                helperText="Please select your category here"
              >
                {categories?.data?.map((category) => {
                  return (
                    <MenuItem key={category.id} value={category.id}>
                      <div className="flex items-center justify-start gap-2">
                        <span>{category.title}</span>
                      </div>
                    </MenuItem>
                  );
                })}
              </TextField>
            )}
          </div>
        </div>
        <div className="flex w-full justify-center pb-10">
          {isLoading || isLoadingEditor ? (
            <div className="w-40 animate-pulse rounded-full bg-main-color py-2 text-center font-Poppins text-lg text-white">
              Loading ...
            </div>
          ) : (
            <button
              onClick={handleCrateLandingPage}
              className="w-40 rounded-full bg-main-color py-2 font-Poppins text-lg text-white transition duration-150 hover:scale-105 active:bg-blue-700"
            >
              Create
            </button>
          )}
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
