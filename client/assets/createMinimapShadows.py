from PIL import Image
import numpy as np
import os

dir_path = os.path.dirname(os.path.realpath(__file__))

minimapImg = Image.open(dir_path + "/minimapDemo.png").convert("RGBA")
minimapData = np.asarray(minimapImg)

shadowsData = np.zeros(minimapData.shape, dtype=np.uint8)
shadowsData[:, :, 3] = minimapData[:, :, 3]

shadowsImg = Image.fromarray(shadowsData, "RGBA")
shadowsImg.save(dir_path + "/minimapShadows.png")