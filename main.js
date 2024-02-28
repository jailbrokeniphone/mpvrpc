
import { Client } from "@xhayper/discord-rpc";
import * as fs from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const __dirname = import.meta.dirname;
const { app, BrowserWindow, ipcMain, safeStorage } = require("electron")
// const path = require("node:path");
import { resolve } from "path";

function write(file, string) {
    try {
        fs.writeFileSync(`${file}`, string, "utf-8");
    } catch (err) {
        console.error(err);
    }
}

function read(file) {
    try {
        const data = fs.readFileSync(`${file}`, "utf-8");
        return data
    } catch (err) {
        console.error(err);
    }
}

// const prompt = require("prompt-sync")();
// let clientId = ""

// if (!fs.existsSync("token.json")) {
//     clientId = prompt("CLIENT ID > ");
//     console.log(`Saved Client ID: ${clientId}`);
//     write("token.json", JSON.stringify({ token: clientId }, null, 2));
// } else {
//     clientId = JSON.parse(read("token.json")).token
//     console.log(clientId)
// }

let clientId = ""
clientId = JSON.parse(read(`${app.getPath("userData")}/token.json`)).token

let client = new Client({
    clientId: `${clientId}`
});

async function setActivity(jsonSettings) {
    if (!client) return;
    // console.log(jsonSettings)
    // console.log(jsonSettings.largeImageKey)
    client.user?.setActivity({
        details: jsonSettings.details,
        state: jsonSettings.state,
        startTimestamp: jsonSettings.startTimestamp,
        largeImageKey: jsonSettings.largeImageKey,
        largeImageText: jsonSettings.largeImageText,
        smallImageKey: jsonSettings.smallImageKey,
        smallImageText: jsonSettings.smallImageText,
        instance: false
    })
}

client.on("ready", () => {
    console.log("Ready!")
});

client.login();

const mpvAPI = require("node-mpv");
// where you want to initialise the API
const mpv = new mpvAPI(
    {
        "audio_only": false,
        "auto_restart": true,
        "binary": null,
        "debug": false,
        "ipcCommand": null,
        "socket": "/tmp/node-mpv.sock", // UNIX
        "socket": "\\\\.\\pipe\\mpvserver", // Windows
        "time_update": 1,
        "verbose": false,
    },
    [
        "--geometry=1280x720"
    ]
);

// somewhere within an async context
// starts MPV
try {
    await mpv.start()
    mpv.observeProperty("time-pos/full")
}
catch (error) {
    // handle errors here
    console.log(error);
}

// mpv.on("statuschange", (status) => {
//     console.log(status);
// });

let oldpos = 0
let animeName = ""

// async function setActivity(jsonSettings) {
//     console.log(jsonSettings)
//     // details: jsonSettings.details,
//     // state: jsonSettings.state,
//     // startTimestamp: jsonSettings.startTimestamp,
//     // largeImageKey: jsonSettings.largeImageKey,
//     // largeImageText: jsonSettings.largeImageText,
//     // smallImageKey: jsonSettings.smallImageKey,
//     // smallImageText: jsonSettings.smallImageText,
//     // instance: false
// }

mpv.on("status", async (status) => {
    if (status.property == "time-pos/full") {
        let pos = Math.round(status.value)
        let duration = await mpv.getProperty("duration").then(
            function (duration) {
                return duration
            }
        )
        let name = await mpv.getFilename("stripped").then(
            function (filename) {
                return filename
            }
        )
        if (pos > oldpos) {
            if (animeName != "") {
                setActivity({ details: `Watching ${animeName}`, state: `${new Date(pos * 1000).toISOString().slice(11, 19)} | ${new Date(duration * 1000).toISOString().slice(11, 19)}`, largeImageKey: "mpv", largeImageText: "Watching with MPV" })
                oldpos = pos
                return
            }
            setActivity({ details: `Watching ${name}`, state: `${new Date(pos * 1000).toISOString().slice(11, 19)} | ${new Date(duration * 1000).toISOString().slice(11, 19)}`, largeImageKey: "mpv", largeImageText: "Watching with MPV" })
        }
        oldpos = pos
    }

    if (status.property == "pause" && status.value == true) {
        if (animeName != "") {
            setActivity({ details: `Watching ${animeName}`, state: `Paused`, largeImageKey: "mpv", largeImageText: "Watching with MPV" })
            return
        }
        let name = await mpv.getFilename("stripped").then(
            function (filename) {
                return filename
            }
        )
        setActivity({ details: `Watching ${name}`, state: `Paused`, largeImageKey: "mpv", largeImageText: "Watching with MPV" })
    }
});


const createWindow = () => {
    const win = new BrowserWindow({
        width: 500,
        height: 500,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            contextBridge: true,
            sandbox: true,
            preload: resolve("./preload.js"),
            renderer: resolve("./renderer.js"),
        },
        center: true,
        title: "controller"
    })

    win.loadFile("ui/index.html")
    win.webContents.openDevTools()
}

app.whenReady().then(() => {
    createWindow()

    ipcMain.handle("write", async (event, string, file) => {
        try {
            var appdata = app.getPath("userData")
            fs.writeFileSync(`${appdata}/${file}`, string, "utf-8");
        } catch (err) {
            console.error(err);
        }
    })

    ipcMain.handle("read", async (event, file) => {
        try {
            var appdata = app.getPath("userData")
            const data = fs.readFileSync(`${appdata}/${file}`, "utf-8");
            return data
        } catch (err) {
            console.error(err);
        }
    })

    ipcMain.handle("open", async (event, file) => {
        if (!mpv.isRunning()) {
            try {
                await mpv.start()
                mpv.observeProperty("time-pos/full")
            } catch (err) {
                console.error(err);
            }
        }
        mpv.load(file);
    })

    ipcMain.handle("animeName", async (event, string) => {
        animeName = string
    })

    ipcMain.handle("toggleplay", async (event) => {
        mpv.togglePause()
        return await mpv.isPaused();
    })

    ipcMain.handle("rw", async (event, secs) => {
        mpv.seek(secs, "relative")
    })

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on("window-all-closed", () => {
    mpv.quit()
    if (process.platform !== "darwin") app.quit()
})

mpv.on("quit", async (status) => {
    app.quit()
})
