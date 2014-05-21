import csv

class Event:

	def __init__(self, name, inputs, outputs, work, duration, notes):

		self.name = name
		self.inputs = ','.join(inputs.split(';'))
		self.outputs = ','.join(outputs.split(';'))
		self.work = work
		self.duration = duration # changed from length to avoid conflicts
		self.notes = notes.rstrip()

	def get_json(self):

		return ('{"title":"' + self.name + '",' + 
				'"id":1, "x":46, "y":5, "startTime":null,' + 
				'"duration":' + self.duration + ',' +
				'"members":[],"dri":"",' +
				'"notes":"' + self.notes + '",' +
				'"startHr":0,"startMin":30,"gdrive":[],"completed_x":null,' +
				'"inputs":"' + self.inputs + '",' +
				'"outputs":"' + self.outputs + '"}')

json_objects = []

with open('input.csv','rU') as f:
	reader = csv.reader(f)
	for row in reader:
		event = Event(row[0], row[2], row[3], row[4], row[5], row[6])
		json_objects.append(event.get_json())

print ','.join(json_objects[1:])

# {"title":"Low-Fi Prototype V1","id":1,"x":46,"y":5,
# "startTime":null,"duration":150,"members":[],"dri":"",
# "notes":"","startHr":0,"startMin":30,"gdrive":[],"completed_x":null,
# "inputs":"ideas,sketch","outputs":"low-fi prototype"}