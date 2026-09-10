import { SmsBulkProps } from "./SmsBulk";

function EmailTab({ user }: SmsBulkProps) {
  return <p className="text-sm text-gray-500">Email tab for {user.email}</p>;
}

export default EmailTab;
