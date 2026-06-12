# Week 1: Understanding HTML Elements and Attributes 🌍

Welcome to Week 1 of the *Introduction to Web Development* course! In this session, we will dive deeper into the structure of HTML and learn how to use different HTML elements and attributes to build your first web pages.

---

## RECAP: Introduction to HTML 📚

### Overview:
- **HTML (Hypertext Markup Language)** is the foundation of web development. It’s used to structure content on the web.
- **Real-World Relevance**: Every website relies on HTML to present text, images, links, and more. It's a key technology along with CSS and JavaScript.
- **Example**: Imagine a simple news website — HTML is responsible for structuring the content like articles, images, and links.

### Key Concepts for Today’s Lecture 💡
1. **HTML Elements and Tags**  
2. **HTML Attributes**  
3. **Semantic HTML**  
4. **Accessibility Best Practices**  
5. **Common HTML Tags** (Headings, Paragraphs, Links, Lists, Images)

---

## What is HTML? 📝

- **HTML** is a markup language used to structure content on the web.
- **Structure of an HTML document**: 
  - **DOCTYPE**: Specifies the HTML version (e.g., HTML5).
  - **HTML Element**: The root element that wraps the entire content.
  - **Head and Body**: The `<head>` contains metadata, and the `<body>` contains the visible content of the page.

### Example of a simple HTML structure:
```html
<!DOCTYPE html>
<html>
  <head>
    <title>My First Web Page</title>
  </head>
  <body>
    <h1>Welcome to my webpage!</h1>
    <p>This is my first webpage.</p>
  </body>
</html>
```

---

## Lesson: HTML Elements and Tags 🏗️

### What is an HTML Element?
- An **HTML element** consists of an opening tag, content, and a closing tag.
- **Structure**: `<tagname>content</tagname>`
- **Example**: `<h1>Hello, World!</h1>`

**Visual Breakdown**:
- `<` = Opening tag
- `h1` = Tag name
- `>` = Closing tag
- `content` = Actual text (e.g., "Hello, World!")
- `</h1>` = Closing tag

---

## HTML Attributes 🔑

### What are HTML Attributes?
- Attributes provide additional information about an element.
- They are added to the opening tag and consist of a **name** and **value**.

### Common HTML Attributes:
- `href`, `src`, `alt`, `class`, `id`, `style`

**Examples**:
- Anchor Tag: `<a href="https://www.example.com">Click here</a>`
- Image Tag: `<img src="image.jpg" alt="A sample image">`

---

## Semantic HTML 🧠

### What is Semantic HTML?
- **Semantic HTML** uses elements that convey meaning about the content they contain, rather than just for styling purposes.
  
**Why it's important**:
- Improves **accessibility** for screen readers.
- Enhances **SEO** (Search Engine Optimization).
- Makes the code easier to read and maintain.

**Examples of Semantic Tags**:
- `<header>`, `<footer>`, `<article>`, `<section>`, `<nav>`

---

## Accessibility Best Practices ♿

### Why is Accessibility Important?
- **Accessibility** ensures that all users, including those with disabilities, can navigate and interact with the website.

### Best Practices:
- Use **semantic HTML** to help screen readers interpret content.
- Provide **alt text** for images: `<img src="image.jpg" alt="Description of image">`.
- Ensure good **color contrast** for readability.
- Use headings (`<h1>`, `<h2>`, etc.) in a logical order for structure.

### Real-World Example:
- Show a webpage with and without **alt text** on images to emphasize the difference for accessibility.

---

## Common HTML Tags 🏷️

- **Headings**: `<h1>` to `<h6>` tags for creating headings of different levels.
- **Paragraphs**: `<p>` tag to define paragraphs of text.
- **Links**: `<a href="url">link text</a>` to create hyperlinks.
- **Lists**: Unordered (`<ul>`) and ordered (`<ol>`) lists with list items (`<li>`).
- **Images**: `<img src="image.jpg" alt="Description">` to add images.

---

## Summary of Key Points 📝

- HTML provides the **structure** for a webpage.
- Elements consist of **tags**, **content**, and **attributes**.
- **Semantic HTML** improves accessibility and SEO.
- Following **best practices** ensures better usability and inclusivity.

---

## Coding Lab 🖥️

### Introduction to the Coding Lab:
- **Objective**: Apply HTML concepts by creating your own webpage.
- **Project Goal**: Build a personal webpage with headings, paragraphs, links, and images.
- **Skills Covered**: HTML structure, use of common tags, semantic HTML, and basic accessibility practices.

---

### Setting Up the Development Environment 🔧
1. Install and set up a code editor (e.g., VS Code, Sublime Text).
2. Create a folder called `html_basics_lab`, then create a file named `index.html` inside it.
3. Open the `index.html` file in your code editor and start writing HTML.

---

### Writing the First Line of Code 📝
- **Task**: Add a heading and a paragraph to the page.
- **Task**: Add an image using the `<img>` tag.
- **Task**: Add a link to another website.
- **Challenge**: Make the link open in a new tab using the `target="_blank"` attribute.
- **Task**: Add an unordered list (`<ul>`) and an ordered list (`<ol>`).

---

## Debugging and Troubleshooting ⚠️

### Common Issues:
- Missing **closing tags** (e.g., `</img>`).
- Incorrect **file paths** for images or links.
- **HTML structure errors** (e.g., forgetting to wrap content in the `<body>`).

### Solution:
- Use **browser developer tools** (Inspect) to identify errors.

---

## Code Review 🔍

### Walkthrough:
- Review the code written so far, ensuring all elements are properly structured.
- Emphasize **clear**, **readable** code and the use of **semantic tags**.

---

## Finalizing the Project ✔️

- **Goal**: Finalize the webpage with added elements like multiple paragraphs, a list, and at least one image.
- **Test**: Preview the HTML file in a browser.
- **Challenge**: Add a **footer** with your name and contact information.

---

## Q & A Session ❓

- [GitHub Repository](https://github.com/)
- **Attendance**: Join us for the next sessions.
- **RSVP**: [lu.ma/CODECRUNCH](https://lu.ma/CODECRUNCH)
- **Feedback**: Your feedback helps us improve. Share your thoughts!

For more details and updates, visit our website: [go.fiu.edu/codecrunch](https://go.fiu.edu/codecrunch) and check out our [Linktree](https://linktr.ee/CODE.CRUNCH).
