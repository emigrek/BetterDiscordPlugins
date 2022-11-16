/**
 * @name ExtendedSpotifyPresence
 * @description Shows song details in presence status
 * @version 1.0.0
 * @author Emigrek
 * @authorId 214208382888837121
 */
/*@cc_on
@if (@_jscript)
    
    // Offer to self-install for clueless users that try to run this directly.
    var shell = WScript.CreateObject("WScript.Shell");
    var fs = new ActiveXObject("Scripting.FileSystemObject");
    var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\\BetterDiscord\\plugins");
    var pathSelf = WScript.ScriptFullName;
    // Put the user at ease by addressing them in the first person
    shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
    if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
        shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
    } else if (!fs.FolderExists(pathPlugins)) {
        shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
    } else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
        fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
        // Show the user where to put plugins in the future
        shell.Exec("explorer " + pathPlugins);
        shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
    }
    WScript.Quit();

@else@*/

const config = {"info":{"name":"ExtendedSpotifyPresence","authors":[{"name":"emigrek","discord_id":"214208382888837121"}],"version":"1.0.0","description":"Shows song details in presence status"},"main":"index.js"};

class Dummy {
    constructor() {this._config = config;}
    start() {}
    stop() {}
}
 
if (!global.ZeresPluginLibrary) {
    BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
        confirmText: "Download Now",
        cancelText: "Cancel",
        onConfirm: () => {
            require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (error, response, body) => {
                if (error) return require("electron").shell.openExternal("https://betterdiscord.app/Download?id=9");
                await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
            });
        }
    });
}
 
module.exports = !global.ZeresPluginLibrary ? Dummy : (([Plugin, Api]) => {
    const plugin = (Plugin, Library) => {
        const { DiscordModules, WebpackModules, Patcher, PluginUtilities } = Library;
        const { React } = DiscordModules;

        return class SpotifyStatus extends Plugin {
            constructor() {
                super();
            }

            onStart() {            
                PluginUtilities.addStyle("ExtendedSpotifyPresence", `
                    .songName {
                        line-height: 0.65rem;
                        outline: none;
                        margin-left: 0.2rem;
                        animation-name: slide;
                    }
                    .title {
                        font-weight: 600;
                        font-size: 0.75rem;
                    }
                    .songNameContainer:hover > .songName {
                        animation-timing-function: linear;
                        animation-duration: 5s;
                        animation-iteration-count: infinite;
                    }
                    .author {
                        opacity: 80%;
                        font-size: 0.6rem;
                    }
                    .songNameContainer {
                        width: 150px;
                        display: flex;
                        flex-direction: row;
                        align-items: center;
                        item-align: center;
                    }
                    .cover {
                        width: 20px;
                        height: 20px;
                        z-index: 2;
                    }
                    @keyframes slide {
                        from {
                          transform: translateX(100%);
                        }
                        to {
                          transform: translateX(-100%);
                        }
                    }
            `)
                Patcher.after(
                    WebpackModules.find(m => m.toString().includes("concat([null])"), {defaultExport: false}),
                    "Z",
                    (_, [activities, t], res) => {
                        for (const activity of activities) {
                            if (activity.name == "Spotify") {
                                var title = activity.details;
                                var author = activity.state;

                                var coverEl = React.createElement("img", { class: "cover", src: `https://i.scdn.co/image/${activity.assets.large_image.slice(8)}` });
                                var titleEl = React.createElement("div", {class: "title"}, title);
                                var authorEl = React.createElement("div", {class: "author"}, `by ${author}`);    
                                var songNameEl = React.createElement("div", {class: "songName"}, [titleEl, authorEl]);
                                var songNameContainerEl = React.createElement("div", {class: "songNameContainer"}, [coverEl, songNameEl]);

                                res = [];
                                res[0] = songNameContainerEl;
                                
                                return res;
                            }
                        }
                    }
                );
            }

            onStop() {
                Patcher.unpatchAll()
            }
        };
    };
    return plugin(Plugin, Api);
})(global.ZeresPluginLibrary.buildPlugin(config));
/*@end@*/