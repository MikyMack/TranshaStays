const mongoose = require('mongoose');

const pgFloorSchema = new mongoose.Schema({
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'PgProperty', required: true },
  floorNumber: { type: Number, required: true },
  name: { type: String },
  description: { type: String },
  rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PgRoom' }]
}, { timestamps: true , toJSON: { virtuals: true }, toObject: { virtuals: true } });

pgFloorSchema.virtual('allRooms', {
    ref: 'PgRoom',
    localField: '_id',
    foreignField: 'floor'
  });

module.exports = mongoose.model('PgFloor', pgFloorSchema);
