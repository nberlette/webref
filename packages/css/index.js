import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function createEmptyCssData() {
  return {
    atrules: [],
    functions: [],
    properties: [],
    selectors: [],
    types: [],
  };
}

function createIndexedCssData() {
  return {
    atrules: {},
    functions: {},
    properties: {},
    selectors: {},
    types: {},
  };
}

function createFeatureId(feature, features) {
  let id = feature.name;
  if (feature.for) {
    const dupl = features.find((f) => f !== feature && f.name === feature.name);
    if (dupl) {
      // Scoped definitions with the same name need a stable disambiguator.
      id += ` for ${feature.for[0]}`;
    }
  }
  return id;
}

function createDescriptorIndex(descriptors) {
  const indexed = {};
  for (const descriptor of descriptors) {
    indexed[descriptor.name] = descriptor;
  }
  return indexed;
}

function createIndex(nonIndexed) {
  const indexed = createIndexedCssData();
  for (const category of Object.keys(indexed)) {
    const features = nonIndexed[category] ?? [];
    for (const feature of features) {
      const id = createFeatureId(feature, features);
      indexed[category][id] = feature.descriptors
        ? {
          ...feature,
          descriptors: createDescriptorIndex(feature.descriptors),
        }
        : feature;
    }
  }
  return indexed;
}

export async function listAll({ folder = __dirname } = {}) {
  const json = await readFile(join(folder, "css.json"), "utf8")
    .catch(() => JSON.stringify(createEmptyCssData()));
  return JSON.parse(json);
}

export async function index(options) {
  return createIndex(await listAll(options));
}

export default { listAll, index };
