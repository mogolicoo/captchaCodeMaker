// i'll use express and node-fetch since it's more easy for me. 
// you can change stuff here if you want, i'm not the best coder lmao
const express = require("express");
// fuck you node-fetch
const fetchPromise = import('node-fetch').then(mod => mod.default);
const fetch = (...args) => fetchPromise.then(fetch => fetch(...args));

// stuff
const app = express();
const port = 8000;

// some functions so we can get more data for the captcha thing
async function getXCSRF() { // this gets a xcsrf token without the need of a roblosecurity cookie
    let resp = await fetch("https://auth.roblox.com/v2/login",{method: "POST"})
    return resp.headers.get("x-csrf-token")
}

function randomStr(length) { // taken from stackoverflow!!!!
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * 
        charactersLength));
    }
    return result;
}

async function generateRandomUser() { // uhhh don't ask why lol
    let newUsername = randomStr(15)
    let info = await fetch(`https://auth.roblox.com/v1/usernames/validate?request.username=${newUsername}&request.birthday=04%20Nov%201936&request.context=Signup`)
    info = await info.json()
    if (info.message == "Username is valid") {
        return newUsername
    } else {
        let anotherTry = await generateRandomUser()
        return anotherTry
    }
}

async function getFieldData() { // this gets the data that the funcaptcha needs so it works
    let xcsrf = await getXCSRF();
    let data = {
        username: await generateRandomUser(), 
        password: "askdaskdaskdsakdksad",
        birthday: "04 Nov 1936",
        gender: 2,
        isTosAgreementBoxChecked: true,
        context: "MultiverseSignupForm",
        referralData: null,
        displayAvatarV2: false,
        displayContextV2: false
    }
    data = JSON.stringify(data);
    let response = await fetch("https://auth.roblox.com/v2/signup", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Referer: "https://www.roblox.com/",
            "x-csrf-token": xcsrf,
            "User-Agent": "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36 OPR/78.0.4093.186",
        },
        body: data
    });
    let fieldData = await response.json();
    if (!fieldData["failureDetails"]) {
        // for some reason the account was created without a captcha ?????
        return undefined
    }
    fieldData = fieldData.failureDetails[0].fieldData;
    return fieldData
}

// app shit
app.get("/", (req, res) => {
    res.sendFile(`${__dirname}/index.html`)
})

app.get("/getFieldData", async (req, res) => {
    let fieldData = await getFieldData();
    if (fieldData == undefined) {
        res.json({error: "uhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh"})
        return
    }
    let captchaId = fieldData.split(",")[0];
    let blobData = fieldData.split(",")[1];
    res.json({captchaId: captchaId, blobData: blobData});
})

app.listen(port, () => {
    console.log(`listening on port ${port}`)
})