// This is the best-practice way to make sure your
// JavaScript doesn't run until the HTML is fully loaded.
document.addEventListener('DOMContentLoaded', function() {

    // 1. Find the "GO TO DASHBOARD" button by its class
    const dashboardButton = document.querySelector('.btn-info');

    // 2. Find the "LEARN MORE" button by its class
    const learnMoreButton = document.querySelector('.btn-dark');
    // 4. Add a "click" event listener to the learn more button
    if (learnMoreButton) {
        learnMoreButton.addEventListener('click', function(event) {
            event.preventDefault(); // Don't follow the '#' link
            
            // Show a different alert!
            alert('Thanks for your interest!');
        });
    }

    console.log('FitSphere JavaScript is loaded and ready!');
});