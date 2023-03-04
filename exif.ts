import * as exifr from "npm:exifr@^7.1.3/dist/full.esm.mjs";

export default async function exif(path: string) {
  const exif = await exifr.parse(await Deno.readFile(path));

  return {
    model: exif.Model.replace("Canon EOS", "Canon"),
    ctime: exif.CreateDate,
  };
}
