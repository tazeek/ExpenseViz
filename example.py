from bokeh.plotting import figure, show, output_file, ColumnDataSource
from bokeh.models import FixedTicker, HoverTool

import numpy as np
import pandas as pd
import math
#import matplotlib.pyplot as plt

# Load the expense file
df = pd.read_csv('expense.csv')

# Fill remaining days, if any, with 0
df.fillna(0)

# Get all columns and remove 'week'
columns = list(df)
columns.remove('week')

# Add all the rows (days) into 'total' column 
df['week_total'] = df[columns].sum(axis=1)

# Get data for 'weekdays' only
df['weekdays_total'] = df['week_total'] - df['saturday'] - df['sunday']

# Add 'color' column as per budget
WEEKLY_BUDGET = 200
df['week_color'] = np.where(df['week_total'] > WEEKLY_BUDGET, 'red', 'yellow')
df['weekdays_color'] = np.where(df['weekdays_total'] > WEEKLY_BUDGET, 'red', 'green')

# Chart Functionalities
x = df['week']
y_week = df['week_total']
c_week = df['week_color']
y_weekdays = df['weekdays_total']
c_weekdays = df['weekdays_color']

ticks_number = math.ceil(max(y_week)/10)
yticks = [ i*20 for i in range(ticks_number)]

source = ColumnDataSource(df)
tooltips = [ ("Total", "@week_total"), ("Monday","@monday"), ("Tuesday","@tuesday"), ("Wednesday", "@wednesday"), ("Thursday", "@thursday"), ("Friday", "@friday"), ("Saturday", "@saturday"), ("Sunday", "@sunday") ]

# CHART STARTS HERE (MATPLOTLIB)
# f, ax = plt.subplots(1)

# area = 75
# dim = np.arange(1, len(df)+1, 1)

# ax.grid()
# ax.scatter(x, y_week, c=c_week, s=area, marker='o')
# ax.scatter(x, y_weekdays, c=c_weekdays, s=area, marker='s')
# ax.plot(x,y_week,'k')
# ax.plot(x,y_weekdays,'b-')
# ax.set_xlim(xmin=1)
# ax.set_ylim(ymin=0)

# plt.xticks(dim)
# plt.xlabel('Week Number')
# plt.ylabel('Total Spent')
# plt.show(f)
# CHART ENDS HERE (MATPLOTLIB)

# CHART STARTS HERE (BOKEH)
output_file('bokeh_example.html')
hover= HoverTool(tooltips=tooltips)

p = figure( tools=[hover], x_axis_label="Week Number", y_axis_label="Total Expenses", title="Weekly Expenses")

p.xaxis[0].ticker=FixedTicker(ticks=x)
p.yaxis[0].ticker=FixedTicker(ticks=yticks)

p.circle('week', 'week_total', fill_color='week_color', size=8, source=source)
#p.line(x, y_week, legend="Full Week") 

#p.circle(x, y_weekdays, fill_color=c_weekdays, size=8)
#p.line(x, y_weekdays, legend="Weekdays Only", line_color="red")

show(p)
# CHART ENDS HERE (BOKEH)