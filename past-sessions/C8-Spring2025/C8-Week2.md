# Week 2: Introduction to CSS Syntax and Selectors

Welcome to Week 2 of the Intro to Web Development course! This week, we’ll be diving into **CSS** (Cascading Style Sheets) and exploring how to style and design HTML pages.

## Overview:
In this lecture, we’ll cover the fundamental aspects of CSS, including:
- **CSS Syntax and Structure**
- **CSS Selectors**
- **Styling Text, Backgrounds, and Borders**
- **Using Colors and Fonts**
- **Basic Layout Styling**

CSS is essential for styling HTML elements and making websites visually appealing and user-friendly.

## Real-World Relevance:
- CSS plays a major role in shaping the look and feel of websites and apps.
- Modern websites rely on CSS to create engaging, dynamic, and aesthetically pleasing designs.
- **Example:** View the before and after comparison of a webpage styled with CSS to see the significant impact it has on the layout and design.

## Key Concepts Covered:
- **CSS Syntax and Structure**  
- **CSS Selectors**  
- **Styling Text, Backgrounds, and Borders**  
- **Using Colors and Fonts**  
- **Basic Layout Styling**

---

## What is CSS?
- **Definition:** Cascading Style Sheets (CSS) is used to style and format the layout of a web page.
- **Separation of Concerns:** HTML structures the content, while CSS controls the presentation (i.e., how things look).

---

## CSS Syntax and Structure

### Basic CSS Syntax:
```css
selector {
    property: value;
}
```
- **Selector**: The HTML element to style (e.g., `h1`, `p`, `div`).
- **Property**: The style to apply (e.g., `color`, `font-size`, `background-color`).
- **Value**: The value for the property (e.g., `red`, `16px`, `#000000`).

Example:
```css
h1 {
    color: red;
    font-size: 32px;
}
```

---

## CSS Selectors

### What are Selectors?
CSS Selectors target specific HTML elements to apply styles.

### Types of Selectors:
1. **Element Selector:** Targets all elements of a given type (e.g., `p`, `h1`).
2. **Class Selector:** Targets elements with a specific class (e.g., `.class-name`).
3. **ID Selector:** Targets elements with a specific ID (e.g., `#id-name`).
4. **Universal Selector:** Targets all elements on the page (`*`).
5. **Group Selector:** Targets multiple selectors at once (e.g., `h1, p { ... }`).

---

## Styling Text in CSS

### Text Styling Properties:
- `color`: Sets the text color.
- `font-family`: Specifies the font type.
- `font-size`: Controls the size of the text.
- `line-height`: Adjusts the space between lines of text.
- `text-align`: Aligns the text (left, right, center, justify).

---

## Styling Backgrounds in CSS

### Background Styling Properties:
- `background-color`: Sets the background color.
- `background-image`: Sets an image as the background.
- `background-size`: Controls the size of the background image.
- `background-repeat`: Controls if the background image repeats.

---

## Styling Borders in CSS

### Border Styling Properties:
- `border-width`: Sets the width of the border.
- `border-style`: Specifies the style of the border (e.g., `solid`, `dashed`).
- `border-color`: Sets the color of the border.
- `border-radius`: Rounds the corners of an element.

---

## Using Colors and Fonts

### Color Methods:
- Named Colors: e.g., `red`, `blue`, `green`
- Hexadecimal: e.g., `#ff5733`
- RGB: e.g., `rgb(255, 87, 51)`
- RGBA (with transparency): e.g., `rgba(255, 87, 51, 0.5)`

### Font Methods:
- `font-family`: Specifies the font type.
- `font-weight`: Controls the thickness of the font.
- `font-style`: Specifies whether the font is italic or normal.

---

## Basic Layout Styling

### Box Model:
Every element is a "box" in CSS, consisting of:
- **Content**
- **Padding**
- **Border**
- **Margin**

### Layout Properties:
- `width`, `height`, `margin`, `padding`, `display`, `position`, `float`, and `clear`.

---

## Summary of Key Points

### Recap:
- CSS is used to style HTML elements, improving the user experience by making websites more attractive and functional.
- Key properties include text, background, borders, and layout styling.
- Selectors help target HTML elements, giving you precise control over your design.

### Takeaways:
- Understand CSS syntax and structure.
- Use selectors effectively to target HTML elements.
- Style elements such as text, backgrounds, borders, and layout.

---

## Coding Lab

### Objective:
Students will apply CSS concepts by styling an HTML page.

### Project Goal:
Style a webpage with custom colors, fonts, and layout.

### Skills Covered:
- CSS Selectors
- Styling Text, Backgrounds, Borders, and Layout

---

## Setting Up the Development Environment

1. Open the `index.html` file with the starter code.
2. Create a new file named `styles.css` in the same directory.
3. Link `styles.css` to `index.html` by adding the following inside the `<head>` section:
```html
<link rel="stylesheet" href="styles.css">
```

### Tasks:
- Add styles to the `h1` element.
- Style paragraphs with font size, line height, and color.
- Create a two-column layout using the `float` property.

---

## Debugging and Troubleshooting

### Common Issues:
- Incorrect or missing file links for CSS.
- CSS not being applied due to syntax errors.
- Layout issues caused by improper usage of the box model or float properties.

### Solution:
Use the browser’s **Inspect tool** to check applied styles and troubleshoot issues.

---

## Code Review

We'll go over the lab work, ensuring all elements are styled correctly. We’ll also discuss best practices for writing clean, efficient, and readable CSS code.

---

## Finalizing the Project

### Goal:
- Refine the layout, add margins, padding, and adjust font sizes.
- Experiment with different font families and background images to improve the design.

### Challenge:
- Try experimenting with your design to customize it further.

---

## Q & A Session
Feel free to bring any questions you have to the session.

---

## Resources:
- **GitHub**: [CODE-CRUNCH-WEB-DEV](https://github.com/CODE-CRUNCH-CLUB/C8-CRUNCH-LABS-WEB-DEV)
- **Schedule**: Check the schedule on Discord in the “Schedule” Channel.
- **RSVP**: [RSVP for upcoming sessions](https://lu.ma/CODECRUNCH)
- **Feedback**: We’d love your feedback to help us improve. [Submit feedback here](https://go.fiu.edu/codecrunch)
- **Website**: [go.fiu.edu/codecrunch](https://go.fiu.edu/codecrunch)
- **Linktr.ee**: [CODE.CRUNCH](https://linktr.ee/CODE.CRUNCH)

Looking forward to seeing you in the next session!
