async function doInvoke(funcName, args1, args2) {
    var func = await window.api.doInvoke(funcName, args1, args2)
    return func
}

// ( async () => {
//     var GatewayVersion = await doInvoke("gateway")
//     console.log(`Let"s connect to wss://gateway.discord.gg/?v=${GatewayVersion}`);
// } )();

async function submitToken(string) {
    doInvoke("write", JSON.stringify({ token: `${string}` }, null, 2), `token.json`);
}

async function retrieveToken() {
    var tokenFile = await doInvoke("read", `token.json`)
    return tokenFile
}

document.querySelector(".tokenSave").addEventListener("click", function () {
    console.log("toyota")
    submitToken(`${document.querySelector(".token").value}`)
    document.querySelector(".token").value = ""
    document.querySelector(".token").placeholder = "saved (restart needed)"
    document.querySelector(".tokenSave").textContent = "update"
});

document.querySelector(".aniSave").addEventListener("click", function () {
    doInvoke("animeName", `${document.querySelector(".aniName").value}`)
});

document.querySelector(".aniReset").addEventListener("click", function () {
    doInvoke("animeName", "")
});

document.querySelector(".dropfile").addEventListener("drop", (event) => {
    event.preventDefault();
    event.stopPropagation();
    document.querySelector(".dropfile").style["backgroundColor"] = "hsla(0, 0%, 0%, 0)"
    document.querySelector(".dropfile").style["color"] = "#fff"
    document.querySelector(".interactiveToggle").src = "assets/pause.svg"

    for (const f of event.dataTransfer.files) {
        // Using the path attribute to get absolute file path
        console.log(f.path)
        doInvoke("open", f.path)
    }
});

document.querySelector(".dropfile").addEventListener("dragover", (e) => {
    e.preventDefault();
    e.stopPropagation();
});

document.querySelector(".dropfile").addEventListener("dragenter", (event) => {
    console.log("File is in the Drop Space");
    document.querySelector(".dropfile").style["backgroundColor"] = "#181825"
    document.querySelector(".dropfile").style["color"] = "#fff"
});

document.querySelector(".dropfile").addEventListener("dragleave", (event) => {
    console.log("File has left the Drop Space");
    document.querySelector(".dropfile").style["backgroundColor"] = "hsla(0, 0%, 0%, 0)"
    document.querySelector(".dropfile").style["color"] = "#fff"
});

document.querySelector(".play").addEventListener("click", async (event) => {
    var x = await doInvoke("toggleplay");
    if (x == true) {
        document.querySelector(".interactiveToggle").src = "assets/play.svg"
    } else {
        document.querySelector(".interactiveToggle").src = "assets/pause.svg"
    }
    console.log(x)
});

document.querySelector(".rewind").addEventListener("click", (event) => {
    doInvoke("rw", -document.querySelector(".seekNum").value);
});

document.querySelector(".forward").addEventListener("click", (event) => {
    doInvoke("rw", document.querySelector(".seekNum").value);
});
