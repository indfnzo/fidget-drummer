import type { DrumKitService, Sample } from "./DrumKitService";
import type { PlaybackService } from "./PlaybackService";

export type CustomSample = {
    gain?: number;
    playbackRate?: number;
    sample: Sample;
}

export class SampleSet {
    constructor(public samples: CustomSample[]) {}
}

export class SampleSetService {
    public activeSampleSet: SampleSet;

    constructor(private _pbs: PlaybackService, private _dks: DrumKitService) {}

    loadDefaults = () => {
        // TODO: load this sampleset from disk and make it editable
        this.activeSampleSet = new SampleSet([
            { gain: 1.0, sample: this.getSample('stock/cymatics_odyssey', 'Kicks/Cymatics - Odyssey Kick 11 - A#.wav') },
            { gain: 1.0, sample: this.getSample('stock/cymatics_9god', 'Kicks/Cymatics - 9God Kick 1 - C.wav') },
            { gain: 0.8, sample: this.getSample('stock/cymatics_odyssey', 'Snares/Cymatics - Odyssey Various Snare 8 - A#.wav') },
            { gain: 1.0, sample: this.getSample('stock/cymatics_808mob', 'Snares/Cymatics - 808 Mob Snare 5 - G.wav') },
            { gain: 0.9, sample: this.getSample('stock/cymatics_odyssey', 'Claps/Cymatics - Odyssey Big Clap 2.wav') },
            { gain: 1.6, sample: this.getSample('stock/cymatics_odyssey', 'Claps/Cymatics - Odyssey Tight Clap 1.wav') },
            { gain: 1.0, sample: this.getSample('stock/cymatics_odyssey', 'Cymbals/Cymatics - Odyssey Closed Hihat 5.wav') },
            { gain: 1.0, sample: this.getSample('stock/cymatics_odyssey', 'Cymbals/Cymatics - Odyssey Closed Hihat 2.wav') },
            { gain: 1.0, sample: this.getSample('stock/cymatics_odyssey', 'Cymbals/Cymatics - Odyssey Open Hihat 3.wav') },
            { gain: 1.0, sample: this.getSample('stock/cymatics_odyssey', 'FX/Impacts/Cymatics - Odyssey Impact 1.wav') },
            { gain: 1.0, sample: this.getSample('song/itzy_icy', 'eh.wav') },
            { gain: 1.0, sample: this.getSample('stock/cymatics_9god', 'FX/Cymatics - 9God FX 4 - Scratch.wav') }
        ]);
    }

    loadRandom = () => {
        const samples: CustomSample[] = [
            { sample: this.getRandom('Kicks') },
            { sample: this.getRandom('Kicks') },
            { sample: this.getRandom('Snares') },
            { sample: this.getRandom('Snares') },
            { sample: this.getRandom('Claps') },
            { sample: this.getRandom('Claps') },
            { sample: this.getRandom('Cymbals', 'Closed Hihats') },
            { sample: this.getRandom('Cymbals', 'Closed Hihats') },
            { sample: this.getRandom('Cymbals', 'Open Hihats') },
            { sample: this.getRandom('FX') },
            { sample: this.getRandom('FX') },
            { sample: this.getRandom('FX') }
        ];

        const sampleSet = new SampleSet(samples);
        this.activeSampleSet = sampleSet;
    }

    getSample = (kitId: string, path: string) => {
        const kit = this._dks.kits.find(k => k.id == kitId);
        if (!kit) {
            console.error(`Unable to load sample: Kit [${kitId}] not found.`);
            return null;
        }
        const sample = kit.samples.find(s => s.path === path);
        if (!sample) {
            console.error(`Unable to load sample [${path}].`);
            return null;
        }
        return sample;
    }

    getRandom = (category?: string, subcategory?: string) => {
        if (!category) {
            // get a completely random sample
            const kit = this._dks.kits[Math.floor(Math.random() * this._dks.kits.length)];
            const sample = kit.samples[Math.floor(Math.random() * kit.samples.length)];
            return sample;
        } else {
            // limit randomizer by category
            const eligibleKits = this._dks.kits.filter(kit => category in kit.categories);
            const kit = eligibleKits[Math.floor(Math.random() * eligibleKits.length)];
            const eligibleSamples = subcategory ? kit.categories[category].filter(s => s.subcategory && s.subcategory === subcategory) : kit.categories[category];
            const sample = eligibleSamples[Math.floor(Math.random() * eligibleSamples.length)];
            return sample;
        }
    }
}
