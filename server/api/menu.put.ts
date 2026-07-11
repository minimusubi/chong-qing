import { saveMenu } from '../utils/menu-store';

export default defineEventHandler(async (event) =>
	saveMenu(await readBody(event)),
);
