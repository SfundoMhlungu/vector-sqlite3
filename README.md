# sqlite-vector

npm package for integrating high-performance vector similarity functions into your SQLite databases. Whether you're building chatbots, recommendation engines, or any app that crunches embeddings, this tool makes vector search fast and easy.

---

## Why sqlite-vector?

Vector search can be lightning fast when you combine the efficiency of TypedArrays with the power of native C++ code. With **sqlite-vector**, you get:

- **Blazing performance:** Use optimized functions like `cosine_similarity`, `l2_distance`, and `dot_product` directly in SQLite.
- **Flexibility:** Choose native C++ functions via DLL (especially handy on Windows) or stick with pure JavaScript.
- **Easy integration:** Plug it into your existing SQLite projects with minimal fuss.

---

## Installation

Install via npm:

```bash
npm install sqlite-vector
```

> **Note for Windows Users:** The DLL is bundled with the package. For other platforms, feel free to fork the [C plugin code]() and build it for your system.

---

## Usage

Below is a quick-start guide to get you up and running. This example uses [better-sqlite3](https://www.npmjs.com/package/better-sqlite3) to open a SQLite database and query vector data.

### Example

```js
import Database from 'better-sqlite3';
import sqlitevector from 'sqlitevector';

// Open your database (make sure to use the correct path)
const db = new Database('path/to/your/embedblob.db');

// Activate sqlite-vector with native functions if available
sqlitevector(db, { useNative: ["cosine_similarity", "l2_distance", "dot_product"] });

// If you prefer using the JavaScript implementations (recommended for development/testing):
// sqlitevector(db, { useNative: [] });

// Example: Perform a vector similarity search using cosine similarity
async function runVectorSearch(embedding, sessionId) {
  const rows = db.prepare(`
    SELECT *, cosine_similarity_unrolled(embeddings, ?) AS similarity
    FROM embeddings
    WHERE sessid = ?
  `).all(embedding, sessionId);

  console.log('results:', rows);
}

// Sample embedding as a Float32Array (this would come from your model)
const sampleEmbedding = new Float32Array(modelresults.embeddings.flat()); // expect a 1d typedarray
runVectorSearch(sampleEmbedding, 'sess1');
```

---

## API

### `sqlitevector(db, options)`

- **db**: Your SQLite database instance (e.g., from [better-sqlite3](https://www.npmjs.com/package/better-sqlite3)).
- **options**: An object with the following property:
  - **useNative**: An array of function names to delegate to the native C++ plugin. For example, `["cosine_similarity", "l2_distance", "dot_product"]`. Set to an empty array (`[]`) to force the use of the JavaScript implementations.

#### Example

```js
sqlitevector(db, { useNative: ["cosine_similarity", "l2_distance"] });
```

---

## Supported Functions

Inside your SQLite queries, you can call the following functions:

- `cosine_similarity`
- `cosine_similarity_unrolled` (an optimized, loop-unrolled version) on pure js only
- `l2_distance`
- `dot_product`

These functions allow you to compute vector similarities and distances directly within your SQL queries, making it easy to build complex vector search features.

---

## Performance Tips

- **TypedArrays:** this package leverage JavaScript’s TypedArrays for efficient handling of binary vector data.
- **Native DLL:** On Windows, the bundled DLL uses SIMD optimizations you can use in any language(Go, Php) just copy the dll to the binary folder of your application and load.
- **JavaScript Fallback:** If native functions aren’t available, pure JavaScript implementations offer impressive speed even better than the dll(because of overhead).

---

## Contributing

Contributions, bug reports, and feature requests are welcome! Feel free to fork the repository and submit a pull request with your improvements.

---

## License

This project is licensed under the MIT License.

---

## Final Thoughts

With **sqlite-vector**, integrating vector search into your Node.js projects has never been easier. It’s fast, flexible, and designed to work seamlessly with your existing SQLite setup. So go ahead—experiment, build, and let your ideas take flight!

Happy coding! 🚀