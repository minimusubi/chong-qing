import { getTable } from '../../../utils/order-store';
import { broadcastTableUpdate } from '../../../utils/table-realtime';

export default defineEventHandler((event) => {
	const table = getTable(getRouterParam(event, 'code') || '');
	if (!table)
		throw createError({
			statusCode: 404,
			statusMessage: 'Table not found.',
		});

	table.orders = Object.fromEntries(
		table.members.map((member) => [member, {}]),
	);
	broadcastTableUpdate(table);
	return table;
});
