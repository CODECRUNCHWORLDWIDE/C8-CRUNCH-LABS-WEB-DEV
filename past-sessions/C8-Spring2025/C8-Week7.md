# 🚀 Welcome to Week #7 of Web Development at CODE.CRUNCH!

This week, we’re taking your web development skills to the next level with **CSS Animations**, **Transitions**, and **Advanced DOM Manipulation using JavaScript**. These techniques will help you create **dynamic, interactive, and visually engaging** websites that offer a seamless user experience.

---

## 📅 Week 7 Overview

**Topic**: **Adding Dynamic Visuals and Interactions to Your Website**

### What will we learn this week?
- **CSS Animations**: How to create complex visual effects directly in the browser.
- **CSS Transitions**: How to smoothly change an element's style when it enters or exits a certain state.
- **JavaScript DOM Manipulation**: Adding interactivity through JavaScript to make your website respond to user actions in real-time.

---

## 🌟 Key Concepts Covered

### 1. **CSS Animations**
   - **What is a CSS Animation?**  
     CSS Animations allow you to animate an element’s properties over time, without needing JavaScript. These are perfect for hover effects, loading transitions, and animated icons.
   
   - **Keyframes**:  
     Define the states of an animation, specifying the start, intermediate, and end points.
   
   - **Example Use Cases**:  
     - Hover effects
     - Animated loading screens
     - Bouncing, sliding, and fading animations

   - **Transitions vs Animations**:  
     - **CSS Transitions**: Used for smooth, state-change effects (e.g., hover).
     - **CSS Animations**: Used for more complex animations that run automatically or loop indefinitely.

---

### 2. **CSS Transitions**
   - **What is a CSS Transition?**  
     Transitions allow you to gradually change an element’s property (like color or position) over a set period of time when a specific event occurs (such as hovering over a button).
   
   - **Transition Properties**:
     - **transition-property**: Specifies the property to animate (e.g., `background-color`).
     - **transition-duration**: Specifies how long the transition lasts (e.g., `0.5s`).
     - **transition-timing-function**: Defines the speed curve of the transition (e.g., `ease`, `linear`).

   - **When to Use**:  
     Transitions are ideal for simple interactive effects, such as hovering over buttons or changing a background color.

---

### 3. **Advanced DOM Manipulation with JavaScript**
   - **What is the DOM?**  
     The Document Object Model (DOM) is a representation of the HTML structure as a tree of nodes. JavaScript allows you to interact with this tree to change the document’s content dynamically.
   
   - **JavaScript's Role in DOM Manipulation**:  
     JavaScript lets you select elements, modify their properties, add event listeners, and remove elements from the page dynamically.
   
   - **Common Methods**:
     - `document.getElementById()`
     - `document.querySelector()`
     - `element.addEventListener()`

   - **Event Listeners**:  
     Event listeners are used to trigger actions when users interact with the page, such as clicking a button or hovering over an element.

---

## 🛠️ **Hands-On Coding Lab**

**Objective**: In this lab, you'll combine **CSS animations**, **transitions**, and **JavaScript DOM manipulation** to add interactive and dynamic elements to your webpage.

---

### Steps to Set Up:

1. **Create Your Project Folder**:  
   Create a new folder for the project and open it in your code editor (e.g., Visual Studio Code).
   
2. **Create HTML, CSS, and JavaScript Files**:  
   Create three files: `index.html`, `style.css`, and `script.js`. Link them together in your `index.html` file.

   ```html
   <link rel="stylesheet" href="style.css">
   <script src="script.js" defer></script>
   ```

---

### Tasks to Complete:

1. **Task 1 - Adding a CSS Transition to a Button**
   - **Objective**: Add a smooth color transition effect when a user hovers over a button.
   - **Steps**:
     1. Create a button in HTML.
     2. Use CSS to add a transition effect on hover, changing the button's background color smoothly.

   ```html
   <button class="transition-btn">Hover me</button>
   ```

   ```css
   .transition-btn {
       background-color: #4CAF50;
       color: white;
       padding: 10px 20px;
       border: none;
       border-radius: 5px;
       cursor: pointer;
       transition: background-color 0.3s ease;
   }

   .transition-btn:hover {
       background-color: #45a049;
   }
   ```

2. **Task 2 - Adding a CSS Animation to a Box**
   - **Objective**: Animate a box moving from left to right when the page loads.
   - **Steps**:
     1. Create a div with a class of `box`.
     2. Add a keyframe animation to move the box from left to right.

   ```html
   <div class="box"></div>
   ```

   ```css
   .box {
       width: 100px;
       height: 100px;
       background-color: #4CAF50;
       animation: moveBox 2s forwards;
   }

   @keyframes moveBox {
       0% { left: 0; }
       100% { left: 80%; }
   }
   ```

3. **Task 3 - Adding JavaScript Interactivity**
   - **Objective**: Use JavaScript to change the button's text when clicked.
   - **Steps**:
     1. Add an event listener to the button that changes its text when clicked.

   ```javascript
   const button = document.querySelector('.transition-btn');
   button.addEventListener('click', function() {
       button.textContent = 'You clicked me!';
   });
   ```

4. **Task 4 - Adding Animation on Button Hover**
   - **Objective**: Apply a scale effect to the button when hovered over.
   - **Steps**:
     1. Add a transform property to the button's hover state to make it grow when hovered.

   ```css
   .transition-btn:hover {
       background-color: #45a049;
       transform: scale(1.1);
   }
   ```

---

## 🐞 **Debugging and Troubleshooting**

**Common Issues**:
   - **Transitions not working**: Ensure that the property you're trying to animate is animatable.
   - **Animations not playing**: Double-check that the `@keyframes` rule is defined correctly and is being applied to the right element.
   - **JavaScript event listeners not firing**: Ensure that the element has been selected correctly and that the event listener is added to the right element.

**Solution**:
   - Use browser **Developer Tools** to inspect errors and debug your code. Check the **Console** tab for error messages, and use **breakpoints** to inspect variable values and step through the code.

---

## 🔄 **Code Review & Wrap-Up**

In the next session, we will review your code, checking that:
   - Animations and transitions work smoothly.
   - JavaScript is used effectively for interactivity and dynamic DOM manipulation.

---

## 📆 **Join Us for the Next Sessions**

**RSVP and Stay Updated**:  
Check our schedule on Discord’s “Schedule” Channel. Don’t forget to RSVP for upcoming sessions via [lu.ma/CODECRUNCH](https://lu.ma/CODECRUNCH).

---

**Stay connected with CODE.CRUNCH**  
- [CODE.CRUNCH Linktree](https://linktr.ee/CODE.CRUNCH)
- [Our GitHub](https://github.com/CODECRUNCHWORLDWIDE/C8-CRUNCH-LABS-WEB-DEV)

Keep coding and making your websites dynamic and interactive! 🎨
