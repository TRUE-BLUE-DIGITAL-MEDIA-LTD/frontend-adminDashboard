import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreateCloudPhoneDto,
  CreateProxyDto,
  DeleteProxyDto,
  GetGpsDto,
  GetProxiesDto,
  SetGpsDto,
  UpdateCloudPhoneDto,
  UpdateProxyDto,
} from "../models/cloud-phone.model";
import {
  CreateCloudPhoneService,
  CreateProxyService,
  DeleteCloudPhoneService,
  DeleteProxyService,
  GetCloudPhonesService,
  GetGpsService,
  GetProxiesService,
  SetGpsService,
  StartCloudPhoneService,
  StopCloudPhoneService,
  UpdateCloudPhoneService,
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

export function useUpdateCloudPhone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: itemKeys.item,
    mutationFn: (data: UpdateCloudPhoneDto) => UpdateCloudPhoneService(data),
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

export function useGetGps(dto: GetGpsDto) {
  return useQuery({
    queryKey: [...itemKeys.item, "gps", dto],
    queryFn: () => GetGpsService(dto),
    enabled: dto.id !== "",
  });
}

export function useSetGps() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [...itemKeys.item, "gps"],
    mutationFn: (dto: SetGpsDto) => SetGpsService(dto),
    onSuccess(data, variables, context) {
      queryClient.refetchQueries({
        queryKey: [...itemKeys.item, "gps"],
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
