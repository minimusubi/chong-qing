<template>
	<div class="order-app">
		<section class="landing-shell">
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
						This name is used to join or create a table.
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
							class="form-control form-control-lg code-input"
							maxlength="5"
							placeholder="e.g. KP73M"
							@input="joinCode = joinCode.toUpperCase()"
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
	</div>
</template>

<script lang="ts" setup>
	import type { SharedTable } from '~/shared/types/order';

	const router = useRouter();
	const name = ref('');
	const joinCode = ref('');
	const loading = ref(false);
	const error = ref('');
	const sessionStorageKey = 'tableful-session';
	const nameStorageKey = 'tableful-name';

	function saveSession(code: string) {
		localStorage.setItem(
			sessionStorageKey,
			JSON.stringify({ name: name.value, tableCode: code }),
		);
		localStorage.setItem(nameStorageKey, name.value);
	}
	async function createTable() {
		loading.value = true;
		error.value = '';
		try {
			const table = await $fetch<SharedTable>('/api/tables', {
				method: 'POST',
				body: { name: name.value },
			});
			saveSession(table.code);
			await router.push({ path: '/table', query: { id: table.code } });
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
			const table = await $fetch<SharedTable>(
				`/api/tables/${joinCode.value}/join`,
				{ method: 'POST', body: { name: name.value } },
			);
			saveSession(table.code);
			await router.push({ path: '/table', query: { id: table.code } });
		} catch {
			error.value = 'We couldn’t find that table code.';
		} finally {
			loading.value = false;
		}
	}
	onMounted(() => {
		try {
			name.value =
				localStorage.getItem(nameStorageKey)
				|| JSON.parse(localStorage.getItem(sessionStorageKey) || 'null')
					?.name
				|| '';
			if (name.value) localStorage.setItem(nameStorageKey, name.value);
		} catch {
			/* Ignore malformed local data. */
		}
	});
</script>
