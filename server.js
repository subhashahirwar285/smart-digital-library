const express = require("express");
const Database = require("better-sqlite3");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0";

// ==========================================
// DATABASE CONNECTION
// ==========================================

const db = new Database(path.join(__dirname, "library.db"));

db.pragma("foreign_keys = ON");
db.pragma("journal_mode = WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    description TEXT,
    file_path TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS quiz_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_answer TEXT NOT NULL,
    category TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS quiz_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    selected_answer TEXT,
    is_correct INTEGER NOT NULL DEFAULT 0,
    answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, question_id),
    FOREIGN KEY(student_id) REFERENCES users(id),
    FOREIGN KEY(question_id) REFERENCES quiz_questions(id)
);

CREATE TABLE IF NOT EXISTS reading_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    book_id INTEGER NOT NULL,
    progress INTEGER NOT NULL DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, book_id),
    FOREIGN KEY(student_id) REFERENCES users(id),
    FOREIGN KEY(book_id) REFERENCES books(id)
);

CREATE INDEX IF NOT EXISTS idx_quiz_history_student
ON quiz_history(student_id);

CREATE INDEX IF NOT EXISTS idx_quiz_history_question
ON quiz_history(question_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_quiz_question_category
ON quiz_questions(question, category);
`);

// ==========================================
// DEFAULT BOOKS
// ==========================================

const defaultBooks = [
    {
        title: "HTML & CSS",
        category: "Web Development",
        description: "Learn HTML elements, CSS styling, layouts and responsive website design.",
        file_path: "html-css.html"
    },
    {
        title: "Java Programming",
        category: "Programming",
        description: "Learn Java syntax, variables, classes, objects and object-oriented programming.",
        file_path: "java.html"
    },
    {
        title: "Python Programming",
        category: "Programming",
        description: "Learn Python fundamentals, functions, loops and programming concepts.",
        file_path: "python.html"
    },
    {
        title: "Data Structures",
        category: "Computer Science",
        description: "Learn arrays, stacks, queues, linked lists and other data structures.",
        file_path: "data-structures.html"
    }
];

const insertBook = db.prepare(`
    INSERT OR IGNORE INTO books
    (title, category, description, file_path)
    VALUES (@title, @category, @description, @file_path)
`);

db.transaction(() => {
    defaultBooks.forEach(book => insertBook.run(book));
})();

// ==========================================
// QUIZ QUESTIONS: EASY, MEDIUM, HARD
// ==========================================

const questionSets = {
    easy: [
        ["HTML stands for?", ["Hyper Text Markup Language", "High Text Machine Language", "Hyperlink Text Mark Language", "Home Tool Markup Language"], 0],
        ["Which tag is used for the largest heading?", ["<h6>", "<h1>", "<head>", "<heading>"], 1],
        ["Which tag is used to create a paragraph?", ["<p>", "<para>", "<text>", "<paragraph>"], 0],
        ["Which language is used for styling web pages?", ["HTML", "CSS", "JavaScript", "Python"], 1],
        ["Which symbol is used for an ID selector in CSS?", [".", "#", "*", "&"], 1],
        ["Which symbol is used for a class selector in CSS?", ["#", ".", "*", "$"], 1],
        ["Which property changes text color?", ["font-color", "text-color", "color", "background"], 2],
        ["Which property changes background color?", ["bg-color", "background-color", "color-bg", "background"], 1],
        ["JavaScript is mainly used for?", ["Styling", "Adding interactivity", "Creating databases", "Creating images"], 1],
        ["Which keyword declares a variable in JavaScript?", ["var", "variable", "int", "string"], 0],
        ["Which symbol is used for single-line comments in JavaScript?", ["//", "##", "<!--", "**"], 0],
        ["Which HTML tag creates a link?", ["<link>", "<a>", "<url>", "<href>"], 1],
        ["Which HTML tag is used to insert an image?", ["<image>", "<img>", "<pic>", "<src>"], 1],
        ["Which CSS property changes font size?", ["font-size", "text-size", "size", "font-style"], 0],
        ["Which CSS property makes text bold?", ["font-weight", "text-bold", "bold", "font-bold"], 0],
        ["Which JavaScript function displays a message box?", ["message()", "alert()", "show()", "display()"], 1],
        ["Which operator is used for addition?", ["-", "+", "*", "/"], 1],
        ["Which HTML tag creates a line break?", ["<break>", "<br>", "<lb>", "<line>"], 1],
        ["Which CSS property is used to align text?", ["text-align", "align-text", "center-text", "text-center"], 0],
        ["Which extension is normally used for an HTML file?", [".css", ".js", ".html", ".web"], 2]
    ],

    medium: [
        ["Which CSS layout system is mainly used for one-dimensional layouts?", ["Grid", "Flexbox", "Table", "Float"], 1],
        ["Which CSS property controls space inside an element?", ["margin", "padding", "spacing", "border"], 1],
        ["Which CSS property controls space outside an element?", ["padding", "margin", "space", "outer"], 1],
        ["What does DOM stand for?", ["Document Object Model", "Data Object Model", "Document Oriented Method", "Digital Object Management"], 0],
        ["Which method selects an element by ID?", ["getElementById()", "getElement()", "selectId()", "queryId()"], 0],
        ["Which method selects the first matching CSS selector?", ["querySelector()", "selectFirst()", "getSelector()", "findSelector()"], 0],
        ["Which keyword creates a block-scoped variable?", ["var", "let", "define", "variable"], 1],
        ["Which keyword creates a constant in JavaScript?", ["constant", "fixed", "const", "final"], 2],
        ["Which method adds an element to the end of an array?", ["push()", "add()", "insert()", "append()"], 0],
        ["Which method removes the last element from an array?", ["remove()", "pop()", "delete()", "last()"], 1],
        ["Which operator checks both value and data type?", ["==", "=", "===", "!="], 2],
        ["Which event occurs when a user clicks an element?", ["hover", "click", "submit", "load"], 1],
        ["Which CSS property controls element stacking order?", ["stack", "z-index", "layer", "order"], 1],
        ["What is the default display value of a div?", ["inline", "block", "flex", "grid"], 1],
        ["Which HTML element is semantic?", ["<div>", "<span>", "<header>", "<box>"], 2],
        ["Which CSS unit is relative to the root font size?", ["px", "em", "rem", "%"], 2],
        ["Which JavaScript object represents the browser window?", ["document", "window", "browser", "screen"], 1],
        ["Which function converts JSON text into a JavaScript object?", ["JSON.parse()", "JSON.convert()", "JSON.object()", "JSON.toObject()"], 0],
        ["Which CSS property creates rounded corners?", ["corner-radius", "border-radius", "radius", "round-border"], 1],
        ["Which HTML attribute provides alternative text for an image?", ["title", "alt", "src", "text"], 1]
    ],

    hard: [
        ["What is event bubbling in JavaScript?", ["Event moves from parent to child", "Event moves from child to parent", "Event is permanently deleted", "Event runs only once"], 1],
        ["What is event delegation?", ["Using one parent handler for child events", "Creating multiple events", "Deleting events", "Stopping JavaScript"], 0],
        ["What does a Promise represent?", ["A CSS rule", "Future completion of an asynchronous operation", "An HTML element", "A database"], 1],
        ["Which method handles a fulfilled Promise?", ["catch()", "then()", "error()", "finally()"], 1],
        ["Which method handles a rejected Promise?", ["then()", "catch()", "reject()", "errorHandler()"], 1],
        ["What does async/await help with?", ["CSS styling", "Writing asynchronous code more clearly", "Creating HTML tags", "Changing colors"], 1],
        ["What is a closure in JavaScript?", ["A CSS property", "A function remembering its outer scope", "An HTML tag", "A loop"], 1],
        ["What does 'this' generally refer to?", ["Current execution context/object", "Always the window", "Always the document", "The previous function"], 0],
        ["Which method creates a new array by transforming each element?", ["filter()", "map()", "reduce()", "forEach()"], 1],
        ["Which method creates a new array containing elements that pass a test?", ["map()", "filter()", "reduce()", "findAll()"], 1],
        ["Which method reduces an array to a single value?", ["map()", "filter()", "reduce()", "combine()"], 2],
        ["What does CSS specificity determine?", ["Which style rule takes priority", "Page loading speed", "HTML structure", "JavaScript execution"], 0],
        ["Which selector has higher specificity?", ["Element selector", "Class selector", "ID selector", "Universal selector"], 2],
        ["What does position: absolute use as a positioning reference?", ["Nearest positioned ancestor", "Always the browser", "Only the body", "The previous element"], 0],
        ["What does localStorage store?", ["Data only during one function", "Data in the browser persistently", "Server-side files", "CSS rules"], 1],
        ["Which method converts a JavaScript object into JSON text?", ["JSON.parse()", "JSON.stringify()", "JSON.convert()", "JSON.text()"], 1],
        ["What is the purpose of debouncing?", ["Limit how frequently a function executes", "Increase image size", "Change CSS colors", "Delete events"], 0],
        ["What is the purpose of throttling?", ["Run a function at controlled intervals", "Stop the browser", "Create a database", "Change HTML structure"], 0],
        ["Which API is commonly used to make HTTP requests in modern JavaScript?", ["fetch()", "requestHTML()", "httpCall()", "getAPI()"], 0],
        ["What does CORS control?", ["Cross-origin resource access", "CSS animations", "HTML validation", "JavaScript loops"], 0]
    ]
};

// ==========================================
// SUBJECT QUESTION BANKS
// ==========================================

const subjectQuestionBanks = {
    "HTML & CSS": [
        ["HTML", "HyperText Markup Language", ["HyperText Machine Language", "HighText Markup Language", "Home Tool Markup Language"]],
        ["CSS", "Cascading Style Sheets", ["Computer Style System", "Creative Styling Syntax", "Colorful Sheet System"]],
        ["HTML element", "A building block of an HTML page", ["A database record", "A programming loop", "A network protocol"]],
        ["HTML attribute", "Provides additional information about an element", ["Deletes an element", "Creates a database", "Runs a server"]],
        ["Anchor tag", "Creates a hyperlink", ["Creates a heading", "Displays a video only", "Creates a table row"]],
        ["Image tag", "Displays an image on a page", ["Creates a hyperlink", "Changes font size", "Creates a paragraph"]],
        ["Form element", "Collects user input", ["Styles a heading", "Stores CSS rules", "Creates a server"]],
        ["Label element", "Provides a caption for a form control", ["Creates a database", "Makes text bold only", "Loads JavaScript"]],
        ["Semantic HTML", "Uses elements with meaningful structure", ["Uses only inline styles", "Removes all headings", "Uses images instead of text"]],
        ["CSS selector", "Targets elements to style", ["Stores website passwords", "Executes SQL queries", "Creates a server route"]],
        ["Class selector", "Selects elements using a class name", ["Selects only the page title", "Selects database rows", "Selects image files only"]],
        ["ID selector", "Targets an element using its ID", ["Targets every class automatically", "Creates a new element", "Runs a JavaScript function"]],
        ["Padding", "Space inside an element's border", ["Space outside the border", "Text color", "Border thickness only"]],
        ["Margin", "Space outside an element's border", ["Space inside the content", "Font family", "Image resolution"]],
        ["Flexbox", "A CSS layout system suited to one-dimensional layouts", ["A database system", "An HTML attribute", "A JavaScript data type"]],
        ["CSS Grid", "A layout system for rows and columns", ["An HTML form", "A programming language", "A web server"]],
        ["Media query", "Applies CSS rules based on device or viewport conditions", ["Saves user passwords", "Creates an HTML link", "Runs database queries"]],
        ["Responsive design", "Adapts a layout to different screen sizes", ["Uses one fixed layout everywhere", "Removes mobile support", "Only changes server settings"]],
        ["Box model", "Describes content, padding, border and margin", ["Describes database tables", "Defines Java classes", "Stores browser history"]],
        ["Alt attribute", "Provides alternative text for an image", ["Sets a background color", "Changes font weight", "Creates a link destination"]]
    ],

    "Java": [
        ["Java", "A general-purpose, class-based programming language", ["A markup language only", "A database engine", "A CSS framework"]],
        ["JVM", "Executes Java bytecode", ["Styles web pages", "Stores HTML forms", "Designs database tables"]],
        ["JRE", "Provides the environment needed to run Java applications", ["Only edits source code", "Creates CSS selectors", "Replaces every database"]],
        ["JDK", "Provides tools for developing Java applications", ["Only displays images", "Only stores user records", "A web page element"]],
        ["Class", "A blueprint for creating objects", ["A loop that never ends", "A database connection only", "An HTML heading"]],
        ["Object", "An instance of a class", ["A CSS selector", "A source-code comment", "A network address"]],
        ["Inheritance", "Allows a class to derive features from another class", ["Hides all methods", "Deletes objects automatically", "Changes HTML styling"]],
        ["Encapsulation", "Bundles data and methods and controls access", ["Repeats a loop", "Creates image files", "Connects only to CSS"]],
        ["Polymorphism", "Allows one interface to have different implementations", ["Means a class has no methods", "Means a program has no variables", "Styles a web page"]],
        ["Abstraction", "Hides implementation details and exposes essential features", ["Copies every object", "Deletes all classes", "Converts Java to HTML"]],
        ["Constructor", "Initializes a newly created object", ["Ends every loop", "Styles a class", "Creates a database table"]],
        ["Method", "A named block of code that performs a task", ["An HTML attribute", "A CSS color", "A database file"]],
        ["Interface", "Defines a contract that implementing classes follow", ["Stores images", "Creates CSS grids", "Runs only SQL commands"]],
        ["Exception", "An event that disrupts normal program execution", ["A CSS layout", "An HTML element", "A database column"]],
        ["Array", "Stores a fixed-size sequence of elements of one declared type", ["Stores only CSS styles", "Creates a web server", "Defines a class constructor"]],
        ["ArrayList", "A resizable list implementation in Java", ["A fixed-size primitive type", "An HTML tag", "A network protocol"]],
        ["Static keyword", "Declares a member associated with the class", ["Always creates a new object", "Deletes a class", "Changes a variable to HTML"]],
        ["Final keyword", "Restricts reassignment, overriding or inheritance depending on use", ["Always repeats a loop", "Makes every method public", "Creates a package automatically"]],
        ["Package", "Groups related Java types", ["Styles web pages", "Stores browser cookies only", "Creates an image"]],
        ["Main method", "A standard entry point for launching a Java application", ["A CSS property", "A database index", "An HTML form field"]]
    ],

    "Python": [
        ["Python", "A high-level, general-purpose programming language", ["A CSS property", "A database table", "An HTML tag"]],
        ["Variable", "A name that refers to a value", ["A web browser", "A CSS selector", "A database server"]],
        ["List", "An ordered, mutable collection", ["An immutable mapping only", "A CSS rule", "A Java package"]],
        ["Tuple", "An ordered, immutable collection", ["A resizable mutable list", "A web server", "An HTML element"]],
        ["Dictionary", "A collection of key-value pairs", ["A CSS animation", "A Java constructor", "A markup tag"]],
        ["Set", "A collection of distinct elements", ["A collection that always allows duplicates", "An HTML form", "A function argument only"]],
        ["Function", "A reusable block of code", ["A database index", "A CSS color", "An image format"]],
        ["Parameter", "A variable named in a function definition", ["A returned image", "A database table", "An HTML tag"]],
        ["Return statement", "Sends a result back from a function", ["Always repeats a loop", "Creates a CSS file", "Deletes a Python module"]],
        ["If statement", "Executes code conditionally", ["Creates a class automatically", "Imports every module", "Styles a web page"]],
        ["For loop", "Iterates over items in an iterable", ["Defines a database", "Changes font size", "Creates a network connection"]],
        ["While loop", "Repeats while its condition remains true", ["Runs exactly once in every case", "Creates an HTML heading", "Stores an image"]],
        ["Class", "Defines a blueprint for objects", ["Defines only a CSS color", "Stores a browser cookie", "Creates a SQL query automatically"]],
        ["Object", "An instance of a class", ["A Python comment", "A loop condition", "A file extension"]],
        ["Module", "A Python file containing reusable code", ["A CSS selector", "An HTML attribute", "A database row only"]],
        ["Exception handling", "Handles runtime errors using constructs such as try and except", ["Changes a web page color", "Creates a list automatically", "Replaces every variable"]],
        ["Lambda", "Creates a small anonymous function", ["Creates an HTML image", "Defines a database table", "Starts a web server automatically"]],
        ["List comprehension", "Creates a list using a concise expression", ["Deletes every list item", "Defines only a class", "Changes CSS styling"]],
        ["Indentation", "Defines code blocks in Python", ["Only changes font size", "Creates database indexes", "Defines HTML links"]],
        ["None", "Represents the absence of a value", ["Always means zero", "Means an empty string in every case", "Is a CSS keyword"]]
    ]
};

// ==========================================
// INSERT QUESTIONS INTO DATABASE
// ==========================================

const insertQuestion = db.prepare(`
    INSERT OR IGNORE INTO quiz_questions
    (
        question,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_answer,
        category
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const shuffleArray = array => {
    const result = [...array];

    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
};

db.transaction(() => {
    for (const [level, questions] of Object.entries(questionSets)) {
        for (const item of questions) {
            insertQuestion.run(
                item[0],
                item[1][0],
                item[1][1],
                item[1][2],
                item[1][3],
                String.fromCharCode(65 + item[2]),
                level
            );
        }
    }

    const templates = [
        term => `What is ${term}?`,
        term => `Which statement correctly describes ${term}?`,
        term => `Choose the correct definition of ${term}.`,
        term => `What is the main purpose of ${term}?`,
        term => `Which option best explains ${term}?`,
        term => `In programming, what does ${term} mean?`,
        term => `Which description matches ${term}?`,
        term => `Identify the correct concept for ${term}.`,
        term => `Which statement about ${term} is correct?`,
        term => `Select the best explanation of ${term}.`
    ];

    for (const [category, concepts] of Object.entries(subjectQuestionBanks)) {
        for (const [term, correct, distractors] of concepts) {
            for (const template of templates) {
                const options = shuffleArray([correct, ...distractors]);
                const correctIndex = options.indexOf(correct);

                insertQuestion.run(
                    template(term),
                    options[0],
                    options[1],
                    options[2],
                    options[3],
                    String.fromCharCode(65 + correctIndex),
                    category
                );
            }
        }
    }
})();

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// ==========================================
// HOME
// ==========================================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "login.html"));
});

