/**
 * ==========================================
 * FitSphere – Landing Page Interaction Script
 * ==========================================
 *
 * Purpose:
 * Handles UI interaction for the "LEARN MORE" button
 * on the landing page by displaying a Bootstrap modal
 * instead of navigating to a placeholder link.
 *
 * Dependencies:
 * - Bootstrap 5 (Modal component)
 *
 * This script runs after the DOM is fully loaded.
 */

document.addEventListener('DOMContentLoaded', function () {

    /**
     * STEP 1: Select the "LEARN MORE" button
     * --------------------------------------
     * Uses the `.btn-dark` class which corresponds
     * to the "LEARN MORE" button on the homepage.
     */
    const learnMoreButton = document.querySelector('.btn-dark');

    /**
     * STEP 2: Initialize Bootstrap Modal
     * ----------------------------------
     * Creates a Bootstrap Modal instance linked
     * to the modal element with ID `learnMoreModal`.
     */
    const myModal = new bootstrap.Modal(
        document.getElementById('learnMoreModal')
    );

    /**
     * STEP 3: Attach click handler (if button exists)
     * -----------------------------------------------
     * Prevents default anchor navigation and instead
     * opens the modal using Bootstrap's API.
     */
    if (learnMoreButton) {
        learnMoreButton.addEventListener('click', function (event) {
            event.preventDefault(); // Prevent navigation to "#"
            myModal.show();         // Display the modal
        });
    }

    /**
     * DEBUG LOG
     * ---------
     * Confirms that the script has been loaded and executed.
     */
    console.log('FitSphere JavaScript is loaded and ready!');
});
