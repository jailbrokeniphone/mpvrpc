async function doInvoke(funcName, args1, args2) {
    var func = await window.api.doInvoke(funcName, args1, args2)
    return func
}

// ( async () => {
//     var GatewayVersion = await doInvoke("gateway")
//     console.log(`Let's connect to wss://gateway.discord.gg/?v=${GatewayVersion}`);
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
    document.querySelector(".token").placeholder = "Token Saved (Note: Restart Needed)"
    document.querySelector(".tokenSave").textContent = "Update"
});

document.querySelector(".aniSave").addEventListener("click", function () {
    doInvoke("animeName", `${document.querySelector(".aniName").value}`)
});

document.querySelector(".aniReset").addEventListener("click", function () {
    doInvoke("animeName", "")
});

document.addEventListener('drop', (event) => {
    event.preventDefault();
    event.stopPropagation();

    for (const f of event.dataTransfer.files) {
        // Using the path attribute to get absolute file path
        console.log(f.path)
        doInvoke("open", f.path)
    }
});

document.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
});

document.addEventListener('dragenter', (event) => {
    console.log('File is in the Drop Space');
});

document.addEventListener('dragleave', (event) => {
    console.log('File has left the Drop Space');
});
