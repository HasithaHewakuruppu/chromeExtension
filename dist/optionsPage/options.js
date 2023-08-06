document.getElementById('faceImage').addEventListener('change', function() {
    var file = this.files[0];  
    if (file) {
        var reader = new FileReader();

        reader.onload = function(event) {
            document.getElementById('sourceImage').src = event.target.result;
            
            // Add the button to the DOM once the image is loaded
            var btnContainer = document.getElementById('buttonContainer');
            if (!document.getElementById('calculateFaceMesh')) {  
                var button = document.createElement('button');
                button.id = 'calculateFaceMesh';
                button.textContent = 'Create Face Mesh';
                button.addEventListener('click', calculateFaceMesh);
                btnContainer.appendChild(button);
            }
        }

        reader.readAsDataURL(file);
    } 
});

function calculateFaceMesh() {

}


