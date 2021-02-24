const iohook = require('iohook');

iohook.on('keydown', evt => {
    process.send({ type: 'iohook.keydown', data: evt });
});

iohook.on('keyup', evt => {
    process.send({ type: 'iohook.keyup', data: evt });
});

iohook.start();
