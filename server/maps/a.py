import json

import os 
dir_path = os.path.dirname(os.path.realpath(__file__))

SCALE = 1.8

data = {}

with open(dir_path + "/theSkeld.json", "r") as f:
    data = json.load(f)

for wall in data["walls"]:
    wall[0] *= SCALE
    wall[1] *= SCALE
    wall[2] *= SCALE
    wall[3] *= SCALE

with open(dir_path + "/test2.json", "w+") as f:
    json.dump(data, f)