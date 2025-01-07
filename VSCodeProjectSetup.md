# Setting up a Project with HTML, CSS, and JavaScript on VSCode

This guide will walk you through setting up a simple web development project using HTML, CSS, and JavaScript on Visual Studio Code (VSCode).

## Prerequisites

Before you begin, ensure you have the following installed:
1. **Visual Studio Code (VSCode)**: [Download here](https://code.visualstudio.com/)
2. **Web Browser**: (Chrome, Firefox, etc.) for testing your website.

## Step 1: Install Visual Studio Code (VSCode)

1. Download and install VSCode from the [official website](https://code.visualstudio.com/).
2. Once installed, open Visual Studio Code.

## Step 2: Create a New Project Folder

1. Create a new folder where you want to store your project files.
2. Inside that folder, create three files:
   - `index.html` (HTML file)
   - `style.css` (CSS file)
   - `script.js` (JavaScript file)

You can create these files by either:
- Right-clicking inside the folder and selecting "New File" or,
- Creating the files directly inside the folder from VSCode.

## Step 3: Open the Project in VSCode

1. Launch VSCode.
2. Click on **File** → **Open Folder** and select your newly created project folder.
3. Once the folder is opened, you should see the three files (`index.html`, `style.css`, `script.js`) in the Explorer panel on the left.

## Step 4: Write Your HTML Code

1. Open `index.html` in VSCode.
2. Add basic HTML structure as shown below:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Project</title>
    <link rel="stylesheet" href="style.css"> <!-- Linking the CSS file -->
</head>
<body>
    <h1>Hello, World!</h1>
    <p>This is a simple web project.</p>
    
    <script src="script.js"></script> <!-- Linking the JavaScript file -->
</body>
</html>
