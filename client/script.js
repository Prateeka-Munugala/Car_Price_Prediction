let brandModelMapping = {};
const brandSelect = document.getElementById('brand');
const modelSelect = document.getElementById('model');
const carImage = document.getElementById('car-image');
const resultDiv = document.getElementById('price-result');
const spinner = document.getElementById('spinner');

// Fetch brand-model mapping
fetch("http://127.0.0.1:5000/get_brand_model_mapping")
    .then(response => response.json())
    .then(data => {
        brandModelMapping = data;
        brandSelect.innerHTML = '<option value="" disabled selected>Select Brand</option>';
        modelSelect.innerHTML = '<option value="" disabled selected>Select Model</option>';
        for (let brand in data) {
            const option = document.createElement('option');
            option.value = brand;
            option.text = brand;
            brandSelect.appendChild(option);
        }
    });

// Update model dropdown and image when brand changes
brandSelect.addEventListener('change', function () {
    modelSelect.innerHTML = '<option value="" disabled selected>Select Model</option>';
    const selectedBrand = brandSelect.value;
    const models = brandModelMapping[selectedBrand].models;

    models.forEach(modelObj => {
        const option = document.createElement('option');
        option.value = modelObj.model;
        option.text = modelObj.model;
        modelSelect.appendChild(option);
    });

    const img = new Image();
    img.src = `images/${selectedBrand.toLowerCase()}.png`;
    img.alt = `${selectedBrand} Car`;
    img.onerror = () => {
        img.src = "images/default.png";
    };
    carImage.innerHTML = '';
    carImage.appendChild(img);
});

// Helper to set per-field error
function setFieldError(id, message) {
    document.getElementById(`${id}-error`).innerText = message;
}

// Clear all error messages
function clearAllErrors() {
    document.querySelectorAll('.error-message').forEach(e => e.innerText = '');
}

document.getElementById('carForm').addEventListener('submit', function (e) {
    e.preventDefault();
    spinner.style.display = "block";
    resultDiv.innerHTML = "";
    clearAllErrors();

    const selectedBrand = brandSelect.value;
    const selectedModel = modelSelect.value;
    const year = document.getElementById('year').value.trim();
    const kmdriven = document.getElementById('kmdriven').value.trim();
    const transmission = document.getElementById('transmission').value;
    const owner = document.getElementById('owner').value;
    const fueltype = document.getElementById('fueltype').value;

    let isValid = true;

    if (!selectedBrand) {
        setFieldError("brand", "Please select a brand.");
        isValid = false;
    }

    if (!selectedModel) {
        setFieldError("model", "Please select a model.");
        isValid = false;
    }

    if (!year || isNaN(year) || year < 1985 || year > 2024) {
        setFieldError("year", "Year must be between 1985 and 2024.");
        isValid = false;
    }

    if (!kmdriven || isNaN(kmdriven) || kmdriven <= 0 || kmdriven > 160000) {
        setFieldError("kmdriven", "Kilometers must be between 1 and 160000.");
        isValid = false;
    }

    if (!transmission) {
        setFieldError("transmission", "Please select transmission type.");
        isValid = false;
    }

    if (!owner) {
        setFieldError("owner", "Please select owner type.");
        isValid = false;
    }

    if (!fueltype) {
        setFieldError("fueltype", "Please select fuel type.");
        isValid = false;
    }

    if (!isValid) {
        spinner.style.display = "none";
        return;
    }

    const brandNumber = brandModelMapping[selectedBrand].brand_number;
    const modelNumber = brandModelMapping[selectedBrand].models.find(m => m.model === selectedModel).model_number;

    const formData = new FormData();
    formData.append("brand_number", brandNumber);
    formData.append("model_number", modelNumber);
    formData.append("year", year);
    formData.append("kmdriven", kmdriven);
    formData.append("transmission", transmission);
    formData.append("owner", owner);
    formData.append("fueltype", fueltype);

    fetch("http://127.0.0.1:5000/predict_car_price", {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        spinner.style.display = "none";
        resultDiv.innerHTML = `<h4 class="text-success">Estimated Price: ₹ ${Math.round(data.estimated_price).toLocaleString("en-IN")}</h4>`;
    })
    .catch(err => {
        spinner.style.display = "none";
        resultDiv.innerHTML = `<p class="text-danger">Something went wrong. Please try again.</p>`;
        console.error(err);
    });
});
