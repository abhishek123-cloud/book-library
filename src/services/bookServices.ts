import redis from '../config/redisClient';
import Book from '../models/bookModels';
import { broadcastNewBook } from '../socket/socket';

export class BookService {
  // Fetch all books
  async getAllBooks(filters: any, page: number, limit: number) {
    try {
      const query: any = {};

      // Apply filters if provided
      if (filters.title) {
        query.title = { $regex: filters.title, $options: 'i' }; // Case-insensitive search
      }
      if (filters.author) {
        query.author = { $regex: filters.author, $options: 'i' };
      }
      if (filters.genre) {
        query.genre = { $regex: filters.genre, $options: 'i' };
      }

      // Pagination calculation
      const skip = (page - 1) * limit;

      const books = await Book.find(query).skip(skip).limit(limit);
      const totalBooks = await Book.countDocuments(query); // Total count for pagination

      // Return books with total count for pagination and filtering
      return {
        books: books.map((book) => {
          const { _id, ...bookData } = book.toObject(); // Exclude _id and __v
          return bookData;
        }),
        totalBooks,
        totalPages: Math.ceil(totalBooks / limit),
        currentPage: page,
      };
    } catch (error) {
      const err = error as Error;
      throw new Error(`Error fetching books: ${err.message}`);
    }
  }
  // Fetch a book by its UUID
  async getBookById(id: string) {
    try {
      const book = await Book.findOne({ id: id }); // Query by id as a string
      
      if (!book) {
        throw new Error('Book not found');
      }

      const { _id, ...bookData } = book.toObject(); 
      return bookData;
    } catch (error) {
      const err = error as Error; // Typecasting error to Error
      throw new Error(`Error fetching book by ID: ${err.message}`);
    }
  }

  // Create a new book and clear cache
  async createBook(bookData: any) {
    try {
      const book = new Book(bookData);
      const savedBook = await book.save();

      // Clear Redis cache for books
      await redis.del('booksCache');

      // Broadcast the new book to WebSocket clients
      const { _id, ...bookWithoutId } = savedBook.toObject();
      broadcastNewBook(bookWithoutId);

      return bookWithoutId;
    } catch (error) {
      const err = error as Error;
      throw new Error(`Error creating book: ${err.message}`);
    }
  }

  // Delete a book by ID and clear cache
  async deleteBook(id: string) {
    try {
      const book = await Book.findByIdAndDelete(id);

      if (!book) {
        throw new Error('Book not found');
      }

      // Clear the cache since the data has changed
      await redis.del('books');

      return book;
    } catch (error) {
      const err = error as Error;
      throw new Error(`Error deleting book: ${err.message}`);
    }
  }
}