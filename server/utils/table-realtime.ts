import type { SharedTable } from '~/shared/types/order';

interface TablePeer {
	send: (data: unknown) => void;
}

const globalRealtime = globalThis as typeof globalThis & {
	__tablefulPeersByTable?: Map<string, Set<TablePeer>>;
};

// Nitro can bundle API and WebSocket routes into separate modules. Keeping this
// registry on globalThis ensures every route uses the same peer collection.
const peersByTable = (globalRealtime.__tablefulPeersByTable ||= new Map<
	string,
	Set<TablePeer>
>());

export function addTablePeer(code: string, peer: TablePeer) {
	const peers = peersByTable.get(code) || new Set<TablePeer>();
	peers.add(peer);
	peersByTable.set(code, peers);
}

export function removeTablePeer(code: string, peer: TablePeer) {
	const peers = peersByTable.get(code);
	if (!peers) return;
	peers.delete(peer);
	if (!peers.size) peersByTable.delete(code);
}

export function broadcastTableUpdate(table: SharedTable) {
	for (const peer of peersByTable.get(table.code) || [])
		peer.send({ type: 'table-updated', table });
}
