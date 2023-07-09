import time

vel = 0
dist = 0
simTime = 0

end = 500
totalTime = 5
dt = 5
frictionMul = 0.3
frictionSub = 0#100

# --
print(frictionMul**dt)
vel = (1 - frictionMul**dt) * end / ((1 - frictionMul**(totalTime)) * dt)
# --

while totalTime < 0 or simTime <= totalTime:
    print("time: %.3f; vel: %.3f; dist: %.3f" % (simTime, vel, dist))

    time.sleep(dt)
    simTime += dt

    oldVel = vel

    vel *= frictionMul**dt
    if vel >= frictionSub:
        vel -= frictionSub*dt

    avgVel = (oldVel+vel) / 2

    dist += oldVel*dt