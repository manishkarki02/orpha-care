import { Order } from "@/common/types/enums";
import type { QueryBuilderConfig } from "@/common/utils/query.utils";

export const donationQueryConfig = {
	filters: ["type", "status"],
	ranges: { createdAt: ["fromDate", "toDate"] },
	searchable: ["donor.name"],
	defaultSort: { createdAt: Order.DESC },
} satisfies QueryBuilderConfig;

export const kidsAllQueryConfig = {
	filters: ["gender", "province", "isAdopted"],
	ranges: { dob: ["fromDate", "toDate"] },
	searchable: ["name", "createdBy.name"],
	defaultSort: { createdAt: Order.DESC },
} satisfies QueryBuilderConfig;

export const kidsQueryConfig = {
	filters: ["gender", "province"],
	ranges: { dob: ["fromDate", "toDate"] },
	searchable: ["name"],
	defaultSort: { createdAt: Order.DESC },
} satisfies QueryBuilderConfig;
