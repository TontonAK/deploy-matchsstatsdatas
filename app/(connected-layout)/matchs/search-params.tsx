import {
  createSearchParamsCache,
  parseAsInteger,
} from "nuqs/server";

export const searchParamsCache = createSearchParamsCache({
  seasonId: parseAsInteger,
  clubId: parseAsInteger,
  teamId: parseAsInteger,
  page: parseAsInteger.withDefault(1),
});