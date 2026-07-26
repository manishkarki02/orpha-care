import type { Order } from "@/common/types/enums";

/**
 * Declarative, per-feature description of how a validated query object maps
 * onto Prisma `findMany` arguments. Each key corresponds to one "condition
 * kind" the builder knows how to translate.
 */
export interface QueryBuilderConfig {
	/** Query keys applied as exact-match filters: `where[key] = query[key]`. */
	filters?: string[];

	/**
	 * Bounded ranges keyed by the Prisma field they target. The tuple is
	 * `[minQueryKey, maxQueryKey]`, producing `where[field] = { gte?, lte? }`.
	 * Works for any comparable scalar — `Int` (e.g. age), `Decimal`, or
	 * `DateTime` (e.g. createdAt) — since `gte`/`lte` is type-agnostic.
	 */
	ranges?: Record<string, [minKey: string, maxKey: string]>;

	/**
	 * Dotted paths that a free-text `q` fans out over, e.g. `"donor.name"`
	 * becomes `{ donor: { name: { contains: q, mode: "insensitive" } } }`.
	 * All paths are OR'd together.
	 */
	searchable?: string[];

	/** Fallback ordering when the query carries no `sortBy`. */
	defaultSort?: Record<string, Order>;
}

/** The pagination/sort/search fields every validated list query shares. */
interface BaseQuery {
	page?: number;
	limit?: number;
	order?: Order;
	q?: string;
	sortBy?: string;
	[key: string]: unknown;
}

/** Prisma `findMany` arguments the builder produces. */
export interface PrismaQueryArgs {
	where: Record<string, unknown>;
	orderBy: Record<string, Order>;
	skip: number;
	take: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const DEFAULT_ORDER: Order = "desc";

/**
 * Turn a dotted path into a nested Prisma `contains` fragment.
 * `("donor.name", "ram") -> { donor: { name: { contains: "ram", mode: "insensitive" } } }`
 */
function buildSearchFragment(path: string, value: string): Record<string, unknown> {
	const leaf: Record<string, unknown> = {
		contains: value,
		mode: "insensitive",
	};

	return path
		.split(".")
		.reverse()
		.reduce<Record<string, unknown>>((nested, segment) => ({ [segment]: nested }), leaf);
}

/**
 * Translate a **validated** query object into Prisma `findMany` args.
 *
 * The builder assumes Zod has already run: it does not validate, coerce, or
 * allowlist. Sort-column safety must be enforced upstream by a `sortBy` enum.
 *
 * It also does not own security-critical conditions. Soft-delete
 * (`deletedAt: null`) and ownership scoping belong to the caller, which should
 * spread the returned `where` into its own base:
 *
 * ```ts
 * const { where, orderBy, skip, take } = buildPrismaQuery(query, config);
 * await prisma.donation.findMany({
 *   where: { ...where, deletedAt: null },
 *   orderBy, skip, take,
 * });
 * ```
 */
export default function buildPrismaQuery(
	query: BaseQuery,
	config: QueryBuilderConfig = {},
): PrismaQueryArgs {
	const where: Record<string, unknown> = {};

	// 1. Exact-match filters
	for (const key of config.filters ?? []) {
		if (query[key] !== undefined) {
			where[key] = query[key];
		}
	}

	// 2. Bounded ranges (numbers or dates) -> { gte?, lte? }
	for (const [field, [minKey, maxKey]] of Object.entries(config.ranges ?? {})) {
		const min = query[minKey];
		const max = query[maxKey];
		if (min === undefined && max === undefined) continue;

		where[field] = {
			...(min !== undefined && { gte: min }),
			...(max !== undefined && { lte: max }),
		};
	}

	// 3. Free-text search fanned out across searchable paths
	const searchable = config.searchable ?? [];
	const searchTerm = query.q;
	if (searchTerm && searchable.length > 0) {
		where.OR = searchable.map((path) => buildSearchFragment(path, searchTerm));
	}

	// 4. Sort + pagination
	const defaultSort = config.defaultSort ?? { createdAt: DEFAULT_ORDER };
	const orderBy: Record<string, Order> =
		query.sortBy !== undefined
			? { [query.sortBy]: query.order ?? DEFAULT_ORDER }
			: Object.fromEntries(
					Object.entries(defaultSort).map(([field, direction]) => [
						field,
						query.order ?? direction,
					]),
				);

	const page = query.page ?? DEFAULT_PAGE;
	const limit = query.limit ?? DEFAULT_LIMIT;

	return {
		where,
		orderBy,
		skip: (page - 1) * limit,
		take: limit,
	};
}
