import path from "path";
import { fileURLToPath } from "url";
import { platform } from "os";

const p = platform();

const CWD = path.dirname(fileURLToPath(import.meta.url));

const functions = {
  cosine_similarity: (v1, v2) => {
    if (v1.length !== v2.length) {
      throw new Error("Vectors must be of the same length.");
    }
    v1 = new Float32Array(v1.buffer);
    v2 = new Float32Array(v2.buffer);
    let dot = 0,
      norm1Sq = 0,
      norm2Sq = 0;
    for (let i = 0; i < v1.length; i++) {
      const a = v1[i];
      const b = v2[i];
      dot += a * b;
      norm1Sq += a * a;
      norm2Sq += b * b;
    }
    return dot / (Math.sqrt(norm1Sq) * Math.sqrt(norm2Sq));
  },
  cosine_similarity_unrolled: (v1, v2) => {
    if (v1.length !== v2.length) {
      throw new Error("Vectors must be of the same length.");
    }

    v1 = new Float32Array(v1.buffer);
    v2 = new Float32Array(v2.buffer);
    let dot = 0,
      norm1Sq = 0,
      norm2Sq = 0;
    let i = 0,
      len = v1.length;

    // Process 4 elements at a time
    for (; i <= len - 4; i += 4) {
      const a1 = v1[i],
        a2 = v1[i + 1],
        a3 = v1[i + 2],
        a4 = v1[i + 3];
      const b1 = v2[i],
        b2 = v2[i + 1],
        b3 = v2[i + 2],
        b4 = v2[i + 3];

      dot += a1 * b1 + a2 * b2 + a3 * b3 + a4 * b4;
      norm1Sq += a1 * a1 + a2 * a2 + a3 * a3 + a4 * a4;
      norm2Sq += b1 * b1 + b2 * b2 + b3 * b3 + b4 * b4;
    }

    // Handle remaining elements
    for (; i < len; i++) {
      const a = v1[i],
        b = v2[i];
      dot += a * b;
      norm1Sq += a * a;
      norm2Sq += b * b;
    }

    return dot / (Math.sqrt(norm1Sq) * Math.sqrt(norm2Sq));
  },
  l2_distance: (vec1, vec2) => {
    const v1 = new Float32Array(vec1.buffer);
    const v2 = new Float32Array(vec2.buffer);
    return Math.sqrt(v1.reduce((sum, val, i) => sum + (val - v2[i]) ** 2, 0));
  },
  dot_product: (vec1, vec2) => {
    const v1 = new Float32Array(vec1.buffer);
    const v2 = new Float32Array(vec2.buffer);
    return v1.reduce((sum, val, i) => sum + val * v2[i], 0);
  },
};

/**
 *
 * @param {*} db - better sqlite3.Database object
 * @param {{useNative: Array<string>}} options  - options to configure the vector plugin
 * @returns {void}
 */
function sqliteVector(db, options) {
  if (!db) {
    throw new Error("Invalid database instance");
  }

  const { useNative = [] } = options;
  // console.log(CWD + "/binary/simd_vector.dll")
  let dynamicLib;
  if (p === "win32") {
    dynamicLib = "./binary/simd_vector.dll";
  } else if (p === "linux") {
    // not implemented yet will error use wsl2? or git actions
    dynamicLib = "./binary/simd_vector.so";
  } else {
    throw new Error(
      `Unsupported platform: ${p}. This application only supports Windows and Linux.`,
    );
  }

  if(p == "win32") {
    db.loadExtension(path.resolve(CWD, dynamicLib));
 }
  // use pure js - same perfomance really because of overheard and buffer alignment, simd cant even help

 
  
  Object.keys(functions).forEach((fn) => {
    if (!useNative.includes(fn)) {
      db.function(fn, functions[fn]); // Register only missing functions
      // console.log(`Registered ${fn} (JavaScript)`);
    } else {
      // console.log(`Using native ${fn} from DLL`);
    }
  });
}

export default sqliteVector;
