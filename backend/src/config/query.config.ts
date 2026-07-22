import { Order } from "@/common/types/enums";
import type { QueryBuilderConfig } from "@/common/utils/query.utils";

export const donationQueryConfig = {
	filters: ["type", "status"],
	dateRanges: { createdAt: ["fromDate", "toDate"] },
	searchable: ["donor.name"],
	defaultSort: { createdAt: Order.DESC },
} satisfies QueryBuilderConfig;
