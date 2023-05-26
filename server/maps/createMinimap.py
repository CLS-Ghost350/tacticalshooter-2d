import json

import os 
dir_path = os.path.dirname(os.path.realpath(__file__))

data = {}

with open(dir_path + "/test2.json", "r") as f:
    data = json.load(f)

minX = 0
minY = 0
maxX = 0
maxY = 0

for wall in data["walls"]:
    minX = min(minX, wall[0])
    minX = min(minX, wall[2])
    minY = min(minY, wall[1])
    minY = min(minY, wall[3])

    maxX = max(maxX, wall[0])
    maxX = max(maxX, wall[2])
    maxY = max(maxX, wall[1])
    maxY = max(maxX, wall[3])


svgData = ""

svgData += f'<svg viewBox="{minX} {minY} {maxX} {maxY}" xmlns="http://www.w3.org/2000/svg">'

for wall in data["walls"]:
    svgData += f'<line x1="{wall[0]}" y1="{wall[1]}" x2="{wall[2]}" y2="{wall[3]}" stroke="black" stroke-width="3" vector-effect="non-scaling-stroke"/>'

svgData += '</svg>'

with open(dir_path + "/minimap.svg", "w+") as f:
    f.write(svgData)