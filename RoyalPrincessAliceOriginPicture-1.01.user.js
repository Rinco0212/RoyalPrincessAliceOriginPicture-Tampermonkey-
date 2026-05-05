// ==UserScript==
// @name         RoyalPrincessAliceOriginPicture
// @namespace    https://github.com/Rinco0212/RoyalPrincessAliceOriginPicture-Tampermonkey-
// @version      1.01
// @description  Replace the low-resolution display image src link of the RoyalPrincessAlice online shop with the original image src link
// @author       Rinco
// @match        https://royalprincessalice.net/*
// @icon         https://github.com/Rinco0212/RoyalPrincessAliceOriginPicture-Tampermonkey-/blob/main/icon01.jpg?raw=true
// @grant        none
// ==/UserScript==
(function() {
    'use strict';
    //debugger;
    // Your code here...
    const images = document.querySelectorAll("img");
    images.forEach(img => {
        let imgsrc = img.src;
        let result = imgsrc.replace(/-{1}[0-9]{2,}x{1}[0-9]{2,}.jpg$/g,".jpg");
        img.src = result;
        //console.log(imgsrc); // output the image src value
        //console.log(result); // output the result value
    });
    console.log("Picture src replace script done.");
})();