// ==========================================
// SIGNUP
// ==========================================

app.post("/api/signup", (req, res) => {
    const { name, email, password } = req.body;

    if (
        typeof name !== "string" ||
        typeof email !== "string" ||
        typeof password !== "string" ||
        !name.trim() ||
        !email.trim() ||
        !password
    ) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }

    try {
        const result = db.prepare(`
            INSERT INTO users (name, email, password)
            VALUES (?, ?, ?)
        `).run(name.trim(), email.trim().toLowerCase(), password);

        res.status(201).json({
            success: true,
            message: "Signup successful!",
            userId: result.lastInsertRowid
        });
    } catch (error) {
        if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        console.error("Signup error:", error);

        res.status(500).json({
            success: false,
            message: "Signup failed"
        });
    }
});

// ==========================================
// LOGIN
// ==========================================

app.post("/api/login", (req, res) => {
    const { email, password } = req.body;

    if (
        typeof email !== "string" ||
        typeof password !== "string" ||
        !email.trim() ||
        !password
    ) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required"
        });
    }

    try {
        const user = db.prepare(`
            SELECT id, name, email
            FROM users
            WHERE email = ? AND password = ?
        `).get(email.trim().toLowerCase(), password);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        res.json({
            success: true,
            message: "Login successful!",
            user
        });
    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            success: false,
            message: "Login failed"
        });
    }
});

