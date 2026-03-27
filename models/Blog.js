import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  Blog_header: {
    type: String,
    required: true,
    trim: true,
  },
  Blog_msg: {
    type: String,
    required: true,
    trim: true,
  },
  related_url: {
    type: String,
    trim: true,
    default: null,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Blog', blogSchema);
