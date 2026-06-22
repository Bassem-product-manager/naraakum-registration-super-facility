document.getElementById('fileInput').addEventListener('change', handleFileSelect);

function handleFileSelect(event) {
    const fileListDiv = document.getElementById('fileList');
    const files = event.target.files;

    // Clear the existing list
    fileListDiv.innerHTML = '';

    // Loop through each file selected
    Array.from(files).forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.classList.add('file-item');

        // Create file name display
        const fileName = document.createElement('span');
        fileName.textContent = file.name;

        // Create the remove button
        const removeBtn = document.createElement('span');
        removeBtn.textContent = 'حذف';
        removeBtn.classList.add('remove-btn');
        removeBtn.addEventListener('click', () => removeFile(index));

        // Append elements to the file item
        fileItem.appendChild(fileName);
        fileItem.appendChild(removeBtn);

        // Append the file item to the list
        fileListDiv.appendChild(fileItem);
    });
}

function removeFile(index) {
    const fileInput = document.getElementById('fileInput');
    const dataTransfer = new DataTransfer(); // Using DataTransfer to manipulate file list

    // Add all files except the one to remove
    Array.from(fileInput.files).forEach((file, i) => {
        if (i !== index) {
            dataTransfer.items.add(file);
        }
    });

    // Update the file input with the new file list
    fileInput.files = dataTransfer.files;

    // Refresh the file list display
    handleFileSelect({ target: fileInput });
}
