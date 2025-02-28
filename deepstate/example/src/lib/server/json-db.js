// json-db.js
// A simple file-based JSON database for server-side persistence

import fs from "fs/promises";
import path from "path";

/**
 * A simple JSON file-based database
 */
export class JsonDb {
  /**
   * Create a new JSON database
   * @param {string} dbPath - Path to the JSON file
   */
  constructor(dbPath) {
    this.dbPath = dbPath;
    this.cache = null;
    this.initialized = false;
  }

  /**
   * Initialize the database
   * Creates the file if it doesn't exist
   */
  async init() {
    try {
      await fs.access(this.dbPath);
      // File exists, load it
      const data = await fs.readFile(this.dbPath, "utf-8");
      this.cache = JSON.parse(data);
    } catch (error) {
      // File doesn't exist or can't be read
      // Ensure directory exists
      const dir = path.dirname(this.dbPath);
      await fs.mkdir(dir, { recursive: true });

      // Create empty database
      this.cache = {};
      await this.save();
    }

    this.initialized = true;
    return this;
  }

  /**
   * Save the current state to disk
   */
  async save() {
    await fs.writeFile(this.dbPath, JSON.stringify(this.cache, null, 2));
  }

  /**
   * Get a collection from the database
   * @param {string} collection - Collection name
   * @returns {Collection} Collection object
   */
  collection(collection) {
    if (!this.initialized) {
      throw new Error("Database not initialized. Call init() first.");
    }

    // Ensure collection exists
    if (!this.cache[collection]) {
      this.cache[collection] = [];
    }

    return new Collection(collection, this);
  }

  /**
   * Get raw data from the database
   * @param {string} collection - Collection name
   * @returns {Array} Collection data
   */
  getData(collection) {
    return this.cache[collection] || [];
  }

  /**
   * Set data in the database
   * @param {string} collection - Collection name
   * @param {Array} data - Collection data
   */
  setData(collection, data) {
    this.cache[collection] = data;
  }
}

/**
 * A collection in the JSON database
 */
class Collection {
  /**
   * Create a new collection
   * @param {string} name - Collection name
   * @param {JsonDb} db - Database instance
   */
  constructor(name, db) {
    this.name = name;
    this.db = db;
  }

  /**
   * Find all documents in the collection
   * @param {Object} [query] - Query filter
   * @returns {Promise<Array>} Array of documents
   */
  async findAll(query = {}) {
    const data = this.db.getData(this.name);

    if (Object.keys(query).length === 0) {
      return data;
    }

    // Simple filtering
    return data.filter((item) => {
      for (const [key, value] of Object.entries(query)) {
        if (item[key] !== value) {
          return false;
        }
      }
      return true;
    });
  }

  /**
   * Find a document by ID
   * @param {string} id - Document ID
   * @returns {Promise<Object|null>} Document or null
   */
  async findById(id) {
    const data = this.db.getData(this.name);
    return data.find((item) => item.id === id) || null;
  }

  /**
   * Insert a new document
   * @param {Object} doc - Document to insert
   * @returns {Promise<Object>} Inserted document
   */
  async insert(doc) {
    // Ensure document has an ID
    if (!doc.id) {
      doc.id = Date.now().toString();
    }

    const data = this.db.getData(this.name);
    data.push(doc);

    await this.db.save();
    return doc;
  }

  /**
   * Insert multiple documents
   * @param {Array<Object>} docs - Documents to insert
   * @returns {Promise<Array<Object>>} Inserted documents
   */
  async insertMany(docs) {
    const data = this.db.getData(this.name);

    // Ensure all documents have IDs
    const docsWithIds = docs.map((doc) => ({
      ...doc,
      id: doc.id ||
        Date.now().toString() + Math.random().toString(36).substring(2, 9),
    }));

    data.push(...docsWithIds);

    await this.db.save();
    return docsWithIds;
  }

  /**
   * Update a document by ID
   * @param {string} id - Document ID
   * @param {Object} update - Update object
   * @returns {Promise<Object|null>} Updated document or null
   */
  async updateById(id, update) {
    const data = this.db.getData(this.name);
    const index = data.findIndex((item) => item.id === id);

    if (index === -1) {
      return null;
    }

    // Merge the update with existing document
    data[index] = {
      ...data[index],
      ...update,
      id, // Ensure ID remains the same
    };

    await this.db.save();
    return data[index];
  }

  /**
   * Delete a document by ID
   * @param {string} id - Document ID
   * @returns {Promise<boolean>} True if document was deleted
   */
  async deleteById(id) {
    const data = this.db.getData(this.name);
    const index = data.findIndex((item) => item.id === id);

    if (index === -1) {
      return false;
    }

    data.splice(index, 1);

    await this.db.save();
    return true;
  }

  /**
   * Replace the entire collection with new data
   * @param {Array<Object>} data - New collection data
   * @returns {Promise<Array<Object>>} The new collection data
   */
  async replaceAll(data) {
    this.db.setData(this.name, data);
    await this.db.save();
    return data;
  }
}
