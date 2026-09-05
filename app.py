from flask import Flask, render_template
from routes.prediction import prediction_bp
from routes.health import health_bp
from flask_cors import CORS

# intiating Flask app
app = Flask(__name__)
CORS(app)

# @app.route('/')
# def home():
#     """Serves the frontend page"""
#     return render_template('index.html')

# Register blue prints 
app.register_blueprint(prediction_bp, url_prefix = '/api')
app.register_blueprint(health_bp, url_prefix = '/api')


if __name__ == "__main__":
    app.run(debug=True)
