function OnSolve() {
    const tokenelement = document.getElementById('FunCaptcha-Token')
    const token = tokenelement.value
    tokenelement.hidden=false
    document.getElementById("text").innerHTML=btoa(token)
    document.getElementById("answer").hidden=false
}

function loadChallenge() {
    document.getElementById("button").hidden=true
    document.getElementById("button2").hidden=false
    document.getElementById("answer").hidden=true
    new FunCaptcha({
        public_key: "A2A14B1D-1AF3-C791-9BBC-EE33CC7A0A6F",
        target_html: "CAPTCHA",
        callback: OnSolve
    });
}
