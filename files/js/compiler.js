function handleSpecial(lines) {
    // Replaces forever loops with repeat infinity for now
    let code = [];
    for (let line of lines) {
        if (line.trim().startsWith("forever()") && line.trim().endsWith("{")) {
            code.push('repeat("Infinity") {');
        } else {
            code.push(line);
        }
    }
    return code;
}

function getParamsArray(params) {
    // Parses a function string and results the params
    let str = params.slice(1, params.length - 1);
    if (str == "") {
        return [];
    }
    if (str.trim().endsWith(",")) {
        compileError("Unexpected ','");
    }
    let parenLevel = 0;
    let output = [];
    let inString = false;
    let final = "";
    let i = 0;
    while (i < str.length) {
        char = str[i];

        if (!inString) {
            if (char == "(") {
                parenLevel += 1;
            }
            if (char == ")") {
                parenLevel -= 1;
            }
        }
        if (char == "\\") {
            let nextChar = str[i + 1];
            if (nextChar == '"' | nextChar == "'" | nextChar == '\\') {
                i += 1;
                final += nextChar;
            } else {
                compileError("Invalid use of escape character '\\'");
            }
        } else if (char == '"' | char == "'") {
            inString = !inString;
            final += char;
        } else if (parenLevel == 0 && char == "," && !inString) {
            output.push(final);
            final = "";
        } else {
            final += char;
        }

        i += 1;
    }
    output.push(final);

    // console.log(output);
    return output; // Returns a list
}

function parseBlock(str) {
    // Parse block recursively making a nested list of lists
    // Returns a list of terms
    // A term is either a literal value or a function name
    // A term is an Object
    str = str.trim();
    if (str.startsWith('"') | str.startsWith("'")) {
        // String
        return str.slice(1, str.length - 1);
    }
    if (!isNaN(parseFloat(str))) {
        return parseFloat(str);
    }
    if (isNaN(parseFloat(str)) && !(str.startsWith('"') | str.startsWith("'"))) {
        // if (!str.startsWith("$") /* || !str.startsWith("#") */) {
        if (!(str.startsWith("$") || str.startsWith("#") || str == "true" || str == "false")) {
            if (!str.includes("(")) {
                compileError("Missing '('");
            }
            if (!str.includes(")")) {
                compileError("Missing ')'");
            }

            let functionName = str.slice(0, str.indexOf("(")).trim();
            let paramsString = str.slice(str.indexOf("("));
            let paramsStringsArray = getParamsArray(paramsString);
            let paramTermsArray = paramsStringsArray.map((s) => parseBlock(s));

            return [functionName].concat(paramTermsArray);
        } else {
            if (str == "true" || str == "false") {
                return str;
            } else {
                if (str.startsWith("#")) {
                    return listStartThing + str;
                } else {
                    return variableStartThing + str;
                }
            }
        }
        // for (let paramsStr of paramsStringsArray) {

        // }
    }
}

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

const input1 = '"3"';
const output1 = "3";
const input2 = "3.14159";
const output2 = 3.14159;
const input3 = "pickRandom(1, 10)";
const output3 = ["pickRandom", 1, 10];
const input4 = 'sayForSecs(pickRandom(1, pickRandom(5, "10")), 2.5)';

const variableStartThing = "$`!jsf☠d_Why are you looking here_89ISf[$!☠$~$";
const listStartThing = "#`!j☠sf_Why are you looking here?_d7S&pSf]]@$!☠#~#";

let blockID;
// let scriptBlockCount;
let blockY;
let firstBlockInScript;
let blockList;
let variables;
let lists;
let broadcasts;
let lineNum;


const nestingType = {
    REPEAT: "repeat",
    IFTHEN: "ifthen",
    IFTHENELSE: "ifthenelse",
};

