import { DrumKitService } from './DrumKitService';
import { SampleSetService } from './SampleSetService';
import deviceManager, { DeviceManager } from '../devices/DeviceManager';

export class PlaybackService {
    ctx: AudioContext;
    audioAnalyser: AnalyserNode;

    dks: DrumKitService;
    sss: SampleSetService;
    dmgr: DeviceManager;

    private _ready = false;
    private _readyListeners: (() => void)[] = [];
    private _triggerListeners: { [index: number]: (() => void)[] } = {};

    masterGain = 1.0;

    constructor() {
        this.ctx = new AudioContext();
        this.dks = new DrumKitService(this);
        this.sss = new SampleSetService(this, this.dks);
        this.dmgr = deviceManager;

        this.initialize()
            .then(() => {
                this._ready = true;
                for (const cb of this._readyListeners) cb();
                this._readyListeners = [];
            })
            .catch((err) => {
                console.error('Failed to initialize PlaybackService:\n', err);
            });
    }

    private initialize = async () => {
        // set up other services
        await this.dks.loadKits();
        await this.sss.loadDefaults();
        this.dmgr.subscribe(this.onKeyTrigger);

        // set up global audio analyser node
        this.audioAnalyser = this.ctx.createAnalyser();
        this.audioAnalyser.fftSize = 256; // TODO: how should we make this dynamic?
    }

    on = (evt: 'ready' | 'trigger', callback: () => void, opts?: any) => {
        if (evt === 'ready') {
            if (this._ready) callback();
            else this._readyListeners.push(callback);
        } else if (evt === 'trigger') {
            if (typeof opts !== 'number') {
                console.error('SampleIndex passed to PlaybackService.on(\'trigger\') must be a number.');
                return;
            }

            if (!(opts in this._triggerListeners)) this._triggerListeners[opts] = [];
            this._triggerListeners[opts].push(callback);
        }
    }

    onKeyTrigger = (sampleIndex: number) => {
        if (!(sampleIndex in this._triggerListeners)) return;
        for (const cb of this._triggerListeners[sampleIndex]) cb();
    }
}

const instance = new PlaybackService();
export default instance;
