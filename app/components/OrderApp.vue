<template>
	<div class="order-app">
		<section
			v-if="!table"
			class="landing-shell"
		>
			<div class="landing-card">
				<div class="brand-mark">
					<span class="material-symbols-outlined">restaurant</span>
				</div>
				<p class="eyebrow">SHARED TABLE ORDERING</p>
				<h1>Everyone orders.<br /><em>One list.</em></h1>
				<p class="intro">
					Pass around the menu without passing around the pencil. Add
					what you want and we’ll total it up for the table.
				</p>

				<section class="action-panel">
					<p class="eyebrow"><span>1</span> YOUR DETAILS</p>
					<label
						class="form-label"
						for="host-name"
						>Who are you? <span aria-hidden="true">*</span></label
					>
					<p class="field-help">
						Your name is used to join or create a table.
					</p>
					<input
						id="host-name"
						v-model.trim="name"
						class="form-control form-control-lg"
						placeholder="e.g. Jamie"
						@keyup.enter="joinTable"
					/>
				</section>

				<div class="action-panel">
					<p class="eyebrow"><span>2</span> CHOOSE AN ACTION</p>
					<section class="action-choice join-choice">
						<h2>Join an existing table</h2>
						<p>
							You’ll join the table as
							<b>{{ name || 'your name' }}</b
							>. Ask your host for the code or link.
						</p>
						<label
							class="form-label"
							for="table-code"
							>Table code <span aria-hidden="true">*</span></label
						>
						<input
							id="table-code"
							v-model.trim="joinCode"
							@input="joinCode = joinCode.toUpperCase()"
							class="form-control form-control-lg code-input"
							maxlength="5"
							placeholder="e.g. KP73M"
							@keyup.enter="joinTable"
						/>
						<button
							class="btn btn-primary btn-lg w-100"
							:disabled="
								!name || joinCode.length !== 5 || loading
							"
							@click="joinTable"
						>
							Join table as {{ name || '…' }}
						</button>
					</section>
					<div class="or"><span>or</span></div>
					<section class="action-choice create-choice">
						<h2>Create a new table</h2>
						<p>
							Starting a group? You’ll get a shareable link to
							invite everyone else.
						</p>
						<button
							class="btn btn-outline-dark btn-lg w-100"
							:disabled="!name || loading"
							@click="createTable"
						>
							<span class="material-symbols-outlined">add</span>
							Create table as {{ name || '…' }}
						</button>
					</section>
					<p
						v-if="error"
						class="error-message"
					>
						{{ error }}
					</p>
				</div>
				<NuxtLink
					class="menu-editor-link"
					to="/menu"
					>Manage menu</NuxtLink
				>
			</div>
		</section>

		<template v-else>
			<header class="topbar">
				<div
					class="container-xl d-flex align-items-center justify-content-between"
				>
					<button
						class="brand-button"
						@click="showSummary = true"
					>
						<span class="brand-mark small"
							><span class="material-symbols-outlined"
								>restaurant</span
							></span
						><span>Tableful</span>
					</button>
					<button
						class="table-code"
						@click="showQr = true"
					>
						<span class="status-dot"></span> TABLE
						<strong>{{ table.code }}</strong
						><span
							class="material-symbols-outlined"
							style="font-size: 24px"
							>qr_code_2</span
						>
					</button>
				</div>
			</header>

			<main class="menu-shell container-xl">
				<section class="welcome-row">
					<div>
						<p class="eyebrow">YOU'RE ORDERING AS</p>
						<h1>{{ name }}</h1>
					</div>
					<div class="welcome-actions">
						<button
							class="people-button"
							@click="showPeople = true"
						>
							<span class="material-symbols-outlined">group</span>
							<span class="d-none d-sm-inline">People</span>
							<b>{{ table.members.length }}</b>
						</button>
						<button
							class="summary-button"
							@click="showSummary = true"
						>
							<span class="material-symbols-outlined"
								>receipt_long</span
							><span class="d-none d-sm-inline">Table total</span
							><b>{{ totalItems }}</b>
						</button>
					</div>
				</section>

				<div class="notice">
					<span class="material-symbols-outlined">group</span
					><span
						><b>{{ table.members.length }}</b>
						{{
							table.members.length === 1 ?
								'person is'
							:	'people are'
						}}
						adding to this order</span
					><button @click="showQr = true">Invite someone</button>
				</div>

				<nav
					class="category-tabs"
					aria-label="Menu categories"
				>
					<button
						v-for="category in menu"
						:key="category.id"
						:class="{ active: activeCategory === category.id }"
						@click="activeCategory = category.id"
					>
						{{ category.name }}
					</button>
				</nav>

				<section
					v-for="category in visibleMenu"
					:id="category.id"
					:key="category.id"
					class="menu-category"
				>
					<div class="category-heading">
						<p class="eyebrow">{{ category.name }}</p>
						<span>{{ category.items.length }} ITEMS</span>
					</div>
					<div class="item-grid">
						<article
							v-for="item in category.items"
							:key="item.id"
							class="menu-item"
							:class="{ selected: quantity(item.id) > 0 }"
						>
							<div>
								<h3>{{ item.name }}</h3>
								<p>{{ item.description }}</p>
							</div>
							<div class="quantity-control">
								<button
									:disabled="quantity(item.id) === 0"
									:aria-label="`Remove ${item.name}`"
									@click="changeQuantity(item.id, -1)"
								>
									<span class="material-symbols-outlined"
										>remove</span
									>
								</button>
								<strong>{{ quantity(item.id) }}</strong>
								<button
									:aria-label="`Add ${item.name}`"
									@click="changeQuantity(item.id, 1)"
								>
									<span class="material-symbols-outlined"
										>add</span
									>
								</button>
							</div>
						</article>
					</div>
				</section>
			</main>

			<button
				class="mobile-total"
				@click="showSummary = true"
			>
				<span
					><small>TABLE TOTAL</small
					><b
						>{{ totalItems }}
						{{ totalItems === 1 ? 'item' : 'items' }}</b
					></span
				><span class="material-symbols-outlined">arrow_forward</span>
			</button>

			<div
				v-if="showSummary"
				class="summary-overlay"
				@click.self="showSummary = false"
			>
				<aside class="summary-drawer">
					<div class="drawer-header">
						<div>
							<p class="eyebrow">READY TO TRANSCRIBE</p>
							<h2>Table order</h2>
						</div>
						<button
							aria-label="Close summary"
							@click="showSummary = false"
						>
							<span class="material-symbols-outlined">close</span>
						</button>
					</div>
					<div class="share-code">
						<span>TABLE CODE</span><strong>{{ table.code }}</strong
						><button @click="copyCode">
							<span class="material-symbols-outlined"
								>content_copy</span
							>
						</button>
					</div>
					<button
						class="qr-button"
						@click="showQr = true"
					>
						<span class="material-symbols-outlined">qr_code_2</span
						><span
							><b>Show join QR code</b
							><small
								>Let everyone scan to join this table</small
							></span
						><span class="material-symbols-outlined arrow"
							>arrow_forward</span
						>
					</button>
					<div
						v-if="summaryCategories.length"
						class="summary-list"
					>
						<div
							v-for="category in summaryCategories"
							:key="category.id"
							class="summary-category"
						>
							<p class="summary-category-title">
								{{ category.name }}
							</p>
							<div
								v-for="item in category.items"
								:key="item.id"
								class="summary-item"
							>
								<span>{{ item.name }}</span
								><b>{{ item.quantity }}</b>
							</div>
						</div>
					</div>
					<div
						v-else
						class="empty-summary"
					>
						<span class="material-symbols-outlined"
							>ramen_dining</span
						>
						<p>
							No selections yet.<br />Your group's choices will
							appear here.
						</p>
					</div>
					<div class="drawer-footer">
						<div>
							<small>TOTAL QUANTITY</small
							><b>{{ totalItems }} items</b>
						</div>
						<button
							class="reset-order-button"
							:disabled="!totalItems || resetting"
							@click="resetMenu"
						>
							<span class="material-symbols-outlined"
								>restart_alt</span
							>
							{{ resetting ? 'Resetting…' : 'Reset menu' }}
						</button>
					</div>
				</aside>
			</div>

			<div
				v-if="showPeople"
				class="summary-overlay"
				@click.self="showPeople = false"
			>
				<aside class="summary-drawer people-drawer">
					<div class="drawer-header">
						<div>
							<p class="eyebrow">TABLE MEMBERS</p>
							<h2>People</h2>
						</div>
						<button
							aria-label="Close people"
							@click="showPeople = false"
						>
							<span class="material-symbols-outlined">close</span>
						</button>
					</div>
					<p class="people-intro">
						Clear a person’s selections when needed. They’ll stay in
						the table and can continue ordering.
					</p>
					<div class="members-list">
						<article
							v-for="member in table.members"
							:key="member"
							class="member-row"
						>
							<span class="member-avatar">{{
								member.slice(0, 1).toUpperCase()
							}}</span>
							<div>
								<b
									>{{ member }}
									<small v-if="member === name">YOU</small></b
								><span
									>{{ memberItemCount(member) }}
									{{
										memberItemCount(member) === 1 ? 'item'
										:	'items'
									}}
									selected</span
								>
							</div>
							<div class="member-actions">
								<button
									class="clear-member-button"
									:disabled="
										!memberItemCount(member)
										|| clearingMember === member
									"
									@click="clearMemberItems(member)"
								>
									{{
										clearingMember === member ? 'Clearing…'
										:	'Clear'
									}}
								</button>
								<button
									class="remove-member-button"
									:disabled="removingMember === member"
									@click="removeMember(member)"
								>
									{{
										removingMember === member ? 'Removing…'
										:	'Remove'
									}}
								</button>
							</div>
						</article>
					</div>
					<button
						class="leave-table-button"
						:disabled="removingMember === name"
						@click="removeMember(name)"
					>
						<span class="material-symbols-outlined"
							>exit_to_app</span
						>
						{{
							removingMember === name ? 'Leaving…' : (
								'Leave this table'
							)
						}}
					</button>
				</aside>
			</div>

			<div
				v-if="showQr"
				class="qr-overlay"
				@click.self="showQr = false"
			>
				<section class="qr-card">
					<button
						class="qr-close"
						aria-label="Close QR code"
						@click="showQr = false"
					>
						<span class="material-symbols-outlined">close</span>
					</button>
					<p class="eyebrow">SCAN TO JOIN</p>
					<h2>Join table {{ table.code }}</h2>
					<p>
						Point your phone camera at this code, then enter your
						name.
					</p>
					<div class="qr-image">
						<img
							v-if="qrCodeData"
							:src="qrCodeData"
							alt="QR code to join this table"
						/><span
							v-else
							class="spinner-border"
							aria-label="Generating QR code"
						></span>
					</div>
					<button
						class="qr-link"
						aria-label="Copy join link"
						@click="copyCode"
					>
						<span>{{ shareLink }}</span>
						<span class="material-symbols-outlined"
							>content_copy</span
						>
					</button>
				</section>
			</div>
		</template>
	</div>