// A state is an object with nestingList and currentLine
function compileStatement(state, codeLines) {
    // Modifies the callers state
    let line = codeLines[state.currentLine++];
    lineNum = state.currentLine;
    line = line.trim();
    console.log("line", line);
    if (line.startsWith("//") /*  || line == "" */) {
        return;
    }
    if (line == "") {
        let keys = Object.keys(blockList);
        for (let i = keys.length - 1; i >= 0; i--) {
            let key = keys[i];
            if (blockList[key].next && blockList[key].nestingLevel == 0) {
                blockList[key].next = null; // TO DO: Don't end program prematurely in the case of empty loops
                break;
            }
        }

        firstBlockInScript = true;
        blockY += 90;
        console.log("starting new script on", state.currentLine);
        return;
    }
    if (line == "}") {
        if (state.nestingList.length == 0) {
            compileError("Unexpected '}'");
        }
        let keys = Object.keys(blockList);
        for (let i = keys.length - 1; i >= 0; i--) {
            let key = keys[i];
            if (blockList[key].next && blockList[key].nestingLevel == state.nestingList.length) {
                blockList[key].next = null; // TO DO: Don't end program prematurely in the case of empty loops
                break;
            }
        }
        state.nestingList.pop();
        return;
    }
    if (line.replaceAll(" ", "") == "}else{") {
        let keys = Object.keys(blockList);
        console.log("looking for if", blockList, keys);

        for (let i = keys.length - 1; i >= 0; i--) {
            let key = keys[i];
            if (blockList[key].next && blockList[key].nestingLevel == state.nestingList.length) {
                blockList[key].next = null;
                break;
            }
        }

        let found = false;
        for (let i = keys.length - 1; i >= 0; i--) {
            let key = keys[i];
            if (blockList[key].opcode == "control_if" && blockList[key].nestingLevel == state.nestingList.length - 1) {
                blockList[key].opcode = "control_if_else";
                blockList[key].inputs.SUBSTACK2 = [2, (blockID + 1).toString()];
                found = true;
                break;
            }
        }
        if (!found) {
            compileError("could not find if");
        }
        // state.nestingList.pop();
        return;
    }
    if (line.startsWith("repeat") || line.startsWith("while") || line.startsWith("if (") || line.startsWith("if(") /*  && line.endsWith("{") */) {
        console.log("found repeat/if!");
        let repeatCountExpression = parseBlock(line.slice(0, line.length - 2));
        let repeatID = blockID + 1;
        compileBlock(repeatCountExpression, blockID, state.nestingList.length);
        // blockID++
        blockList[repeatID.toString()].inputs.SUBSTACK = [2, (blockID /*repeatID*/ + 1).toString()]; // To do: deal with empty loop

        let nestingDepth = state.nestingList.length;
        state.nestingList.push(repeatID);
        while (state.nestingList.length > nestingDepth) {
            compileStatement(state, codeLines);
        }
        blockList[repeatID.toString()].next = (blockID + 1).toString();
        // do cool stuff :D ???
    } else {
        // Compile one ordinary block
        let id = blockID + 1; // The ID of the next block to be compiled
        compileBlock(parseBlock(line), blockID, state.nestingList.length); // Changes block ID by however many blocks were compiled
        blockList[id.toString()].next = (blockID + 1).toString();
    }
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

function compileCallExpression(expression) {
    let funcName = expression.callee.name;

    let blockMapData = blockData[funcName];
    if (!blockMapData) compileError(`There is no function called '${funcName}'`);

    let blockMapInputs = blockMapData.inputs;
    let inputs = {}
    for (let [index, argument] of expression.arguments.entries()) {
        let argumentType
        switch (typeof(argument.value)) {
            case 'string':
                argumentType = 10
                break;
            case 'number':
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

function compileFunctionDeclaration(expression) {}

function compileExpressionStatement(expression) {
    switch (expression.type) {
        case "CallExpression":
            return compileCallExpression(expression);
        default:
            console.log(expression.type);
    }
}

function compileBlock(expression) {
    switch (expression.type) {
        case "ExpressionStatement":
            return compileExpressionStatement(expression.expression);
        case "FunctionDeclaration":
            return compileFunctionDeclaration(expression.expression);
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
        let blockID = Math.round(Math.random() * 1e15).toString();
        blockList[blockID] = compileBlock(block);
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
        sounds: getSounds(sprite) /*[
            {
            "name": "Meow",
            "assetId": "83c36d806dc92327b9e7049a565c6bff",
            "dataFormat": "wav",
            "format": "",
            "rate": 48000,
            "sampleCount": 40682,
            "md5ext": "83c36d806dc92327b9e7049a565c6bff.wav"
            }
        ],*/,
        volume: 100,
        // "layerOrder": 2,
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
        // let codeLines = document.querySelector("#editor").value.replaceAll("\r", "").split("\n");
        // let codeLines = codemirror.state.doc.toString().replaceAll("\r", "").split("\n");
        // codeLines = handleSpecial(codeLines); // Handles forever loops
        // let currentLine = 0;
        blockID = 0;
        // blockY = 0;
        // firstBlockInScript = true;
        // scriptBlockCount = 0;
        // blockList = {};
        // variables = {};
        broadcasts = {};
        clearVariablesAndLists();
        // lists = {};
        // lineNum = 0;
        // let state = { currentLine: currentLine, nestingList: [] };

        // while (state.currentLine < codeLines.length) {
        //     compileStatement(state, codeLines);
        // }
        compiled = {
            targets: [],
            monitors: [],
            extensions: [],
            meta: {
                semver: "3.0.0",
                vm: "0.2.0",
                agent: "",
                platform: {
                    name: "TurboWarp",
                    url: "https://turbowarp.org/",
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
    // for (let line of codeLines) {
    //     line = line.trim()
    //     if (line.startsWith("//") || line == "") {
    //         continue
    //     }
    //     let id = blockID + 1; // The ID of the next block to be compiled
    //     compileBlock(parseBlock(line), blockID); // Changes block ID by however many blocks were compiled
    //     blockList[id.toString()].next = (blockID + 1).toString();
    // }
    // console.log(blockList);
    // console.log(variables);

    // let json = `{
    //     "targets": [
    //         {
    //         "isStage": true,
    //         "name": "Stage",
    //         "variables": {},
    //         "lists": {},
    //         "broadcasts": ${JSON.stringify(getBroadcasts(), null, 4)},
    //         "blocks": {},
    //         "comments": {},
    //         "currentCostume": 0,
    //         "costumes": [
    //             {
    //             "name": "backdrop1",
    //             "dataFormat": "svg",
    //             "assetId": "cd21514d0531fdffb22204e0ec5ed84a",
    //             "md5ext": "cd21514d0531fdffb22204e0ec5ed84a.svg",
    //             "rotationCenterX": 240,
    //             "rotationCenterY": 180
    //             }
    //         ],
    //         "sounds": [],
    //         "volume": 100,
    //         "layerOrder": 0,
    //         "tempo": 60,
    //         "videoTransparency": 50,
    //         "videoState": "on",
    //         "textToSpeechLanguage": null
    //         },
    //         {
    //         "isStage": false,
    //         "name": "Sprite1",
    //         "variables": ${JSON.stringify(getVariables(), null, 4)},
    //         "lists": ${JSON.stringify(getLists(), null, 4)},
    //         "broadcasts": {},
    //         "blocks": ${JSON.stringify(blockList, null, 4)},
    //         "comments": {},
    //         "currentCostume": 0,
    //         "costumes": ${JSON.stringify(getCostumes(), null, 4)},
    //         "sounds": [
    //             {
    //             "name": "Meow",
    //             "assetId": "83c36d806dc92327b9e7049a565c6bff",
    //             "dataFormat": "wav",
    //             "format": "",
    //             "rate": 48000,
    //             "sampleCount": 40682,
    //             "md5ext": "83c36d806dc92327b9e7049a565c6bff.wav"
    //             }
    //         ],
    //         "volume": 100,
    //         "layerOrder": 2,
    //         "visible": true,
    //         "x": 0,
    //         "y": 0,
    //         "size": 100,
    //         "direction": 90,
    //         "draggable": false,
    //         "rotationStyle": "all around"
    //         }
    //     ],
    //     "monitors": [],
    //     "extensions": [],
    //     "meta": {
    //         "semver": "3.0.0",
    //         "vm": "0.2.0",
    //         "agent": "",
    //         "platform": {
    //             "name": "TurboWarp",
    //             "url": "https://turbowarp.org/"
    //         }
    //     }
    // }`;
    // console.log(json)
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
    // a = blob
    window.output10 = a;
    return a;
    // saveAs(blob, "hello.zip");
    // return json;
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
