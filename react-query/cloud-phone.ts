import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreateCloudPhoneDto,
  CreateProxyDto,
  DeleteProxyDto,
  GetProxiesDto,
  UpdateProxyDto,
} from "../models/cloud-phone.model";
import {
  CreateCloudPhoneService,
  CreateProxyService,
  DeleteCloudPhoneService,
  DeleteProxyService,
  GetCloudPhonesService,
  GetProxiesService,
  StartCloudPhoneService,
  StopCloudPhoneService,
  UpdateProxyService,
} from "../services/cloud-phone";
import { userKeys } from "./user";

const itemKeys = {
  item: ["cloud-phones"],
  proxies: (dto: GetProxiesDto) => [itemKeys.item[0], "proxies", dto],
} as const;

export function useCreateCloudPhone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: itemKeys.item,
    mutationFn: (data: CreateCloudPhoneDto) => CreateCloudPhoneService(data),
    onSuccess(data, variables, context) {
      queryClient.refetchQueries({
        queryKey: userKeys.get,
      });
      queryClient.refetchQueries({
        queryKey: itemKeys.item,
      });
    },
  });
}

export function useGetCloudPhones() {
  return useQuery({
    queryKey: itemKeys.item,
    queryFn: () => GetCloudPhonesService(),
    refetchInterval: 5000,
  });
}

export function useStartCloudPhone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: itemKeys.item,
    mutationFn: (id: string) => StartCloudPhoneService(id),
    onSuccess(data, variables, context) {
      queryClient.refetchQueries({
        queryKey: itemKeys.item,
      });
    },
  });
}

export function useStopCloudPhone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: itemKeys.item,
    mutationFn: (id: string) => StopCloudPhoneService(id),
    onSuccess(data, variables, context) {
      queryClient.refetchQueries({
        queryKey: itemKeys.item,
      });
    },
  });
}

export function useDeleteCloudPhone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: itemKeys.item,
    mutationFn: (id: string) => DeleteCloudPhoneService(id),
    onSuccess(data, variables, context) {
      queryClient.refetchQueries({
        queryKey: itemKeys.item,
      });
    },
  });
}

export function useGetProxies(dto: GetProxiesDto) {
  return useQuery({
    queryKey: itemKeys.proxies(dto),
    queryFn: () => GetProxiesService(dto),
  });
}

export function useCreateProxy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: itemKeys.item,
    mutationFn: (data: CreateProxyDto) => CreateProxyService(data),
    onSuccess(data, variables, context) {
      queryClient.refetchQueries({
        queryKey: ["cloud-phones", "proxies"],
      });
    },
  });
}

export function useUpdateProxy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: itemKeys.item,
    mutationFn: (data: UpdateProxyDto) => UpdateProxyService(data),
    onSuccess(data, variables, context) {
      queryClient.refetchQueries({
        queryKey: ["cloud-phones", "proxies"],
      });
    },
  });
}

export function useDeleteProxy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: itemKeys.item,
    mutationFn: (data: DeleteProxyDto) => DeleteProxyService(data),
    onSuccess(data, variables, context) {
      queryClient.refetchQueries({
        queryKey: ["cloud-phones", "proxies"],
      });
    },
  });
}
