const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // ✅ added
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // ✅ added
app.use(express.json());


//design schema for book
const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    isbn: { type: String, required: true, unique: true },
    genre: { type: String, required: true },
    publisher: { type: String, required: true },
    publicationYear: { type: Number },
    totalCopies: { type: Number, required: true, min: 1 },
    availableCopies: { type: Number },
    shelfLocation: { type: String },
    bookType: { type: String, enum: ['Reference', 'Circulating'] },
    status: { type: String, default: "Available" }
});

const Book = mongoose.model('Book', bookSchema);


// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));


// Add new book
app.post('/books', async (req, res) => {
    try {
        const { title, author, isbn, genre, publisher, publicationYear,
                totalCopies, availableCopies, shelfLocation, bookType } = req.body;

        const book = new Book({
            title,
            author,
            isbn,
            genre,
            publisher,
            publicationYear,
            totalCopies,
            availableCopies,
            shelfLocation,
            bookType
        });

        await book.save();

        res.status(201).json({ message: 'Book added successfully' });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


// Get all books
app.get('/books', async (req, res) => {
    try {
        const books = await Book.find();
        res.json(books);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Get book by ID
app.get('/books/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        res.json(book);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// delete book by id
app.delete('/books/:id', async (req, res) => {
    try {
        const result = await Book.deleteOne({ _id: req.params.id });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }

        res.json({ message: 'Book deleted successfully' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


//update book by id
app.put('/books/:id', async (req, res) => {
    try {
        const book = await Book.findByIdAndUpdate(
            req.params.id,
            req.body
        );

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        res.json({ message: 'Book updated successfully' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


//search book by title
app.get('/books/search', async (req, res) => {
    try {
        const { title } = req.query;

        const books = await Book.find({
            title: { $regex: title, $options: 'i' }
        });

        res.json(books);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});