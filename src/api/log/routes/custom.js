"use strict";

/**
 * Custom log routes
 */

module.exports = {
	routes: [
		{
			method: "GET",
			path: "/logs/export-excel",
			handler: "log.exportExcel",
			config: {
				policies: [],
				middlewares: [],
			},
		},
	],
};
