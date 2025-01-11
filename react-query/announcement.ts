import { useMutation, useQuery } from "@tanstack/react-query";
import {
  CreateAnnouncementService,
  DeleteAnnouncementService,
  GetAnnouncementService,
  GetByPageAnnouncementService,
  InputCreateAnnouncementService,
  InputDeleteAnnouncementService,
  RequestGetByPageAnnouncementService,
} from "../services/announcement";

export function useGetLatestAnnouncement() {
  return useQuery({
    queryKey: ["announcement"],
    queryFn: () => GetAnnouncementService(),
    refetchInterval: 60 * 1000,
  });
}

export function useGetByPageAnnouncement(
  input: RequestGetByPageAnnouncementService,
) {
  return useQuery({
    queryKey: [
      "announcements",
      {
        page: input.page,
        limit: input.limit,
      },
    ],
    queryFn: () => GetByPageAnnouncementService(input),
  });
}

export function useCreateAnnouncement() {
  return useMutation({
    mutationKey: ["create-announcement"],
    mutationFn: (data: InputCreateAnnouncementService) =>
      CreateAnnouncementService(data),
  });
}
export function useDeleteAnnouncement() {
  return useMutation({
    mutationKey: ["delete-announcement"],
    mutationFn: (data: InputDeleteAnnouncementService) =>
      DeleteAnnouncementService(data),
  });
}
