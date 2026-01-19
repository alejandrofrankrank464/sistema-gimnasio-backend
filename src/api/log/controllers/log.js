"use strict";

/**
 * log controller
 */

const { createCoreController } = require("@strapi/strapi").factories;
const ExcelJS = require("exceljs");

module.exports = createCoreController("api::log.log", ({ strapi }) => ({
	async exportExcel(ctx) {
		try {
			const { fechaDesde, fechaHasta, entidad, accion } = ctx.query;

			if (!fechaDesde || !fechaHasta) {
				return ctx.badRequest("Se requieren fechaDesde y fechaHasta");
			}

			// Build filters
			const filters = {
				createdAt: {
					$gte: new Date(fechaDesde + "T00:00:00.000Z"),
					$lte: new Date(fechaHasta + "T23:59:59.999Z"),
				},
			};

			if (entidad && entidad !== "Todas") {
				filters.Entidad = entidad;
			}

			if (accion && accion !== "Todas") {
				filters.Accion = accion;
			}

			// Fetch logs
			const logs = await strapi.entityService.findMany("api::log.log", {
				filters,
				sort: { createdAt: "desc" },
				limit: 10000,
			});

			// Create Excel workbook
			const workbook = new ExcelJS.Workbook();
			const worksheet = workbook.addWorksheet("Reportes");

			// Set column headers
			worksheet.columns = [
				{ header: "Fecha", key: "fecha", width: 20 },
				{ header: "Usuario", key: "usuario", width: 20 },
				{ header: "Entidad", key: "entidad", width: 15 },
				{ header: "Acción", key: "accion", width: 15 },
				{ header: "Detalles", key: "detalles", width: 50 },
			];

			// Style header row
			worksheet.getRow(1).font = { bold: true };
			worksheet.getRow(1).fill = {
				type: "pattern",
				pattern: "solid",
				fgColor: { argb: "FF4CAF50" },
			};
			worksheet.getRow(1).alignment = {
				vertical: "middle",
				horizontal: "center",
			};

			// Add data rows
			logs.forEach((log) => {
				const fecha = new Date(log.createdAt).toLocaleString("es-ES", {
					day: "2-digit",
					month: "2-digit",
					year: "numeric",
					hour: "2-digit",
					minute: "2-digit",
				});

				worksheet.addRow({
					fecha,
					usuario: log.Usuario || "-",
					entidad: log.Entidad || "-",
					accion: log.Accion || "-",
					detalles: log.Detalles || "-",
				});
			});

			// Generate buffer
			const buffer = await workbook.xlsx.writeBuffer();

			// Set response headers
			ctx.set(
				"Content-Type",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
			);
			ctx.set(
				"Content-Disposition",
				`attachment; filename=reportes_${fechaDesde}_${fechaHasta}.xlsx`
			);

			// Send buffer
			ctx.body = buffer;
		} catch (error) {
			strapi.log.error("Error generating Excel:", error);
			return ctx.internalServerError("Error al generar el archivo Excel");
		}
	},
}));
