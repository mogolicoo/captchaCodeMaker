// modules
const readline = require("readline");
const fetchPromise = import('node-fetch').then(mod => mod.default);
const fetch = (...args) => fetchPromise.then(fetch => fetch(...args));

// stuff
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// functions
function randomStr(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * 
        charactersLength));
    }
    return result;
}

async function generateRandomUser() {
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

async function getxcsrf() {
    let resp = await fetch("https://auth.roblox.com/v2/login",{method: "POST"})
    return resp.headers.get("x-csrf-token")
}

// console shit
rl.question("Put your captcha token here: ", function (captchaToken) {
    rl.question("Put your captcha id here: ", async function (captchaId) {
        let xcsrf = await getxcsrf();
        let name = await generateRandomUser();
        let pass = randomStr(15);
        let data = {
            username: name, 
            password: pass,
            birthday: "04 Nov 1936",
            gender: 2,
            isTosAgreementBoxChecked: true,
            context: "MultiverseSignupForm",
            referralData: null,
            displayAvatarV2: false,
            displayContextV2: false,
            captchaId: Buffer.from(captchaId.toString('utf8'), 'base64').toString('ascii'),
            captchaToken: Buffer.from(captchaToken.toString('utf8'), 'base64').toString('ascii'),
            captchaProvider: "PROVIDER_ARKOSE_LABS"
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
        })
        let headers = response.headers;
        response = await response.json();
        if (!response["userId"]) {
            // debug
            // console.log(response)
            console.log("Failed to create")
            rl.close();
            return;
        }
        let cookie = headers.get("set-cookie")
        cookie = cookie.split(";")[6]
        cookie = cookie.substr(24); // deprecated but i'll use it anyways.
        console.log()
        console.log(`Login: ${name}:${pass}`)
        console.log(`\nCookie:\n${cookie}`)
        rl.close();
    })
})

rl.on("close", () => {
    process.exit(0)
})
