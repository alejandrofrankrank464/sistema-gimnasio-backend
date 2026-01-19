module.exports = {
	async afterCreate(event) {
		const { result, params } = event;

		try {
			// Buscar el pago con la relación poblada para obtener el cliente
			let clienteNombre = "Cliente desconocido";

			const pagoConCliente = await strapi.entityService.findOne(
				"api::pago.pago",
				result.id,
				{
					populate: ["cliente"],
				}
			);

			if (pagoConCliente?.cliente) {
				clienteNombre = `${pagoConCliente.cliente.Name} ${pagoConCliente.cliente.LastName}`;
			}

			// Obtener usuario del controller
			const ctx = strapi.requestContext.get();
			const usuarioEmail = ctx?.state?._username || "Sistema";
			// Registrar creación en logs
			await strapi.entityService.create("api::log.log", {
				data: {
					Accion: "crear_pago",
					Entidad: "Pago",
					EntidadId: result.id.toString(),
					NombreCompleto: clienteNombre,
					Detalles: {
						monto: result.Monto,
						metodoPago: result.MetodoPago,
						tipoServicio: result.TipoServicio,
						turno: result.Turno,
						mesPago: result.MesPago,
						anioPago: result.AnioPago,
						fechaPago: result.FechaPago,
					},
					Usuario: usuarioEmail,
				},
			});
		} catch (error) {
			strapi.log.error("Error logging payment creation:", error);
		}
	},

	async afterUpdate(event) {
		const { result } = event;

		try {
			// Obtener información del cliente
			let clienteNombre = "Cliente desconocido";

			const pagoConCliente = await strapi.entityService.findOne(
				"api::pago.pago",
				result.id,
				{
					populate: ["cliente"],
				}
			);

			if (pagoConCliente?.cliente) {
				clienteNombre = `${pagoConCliente.cliente.Name} ${pagoConCliente.cliente.LastName}`;
			}

			// Obtener usuario y cambios del controller
			const ctx = strapi.requestContext.get();
			const usuarioEmail = ctx?.state?._username || "Sistema";
			const cambios = ctx?.state?._cambios || {};

			// Registrar edición en logs
			await strapi.entityService.create("api::log.log", {
				data: {
					Accion: "editar_pago",
					Entidad: "Pago",
					EntidadId: result.id.toString(),
					NombreCompleto: clienteNombre,
					Detalles: cambios,
					Usuario: usuarioEmail,
				},
			});
		} catch (error) {
			strapi.log.error("Error logging payment update:", error);
		}
	},

	async afterDelete(event) {
		const { result, params } = event;

		try {
			// Obtener información del cliente
			let clienteNombre = "Cliente desconocido";
			const clienteId = result.cliente?.id || result.cliente;
			if (clienteId) {
				const cliente = await strapi.db
					.query("api::cliente.cliente")
					.findOne({
						where: { id: clienteId },
						select: ["Name", "LastName"],
					});
				if (cliente) {
					clienteNombre = `${cliente.Name} ${cliente.LastName}`;
				}
			}

			// Obtener usuario del controller
			const ctx = strapi.requestContext.get();
			const usuarioEmail = ctx?.state?._username || "Sistema";

			// Registrar eliminación en logs
			await strapi.entityService.create("api::log.log", {
				data: {
					Accion: "eliminar_pago",
					Entidad: "Pago",
					EntidadId: result.id.toString(),
					NombreCompleto: clienteNombre,
					Detalles: {
						monto: result.Monto,
						metodoPago: result.MetodoPago,
						tipoServicio: result.TipoServicio,
						mesPago: result.MesPago,
						anioPago: result.AnioPago,
					},
					Usuario: usuarioEmail,
				},
			});
		} catch (error) {
			strapi.log.error("Error logging payment deletion:", error);
		}
	},
};
