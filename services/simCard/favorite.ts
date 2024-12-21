import axios from "axios";
import { parseCookies } from "nookies";
import { FavoriteOnSimCard } from "../../models";

export type ResponseGetFavoriteOnSimcardService = FavoriteOnSimCard[];

export async function GetFavoriteOnSimcardService(): Promise<ResponseGetFavoriteOnSimcardService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const favorite = await axios({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/favorite-on-simcards/user`,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return favorite.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type ResponseCreateFavoriteOnSimcardService = FavoriteOnSimCard;

export type InputCreateFavoriteOnSimcardService = {
  simcardId: string;
  userId: string;
};
export async function CreateFavoriteOnSimcardService(
  input: InputCreateFavoriteOnSimcardService,
): Promise<ResponseCreateFavoriteOnSimcardService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const favorite = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/favorite-on-simcards`,
      data: {
        ...input,
      },
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return favorite.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}

export type ResponseDeleteFavoriteOnSimcardService = FavoriteOnSimCard;

export type InputDeleteFavoriteOnSimcardService = {
  favoriteId: string;
};
export async function DeleteFavoriteOnSimcardService(
  input: InputDeleteFavoriteOnSimcardService,
): Promise<ResponseDeleteFavoriteOnSimcardService> {
  try {
    const cookies = parseCookies();
    const access_token = cookies.access_token;
    const favorite = await axios({
      method: "DELETE",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/favorite-on-simcards/${input.favoriteId}`,
      headers: {
        Authorization: "Bearer " + access_token,
      },
      responseType: "json",
    });

    return favorite.data;
  } catch (err: any) {
    console.log(err);
    throw err.response.data;
  }
}
