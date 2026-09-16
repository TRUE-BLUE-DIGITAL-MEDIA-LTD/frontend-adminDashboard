import { GetServerSideProps, GetServerSidePropsContext } from "next";
import Image from "next/image";
import Link from "next/link";
import { parseCookies } from "nookies";
import { GetUser } from "../../services/admin/user";

function Pending() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-between bg-gradient-to-b from-second-color to-supper-main-color">
      <div className="mt-32 flex w-11/12 max-w-md flex-col items-center justify-center gap-4 text-center">
        <div className="relative h-10 w-10 overflow-hidden rounded-full bg-black">
          <Image
            src="/favicon.ico"
            fill
            className="object-contain"
            alt="logo oxyclick.com"
          />
        </div>
        <h1 className="font-Poppins text-xl font-semibold md:text-3xl">
          Your account is waiting for approval
        </h1>
        <p className="font-Poppins text-base text-icon-color md:text-lg">
          Thanks for signing up. An OxyClick admin needs to approve your
          account before you can sign in. We will let you know once it is
          ready.
        </p>
        <Link
          href="/auth/sign-in"
          className="mt-4 rounded-lg bg-blue-500 px-10 py-2 font-Poppins text-lg font-semibold text-white ring-blue-200 transition duration-150 hover:bg-blue-600 hover:ring-2 active:scale-110"
        >
          Back to sign in
        </Link>
      </div>
      <footer className="mb-4 font-Poppins text-xs text-icon-color">
        Oxyclick.com
      </footer>
    </div>
  );
}

export default Pending;

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  try {
    const cookies = parseCookies(context);
    await GetUser({ access_token: cookies.access_token });
    return { redirect: { permanent: false, destination: "/" } };
  } catch (err) {
    return { props: {} };
  }
};
