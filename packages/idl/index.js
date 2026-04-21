import { readdir, readFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseWebIDL } from "webidl2";

const __dirname = dirname(fileURLToPath(import.meta.url));

class IDLFile {
  constructor(dir, file) {
    this.filename = file;
    this.shortname = basename(file, ".idl");
    this.path = join(dir, file);
  }

  async text() {
    return readFile(this.path, "utf8");
  }

  async parse() {
    return parseWebIDL(await this.text());
  }
}

function sortIdlFiles(files) {
  return files.filter((file) => file.endsWith(".idl")).sort();
}

export async function listAll({ folder = __dirname } = {}) {
  const all = {};
  for (const file of sortIdlFiles(await readdir(folder))) {
    const idlFile = new IDLFile(folder, file);
    all[idlFile.shortname] = idlFile;
  }
  return all;
}

export async function parseAll(options) {
  const all = await listAll(options);
  for (const [key, value] of Object.entries(all)) {
    all[key] = await value.parse();
  }
  return all;
}

export default { listAll, parseAll };
