<script lang="ts">
    import { debounce } from '../helpers';
    import playbackService from '../services/PlaybackService';
    import { DrumKit } from '../services/DrumKitService';
    import DrumPad from './DrumPad.svelte';
    import LoadingOverlay from './LoadingOverlay.svelte';

    let drumkits: DrumKit[] = [];

    playbackService.on('ready', () => {
        drumkits = playbackService.dks.kits;
        filteredDrumKits = drumkits;
    });

    // drag to play pads
    let hoverMode = false;
    const startHoverMode = () => hoverMode = true;
    const stopHoverMode = () => hoverMode = false;

    // drum kits global search
    let searchQuery = '';
    let searchQueryLoading = false;
    let filteredDrumKits: DrumKit[] = [];
    const filterDrumKits = debounce(() => {
        // perform actual searching
        const results: DrumKit[] = [];
        const query = searchQuery.toLocaleLowerCase().trim();

        for (const kit of drumkits) {
            const filteredSamples = [];

            for (const sample of kit.samples) {
                if (
                    sample.category.toLocaleLowerCase().includes(query) ||
                    sample.subcategory?.toLocaleLowerCase().includes(query) ||
                    sample.key?.toLocaleLowerCase().includes(query) ||
                    sample.padText?.toLocaleLowerCase().includes(query) ||
                    sample.name.toLocaleLowerCase().includes(query)
                ) {
                    filteredSamples.push(sample);
                }
            }

            if (filteredSamples.length > 0) {
                const newKit = new DrumKit(kit.id, kit.name, kit.rootPath, filteredSamples);
                results.push(newKit);
            }
        }

        filteredDrumKits = results;
        searchQueryLoading = false;
    }, 250);

    const onSearchQueryUpdated = () => {
        searchQueryLoading = true;
        filterDrumKits();
    }
</script>

{#if !playbackService || drumkits.length == 0}
    <div class="centered-text">
        Loading drum kits...
    </div>
{:else}
    <div class="search-box">
        <input type="text" placeholder="Search drum kits..." bind:value={searchQuery} on:input={onSearchQueryUpdated}>
    </div>
    {#if filteredDrumKits.length == 0}
        <div class="centered-text">
            No samples found.
        </div>
    {:else}
        <div class="drumkits">
            <LoadingOverlay loading={searchQueryLoading} />
            {#each filteredDrumKits as drumkit}
                <div class="drumkit" on:mousedown={() => startHoverMode()} on:mouseup={() => stopHoverMode()} on:mouseleave={() => stopHoverMode()}>
                    <div class="sticky-bar">
                        <h1>{drumkit.name}</h1>
                    </div>
        
                    <div class="categories">
                        {#each Object.keys(drumkit.categories) as category}
                            <div class="category">
                                <h2>
                                    <span class="text">{category}</span>
                                </h2>
            
                                <div class="samples">
                                    {#each drumkit.categories[category] as sample}
                                        <DrumPad sample={sample} triggerOnHover={hoverMode} />
                                    {/each}
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
            {/each}
        </div>
    {/if}
{/if}

<style>
    .drumkits {
        position: relative;
    }

    .search-box input {
        display: block;
        width: calc(100% - 2rem);
        padding: 1rem 1.5rem;
        margin: 1rem;
        background: none;
        color: palette(var(--color-text));
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 2rem;
        outline: none;
    }

    .centered-text {
        padding: 2rem 1rem;
        text-align: center;
        font-style: italic;
        color: rgba(255, 255, 255, 0.25);
    }

    .drumkit {
        margin-bottom: 4rem;
    }

    .sticky-bar {
        position: sticky;
        top: 0;
        background: linear-gradient(to bottom, var(--color-background) 50%, transparent);
        z-index: 1;
    }

    h1 {
        display: inline-block;
        margin: 0.75rem 0.5rem;
        padding: 0.25rem 1rem;
        font-size: 0.8rem;
        font-weight: 700;
        line-height: 1rem;
        text-transform: uppercase;
        background: var(--color-accent2);
        color: var(--color-text);
        border-radius: 1rem;
    }

    h2 {
        position: sticky;
        top: 0;
        margin: 0;
        padding: 0.75rem 1rem;
        line-height: 1.5rem;
        font-size: 0.8rem;
        font-weight: 500;
        text-align: right;
        z-index: 2;
    }

    h2 .text {
        display: inline-block;
        margin-right: -1rem;
        padding: 0 1rem;
        background: var(--color-background);
        color: rgba(255, 255, 255, 0.5);
        text-transform: uppercase;
        border-radius: 1rem;
    }

    .category {
        position: relative;
    }

    .category::after {
        content: "";
        position: absolute;
        top: 1.5rem;
        left: 1rem;
        right: 1rem;
        height: 1px;
        background: rgba(255, 255, 255, 0.1);
    }

    .category:first-child {
        margin-top: -3rem;
    }

    .samples {
        padding: 0 0.5rem;
        display: flex;
        flex-wrap: wrap;
    }
</style>
