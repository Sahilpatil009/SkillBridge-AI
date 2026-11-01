"""
Seed script: 48 MCQ questions (12 Python, 12 JavaScript, 12 SQL, 12 React).
Upserts by question text. Safe to run multiple times.
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.db.base import SessionLocal
from app.models.skill import Skill, SkillTopic
from app.models.assessment import Question, QuestionOption


def get_skill(db, slug):
    skill = db.query(Skill).filter(Skill.slug == slug).first()
    if not skill:
        raise ValueError(f"Skill with slug '{slug}' not found. Run the skills seed first.")
    return skill


def get_topic(db, skill_id, name):
    topic = db.query(SkillTopic).filter(SkillTopic.skill_id == skill_id, SkillTopic.name == name).first()
    return topic


def upsert_question(db, skill_id, topic_id, text, difficulty, explanation, options):
    q = db.query(Question).filter(Question.text == text, Question.skill_id == skill_id).first()
    if not q:
        q = Question(
            skill_id=skill_id,
            topic_id=topic_id,
            text=text,
            difficulty=difficulty,
            explanation=explanation,
            is_active=True,
        )
        db.add(q)
        db.flush()
    else:
        q.topic_id = topic_id
        q.difficulty = difficulty
        q.explanation = explanation
        # Remove old options
        for opt in q.options:
            db.delete(opt)
        db.flush()

    for idx, (opt_text, is_correct) in enumerate(options):
        db.add(QuestionOption(
            question_id=q.id,
            text=opt_text,
            is_correct=is_correct,
            order_index=idx,
        ))
    return q


def seed():
    db = SessionLocal()
    try:
        # ── PYTHON ──────────────────────────────────────────────────────────────
        py = get_skill(db, "python")
        py_id = py.id

        # Topic lookup helpers (may be None if topics not seeded)
        py_basics = get_topic(db, py_id, "Basics")
        py_oop = get_topic(db, py_id, "OOP")
        py_advanced = get_topic(db, py_id, "Advanced")

        python_questions = [
            {
                "text": "What is the output of print(type([]))?",
                "difficulty": "basic",
                "explanation": "[] creates an empty list, so type([]) returns <class 'list'>.",
                "topic": py_basics,
                "options": [
                    ("<class 'list'>", True),
                    ("<class 'tuple'>", False),
                    ("<class 'dict'>", False),
                    ("<class 'set'>", False),
                ],
            },
            {
                "text": "Which method adds an element to the end of a list?",
                "difficulty": "basic",
                "explanation": "list.append(x) adds x to the end of the list in-place.",
                "topic": py_basics,
                "options": [
                    ("append()", True),
                    ("add()", False),
                    ("push()", False),
                    ("insert()", False),
                ],
            },
            {
                "text": "What does *args do in a function definition?",
                "difficulty": "intermediate",
                "explanation": "*args collects all extra positional arguments passed to a function into a tuple.",
                "topic": py_basics,
                "options": [
                    ("Allows variable number of positional arguments", True),
                    ("Allows variable number of keyword arguments", False),
                    ("Unpacks a list into function arguments", False),
                    ("Creates a pointer to the arguments", False),
                ],
            },
            {
                "text": "What is a list comprehension?",
                "difficulty": "basic",
                "explanation": "List comprehensions provide a concise syntax: [expr for item in iterable if condition].",
                "topic": py_basics,
                "options": [
                    ("A concise way to create lists using an expression", True),
                    ("A method to compress list memory usage", False),
                    ("A built-in function that filters a list", False),
                    ("A way to sort a list in-place", False),
                ],
            },
            {
                "text": "What is the GIL in Python?",
                "difficulty": "advanced",
                "explanation": "The Global Interpreter Lock (GIL) is a mutex that protects access to Python objects, preventing multiple threads from executing Python bytecode simultaneously.",
                "topic": py_advanced,
                "options": [
                    ("Global Interpreter Lock that limits true multi-threading", True),
                    ("A garbage collection mechanism", False),
                    ("A tool for compiling Python to C", False),
                    ("A type of Python import system", False),
                ],
            },
            {
                "text": "What does the yield keyword do in Python?",
                "difficulty": "intermediate",
                "explanation": "yield turns a function into a generator. Each call to next() resumes execution and returns the next yielded value.",
                "topic": py_advanced,
                "options": [
                    ("Makes a function a generator that returns values lazily", True),
                    ("Returns the final value from a function", False),
                    ("Pauses a thread for a given time", False),
                    ("Raises a StopIteration exception", False),
                ],
            },
            {
                "text": "What is the difference between is and == in Python?",
                "difficulty": "intermediate",
                "explanation": "== checks value equality; is checks object identity (same memory address).",
                "topic": py_basics,
                "options": [
                    ("is checks identity, == checks equality of values", True),
                    ("They are identical in behaviour", False),
                    ("is checks type, == checks value", False),
                    ("== checks identity, is checks value", False),
                ],
            },
            {
                "text": "What is a Python decorator?",
                "difficulty": "intermediate",
                "explanation": "A decorator is a function that takes another function as argument and extends its behaviour without modifying it directly.",
                "topic": py_advanced,
                "options": [
                    ("A function that wraps another function to extend its behaviour", True),
                    ("A class attribute used for styling", False),
                    ("A built-in that converts a class to a function", False),
                    ("A special comment syntax for documentation", False),
                ],
            },
            {
                "text": "How do you handle exceptions in Python?",
                "difficulty": "basic",
                "explanation": "Python uses try/except blocks to catch and handle exceptions gracefully.",
                "topic": py_basics,
                "options": [
                    ("Using try/except blocks", True),
                    ("Using if/catch blocks", False),
                    ("Using handle/error blocks", False),
                    ("Using begin/rescue blocks", False),
                ],
            },
            {
                "text": "What does __init__ do in a Python class?",
                "difficulty": "basic",
                "explanation": "__init__ is the constructor method called automatically when a new instance of a class is created.",
                "topic": py_oop,
                "options": [
                    ("Initialises a new instance of the class", True),
                    ("Destroys an instance of the class", False),
                    ("Defines class-level variables only", False),
                    ("Imports the class dependencies", False),
                ],
            },
            {
                "text": "What is a lambda function in Python?",
                "difficulty": "intermediate",
                "explanation": "A lambda is an anonymous inline function defined with the lambda keyword: lambda args: expression.",
                "topic": py_basics,
                "options": [
                    ("An anonymous function defined with a single expression", True),
                    ("A function that runs in parallel", False),
                    ("A function decorator", False),
                    ("A compiled C extension function", False),
                ],
            },
            {
                "text": "What does enumerate() do?",
                "difficulty": "intermediate",
                "explanation": "enumerate(iterable) returns an iterator of (index, value) pairs, letting you loop with an automatic counter.",
                "topic": py_basics,
                "options": [
                    ("Returns an iterator of index-value pairs", True),
                    ("Returns the length of an iterable", False),
                    ("Sorts an iterable with numbered keys", False),
                    ("Converts a list to a numbered dictionary", False),
                ],
            },
        ]

        for q_data in python_questions:
            upsert_question(
                db,
                skill_id=py_id,
                topic_id=q_data["topic"].id if q_data["topic"] else None,
                text=q_data["text"],
                difficulty=q_data["difficulty"],
                explanation=q_data["explanation"],
                options=q_data["options"],
            )

        # ── JAVASCRIPT ───────────────────────────────────────────────────────────
        js = get_skill(db, "javascript")
        js_id = js.id

        js_basics = get_topic(db, js_id, "Basics")
        js_async = get_topic(db, js_id, "Async")
        js_advanced = get_topic(db, js_id, "Advanced")

        javascript_questions = [
            {
                "text": "What does === check in JavaScript?",
                "difficulty": "basic",
                "explanation": "=== is the strict equality operator; it checks both value and type without type coercion.",
                "topic": js_basics,
                "options": [
                    ("Strict equality: same value and same type", True),
                    ("Loose equality: same value after type coercion", False),
                    ("Reference equality only", False),
                    ("Type equality only", False),
                ],
            },
            {
                "text": "What is a Promise in JavaScript?",
                "difficulty": "intermediate",
                "explanation": "A Promise is an object representing the eventual completion or failure of an asynchronous operation and its resulting value.",
                "topic": js_async,
                "options": [
                    ("An object representing eventual completion or failure of an async operation", True),
                    ("A synchronous function that returns a value", False),
                    ("A special type of callback function", False),
                    ("A built-in HTTP request handler", False),
                ],
            },
            {
                "text": "What does typeof null return?",
                "difficulty": "intermediate",
                "explanation": "This is a historical bug in JavaScript: typeof null returns 'object' even though null is not an object.",
                "topic": js_basics,
                "options": [
                    ('"object"', True),
                    ('"null"', False),
                    ('"undefined"', False),
                    ('"boolean"', False),
                ],
            },
            {
                "text": "What is event bubbling?",
                "difficulty": "intermediate",
                "explanation": "Event bubbling means that when an event fires on a child element, it propagates (bubbles) up through all ancestor elements.",
                "topic": js_advanced,
                "options": [
                    ("Events propagate from the child element up to the parent", True),
                    ("Events propagate from the parent element down to the child", False),
                    ("Events are duplicated to all sibling elements", False),
                    ("Events are cancelled after first handler runs", False),
                ],
            },
            {
                "text": "How does let differ from var?",
                "difficulty": "basic",
                "explanation": "let is block-scoped (limited to the enclosing {}), while var is function-scoped and hoisted to the function top.",
                "topic": js_basics,
                "options": [
                    ("let is block-scoped, var is function-scoped", True),
                    ("let is function-scoped, var is block-scoped", False),
                    ("They are identical in modern JavaScript", False),
                    ("let is globally scoped, var is locally scoped", False),
                ],
            },
            {
                "text": "What is a closure?",
                "difficulty": "advanced",
                "explanation": "A closure is a function that remembers and can access variables from its outer (enclosing) scope even after the outer function has returned.",
                "topic": js_advanced,
                "options": [
                    ("A function that retains access to variables from its outer scope", True),
                    ("A way to close a browser window via JavaScript", False),
                    ("A method to seal an object from modification", False),
                    ("A technique to terminate a loop early", False),
                ],
            },
            {
                "text": "What does Array.map() return?",
                "difficulty": "basic",
                "explanation": "Array.map() creates and returns a new array populated with the results of calling the callback on every element.",
                "topic": js_basics,
                "options": [
                    ("A new array with each element transformed by the callback", True),
                    ("The original array modified in place", False),
                    ("A boolean indicating if all elements matched", False),
                    ("The index of the first matching element", False),
                ],
            },
            {
                "text": "What is async/await?",
                "difficulty": "intermediate",
                "explanation": "async/await is syntactic sugar built on top of Promises that makes asynchronous code easier to write and read in a synchronous style.",
                "topic": js_async,
                "options": [
                    ("Syntactic sugar over Promises for writing cleaner async code", True),
                    ("A new threading model for JavaScript", False),
                    ("A replacement for callback functions that removes Promises", False),
                    ("A built-in timer function", False),
                ],
            },
            {
                "text": "What is the event loop?",
                "difficulty": "advanced",
                "explanation": "The event loop continuously checks the call stack and the callback queue. When the call stack is empty, it pushes the first queued callback onto the stack.",
                "topic": js_advanced,
                "options": [
                    ("A mechanism that handles asynchronous operations in the JS runtime", True),
                    ("A loop that iterates over DOM events", False),
                    ("A built-in method to create infinite loops", False),
                    ("The main rendering loop of a browser", False),
                ],
            },
            {
                "text": "What does JSON.stringify() do?",
                "difficulty": "basic",
                "explanation": "JSON.stringify() serialises a JavaScript value (object, array, etc.) into a JSON-formatted string.",
                "topic": js_basics,
                "options": [
                    ("Converts a JavaScript object to a JSON string", True),
                    ("Parses a JSON string into a JavaScript object", False),
                    ("Validates whether a string is valid JSON", False),
                    ("Compresses a JavaScript object for storage", False),
                ],
            },
            {
                "text": "What is destructuring in JavaScript?",
                "difficulty": "intermediate",
                "explanation": "Destructuring assignment lets you unpack values from arrays or properties from objects into distinct variables using a concise syntax.",
                "topic": js_basics,
                "options": [
                    ("Extracting values from arrays or objects into variables", True),
                    ("Deleting properties from an object", False),
                    ("Converting an object to a primitive value", False),
                    ("Cloning an array or object deeply", False),
                ],
            },
            {
                "text": "What does the spread operator (...) do?",
                "difficulty": "intermediate",
                "explanation": "The spread operator expands an iterable (array, string, etc.) into individual elements, useful in function calls, array literals, and object literals.",
                "topic": js_basics,
                "options": [
                    ("Expands an iterable into individual elements", True),
                    ("Merges two functions into one", False),
                    ("Collects remaining arguments into an array", False),
                    ("Creates a deep copy of an object", False),
                ],
            },
        ]

        for q_data in javascript_questions:
            upsert_question(
                db,
                skill_id=js_id,
                topic_id=q_data["topic"].id if q_data["topic"] else None,
                text=q_data["text"],
                difficulty=q_data["difficulty"],
                explanation=q_data["explanation"],
                options=q_data["options"],
            )

        # ── SQL ──────────────────────────────────────────────────────────────────
        sql = get_skill(db, "sql")
        sql_id = sql.id

        sql_basics = get_topic(db, sql_id, "Basics")
        sql_joins = get_topic(db, sql_id, "Joins")
        sql_advanced = get_topic(db, sql_id, "Advanced")

        sql_questions = [
            {
                "text": "What does SELECT * FROM users do?",
                "difficulty": "basic",
                "explanation": "SELECT * retrieves all columns; FROM users specifies the table. The query returns every column and every row in the users table.",
                "topic": sql_basics,
                "options": [
                    ("Returns all columns and rows from the users table", True),
                    ("Returns only the first row of the users table", False),
                    ("Deletes all rows from the users table", False),
                    ("Updates all rows in the users table", False),
                ],
            },
            {
                "text": "What is a PRIMARY KEY?",
                "difficulty": "basic",
                "explanation": "A PRIMARY KEY is a column (or set of columns) that uniquely identifies each row in a table. It enforces uniqueness and cannot be NULL.",
                "topic": sql_basics,
                "options": [
                    ("A column that uniquely identifies each row in a table", True),
                    ("A column used only for sorting query results", False),
                    ("The first column defined in any table", False),
                    ("A foreign reference to another table's row", False),
                ],
            },
            {
                "text": "What is an INNER JOIN?",
                "difficulty": "intermediate",
                "explanation": "INNER JOIN returns only the rows where there is a matching value in both joined tables based on the join condition.",
                "topic": sql_joins,
                "options": [
                    ("Returns rows that have matching values in both tables", True),
                    ("Returns all rows from the left table plus matches from the right", False),
                    ("Returns all rows from both tables regardless of matches", False),
                    ("Returns rows only from the right table", False),
                ],
            },
            {
                "text": "What does GROUP BY do?",
                "difficulty": "intermediate",
                "explanation": "GROUP BY groups rows sharing the same values in the specified columns so that aggregate functions (COUNT, SUM, AVG, etc.) can be applied to each group.",
                "topic": sql_advanced,
                "options": [
                    ("Groups rows with the same values for aggregation functions", True),
                    ("Sorts the result set by a specified column", False),
                    ("Filters rows before aggregation", False),
                    ("Combines results from two SELECT statements", False),
                ],
            },
            {
                "text": "What is a FOREIGN KEY?",
                "difficulty": "intermediate",
                "explanation": "A FOREIGN KEY is a column that creates a referential link to the PRIMARY KEY of another table, enforcing referential integrity.",
                "topic": sql_basics,
                "options": [
                    ("A column that references the primary key of another table", True),
                    ("A secondary unique identifier within the same table", False),
                    ("An encrypted key used for secure queries", False),
                    ("A key that spans multiple tables simultaneously", False),
                ],
            },
            {
                "text": "What does DISTINCT do in SQL?",
                "difficulty": "basic",
                "explanation": "SELECT DISTINCT removes duplicate rows from the result set, returning only unique combinations of the selected columns.",
                "topic": sql_basics,
                "options": [
                    ("Returns only unique values, removing duplicates", True),
                    ("Sorts values in descending order", False),
                    ("Filters rows based on a condition", False),
                    ("Returns rows that do not match a pattern", False),
                ],
            },
            {
                "text": "What is a subquery?",
                "difficulty": "advanced",
                "explanation": "A subquery (inner query) is a SELECT statement nested inside another SQL query. It runs first and its result is used by the outer query.",
                "topic": sql_advanced,
                "options": [
                    ("A query nested inside another SQL query", True),
                    ("A stored procedure that returns a single value", False),
                    ("A query that joins more than three tables", False),
                    ("A partitioned view of a large table", False),
                ],
            },
            {
                "text": "How does HAVING differ from WHERE?",
                "difficulty": "advanced",
                "explanation": "WHERE filters individual rows before grouping; HAVING filters groups after GROUP BY has been applied and can use aggregate functions.",
                "topic": sql_advanced,
                "options": [
                    ("HAVING filters aggregated results; WHERE filters individual rows", True),
                    ("WHERE filters aggregated results; HAVING filters individual rows", False),
                    ("They are interchangeable in all contexts", False),
                    ("HAVING works only with JOIN operations", False),
                ],
            },
            {
                "text": "What is an INDEX in a database?",
                "difficulty": "intermediate",
                "explanation": "An index is a data structure (often a B-tree) that the database engine uses to find rows faster without scanning the entire table.",
                "topic": sql_advanced,
                "options": [
                    ("A data structure that speeds up query lookups", True),
                    ("A constraint that prevents duplicate values", False),
                    ("A backup copy of a table", False),
                    ("A view that caches query results", False),
                ],
            },
            {
                "text": "What does COUNT(*) return?",
                "difficulty": "basic",
                "explanation": "COUNT(*) counts all rows in the result set, including those with NULL values in any column.",
                "topic": sql_basics,
                "options": [
                    ("The total number of rows in the result set", True),
                    ("The number of non-NULL values in a specific column", False),
                    ("The sum of all numeric column values", False),
                    ("The number of distinct values in the table", False),
                ],
            },
            {
                "text": "What is a LEFT JOIN?",
                "difficulty": "intermediate",
                "explanation": "A LEFT JOIN returns all rows from the left table. For rows with no match in the right table, columns from the right table are filled with NULL.",
                "topic": sql_joins,
                "options": [
                    ("Returns all rows from the left table and matching rows from the right", True),
                    ("Returns only matching rows from both tables", False),
                    ("Returns all rows from the right table and matching rows from the left", False),
                    ("Returns all rows from both tables with no filtering", False),
                ],
            },
            {
                "text": "What is NULL in SQL?",
                "difficulty": "basic",
                "explanation": "NULL represents missing, unknown, or inapplicable data. It is not the same as zero or an empty string, and comparisons with NULL require IS NULL or IS NOT NULL.",
                "topic": sql_basics,
                "options": [
                    ("A marker representing missing or unknown data", True),
                    ("The integer value zero stored in a column", False),
                    ("An empty string stored in a text column", False),
                    ("A deleted row placeholder", False),
                ],
            },
        ]

        for q_data in sql_questions:
            upsert_question(
                db,
                skill_id=sql_id,
                topic_id=q_data["topic"].id if q_data["topic"] else None,
                text=q_data["text"],
                difficulty=q_data["difficulty"],
                explanation=q_data["explanation"],
                options=q_data["options"],
            )

        # ── REACT ────────────────────────────────────────────────────────────────
        react = get_skill(db, "react")
        react_id = react.id

        react_basics = get_topic(db, react_id, "Basics")
        react_hooks = get_topic(db, react_id, "Hooks")
        react_advanced = get_topic(db, react_id, "Advanced")

        react_questions = [
            {
                "text": "What is JSX?",
                "difficulty": "basic",
                "explanation": "JSX is a syntax extension for JavaScript that lets you write HTML-like markup inside JavaScript files. Babel transforms it into React.createElement() calls.",
                "topic": react_basics,
                "options": [
                    ("A syntax extension for JavaScript that looks like HTML", True),
                    ("A JavaScript XML parser library", False),
                    ("A templating engine separate from JavaScript", False),
                    ("A CSS preprocessor used with React", False),
                ],
            },
            {
                "text": "What does useState return?",
                "difficulty": "basic",
                "explanation": "useState returns an array of exactly two elements: the current state value and a setter function to update it.",
                "topic": react_hooks,
                "options": [
                    ("An array with the current state value and a setter function", True),
                    ("The current state value only", False),
                    ("An object with get and set methods", False),
                    ("A Promise that resolves to the state value", False),
                ],
            },
            {
                "text": "What is a React hook?",
                "difficulty": "intermediate",
                "explanation": "Hooks are special functions (prefixed with 'use') that let you tap into React state and lifecycle features from functional components without writing a class.",
                "topic": react_hooks,
                "options": [
                    ("A function that lets you use state and lifecycle features in functional components", True),
                    ("A lifecycle method available only in class components", False),
                    ("A way to attach event listeners to DOM elements", False),
                    ("A plugin system for extending React's renderer", False),
                ],
            },
            {
                "text": "When does useEffect run?",
                "difficulty": "intermediate",
                "explanation": "useEffect runs after the component renders. If a dependency array is provided, it re-runs whenever any dependency value changes; with [], it runs only once after mount.",
                "topic": react_hooks,
                "options": [
                    ("After every render, and when its dependency array values change", True),
                    ("Only once before the component first renders", False),
                    ("Before every render cycle", False),
                    ("Only when the component unmounts", False),
                ],
            },
            {
                "text": "What is the virtual DOM?",
                "difficulty": "intermediate",
                "explanation": "The virtual DOM is an in-memory JavaScript representation of the real DOM. React diffs the new virtual DOM against the previous one and applies only the minimal set of real DOM changes.",
                "topic": react_basics,
                "options": [
                    ("A lightweight in-memory copy of the real DOM used for efficient diffing", True),
                    ("A browser API for fast DOM manipulation", False),
                    ("A Shadow DOM implementation unique to React", False),
                    ("A server-side rendering cache of HTML", False),
                ],
            },
            {
                "text": "What are props in React?",
                "difficulty": "basic",
                "explanation": "Props (short for properties) are read-only inputs passed from a parent component to a child component to customise its appearance or behaviour.",
                "topic": react_basics,
                "options": [
                    ("Read-only data passed from a parent component to a child", True),
                    ("Mutable state values stored inside a component", False),
                    ("CSS class names applied to React elements", False),
                    ("References to DOM nodes created by useRef", False),
                ],
            },
            {
                "text": "What does the key prop do in lists?",
                "difficulty": "intermediate",
                "explanation": "The key prop is a special string attribute that helps React identify which list items have changed, been added, or removed, enabling efficient reconciliation.",
                "topic": react_basics,
                "options": [
                    ("Helps React identify which items changed, were added, or removed", True),
                    ("Sets the tab order for keyboard navigation", False),
                    ("Provides a CSS selector for the element", False),
                    ("Binds a keyboard shortcut to the element", False),
                ],
            },
            {
                "text": "What is React Context?",
                "difficulty": "intermediate",
                "explanation": "React Context provides a way to pass data through the component tree without having to pass props manually at every level (avoids 'prop drilling').",
                "topic": react_advanced,
                "options": [
                    ("A way to share state across components without passing props manually", True),
                    ("A built-in database for storing component state", False),
                    ("A higher-order component that wraps the entire app", False),
                    ("A tool for managing side effects globally", False),
                ],
            },
            {
                "text": "What is a controlled component?",
                "difficulty": "intermediate",
                "explanation": "A controlled component is a form element (input, textarea, select) whose value is driven by React state, making React the single source of truth.",
                "topic": react_basics,
                "options": [
                    ("A form element whose value is controlled by React state", True),
                    ("A component that cannot be updated after mounting", False),
                    ("A component wrapped by React.memo", False),
                    ("A component that controls its child component's rendering", False),
                ],
            },
            {
                "text": "What does useCallback do?",
                "difficulty": "advanced",
                "explanation": "useCallback returns a memoised version of the callback that only changes if one of the dependencies changes, preventing unnecessary re-creation of functions on each render.",
                "topic": react_hooks,
                "options": [
                    ("Memoises a function to prevent recreation on every render", True),
                    ("Runs a callback after every render", False),
                    ("Cancels a previously scheduled callback", False),
                    ("Converts a class method into a functional hook", False),
                ],
            },
            {
                "text": "What is code splitting in React?",
                "difficulty": "advanced",
                "explanation": "Code splitting breaks the application bundle into smaller chunks that are loaded on demand (lazy loading), reducing the initial load time.",
                "topic": react_advanced,
                "options": [
                    ("Breaking the app bundle into smaller chunks loaded on demand", True),
                    ("Separating CSS from JavaScript in a React project", False),
                    ("Dividing a component into multiple smaller components", False),
                    ("Running different React versions in parallel", False),
                ],
            },
            {
                "text": "What is React.memo?",
                "difficulty": "advanced",
                "explanation": "React.memo is a higher-order component that memoises the rendered output of a functional component. It skips re-rendering if the props have not changed (shallow comparison).",
                "topic": react_advanced,
                "options": [
                    ("A higher-order component that prevents re-renders when props have not changed", True),
                    ("A hook for memoising expensive computed values", False),
                    ("A built-in React caching layer for API responses", False),
                    ("A way to create singleton component instances", False),
                ],
            },
        ]

        for q_data in react_questions:
            upsert_question(
                db,
                skill_id=react_id,
                topic_id=q_data["topic"].id if q_data["topic"] else None,
                text=q_data["text"],
                difficulty=q_data["difficulty"],
                explanation=q_data["explanation"],
                options=q_data["options"],
            )

        db.commit()
        print("Seed complete: 48 questions inserted/updated across Python, JavaScript, SQL, React.")
    except Exception as e:
        db.rollback()
        print(f"Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