// ==========================================
// STUDENT PROFILE
// ==========================================

app.get("/api/student/:id", (req, res) => {
    const studentId = Number(req.params.id);

    if (!Number.isSafeInteger(studentId) || studentId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid student ID"
        });
    }

    try {
        const user = db.prepare(`
            SELECT id, name, email
            FROM users
            WHERE id = ?
        `).get(studentId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        res.json({ success: true, user });
    } catch (error) {
        console.error("Profile error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to load student profile"
        });
    }
});

app.put("/api/student/:id", (req, res) => {
    const studentId = Number(req.params.id);
    const { name, email } = req.body;

    if (
        !Number.isSafeInteger(studentId) ||
        studentId <= 0 ||
        typeof name !== "string" ||
        typeof email !== "string" ||
        !name.trim() ||
        !email.trim()
    ) {
        return res.status(400).json({
            success: false,
            message: "Valid student ID, name and email are required"
        });
    }

    try {
        const result = db.prepare(`
            UPDATE users
            SET name = ?, email = ?
            WHERE id = ?
        `).run(name.trim(), email.trim().toLowerCase(), studentId);

        if (!result.changes) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        res.json({
            success: true,
            message: "Profile updated successfully!"
        });
    } catch (error) {
        if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
            return res.status(409).json({
                success: false,
                message: "This email is already registered"
            });
        }

        console.error("Profile update error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to update student profile"
        });
    }
});

