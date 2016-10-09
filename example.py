import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

# Load the expense file
df = pd.read_csv('expense.csv')

# Fill remaining days, if any, with 0
df.fillna(0)

# Get all columns and remove 'week'
columns = list(df)
columns.remove('week')

# Add all the rows (days) into 'total' column 
df['total'] = df[columns].sum(axis=1)

# Add 'color' column as per budget
BUDGET = 200
df['color'] = np.where(df['total'] > BUDGET, 'red', 'green')

# LINE CHART STARTS HERE
x = df['week']
y = df['total']
c = df['color']
area = 75
dim = np.arange(1, len(df), 1)

plt.xlabel('Week Number')
plt.ylabel('Total Spent')
plt.xticks(dim)
plt.grid()
plt.scatter(x, y, c=c, s=area)
plt.plot(x,y,'k')
plt.show()
# LINE CHART ENDS HERE 