// ==UserScript==
// @name         Retrowave download buttons
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Offline dl buttons for songs from site.
// @author       vvwccgz4lh
// @match        http://retrowave.ru/
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function json(jsonString) {
        return JSON.parse(jsonString);
    }

    function getCursor() {
        return json(localStorage.getItem("retrowave.player")).cursor;
    }

    function createHtmlElement() {
        var element = document.createElement("div");
        element.setAttribute("class", "display");
        element.setAttribute("style", "display:flex;flex-direction:column;margin-top:55px;");
        var parent = document.querySelector(".theme__container");
        parent.appendChild(element);
        return element;
    }

    function createTrackDlButton(track) {
        var dwnldButton = document.createElement("a");
        dwnldButton.innerHTML = track.title;
        dwnldButton.setAttribute("download", track.title + ".mp3");
        dwnldButton.setAttribute("href", track.streamUrl);
        dwnldButton.setAttribute("class", "display__time__total");
        dwnldButton.setAttribute("style", "align-self:center;width:auto;text-decoration:none;");
        return dwnldButton;
    }

    function fillHtmlElement(parent, tracks) {
        //console.log(parent, tracks);
        parent.innerHTML = '';
        tracks.forEach(track => parent.appendChild(createTrackDlButton(track)));
    }

    function updateCurrentSongs(cursor, htmlElement) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                fillHtmlElement(htmlElement, json(xmlHttp.responseText).body.tracks);
            }
        };
        xmlHttp.open("GET", "http://retrowave.ru/api/v1/tracks" +
                     "?cursor=" + cursor +
                     "&limit=3",
                     true);
        xmlHttp.send(null);
    }

    var buttonElement = createHtmlElement();
    var updateFn = function() {
        updateCurrentSongs(getCursor(), buttonElement);
    };
    window.setInterval(updateFn, 30000);
    window.setTimeout(updateFn, 1000);
})();



