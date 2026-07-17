import type { Request, RequestHandler } from "express";

export type ValidatedRequestHandler<
	TSchema extends { params?: any; body?: any; query?: any } = {
		params?: any;
		body?: any;
		query?: any;
	},
	TResponse = any,
> = RequestHandler<
	TSchema["params"] extends object ? TSchema["params"] : Request["params"],
	TResponse,
	TSchema["body"] extends object ? TSchema["body"] : Request["body"],
	TSchema["query"] extends object ? TSchema["query"] : Request["query"]
>;