// ==========================================
// BOOKS
// ==========================================

app.get("/api/books", (req, res) => {
    try {
        const books = db.prepare(`
            SELECT id, title, category, description, file_path
            FROM books
            ORDER BY id ASC
        `).all();

        res.json({
            success: true,
            total: books.length,
            books
        });
    } catch (error) {
        console.error("Books error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to load books"
        });
    }
});

app.get("/api/books/:id", (req, res) => {
    const bookId = Number(req.params.id);

    if (!Number.isSafeInteger(bookId) || bookId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid book ID"
        });
    }

    try {
        const book = db.prepare(`
            SELECT id, title, category, description, file_path
            FROM books
            WHERE id = ?
        `).get(bookId);

        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }

        res.json({ success: true, book });
    } catch (error) {
        console.error("Book error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to load book"
        });
    }
});

// ==========================================
// READING PROGRESS
// ==========================================

app.put("/api/reading-progress", (req, res) => {
    const { student_id, book_id, progress } = req.body;

    const studentId = Number(student_id);
    const bookId = Number(book_id);
    const progressValue = Number(progress);

    if (
        !Number.isSafeInteger(studentId) ||
        studentId <= 0 ||
        !Number.isSafeInteger(bookId) ||
        bookId <= 0 ||
        progress === null ||
        progress === "" ||
        !Number.isFinite(progressValue) ||
        progressValue < 0 ||
        progressValue > 100
    ) {
        return res.status(400).json({
            success: false,
            message: "Valid student ID, book ID and progress from 0 to 100 are required"
        });
    }

    try {
        db.prepare(`
            INSERT INTO reading_progress
            (student_id, book_id, progress, updated_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(student_id, book_id) DO UPDATE SET
                progress = excluded.progress,
                updated_at = CURRENT_TIMESTAMP
        `).run(studentId, bookId, Math.round(progressValue));

        res.json({
            success: true,
            message: "Reading progress saved successfully",
            progress: Math.round(progressValue)
        });
    } catch (error) {
        if (error.code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
            return res.status(404).json({
                success: false,
                message: "Student or book not found"
            });
        }

        console.error("Save reading progress error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to save reading progress"
        });
    }
});

