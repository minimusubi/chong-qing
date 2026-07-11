import { getTable } from '../../../../utils/order-store';
import { broadcastTableUpdate } from '../../../../utils/table-realtime';

export default defineEventHandler((event) => {
	const table = getTable(getRouterParam(event, 'code') || '');
	const member = getRouterParam(event, 'name') || '';
	if (!table)
		throw createError({
			statusCode: 404,
			statusMessage: 'Table not found.',
		});
	if (!table.members.includes(member))
		throw createError({
			statusCode: 404,
			statusMessage: 'Member not found.',
		});

	table.members = table.members.filter((name) => name !== member);
	delete table.orders[member];
	broadcastTableUpdate(table);
	return table;
});
