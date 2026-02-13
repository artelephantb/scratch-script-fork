function getVariables() {
    let v = {};
    for (let key of Object.keys(variables)) {
        if (spriteBeingCompiled != "stage") {
            if (!variables[key].global) {
                v[variables[key].id] = [key, 0];
            }
        } else {
            v[variables[key].id] = [key, 0];
        }
    }
    return v;
}

function getLists() {
    let v = {};
    for (let key of Object.keys(lists)) {
        if (spriteBeingCompiled != "stage") {
            if (!lists[key].global) {
                v[lists[key].id] = [key, []];
            }
        } else {
            v[lists[key].id] = [key, []];
        }
    }
    return v;
}

function getBroadcasts() {
    let v = {};
    for (let key of Object.keys(broadcasts)) {
        v[broadcasts[key].id] = key;
    }
    return v;
}

function getCostumes(sprite) {
    // Example:
    //   name: "costume1",
    //   bitmapResolution: 1,
    //   dataFormat: "svg",
    //   assetId: "bcf454acf82e4504149f7ffe07081dbc",
    //   md5ext: "bcf454acf82e4504149f7ffe07081dbc.svg",
    //   rotationCenterX: 48,
    //   rotationCenterY: 50,

    let createdCostumeList = [];
    for (let costume of assets.sprites[sprite].costumeList) {
        let newCostume = {
            name: costume.name,
            bitmapResolution: 1,
            dataFormat: costume.hash.split(".").pop(),
            assetId: costume.hash.split(".")[0],
            md5ext: costume.hash,
            rotationCenterX: Math.round(costume.width / 2),
            rotationCenterY: Math.round(costume.height / 2),
        };
        createdCostumeList.push(newCostume);
    }
    return createdCostumeList;
}

function getSounds(sprite) {
    // Example
    //   name: "Meow",
    //   assetId: "83c36d806dc92327b9e7049a565c6bff",
    //   dataFormat: "wav",
    //   format: "",
    //   rate: 48000,
    //   sampleCount: 40682,
    //   md5ext: "83c36d806dc92327b9e7049a565c6bff.wav",

    let createdSoundList = [];
    for (let sound of assets.sprites[sprite].soundList) {
        let newSound = {
            name: sound.name,
            dataFormat: sound.hash.split(".").pop(),
            assetId: sound.hash.split(".")[0],
            md5ext: sound.hash,
        };
        createdSoundList.push(newSound);
    }
    return createdSoundList;
}

function compileError(err) {
    throw { name: "CompileError", message: `CompileError on line ${lineNum} in sprite ${getSpriteName(spriteBeingCompiled, true)} — ${err}` };
}

function clearVariablesAndLists(keepGlobal) {
    if (keepGlobal) {
        for (key of Object.keys(variables)) {
            if (!variables[key].global) {
                delete variables[key];
            }
        }
        for (key of Object.keys(lists)) {
            if (!lists[key].global) {
                delete lists[key];
            }
        }
    } else {
        variables = {};
        lists = {};
    }
}

function compileCallExpression(funcName, parameters) {
    let blockMapData = blockData[funcName];
    if (!blockMapData) compileError(`There is no function called '${funcName}'`);

    let blockMapInputs = blockMapData.inputs;
    let inputs = {}
    for (let [index, argument] of parameters) {
        let argumentType
        switch (typeof(argument.value)) {
            case "string":
                argumentType = 10
                break;
            case "number":
                argumentType = 4
                break;
            default:
                compileError(`Invalid argument: '${argument.value}'`)
        }

        inputs[blockMapInputs[index]] = [
            1,
            [
                argumentType,
                argument.value.toString()
            ]
        ];
    }

    let block = {
        opcode: blockMapData.opcode,
        next: null,
        parent: null,
        inputs: inputs,
        fields: {},
        shadow: false,
        topLevel: true,
        x: 0,
        y: 0
    };

    return block;
}

function compileExpressionStatement(innerExpression) {
    switch (innerExpression.type) {
        case "CallExpression":
            return compileCallExpression(innerExpression.callee.name, innerExpression.arguments.entries());
        default:
            console.log(innerExpression.type);
    }
}

function compileFunctionDeclaration(topExpression) {
    if (!blockData[topExpression.id.name]) {
        console.log("Custom block found");
        return [];
    }

    let body = [];
    console.log(topExpression)

    body.push(compileCallExpression(topExpression.id.name, topExpression.params.entries()));

    topExpression.body.body.forEach(expression => {
        switch (expression.type) {
            case "ExpressionStatement":
                body.push(compileExpressionStatement(expression.expression));
            default:
                console.log(expression.type);
        }
    });

    return body;
}

