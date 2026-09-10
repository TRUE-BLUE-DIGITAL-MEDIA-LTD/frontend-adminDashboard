import { SmsBulkProps } from "./SmsBulk";

function SmsTab({ user }: SmsBulkProps) {
  return <p className="text-sm text-gray-500">SMS tab for {user.email}</p>;
}

export default SmsTab;