app.get("/api/reading-progress/:studentId", (req, res) => {
    const studentId = Number(req.params.studentId);

    if (!Number.isSafeInteger(studentId) || studentId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid student ID"
        });
    }

    try {
        const student = db.prepare(`
            SELECT id FROM users WHERE id = ?
        `).get(studentId);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        const progress = db.prepare(`
            SELECT
                b.id AS book_id,
                b.title,
                b.file_path,
                rp.progress,
                rp.updated_at
            FROM reading_progress rp
            JOIN books b ON b.id = rp.book_id
            WHERE rp.student_id = ?
            ORDER BY rp.updated_at DESC
        `).all(studentId);

        res.json({
            success: true,
            total: progress.length,
            progress
        });
    } catch (error) {
        console.error("Get reading progress error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to load reading progress"
        });
    }
});

// ==========================================
// QUIZ CATEGORIES
// ==========================================

app.get("/api/quiz/categories", (req, res) => {
    try {
        const categories = db.prepare(`
            SELECT category, COUNT(*) AS total
            FROM quiz_questions
            GROUP BY category
            ORDER BY category
        `).all();

        res.json({
            success: true,
            categories
        });
    } catch (error) {
        console.error("Quiz categories error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to load quiz categories"
        });
    }
});

// ==========================================
// QUIZ QUESTIONS
// Accepts level=easy/medium/hard
// Also accepts category=HTML & CSS/Java/Python
// ==========================================


