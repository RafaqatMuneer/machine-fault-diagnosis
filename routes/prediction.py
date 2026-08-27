from flask import Flask, jsonify, Blueprint, request
import joblib
import numpy as np
import pandas as pd
prediction_bp = Blueprint("prediction",__name__)

# Load Trained pipline

rf_model = joblib.load('models/RandomForest.joblib')
lgbm__model = joblib.load('models/LightGBM.joblib')
xgb_model = joblib.load('models/xgb_model.joblib')

@prediction_bp.route("/predict", methods =["POST"])

def predict():

    data = request.get_json()

    try:
        X = pd.DataFrame([{
            "Type" : str(data["Type"]),
            "Air temperature [K]" : float(data["Air temperature [K]"]),
            "Process temperature [K]" : float(data["Process temperature [K]"]),
            "Rotational speed [rpm]" : int(data["Rotational speed [rpm]"]),
            "Torque [Nm]" : float(data["Torque [Nm]"]),
            "Tool wear [min]" : int(data["Tool wear [min]"])
        }])
        

        # Making predictions from each model
        rf_prediction = rf_model.predict(X)[0]
        lgbm_prediction = lgbm__model.predict(X)[0]
        xgb_prediction = xgb_model.predict(X)[0]
        print(rf_prediction,lgbm_prediction ,xgb_prediction)
        # calculating probabilities of each prediction
        rf_probability = rf_model.predict_proba(X)[0]
        lgbm_probability= lgbm__model.predict_proba(X)[0]
        xgb_probability = xgb_model.predict_proba(X)[0]

        ensemble_probability = (rf_probability + lgbm_probability + xgb_probability) / 3
        final_index = int(np.argmax(ensemble_probability))

        # Define class map matching your dataset encoding
        class_names = {
            0: "No Failure",
            1: "Tool Wear Failure (TWF)",
            2: "Heat Dissipation Failure (HDF)",
            3: "Power Failure (PWF)",
            4: "Overstrain Failure (OSF)",
            5: "Random Failure (RNF)",
            6: "General Machine Failure"
        }

        machine_failure = "HEALTHY" if final_index == 0 else "FAULT DETECTED"

        final_prediction = class_names[final_index]

        confidence = f"{ensemble_probability[final_index]* 100:.2f}"

        results = {
            "machine_failure": machine_failure,  # Output: 1 or 0
            "final_prediction": final_prediction,  # Output: 'Heat Dissipation Failure (HDF)'
            "confidence" : confidence,
        }
        # print(results)

        return jsonify(results)

    except Exception as e:
        return jsonify({
            "error":str(e)
        }), 400