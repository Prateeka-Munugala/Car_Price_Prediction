import pickle
import numpy as np

__data_columns = ["brand_number", "model_number", "year", "kmdriven", "transmission", "owner", "fueltype"]
__model = None

def load_saved_artifacts():
    global __model
    print("loading saved artifacts...start")
    if __model is None:
        with open('./artifacts/car_price_prediction.pickle', 'rb') as f:
            __model = pickle.load(f)
    print("loading saved artifacts...done")

def get_estimated_price(brand_number, model_number, Year, kmDriven, Transmission, Owner, FuelType):
    global __model
    x = np.zeros(len(__data_columns))
    x[0] = brand_number
    x[1] = model_number
    x[2] = Year
    x[3] = kmDriven
    x[4] = Transmission
    x[5] = Owner
    x[6] = FuelType

    print("Features received for prediction:", x)
    print("Number of features:", len(x))
    return float(round(__model.predict([x])[0], 2))


def get_data_columns():
    return __data_columns

if __name__ == '__main__':
    print(get_data_columns())
    load_saved_artifacts()
    print(get_estimated_price(6, 26, 2019, 72000, 0, 0, 0))
