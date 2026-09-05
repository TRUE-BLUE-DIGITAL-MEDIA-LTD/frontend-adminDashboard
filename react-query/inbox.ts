import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  EnableMailService,
  GetInboundEmailService,
  ListInboundEmailsService,
  ListMailboxesService,
  MarkEmailReadService,
} from "../services/admin/inbox";

export const keyInbox = {
  mailboxes: ["inbox-mailboxes"] as const,
  emails: (mailboxId: string, page: number) =>
    ["inbox-emails", mailboxId, page] as const,
  email: (emailId: string) => ["inbox-email", emailId] as const,
};

export function useInboxMailboxes() {
  return useQuery({
    queryKey: keyInbox.mailboxes,
    queryFn: () => ListMailboxesService({}),
    staleTime: 30 * 1000, // an inbox must not use the app's 1-hour default
    refetchInterval: 60 * 1000,
  });
}

export function useInboxEmails(mailboxId: string | null, page: number) {
  return useQuery({
    queryKey: keyInbox.emails(mailboxId ?? "", page),
    queryFn: () =>
      ListInboundEmailsService({ mailboxId: mailboxId!, page, limit: 20 }),
    enabled: !!mailboxId,
    staleTime: 30 * 1000,
  });
}

export function useInboxEmail(emailId: string | null) {
  return useQuery({
    queryKey: keyInbox.email(emailId ?? ""),
    queryFn: () => GetInboundEmailService(emailId!),
    enabled: !!emailId,
  });
}

export function useMarkEmailRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (emailId: string) => MarkEmailReadService(emailId),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: keyInbox.mailboxes });
      queryClient.invalidateQueries({ queryKey: ["inbox-emails"] });
    },
  });
}

export function useEnableMail() {
  return useMutation({
    mutationFn: (input: { domainId: string }) => EnableMailService(input),
  });
}
