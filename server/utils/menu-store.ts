import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import defaultMenu from '../data/menu.json';
import type { MenuCategory } from '~/shared/types/order';

let menu = structuredClone(defaultMenu) as MenuCategory[];
const menuPath = resolve(process.cwd(), 'server/data/menu.json');

export function getMenu() {
	return menu;
}

export async function saveMenu(value: unknown) {
	if (!Array.isArray(value) || !value.length || !value.every(isCategory))
		throw createError({
			statusCode: 400,
			statusMessage: 'Menu must include at least one valid category.',
		});
	menu = value as MenuCategory[];
	await writeFile(menuPath, `${JSON.stringify(menu, null, 2)}\n`, 'utf8');
	return menu;
}

function isCategory(value: unknown): value is MenuCategory {
	if (!value || typeof value !== 'object') return false;
	const category = value as MenuCategory;
	return (
		isText(category.id)
		&& isText(category.name)
		&& Array.isArray(category.items)
		&& category.items.every(
			(item) =>
				isText(item.id)
				&& isText(item.name)
				&& typeof item.description === 'string',
		)
	);
}

function isText(value: unknown): value is string {
	return typeof value === 'string' && Boolean(value.trim());
}
