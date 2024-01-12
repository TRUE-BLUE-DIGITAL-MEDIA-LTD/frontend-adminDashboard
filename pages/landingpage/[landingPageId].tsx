import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { parseCookies } from "nookies";
import React, { useEffect, useRef, useState } from "react";
import { GetUser } from "../../services/admin/user";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { GetAllDomains } from "../../services/admin/domain";
import {
  GetLandingPageService,
  UpdateLandingPageService,
  UploadURLSingtureFavorIconService,
} from "../../services/admin/landingPage";
import Swal from "sweetalert2";
import { Language, Message, UnlayerMethods, User } from "../../models";
import DashboardLayout from "../../layouts/dashboardLayout";
import { Alert, MenuItem, Skeleton, Snackbar, TextField } from "@mui/material";
import FullLoading from "../../components/loadings/fullLoading";
import { languages } from "../../data/languages";
import { BiUpload } from "react-icons/bi";
import Image from "next/image";
import dynamic from "next/dynamic";
import { EmailEditorProps } from "react-email-editor";
import { GetAllCategories } from "../../services/admin/categories";
const EmailEditor: any = dynamic(() => import("react-email-editor"), {
  ssr: false,
});

interface UpdateLandingPageData {
  name: string;
  title: string;
  description: string;
  imageLink: string;
  mainButton: string;
  popUnder: string;
  domainId: string;
  language: Language;
  categoryId: string;
  googleAnalyticsId: string | null;
}

