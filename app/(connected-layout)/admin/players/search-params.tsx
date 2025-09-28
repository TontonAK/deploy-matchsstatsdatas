import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";

export const searchParamsCache = createSearchParamsCache({
  search: parseAsString.withDefault(""),
  clubId: parseAsInteger,
  sortBy: parseAsStringLiteral(["name", "club"] as const).withDefault("name"),
  page: parseAsInteger.withDefault(1),
});