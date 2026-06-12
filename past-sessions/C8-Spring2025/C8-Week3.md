# Week 3 - Understanding the Box Model and Building Responsive Layouts

Welcome to Week 3 of the Intro to Web Development Course! In this week's session, we will dive deep into understanding the **CSS Box Model** and learn how to build responsive layouts using **Flexbox**. These two concepts are key building blocks for web development.

## 📅 Class Details
- **Course**: C8 - Introduction to Web Development
- **Schedule**: THU 3-4 PM | Weekly | Spring 2025
- **Course Website**: [linktr.ee/CODE.CRUNCH](https://linktr.ee/CODE.CRUNCH)

---

## 📘 Week 3 Overview

This week’s focus is on the **CSS Box Model** and **Flexbox**, two essential techniques that help you control layouts effectively.

### Key Concepts for Today’s Lecture:
- **CSS Box Model**: How elements are sized and spaced within their containers.
- **Flexbox**: A modern layout system that makes creating flexible, responsive designs simpler.

### Real-World Relevance:
- **Box Model**: Helps you understand how content is spaced and styled within a web page.
- **Flexbox**: Powers responsive layouts and alignment without the need for complex CSS.

---

## 🔑 Key Topics Covered

### 1. CSS Box Model:
The CSS Box Model is a fundamental concept for understanding element behavior on a web page.

- **Content**: The area where the element's actual content is displayed (e.g., text, images).
- **Padding**: Space around the content, between the content and the border.
- **Border**: Surrounds the padding (optional).
- **Margin**: The outermost space separating the element from others.

#### Box-Sizing:
- Default: **content-box** (only content width considered).
- Alternative: **border-box** (includes padding and border in total width/height, ideal for layout control).

---

### 2. Flexbox Layout:
Flexbox is a powerful layout tool that allows you to easily create flexible, responsive web designs.

- **Flex Container**: Defines the parent element for the Flexbox layout.
- **Flex Items**: The child elements inside the flex container that are laid out according to the Flexbox properties.

#### Flexbox Properties:
- **Container Properties**:
  - `display: flex`: Defines the element as a flex container.
  - `flex-direction`: Sets the direction of flex items (row/column).
  - `justify-content`: Aligns items along the main axis (left-right or top-bottom).
  - `align-items`: Aligns items along the cross axis.
  - `flex-wrap`: Allows items to wrap to the next line.

- **Item Properties**:
  - `flex-grow`: Defines how items should grow relative to others.
  - `flex-shrink`: Defines how items should shrink.
  - `flex-basis`: Defines the initial size of a flex item.
  - `align-self`: Allows an item to override container’s alignment.

---

## 🧑‍💻 Coding Lab - Flexbox Navigation & Layout

### Objectives:
- Apply **Flexbox** properties to create a responsive navigation bar.
- Build a responsive two-column layout using Flexbox.

### Task Breakdown:
1. **Create the Navigation Bar**:
   - Create the HTML structure for the navbar.
   - Apply Flexbox styles in `style.css`.

2. **Make Navigation Bar Responsive**:
   - Add a media query to switch the navbar from a horizontal layout to a vertical one on smaller screens.

3. **Create a Two-Column Layout**:
   - Write the HTML structure for a simple two-column layout.
   - Apply Flexbox styles to arrange columns.

### Debugging Tips:
- **Flexbox Layout Issues**: Ensure that `display: flex` is applied to the container.
- **Items Not Wrapping**: Use `flex-wrap: wrap` to ensure items wrap to the next line when needed.
- Use your browser's **Inspect tool** to debug the layout and adjust CSS properties accordingly.

### Code Review:
- Review and ensure all Flexbox properties are applied correctly.
- Focus on clean, readable code.

---

## 🎨 Final Touches:
- **Styling Enhancements**:
  - Add background color to the navbar.
  - Set a background image for the left column.
  - Add text (like `<h1>` and `<p>`) to the right column.
  - Place text elements beneath the layout in a structured way.

---

## 📅 Stay Connected:
- **GitHub**: [CODE-CRUNCH-LABS-WEB-DEV](https://github.com/CODECRUNCHWORLDWIDE/C8-CRUNCH-LABS-WEB-DEV)
- **Schedule**: Check the **Discord “Schedule” Channel** for upcoming sessions.
- **RSVP**: [lu.ma/CODECRUNCH](https://lu.ma/CODECRUNCH)

---

## 🚀 Next Week Preview:
- **Continue building advanced layouts** using Flexbox.
- Explore **CSS Grid** for more powerful layout control.

Feel free to reach out with any questions or feedback, and don't forget to RSVP for the next session!

---

*Your participation helps improve the course! Share your feedback through [go.fiu.edu/codecrunch](go.fiu.edu/codecrunch).*
