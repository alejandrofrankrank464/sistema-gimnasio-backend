"use strict";

/**
 * configuracion router
 */

const { createCoreRouter } = require("@strapi/strapi").factories;

module.exports = {
	routes: [
		{
			method: "GET",
			path: "/configuraciones/precios",
			handler: "configuracion.getPrecios",
			config: {
				policies: [],
				middlewares: [],
			},
		},
		{
			method: "POST",
			path: "/configuraciones/upsert",
			handler: "configuracion.upsert",
			config: {
				policies: [],
				middlewares: [],
			},
		},
		{
			method: "GET",
			path: "/configuraciones/clave/:clave",
			handler: "configuracion.findByClave",
			config: {
				policies: [],
				middlewares: [],
			},
		},
		{
			method: "GET",
			path: "/configuraciones/logo",
			handler: "configuracion.getLogo",
			config: {
				policies: [],
				middlewares: [],
			},
		},
		{
			method: "POST",
			path: "/configuraciones/logo",
			handler: "configuracion.uploadLogo",
			config: {
				policies: [],
				middlewares: [],
			},
		},
	],
};
