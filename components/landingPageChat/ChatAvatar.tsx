import { LuSparkles } from "react-icons/lu";

export function UserAvatar({ name, image, small = false }: { name?: string; image?: string; small?: boolean }) {
  const size = small ? "h-6 w-6 text-[10px]" : "h-7 w-7 text-xs";
  if (image) {
    return <img src={image} alt={name ?? ""} title={name} className={`${size} shrink-0 rounded-full object-cover ring-2 ring-panel`} />;
  }
  return (
    <span
      title={name}
      className={`${size} flex shrink-0 items-center justify-center rounded-full bg-blue-500/15 font-semibold text-blue-700 ring-2 ring-panel dark:text-blue-300`}
    >
      {(name ?? "?").slice(0, 1).toUpperCase()}
    </span>
  );
}

export function AiAvatar({ large = false }: { large?: boolean }) {
  const size = large ? "h-11 w-11 [&>svg]:h-5 [&>svg]:w-5" : "h-7 w-7 [&>svg]:h-3.5 [&>svg]:w-3.5";
  return (
    <span className={`${size} flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-white`}>
      <LuSparkles />
    </span>
  );
}
