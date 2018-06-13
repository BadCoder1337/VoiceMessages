//META{"name":"VoiceMessages"}*//

/* global $, PluginUtilities, PluginTooltip, ReactUtilities, InternalUtilities, PluginContextMenu, PluginSettings, Element */

class VoiceMessages {
  constructor() {
    this.downloadJSON("https://rawgit.com/badcoder1337/VoiceMessages/master/VoiceMessages.locales.json").then((json) => {
      this.strings = json;
    })
  }

  get local() {
    if (this.strings)
      return this.strings[document.documentElement.getAttribute('lang').split('-')[0]] || this.strings.en;
    else
      return {};
  }

  getName() {
    return "VoiceMessages";
  }
  getDescription() {
    return this.local.description
  }
  getVersion() {
    return "1.0.1";
  }
  getAuthor() {
    return "BadCoder1337";
  }
  unload() {
    this.deleteEverything();
  }
  stop() {
    this.deleteEverything();
  }
  load() {}

  async start() {
    this.inject('link', {
      type: 'text/css',
      id: 'voice-messages-css',
      rel: 'stylesheet',
      href: 'https://rawgit.com/badcoder1337/VoiceMessages/master/VoiceMessages.styles.css?p=12345'
    });

    this.inject('script', {
      type: 'text/javascript',
      id: 'recorder',
      src: 'https://rawgit.com/BadCoder1337/VoiceMessages/master/recorderjs/recorder.js'
    });

    this.inject('script', {
      type: 'text/javascript',
      id: 'recorderWorker',
      src: 'https://rawgit.com/BadCoder1337/VoiceMessages/master/recorderjs/recorderWorker.js'
    });

    var libraryScript = null;
    if (typeof BDFDB !== "object" || typeof BDFDB.isLibraryOutdated !== "function" || BDFDB.isLibraryOutdated()) {
      libraryScript = document.querySelector('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js"]');
      if (libraryScript) libraryScript.remove();
      libraryScript = this.inject('script', {
        type: 'text/javascript',
        src: 'https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js'
      })
    }
    this.startTimeout = setTimeout(() => {
      this.initialize();
    }, 10000);
    if (typeof BDFDB === "object" && typeof BDFDB.isLibraryOutdated === "function") this.initialize();
    else libraryScript.addEventListener("load", () => {
      this.initialize();
    });
  }

  initialize() {
    this.MessageParser     = InternalUtilities.WebpackModules.findByUniqueProperties(["createBotMessage"]);
    this.MessageQueue      = InternalUtilities.WebpackModules.findByUniqueProperties(["enqueue"]);
    this.MessageController = InternalUtilities.WebpackModules.findByUniqueProperties(["sendClydeError"]);
    if (typeof BDFDB === "object") {
      window.BDFDB = BDFDB
      console.log("VoiceMessages started");
      document.querySelectorAll(BDFDB.dotCNS.chat + "form textarea").forEach(textarea => {
        this.addVoiceMessageButton(textarea);
      });
    } else {
      console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
    }
  }

  addVoiceMessageButton(textarea) {
    if (!textarea) return;
    var textareaWrap = textarea.parentElement;
    if (textareaWrap && !textareaWrap.classList.contains(BDFDB.disCN.textareainnerdisabled) && !textareaWrap.querySelector(".voice-message-button")) {
      // var textareaInstance = BDFDB.getOwnerInstance({
      //   "node": textarea,
      //   "props": ["handlePaste", "saveCurrentText"],
      //   "up": true
      // });
      // if (textareaInstance && textareaInstance.props && textareaInstance.props.type) {
        var button = $(`<div class="voice-message-button"></div>`).css('background-image', 'url(/assets/4bc527c257233fc69b94342d77bcb9ee.svg)').css('right', 46+BDFDB.isPluginEnabled("GoogleTranslateOption")*30+'px')[0];
        $(button).appendTo(textareaWrap)
          .on("click." + this.getName(), () => {

            let channel = ReactUtilities.getOwnerInstance($("form")[0]).props.channel
            
            this.recording = !this.recording;
            $(button).toggleClass("active", this.recording);
            if (!this.recording) {return}
            //let message = this.MessageParser.createMessage(channel.id, `*${new Date()}*`);
            console.log(this.MessageController.sendMessage(channel.id, {
              content: `*${new Date()}*`
            }));
            // this.MessageQueue.enqueue({
            //   type: "send",
            //   message: {
            //     channelId: channel.id,
            //     nonce: message.id
            //   }
            // });
          });
        //   .on("click." + this.getName(), () => {
        //     //this.openTranslatePopout(button);
        //     console.log("Pressed!");
        //   })
        var sendButtonEnabled = BDFDB.isPluginEnabled("SendButton");
        if (sendButtonEnabled) button.style.marginRight = "40px";
        textareaWrap.style.paddingRight = sendButtonEnabled ? "110px" : "70px";
      // }
    }
  }

  onSwitch() {
    if (typeof BDFDB === "object") {
      document.querySelectorAll(BDFDB.dotCNS.chat + "form textarea").forEach(textarea => {
        this.addVoiceMessageButton(textarea);
      });
    }
  }

  inject(name, options) {
    let element = document.getElementById(options.id);
    if (element) element.parentElement.removeChild(element);
    element = document.createElement(name);
    for (let attr in options)
      element.setAttribute(attr, options[attr]);
    document.head.appendChild(element);
    return element;
  }

  downloadJSON(url) {
    return new Promise((resolve, reject) => {
      require("request")(url, (err, resp, body) => {
        if (err) reject(err);
        try {
          resolve(JSON.parse(body));
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  deleteEverything() {
    if (typeof BDFDB === "object") {
      document.querySelectorAll(".voice-message-button").forEach(button => {button.remove();});
      document.querySelectorAll(BDFDB.dotCNS.chat + "form textarea").forEach(textarea => {textarea.parentElement.style.paddingRight = "0px";});
    }
  }
}