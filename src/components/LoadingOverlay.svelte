<script>
    import { fade } from 'svelte/transition';
    export let loading = true;
</script>

{#if loading}
    <div class="loading-overlay" transition:fade={{ duration: 100 }}>
        <div class="anim-block">
            <div class="cell d2"></div>
            <div class="cell d3"></div>
            <div class="cell d4"></div>
            <div class="cell d1"></div>
            <div class="cell d2"></div>
            <div class="cell d3"></div>
            <div class="cell d0"></div>
            <div class="cell d1"></div>
            <div class="cell d2"></div>
        </div>
    </div>
{/if}

<style>
    .loading-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: var(--color-background);
        opacity: 0.75;
        z-index: 1000;
    }

    .anim-block {
        position: absolute;
        top: 4.5rem;
        left: calc(50% - 1rem);
        width: 2rem;
        height: 2rem;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 0.25rem;
    }

    @keyframes loading-overlay-cell-fade {
        0%   { opacity: 0; transform: scale(0); }
        25%  { opacity: 1; transform: scale(1); }
        50%  { opacity: 0; transform: scale(0); }
        100% { opacity: 0; transform: scale(0); }
    }

    .cell {
        width: 100%;
        height: 100%;
        background: var(--color-text);
        border-radius: 50%;
        animation: loading-overlay-cell-fade 1500ms ease infinite;
    }

    .d1 { animation-delay:  50ms; }
    .d2 { animation-delay: 100ms; }
    .d3 { animation-delay: 150ms; }
    .d4 { animation-delay: 200ms; }
</style>
