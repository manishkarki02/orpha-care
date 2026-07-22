import type { Request, RequestHandler } from "express";

export type ValidatedRequestHandler<
	TSchema extends { params?: unknown; body?: unknown; query?: unknown } = {
		params?: unknown;
		body?: unknown;
		query?: unknown;
	},
	TResponse = unknown,
> = RequestHandler<
	TSchema["params"] extends object ? TSchema["params"] : Request["params"],
	TResponse,
	TSchema["body"] extends object ? TSchema["body"] : Request["body"],
	TSchema["query"] extends object ? TSchema["query"] : Request["query"]
>;
