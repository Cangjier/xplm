import { args, cmdAsync, script_path, start, startCmd } from "./.tsc/context";
import { Path } from "./.tsc/System/IO/Path";
import { Json } from "./.tsc/TidyHPC/LiteJson/Json";
import { axios } from "./.tsc/Cangjie/TypeSharp/System/axios";
import { zip } from "./.tsc/Cangjie/TypeSharp/System/zip";
import { File } from "./.tsc/System/IO/File";
import { Directory } from "./.tsc/System/IO/Directory";
import { DateTime } from "./.tsc/System/DateTime";
import { Environment } from "./.tsc/System/Environment";
let main = async () => {
    let script_directory = Path.GetDirectoryName(script_path);
    let pluginsDirectory = Path.Combine(script_directory, "Plugins");
    let buildDirectory = Path.Combine(script_directory, "build");
    let manifestPath = Path.Combine(script_directory, "manifest.json");
    let manifest = Json.Load(manifestPath);
    let packages = manifest.packages;
    for (let item of packages) {
        let installDirectory = "";
        if (item.set == "cli") {
            installDirectory = pluginsDirectory;
        }
        else if (item.set == "ui") {
            installDirectory = buildDirectory;
        }
        else {
            throw `unknown set ${item.set}`;
        }
        let itemInstallDirectory = Path.Combine(installDirectory, item.name);
        if (item.get == "download-zip") {
            let itemLockPath = Path.Combine(itemInstallDirectory, ".lock");
            if (File.Exists(itemLockPath) == false) {
                let url = item.url;
                let downloadPath = await axios.download(url);
                await zip.extract(downloadPath, itemInstallDirectory);
                File.WriteAllText(itemLockPath, JSON.stringify({
                    "last_update": DateTime.Now
                }));
            }
        }
        else if (item.get == "git") {
            if (Directory.Exists(itemInstallDirectory) == false) {
                Directory.CreateDirectory(itemInstallDirectory);
                await cmdAsync(itemInstallDirectory, `git clone ${item.url} .`);
            }
            else {
                await cmdAsync(itemInstallDirectory, `git pull`);
            }
        }
    }
    let manifestIndex = manifest.index;
    if (manifestIndex.starter == "browser") {
        let url = manifestIndex.entry;
        start({
            filePath: url,
            useShellExecute: true
        });
    }
    else if (manifestIndex.starter == "cli") {
        startCmd(script_directory, manifestIndex.entry);
    }
};

await main();