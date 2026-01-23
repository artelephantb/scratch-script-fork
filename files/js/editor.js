let assets = {}
let spriteList = []
let codeList = {}
let currentSprite = null
let projectName = "My Project"
let templates = {}
let keys = {}

let currentTab = "code";

templates.costume = `<tr><td style="padding: 5px" title="Remove">X</td><td><img style="width: 60px"></td><td class="name-box-costume">`
templates.sound = `<tr><td style="padding: 5px" title="Remove">X</td><td><audio controls></audio></td><td class="name-box-sound">`
templates.sprite = `<div class="sprite"><p class="delete">&times;</p><p></p></div>`

window.addEventListener("keydown", shiftCheck)
window.addEventListener("keyup", shiftCheck)


function showErrorMessage(title, message) {
    let errorMessage = document.querySelector("#error-message")

    errorMessage.getElementsByTagName("h2")[0].innerText = title
    errorMessage.getElementsByTagName("p")[0].innerText = message

    document.querySelector("#error-message").hidden = false
}


function shiftCheck(e) {
    if (e.shiftKey) {
        keys.shift = true
    } else {
        keys.shift = false
    }
}

function handleGreenFlag() {
    if (keys.shift) {
        scaffolding.vm.setTurboMode(!scaffolding.vm.runtime.turboMode)
        document.querySelector("#turbo-mode").hidden = !scaffolding.vm.runtime.turboMode
    } else {
        scaffolding.greenFlag()
    }
}

function switchToCode() {
    document.getElementById(`editor-${currentTab}-button`).classList.remove("selected")
    document.getElementById("editor-code-button").classList.add("selected")

    document.querySelector("#editor").hidden = false
    document.querySelector("#costume-editor").hidden = true
    document.querySelector("#sound-editor").hidden = true

    currentTab = "code"
}

function switchToCostumes() {
    document.getElementById(`editor-${currentTab}-button`).classList.remove("selected")
    document.getElementById("editor-costumes-button").classList.add("selected")

    document.querySelector("#editor").hidden = true
    document.querySelector("#costume-editor").hidden = false
    document.querySelector("#sound-editor").hidden = true

    currentTab = "costumes"
}

function switchToSounds() {
    document.getElementById(`editor-${currentTab}-button`).classList.remove("selected")
    document.getElementById("editor-sounds-button").classList.add("selected")

    document.querySelector("#editor").hidden = true
    document.querySelector("#costume-editor").hidden = true
    document.querySelector("#sound-editor").hidden = false

    currentTab = "sounds"
}

async function costumeChanged() {
    let input = document.getElementById("costume-file-input")
    for (let file of input.files) {
        // var file = input.files[0];
        var extension = file.name.split(".").pop().toLowerCase();
        var name = file.name.slice(0, file.name.lastIndexOf("."));
        var reader = new FileReader();
        reader.readAsArrayBuffer(file);
        const loadPromise = new Promise((resolve, reject) => {
            reader.addEventListener("loadend", resolve)
            reader.addEventListener("error", reject)
        });
        // reader.onloadend = function() {
        //     addCostume(reader.result, extension, name);
        // };
        await loadPromise
        addCostume(reader.result, extension, name)
    }
}

async function soundChanged() {
    let input = document.getElementById("sound-file-input")
    for (let file of input.files) {
        // var file = input.files[0];
        var extension = file.name.split(".").pop().toLowerCase();
        var name = file.name.slice(0, file.name.lastIndexOf("."));
        var reader = new FileReader();
        reader.readAsArrayBuffer(file);
        const loadPromise = new Promise((resolve, reject) => {
            reader.addEventListener("loadend", resolve)
            reader.addEventListener("error", reject)
        });
        // reader.onloadend = function() {
        //     addCostume(reader.result, extension, name);
        // };
        await loadPromise
        addSound(reader.result, extension, name)
    }
}

async function getImageDimensions(src) {
    return new Promise((resolve, reject) => {
        let img = new Image()
        img.onload = () => resolve([img.width, img.height])
        img.onerror = reject
        img.src = src
    })
}

function removeCostume(num) {
    assets.sprites[currentSprite].costumeList.splice(num, 1)
    loadSprite(currentSprite)
}

function removeSound(num) {
    assets.sprites[currentSprite].soundList.splice(num, 1)
    loadSprite(currentSprite)
}

function removeSprite(spriteName) {
    console.log(spriteName)

    delete assets.sprites[spriteName]
    delete codeList[spriteName]

    spriteList.splice(spriteList.indexOf(spriteName), 1)
    document.querySelector(`#sprites div p[data-sprite-name="${spriteName}"]`).parentNode.remove()

    loadSprite(spriteList[spriteList.length - 1])
}

