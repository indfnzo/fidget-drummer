<script lang="ts">
    import playbackService from '../services/PlaybackService';
    import type { SampleSet } from '../services/SampleSetService';
    import DrumPad from './DrumPad.svelte';
    import SoundViz from './SoundViz.svelte';

    let activeSampleSet: SampleSet;

    playbackService.on('ready', () => {
        activeSampleSet = playbackService.sss.activeSampleSet;
    });

    let masterGain: number = 100;
    const onMasterGainChanged = (evt) => {
        playbackService.masterGain = evt.target.value * 0.01;
    }

    // drag to play pads
    let hoverMode = false;
    const startHoverMode = () => hoverMode = true;
    const stopHoverMode = () => hoverMode = false;

    const randomize = () => {
        playbackService.sss.loadRandom();
        activeSampleSet = playbackService.sss.activeSampleSet;
    }
</script>

{#if !playbackService || !activeSampleSet}
    <div class="loading-placeholder">
        Please wait...
    </div>
{:else}
    <div class="container">
        <div class="heading">
            <h1>Active Samples</h1>
            <div class="randomize" on:click={randomize}>
                Randomize&nbsp;&nbsp;&nbsp;↻
            </div>
        </div>
        <div class="active-samples" on:mousedown={() => startHoverMode()} on:mouseup={() => stopHoverMode()} on:mouseleave={() => stopHoverMode()}>
            {#each activeSampleSet.samples as sample, i}
                <DrumPad sample={sample.sample} triggerOnHover={hoverMode} playbackOptions={{ gain: sample.gain, playbackRate: sample.playbackRate }} setIndex={i} />
            {/each}
        </div>
        <div class="master-gain">
            <h1>Master Gain</h1>
            <input type="range" bind:value={masterGain} on:input={onMasterGainChanged} min="1" max="200" step="1" list="master-gain-steps">
            <datalist id="master-gain-steps">
                <option value="50">
                <option value="100">
                <option value="150">
            </datalist>
        </div>
        <div class="sound-viz">
            <SoundViz />
        </div>
    </div>
{/if}

<style>
    .loading-placeholder {
        padding: 5rem 0;
        line-height: 2.5rem;
        text-align: center;
        font-style: italic;
        color: rgba(255, 255, 255, 0.25);
        background: rgba(0, 0, 0, 0.125);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .container {
        position: relative;
        padding: 0.5rem;
        background: rgba(0, 0, 0, 0.125);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        z-index: 1;
    }

    .heading {
        display: flex;
    }

    h1, .randomize {
        flex: 1;
        margin: 0;
        padding: 0 0.5rem;
        line-height: 1.5rem;
        font-size: 0.8rem;
        text-transform: uppercase;
        font-weight: 700;
        color: rgba(255, 255, 255, 0.5);
    }

    .randomize {
        flex: 0 0 auto;
        color: var(--color-text-muted);
        cursor: pointer;
    }

    .randomize:hover {
        color: var(--color-accent);
    }

    .active-samples {
        position: relative;
        display: flex;
        flex-wrap: wrap;
    }

    .active-samples > :global(.sample) {
        background: #292E3B !important;
    }

    .active-samples > :global(.sample):hover {
        background: #353945 !important;
    }

    .master-gain {
        margin-top: 1rem;
    }

    input[type=range] {
        position: relative;
        -webkit-appearance: none;
        margin: 2rem;
        width: calc(100% - 4rem);
        outline: none;
        background: none;
    }

    input[type=range]::-webkit-slider-runnable-track {
        width: 100%;
        height: 2px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 1rem;
        cursor: pointer;
        transition: all 100ms ease;
    }

    input[type=range]:hover::-webkit-slider-runnable-track,
    input[type=range]:focus::-webkit-slider-runnable-track {
        background: var(--color-accent2);
    }

    input[type=range]::-webkit-slider-thumb {
        -webkit-appearance: none;
        margin-top: calc(-0.5rem + 2px);
        height: 1rem;
        width: 1rem;
        transform: rotate(45deg);
        background: var(--color-accent);
        border: 4px solid var(--color-background);
        box-shadow: 0 0 3px var(--color-accent);
        transition: all 100ms ease;
    }

    input[type=range]:hover::-webkit-slider-thumb,
    input[type=range]:focus::-webkit-slider-thumb {
        box-shadow: 0 0 3px var(--color-accent);
    }

    .sound-viz {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: -1;
    }
</style>
