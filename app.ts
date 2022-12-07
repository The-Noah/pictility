import moveLightroomExports from "./move-lightroom-exports.ts";
import moveEdited from "./move-edited.ts";

switch (Deno.args[0]) {
  case "lightroom":
    await moveLightroomExports();
    break;
  case "edited":
    await moveEdited();
    break;
  default:
    await moveLightroomExports();
    await moveEdited();
    break;
}
