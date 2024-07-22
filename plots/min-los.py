import matplotlib.pyplot as plt
import numpy as np

def minAltitudeLOS(satCount):
  theta = 2*np.pi / satCount
  cr = 1 / np.cos(theta / 2)
  return cr - 1

xRange = [3, 10]
x = np.linspace(xRange[0], xRange[1])
y = minAltitudeLOS(x)

fig, ax = plt.subplots()
ax.plot(x, y)

plt.xlabel("satellite count")
plt.ylabel("altitude / radius")
plt.xticks(np.arange(xRange[0], xRange[1] + 1, step=1))
plt.grid()

plt.show()
