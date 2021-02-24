import type { PlaybackService } from "./PlaybackService";

const fs = require('fs');
const path = require('path');

const SAMPLES_ROOT = path.resolve(__dirname, 'drumkits');

export type SampleDefinition = {
    category: string;
    subcategory: string;
    key: string;
    padText: string;
    name: string;
    path: string;
}

export class Sample {
    category: string;
    subcategory: string;
    key: string;
    padText: string;
    name: string;
    path: string;

    constructor(def: SampleDefinition, private _playbackService: PlaybackService, private _audioBuffer: AudioBuffer) {
        this.category = def.category;
        this.subcategory = def.subcategory;
        this.key = def.key;
        this.padText = def.padText;
        this.name = def.name;
        this.path = def.path;
    }

    get icon(): string {
        if (this.category === 'Kicks') return '●';
        else if (this.category === 'Snares') return '◐';
        else if (this.category === 'Claps') return '◑';
        else if (this.category === 'Cymbals' && this.subcategory === 'Closed Hihats') return '◆';
        else if (this.category === 'Cymbals' && this.subcategory === 'Open Hihats') return '❖';
        else if (this.category === 'Cymbals' && this.subcategory === 'Rides') return '◩';
        else if (this.category === 'Cymbals' && this.subcategory === 'Crashes') return '■';
        else if (this.category === 'Percussion') return '▲';
        else if (this.category === 'Synth') return '◭';
        else if (this.category === 'FX') return '▶';
        else return '';
    }

    get displayKey(): boolean {
        return this.category === 'Synth';
    }

    play = (opts?: { gain?: number, playbackRate?: number }) => {
        if (!this._audioBuffer) {
            console.error(`Unable to play track '${this.name}': AudioBuffer not loaded.`);
            return;
        }

        const source = this._playbackService.ctx.createBufferSource();
        source.buffer = this._audioBuffer;

        const gain = this._playbackService.ctx.createGain();
        gain.gain.value = opts?.gain || 1.0;
        source.connect(gain);

        source.playbackRate.value = opts?.playbackRate || 1.0;

        // connect this playback to the global analyser node
        gain.connect(this._playbackService.audioAnalyser);

        // connect to output for playback
        gain.connect(this._playbackService.ctx.destination);
        source.start(0);
    }

    get duration() {
        return this._audioBuffer.duration;
    }
}

export class DrumKit {
    public categories: { [category: string]: Sample[] } = {};

    constructor(
        public id: string,
        public name: string,
        public rootPath: string,
        public samples: Sample[]) {

        // setup category-grouped samples
        this.categories = {};
        for (const sample of samples) {
            if (!(sample.category in this.categories)) {
                this.categories[sample.category] = [];
            }

            this.categories[sample.category].push(sample);
        }
    }
}

export class DrumKitService {
    kits: DrumKit[] = [];

    constructor(private _playbackService: PlaybackService) {}

    /**
     * Load all available kits from the filesystem.
     */
    loadKits = async () => {
        const dirs = fs.readdirSync(SAMPLES_ROOT);

        this.kits = [];
        for (const dir of dirs) {
            const confPath = path.resolve(SAMPLES_ROOT, dir, '.drumkit.json');
            if (!fs.existsSync(confPath)) continue;
            const conf = JSON.parse(fs.readFileSync(confPath, 'utf8'));

            const samples = [];
            for (const sampleDef of conf.samples) {
                const fullPath = path.resolve(SAMPLES_ROOT, dir, sampleDef.path);
                const data = fs.readFileSync(fullPath).buffer;
                const audioBuffer = await this._playbackService.ctx.decodeAudioData(data);
                const sample = new Sample(sampleDef, this._playbackService, audioBuffer);
                samples.push(sample);
            }

            const kit = new DrumKit(conf.id, conf.name, dir, samples);
            this.kits.push(kit);
        }
    }
}