async function addCostume(file, extension, name) {
    let newEl = htmlToNode(templates.costume)
    const url = URL.createObjectURL(
        new Blob([file], {
            type: (extension == "svg") ? "image/svg+xml": null,
        })
    );
    let [width, height] = await getImageDimensions(url)
    newEl.children[0].setAttribute("onclick", `removeCostume(${assets.sprites[currentSprite].costumeList.length})`)
    newEl.children[1].children[0].src = url
    newEl.children[2].innerText = name + "." + extension
        
    assets.sprites[currentSprite].costumeList.push({
        name: name,
        hash: md5(file) + "." + extension,
        width: width,
        height: height
    })

    assets.list[md5(file) + "." + extension] = file

    document.getElementById("costume-list").appendChild(newEl)
}

async function addSound(file, extension, name) {
    let newEl = htmlToNode(templates.sound)
    const url = URL.createObjectURL(
        new Blob([file], {
            type: ((extension == "wav") ? "audio/wav": (extension == "mp3") ? "audio/mpeg": null),
        })
    );
    newEl.children[0].setAttribute("onclick", `removeSound(${assets.sprites[currentSprite].soundList.length})`)
    newEl.children[1].children[0].src = url
    newEl.children[2].innerText = name + "." + extension
        
    assets.sprites[currentSprite].soundList.push({
        name: name,
        hash: md5(file) + "." + extension,
    })

    assets.list[md5(file) + "." + extension] = file

    document.getElementById("sound-list").appendChild(newEl)
}

function getSpriteName(sprite, uppercase) {
    return (sprite == "stage") ? (uppercase ? "Stage": "stage"): Base64.decode(sprite)
}

async function decodeSprite(zip, sprite) {
    let spriteFile = JSON.parse(await zip.file("sprites/" + sprite + ".json").async("string"))
    assets.sprites[sprite] = {}
    assets.sprites[sprite].costumeList = []
    assets.sprites[sprite].soundList = []

    let spriteCode = await zip.file("sprites/" + sprite + "_code.txt").async("string")
    console.log(sprite, spriteCode)
    codeList[sprite] = spriteCode
    spriteList.push(sprite)

    let spriteCostumes = spriteFile.costumeList
    let spriteSounds = spriteFile.soundList

    // Costumes
    for (let costume of spriteCostumes) {
        assets.list[costume.hash] = await zip.file("assets/" + costume.hash).async("blob")
        const url = URL.createObjectURL(
            new Blob([assets.list[costume.hash]], {
                type: (costume.hash.split(".").pop() == "svg") ? "image/svg+xml": null,
            })
        );
        let [width, height] = await getImageDimensions(url)
        assets.sprites[sprite].costumeList.push({
            name: costume.name,
            hash: costume.hash,
            width: width,
            height: height
        })
    }
    
    // Sounds
    for (let sound of spriteSounds) {
        // alert(`Sprite: ${getSpriteName(sprite)}, Costume: ${sound.name}`)
        assets.list[sound.hash] = await zip.file("assets/" + sound.hash).async("blob")//"arraybuffer")
        const url = URL.createObjectURL(
            new Blob([assets.list[sound.hash]], {
                type: ((sound.hash.split(".").pop() == "wav") ? "audio/wav": (sound.hash.split(".").pop() == "mp3") ? "audio/mpeg": null),
            })
        );
        assets.sprites[sprite].soundList.push({
            name: sound.name,
            hash: sound.hash,
        })
    }


    let spriteElement = htmlToNode(templates.sprite)
    spriteElement.children[0].addEventListener("click", function() {confirm("Are you sure you want to delete this sprite?") ? removeSprite(sprite): null})
    spriteElement.children[1].dataset.spriteName = sprite
    spriteElement.children[1].setAttribute("onclick", `loadSprite("${sprite}")`)
    spriteElement.children[1].innerText = getSpriteName(sprite, true)

    if (sprite == "stage") {
        spriteElement.children[0].remove()
    }

    document.getElementById("sprites").appendChild(spriteElement)
}

async function loadProjectFromFile(inputFile) {
    assets = {}
    assets.list = {}
    assets.sprites = {}
    spriteList = []
    try {
        let zip = new JSZip()
        await zip.loadAsync(inputFile)
        let data = JSON.parse(await zip.file("data.json").async("string"))
        projectName = data.name
        // alert(data.name)
        let zipSpriteList = data.sprites
        document.getElementById("sprites").innerHTML = ""
        await decodeSprite(zip, "stage")
        for (let sprite of zipSpriteList) {
            await decodeSprite(zip, sprite)
        }

        // console.log(spriteList[1])
        console.log("loading sprite", spriteList[spriteList.length - 1], spriteList)
        loadSprite(spriteList[spriteList.length - 1], false)
    }
    catch(e) {
        showErrorMessage("An error occurred in loading the project", e)
    }
}

function saveCurrentSpriteCode() {
    codeList[currentSprite] = codemirror.state.doc.toString()
}

