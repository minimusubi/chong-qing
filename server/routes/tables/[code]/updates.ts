import { defineWebSocketHandler } from 'h3';
import { getTable } from '../../../utils/order-store';
import { addTablePeer, removeTablePeer } from '../../../utils/table-realtime';

function getTableCode(url: string) {
	return new URL(url).pathname.split('/')[2]?.toUpperCase() || '';
}

export default defineWebSocketHandler({
	upgrade(request) {
		const code = getTableCode(request.url);
		if (!getTable(code))
			throw new Response('Table not found.', { status: 404 });
		return { namespace: `table:${code}` };
	},
	open(peer) {
		addTablePeer(getTableCode(peer.request.url), peer);
	},
	close(peer) {
		removeTablePeer(getTableCode(peer.request.url), peer);
	},
});
