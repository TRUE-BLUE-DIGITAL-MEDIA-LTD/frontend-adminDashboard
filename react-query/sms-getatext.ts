import { useMutation, useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { GetatextPrice, SmsGetatext, SmsGetatextAccount } from "../models";
import {
  buySmsGetatextNumber,
  cancelSmsGetatextNumber,
  completeSmsGetatextNumber,
  getActiveSmsGetatextAccounts,
  getActiveSmsGetatextNumbers,
  getSmsGetatextBalance,
  getHistorySmsGetatext,
  getSmsGetatextPrices,
  setActiveSmsGetatextAccount,
} from "../services/sms-getatext";

export const useGetHistorySmsGetatext = (dto: {
  limit: number;
  page: number;
}) => {
  return useQuery({
    queryKey: ["sms-getatext-history", dto],
    queryFn: () => getHistorySmsGetatext(dto),
  });
};

export const useGetActiveSmsGetatextNumbers = () => {
  return useQuery({
    queryKey: ["sms-getatext-active-numbers"],
    queryFn: () => getActiveSmsGetatextNumbers(),
    refetchInterval: 5000,
  });
};

export const useGetSmsGetatextPrices = () => {
  return useQuery({
    queryKey: ["sms-getatext-prices"],
    queryFn: () => getSmsGetatextPrices(),
    staleTime: 60000,
  });
};

export const useBuySmsGetatextNumber = () => {
  return useMutation({
    mutationFn: (dto: {
      service: string;
      max_price?: number;
      carrier?: string;
      keep_carrier?: boolean;
      lock_area_code?: boolean;
      area_codes?: string;
    }) => buySmsGetatextNumber(dto),
  });
};

export const useCancelSmsGetatext = () => {
  return useMutation({
    mutationFn: (dto: { id: string }) => cancelSmsGetatextNumber(dto),
  });
};

export const useCompleteSmsGetatext = () => {
  return useMutation({
    mutationFn: (id: string) => completeSmsGetatextNumber(id),
  });
};

export const useGetSmsGetatextBalance = () => {
  return useQuery({
    queryKey: ["sms-getatext-balance"],
    queryFn: () => getSmsGetatextBalance(),
    refetchInterval: 10000,
  });
};

export const useGetSmsGetatextAccounts = () => {
  return useQuery({
    queryKey: ["sms-getatext-accounts"],
    queryFn: () => getActiveSmsGetatextAccounts(),
  });
};

export const useSetActiveSmsGetatextAccount = () => {
  return useMutation({
    mutationFn: (dto: { id: string }) => setActiveSmsGetatextAccount(dto),
  });
};
