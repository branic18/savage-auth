// Note: I got the modal code from online

  const modal = document.getElementById("caloricIntakeModal");
  const openModalBtn = document.getElementById("openModalBtn");
  const closeBtn = document.getElementsByClassName("close-btn")[0];

  openModalBtn.onclick = function() {
    modal.style.display = "block";
  }

  closeBtn.onclick = function() {
    modal.style.display = "none";
  }

  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }


  document.addEventListener("DOMContentLoaded", function() {

    const updateForm = document.getElementById("update-caloric-intake-form");

    updateForm.addEventListener("submit", function(e) {

        const formData = new FormData(updateForm);
        const data = {};

        formData.forEach((value, key) => {
            data[key] = value;
        });

        const payload = {
            userId: userId, 
            age: data.age,
            sex: data.sex,
            height: parseInt(data.height),
            weight: parseInt(data.weight),
            activityLevel: parseFloat(data.activity),
            goalAction: data.goalAction
        };

        fetch('/api/user/caloric-intake', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === "Caloric intake updated successfully.") {
                alert("Your caloric intake has been updated successfully!");
                updateResultsSection(data.data); // Update the results section on the page
            } else {
                alert("Error: " + data.message);
            }
        })
        .catch(error => {
            console.error('Error updating caloric intake:', error);
            alert("Error: Could not update caloric intake.");
        });
    });

    function updateResultsSection(caloricData) {
        const resultsSection = document.querySelector(".results");
        if (resultsSection) {
            resultsSection.innerHTML = `
                <h2>Results</h2>
                <p><strong>BMR:</strong> ${caloricData.bmr} calories/day</p>
                <p><strong>TDEE:</strong> ${caloricData.tdee} calories/day</p>
                <p><strong>Daily Calories for Your Goal:</strong> ${caloricData.dailyCalories} calories/day</p>
            `;
        }
    }
});


