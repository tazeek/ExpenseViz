from flask import Flask, render_template
import pandas as pd

app = Flask(__name__, template_folder='templates')


@app.route('/')	
def index():
	return render_template('index.html')
	
	
@app.route('/load')
def retrieveData():

	df = pd.read_csv("expense.csv")
	
	file = df.to_csv(index=False)
	
	return file
	
if __name__ == '__main__':
	app.run(host='127.0.0.1', port=5000, debug=True)