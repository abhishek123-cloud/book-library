import { Router } from 'express';
import { BookController } from '../controllers/bookControllers';

const router = Router();
const bookController = new BookController();

router.get('/books', bookController.getAllBooks);
router.get('/books/:id', bookController.getBookById);
router.post('/books', bookController.createBook);
router.delete('/books/:id', bookController.deleteBook);

export default router;