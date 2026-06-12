# 🚀 Welcome to Week #10 of Web Development at CODE.CRUNCH!

This week, we dive into **JavaScript DOM manipulation** and **event handling**, empowering you to build interactive, dynamic websites that respond to user actions without refreshing the page.

---

## 📅 Week 10 Overview

**Topic**: **Enhancing Interactivity with DOM Manipulation and Event Handling**

### What will we learn this week?
- **DOM Manipulation**: Dynamically create, update, and delete HTML elements using JavaScript.
- **Event Handling**: Learn how to listen for and respond to user interactions such as clicks, form submissions, and key presses.
- **Event Propagation**: Understand how events bubble and capture through the DOM tree.

---

## 🌟 Key Concepts Covered

### 1. **What is the DOM?**
   - **DOM (Document Object Model)** is a hierarchical tree structure that represents the HTML or XML content of a webpage.
   - JavaScript interacts with the DOM to dynamically change the content, structure, and styles of a webpage.

   **DOM Methods**:
   - Selecting elements: `document.querySelector()`, `document.getElementById()`
   - Adding/Removing elements: `appendChild()`, `removeChild()`
   - Modifying content: `textContent`, `innerHTML`

---

### 2. **DOM Manipulation: Creating, Updating, and Removing Elements**

   - **Creating New Elements**:  
     Use JavaScript to dynamically create new HTML elements (e.g., creating a new `<p>` tag and adding it to the DOM).
   
   - **Inserting Elements into the DOM**:  
     Use `appendChild()`, `insertBefore()`, or `replaceChild()` to add or modify elements in the DOM.

   - **Updating Content**:
     - **Text Content**: Modify text inside an element with `textContent`.
     - **HTML Content**: Modify inner HTML of an element using `innerHTML`.
   
   - **Changing Attributes**:  
     Modify element attributes (e.g., `src`, `href`, `class`) using `setAttribute()`.

   - **Removing Elements**:  
     Use `remove()` or `removeChild()` to delete elements from the DOM.

---

### 3. **Event Handling in JavaScript**

   - **What is an Event?**
     - An event is an action that occurs when a user interacts with the webpage (e.g., clicks, key presses, mouse movements).

   - **Event Listeners**:
     - JavaScript allows us to listen for events using the `addEventListener()` method.
     - Example: Attaching a click event to a button:

     ```javascript
     const button = document.querySelector('button');
     button.addEventListener('click', () => {
         alert("Button clicked!");
     });
     ```

   - **Types of Events**:
     - **Mouse Events**: `click`, `dblclick`, `mousemove`, `mouseenter`
     - **Keyboard Events**: `keydown`, `keyup`, `keypress`
     - **Form Events**: `submit`, `focus`, `blur`, `change`
     - **Window Events**: `load`, `resize`, `scroll`

---

### 4. **Event Propagation: Capturing vs. Bubbling**

   - **Event Bubbling**:  
     In event bubbling, an event starts from the innermost element (where it was triggered) and propagates outward to its parent elements.
   
   - **Event Capturing**:  
     Capturing is the reverse of bubbling. The event starts from the root of the document and propagates down to the target element.

   - **Preventing Default Behavior**:  
     You can use `preventDefault()` to stop the default behavior of an event (e.g., preventing a form from submitting).

   - **Event Delegation**:  
     Instead of adding individual event listeners to each element, you can attach one listener to a common parent element and use event delegation to catch events on child elements.

---

### 5. **Real-World Example**

   **Case Study**: A photo gallery where clicking on a thumbnail dynamically updates the larger image.
   - **DOM Manipulation**: Changing the `src` attribute of an `<img>` element based on user interaction.
   - **Event Handling**: Using click events to update the image dynamically without refreshing the page.

---

## 🛠️ **Hands-On Coding Lab**

**Objective**: Enhance the interactivity of your website using JavaScript. You will practice **DOM manipulation** and **event handling** to add form validation, provide user feedback, and dynamically update content.

### Tasks to Complete:

#### **Task 1 - Create a Dynamic Form Validation**

1. **Objective**: Add a form to your webpage and use JavaScript to validate user input.
   - Use input fields for **text** and **email**.
   - Use JavaScript to ensure fields are filled out correctly before form submission.

#### **Task 2 - Provide User Feedback**

1. **Objective**: Provide feedback when the user interacts with a form or clicks a button.
   - Change the **color** of a button when clicked.
   - Display a **success message** when form validation passes.

#### **Task 3 - Update Content Dynamically**

1. **Objective**: Use JavaScript to update content based on user interactions.
   - Change the **text** of a paragraph when a button is clicked.
   - Dynamically load additional content (e.g., an image or a list of items).

---

## 🏁 **Final Project: Instructions & Ideas**

### **Define Your Project Idea**:
   - Think about something you want to build that incorporates **HTML**, **CSS**, and **JavaScript**. Here are some project ideas to get you started:

### **Project Ideas**:
- **Personal Portfolio Website**: A stylish site showcasing your projects, skills, and about you.
- **Interactive To-Do List**: Build a task manager with features like adding, deleting, and completing tasks, plus **local storage** to persist tasks after page reloads.
- **Weather App**: Create an app fetching weather data from an API and displaying it with dynamic updates.
- **Interactive Quiz Game**: Build a quiz with multiple-choice questions, scoring, and time limits.
- **Blog Website**: Build a responsive blog layout with category filtering.
- **Interactive Image Gallery**: A gallery where users can click to enlarge images or add a lightbox effect.
- **Landing Page for a Business**: A landing page with sections for product features, testimonials, and a call to action (like a form or newsletter sign-up).

---

### **Final Touches**:
1. **Polish Your Design**: Ensure the layout is visually appealing and cohesive (check margins, paddings, and colors).
2. **Documentation**: Add a README to your GitHub repository with:
   - Project description.
   - Technologies used.
   - Instructions on how to run the project.
3. **Deployment**: Deploy your project to a hosting platform like **Vercel** to make it live.

---

## 💻 **GitHub Setup and Deployment**

### 1. **Create a GitHub Account**:
   - Sign up for a free GitHub account [here](https://github.com/).

### 2. **Install Git**:
   - Download Git from [git-scm.com](https://git-scm.com).

### 3. **Set Up Your Repository**:
   - Open your project folder in VS Code.
   - Create a new repository on GitHub and link it to your local repository.

### 4. **Deploy to Vercel**:
   - Sign up at [Vercel](https://vercel.com/).
   - Link your GitHub repository and deploy your project live!

---

## 🎉 **Final Words**

Your **Final Project** is your chance to showcase everything you’ve learned. So, get creative and build something amazing. Demo Day will be an exciting opportunity to show your work and get feedback to keep improving.

Good luck, and happy coding! 🚀

---

## 📅 **Join Us for the Next Sessions**

**RSVP and Stay Updated**:  
Check our schedule on Discord’s “Schedule” Channel. Don’t forget to RSVP for upcoming sessions via [lu.ma/CODECRUNCH](https://lu.ma/CODECRUNCH).

---

**Stay connected with CODE.CRUNCH**  
- [CODE.CRUNCH Linktree](https://linktr.ee/CODE.CRUNCH)
- [Our GitHub](https://github.com/CODECRUNCHWORLDWIDE/C8-CRUNCH-LABS-WEB-DEV)

Happy coding!
