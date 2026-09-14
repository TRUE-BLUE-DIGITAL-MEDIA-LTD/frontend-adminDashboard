import { Skeleton } from "@mui/material";
import { useState } from "react";
import { MdExpandLess, MdExpandMore } from "react-icons/md";
import { InboxDomainGroup } from "../../models";

interface MailboxSidebarProps {
  domains: InboxDomainGroup[] | undefined;
  isLoading: boolean;
  selectedMailboxId: string | null;
  onSelectMailbox: (mailboxId: string) => void;
}

export default function MailboxSidebar({
  domains,
  isLoading,
  selectedMailboxId,
  onSelectMailbox,
}: MailboxSidebarProps) {
  const [expandedDomainIds, setExpandedDomainIds] = useState<Set<string>>(
    () => {
      const selected = domains?.find((group) =>
        group.mailboxes.some((mailbox) => mailbox.id === selectedMailboxId),
      );
      return new Set(selected ? [selected.domainId] : []);
    },
  );

  const toggleDomain = (domainId: string) => {
    setExpandedDomainIds((prev) => {
      const next = new Set(prev);
      if (next.has(domainId)) {
        next.delete(domainId);
      } else {
        next.add(domainId);
      }
      return next;
    });
  };

  return (
    <aside className="sticky top-24 max-h-[calc(100vh-7rem)] self-start overflow-y-auto rounded-xl border bg-white p-4 shadow-sm">
      {isLoading ? (
        <Skeleton variant="rectangular" height={200} />
      ) : (domains?.length ?? 0) === 0 ? (
        <p className="text-sm text-gray-500">
          No mail yet. Enable mail on a domain and share an address like
          hello@your-domain.com.
        </p>
      ) : (
        domains?.map((group) => {
          const isExpanded = expandedDomainIds.has(group.domainId);
          const domainUnread = group.mailboxes.reduce(
            (sum, mailbox) => sum + mailbox.unreadCount,
            0,
          );
          return (
            <div key={group.domainId} className="mb-2">
              <button
                type="button"
                onClick={() => toggleDomain(group.domainId)}
                className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left hover:bg-gray-50"
              >
                <span className="text-xs font-semibold uppercase text-gray-500">
                  {group.domainName}
                </span>
                <span className="flex items-center gap-1">
                  {!isExpanded && domainUnread > 0 && (
                    <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
                      {domainUnread}
                    </span>
                  )}
                  {isExpanded ? (
                    <MdExpandLess className="text-gray-400" />
                  ) : (
                    <MdExpandMore className="text-gray-400" />
                  )}
                </span>
              </button>
              {isExpanded &&
                group.mailboxes.map((mailbox) => (
                  <button
                    key={mailbox.id}
                    onClick={() => onSelectMailbox(mailbox.id)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                      selectedMailboxId === mailbox.id
                        ? "bg-blue-50 font-medium text-blue-700"
                        : "text-gray-700"
                    }`}
                  >
                    <span className="truncate">
                      {mailbox.localPart}@{group.domainName}
                    </span>
                    {mailbox.unreadCount > 0 && (
                      <span className="ml-2 shrink-0 rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
                        {mailbox.unreadCount}
                      </span>
                    )}
                  </button>
                ))}
            </div>
          );
        })
      )}
    </aside>
  );
}
