import * as fs from "https://deno.land/std@0.167.0/fs/mod.ts";
import * as path from "https://deno.land/std@0.167.0/path/mod.ts";

const PATH = "C:\\Users\\noah\\AppData\\Local\\Temp\\Lightroom";
const TO_PATH = "C:\\Users\\noah\\Pictures\\Photography";

const start = Date.now();

const destination_directories: string[] = [];
for await (const entry of await Deno.readDir(TO_PATH)) {
  if (!entry.isDirectory) {
    continue;
  }

  destination_directories.push(entry.name);
}

let count = 0;
for await (const entry of await Deno.readDir(PATH)) {
  if (!entry.isFile || !entry.name.endsWith(".CR2")) {
    continue;
  }

  const cr2_path = path.join(PATH, entry.name);
  const date = (await Deno.stat(cr2_path)).mtime;

  if (!date) {
    console.log(`Could not find date for ${entry.name}`);
    continue;
  }

  const destination_directory = destination_directories.find((dir) =>
    dir.startsWith(`${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`)
  );

  if (!destination_directory) {
    console.log(`No destination directory found for ${entry.name}`);
    continue;
  }

  const destination_path = path.join(TO_PATH, destination_directory, "Canon Rebel T7", "1. RAW");
  if (!destination_path) {
    console.log(`No destination path found for ${entry.name}`);
    continue;
  }

  // move .xmp file
  const xmp_file = entry.name.replace(".CR2", ".xmp");
  const xmp_path = path.join(PATH, xmp_file);
  const xmp_destination_path = path.join(destination_path, xmp_file);

  if (!(await fs.exists(xmp_path))) {
    console.log(`No .xmp file found for ${entry.name}`);
    continue;
  }

  console.log(`Moving ${xmp_file} to ${xmp_destination_path}`);

  await fs.move(xmp_path, xmp_destination_path, {
    overwrite: true,
  });

  await Deno.remove(cr2_path);

  count++;
}

console.log(`Moved ${count} files in ${Date.now() - start}ms`);
