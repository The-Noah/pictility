import * as fs from "https://deno.land/std@0.167.0/fs/mod.ts";
import * as path from "https://deno.land/std@0.167.0/path/mod.ts";
import * as winStorage from "https://deno.land/x/win@0.2.0/api/Storage/mod.ts";
import {PATH} from "./constants.ts";
import exif from "./exif.ts";

export default async function importFiles() {
  console.log("Importing files...");
  const start = Date.now();

  const buffer = new Uint8Array(1024);
  winStorage.FileSystem.GetLogicalDriveStringsW(1024, buffer);
  const DRIVES = new Set(
    String.fromCharCode(...buffer)
      .split("\0")
      .filter(Boolean)
      .filter((drive) => drive.charCodeAt(0) >= 65 && drive.charCodeAt(0) <= 90)
      .filter((drive) => drive !== "C")
  );

  const destination_directories: string[] = [];
  for await (const entry of await Deno.readDir(PATH)) {
    if (!entry.isDirectory) {
      continue;
    }

    destination_directories.push(entry.name);
  }

  let count = 0;
  for (const drive of DRIVES) {
    const drive_path = path.join(`${drive}:`, "DCIM");

    if (!(await fs.exists(drive_path))) {
      continue;
    }

    for await (const entry of await fs.walk(drive_path)) {
      if (!entry.isFile) {
        continue;
      }

      const file_extension = path.extname(entry.path).toUpperCase();

      if (file_extension === ".MOV") {
        const date = (await Deno.stat(entry.path)).mtime;

        if (!date) {
          console.log(`Failed to get date for ${entry.name}`);
          continue;
        }

        const destination = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
        const destination_directory = path.join(PATH, destination_directories.find((dir) => dir.startsWith(destination)) ?? destination, "Video");

        // create directory structure
        await fs.ensureDir(destination_directory);

        const destination_path = path.join(destination_directory, path.basename(entry.path));

        if (await fs.exists(destination_path)) {
          console.log(`File already exists: ${entry.name}`);
          continue;
        }

        console.log(`Moving ${entry.name} to ${path.basename(path.join(destination_directory, ".."))}...`);

        await fs.copy(entry.path, destination_path);

        // veriy file was copied
        if (!(await fs.exists(destination_path))) {
          console.log(`Failed to copy ${entry.name} to ${path.basename(path.join(destination_directory, ".."))}`);
          continue;
        }

        // verify the sha256 hash of the original and copied file are the same
        const original_hash = await getFileHash(entry.path);
        const copied_hash = await getFileHash(destination_path);

        if (original_hash !== copied_hash) {
          console.log(`Failed to copy ${entry.name} to ${path.basename(path.join(destination_directory, ".."))}: hash mismatch`);
          await Deno.remove(destination_path);

          continue;
        }

        // delete original file
        await Deno.remove(entry.path);

        count++;

        continue;
      }

      if (![".JPG", ".CR2"].includes(file_extension)) {
        continue;
      }

      const {model} = await exif(entry.path);

      const date = (await Deno.stat(entry.path)).mtime;
      if (!date) {
        console.log(`Failed to get date for ${entry.name}`);
        continue;
      }

      const destination = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
      const destination_directory = path.join(PATH, destination_directories.find((dir) => dir.startsWith(destination)) ?? destination, model);

      // create directory structure
      await fs.ensureDir(destination_directory);
      await fs.ensureDir(path.join(destination_directory, "1. RAW"));
      await fs.ensureDir(path.join(destination_directory, "2. JPEG"));
      await fs.ensureDir(path.join(destination_directory, "3. Edited"));

      const destination_path = path.join(destination_directory, file_extension === ".JPG" ? "2. JPEG" : "1. RAW", path.basename(entry.path));

      if (await fs.exists(destination_path)) {
        console.log(`File already exists: ${entry.name}`);
        continue;
      }

      console.log(`Moving ${entry.name} to ${path.basename(path.join(destination_directory, ".."))}...`);

      await fs.copy(entry.path, destination_path);

      // veriy file was copied
      if (!(await fs.exists(destination_path))) {
        console.log(`Failed to copy ${entry.name} to ${path.basename(path.join(destination_directory, ".."))}`);
        continue;
      }

      // verify the sha256 hash of the original and copied file are the same
      const original_hash = await getFileHash(entry.path);
      const copied_hash = await getFileHash(destination_path);

      if (original_hash !== copied_hash) {
        console.log(`Failed to copy ${entry.name} to ${path.basename(path.join(destination_directory, ".."))}: hash mismatch`);
        await Deno.remove(destination_path);

        continue;
      }

      // delete original file
      await Deno.remove(entry.path);

      count++;
    }
  }

  console.log(`Moved ${count} files in ${Date.now() - start}ms`);
}

async function getFileHash(filePath: string) {
  return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", await Deno.readFile(filePath))))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