// ==========================================
// QUIZ QUESTIONS - UNLIMITED REPEAT ATTEMPTS
// ==========================================

app.get("/api/quiz/questions", (req, res) => {
    try {
        const studentId = Number(req.query.student_id);

        const requestedCategory = String(
            req.query.level || req.query.category || ""
        ).trim().toLowerCase();

        const categoryMap = {
            "html & css": "HTML & CSS",
            "html and css": "HTML & CSS",
            html: "HTML & CSS",
            css: "HTML & CSS",
            java: "Java",
            "java programming": "Java",
            python: "Python",
            "python programming": "Python",
            easy: "easy",
            medium: "medium",
            hard: "hard"
        };

        const category = categoryMap[requestedCategory];

        if (!Number.isSafeInteger(studentId) || studentId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Please log in again."
            });
        }

        if (!category) {
            return res.status(400).json({
                success: false,
                message: "Please select a valid quiz category."
            });
        }

        const student = db.prepare(
            "SELECT id FROM users WHERE id = ?"
        ).get(studentId);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found. Please log in again."
            });
        }

        // Previously attempted questions are also included.
        // This allows unlimited repeat attempts.
        const questions = db.prepare(`
            SELECT
                id,
                question,
                option_a,
                option_b,
                option_c,
                option_d,
                category
            from quiz_questions
            WHERE category = ?
            ORDER BY RANDOM()
            LIMIT 20
        `).all(category);

        const formattedQuestions = questions.map(q => ({
            id: q.id,
            question: q.question,
            category: q.category,
            options: [
                q.option_a,
                q.option_b,
                q.option_c,
                q.option_d
            ]
        }));

        return res.json({
            success: true,
            category,
            level: category,
            total: formattedQuestions.length,
            questions: formattedQuestions,
            message: formattedQuestions.length
                ? "Questions loaded successfully."
                : "No questions exist in this category yet."
        });

    } catch (error) {
        console.error("Load quiz questions error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load quiz questions."
        });
    }
});




