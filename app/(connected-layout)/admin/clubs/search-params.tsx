import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";

export const searchParamsCache = createSearchParamsCache({
  search: parseAsString.withDefault(""),
  sortBy: parseAsStringLiteral(["name"] as const).withDefault("name"),
  page: parseAsInteger.withDefault(1),
});