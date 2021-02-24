export abstract class AbstractDevice<DeviceConfig extends {}> {
    private listeners: ((sampleIndex: number) => void)[] = [];

    abstract initialize(): Promise<void>;
    abstract unload(): Promise<void>;
    abstract useConfig(config: DeviceConfig): void;
    abstract retrieveConfig(): DeviceConfig;

    /**
     * Start listening to this device's key triggers.
     * @param callback Function to call everytime a key is triggered. Sample index is passed as a parameter.
     */
    subscribe = (callback: (sampleIndex: number) => void) => {
        this.listeners.push(callback);
    }

    /**
     * Removes a callback from this device's active listeners.
     * @param callback Callback function passed to the subscribe() method.
     */
    unsubscribe = (callback: (sampleIndex: number) => void) => {
        const index = this.listeners.indexOf(callback);
        if (index < 0) return;
        this.listeners.splice(index, 1);
    }

    /**
     * Triggers a keypress from this device.
     * @param sampleIndex Which sample in the sampleset was triggered by the device?
     */
    protected trigger = (sampleIndex: number) => {
        for (const cb of this.listeners) cb(sampleIndex);
    }
}
