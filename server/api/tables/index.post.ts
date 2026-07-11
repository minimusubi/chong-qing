import { createTable } from '../../utils/order-store';
export default defineEventHandler(async (event) => {
	const { name } = await readBody<{ name?: string }>(event);
	if (!name?.trim())
		throw createError({
			statusCode: 400,
			statusMessage: 'A name is required.',
		});
	return createTable(name.trim().slice(0, 40));
});
