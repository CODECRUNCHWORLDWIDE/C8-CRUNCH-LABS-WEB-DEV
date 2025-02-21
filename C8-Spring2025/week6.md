# README: Adding Logic to JavaScript Code for Dynamic Web Interactions (Week 6)

## 🖥️ Welcome to Week #6 of Web Development at CODE.CRUNCH!

This week, we're going to make your JavaScript code even more powerful by adding **logic** with **loops** and **conditionals**. These tools are essential for building dynamic, interactive web pages that respond to user actions!

---

## 📅 Week 6 Overview

**Topic**: **Adding Logic to JavaScript Code for Dynamic Web Interactions**

### What will we learn this week?
- **Loops**: How to run repetitive tasks automatically with `for`, `while`, and `forEach` loops.
- **Conditionals**: How to execute code based on conditions using `if`, `else`, `else if`, and `switch` statements.
- **Real-World Applications**: How loops and conditionals are used in dynamic content generation, form validation, and interactive user interfaces.

---

## 🌟 Key Concepts Covered

### 1. **Loops in JavaScript**
   - **What is a Loop?**  
     A loop allows you to execute the same block of code multiple times. This helps automate repetitive tasks, like iterating over arrays or creating dynamic content.
   
   - **Types of Loops**:
     - **For Loop**: Used when you know how many times you want to repeat a task.
     - **While Loop**: Runs as long as a specified condition is true.
     - **forEach Loop**: Iterates over each item in an array.

   - **Real-World Example**:  
     - Using a loop to generate a list of items dynamically (e.g., creating product cards for an e-commerce site).
     - Example: Displaying a list of products in a shopping cart.

---

### 2. **Conditionals in JavaScript**
   - **What is a Conditional?**  
     Conditionals allow you to execute different code depending on whether a condition is true or false. This is essential for decision-making in your code.
   
   - **Types of Conditionals**:
     - **If Statement**: Runs code if a condition is true.
     - **Else Statement**: Runs code if the condition is false.
     - **Else If Statement**: Used to check multiple conditions.
   
   - **Real-World Example**:
     - **Form Validation**: Checking if all required fields are filled before submission.
     - **Dynamic Content**: Showing different messages based on user inputs or actions (e.g., displaying a "Welcome" message based on the time of day).

---

### 3. **Combining Loops and Conditionals**
   - **Using Loops and Conditionals Together**:  
     Loops and conditionals often work together to create dynamic and interactive content on a web page. For example:
     - **Example 1**: Using a loop to iterate over a list of users and displaying a different message based on their age.
     - **Example 2**: Building a list of products, applying discounts to certain items, and displaying dynamic content accordingly.

---

## 🛠️ **Hands-On Coding Lab**

**Objective**: In this lab, you’ll apply loops and conditionals to create dynamic features on a webpage, like toggling content visibility, calculating values, and interacting with users.

---

### Steps to Set Up:

1. **Create a New Project Folder**:  
   Create a new folder for the project and open it in a code editor (like Visual Studio Code).
   
2. **Create HTML and JavaScript Files**:  
   Create an `index.html` file for the structure and a `script.js` file for the JavaScript logic. Link the two with the following in the HTML:

   ```html
   <script src="script.js"></script>
   ```

---

### Tasks to Complete:

1. **Generating Dynamic Content with Loops**
   - **Objective**: Use a loop to generate a list of items dynamically.
   - **Steps**:
     1. Create an array of products.
     2. Use a loop to generate HTML content for each product.
     3. Display the product list inside a div with the ID `product-list`.

   ```javascript
   const products = ['Laptop', 'Smartphone', 'Headphones'];
   let productList = '';
   products.forEach(function(product) {
       productList += `<p>${product}</p>`;
   });
   document.getElementById('product-list').innerHTML = productList;
   ```

2. **Implementing Conditional Logic**
   - **Objective**: Create a conditional to check if the user is logged in and display a message accordingly.
   - **Steps**:
     1. Create a boolean variable `isLoggedIn`.
     2. Use an `if` statement to display a "Welcome back!" message if logged in, or "Please log in" if not.

   ```javascript
   const isLoggedIn = true;
   if (isLoggedIn) {
       alert('Welcome back!');
   } else {
       alert('Please log in');
   }
   ```

3. **Toggling Content Visibility**
   - **Objective**: Add a button to toggle the visibility of a paragraph when clicked.
   - **Steps**:
     1. Add a button and a paragraph in the HTML.
     2. Use JavaScript to toggle the visibility of the paragraph when the button is clicked.

   ```html
   <button onclick="toggleVisibility()">Toggle Paragraph</button>
   <p id="content">This is a toggle-able paragraph.</p>
   ```

   ```javascript
   function toggleVisibility() {
       const content = document.getElementById('content');
       content.style.display = content.style.display === 'none' ? 'block' : 'none';
   }
   ```

4. **Calculating Values Based on Conditions**
   - **Objective**: Create a simple calculator that applies a discount if the total price exceeds a certain amount.
   - **Steps**:
     1. Create a `totalPrice` variable.
     2. If the price exceeds $100, apply a 10% discount.

   ```javascript
   let totalPrice = 120;
   if (totalPrice > 100) {
       totalPrice *= 0.9;  // Apply 10% discount
   }
   alert(`Final price: $${totalPrice}`);
   ```

---

## 🐞 **Debugging and Troubleshooting**

**Common Issues**:
   - Missing semicolons or braces causing syntax errors.
   - Incorrectly defined variables or misspelled variable names.
   - Logic errors in conditions or loops.

**Solution**:
   - Use **browser Developer Tools** to inspect errors and debug your code effectively. Check the Console for error messages and use breakpoints to inspect variable values.

---

## 🔄 **Code Review & Wrap-Up**

We will review your code step-by-step, ensuring:
   - The loops and conditionals are implemented correctly.
   - Your dynamic content generation works as expected.
   - You understand how to use loops and conditionals to interact with the user.

---

## 📆 **Join Us for the Next Sessions**

**RSVP and Stay Updated**:  
Check our schedule on Discord’s “Schedule” Channel. Don’t forget to RSVP for upcoming sessions via [lu.ma/CODECRUNCH](https://lu.ma/CODECRUNCH).

---

**Stay connected with CODE.CRUNCH**  
- [CODE.CRUNCH Linktree](https://linktr.ee/CODE.CRUNCH)
- [Our GitHub](https://github.com/CODE-CRUNCH-CLUB/C8-CRUNCH-LABS-WEB-DEV)

Keep coding and get ready to take your web development skills to the next level! 🚀
