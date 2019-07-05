// ==UserScript==
// @name         Retrowave download buttons
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Offline dl buttons for songs from site.
// @author       vvwccgz4lh
// @match        https://retrowave.ru/
// @match        http://retrowave.ru/
// @grant        none
// ==/UserScript==

// Notes: For best initialization use 'document-start' script placement in tampermonkey settings

(function() {
  'use strict';

  function addXMLRequestCallback(callback) {
    var oldSend, i;
    if( XMLHttpRequest.callbacks ) {
      // we've already overridden send() so just add the callback
      XMLHttpRequest.callbacks.push( callback );
    } else {
      // create a callback queue
      XMLHttpRequest.callbacks = [callback];
      // store the native send()
      oldSend = XMLHttpRequest.prototype.send;
      // override the native send()
      XMLHttpRequest.prototype.send = function() {
        // call the native send()
        oldSend.apply(this, arguments);

        this.onreadystatechange = function ( progress ) {
          for( i = 0; i < XMLHttpRequest.callbacks.length; i++ ) {
            XMLHttpRequest.callbacks[i]( progress );
          }
        };
      }
    }
  }

  function json(jsonString) {
    return JSON.parse(jsonString);
  }

  function createHtmlElement() {
    var element = document.createElement("div");
    element.setAttribute("class", "display dl-titles-container");
    element.setAttribute("style", "display:flex;flex-direction:column;margin-top:55px;");
    // :first-child { color: rebeccapurple }; :nth-child(2) { color: red }
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

  function fillHtmlElement(container, tracks) {
    //console.log(container, tracks, window.songTitleContainerData.previouslyReceivedTracks == tracks);
    if (JSON.stringify(tracks) == JSON.stringify(window.songTitleContainerData.previouslyReceivedTracks)) {
      return;
    }
    window.songTitleContainerData.previouslyReceivedTracks = tracks;
    tracks.forEach(track => container.prepend(createTrackDlButton(track)));
    // Truncate to first three elements
    while (container.childNodes.length > 3) {
      container.removeChild(container.childNodes[3]);
    }
  }

  function parseResponse(responseText, songContainer, trackListConsumerFn) {
    var parsed = json(responseText);
    if (parsed.status != 200) {
      return
    }
    if (parsed.body != null && Array.isArray(parsed.body.tracks)) {
      trackListConsumerFn(songContainer, parsed.body.tracks)
    }
  }

  window.songTitleContainerData = {
    container: null,
    previouslyReceivedTracks: null
  };

  addXMLRequestCallback( function( progress ) {
    if (!window.songTitleContainerData.container) {
      window.songTitleContainerData.container = createHtmlElement();
    }
    if (typeof progress.srcElement.responseText != 'undefined' && progress.srcElement.responseText != '') {
      parseResponse(progress.srcElement.responseText, window.songTitleContainerData.container, fillHtmlElement)
    }
  });
})();
