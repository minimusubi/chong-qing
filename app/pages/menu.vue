<template>
	<main class="menu-manager">
		<header>
			<NuxtLink
				to="/"
				class="back-link"
				>← Back to ordering</NuxtLink
			>
			<p class="eyebrow">MENU MANAGEMENT</p>
			<h1>Menu editor</h1>
			<p>
				Update the menu that diners see. Changes are saved to the shared
				JSON catalog.
			</p>
		</header>
		<div
			v-for="(category, categoryIndex) in catalog"
			:key="category.id"
			class="category-editor"
		>
			<div class="category-editor-head">
				<input
					v-model="category.name"
					class="form-control category-name"
					aria-label="Category name"
				/>
				<div class="reorder-controls">
					<button
						:disabled="categoryIndex === 0"
						aria-label="Move category up"
						@click="move(catalog, categoryIndex, -1)"
					>
						<span class="material-symbols-outlined"
							>arrow_upward</span
						></button
					><button
						:disabled="categoryIndex === catalog.length - 1"
						aria-label="Move category down"
						@click="move(catalog, categoryIndex, 1)"
					>
						<span class="material-symbols-outlined"
							>arrow_downward</span
						>
					</button>
				</div>
				<button
					class="text-danger-button"
					@click="removeCategory(categoryIndex)"
				>
					Remove category
				</button>
			</div>
			<div
				v-for="(item, itemIndex) in category.items"
				:key="item.id"
				class="item-editor"
			>
				<div>
					<label>Item name</label
					><input
						v-model="item.name"
						class="form-control"
					/>
				</div>
				<div>
					<label>Serving note / description</label
					><input
						v-model="item.description"
						class="form-control"
						placeholder="e.g. Serving: 2"
					/>
				</div>
				<div class="item-actions">
					<div class="reorder-controls">
						<button
							:disabled="itemIndex === 0"
							:aria-label="`Move ${item.name} up`"
							@click="move(category.items, itemIndex, -1)"
						>
							<span class="material-symbols-outlined"
								>arrow_upward</span
							></button
						><button
							:disabled="itemIndex === category.items.length - 1"
							:aria-label="`Move ${item.name} down`"
							@click="move(category.items, itemIndex, 1)"
						>
							<span class="material-symbols-outlined"
								>arrow_downward</span
							>
						</button>
					</div>
					<button
						class="remove-item"
						:aria-label="`Remove ${item.name}`"
						@click="removeItem(categoryIndex, itemIndex)"
					>
						&times;
					</button>
				</div>
			</div>
			<button
				class="add-item"
				@click="addItem(categoryIndex)"
			>
				+ Add item
			</button>
		</div>
		<div class="editor-actions">
			<button
				class="btn btn-outline-dark"
				@click="addCategory"
			>
				+ Add category</button
			><button
				class="btn btn-dark"
				:disabled="saving"
				@click="save"
			>
				{{ saving ? 'Saving…' : 'Save menu' }}
			</button>
		</div>
		<p
			v-if="status"
			class="save-status"
		>
			{{ status }}
		</p>
	</main>
</template>

