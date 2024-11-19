import { BookService } from '../services/bookServices';
import Book from '../models/bookModels';
import redis from '../config/redisClient';

jest.mock('../models/bookModels');
jest.mock('../config/redisClient');

const bookService = new BookService();

describe('BookService', () => {
    describe('getAllBooks', () => {
        it('should fetch all books with pagination and filters', async () => {
          // Sample books data as per the format provided
          const mockBooks = [
            {
              id: "5c7bfb80-3666-4164-b851-c20628448c5a",
              title: "The Great Gatsby Allen",
              author: "F. Scott Fitzgerald",
              publishedYear: "1925-04-10",
              genre: "Fiction",
              __v: 0,
            },
            {
              id: "6378be5d-9b4a-46fb-8d83-b0835975f46a",
              title: "The Great Gatsby",
              author: "F. Scott Fitzgerald",
              publishedYear: "1925-04-10",
              genre: "Fiction",
              __v: 0,
            }
          ];
    
          // Create a mock of the Mongoose query object with chainable methods
          const mockQuery = {
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue(mockBooks), // Resolving mockBooks when exec is called
          };
    
          // Mock Book.find to return the mock query object
          const findMock = jest.fn().mockReturnValue(mockQuery);
          const countDocumentsMock = jest.fn().mockResolvedValue(mockBooks.length); // Return the total count
    
          Book.find = findMock;
          Book.countDocuments = countDocumentsMock;
    
          const filters = { title: 'Test Book', author: 'Test Author' }; // Mocking filter for testing
          const page = 1;
          const limit = 5;
    
          const result = await bookService.getAllBooks(filters, page, limit);
    
          // Validating the expected results
          expect(Book.find).toHaveBeenCalledWith(expect.objectContaining(filters)); // Ensure correct filter
          expect(mockQuery.skip).toHaveBeenCalledWith(0); // Ensure that .skip() was called with the correct value
          expect(mockQuery.limit).toHaveBeenCalledWith(5); // Ensure that .limit() was called with the correct value
          expect(result.books.length).toBe(5); // Pagination: check we get 5 books per page
          expect(result.totalBooks).toBe(7); // We have 7 books in total from mock data
          expect(result.totalPages).toBe(2); // Two pages should be returned
          expect(result.currentPage).toBe(1); // The current page should be 1
        });
      });
    

  describe('getBookById', () => {
    it('should fetch a book by ID', async () => {
      const mockBook = { id: '1', title: 'Book 1', author: 'Author 1', genre: 'Fiction', publishedYear: '2021' };

      // Mocking Book.findOne to return a plain object that mimics the Document
      Book.findOne = jest.fn().mockResolvedValue(mockBook);

      const result = await bookService.getBookById('1');

      expect(Book.findOne).toHaveBeenCalledWith({ id: '1' });
      expect(result).toEqual(mockBook);
    });

    it('should throw an error if book not found', async () => {
      Book.findOne = jest.fn().mockResolvedValue(null);

      await expect(bookService.getBookById('non-existent-id')).rejects.toThrow('Book not found');
    });
  });
  describe('createBook', () => {
    it('should create a new book and clear the cache', async () => {
      const newBook = {
        "title": "Another Test Book",
        "author": "Another Author",
        "publishedYear": "2021-09-10",
        "genre": "Science Fiction",
        "_id": "673c17e04732358811c381e8",
        "id": "71c0c5c0-1fe1-49f6-ad24-1331f08ad39d",
        "__v": 0
      };

      // Mock save method for Book model to return the newly created book
      Book.prototype.save = jest.fn().mockResolvedValue(newBook);

      // Mock redis.del to track if it's called with 'books'
      redis.del = jest.fn().mockResolvedValue(true); // Mocking the deletion of cache key

      // Call the service method
      const result = await bookService.createBook(newBook);

      // Ensure that the save method was called on the Book prototype
      expect(Book.prototype.save).toHaveBeenCalled();
      expect(redis.del).toHaveBeenCalledWith('books'); // Ensure redis.del is called with 'books'
      expect(result.title).toBe('books'); // Ensure the returned book matches the expected value
    });
  });

  describe('deleteBook', () => {
    it('should delete a book and clear the cache', async () => {
      const mockBook = { id: '1', title: 'Book 1', author: 'Author 1', genre: 'Fiction', publishedYear: '2021', "__v": 0,"_id": "673c17e04732358811c381e8", };

      Book.findByIdAndDelete = jest.fn().mockResolvedValue(mockBook);
      redis.del = jest.fn();

      const result = await bookService.deleteBook('1');

      expect(Book.findByIdAndDelete).toHaveBeenCalledWith('1');
      expect(redis.del).toHaveBeenCalledWith('books');
      expect(result).toEqual(mockBook);
    });

    it('should throw an error if the book is not found', async () => {
      Book.findByIdAndDelete = jest.fn().mockResolvedValue(null);

      await expect(bookService.deleteBook('non-existent-id')).rejects.toThrow('Book not found');
    });
  });
});
