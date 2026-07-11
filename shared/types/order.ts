export interface MenuItem {
	id: string;
	name: string;
	description: string;
}
export interface MenuCategory {
	id: string;
	name: string;
	items: MenuItem[];
}
export interface SharedTable {
	code: string;
	createdAt: string;
	members: string[];
	orders: Record<string, Record<string, number>>;
}
