import { getTable } from '../../../utils/order-store';
import { broadcastTableUpdate } from '../../../utils/table-realtime';
export default defineEventHandler(async (event) => {
	const table = getTable(getRouterParam(event, 'code') || '');
	const { name, itemId, quantity } = await readBody<{
		name?: string;
		itemId?: string;
		quantity?: number;
	}>(event);
	if (!table)
		throw createError({
			statusCode: 404,
			statusMessage: 'Table not found.',
		});
	if (
		!name
		|| !itemId
		|| !Number.isInteger(quantity)
		|| quantity < 0
		|| quantity > 50
	)
		throw createError({ statusCode: 400, statusMessage: 'Invalid order.' });
	if (!table.members.includes(name)) {
		table.members.push(name);
		table.orders[name] = {};
	}
	table.orders[name][itemId] = quantity;
	broadcastTableUpdate(table);
	return table;
});