function Index({ user }: { user: User }) {
  const emailEditorRef = useRef<UnlayerMethods>();
  const router = useRouter();
  const [isLoadingUploadIcon, setIsLoadingUploadIcon] = useState(false);
  const [icon, setIcon] = useState<string | null>();

  const domains = useQuery({
    queryKey: ["domains"],
    queryFn: () => GetAllDomains(),
  });

  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: () => GetAllCategories(),
  });

  const landingPage = useQuery({
    queryKey: ["landingpage"],
    queryFn: () =>
      GetLandingPageService({
        landingPageId: router.query.landingPageId as string,
      }),
    enabled: false,
  });

  // redirect to page 404 if landing page not found
  if (landingPage.error) {
    router.push("/404");
  }
  const [isLoadingEditor, setIsLoadingEditor] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<Message>({
    status: "success",
    message: "",
  });
  const [open, setOpen] = useState(false);
  const [landingPageData, setLandingPageData] = useState<UpdateLandingPageData>(
    {
      name: "",
      title: "",
      description: "",
      imageLink: "",
      mainButton: "",
      popUnder: "",
      domainId: "",
      categoryId: "",
      language: "en",
      googleAnalyticsId: "",
    }
  );

  // start fetching landingpage when rounter is ready
  useEffect(() => {
    if (router.isReady) {
      landingPage.refetch();
    }
  }, [router.isReady]);

  useEffect(() => {
    if (landingPage.data && landingPage.isSuccess && !isLoadingEditor) {
      setLandingPageData(() => {
        return {
          name: landingPage.data.name,
          title: landingPage.data.title,
          description: landingPage.data.description,
          imageLink: landingPage.data.backgroundImage,
          mainButton: landingPage.data.mainButton,
          popUnder: landingPage.data.popUpUnder,
          domainId: landingPage?.data?.domain?.id as string,
          language: landingPage?.data?.language,
          categoryId: landingPage.data?.categoryId as string,
          googleAnalyticsId: landingPage?.data?.googleAnalyticsId as string,
        };
      });
      setIcon(() => landingPage?.data?.icon);
      const json = JSON.parse(landingPage?.data?.json);
      emailEditorRef?.current?.loadDesign(json);
    }
  }, [landingPage.isSuccess, landingPage.data, isLoadingEditor]);

  const onReady = (unlayer: UnlayerMethods) => {
    emailEditorRef.current = unlayer;
    unlayer.exportHtml((data) => {
      const { design, html } = data;
    });
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
    emailEditorRef.current?.exportHtml(async (data) => {
      try {
        const { design, html } = data;
        const json = JSON.stringify(design);

        await UpdateLandingPageService({
          title: landingPageData.title,
          domainId: landingPageData?.domainId,
          html: html,
          json: json,
          landingPageId: router?.query?.landingPageId as string,
          backgroundImage: landingPageData.imageLink,
          mainButton: landingPageData.mainButton,
          popUpUnder: landingPageData.popUnder,
          name: landingPageData.name,
          icon: icon,
          categoryId: landingPageData.categoryId,
          language: landingPageData.language,
          description: landingPageData.description,
          googleAnalyticsId: landingPageData?.googleAnalyticsId as string,
        });
        setMessage(() => {
          return {
            status: "success",
            message: "update successfully",
          };
        });
        const domain = domains?.data?.filter(
          (list) => list.id === landingPageData.domainId
        );

        Swal.fire({
          icon: "success",
          title: "success",
          text: "update successfully",
          footer: `<a target="_blank" href=${
            "https://" + domain?.[0]?.name
          }>click to open : ${domain?.[0]?.name}</a>`,
        });
        setIsLoading(() => false);
        setOpen(() => true);
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
      {(landingPage.isLoading || isLoadingEditor) && <FullLoading />}
      <div className="w-full mt-20 flex justify-start bg-white">
        <div className="ml-20 text-2xl pt-20 pb-2 font-bold border-b-2 w-full">
          <span className="text-icon-color">U</span>pdate Landing Page
        </div>
      </div>
      <main className="font-Poppins relative my-10">
        {isLoadingEditor && (
          <div className="w-full h-full absolute bg-second-color text-black font-semibold text-xl animate-pulse flex justify-center items-center">
            <span className="animate-bounce">Editor Is Loading ...</span>
          </div>
        )}

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
      <div className="w-full py-5 flex gap-5 justify-center items-center">
        <div className="grid grid-cols-3 w-10/12 gap-5">
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
            {icon ? (
              <div className="h-full w-20 ring-2 ring-black overflow-hidden rounded-lg flex items-center justify-center">
                {isLoadingUploadIcon ? (
                  <div className="w-full h-full bg-blue-500 animate-pulse"></div>
                ) : (
                  <div className="w-10 h-10 relative  bg-transparent">
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
                className="h-full w-20 ring-2 ring-black overflow-hidden
           rounded-lg flex items-center justify-center"
              >
                {isLoadingUploadIcon ? (
                  <div className="w-full h-full bg-blue-500 animate-pulse"></div>
                ) : (
                  <div className="w-10 h-10 relative  bg-transparent"></div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-full flex justify-start">
        <div className="ml-20 text-2xl pb-2 font-bold border-b-2 w-full">
          Affiliate Link
        </div>
      </div>
      <div className="w-full py-5 flex-wrap flex gap-5 flex-col justify-center items-center">
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
            name="popUnder"
            label="pop under"
            variant="outlined"
            required
            value={landingPageData.popUnder}
          />
        </div>
      </div>
      <div className="w-full flex justify-start">
        <div className="ml-20 text-2xl pb-2 font-bold border-b-2 w-full">
          Others
        </div>
      </div>
      <div className="w-full py-5 flex gap-5 flex-col justify-center items-center">
        <div className="grid grid-cols-3 w-10/12 gap-5">
          {domains.isLoading ? (
            <div>
              <Skeleton height={70} />
              <span className="animate-pulse">Domain Is Loading</span>
            </div>
          ) : (
            <TextField
              required
              id="outlined-select-currency"
              select
              name="domainId"
              label="Select"
              value={landingPageData.domainId}
              helperText="Please select your domain name"
            >
              {domains?.data?.map((domain) => {
                return (
                  <MenuItem
                    onClick={(e) => {
                      setLandingPageData((prev) => {
                        return {
                          ...prev,
                          domainId: e.currentTarget.dataset.value as string,
                        };
                      });
                    }}
                    key={domain.id}
                    value={domain.id}
                  >
                    <div className="flex  justify-start items-center gap-2">
                      <span>{domain.name}</span>
                    </div>
                  </MenuItem>
                );
              })}
            </TextField>
          )}
          {domains.isLoading ? (
            <div>
              <Skeleton height={70} />
              <span className="animate-pulse">Domain Is Loading</span>
            </div>
          ) : (
            <TextField
              required
              id="outlined-select-currency"
              select
              name="categoryId"
              label="Select"
              value={landingPageData.categoryId}
              helperText="Please select your category here"
            >
              {categories?.data?.map((category) => {
                return (
                  <MenuItem
                    onClick={(e) => {
                      setLandingPageData((prev) => {
                        return {
                          ...prev,
                          categoryId: e.currentTarget.dataset.value as string,
                        };
                      });
                    }}
                    key={category.id}
                    value={category.id}
                  >
                    <div className="flex  justify-start items-center gap-2">
                      <span>{category.title}</span>
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
            loading ...
          </div>
        ) : (
          <button
            onClick={handleCrateLandingPage}
            className="w-40 py-2 text-white rounded-full hover:scale-105 transition duration-150 active:bg-blue-700 font-Poppins text-lg bg-main-color"
          >
            update
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
