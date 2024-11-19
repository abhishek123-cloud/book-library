import { Request, Response } from 'express';
import { BookService } from '../services/bookServices';
import { bookSchema } from '../validators/bookValidators';
import redis from '../config/redisClient';

const bookService = new BookService();

export class BookController {
  // Get all books with caching, pagination, and filtering
  async getAllBooks(req: Request, res: Response): Promise<void> {
    const { page = 1, limit = 10, title, author, genre } = req.query; // Read query parameters

    const cacheKey = `books:${page}:${limit}:${title}:${author}:${genre}`;  // Cache key includes pagination and filters

    try {
      // Check if books are cached in Redis
      const cachedBooks = await redis.get(cacheKey);
      if (cachedBooks) {
        console.log('Returning cached books');
       res.status(200).json(JSON.parse(cachedBooks)); // Return cached books if available
      }

      // Prepare filters
      const filters = { title, author, genre };

      // Fetch the books with pagination and filtering
      const result = await bookService.getAllBooks(filters, Number(page), Number(limit));

      // Cache the response in Redis for 30 seconds
      await redis.setex(cacheKey, 30, JSON.stringify(result));

      res.status(200).json(result);
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ error: err.message });
    }
  }
  async getBookById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const book = await bookService.getBookById(id);
      if (!book) {
        res.status(404).json({ message: 'Book not found' });
      } else {
        res.status(200).json(book);
      }
    } catch (error) {
  const err = error as Error; // Typecasting to Error
  res.status(500).json({ error: err.message });    }
  }
  // Create a new book with validation
  async createBook(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const { error, value } = bookSchema.validate(req.body, { abortEarly: false });
      if (error) {
       res.status(400).json({
          error: 'Validation failed',
          details: error.details.map((err) => err.message), // Provide detailed validation errors
        });
      }
      // Proceed to service after validation
      const newBook = await bookService.createBook(value)

     res.status(201).json(newBook);
    } catch (error) {
      const err = error as Error;
       res.status(500).json({ error: err.message });
    }
  }

  // Delete a book by ID
  async deleteBook(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deletedBook = await bookService.deleteBook(id);

      res.status(200).json(deletedBook);
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ error: err.message });
    }
  }
}
