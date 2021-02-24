<script lang="ts">
	import MenuBar from './components/MenuBar.svelte';
	import DrumKits from './components/DrumKits.svelte';
	import ActivePads from './components/ActivePads.svelte';
</script>

<div class="container">
	<div class="menu-bar">
		<MenuBar />
		<ActivePads />
	</div>
	<main>
		<DrumKits />
	</main>
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		height: 100%;
		max-height: 100%;
		user-select: none;
	}

	.menu-bar {
		flex: 0 0 auto;
	}

	main {
		flex: 1;
		overflow: auto;
	}

	main::-webkit-scrollbar {
		width: 0.75rem;
	}
	
	main::-webkit-scrollbar-thumb {
		border-radius: 1rem;
		background: rgba(255, 255, 255, 0.25);
		border: 0.25rem solid var(--color-background);
	}
	
	main::-webkit-scrollbar-thumb:hover {
		background: rgba(255, 255, 255, 0.33);
	}
</style>