// ==========================================
// SUBMIT QUIZ ANSWER - REPEAT ATTEMPTS ENABLED
// ==========================================

app.post("/api/quiz/answer", (req, res) => {
    const studentId = Number(req.body.student_id);
    const questionId = Number(req.body.question_id);

    const selectedAnswer = String(
        req.body.selected_answer || ""
    ).trim().toUpperCase();

    if (
        !Number.isSafeInteger(studentId) ||
        studentId <= 0 ||
        !Number.isSafeInteger(questionId) ||
        questionId <= 0 ||
        !["A", "B", "C", "D"].includes(selectedAnswer)
    ) {
        return res.status(400).json({
            success: false,
            message: "Valid student, question and answer are required."
        });
    }

    try {
        const student = db.prepare(
            "SELECT id FROM users WHERE id = ?"
        ).get(studentId);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found. Please log in again."
            });
        }

        const question = db.prepare(`
            SELECT id, correct_answer
            FROM quiz_questions
            WHERE id = ?
        `).get(questionId);

        if (!question) {
            return res.status(404).json({
                success: false,
                message: "Question not found."
            });
        }

        const isCorrect =
            selectedAnswer === question.correct_answer;

        // Save the latest answer for this student and question.
        // Existing history is updated instead of causing a UNIQUE error.
        db.prepare(`
            INSERT INTO quiz_history
                (student_id, question_id, selected_answer, is_correct)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(student_id, question_id)
            DO UPDATE SET
                selected_answer = excluded.selected_answer,
                is_correct = excluded.is_correct,
                answered_at = CURRENT_TIMESTAMP
        `).run(
            studentId,
            questionId,
            selectedAnswer,
            isCorrect ? 1 : 0
        );

        return res.json({
            success: true,
            is_correct: isCorrect,
            correct_answer: question.correct_answer,
            message: isCorrect
                ? "Correct answer! Well done."
                : "Incorrect answer. Keep practising!"
        });

    } catch (error) {
        console.error("Save quiz answer error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to save your answer."
        });
    }
});

