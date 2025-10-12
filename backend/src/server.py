import pandas as pd
import joblib
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Define the base directory for the entire project
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))

# Use the base directory to construct robust file paths
MODEL_PATH = os.path.join(BASE_DIR, 'backend', 'src', 'ml', 'advanced_groundwater_model.pkl')
DATASET_PATH = os.path.join(BASE_DIR, 'backend', 'src', 'datasets', 'raw', 'combined_city_data.csv')
PLOT_PATH = os.path.join(BASE_DIR, 'backend', 'src', 'ml', 'model_performance_plot.png')

model = None
historical_data = None

# Load the trained model and dataset at startup
print("Attempting to load ML model and historical data...")

if os.path.exists(MODEL_PATH):
    try:
        model = joblib.load(MODEL_PATH)
        print("Machine learning model loaded successfully.")
    except Exception as e:
        print(f"ERROR: An error occurred while loading the model: {e}")
else:
    print(f"ERROR: Machine learning model file not found at: {MODEL_PATH}")

if os.path.exists(DATASET_PATH):
    try:
        historical_data = pd.read_csv(DATASET_PATH)
        historical_data['Date'] = pd.to_datetime(historical_data['Date'], errors='coerce')
        historical_data.dropna(subset=['Date'], inplace=True)
        print("Historical data loaded successfully.")
    except Exception as e:
        print(f"ERROR: An error occurred while loading the dataset: {e}")
else:
    print(f"ERROR: Historical data file not found at: {DATASET_PATH}")

@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({'error': 'Model not loaded.'}), 500

    data = request.get_json(force=True)
    if not data or 'features' not in data:
        return jsonify({'error': 'Invalid input data. "features" key is missing.'}), 400

    try:
        features_df = pd.DataFrame([data['features']])
        required_cols = ['Lat', 'Long', 'Rainfall_mm', 'Temperature_C', 'pH', 'Dissolved_Oxygen_mg_L']
        
        # Ensure all required columns are present, even if data is missing
        for col in required_cols:
            if col not in features_df.columns:
                features_df[col] = 0.0

        features_df = features_df[required_cols]

        prediction = model.predict(features_df)
        return jsonify({'prediction': prediction[0]})

    except KeyError as e:
        return jsonify({'error': f"Missing feature: {e}"}), 400
    except Exception as e:
        return jsonify({'error': f"An error occurred: {e}"}), 500

@app.route('/predict_by_city', methods=['POST'])
def predict_by_city():
    if model is None:
        return jsonify({'error': 'Model not loaded.'}), 500
    if historical_data is None:
        return jsonify({'error': 'Historical data not loaded on the server.'}), 500

    data = request.get_json(force=True)
    city = data.get('city')
    if not city:
        return jsonify({'error': 'City parameter is required.'}), 400
    
    city_data = historical_data[historical_data['City'].str.lower() == city.lower()]
    if city_data.empty:
        return jsonify({'error': 'No data found for the specified city.'}), 404
        
    try:
        # Calculate the average values for the prediction features
        avg_features = city_data[['Lat', 'Long', 'Rainfall_mm', 'Temperature_C', 'pH', 'Dissolved_Oxygen_mg_L']].mean().to_dict()
        
        # Create a DataFrame from the average values
        features_df = pd.DataFrame([avg_features])
        
        prediction = model.predict(features_df)
        return jsonify({'prediction': prediction[0]})
        
    except Exception as e:
        return jsonify({'error': f"An error occurred during prediction: {e}"}), 500

@app.route('/historical_data', methods=['GET'])
def get_historical_data():
    if historical_data is None:
        return jsonify({'error': 'Historical data not loaded on the server.'}), 500

    city = request.args.get('city')
    if not city:
        return jsonify({'error': 'City parameter is required.'}), 400

    city_data = historical_data[historical_data['City'].str.lower() == city.lower()]
    if city_data.empty:
        return jsonify({'error': 'No data found for the specified city.'}), 404

    historical_records = city_data[['Date', 'Water_Level_m']].to_dict('records')
    for record in historical_records:
        try:
            # The fix: This is a more robust way to handle the date conversion
            if isinstance(record['Date'], datetime):
                record['Date'] = record['Date'].strftime('%Y-%m-%d')
            else:
                record['Date'] = None
        except ValueError:
            record['Date'] = None
    return jsonify(historical_records)

@app.route('/model_performance', methods=['GET'])
def get_model_performance_plot():
    if not os.path.exists(PLOT_PATH):
        return jsonify({'error': 'Model performance plot not found.'}), 404
    
    from flask import send_file
    return send_file(PLOT_PATH, mimetype='image/png')

if __name__ == '__main__':
    app.run(debug=True, port=5000)
