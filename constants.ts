import * as path from "https://deno.land/std@0.167.0/path/mod.ts";

export const PATH = path.join(Deno.env.get("USERPROFILE")!, "Pictures", "Photography");
export const TEMP = Deno.env.get("TEMP")!;
