import { getTable } from '../../../utils/order-store';
import { broadcastTableUpdate } from '../../../utils/table-realtime';
export default defineEventHandler(async (event) => {
	const table = getTable(getRouterParam(event, 'code') || '');
	const { name } = await readBody<{ name?: string }>(event);
	if (!table)
		throw createError({
			statusCode: 404,
			statusMessage: 'Table not found.',
		});
	if (!name?.trim())
		throw createError({
			statusCode: 400,
			statusMessage: 'A name is required.',
		});
	const member = name.trim().slice(0, 40);
	if (!table.members.includes(member)) {
		table.members.push(member);
		table.orders[member] = {};
	}
	broadcastTableUpdate(table);
	return table;
});
