module.exports = {
	async afterCreate(event) {
		const { result, params } = event;

		try {
			// Obtener usuario del controller
			const ctx = strapi.requestContext.get();
			const usuarioEmail = ctx?.state?._username || "Sistema";

			// Registrar acción en logs
			await strapi.entityService.create("api::log.log", {
				data: {
					Accion: "crear_cliente",
					Entidad: "Cliente",
					EntidadId: result.id.toString(),
					NombreCompleto: `${result.Name} ${result.LastName}`,
					Detalles: {
						nombre: result.Name,
						apellido: result.LastName,
						telefono: result.Phone,
						email: result.Email,
						vip: result.Vip,
						zumba: result.Zumba,
						box: result.Box,
						turno: result.Turno,
						metodoPago: result.MetodoPago,
					},
					Usuario: usuarioEmail,
				},
			});

			// Get prices from database or use defaults
			const getPrecios = async () => {
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

					return preciosObj;
				} catch (error) {
					strapi.log.error("Error getting prices from DB:", error);
					return {
						precio_normal: 30,
						precio_vip: 50,
						precio_zumba_o_box: 40,
						precio_zumba_y_box: 60,
						precio_vip_zumba_y_box: 80,
					};
				}
			};

			const precios = await getPrecios();

			// Determine service type and amount based on client flags
			// Prioridad: VIP+Zumba y Box > VIP > Zumba y Box > Zumba o Box > Normal
			let tipoServicio = "Normal";
			let monto = precios.precio_normal;

			if (result.Vip && result.Zumba && result.Box) {
				tipoServicio = "VIP + Zumba y Box";
				monto = precios.precio_vip_zumba_y_box;
			} else if (result.Vip) {
				tipoServicio = "VIP";
				monto = precios.precio_vip;
			} else if (result.Zumba && result.Box) {
				tipoServicio = "Zumba y Box";
				monto = precios.precio_zumba_y_box;
			} else if (result.Zumba || result.Box) {
				const cual = result.Zumba ? "Zumba" : "Box";
				tipoServicio = cual;
				monto = precios.precio_zumba_o_box;
			}

			// Create payment for current month
			const today = new Date();
			const fechaPago = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

			// Handle Turno: null for VIP, or the actual value (avoid "null" string)
			let turnoValue = null;
			if (
				!result.Vip &&
				result.Turno &&
				result.Turno !== "null" &&
				result.Turno.trim() !== ""
			) {
				turnoValue = result.Turno;
			}

			await strapi.entityService.create("api::pago.pago", {
				data: {
					Monto: monto,
					MetodoPago: result.MetodoPago || "Efectivo",
					FechaPago: fechaPago,
					MesPago: today.getMonth(),
					AnioPago: today.getFullYear(),
					TipoServicio: tipoServicio,
					Turno: turnoValue,
					cliente: result.id,
					publishedAt: new Date(),
				},
			});
		} catch (error) {
			strapi.log.error("Error creating automatic payment:", error);
			// Don't fail client creation if payment fails
		}
	},

	async afterUpdate(event) {
		const { result } = event;

		try {
			const ctx = strapi.requestContext.get();
			const usuarioEmail = ctx?.state?._username || "Sistema";
			const cambios = ctx?.state?._cambios || {};

			// Registrar edición en logs
			await strapi.entityService.create("api::log.log", {
				data: {
					Accion: "editar_cliente",
					Entidad: "Cliente",
					EntidadId: result.id.toString(),
					NombreCompleto: `${result.Name} ${result.LastName}`,
					Detalles: cambios,
					Usuario: usuarioEmail,
				},
			});
		} catch (error) {
			strapi.log.error("Error logging client update:", error);
		}
	},

	async afterDelete(event) {
		const { result, params } = event;

		try {
			// Obtener usuario del controller
			const ctx = strapi.requestContext.get();
			const usuarioEmail = ctx?.state?._username || "Sistema";

			// Registrar eliminación en logs
			await strapi.entityService.create("api::log.log", {
				data: {
					Accion: "eliminar_cliente",
					Entidad: "Cliente",
					EntidadId: result.id.toString(),
					NombreCompleto: `${result.Name} ${result.LastName}`,
					Detalles: {
						nombre: result.Name,
						apellido: result.LastName,
						telefono: result.Phone,
						email: result.Email,
					},
					Usuario: usuarioEmail,
				},
			});
		} catch (error) {
			strapi.log.error("Error logging client deletion:", error);
		}
	},
};