</template>

<script lang="ts" setup>
	import type { MenuCategory, SharedTable } from '~/shared/types/order';
	import QRCode from 'qrcode';

	const route = useRoute();
	const router = useRouter();
	const { data: menu } = await useFetch<MenuCategory[]>('/api/menu', {
		default: () => [],
	});
	const table = ref<SharedTable | null>(null);
	const name = ref('');
	const joinCode = ref(
		typeof route.query.id === 'string' ? route.query.id.toUpperCase() : '',
	);
	const activeCategory = ref('soup-base');
	const loading = ref(false);
	const error = ref('');
	const showSummary = ref(false);
	const showPeople = ref(false);
	const showQr = ref(false);
	const qrCodeData = ref('');
	const resetting = ref(false);
	const clearingMember = ref('');
	const removingMember = ref('');
	let tableSocket: WebSocket | undefined;
	let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
	let isUnmounted = false;
	const sessionStorageKey = 'tableful-session';
	const nameStorageKey = 'tableful-name';

	const visibleMenu = computed(() =>
		menu.value.filter((category) => category.id === activeCategory.value),
	);
	const mine = computed(() => table.value?.orders[name.value] || {});
	const totalItems = computed(() =>
		Object.values(table.value?.orders || {}).reduce(
			(total, order) =>
				total
				+ Object.values(order).reduce((sum, value) => sum + value, 0),
			0,
		),
	);
	const summaryCategories = computed(() => {
		const totals: Record<string, number> = {};
		Object.values(table.value?.orders || {}).forEach((order) =>
			Object.entries(order).forEach(([id, count]) => {
				totals[id] = (totals[id] || 0) + count;
			}),
		);
		return menu.value
			.map((category) => ({
				...category,
				items: category.items
					.filter((item) => totals[item.id])
					.map((item) => ({ ...item, quantity: totals[item.id] })),
			}))
			.filter((category) => category.items.length);
	});
	const shareLink = computed(() => {
		if (!table.value || !import.meta.client) return '';
		return `${window.location.origin}/table?id=${table.value.code}`;
	});

	watch(showQr, async (isOpen) => {
		if (isOpen && shareLink.value)
			qrCodeData.value = await QRCode.toDataURL(shareLink.value, {
				width: 520,
				margin: 1,
				color: { dark: '#18231f', light: '#fffefa' },
			});
	});

	watch([showSummary, showPeople], ([summaryOpen, peopleOpen]) => {
		if (import.meta.client)
			document.body.classList.toggle(
				'table-summary-open',
				summaryOpen || peopleOpen,
			);
	});

	function quantity(itemId: string) {
		return mine.value[itemId] || 0;
	}
	async function createTable() {
		loading.value = true;
		error.value = '';
		try {
			table.value = await $fetch<SharedTable>('/api/tables', {
				method: 'POST',
				body: { name: name.value },
			});
			await router.push({
				path: '/table',
				query: { id: table.value.code },
			});
			saveSession(table.value.code);
			startRefreshing();
		} catch {
			error.value = 'Could not create a table. Please try again.';
		} finally {
			loading.value = false;
		}
	}
	async function joinTable() {
		if (joinCode.value.length !== 5) {
			error.value = 'Enter the five-character table code.';
			return;
		}
		loading.value = true;
		error.value = '';
		try {
			table.value = await $fetch<SharedTable>(
				`/api/tables/${joinCode.value.toUpperCase()}/join`,
				{ method: 'POST', body: { name: name.value } },
			);
			await router.push({
				path: '/table',
				query: { id: table.value.code },
			});
			saveSession(table.value.code);
			startRefreshing();
		} catch {
			error.value = 'We couldn’t find that table code.';
		} finally {
			loading.value = false;
		}
	}
	async function changeQuantity(itemId: string, delta: number) {
		if (!table.value) return;
		const next = Math.max(0, quantity(itemId) + delta);
		table.value = await $fetch<SharedTable>(
			`/api/tables/${table.value.code}/orders`,
			{
				method: 'PUT',
				body: { name: name.value, itemId, quantity: next },
			},
		);
	}
	async function resetMenu() {
		if (
			!table.value
			|| !window.confirm(
				'Reset the entire table order? This will remove everyone’s selections.',
			)
		)
			return;
		resetting.value = true;
		try {
			table.value = await $fetch<SharedTable>(
				`/api/tables/${table.value.code}/orders`,
				{ method: 'DELETE' },
			);
		} finally {
			resetting.value = false;
		}
	}
	function memberItemCount(member: string) {
		return Object.values(table.value?.orders[member] || {}).reduce(
			(total, quantity) => total + quantity,
			0,
		);
	}
	async function clearMemberItems(member: string) {
		if (
			!table.value
			|| !window.confirm(`Clear all selections from ${member}?`)
		)
			return;
		clearingMember.value = member;
		try {
			table.value = await $fetch<SharedTable>(
				`/api/tables/${table.value.code}/members/${encodeURIComponent(member)}/orders`,
				{ method: 'DELETE' },
			);
		} finally {
			clearingMember.value = '';
		}
	}
	async function removeMember(member: string) {
		const isLeaving = member === name.value;
		if (
			!table.value
			|| !window.confirm(
				isLeaving ?
					'Leave this table? Your selections will also be removed.'
				:	`Remove ${member} from this table? Their selections will also be removed.`,
			)
		)
			return;
		removingMember.value = member;
		try {
			const updatedTable = await $fetch<SharedTable>(
				`/api/tables/${table.value.code}/members/${encodeURIComponent(member)}`,
				{ method: 'DELETE' },
			);
			if (member === name.value) {
				tableSocket?.close();
				localStorage.removeItem(sessionStorageKey);
				table.value = null;
				showPeople.value = false;
				await router.push('/');
			} else {
				table.value = updatedTable;
			}
		} finally {
			removingMember.value = '';
		}
	}
	function startRefreshing() {
		if (!table.value || !import.meta.client) return;
		clearTimeout(reconnectTimer);
		tableSocket?.close();
		const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
		const socket = new WebSocket(
			`${protocol}//${window.location.host}/tables/${table.value.code}/updates`,
		);
		tableSocket = socket;
		socket.addEventListener('message', (event) => {
			const update = JSON.parse(event.data) as {
				type?: string;
				table?: SharedTable;
			};
			if (
				update.type === 'table-updated'
				&& update.table?.code === table.value?.code
			)
				void applyTableUpdate(update.table);
		});
		socket.addEventListener('close', () => {
			if (tableSocket === socket && !isUnmounted && table.value && document.visibilityState === 'visible') {
				reconnectTimer = setTimeout(() => void syncTable(), 1500);
			}
		});
	}
	async function syncTable() {
		if (!table.value || !import.meta.client) return;
		try {
			const latestTable = await $fetch<SharedTable>(`/api/tables/${table.value.code}`);
			await applyTableUpdate(latestTable);
			if (table.value) startRefreshing();
		} catch {
			// Keep the last known state and try again when the connection resumes.
		}
	}
	function syncOnWake() {
		if (document.visibilityState === 'visible') void syncTable();
	}
	async function applyTableUpdate(updatedTable: SharedTable) {
		if (!updatedTable.members.includes(name.value)) {
			tableSocket?.close();
			localStorage.removeItem(sessionStorageKey);
			table.value = null;
			showSummary.value = false;
			showPeople.value = false;
			await router.push('/');
			return;
		}
		table.value = updatedTable;
	}
	async function copyCode() {
		if (!table.value) return;
		await navigator.clipboard?.writeText(
			shareLink.value || table.value.code,
		);
	}
	function saveSession(code: string) {
		if (!import.meta.client) return;
		localStorage.setItem(
			sessionStorageKey,
			JSON.stringify({ name: name.value, tableCode: code }),
		);
		localStorage.setItem(nameStorageKey, name.value);
	}
	onMounted(async () => {
		window.addEventListener('focus', syncOnWake);
		window.addEventListener('pageshow', syncOnWake);
		document.addEventListener('visibilitychange', syncOnWake);
		const tableCode =
			typeof route.query.id === 'string' ?
				route.query.id.toUpperCase()
			:	'';

		try {
			const savedSession = JSON.parse(
				localStorage.getItem(sessionStorageKey) || 'null',
			) as { name?: string; tableCode?: string } | null;
			const savedName = localStorage.getItem(nameStorageKey);
			if (savedName || savedSession?.name)
				name.value = savedName || savedSession?.name || '';
			if (!tableCode) return;
			if (!savedSession?.name) return;
			if (savedSession.tableCode !== tableCode) return;
			table.value = await $fetch<SharedTable>(`/api/tables/${tableCode}`);
			startRefreshing();
		} catch {
			// A missing or expired table simply returns the visitor to the join screen.
		}
	});
	onBeforeUnmount(() => {
		isUnmounted = true;
		clearTimeout(reconnectTimer);
		tableSocket?.close();
		window.removeEventListener('focus', syncOnWake);
		window.removeEventListener('pageshow', syncOnWake);
		document.removeEventListener('visibilitychange', syncOnWake);
		if (import.meta.client)
			document.body.classList.remove('table-summary-open');
	});
</script>
