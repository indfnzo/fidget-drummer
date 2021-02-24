import { AbstractDevice } from './AbstractDevice';

const { ipcRenderer } = require('electron');

export type KeyboardEvent = {
    ctrlKey: boolean;
    shiftKey: boolean;
    altKey: boolean;
    keycode: number;
    metaKey: boolean;
    rawcode: number;
    type: string;
}

export type HotkeyConfig = Partial<KeyboardEvent> & {
    sampleIndex: number;
}

export class KeyboardConfig {
    hotkeys: HotkeyConfig[];

    static DEFAULT: KeyboardConfig = {
        hotkeys: [
            { keycode:   29,  ctrlKey: true, sampleIndex:  0 }, // LCtrl
            { keycode: 3613,  ctrlKey: true, sampleIndex:  1 }, // RCtrl
            { keycode:   42, shiftKey: true, sampleIndex:  2 }, // LShift
            { keycode:   54, shiftKey: true, sampleIndex:  3 }, // RShift
            { keycode:   56,   altKey: true, sampleIndex:  4 }, // LAlt
            { keycode: 3640,   altKey: true, sampleIndex:  5 }, // RAlt
        
            { keycode:    2,                 sampleIndex:  0 }, // 1
            { keycode:    3,                 sampleIndex:  2 }, // 2
            { keycode:    4,                 sampleIndex:  4 }, // 3
            { keycode:    5,                 sampleIndex:  1 }, // 4
            { keycode:    6,                 sampleIndex:  3 }, // 5
            { keycode:    7,                 sampleIndex:  5 }, // 6
            { keycode:    8,                 sampleIndex:  6 }, // 7
            { keycode:    9,                 sampleIndex:  7 }, // 8
            { keycode:   10,                 sampleIndex:  8 }, // 9
            { keycode:   11,                 sampleIndex:  9 }, // 0
            { keycode:   12,                 sampleIndex: 10 }, // -
            { keycode:   13,                 sampleIndex: 11 }, // =
        
            { keycode:   26,                 sampleIndex:  6 }, // [
            { keycode:   27,                 sampleIndex:  7 }, // ]
            { keycode:   43,                 sampleIndex:  8 }, // \
    
            { keycode:   39,                 sampleIndex:  6 }, // ;
            { keycode:   40,                 sampleIndex:  7 }, // '
    
            { keycode:   51,                 sampleIndex:  0 }, // ,
            { keycode:   52,                 sampleIndex:  2 }, // .
            { keycode:   53,                 sampleIndex:  4 }, // /

            { keycode:   79,                 sampleIndex:  0 }, // NumPad 1
            { keycode:   80,                 sampleIndex:  2 }, // NumPad 2
            { keycode:   81,                 sampleIndex:  4 }, // NumPad 3
            { keycode:   75,                 sampleIndex:  1 }, // NumPad 4
            { keycode:   76,                 sampleIndex:  3 }, // NumPad 5
            { keycode:   77,                 sampleIndex:  5 }, // NumPad 6
            { keycode:   71,                 sampleIndex:  6 }, // NumPad 7
            { keycode:   72,                 sampleIndex:  7 }, // NumPad 8
            { keycode:   73,                 sampleIndex:  8 }, // NumPad 9
            { keycode: 3637,                 sampleIndex:  9 }, // NumPad /
            { keycode:   55,                 sampleIndex: 10 }, // NumPad *
            { keycode:   74,                 sampleIndex: 11 }, // NumPad -
            { keycode:   82,                 sampleIndex:  0 }, // NumPad 0
            { keycode:   78,                 sampleIndex:  4 }, // NumPad +
        ]
    };
}

export class Keyboard extends AbstractDevice<KeyboardConfig> {
    private pressedKeys: number[] = [];

    constructor(private config?: KeyboardConfig) {
        super();

        if (!config) this.config = KeyboardConfig.DEFAULT;
    }

    initialize = async () => {
        // listen to iohook events from the main process
        await this.unload();
        ipcRenderer.on('iohook.keydown', this.onKeydown);
        ipcRenderer.on('iohook.keyup', this.onKeyup);
    }

    unload = async () => {
        ipcRenderer.removeListener('iohook.keydown', this.onKeydown);
        ipcRenderer.removeListener('iohook.keyup', this.onKeyup);
    }

    useConfig = (config: KeyboardConfig) => {
        this.config = config;
    }

    retrieveConfig = () => {
        return this.config;
    }

    private onKeydown = (src, evt: KeyboardEvent) => {
        const hotkey = this.config.hotkeys.find(h =>
            h.keycode == evt.keycode &&
            (!h.ctrlKey || evt.ctrlKey) &&
            (!h.shiftKey || evt.shiftKey) &&
            (!h.altKey || evt.altKey));

        if (!hotkey) return;
        if (!this.pressedKeys.includes(evt.keycode)) {
            this.trigger(hotkey.sampleIndex);
            this.pressedKeys.push(evt.keycode);
        }
    }

    private onKeyup = (src, evt: KeyboardEvent) => {
        if (this.pressedKeys.includes(evt.keycode)) {
            this.pressedKeys.splice(this.pressedKeys.indexOf(evt.keycode), 1);
        }
    }
}
