"use strict";

/**
 * configuracion controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
	"api::configuracion.configuracion",
	({ strapi }) => ({
		// Obtener configuración por clave
		async findByClave(ctx) {
			const { clave } = ctx.params;

			try {
				const config = await strapi.db
					.query("api::configuracion.configuracion")
					.findOne({
						where: { clave },
					});

				if (!config) {
					return ctx.notFound("Configuración no encontrada");
				}

				return { data: config };
			} catch (error) {
				strapi.log.error("Error al obtener configuración:", error);
				return ctx.internalServerError(
					"Error al obtener configuración"
				);
			}
		},

		// Actualizar o crear configuración
		async upsert(ctx) {
			const { clave, valor } = ctx.request.body;

			if (!clave || valor === undefined) {
				return ctx.badRequest("Se requieren los campos clave y valor");
			}

			try {
				const existing = await strapi.db
					.query("api::configuracion.configuracion")
					.findOne({
						where: { clave },
					});

				let result;
				if (existing) {
					result = await strapi.db
						.query("api::configuracion.configuracion")
						.update({
							where: { id: existing.id },
							data: { valor: String(valor) },
						});
				} else {
					result = await strapi.db
						.query("api::configuracion.configuracion")
						.create({
							data: { clave, valor: String(valor) },
						});
				}

				return { data: result };
			} catch (error) {
				strapi.log.error("Error al guardar configuración:", error);
				return ctx.internalServerError(
					"Error al guardar configuración"
				);
			}
		},

		// Obtener todas las configuraciones de precios
		async getPrecios(ctx) {
			try {
				const precios = await strapi.db
					.query("api::configuracion.configuracion")
					.findMany({
						where: {
							clave: {
								$in: [
									"precio_normal",
									"precio_vip",
									"precio_zumba_o_box",
									"precio_zumba_y_box",
									"precio_vip_zumba_y_box",
								],
							},
						},
					});

				const preciosObj = {
					precio_normal: 30,
					precio_vip: 50,
					precio_zumba_o_box: 40,
					precio_zumba_y_box: 60,
					precio_vip_zumba_y_box: 80,
				};

				precios.forEach((p) => {
					preciosObj[p.clave] = parseFloat(p.valor);
				});

				return { data: preciosObj };
			} catch (error) {
				strapi.log.error("Error al obtener precios:", error);
				return ctx.internalServerError("Error al obtener precios");
			}
		},

		// Obtener el logo
		async getLogo(ctx) {
			try {
				const config = await strapi.db
					.query("api::configuracion.configuracion")
					.findOne({
						where: { clave: "logo" },
						populate: { logo: true },
					});

				if (config && config.logo) {
					return { data: { url: config.logo.url } };
				}

				return { data: null };
			} catch (error) {
				strapi.log.error("Error al obtener logo:", error);
				return ctx.internalServerError("Error al obtener logo");
			}
		},

		// Subir/actualizar el logo
		async uploadLogo(ctx) {
			try {
				const { files } = ctx.request;
				if (!files || !files.logo) {
					return ctx.badRequest("No se proporcionó archivo");
				}

				// Buscar o crear configuración de logo
				let config = await strapi.db
					.query("api::configuracion.configuracion")
					.findOne({
						where: { clave: "logo" },
					});

				if (!config) {
					config = await strapi.db
						.query("api::configuracion.configuracion")
						.create({
							data: {
								clave: "logo",
								valor: "logo_gimnasio",
							},
						});
				}

				// Subir archivo
				const uploadedFiles = await strapi
					.plugin("upload")
					.service("upload")
					.upload({
						data: {
							ref: "api::configuracion.configuracion",
							refId: config.id,
							field: "logo",
						},
						files: files.logo,
					});

				return { data: { url: uploadedFiles[0].url } };
			} catch (error) {
				strapi.log.error("Error al subir logo:", error);
				return ctx.internalServerError("Error al subir logo");
			}
		},
	})
);
