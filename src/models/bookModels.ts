import mongoose from 'mongoose';
import { v4 as uuidv4 } from "uuid";


const bookSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, immutable: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  publishedYear: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ }, // YYYY-MM-DD format
  genre: { type: String, required: true },
});

const Book = mongoose.model('Book', bookSchema);

export default Book;