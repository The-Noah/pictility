import moveLightroomExports from "./move-lightroom-exports.ts";
import moveEdited from "./move-edited.ts";

switch (Deno.args[0]) {
  case "lightroom":
    await moveLightroomExports();
    break;
  case "edited":
    await moveEdited();
    break;
  case "help":
    console.log("Usage: deno run --allow-read --allow-write --allow-env app.ts [lightroom|edited]");
    break;
  default:
    await moveLightroomExports();
    await moveEdited();
    break;
}
