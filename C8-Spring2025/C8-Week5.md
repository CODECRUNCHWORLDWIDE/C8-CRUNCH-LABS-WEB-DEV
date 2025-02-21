## 🖥️ Welcome to Week #5 of Web Development at CODE.CRUNCH!

In this session, we're diving deep into **building forms** and using **JavaScript** to make them interactive and user-friendly! 🚀 Forms are a core feature of modern websites, from contact forms to login and checkout pages. Let’s get ready to add that interactivity using JavaScript!

---

## 📅 Week 5 Overview

**Topic**: **Building Interactive Forms with HTML and JavaScript**

### What will we learn this week?
- **Building Forms in HTML**: We’ll explore how to structure forms, and understand different input elements.
- **Event Listeners**: Learn how JavaScript can respond to user actions like form submissions.
- **Form Validation**: We’ll use both HTML5 and JavaScript to validate user input and ensure accurate data submission.

---

## 🌟 Key Concepts Covered

### 1. **Building Forms in HTML**
   - **What is a Form?**  
     Forms are the backbone of user input on a website. They allow users to provide data (like text, selections, or files) to a server for processing.
   - **Form Structure**:
     - `<form>` element wraps input elements.
     - `action` specifies where the form data goes, and `method` (GET or POST) determines how it is sent.
   
   - **Common Form Input Types**:
     - **Text Input**: `<input type="text">` for single-line text fields.
     - **Email Input**: `<input type="email">` for email addresses (browsers provide validation).
     - **Password Input**: `<input type="password">` for hiding user passwords.
     - **Radio Buttons**: `<input type="radio">` for selecting one option from a list.
     - **Checkboxes**: `<input type="checkbox">` for selecting multiple options.
     - **Submit Button**: `<input type="submit">` for submitting the form.

---

### 2. **Form Validation in HTML**
   - **Built-in HTML5 Validation**:  
     HTML5 provides attributes such as `required`, `pattern`, `min`, `max`, and `maxlength` to help ensure that the user inputs valid data.
     - Example: `<input type="email" required>` ensures the email field is not left empty.
   
---

### 3. **Event Listeners in JavaScript**
   - **What is an Event Listener?**  
     An event listener allows JavaScript to "listen" for user actions (like clicks or form submissions) and respond accordingly.
   
   - **Common Events**:
     - **click**: Triggered when an element is clicked.
     - **submit**: Triggered when a form is submitted.
     - **input**: Triggered when an input field's value changes.
     - **focus**: Triggered when an input field gains focus.
   
   - **Adding Event Listeners**:  
     Use `.addEventListener()` to "listen" for events on HTML elements. For example:

     ```javascript
     document.getElementById('submit-button').addEventListener('click', function() {
         // Action on click
     });
     ```

---

### 4. **Handling Form Submissions with JavaScript**
   - **Preventing Default Form Submission**:  
     When a form is submitted, the default behavior is to reload the page. You can prevent this using JavaScript:

     ```javascript
     form.addEventListener('submit', function(event) {
         event.preventDefault();  // Prevents page reload
     });
     ```

   - **Custom Form Validation**:  
     JavaScript allows you to validate user input before submitting. For example:
     - Check if the email is valid.
     - Ensure that required fields are not empty.

---

## 🛠️ **Hands-On Coding Lab**

**Objective**: You will build a simple contact form, handle form submissions with JavaScript, and validate user input.

---

### Steps to Set Up:

1. **Create a New Project Folder**:  
   Set up a new folder and create an `index.html` file.

2. **Link the `script.js` File**:  
   Add a `<script src="script.js"></script>` tag before the closing `</body>` tag in `index.html`.

---

### Tasks to Complete:

1. **Creating a Simple Form**:
   - Create a form with name, email, and message fields.

     ```html
     <form id="contact-form">
         <input type="text" id="name" placeholder="Your Name" required>
         <input type="email" id="email" placeholder="Your Email" required>
         <textarea id="message" placeholder="Your Message" required></textarea>
         <input type="submit" value="Submit">
     </form>
     ```

2. **Handling Form Submission**:
   - Use `event.preventDefault()` to stop the page from reloading on form submission.

   ```javascript
   document.getElementById('contact-form').addEventListener('submit', function(event) {
       event.preventDefault();
       console.log('Form submitted');
   });
   ```

3. **Form Validation**:
   - Add JavaScript to check that the email is valid and that the message is not empty before submitting.

   ```javascript
   if (!email.match(/[a-z0-9]+@[a-z]+\.[a-z]{2,3}/)) {
       alert('Please enter a valid email');
       return;
   }
   ```

4. **Displaying User Feedback**:
   - After a successful submission, display a thank-you message instead of submitting the form.

   ```javascript
   document.getElementById('contact-form').innerHTML = '<p>Thank you for your message!</p>';
   ```

---

## 🐞 **Debugging and Troubleshooting**

**Common Issues**:
   - Form submission happens despite using `event.preventDefault()`.
   - Incorrect validation logic or missing fields.

**Solutions**:
   - Use browser developer tools to troubleshoot: Check the console for errors and inspect the form structure.

---

## 🔄 **Code Review & Wrap-Up**

We will review the code step-by-step, ensuring that:
   - Your form structure is correct.
   - JavaScript is properly handling form submission and validation.
   - You understand how to dynamically provide user feedback.

---

## 📆 **Join Us for the Next Sessions**

**RSVP and Stay Updated**:  
Check our schedule on Discord’s “Schedule” Channel. Don’t forget to RSVP for upcoming sessions via [lu.ma/CODECRUNCH](https://lu.ma/CODECRUNCH).

---

**Stay connected with CODE.CRUNCH**  
- [CODE.CRUNCH Linktree](https://linktr.ee/CODE.CRUNCH)
- [Our GitHub](https://github.com/CODE-CRUNCH-CLUB/C8-CRUNCH-LABS-WEB-DEV)

Happy coding, and we can’t wait to see what forms you create! 🎉
