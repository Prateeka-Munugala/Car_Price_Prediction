from flask import Flask, request, jsonify
import util
import pandas as pd

util.load_saved_artifacts()

app = Flask(__name__)

@app.route('/hello')
def hello():
    return "Hi"

@app.route('/predict_car_price', methods=['GET', 'POST'])
def predict_car_price():
    brand_number = int(request.form['brand_number'])
    model_number = int(request.form['model_number'])
    year = int(request.form['year'])
    kmdriven = float(request.form['kmdriven'])
    transmission = int(request.form['transmission'])
    owner = int(request.form['owner'])
    fueltype = int(request.form['fueltype'])
    response = jsonify({
        'estimated_price': util.get_estimated_price(
            brand_number, model_number, year, kmdriven, transmission, owner, fueltype
        )
    })
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/get_brand_model_mapping', methods=['GET'])
def get_brand_model_mapping():
    df = pd.read_csv("Cleaned_Car_data.csv")

    brand_model_mapping = {}
    for _, row in df.iterrows():
        brand = row['Brand']
        brand_num = int(row['brand_number'])
        model = row['model']
        model_num = int(row['model_number'])

        if brand not in brand_model_mapping:
            brand_model_mapping[brand] = {
                'brand_number': brand_num,
                'models': []
            }

        brand_model_mapping[brand]['models'].append({
            'model': model,
            'model_number': model_num
        })

    # Remove duplicate models
    for brand in brand_model_mapping:
        seen = set()
        unique_models = []
        for m in brand_model_mapping[brand]['models']:
            if m['model'] not in seen:
                seen.add(m['model'])
                unique_models.append(m)
        brand_model_mapping[brand]['models'] = unique_models

    response = jsonify(brand_model_mapping)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

if __name__ == "__main__":
    print("Starting Python Flask Server For Car Price Prediction...")
    app.run()
