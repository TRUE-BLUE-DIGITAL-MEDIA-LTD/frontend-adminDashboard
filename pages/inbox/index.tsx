import { Pagination, Skeleton } from "@mui/material";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { parseCookies } from "nookies";
import { useEffect, useState } from "react";
import { MdEmail, MdMarkEmailUnread } from "react-icons/md";
import EmailDetailPanel from "../../components/inbox/EmailDetailPanel";
import { formatSender } from "../../components/inbox/format";
import DashboardLayout from "../../layouts/dashboardLayout";
import { User } from "../../models";
import { useInboxEmails, useInboxMailboxes } from "../../react-query";
import { GetUser } from "../../services/admin/user";

function Inbox({ user }: { user: User }) {
  const [selectedMailboxId, setSelectedMailboxId] = useState<string | null>(
    null,
  );
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const mailboxes = useInboxMailboxes();
  const emails = useInboxEmails(selectedMailboxId, page);

  // Modal behavior for the detail popup: Esc closes, page behind must not scroll.
  useEffect(() => {
    if (!selectedEmailId) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedEmailId(null);
    };
    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [selectedEmailId]);

  return (
    <DashboardLayout user={user}>
      <div className="min-h-screen w-full p-5 pt-24 font-Poppins">
        <h1 className="mb-6 flex items-center gap-2 text-2xl font-bold">
          <MdEmail className="text-blue-600" /> Inbox
        </h1>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
          {/* Mailbox folders, grouped by domain */}
          <aside className="rounded-xl border bg-white p-4 shadow-sm">
            {mailboxes.isLoading ? (
              <Skeleton variant="rectangular" height={200} />
            ) : (mailboxes.data?.domains.length ?? 0) === 0 ? (
              <p className="text-sm text-gray-500">
                No mail yet. Enable mail on a domain and share an address like
                hello@your-domain.com.
              </p>
            ) : (
              mailboxes.data?.domains.map((group) => (
                <div key={group.domainId} className="mb-4">
                  <h2 className="mb-1 text-xs font-semibold uppercase text-gray-400">
                    {group.domainName}
                  </h2>
                  {group.mailboxes.map((mailbox) => (
                    <button
                      key={mailbox.id}
                      onClick={() => {
                        setSelectedMailboxId(mailbox.id);
                        setPage(1);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                        selectedMailboxId === mailbox.id
                          ? "bg-blue-50 font-medium text-blue-700"
                          : "text-gray-700"
                      }`}
                    >
                      <span>
                        {mailbox.localPart}@{group.domainName}
                      </span>
                      {mailbox.unreadCount > 0 && (
                        <span className="ml-2 rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
                          {mailbox.unreadCount}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              ))
            )}
          </aside>

          {/* Message list for the selected mailbox */}
          <section className="rounded-xl border bg-white p-4 shadow-sm">
            {!selectedMailboxId ? (
              <p className="p-6 text-center text-sm text-gray-500">
                Select a mailbox to read its messages.
              </p>
            ) : emails.isLoading ? (
              <Skeleton variant="rectangular" height={300} />
            ) : (
              <>
                <ul className="divide-y">
                  {emails.data?.data.map((email) => (
                    <li
                      key={email.id}
                      onClick={() => setSelectedEmailId(email.id)}
                      className="flex cursor-pointer items-center gap-3 px-3 py-3 hover:bg-gray-50"
                    >
                      {!email.isRead && (
                        <MdMarkEmailUnread className="shrink-0 text-blue-600" />
                      )}
                      <span
                        className={`w-48 truncate text-sm ${
                          email.isRead ? "text-gray-600" : "font-semibold"
                        }`}
                      >
                        {formatSender(email.fromName, email.fromAddress)}
                      </span>
                      <span
                        className={`flex-1 truncate text-sm ${
                          email.isRead ? "text-gray-500" : "font-medium"
                        }`}
                      >
                        {email.subject || "(no subject)"}
                      </span>
                      <span className="shrink-0 text-xs text-gray-400">
                        {new Date(email.createAt).toLocaleDateString()}
                      </span>
                    </li>
                  ))}
                  {emails.data?.data.length === 0 && (
                    <li className="p-6 text-center text-sm text-gray-500">
                      This mailbox is empty.
                    </li>
                  )}
                </ul>
                {(emails.data?.meta.lastPage ?? 1) > 1 && (
                  <div className="mt-4 flex justify-center">
                    <Pagination
                      count={emails.data?.meta.lastPage ?? 1}
                      page={page}
                      onChange={(_, value) => setPage(value)}
                    />
                  </div>
                )}
              </>
            )}
          </section>
        </div>

        {/* Detail overlay — same hand-rolled modal as pages/analytics/index.tsx */}
        {selectedEmailId && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setSelectedEmailId(null)}
          >
            <div
              className="relative max-h-[85vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                aria-label="Close"
                className="absolute right-4 top-4 text-xl leading-none text-gray-400 hover:text-gray-600"
                onClick={() => setSelectedEmailId(null)}
              >
                ✕
              </button>
              <EmailDetailPanel emailId={selectedEmailId} />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Inbox;

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  try {
    const cookies = parseCookies(context);
    const accessToken = cookies.access_token;
    const user = await GetUser({ access_token: accessToken });
    if (user.TOTPenable === false) {
      return {
        redirect: { permanent: false, destination: "/auth/setup-totp" },
      };
    }
    return { props: { user } };
  } catch (err) {
    return {
      redirect: { permanent: false, destination: "https://home.oxyclick.com" },
    };
  }
};
