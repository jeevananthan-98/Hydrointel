import pandas as pd
import glob
import joblib
import os
import matplotlib.pyplot as plt
import seaborn as sns
from xgboost import XGBRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score

# Define a function to handle data combination and cleaning
def combine_and_clean_data():
    """Combines individual city groundwater data into a single CSV."""
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    # Adjusting the path to be more robust, assuming 'raw' is in the same directory as this script.
    raw_data_dir = os.path.join(script_dir, '..', 'datasets', 'raw')
    
    # Check if the 'raw' directory exists
    if not os.path.exists(raw_data_dir):
        print(f"Error: The directory '{raw_data_dir}' was not found.")
        print("Please ensure your individual city CSV files are located inside 'datasets/raw/'.")
        return None
        
    all_files = glob.glob(os.path.join(raw_data_dir, "*_detailed_groundwater_data*.csv"))
    
    if not all_files:
        print(f"Error: No detailed groundwater data CSV files found in '{raw_data_dir}'.")
        print("Please ensure your files (e.g., Mumbai_detailed_groundwater_data.csv) are in this folder.")
        return None
    
    combined_data = []

    for f in all_files:
        try:
            df = pd.read_csv(f)
            # Add a 'City' column based on the filename
            city_name = os.path.basename(f).split('_')[0]
            df['City'] = city_name
            
            # Standardize column names
            if 'WL' in df.columns:
                df.rename(columns={'WL': 'WaterLevel'}, inplace=True)
            if 'WaterLevel' in df.columns:
                df.rename(columns={'WaterLevel': 'Water_Level_m'}, inplace=True)
            
            # Select and reorder relevant columns
            cols = ['Date', 'City', 'Water_Level_m', 'Lat', 'Long', 'Rainfall_mm', 'Temperature_C', 'pH', 'Dissolved_Oxygen_mg_L']
            
            # Check for the existence of all columns, add them if missing with a value of 0.0
            for col in cols:
                if col not in df.columns:
                    df[col] = 0.0
            
            df = df[cols]
            combined_data.append(df)
        except Exception as e:
            print(f"Failed to process {os.path.basename(f)}: {e}")

    if not combined_data:
        print("No valid data found to combine. Exiting.")
        return None
    
    final_df = pd.concat(combined_data, ignore_index=True)
    
    # Define the output path for the combined data
    output_path = os.path.join(raw_data_dir, 'combined_city_data.csv')
    final_df.to_csv(output_path, index=False)
    
    print(f"Successfully combined data from {len(combined_data)} cities.")
    print(f"The combined dataset is saved to: {output_path}")
    return output_path


# --- Main Training Script Starts Here ---

# Run the data combination and cleaning pipeline first
combined_file_path = combine_and_clean_data()
if not combined_file_path:
    print("Data preparation failed. Exiting training script.")
    exit()

# Define the file paths for the model training
DATASET_PATH = combined_file_path
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'advanced_groundwater_model.pkl')
VISUALIZATION_PATH = os.path.join(os.path.dirname(__file__), 'model_performance_plot.png')

print("Starting advanced model training process...")

try:
    # Load the cleaned and combined dataset
    df = pd.read_csv(DATASET_PATH)

    # Drop rows with any NaN values for a clean training set
    df.dropna(inplace=True)

    # Select the features and the target variable
    features = df[['Lat', 'Long', 'Rainfall_mm', 'Temperature_C', 'pH', 'Dissolved_Oxygen_mg_L']]
    target = df['Water_Level_m']

    # Split the data into training and testing sets to evaluate performance
    X_train, X_test, y_train, y_test = train_test_split(features, target, test_size=0.2, random_state=42)

    # --- ADVANCED ML MODEL: XGBoost Regressor ---
    model = XGBRegressor(
        n_estimators=1000, 
        learning_rate=0.05, 
        max_depth=5, 
        subsample=0.8, 
        colsample_bytree=0.8,
        random_state=42, 
        n_jobs=-1
    )
    
    print("Training XGBoost model...")
    model.fit(X_train, y_train, 
              early_stopping_rounds=50, 
              eval_set=[(X_test, y_test)], 
              verbose=False)

    # Make predictions on the test set
    predictions = model.predict(X_test)
    
    # Evaluate the model's performance
    mse = mean_squared_error(y_test, predictions)
    r2 = r2_score(y_test, predictions)
    
    print(f"Model trained and evaluated on test data.")
    print(f"Mean Squared Error (MSE): {mse:.4f}")
    print(f"R-squared (R2) Score: {r2:.4f}")

    # --- VISUALIZATION LAYER ---
    print("Generating model performance visualization...")
    plt.style.use('dark_background') # Set a dark style for better visuals
    plt.figure(figsize=(10, 6))
    
    # Create a scatter plot of actual vs. predicted values
    # The ideal scenario is all points falling on the y=x line.
    sns.scatterplot(x=y_test, y=predictions, alpha=0.7, color='#3b82f6')
    
    # Add the ideal line for reference
    plt.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 'r--', lw=2, label='Ideal Fit')
    
    plt.title('Actual vs. Predicted Water Levels', fontsize=16, color='white')
    plt.xlabel('Actual Water Level (m)', fontsize=12, color='white')
    plt.ylabel('Predicted Water Level (m)', fontsize=12, color='white')
    plt.legend()
    plt.grid(True, linestyle='--', alpha=0.3)
    
    # Save the visualization to a file
    plt.savefig(VISUALIZATION_PATH)
    print(f"Visualization saved to {VISUALIZATION_PATH}")
    
    # Save the trained model
    joblib.dump(model, MODEL_PATH)
    print(f"Model successfully trained and saved to {MODEL_PATH}")
    print("Training and visualization complete. You are ready to deploy.")

except FileNotFoundError:
    print(f"Error: The file '{DATASET_PATH}' was not found. Please ensure it exists.")
except KeyError as e:
    print(f"Error: A required column was missing from the dataset: {e}")
except Exception as e:
    print(f"An unexpected error occurred during training: {e}")