function compileBlock(expression) {
    switch (expression.type) {
        case "ExpressionStatement":
            return compileExpressionStatement(expression.expression);
        case "FunctionDeclaration":
            return compileFunctionDeclaration(expression);
        default:
            console.log(expression);
    }
}

function compileSprite(sprite) {
    spriteBeingCompiled = sprite;
    blockList = {}

    let spriteCode = codeList[sprite];

    blockY = 0;
    firstBlockInScript = true;
    scriptBlockCount = 0;

    clearVariablesAndLists(true);

    let parsedCode = acorn.parse(spriteCode, { ecmaVersion: 2020 });
    let parsedCodeBody = parsedCode.body;

    parsedCodeBody.forEach(block => {
        let compiledBlocks = compileBlock(block);
        if (compiledBlocks.constructor.name == "Object") compiledBlocks = [compiledBlocks];

        compiledBlocks.forEach(block => {
            let blockID = Math.round(Math.random() * 1e15).toString();
            blockList[blockID] = block;
        });
    });

    console.log(blockList);

    blockID += 2;
    let newSprite = {
        isStage: false,
        name: sprite == "stage" ? "Stage" : Base64.decode(sprite),
        variables: getVariables(),
        lists: getLists(),
        blocks: blockList,
        comments: {},
        currentCostume: 0,
        broadcasts: {},
        costumes: getCostumes(sprite),
        sounds: getSounds(sprite),
        volume: 100,
        visible: true,
        x: 0,
        y: 0,
        size: 100,
        direction: 90,
        draggable: false,
        rotationStyle: "left-right",
    };

    if (sprite == "stage") {
        // newSprite.broadcasts = getBroadcasts()
        (newSprite.tempo = 60), (newSprite.videoTransparency = 50), (newSprite.videoState = "on"), (newSprite.textToSpeechLanguage = null);
        newSprite.isStage = true;
        // newSprite.layerOrder = 0;
        // delete newSprite.layerOrder
        delete newSprite.x;
        delete newSprite.y;
    }
    return newSprite;
}

let spriteBeingCompiled;

async function compile() {
    let compiled;
    try {
        blockID = 0;
        broadcasts = {};
        clearVariablesAndLists();
        compiled = {
            targets: [],
            monitors: [],
            extensions: [],
            meta: {
                semver: "3.0.0",
                vm: "0.2.0",
                agent: "",
                platform: {
                    name: "ScratchScript",
                    url: "https://scratchscript.quuq.dev/",
                },
            },
        };
        spriteBeingCompiled = null;
        for (let sprite of spriteList) {
            compiled.targets.push(compileSprite(sprite));
        }
        compiled.targets[0].broadcasts = getBroadcasts(); // Add broadcasts to the stage
        console.log(compiled);
        console.log(JSON.stringify(compiled, null, 4));
    } catch (e) {
        if (!e.message.startsWith("CompileError")) {
            showErrorMessage("An unexpected error was encountered while compiling", e.message);
        } else {
            showErrorMessage("An error occurred", e.message);
        }
        return null;
    }

    let zip = new JSZip();
    zip.file("project.json", JSON.stringify(compiled, null, 4));

    for (let assetID of Object.keys(assets.list)) {
        if (isAssetUsed(assetID)) {
            zip.file(assetID, assets.list[assetID]);
        }
    }

    let blob = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: {
            level: 9,
        },
    });

    console.log("blob", blob);
    console.time("arraybuffer");

    let a = await blob.arrayBuffer();

    console.timeEnd("arraybuffer");
    window.output10 = a;

    return a;
}

async function run() {
    saveCurrentSpriteCode();
    let project = await compile();
    // let r = await fetch("https://tmpfiles.org/api/v1/upload", {
    //     method: "POST",
    //     body: JSON.stringify({file: "test"})
    // })
    // document.getElementById("preview").src = "";

    // const form = new FormData();
    // form.append("file", new File([project], "CoolTestProject.sb3"));

    // let r = await fetch("https://tmpfiles.org/api/v1/upload", {
    //     method: "POST",
    //     body: form,
    // });

    // let response = await r.json();
    // if (response.data.url) {
    //     let u = new URL(response.data.url);
    //     let url = u.origin + "/dl" + u.pathname;
    //     console.log(url);
    //     document.getElementById("preview").src = `https://turbowarp.org/embed?project_url=${encodeURIComponent(`https://corsproxy.josueart40.workers.dev/?${url}`)}&autoplay&settings-button&addons=pause,remove-curved-stage-border,clones`;
    // } else {
    //     console.log(response);
    // }
    document.getElementById("preview").hidden = false;
    document.getElementById("sprite-container").style.marginTop = "0px";
    if (project) {
        await loadProject(project);
        startProject();
    }
}
