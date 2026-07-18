// ==UserScript==
// @name         RoyalPrincessAliceOriginPicture
// @namespace    https://github.com/Rinco0212/RoyalPrincessAliceOriginPicture-Tampermonkey-
// @version      2.5
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
    //inject the script ui
    const tkScriptStyles=".tk-mini-component {position: fixed;top: 100px;right: 50px;display: flex;align-items: center;background: #ffffff;padding: 10px 15px;border-radius: 5px;box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);max-width: 220px;width: 100%;}.tk-counter-bar {text-align: center;width: 65px;white-space: nowrap;overflow: hidden;text-overflow: ellipsis; font-size: 14px;font-weight: 600;color: #333;margin: 0 10px 0 10px;}.tk-script-btn {background: none;border: none;cursor: pointer;padding: 8px;border-radius: 50%;display: flex;align-items: center;justify-content: center;transition: background-color 0.3s ease, transform 0.1s ease;}.tk-script-btn:hover {background-color: #f0f0f0;}.tk-script-btn svg {width: 20px;height: 20px;}.tk-running-spinner {display: none; width: 12px;height: 12px;margin: 2px;border: 2px solid rgba(255, 255, 255, 0.4);border-top-color: #000000;border-radius: 50%;animation: tk-running-spin 0.8s linear infinite;}@keyframes tk-running-spin {to { transform: rotate(360deg); }}";
    const tkScriptHtml='<div class="tk-mini-component"><div class="tk-counter-bar"><span id="tkCouNum">999</span><span> / </span><span id="tkCurNum">999</span></div><div style="display:flex;"><button class="tk-script-btn" title="Start" id="tkStartScriptBtn"><svg id="tkStartIcon" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg><div class="tk-running-spinner" id="tkRunningIcon"></div></button><button class="tk-script-btn" id="tkRestartScriptBtn" title="Rstart"><svg viewBox="0 0 24 24"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg></button><button class="tk-script-btn" id="tkStopScriptBtn" title="Stop"><svg viewBox="0 0 24 24"><path d="M5 5h14v14H5z"/></svg></button></div></div>';
    let tkScriptStyleSheet = document.createElement('style');
    tkScriptStyleSheet.type = 'text/css';
    tkScriptStyleSheet.innerHTML = tkScriptStyles;
    document.head.appendChild(tkScriptStyleSheet);
    document.body.innerHTML += tkScriptHtml;
    //get the ui element
    const startBtn = document.getElementById('tkStartScriptBtn');
    const iconStart = document.getElementById('tkStartIcon');
    const iconRunning = document.getElementById('tkRunningIcon');
    const numSpan = document.getElementById('tkCouNum');
    const curSpan = document.getElementById('tkCurNum');
    const restartBtn = document.getElementById('tkRestartScriptBtn');
    const stopBtn = document.getElementById('tkStopScriptBtn');
    //get the webpage img element
    const images = document.querySelectorAll("img");
    let isRunning = false;
    let isStop = false;
    let errorArray = new Array();
    //transform the img src to high quality img src
    if(images.length>0){
        numSpan.innerText = images.length;
        curSpan.innerText = 0;
    }else{
        numSpan.innerText = 'NaN';
        curSpan.innerText = 0;
    }
    //ui control function
    function transformSrc(imgsrc){
        let dotpos = imgsrc.lastIndexOf(".");
        let imgtpye = imgsrc.slice(dotpos)
        let result = "";
        switch(imgtpye){
            case ".jpg":
                result = imgsrc.replace(/-{1}[0-9]{2,}x{1}[0-9]{2,}.jpg$/g,".jpg");
                break;
            case ".jpeg":
                result = imgsrc.replace(/-{1}[0-9]{2,}x{1}[0-9]{2,}.jpeg$/g,".jpeg");
                break;
        }
        return result;
    }
    function iconStop(){
        iconStart.style.display = 'block';
        iconRunning.style.display = 'none';
    }
    function showCur(num){
        curSpan.innerText = num;
    }
    function showNum(num){
        numSpan.innerText = num;
    }
    function loadImgXhr(image,url){
            return new Promise((resolve,reject)=>{
                const xhr = new XMLHttpRequest();
                xhr.open('GET',url,true);
                xhr.responseType = 'blob';
                xhr.onload = function(){
                    if(xhr.status == 200){
                        console.log(xhr.response);
                        let locUrl = URL.createObjectURL(xhr.response);
                        image.src = locUrl;
                        resolve(locUrl);
                    }else{
                        reject(new Error('load image failed: ' + url));
                    }
                }
                xhr.onerror = function(err){
                    reject(err);
                }
                xhr.send();
            });
        }
    async function loadImageAsync(image,url) {
        return new Promise((resolve, reject) => {
            image.onload = () => resolve(url);
            image.onerror = () => reject(new Error('load image failed: ' + url));
            image.src = url;
            image.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
        });
    }
    async function loadImage(image,eroPush,index){
        let url = transformSrc(image.src);
        if(url.length>0){
            await loadImageAsync(image,url)
            .then(img => {
                console.log('load image compelet:'+url);
            })
            .catch(error => {
                eroPush.push(index);
                console.error(error);
            });
        }else{
            console.log('load image skip:'+image.src);
        }
    }
    async function loadStart(images){
        let index = 0;
        let errorLst = new Array();
        while(images.length>index){
            if(isStop){
                errorLst.push(index*-1);
                break;
            }
            await loadImage(images[index],errorLst,index);
            index++;
            showCur(index);
        }
        errorArray = errorLst;
        iconStop();
        isStop =  false;
        isRunning = false;
        console.log('script processing done.');
    }
    function toggleStart() {
        if (!isRunning&&images.length>0){
            iconStart.style.display = 'none';
            iconRunning.style.display = 'block';
            isRunning = true;
            isStop = false;
            loadStart(images);
        }
    }
    async function loadRetry(images){
        let index = 1;
        let errorLst = new Array();
        if(errorArray[errorArray.length-1]<0){
            index = errorArray.pop()*-1;
            console.log('continue load in:'+index);
            while(images.length>index){
                if(isStop){
                    errorLst.push(index*-1);
                    break;
                }
                await loadImage(images[index],errorArray,index);
                index++;
                showCur(index);
            }
        }
        if(errorArray.length>0&&!isStop){
            console.log('retry load image');
            showNum(errorArray.length);
            for(let j =0;j<errorArray.length;j++){
                let label = errorArray[j];
                if(isStop){
                    let last = errorArray.slice(j,errorArray.length);
                    errorLst.concat(last);
                    errorLst.reverse();
                    break;
                }
                await loadImage(images[label],errorLst,label);
                showCur(j+1);
            }
        }
        errorArray = errorLst;
        showNum(images.length);
        showCur(images.length);
        iconStop();
        isStop = false;
        isRunning = false;
        console.log('retry processing done.');
    }
    function toggleRetry() {
         if (!isRunning&&errorArray.length>0){
            iconStart.style.display = 'none';
            iconRunning.style.display = 'block';
            isRunning = true;
            isStop = false;
            loadRetry(images);
         }
    }
    function toggleStop() {
        isStop = true;
        console.log('script will stop at later;');
    }
    // ui listener binding
    startBtn.addEventListener('click', toggleStart);
    restartBtn.addEventListener('click', toggleRetry);
    stopBtn.addEventListener('click', toggleStop);
    console.log("script initialization done.");
    console.log(errorArray);
})();