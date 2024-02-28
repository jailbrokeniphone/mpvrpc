const contextBridge = require("electron").contextBridge;
const ipcRenderer = require("electron").ipcRenderer;

contextBridge.exposeInMainWorld(
    "api", {
    doInvoke: (channel, data, data2) => {
        let validChannels = ["rw", "toggleplay", "animeName", "write", "read", "open"];

        if (validChannels.includes(channel)) {
            return ipcRenderer.invoke(channel, data, data2);
        }
    }
},
);
