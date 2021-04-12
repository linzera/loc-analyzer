import csv
import numpy as np
import matplotlib.pyplot as plt
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.linear_model import LinearRegression
from prettytable import PrettyTable

X=[]
loc_y = []
class_y = []
method_y = []
god_method_y = []
god_class_y = []

with open("./predict/software_evolution_analyses.csv") as csvfile:
    reader = csv.reader(csvfile) # change contents to floats
    for row in reader: # each row is a list
        try:
            X.append([int(row[0])])
        except:
            X.append([1])
        [loc,class_count,method,god_method,god_class] = row[1:]
        loc_y.append(int(loc))
        class_y.append(int(class_count))
        method_y.append(int(method))
        god_method_y.append(int(god_method))
        god_class_y.append(int(god_class))

table = PrettyTable(['MÊS', 'LOC', 'CLASSES', 'MÉTODOS', 'CLASSE DEUS', 'MÉTODO DEUS'])

# Linear Regression
results = [28]
for output in [loc_y,class_y,method_y,god_method_y,god_class_y]:
    reg = LinearRegression().fit(X, output)
    result = reg.predict([[28]])

    results.append(int(result[0]))

table.add_row(results)

print("Regressão linear do mês 28")
print(table)

with open('./predict/predicao.csv', mode='w') as prediction_file:
    predict_writer = csv.writer(prediction_file, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
    predict_writer.writerow(results)