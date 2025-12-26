document.addEventListener('DOMContentLoaded', function() {
    // 1. Find the "LEARN MORE" button
    const learnMoreButton = document.querySelector('.btn-dark');

    // 2. Initialize the Bootstrap Modal
    const myModal = new bootstrap.Modal(document.getElementById('learnMoreModal'));

    if (learnMoreButton) {
        learnMoreButton.addEventListener('click', function(event) {
            event.preventDefault(); // Don't follow the '#' link
            
            // Show the nice Bootstrap modal instead of an alert
            myModal.show();
        });
    }

    console.log('FitSphere JavaScript is loaded and ready!');
});