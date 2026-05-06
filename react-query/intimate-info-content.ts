import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getIntimateInfoContents,
  getIntimateInfoContent,
  createIntimateInfoContent,
  updateIntimateInfoContent,
  deleteIntimateInfoContent,
  generateHtmlForContent,
  uploadToWordpress,
  getWordpressCategories,
  getWordpressAuthors,
  GetIntimateInfoContentsParams,
} from "../services/intimate-info-content";

export const useIntimateInfoContents = (
  params: GetIntimateInfoContentsParams,
) => {
  return useQuery({
    queryKey: ["intimateInfoContents", params],
    queryFn: () => getIntimateInfoContents(params),
  });
};

export const useIntimateInfoContent = (id: string) => {
  return useQuery({
    queryKey: ["intimateInfoContent", id],
    queryFn: () => getIntimateInfoContent(id),
    enabled: !!id,
  });
};

export const useCreateIntimateInfoContent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createIntimateInfoContent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["intimateInfoContents"] });
    },
  });
};

export const useUpdateIntimateInfoContent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateIntimateInfoContent,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["intimateInfoContents"] });
      queryClient.invalidateQueries({
        queryKey: ["intimateInfoContent", data.id],
      });
    },
  });
};

export const useDeleteIntimateInfoContent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteIntimateInfoContent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["intimateInfoContents"] });
    },
  });
};

export const useGenerateHtmlForContent = () => {
  return useMutation({
    mutationFn: (variables: {
      title: string;
      keyword: string;
      excerpt: string;
      additionalPrompt?: string;
      onChunk?: (text: string) => void;
    }) => {
      const { onChunk, ...dto } = variables;
      return generateHtmlForContent(dto, onChunk);
    },
  });
};

export const useUploadToWordpress = () => {
  return useMutation({
    mutationFn: uploadToWordpress,
  });
};

export const useWordpressCategories = () => {
  return useQuery({
    queryKey: ["wordpressCategories"],
    queryFn: () => getWordpressCategories(),
  });
};

export const useWordpressAuthors = () => {
  return useQuery({
    queryKey: ["wordpressAuthors"],
    queryFn: () => getWordpressAuthors(),
  });
};
