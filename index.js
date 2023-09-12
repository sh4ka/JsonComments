const textInput = document.getElementById("textInput");
const formattedJson = document.getElementById("formattedJson");        
const saveToFileButton = document.getElementById("saveToFileButton");
const loadFileInput = document.getElementById("loadFileInput");

let savedContent = ""; // Variable to store the saved content

textInput.addEventListener("input", function() {
    // Get the text from the textarea
    const text = textInput.value;

    // Try to parse the text as JSON
    try {
        const jsonObject = JSON.parse(text);
        // Convert the JavaScript object back to JSON with proper formatting
        const jsonString = JSON.stringify(jsonObject, null, 2);

        // Display the formatted JSON with comment input fields and line numbers
        formattedJson.innerHTML = highlightJSONWithComments(jsonString);
    } catch (error) {
        // Display an error message if parsing fails
        formattedJson.textContent = "Invalid JSON format. Please check your input.";
    }
});

saveToFileButton.addEventListener("click", function() {
    // Get the JSON content, comments, and saved content
    const jsonContent = textInput.value;
    const jsonObject = JSON.parse(jsonContent);
    // Convert the JavaScript object back to JSON with proper formatting
    const jsonString = JSON.stringify(jsonObject, null, 2);
    const commentInputs = document.querySelectorAll(".comment input[type='text']");
    const generatedComments = [];
    commentInputs.forEach(input => {
        const comment = input.value.trim();
        if (comment !== "") {
            const lineNumber = input.dataset.lineNumber; // Use the line number from the dataset
            generatedComments.push(`Line ${lineNumber}: ${comment}`);
        }
    });
    const commentsText = generatedComments.join("\n");

    // Create a Blob object containing JSON, separator, and comments
    const contentToSave = `${jsonString}\n--\n${commentsText}`;
    const blob = new Blob([contentToSave], { type: "text/plain" });

    // Create a temporary download link and trigger the download
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "savedContent.txt";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Store the saved content
    savedContent = contentToSave;
});

// Handle file selection
loadFileInput.addEventListener("change", function() {
    const file = loadFileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const fileContent = event.target.result;
            const parts = fileContent.split("--"); // Split by the separator
            if (parts.length === 2) {
                const jsonContent = parts[0].trim();
                const commentsContent = parts[1].trim();
                textInput.value = jsonContent;
                formattedJson.innerHTML = highlightJSONWithComments(jsonContent);
                loadComments(commentsContent);
            } else {
                formattedJson.textContent = "Invalid file format. Please use the correct format.";
            }
        };
        reader.readAsText(file);
    }
});

// Function to highlight JSON with comment input fields and line numbers
function highlightJSONWithComments(jsonString) {
    // Split the JSON string into lines
    const lines = jsonString.split("\n");

    // Create a new array to store lines with comments and input fields
    const linesWithComments = [];

    let openCount = 0;

    // Iterate through the lines
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        let spaces = '';
        
        if (hasClose(line) && !hasOpen(line)) {
            openCount--;
        }                
        if (openCount > 0) {
            spaces = '&nbsp;'.repeat(openCount*4);
        }
        const formattedLine = spaces + line;
        linesWithComments.push(`
                <div class="comment">
                    <span class="line-number">${i + 1}:</span>
                    ${formattedLine}
            `);
        // Exclude comment inputs in lines that contain only '{', '}', '[', or ']'
        if (!/^[{}\[\]]*$/.test(line.trim())) {
            linesWithComments.push(`<input type="text" data-line-number="${i + 1}" placeholder="Add a comment">`);
        }
        linesWithComments.push(`</div>`);
        if (hasOpen(line) && !hasClose(line)) {
            openCount++;
        }
    }

    // Join the lines with comments and input fields back into a single string
    return linesWithComments.join("\n");
}

function hasOpen(line) {
    const openChars = ['{', '['];
    return openChars.some(char => line.includes(char));
}        

function hasClose(line) {
    const closeChars = ['}', ']'];
    return closeChars.some(char => line.includes(char));
}

// Function to load comments from a string and populate input fields
function loadComments(commentsContent) {
    const commentInputs = document.querySelectorAll(".comment input[type='text']");
    const comments = commentsContent.split('\n');
    commentInputs.forEach(input => {
        const match = comments.find(comment => comment.includes(`Line ${input.dataset.lineNumber}:`));
        if (match) {
            const comment = match.replace(`Line ${input.dataset.lineNumber}:`, '').trim();
            input.value = comment;
        }
    });
}

function initialize() {
    const textarea = document.getElementById('textInput');
    textarea.value = '{"glossary": {"title": "example glossary","GlossDiv": {"title": "S","GlossList": {"GlossEntry": {"ID": "SGML", "SortAs": "SGML","GlossTerm": "Standard Generalized Markup Language","Acronym": "SGML","GlossDef": {"para": "A meta-markup language, used to create markup languages such as DocBook.","GlossSeeAlso": ["GML", "XML"]},"GlossSee": "markup"}}}}}';
    const event = new Event('input', {
        bubbles: true, // Allow the event to bubble up the DOM tree
        cancelable: true // Allow the event to be canceled
      });
    
      textarea.dispatchEvent(event);
}

// Initial content load (if any)
window.addEventListener("DOMContentLoaded", function() {
    // Check if there is any saved content
    if (savedContent) {
        const parts = savedContent.split("--"); // Split by the separator
        if (parts.length === 2) {
            const jsonContent = parts[0].trim();
            const commentsContent = parts[1].trim();
            textInput.value = jsonContent;
            formattedJson.innerHTML = highlightJSONWithComments(jsonContent);
            loadComments(commentsContent);
        }
    }
});

initialize();