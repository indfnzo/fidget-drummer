<script lang="ts">
    import { tweened } from 'svelte/motion';
    import playbackService from '../services/PlaybackService';
    import type { Sample } from '../services/DrumKitService';

    export let sample: Sample;
    export let triggerOnHover = false;

    export let playbackOptions: { gain?: number, playbackRate?: number } = undefined;

    // animation vars
    const effectSize = tweened(1.5);
    const effectOpacity = tweened(0);
    const flashOpacity = tweened(0);

    let sizeTimeout, opacityTimeout, flashTimeout;

    const play = () => {
        sample.play({
            gain: playbackService.masterGain * (playbackOptions?.gain || 1.0),
            playbackRate: (playbackOptions?.playbackRate || 1.0)
        });

        const duration = sample.duration * 1000;
        const delay = sample.duration < 0.25 ? sample.duration * 1000 : 250;

        clearTimeout(sizeTimeout);
        effectSize.set(3, { duration: 100 });
        sizeTimeout = setTimeout(() => effectSize.set(1.5, { duration }), delay);

        clearTimeout(opacityTimeout);
        effectOpacity.set(1, { duration: 50 });
        opacityTimeout = setTimeout(() => effectOpacity.set(0, { duration }), delay);

        clearTimeout(flashTimeout);
        flashOpacity.set(1, { duration: 50 });
        flashTimeout = setTimeout(() => flashOpacity.set(0, { duration: 50 }), 50);
    }

    const onMouseEnter = () => {
        if (triggerOnHover) play();
    }

    // listen to automated playback triggers
    export let setIndex: number = undefined;
    if (setIndex != undefined) playbackService.on('trigger', play, setIndex);
</script>

{#if !sample}
    <div class="sample error">
        <div class="pad-texts">
            <span class="icon">⚠</span>
            <span class="text">ERR</span>
        </div>
    </div>
{:else}
    <div class="sample" tabindex="0" on:mouseenter={onMouseEnter} on:mousedown={play} title={sample.name}>
        <div class="effect" style="transform: scale({$effectSize}); opacity: {$effectOpacity};"></div>
        <div class="flash" style="opacity: {$flashOpacity};"></div>
        <div class="pad-texts">
            {#if sample.icon}<span class="icon">{sample.icon}</span>{/if}
            {#if sample.padText}<span class="text">{sample.padText}</span>{/if}
            {#if sample.displayKey && sample.key}<span class="key">{sample.key}</span>{/if}
        </div>
    </div>
{/if}

<style>
    .sample {
        position: relative;
        width: 4rem;
        height: 4rem;
        margin: 0.5rem;
        outline: none;
        background: rgba(255, 255, 255, 0.05);
        transition: all 100ms ease;
        border-radius: 5px;
        overflow: hidden;
    }

    .sample:hover {
        background: rgba(255, 255, 255, 0.1);
        cursor: pointer;
    }

    .sample.error {
        background: radial-gradient(rgba(255, 0, 0, 0.75), rgba(255, 0, 0, 0.33)) !important;
    }

    .pad-texts span {
        font-size: 0.8rem;
        font-weight: 800;
        color: var(--color-background);
        line-height: 1;
        position: absolute;
        left: 0.5rem;
        right: 0.5rem;
        top: 0.5rem;
        bottom: 0.5rem;
    }

    .pad-texts .icon { bottom: auto; right: auto; }
    .pad-texts .text { top: auto; right: auto; }
    .pad-texts .key { bottom: auto; left: auto; }

    .effect, .flash {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(var(--color-accent), transparent 50%);
    }

    .effect {
        border-radius: 50%;
    }

    .flash {
        background: rgba(255, 255, 255, 0.33);
    }
</style>
