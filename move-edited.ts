import * as fs from "https://deno.land/std@0.167.0/fs/mod.ts";
import * as path from "https://deno.land/std@0.167.0/path/mod.ts";
import {PATH} from "./constants.ts";

export default async function moveEdited() {
  console.log("Moving edited files...");
  const start = Date.now();

  let count = 0;
  for await (const entry of await Deno.readDir(PATH)) {
    if (!entry.isDirectory) {
      continue;
    }

    const entry_path = path.join(PATH, entry.name);

    // find all RAW directories
    const paths: string[] = [];
    for await (const entry2 of await Deno.readDir(entry_path)) {
      if (!entry2.isDirectory) {
        continue;
      }

      const entry2_path = path.join(entry_path, entry2.name);

      for await (const entry3 of await Deno.readDir(entry2_path)) {
        if (!entry3.isDirectory) {
          continue;
        }

        if (entry3.name === "1. RAW") {
          paths.push(path.join(entry2_path, entry3.name));
        }
      }
    }

    for (const src_path of paths) {
      const dest_path = src_path.replace("1. RAW", "3. Edited");

      if (!(await fs.exists(src_path))) {
        // console.log(`No source path found for ${entry.name}`);
        continue;
      } else if (!(await fs.exists(dest_path))) {
        console.log(`No destination path found for ${entry.name}`);
        continue;
      }

      for await (const file of await Deno.readDir(src_path)) {
        if (!file.isFile || !file.name.endsWith(".jpeg")) {
          continue;
        }

        const src_file_path = path.join(src_path, file.name);
        const dest_file_path = path.join(dest_path, file.name.replace(".jpeg", ".jpg"));

        console.log(`Moving ${file.name} to ${dest_file_path}`);

        await fs.move(src_file_path, dest_file_path, {
          overwrite: true,
        });

        count++;
      }
    }
  }

  console.log(`Moved ${count} files in ${Date.now() - start}ms`);
}
