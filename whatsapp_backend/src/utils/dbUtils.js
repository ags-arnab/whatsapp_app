// src/utils/dbUtils.js
const mongoose = require('mongoose');

// Batch operations helper
exports.bulkWrite = async (Model, operations, options = {}) => {
  const batchSize = 1000;
  const batches = [];
  
  for (let i = 0; i < operations.length; i += batchSize) {
    batches.push(operations.slice(i, i + batchSize));
  }
  
  const results = [];
  for (const batch of batches) {
    const result = await Model.bulkWrite(batch, {
      ordered: false,
      ...options
    });
    results.push(result);
  }
  
  return results;
};

// Aggregation helper with timeout
exports.aggregateWithTimeout = async (Model, pipeline, timeout = 30000) => {
  return Model.aggregate(pipeline).option({ maxTimeMS: timeout });
};