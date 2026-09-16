import axios from "axios";

export interface RequestSignUpCodeInput {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  turnstileToken: string;
}

export interface VerifySignUpCodeInput {
  email: string;
  code: string;
}

const headers = { "Content-Type": "application/json" };

export async function requestSignUpCode(
  input: RequestSignUpCodeInput,
): Promise<void> {
  try {
    await axios.post(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/sign-up/request-code`,
      input,
      { headers },
    );
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export async function verifySignUpCode(
  input: VerifySignUpCodeInput,
): Promise<{ ok: true }> {
  try {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/sign-up/verify-code`,
      input,
      { headers },
    );
    return res.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}
