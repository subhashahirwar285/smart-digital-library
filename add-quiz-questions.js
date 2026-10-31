const Database = require("better-sqlite3");
const db = new Database("library.db");

const questions = [
    // EASY - 10 Questions
    {
        question: "Which tag is used to insert an image in HTML?",
        a: "<image>",
        b: "<img>",
        c: "<picture>",
        d: "<src>",
        answer: "B",
        category: "easy"
    },
    {
        question: "Which HTML tag creates a hyperlink?",
        a: "<link>",
        b: "<href>",
        c: "<a>",
        d: "<url>",
        answer: "C",
        category: "easy"
    },
    {
        question: "Which CSS property changes text color?",
        a: "font-style",
        b: "text-color",
        c: "background",
        d: "color",
        answer: "D",
        category: "easy"
    },
    {
        question: "Which symbol starts an ID selector in CSS?",
        a: "#",
        b: ".",
        c: "*",
        d: "@",
        answer: "A",
        category: "easy"
    },
    {
        question: "Which HTML tag creates an unordered list?",
        a: "<ol>",
        b: "<ul>",
        c: "<li>",
        d: "<list>",
        answer: "B",
        category: "easy"
    },
    {
        question: "Which language adds interactivity to web pages?",
        a: "HTML",
        b: "CSS",
        c: "JavaScript",
        d: "SQL",
        answer: "C",
        category: "easy"
    },
    {
        question: "Which CSS property changes the background color?",
        a: "background-color",
        b: "font-color",
        c: "text-style",
        d: "border-style",
        answer: "A",
        category: "easy"
    },
    {
        question: "Which HTML tag defines a table row?",
        a: "<td>",
        b: "<th>",
        c: "<table-row>",
        d: "<tr>",
        answer: "D",
        category: "easy"
    },
    {
        question: "Which keyword declares a variable in JavaScript?",
        a: "make",
        b: "let",
        c: "define",
        d: "variable",
        answer: "B",
        category: "easy"
    },
    {
        question: "Which HTML attribute provides alternative text for an image?",
        a: "title",
        b: "src",
        c: "alt",
        d: "href",
        answer: "C",
        category: "easy"
    },

    // MEDIUM - 10 Questions
    {
        question: "Which CSS property makes an element a flex container?",
        a: "position: flex",
        b: "display: flex",
        c: "flex: display",
        d: "layout: flex",
        answer: "B",
        category: "medium"
    },
    {
        question: "Which JavaScript method converts JSON text into an object?",
        a: "JSON.stringify()",
        b: "JSON.convert()",
        c: "JSON.parse()",
        d: "JSON.object()",
        answer: "C",
        category: "medium"
    },
    {
        question: "Which CSS unit is relative to the root element's font size?",
        a: "em",
        b: "px",
        c: "%",
        d: "rem",
        answer: "D",
        category: "medium"
    },
    {
        question: "Which HTML attribute connects a label to a form control?",
        a: "for",
        b: "class",
        c: "name",
        d: "action",
        answer: "A",
        category: "medium"
    },
    {
        question: "Which JavaScript array method creates a new array by transforming elements?",
        a: "push()",
        b: "map()",
        c: "pop()",
        d: "join()",
        answer: "B",
        category: "medium"
    },
    {
        question: "Which CSS rule is used for responsive layouts based on screen size?",
        a: "@font-face",
        b: "@keyframes",
        c: "@media",
        d: "@import",
        answer: "C",
        category: "medium"
    },
    {
        question: "Which JavaScript operator checks value and type equality?",
        a: "==",
        b: "=",
        c: "!=",
        d: "===",
        answer: "D",
        category: "medium"
    },
    {
        question: "Which HTML input type hides the characters entered by a user?",
        a: "password",
        b: "hidden-text",
        c: "secure",
        d: "private",
        answer: "A",
        category: "medium"
    },
    {
        question: "Which CSS property controls the stacking order of positioned elements?",
        a: "order",
        b: "z-index",
        c: "layer",
        d: "stack",
        answer: "B",
        category: "medium"
    },
    {
        question: "Which JavaScript method selects an element by its ID?",
        a: "getElementsByClassName()",
        b: "queryAll()",
        c: "getElementById()",
        d: "getElementByName()",
        answer: "C",
        category: "medium"
    },

    // HARD - 10 Questions
    {
        question: "What does event.preventDefault() do in JavaScript?",
        a: "Deletes the event",
        b: "Stops all JavaScript execution",
        c: "Removes the event listener",
        d: "Prevents the browser's default action",
        answer: "D",
        category: "hard"
    },
    {
        question: "Which CSS feature lets a grid container define named layout areas?",
        a: "grid-template-areas",
        b: "flex-direction",
        c: "text-align",
        d: "position-area",
        answer: "A",
        category: "hard"
    },
    {
        question: "What does Array.filter() return?",
        a: "The first matching element only",
        b: "A new array containing elements that pass the test",
        c: "The number of matching elements",
        d: "The original array sorted",
        answer: "B",
        category: "hard"
    },
    {
        question: "In JavaScript, what does async make a function return?",
        a: "A string",
        b: "An array",
        c: "A Promise",
        d: "A callback only",
        answer: "C",
        category: "hard"
    },
    {
        question: "Which CSS concept generally has the highest priority among these selectors?",
        a: "Element selector",
        b: "Class selector",
        c: "Universal selector",
        d: "ID selector",
        answer: "D",
        category: "hard"
    },
    {
        question: "What does the SQL command COMMIT do?",
        a: "Permanently saves the current transaction's changes",
        b: "Deletes a table",
        c: "Creates a database",
        d: "Reverses the current transaction",
        answer: "A",
        category: "hard"
    },
    {
        question: "Which JavaScript method attaches an event handler without overwriting other listeners?",
        a: "onclick()",
        b: "addEventListener()",
        c: "setEvent()",
        d: "attachStyle()",
        answer: "B",
        category: "hard"
    },
    {
        question: "What does the CSS box-sizing value border-box include in the declared width?",
        a: "Content only",
        b: "Content and margin",
        c: "Content, padding, and border",
        d: "Padding and margin only",
        answer: "C",
        category: "hard"
    },
    {
        question: "Which JavaScript method creates a shallow copy of an array?",
        a: "delete()",
        b: "remove()",
        c: "clear()",
        d: "slice()",
        answer: "D",
        category: "hard"
    },
    {
        question: "What does a SQL LEFT JOIN return?",
        a: "All rows from the left table and matching rows from the right table",
        b: "Only rows that match in both tables",
        c: "All rows from the right table only",
        d: "Only rows with no matches",
        answer: "A",
        category: "hard"
    }
];

const insert = db.prepare(`
    INSERT INTO quiz_questions
    (question, option_a, option_b, option_c, option_d, correct_answer, category)
    VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const addQuestions = db.transaction(() => {
    let added = 0;
    let skipped = 0;

    for (const q of questions) {
        const exists = db.prepare(
            "SELECT id FROM quiz_questions WHERE question = ?"
        ).get(q.question);

        if (exists) {
            skipped++;
            continue;
        }

        insert.run(
            q.question,
            q.a,
            q.b,
            q.c,
            q.d,
            q.answer,
            q.category
        );

        added++;
    }

    return { added, skipped };
});

try {
    const result = addQuestions();

    console.log("\nQuiz questions update successful!");
    console.log("New questions added:", result.added);
    console.log("Duplicate questions skipped:", result.skipped);

    console.log("\nUpdated levels:");
    console.table(
        db.prepare(`
            SELECT category, COUNT(*) AS total
            FROM quiz_questions
            WHERE category IN ('easy', 'medium', 'hard')
            GROUP BY category
        `).all()
    );
} catch (error) {
    console.error("Error adding questions:", error.message);
} finally {
    db.close();
}