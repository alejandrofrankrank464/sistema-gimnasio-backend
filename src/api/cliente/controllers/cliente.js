"use strict";

/**
 * cliente controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::cliente.cliente", ({ strapi }) => ({
	async create(ctx) {
		// Guardar username en ctx.state para que lifecycle lo pueda leer
		const username = ctx.request.body.username || "Sistema";
		ctx.state._username = username;
		return await super.create(ctx);
	},

	async update(ctx) {
		// Guardar username y cambios en ctx.state para que lifecycle lo pueda leer
		const username = ctx.request.body.username || "Sistema";
		const cambios = ctx.request.body.cambios || {};
		ctx.state._username = username;
		ctx.state._cambios = cambios;
		return await super.update(ctx);
	},

	async delete(ctx) {
		// Guardar username en ctx.state para que lifecycle lo pueda leer
		const username = ctx.request.body?.username || "Sistema";
		ctx.state._username = username;
		return await super.delete(ctx);
	},
}));
