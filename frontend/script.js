document.querySelectorAll('input[type="number"], input[type="range"]').forEach(input => {
    input.addEventListener('change', function() {
        const min = parseFloat(this.min);
        const max = parseFloat(this.max);
        let val = parseFloat(this.value);

        if (isNaN(val)) return;

        if (val < min) {
        this.value = min;
        } else if (val > max) {
        this.value = max;
        }

        // Trigger oninput update for linked <output> tags if using sliders/synced displays
        this.dispatchEvent(new Event('input'));
    });
    });

    //  X = pd.DataFrame([{
    //         "Type" : str(data["Type"]), //L.M.H
    //         "Air temperature [K]" : float(data["Air temperature [K]"]),  //295.3 - 304.5 mean : 300
    //         "Process temperature [K]" : float(data["Process temperature [K]"]), //305.7 - 313.8 mean 310
    //         "Rotational speed [rpm]" : int(data["Rotational speed [rpm]"]), //1168 - 2886 mean 1538
    //         "Torque [Nm]" : float(data["Torque [Nm]"]), //3.8 - 76.6 mean 39.99
    //         "Tool wear [min]" : int(data["Tool wear [min]"]) // 0 - 253 mean 108
    //     }])
    // prediction button
    document.getElementById('inspection-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        // Prediction button and state update
        const predictbtn = document.getElementById("predict_btn");
        predictbtn.textContent = 'Analyzing....';
        predictbtn.disabled = true;
        
        // Collect values from the input fields
        let rawType = document.getElementById("machine_type").value;
        // Extract just the single letter 'L', 'M', or 'H' if the value contains full text
        let machine_type = rawType.includes("(") ? rawType.match(/\((.*?)\)/)[1] : rawType; 
        let airTemp = parseFloat(document.getElementById("air_temp").value);
        let processTemp = parseFloat(document.getElementById("process_temp").value);
        let rotationalSpeed = parseInt(document.getElementById("rotational_speed").value);
        let torque = parseFloat(document.getElementById("torque").value);
        let toolWear = parseInt(document.getElementById("tool_wear").value);

        const payload = {
            "Type": machine_type,
            "Air temperature [K]": airTemp,
            "Process temperature [K]": processTemp,
            "Rotational speed [rpm]": rotationalSpeed,
            "Torque [Nm]": torque,
            "Tool wear [min]": toolWear
        };
        // body = JSON.stringify(payload)
        // alert(body)
        try {
            const response = await fetch('https://machine-fault-diagnosis.onrender.com/api/predict', {
                method: "POST",
                headers: {"Content-Type" : "application/json"},
                body: JSON.stringify(payload) // Convert JS Object to JSON String
        });

        if(!response.ok) throw new Error("API server error")

        //parse custom JSON response format
        const data = await response.json()

         // C. Update DOM with real API response
            const badge = document.getElementById('status_badge');
            const confidenceDisplay = document.getElementById('confidence_score');
            const defectInfo = document.getElementById('defect_class');
            
            confidenceDisplay.innerText = data.confidence + "%";
            defectInfo.innerText = data.final_prediction;

            if (data.machine_failure === "FAULT DETECTED") {
                badge.innerText = "FAULT DETECTED";
                badge.className = "badge status-fail";
            } else {
                badge.innerText = "HEALTHY";
                badge.className = "badge status-pass";
            }

        } catch (error) {
            console.error("Predcition failed", error);
            alert('Unable to process prediction request. Ensure the backend server is running.');
        } finally {
            predictbtn.textContent = 'Predict Machine Failure';
            predictbtn.disabled = false;
        } 

    });