import pandas as pd
import joblib
import os
import matplotlib.pyplot as plt
import seaborn as sns
from xgboost import XGBRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score

# Define the file paths. We'll use a new path for the advanced model.
DATASET_PATH = os.path.join(os.path.dirname(__file__), '..', 'datasets', 'raw', 'combined_city_data.csv')
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'advanced_groundwater_model.pkl')
VISUALIZATION_PATH = os.path.join(os.path.dirname(__file__), 'model_performance_plot.png')

print("Starting advanced model training process...")

try:
    # Load the cleaned dataset
    df = pd.read_csv(DATASET_PATH)

    # Drop rows with any NaN values for a clean training set
    df.dropna(inplace=True)

    # Select the features and the target variable
    features = df[['Lat', 'Long', 'Rainfall_mm', 'Temperature_C', 'pH', 'Dissolved_Oxygen_mg_L']]
    target = df['Water_Level_m']

    # Split the data into training and testing sets to evaluate performance
    X_train, X_test, y_train, y_test = train_test_split(features, target, test_size=0.2, random_state=42)

    # --- ADVANCED ML MODEL: XGBoost Regressor ---
    # XGBoost is a powerful, high-performance algorithm that often outperforms
    # Random Forest on structured data problems. It's a favorite in data science competitions.
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
    model.fit(X_train, y_train, verbose=False)

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
