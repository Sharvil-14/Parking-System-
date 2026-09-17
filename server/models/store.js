const mongoose = require('mongoose');

// Shared memory store for fallback execution
const memoryStore = {
  users: [],
  locations: [],
  slots: [],
  vehicleLogs: [],
  transactions: []
};

// Unique ID generator for fallback store
let counter = 1000;
const generateId = () => 'id_' + Math.random().toString(36).substring(2, 9) + '_' + (counter++);

class Repository {
  constructor(collectionName, schema) {
    this.collectionName = collectionName;
    this.schema = schema;
    try {
      this.model = mongoose.model(collectionName, schema);
    } catch (e) {
      this.model = mongoose.model(collectionName);
    }
  }

  isMongo() {
    return mongoose.connection.readyState === 1;
  }

  async find(filter = {}) {
    if (this.isMongo()) {
      return await this.model.find(filter).lean();
    }
    let list = memoryStore[this.collectionName] || [];
    return list.filter(item => {
      for (let key in filter) {
        if (filter[key] !== undefined && item[key] !== filter[key]) return false;
      }
      return true;
    });
  }

  async findOne(filter = {}) {
    if (this.isMongo()) {
      return await this.model.findOne(filter).lean();
    }
    const list = await this.find(filter);
    return list.length > 0 ? list[0] : null;
  }

  async findById(id) {
    if (this.isMongo()) {
      return await this.model.findById(id).lean();
    }
    let list = memoryStore[this.collectionName] || [];
    return list.find(item => item._id === id || item.id === id) || null;
  }

  async create(data) {
    if (this.isMongo()) {
      const doc = new this.model(data);
      const saved = await doc.save();
      return saved.toObject();
    }
    const newItem = {
      _id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data
    };
    memoryStore[this.collectionName].push(newItem);
    return newItem;
  }

  async findOneAndUpdate(filter, update, options = { new: true }) {
    if (this.isMongo()) {
      return await this.model.findOneAndUpdate(filter, update, options).lean();
    }
    const item = await this.findOne(filter);
    if (!item) return null;
    Object.assign(item, update, { updatedAt: new Date().toISOString() });
    return item;
  }

  async findByIdAndUpdate(id, update, options = { new: true }) {
    if (this.isMongo()) {
      return await this.model.findByIdAndUpdate(id, update, options).lean();
    }
    return await this.findOneAndUpdate({ _id: id }, update, options);
  }

  async deleteOne(filter) {
    if (this.isMongo()) {
      return await this.model.deleteOne(filter);
    }
    const index = (memoryStore[this.collectionName] || []).findIndex(item => {
      for (let key in filter) {
        if (filter[key] !== undefined && item[key] !== filter[key]) return false;
      }
      return true;
    });
    if (index !== -1) {
      memoryStore[this.collectionName].splice(index, 1);
      return { deletedCount: 1 };
    }
    return { deletedCount: 0 };
  }

  async findByIdAndDelete(id) {
    if (this.isMongo()) {
      return await this.model.findByIdAndDelete(id).lean();
    }
    const item = await this.findById(id);
    if (item) {
      await this.deleteOne({ _id: id });
    }
    return item;
  }

  async countDocuments(filter = {}) {
    const list = await this.find(filter);
    return list.length;
  }

  async clear() {
    if (this.isMongo()) {
      await this.model.deleteMany({});
    } else {
      memoryStore[this.collectionName] = [];
    }
  }
}

module.exports = { Repository, memoryStore };