// ==========================================
// QUIZ HISTORY
// ==========================================

app.get("/api/quiz/history/:studentId", (req, res) => {
    const studentId = Number(req.params.studentId);

    if (!Number.isSafeInteger(studentId) || studentId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid student ID."
        });
    }

    try {
        const student = db.prepare(`
            SELECT id FROM users WHERE id = ?
        `).get(studentId);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        const history = db.prepare(`
            SELECT
                h.question_id,
                q.question,
                q.category,
                h.selected_answer,
                h.is_correct,
                h.answered_at
            FROM quiz_history h
            JOIN quiz_questions q ON q.id = h.question_id
            WHERE h.student_id = ?
            ORDER BY h.answered_at DESC, h.id DESC
        `).all(studentId);

        const summary = db.prepare(`
            SELECT
                COUNT(*) AS attempted,
                COALESCE(
                    SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END), 0
                ) AS correct,
                COALESCE(
                    SUM(CASE WHEN is_correct = 0 THEN 1 ELSE 0 END), 0
                ) AS wrong
            FROM quiz_history
            WHERE student_id = ?
        `).get(studentId);

        res.json({
            success: true,
            summary,
            history
        });

    } catch (error) {
        console.error("Quiz history error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to load quiz history."
        });
    }
});

// ==========================================
// TEST API
// ==========================================

app.get("/api/test", (req, res) => {
    try {
        const questionCount = db.prepare(`
            SELECT COUNT(*) AS total
            FROM quiz_questions
        `).get().total;

        const categoryCounts = db.prepare(`
            SELECT category, COUNT(*) AS total
            FROM quiz_questions
            GROUP BY category
            ORDER BY category
        `).all();

        res.json({
            success: true,
            message: "Smart Digital Library Backend is Working!",
            quizQuestions: questionCount,
            categories: categoryCounts
        });

    } catch (error) {
        console.error("Test API error:", error);

        res.status(500).json({
            success: false,
            message: "Backend test failed."
        });
    }
});

// ==========================================
// 404 HANDLER
// ==========================================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API or page not found"
    });
});

// ==========================================
// START SERVER
// ==========================================

const server = app.listen(PORT, HOST, () => {
    const questionCount = db.prepare(`
        SELECT COUNT(*) AS total
        FROM quiz_questions
    `).get().total;

    console.log("======================================");
    console.log("Smart Digital Library is running!");
    console.log(`Local URL: http://localhost:${PORT}`);
    console.log(`Quiz questions in database: ${questionCount}`);
    console.log("======================================");
});

// ==========================================
// SAFE SHUTDOWN
// ==========================================

function shutdown() {
    console.log("\nShutting down server...");

    server.close(() => {
        db.close();
        process.exit(0);
    });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
