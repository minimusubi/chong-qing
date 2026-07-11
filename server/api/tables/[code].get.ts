import { getTable } from '../../utils/order-store';
export default defineEventHandler((event) => {
	const table = getTable(getRouterParam(event, 'code') || '');
	if (!table)
		throw createError({
			statusCode: 404,
			statusMessage: 'Table not found.',
		});
	return table;
});
