import { JsonDb } from "./json-db.js";

// Export singleton instance
export const db = await new JsonDb("./db/data.json").init();