<script setup lang="ts">
	import type { MenuCategory } from '~/shared/types/order';
	const { data } = await useFetch<MenuCategory[]>('/api/menu', {
		default: () => [],
	});
	const catalog = ref<MenuCategory[]>(structuredClone(data.value));
	const saving = ref(false);
	const status = ref('');
	function uniqueId(base: string) {
		const ids = new Set(
			catalog.value.flatMap((category) => [
				category.id,
				...category.items.map((item) => item.id),
			]),
		);
		let id = base;
		let number = 2;
		while (ids.has(id)) id = `${base}-${number++}`;
		return id;
	}
	function addCategory() {
		const id = uniqueId('new-category');
		catalog.value.push({ id, name: 'New category', items: [] });
	}
	function removeCategory(index: number) {
		if (
			catalog.value.length > 1
			&& window.confirm('Remove this category and all of its items?')
		)
			catalog.value.splice(index, 1);
	}
	function addItem(categoryIndex: number) {
		catalog.value[categoryIndex].items.push({
			id: uniqueId('new-item'),
			name: 'New item',
			description: '',
		});
	}
	function removeItem(categoryIndex: number, itemIndex: number) {
		catalog.value[categoryIndex].items.splice(itemIndex, 1);
	}
	function move<T>(items: T[], index: number, direction: number) {
		const nextIndex = index + direction;
		if (nextIndex < 0 || nextIndex >= items.length) return;
		const [item] = items.splice(index, 1);
		items.splice(nextIndex, 0, item);
	}
	async function save() {
		saving.value = true;
		status.value = '';
		try {
			catalog.value = await $fetch<MenuCategory[]>('/api/menu', {
				method: 'PUT',
				body: catalog.value,
			});
			status.value = 'Menu saved.';
		} catch {
			status.value =
				'Could not save the menu. Category and item names are required.';
		} finally {
			saving.value = false;
		}
	}
</script>

<style scoped>
	.menu-manager {
		width: min(100%, 940px);
		margin: 0 auto;
		padding: 42px 20px 80px;
	}
	.back-link {
		display: inline-block;
		margin-bottom: 30px;
		color: #536059;
		font-size: 14px;
		font-weight: 700;
		text-decoration: none;
	}
	.menu-manager h1 {
		margin-bottom: 10px;
	}
	.menu-manager header > p:last-child {
		max-width: 550px;
		color: #637068;
	}
	.category-editor {
		margin-top: 25px;
		padding: 20px;
		border: 1px solid #dedbd1;
		border-radius: 14px;
		background: #fffefa;
	}
	.category-editor-head {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 15px;
	}
	.category-name {
		max-width: 380px;
		font-size: 18px;
		font-weight: 700;
	}
	.text-danger-button,
	.remove-item,
	.add-item {
		border: 0;
		background: transparent;
		font-weight: 700;
	}
	.text-danger-button {
		margin-left: auto;
		color: #a34123;
		font-size: 12px;
	}
	.reorder-controls {
		display: inline-flex;
		gap: 2px;
		padding: 3px;
		border-radius: 9px;
		background: var(--cream);
	}
	.reorder-controls button {
		display: grid;
		place-items: center;
		width: 32px;
		height: 32px;
		border: 0;
		border-radius: 6px;
		background: transparent;
		color: var(--ink);
	}
	.reorder-controls button:not(:disabled):hover {
		background: #fffefa;
	}
	.reorder-controls button:disabled {
		color: #aeb5af;
	}
	.reorder-controls .material-symbols-outlined {
		font-size: 18px;
	}
	.item-editor {
		display: grid;
		grid-template-columns: 1fr 1fr auto;
		gap: 10px;
		align-items: end;
		padding: 12px 0;
		border-top: 1px solid #ebe7dc;
	}
	.item-editor label {
		display: block;
		margin-bottom: 5px;
		color: #6a726c;
		font-size: 11px;
		font-weight: 700;
	}
	.item-actions {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.remove-item {
		width: 32px;
		height: 32px;
		border-radius: 8px;
		color: #a34123;
		font-size: 23px;
	}
	.add-item {
		margin-top: 14px;
		color: #3b5c18;
		font-size: 13px;
	}
	.editor-actions {
		display: flex;
		justify-content: space-between;
		gap: 10px;
		margin-top: 28px;
	}
	.save-status {
		margin-top: 14px;
		color: #3b5c18;
		font-weight: 700;
	}
	@media (max-width: 600px) {
		.item-editor {
			grid-template-columns: 1fr;
		}
		.item-actions {
			justify-content: end;
		}
		.category-editor {
			padding: 15px;
		}
		.category-editor-head {
			flex-wrap: wrap;
		}
		.category-name {
			max-width: none;
			flex-basis: 100%;
		}
		.text-danger-button {
			margin-left: auto;
		}
	}
</style>
