import type { AbstractDevice } from './AbstractDevice';
import { Keyboard } from './Keyboard';

export class DeviceManager {
    private listeners: ((sampleIndex: number) => void)[] = [];
    devices: AbstractDevice<any>[] = [];

    constructor() {
        // use the keyboard by default
        this.useDevice(new Keyboard());
    }

    useDevice = async (device: AbstractDevice<any>) => {
        await device.initialize();
        device.subscribe(this.trigger);
        this.devices.push(device);
    }

    removeDevice = async (device: AbstractDevice<any>) => {
        const index = this.devices.indexOf(device);
        if (index === -1) return;

        await device.unload();
        device.unsubscribe(this.trigger);
        this.devices.splice(index, 1);
    }

    subscribe = (callback: (sampleIndex: number) => void) => {
        this.listeners.push(callback);
    }

    unsubscribe = (callback: (sampleIndex: number) => void) => {
        const index = this.listeners.indexOf(callback);
        if (index < 0) return;
        this.listeners.splice(index, 1);
    }

    /**
     * Funnels down all device triggers into a single pubsub mechanism.
     * @param sampleIndex Sample index triggered from all devices.
     */
    trigger = (sampleIndex: number) => {
        for (const cb of this.listeners) cb(sampleIndex);
    }
}

const deviceManager = new DeviceManager();
export default deviceManager;
