import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { parseCookies } from "nookies";
import React, { useEffect, useRef, useState } from "react";
import { GetUser } from "../../services/admin/user";
import { Language, Message, UnlayerMethods, User } from "../../models";
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
const EmailEditor: any = dynamic(() => import("react-email-editor"), {
  ssr: false,
});

interface CreateLandingPageData {
  name: string;
  title: string;
  description: string;
  backgroundImage: string;
  mainButton: string;
  popUpUnder: string;
  domainId?: string;
  googleAnalyticsId?: string | null;
  language: Language;
}

function Index({ user }: { user: User }) {
  const emailEditorRef = useRef<UnlayerMethods>();
  const router = useRouter();
  const [isLoadingUploadIcon, setIsLoadingUploadIcon] = useState(false);
  const [icon, setIcon] = useState<string | null>();
  const [isLoadingEditor, setIsLoadingEditor] = useState(true);

  const domains = useQuery({
    queryKey: ["domains"],
    queryFn: () => GetAllDomains(),
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<Message>({
    status: "success",
    message: "",
  });

  const [open, setOpen] = useState(false);
  const [landingPageData, setLandingPageData] = useState<CreateLandingPageData>(
    {
      name: "",
      title: "",
      description: "",
      backgroundImage: "",
      mainButton: "",
      popUpUnder: "",
      domainId: "",
      googleAnalyticsId: "",
      language: "en",
    }
  );

  //trigger overflow hiden to the body
  useEffect(() => {
    document.body.style.overflow = "hidden";
  }, []);

  const onReady = (unlayer: UnlayerMethods) => {
    emailEditorRef.current = unlayer;
    unlayer.exportHtml((data) => {
      const { design, html } = data;
    });
    document.body.style.overflow = "auto";
    setIsLoadingEditor(() => false);
    // unlayer.loadDesign(json);
  };

  const handleChangeLandingPageData = (
    e: React.ChangeEvent<HTMLInputElement>
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
    emailEditorRef?.current?.exportHtml(async (data) => {
      try {
        const createLandingPageData: CreateLandingPageData = {
          title: landingPageData.title,
          backgroundImage: landingPageData.backgroundImage,
          mainButton: landingPageData.mainButton,
          popUpUnder: landingPageData.popUpUnder,
          name: landingPageData.name,
          language: landingPageData.language,
          description: landingPageData.description,
          googleAnalyticsId: landingPageData?.googleAnalyticsId,
        };
        if (landingPageData.domainId) {
          createLandingPageData.domainId = landingPageData.domainId;
        }
        const { design, html } = data;
        const json = JSON.stringify(design);
        await CreateLandingPageService({
          html: html,
          json: json,
          icon: icon,
          ...createLandingPageData,
        });
        setMessage(() => {
          return {
            status: "success",
            message: "create successfully",
          };
        });
        setOpen(() => true);
        router.push("/");
        setIsLoading(() => false);
      } catch (err: any) {
        if (err?.props?.response?.data?.message === "Unauthorized") {
          location.reload();
        }
        console.log(err);
        setOpen(() => true);
        setIsLoading(() => false);
        setMessage(() => {
          return {
            status: "error",
            message: err?.props?.response?.data?.message?.toString()
              ? err?.props?.response?.data?.message?.toString()
              : "something went worng",
          };
        });
      }
    });
  };
  const handleClose = (event: React.SyntheticEvent | Event, reason: string) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };
  //handle icon image update
  const handleFileInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>
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
      {isLoadingEditor && <FullLoading />}
      <div className="w-full flex justify-start bg-white">
        <div className="ml-20 text-2xl pt-20 pb-2 font-bold border-b-2 w-full">
          Create Landing Page
        </div>
      </div>
      <main className="font-Poppins relative my-10">
        <EmailEditor
          ref={emailEditorRef}
          onReady={onReady}
          options={{ displayMode: "web" }}
        />
      </main>
      <div className="w-full flex justify-start">
        <div className="ml-20 text-2xl pb-2 font-bold border-b-2 w-full">
          General Information
        </div>
      </div>
      <div className="w-full py-5 flex gap-5 flex-col justify-center items-center">
        <div className="grid grid-cols-3 w-10/12 gap-5">
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
            id="outlined-select-currency"
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
                  <div className="flex justify-start items-center gap-2">
                    <span>{option.name}</span>
                  </div>
                </MenuItem>
              );
            })}
          </TextField>
        </div>
      </div>
      <div className="w-full flex justify-start">
        <div className="ml-20 text-2xl pb-2 font-bold border-b-2 w-full">
          SEO Information
        </div>
      </div>
      <div className="w-full py-5 flex gap-5 flex-col flex-wrap justify-center items-center">
        <div className="grid grid-cols-3 w-10/12 gap-5 ">
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
                className="w-full px-2 h-10 bg-white hover:scale-105 cursor-pointer
         transition duration-100 ring-2 gap-2 ring-black text-xl flex items-center justify-center rounded-md "
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

            <div className="h-full w-20 ring-2 ring-black overflow-hidden rounded-lg flex items-center justify-center">
              {isLoadingUploadIcon ? (
                <div className="w-full h-full bg-blue-500 animate-pulse"></div>
              ) : (
                <div className="w-10 h-10 relative  bg-transparent">
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
      <div className="w-full flex justify-start">
        <div className="ml-20 text-2xl pb-2 font-bold border-b-2 w-full">
          Affiliate Link
        </div>
      </div>
      <div className="w-full py-5 flex gap-5 flex-col justify-center items-center">
        <div className="grid grid-cols-3 w-10/12 gap-5">
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
            name="popUpUnder"
            label="pop under"
            variant="outlined"
            required
            value={landingPageData.popUpUnder}
          />
        </div>
      </div>
      <div className="w-full flex justify-start">
        <div className="ml-20 text-2xl pb-2 font-bold border-b-2 w-full">
          Domain Name (Optional)
        </div>
      </div>
      <div className="w-full py-5 flex gap-5 flex-col justify-center items-center">
        <div className="grid grid-cols-3 w-10/12 gap-5">
          {domains.isLoading ? (
            <div>
              <Skeleton height={70} />
              <span className="animate-pulse">Domain Is Loading ..</span>
            </div>
          ) : (
            <TextField
              required
              id="outlined-select-currency"
              select
              name="domainId"
              label="Select"
              onChange={handleChangeLandingPageData}
              helperText="Please select your domain name"
            >
              {domains?.data?.map((option) => {
                return (
                  <MenuItem key={option.id} value={option.id}>
                    <div className="flex justify-start items-center gap-2">
                      <span>{option.name}</span>
                      {option.landingPages.length > 0 && (
                        <span className="w-max h-max p-1 px-4 bg-main-color text-white rounded-md">
                          own
                        </span>
                      )}
                    </div>
                  </MenuItem>
                );
              })}
            </TextField>
          )}
        </div>
      </div>
      <div className="w-full flex justify-center pb-10">
        {isLoading || isLoadingEditor ? (
          <div className="w-40 py-2 text-center animate-pulse text-white rounded-full font-Poppins text-lg bg-main-color">
            Loading ...
          </div>
        ) : (
          <button
            onClick={handleCrateLandingPage}
            className="w-40 py-2 text-white rounded-full hover:scale-105 transition duration-150 active:bg-blue-700 font-Poppins text-lg bg-main-color"
          >
            Create
          </button>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Index;

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  try {
    const cookies = parseCookies(context);
    const accessToken = cookies.access_token;
    const user = await GetUser({ access_token: accessToken });
    return {
      props: {
        user,
      },
    };
  } catch (err) {
    return {
      redirect: {
        permanent: false,
        destination: "/auth/sign-in",
      },
    };
  }
};
