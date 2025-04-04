import { Alert, MenuItem, Snackbar, TextField } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import React, { useEffect, useRef, useState } from "react";
import { BiUpload } from "react-icons/bi";
import Swal from "sweetalert2";
import { languages } from "../../data/languages";
import DashboardLayout from "../../layouts/dashboardLayout";
import { Category, Language, Message, User } from "../../models";
import {
  DomainWithLandingPage,
  GetAllDomains,
} from "../../services/admin/domain";
import {
  GetLandingPageService,
  UpdateLandingPageService,
  UploadURLSingtureFavorIconService,
} from "../../services/admin/landingPage";
import { GetUser } from "../../services/admin/user";
// import EmailEditor from "react-email-editor";
import { Dropdown } from "primereact/dropdown";
import EmailEditor, { EditorRef, EmailEditorProps } from "react-email-editor";
import { MdDomainVerification } from "react-icons/md";
import ImageLibaray from "../../components/imageLibaray/ImageLibrary";
import { GetAllCategories } from "../../services/admin/categories";
// const EmailEditor = dynamic(() => import("react-email-editor"), {
//   ssr: false,
// });

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
}

function Index({ user }: { user: User }) {
  const emailEditorRef = useRef<EditorRef | null>(null);
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
    },
  );

  useEffect(() => {
    if (landingPage.isSuccess) {
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
        };
      });
      setIcon(() => landingPage?.data?.icon);
      const json = JSON.parse(landingPage?.data?.json);
      emailEditorRef?.current?.editor?.loadDesign(json);
    }
  }, [landingPage.isSuccess]);

  const handleOnReadyEmailEditor: EmailEditorProps["onReady"] = (unlayer) => {
    // emailEditorRef.current = { editor: unlayer };
    // unlayer.exportHtml((data) => {
    //   const { design, html } = data;
    // });
    // document.body.style.overflow = "auto";
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

  const handleUpdateLandingPage = async () => {
    setIsLoading(() => true);
    emailEditorRef.current?.editor?.exportHtml(async (data) => {
      try {
        const { design, html } = data;
        const json = JSON.stringify(design);

        await UpdateLandingPageService({
          query: {
            id: router?.query?.landingPageId as string,
          },
          body: {
            title: landingPageData.title,
            domainId: landingPageData?.domainId,
            html: html,
            json: json,
            backgroundImage: landingPageData.imageLink,
            mainButton: landingPageData.mainButton,
            directLink:
              landingPageData.directLink === ""
                ? null
                : landingPageData.directLink,
            name: landingPageData.name,
            icon: icon,
            categoryId: landingPageData.categoryId,
            language: landingPageData.language,
            description: landingPageData.description,
            googleAnalyticsId: landingPageData?.googleAnalyticsId as string,
            secondOffer:
              landingPageData.secondOffer === ""
                ? null
                : landingPageData.secondOffer,
            backOffer:
              landingPageData.backOffer === ""
                ? null
                : landingPageData.backOffer,
            ...(landingPageData.route && { route: landingPageData.route }),
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
        <main className="relative my-10  font-Poppins 2xl:w-full">
          {blurEditor && (
            <div
              className="absolute z-10  flex h-full w-full items-center 
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
          )}

          <EmailEditor
            editorId="editor"
            ref={emailEditorRef}
            onReady={handleOnReadyEmailEditor}
            style={{ height: "40rem", width: "80%" }}
            options={{
              displayMode: "web",
              customJS: [
                "http://localhost:8080/unlayer-custom/multiple-form.js",
              ],
            }}
            projectId={270222}
          />
          <div className="mt-5 flex w-11/12 justify-end">
            <ImageLibaray />{" "}
          </div>
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
        <div className="flex w-full items-center justify-center gap-5 py-5">
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
            onClick={handleUpdateLandingPage}
            className="w-40 rounded-full bg-main-color py-2 font-Poppins text-lg text-white transition duration-150 hover:scale-105 active:bg-blue-700"
          >
            update
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
