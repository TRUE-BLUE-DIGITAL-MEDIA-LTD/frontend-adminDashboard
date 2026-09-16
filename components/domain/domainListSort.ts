import { DomainListSort } from "../../models";

const SORTS: DomainListSort[] = ["name", "load-desc", "load-asc"];

export function nextDomainListSort(current: DomainListSort | undefined): DomainListSort | undefined {
  if (current === "load-desc") return "load-asc";
  if (current === "load-asc") return undefined;
  return "load-desc";
}

export function parseDomainListSort(value: unknown): DomainListSort | undefined {
  return typeof value === "string" && (SORTS as string[]).includes(value) ? (value as DomainListSort) : undefined;
}
