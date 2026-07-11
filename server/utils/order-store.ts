const tables = new Map<string, SharedTable>();
// Avoid characters that are easy to misread aloud or across a table.
const tableCodeAlphabet = 'ACDEFHJKMNPRWXY349';

export function getTable(code: string) {
	return tables.get(code.toUpperCase());
}

export function createTable(name: string) {
	let code = '';
	do {
		code = Array.from(
			{ length: 5 },
			() =>
				tableCodeAlphabet[
					Math.floor(Math.random() * tableCodeAlphabet.length)
				],
		).join('');
	} while (tables.has(code));
	const table: SharedTable = {
		code,
		createdAt: new Date().toISOString(),
		members: [name],
		orders: { [name]: {} },
	};
	tables.set(code, table);
	return table;
}
