<script lang="ts">
    import playbackService from '../services/PlaybackService';

    let enabled = false;
    let analyser: AnalyserNode;
    let fftSize = 256;

    let loopbackViz: Uint8Array;
    $: loopbackViz = new Uint8Array(fftSize / 2);
    let outputViz: Uint8Array;
    $: outputViz = new Uint8Array(fftSize / 2);

    const update = () => {
        requestAnimationFrame(update);
        const values = new Uint8Array(fftSize / 2);
        analyser.getByteFrequencyData(values);
        loopbackViz = values;

        const values2 = new Uint8Array(fftSize / 2);
        playbackService.audioAnalyser.getByteFrequencyData(values2);
        outputViz = values2;
    }

    playbackService.on('ready', async () => {
        // request input device permission
        const devices = (await navigator.mediaDevices.enumerateDevices()).filter(d => d.kind === 'audioinput');
        let deviceId = null;

        // try to look for a loopback device
        const loopbackDeviceNames = [
            'stereo mix',
            'waveout mix',
            'mixed output',
            'what you hear'
        ];
        deviceId = devices.find(d => loopbackDeviceNames.some(name => d.label.toLocaleLowerCase().includes(name)))?.deviceId;
        navigator.mediaDevices.getUserMedia({ audio: { deviceId } })
            .then(stream => {
                const streamSource = playbackService.ctx.createMediaStreamSource(stream);
                analyser = playbackService.ctx.createAnalyser();
                analyser.fftSize = fftSize;
                streamSource.connect(analyser);

                enabled = true;
                update();
            })
            .catch(() => {
                console.warn('Media device initialization failed. Sound visualization disabled.');
                enabled = false;
            });
    });
</script>

{#if enabled}
    <div class="container">
        <svg width="100%" height="8rem" preserveAspectRatio="none" viewBox="0 0 512 256" fill="none" xmlns="http://www.w3.org/2000/svg">
            {#each {length: (fftSize / 2)} as _, i}
                <rect x={i*2 + 1} y={256 - loopbackViz[i]} width="1" height={loopbackViz[i]} fill="#292E3B"/>
            {/each}
            {#each {length: (fftSize / 2)} as _, i}
                <rect x={(fftSize * 2) - (i*2) - 1} y={256 - loopbackViz[i]} width="1" height={loopbackViz[i]} fill="#292E3B"/>
            {/each}
            {#each {length: (fftSize / 2)} as _, i}
                <rect x={i*2 + 1} y={256 - ((outputViz[i] / 2) * playbackService.masterGain)} width="1" height={((outputViz[i] / 2) * playbackService.masterGain)} fill="#394D65"/>
            {/each}
            {#each {length: (fftSize / 2)} as _, i}
                <rect x={(fftSize * 2) - (i*2) - 1} y={256 - ((outputViz[i] / 2) * playbackService.masterGain)} width="1" height={((outputViz[i] / 2) * playbackService.masterGain)} fill="#394D65"/>
            {/each}
        </svg>
    </div>
{/if}

<style>
    .container {
        position: relative;
        width: 100%;
        font-size: 0;
    }
</style>
