import * as fs from "https://deno.land/std@0.167.0/fs/mod.ts";
import * as path from "https://deno.land/std@0.167.0/path/mod.ts";

const PATH = "C:\\Users\\noah\\Pictures\\Photography";

const start = Date.now();

let count = 0;
for await (const entry of await Deno.readDir(PATH)) {
  if (!entry.isDirectory) {
    continue;
  }

  const src_path = path.join(PATH, entry.name, "Canon Rebel T7", "1. RAW");
  const dest_path = path.join(PATH, entry.name, "Canon Rebel T7", "3. Edited");

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

console.log(`Moved ${count} files in ${Date.now() - start}ms`);