function loadSprite(spriteName, shouldKeep) {
    document.querySelectorAll(".sprite-item").forEach(el => el.className = "sprite-item")

    try {
        document.querySelector(`#sprites div p[data-sprite-name="${currentSprite}"]`).parentNode.classList.remove("selected")
    } catch (error) {
        if (!error instanceof TypeError) throw error
    }
    document.querySelector(`#sprites div p[data-sprite-name="${spriteName}"]`).parentNode.classList.add("selected")

    document.querySelector("#selected-sprite").innerText = "Sprite: " + getSpriteName(spriteName, true)
    document.querySelector("#selected-sprite").hidden = false

    if (shouldKeep) {
        saveCurrentSpriteCode()
    }
    currentSprite = spriteName
    codemirror.dispatch({
        changes: {from: 0, to: codemirror.state.doc.length, insert: codeList[currentSprite]}
    });
    // alert("Loading sprite: " + getSpriteName(spriteName))
    document.getElementById("costume-list").innerHTML = ""
    document.getElementById("sound-list").innerHTML = ""
    for (let [i, costume] of assets.sprites[spriteName].costumeList.entries()) {
        let newEl = htmlToNode(templates.costume)
        const url = URL.createObjectURL(
            new Blob([assets.list[costume.hash]], {
                type: (costume.hash.split(".").pop() == "svg") ? "image/svg+xml": null,
            })
        );
        newEl.children[0].setAttribute("onclick", `removeCostume(${i})`)
        newEl.children[1].children[0].src = url
        newEl.children[2].innerText = costume.name + "." + costume.hash.split(".").pop()
        document.getElementById("costume-list").appendChild(newEl)
    }
    for (let sound of assets.sprites[spriteName].soundList) {
        let newEl = htmlToNode(templates.sound)
        const url = URL.createObjectURL(
            new Blob([assets.list[sound.hash]], {
                type: ((sound.hash.split(".").pop() == "wav") ? "audio/wav": (sound.hash.split(".").pop() == "mp3") ? "audio/mpeg": null),
            })
        );
        newEl.children[0].setAttribute("onclick", `removeSound(${assets.sprites[currentSprite].soundList.length})`)
        newEl.children[1].children[0].src = url
        newEl.children[2].innerText = sound.name + "." + sound.hash.split(".").pop()
        document.getElementById("sound-list").appendChild(newEl)
    }
}

function isAssetUsed(id) {
    for (let sprite of spriteList) {
        let costumeHashes = assets.sprites[sprite].costumeList.map(asset => asset.hash)
        let soundHashes = assets.sprites[sprite].soundList.map(asset => asset.hash)
        if (costumeHashes.includes(id) || soundHashes.includes(id)) {
            return true
        }
    }
    return false
}

async function saveEditorStateToFile() {
    let zip = new JSZip()

    for (let key of Object.keys(assets.list)) {
        if (isAssetUsed(key)) {
            zip.file("assets/" + key, assets.list[key])
        }
    }


    zip.file("data.json", JSON.stringify({
        name: projectName,
        sprites: spriteList.slice(1)
    }, null, 4))
    
    for (let sprite of spriteList) {
        let newFile = {
            costumeList: [],
            soundList: []
        }
        for (let costume of assets.sprites[sprite].costumeList) {
            newFile.costumeList.push({
                name: costume.name,
                hash: costume.hash
            })
        }
        for (let sound of assets.sprites[sprite].soundList) {
            newFile.soundList.push({
                name: sound.name,
                hash: sound.hash
            })
        }
        zip.file("sprites/" + sprite + ".json", JSON.stringify(newFile, null, 4))
        zip.file("sprites/" + sprite + "_code.txt", codeList[sprite])
    }
    
    let blob = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: {
            level: 9
        }
    })
    return blob
}

function newSprite() {
    let name = prompt("What is this sprite's name?")
    let invalidNames = ["stage", "_myself_", "_random_", "_edge_", "_stage_"]
    let valid = false
    if (name) {
        while (!valid) {
            valid = true
            if (invalidNames.includes(name.toLowerCase())) {
                valid = false
                alert(`Sprite name cannot equal "${invalidNames[invalidNames.indexOf(name.toLowerCase())]}"`)
            } else if (spriteList.includes(Base64.encode(name))) {
                valid = false
                alert(`There is already a sprite named "${name}"`)
            }
            if (!valid) {
                name = prompt("What is this sprite's name?")
            }
            if (!name) {
                return
            }
        }
        let encodedSpriteName = Base64.encode(name)
        spriteList.push(encodedSpriteName)
        assets.sprites[encodedSpriteName] = {}
        assets.sprites[encodedSpriteName].costumeList = []
        assets.sprites[encodedSpriteName].soundList = []


        let spriteElement = htmlToNode(templates.sprite)
        spriteElement.children[0].addEventListener("click", function() {confirm("Are you sure you want to delete this sprite?") ? removeSprite(encodedSpriteName): null})
        spriteElement.children[1].dataset.spriteName = encodedSpriteName
        spriteElement.children[1].setAttribute("onclick", `loadSprite("${encodedSpriteName}")`)
        spriteElement.children[1].innerText = getSpriteName(encodedSpriteName, true)

        document.getElementById("sprites").appendChild(spriteElement)


        codeList[encodedSpriteName] = ""

        loadSprite(encodedSpriteName)
    } else {
        return
    }
}

window.addEventListener('beforeunload', (event) => {
    event.preventDefault()
})
