import moveLightroomExports from "./move-lightroom-exports.ts";
import moveEdited from "./move-edited.ts";
import importFiles from "./import.ts";

switch (Deno.args[0]) {
  case "lightroom":
    await moveLightroomExports();
    break;
  case "edited":
    await moveEdited();
    break;
  case "import":
    await importFiles();
    break;
  case "help":
  case "-h":
  case "--help":
    console.log("Usage: deno run --allow-read --allow-write --allow-env app.ts [lightroom|edited|import|help]");
    console.log("  lightroom: Move Lightroom exports to the correct folders");
    console.log("  edited: Move edited files to the correct folders");
    console.log("  import: Import files from SD card to main drive");
    console.log("  help: Show this help message");
    console.log("  (no argument): Runs all commands");
    break;
  default:
    await moveLightroomExports();
    await moveEdited();
    await importFiles();
    break;
}
