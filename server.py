from flask import Flask, render_template
import pandas as pd
import numpy as np

app = Flask(__name__, template_folder='templates')

@app.after_request
def add_header(r):
    """
    Add headers to both force latest IE rendering engine or Chrome Frame,
    and also to cache the rendered page for 10 minutes.
    """
    r.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    r.headers["Pragma"] = "no-cache"
    r.headers["Expires"] = "0"
    r.headers['Cache-Control'] = 'public, max-age=0'
    return r


@app.route('/')	
def index():
	return render_template('index.html')
	
	
@app.route('/load')
def retrieveData():
	
	# Weekly Budget 
	WEEKLY_BUDGET = 200
	
	# Read in the data
	df = pd.read_csv("expense.csv")
	
	# Fill remaining days, if any, with 0
	df = df.fillna(0)

	# Get all columns and remove 'week'
	columns = list(df)
	columns.remove('week')

	# Add all the rows (days) into 'total' column 
	df['week_total'] = df[columns].sum(axis=1)
	df['week_total'] = df['week_total'].astype(int)

	# Get data for 'weekdays' only
	df['weekdays_total'] = df['week_total'] - df['saturday'] - df['sunday']
	df['weekdays_total'] = df['weekdays_total'].astype(int)
	
	# Give color for the weekly totals
	df['week_color'] = np.where(df['week_total'] > WEEKLY_BUDGET, 'red', 'blue')
	df['weekdays_color'] = np.where(df['weekdays_total'] > WEEKLY_BUDGET, 'red', '#B8860B')
	
	# Get weekly profit
	df['weekly_profit'] = WEEKLY_BUDGET - df['week_total']	
	
	# Get overall profit and calculate on a weekly basis
	df['overall_profit'] = 0

	for i in range(len(df)):
		if i == 0:
			df['overall_profit'][i] = df['weekly_profit'][i]
		else:
			df['overall_profit'][i] = df['overall_profit'][i-1] + df['weekly_profit'][i]
	
	# Convert to CSV File
	file = df.to_csv(index=False)
	
	return file
	
if __name__ == '__main__':
	app.run(host='127.0.0.1', port=5000, debug=True)