#!/usr/bin/env python

"""
This program will return a two-dimensional array of elevations
from the data files as a JSON string.
"""

import json
import struct
import argparse

# Command Line Options
parser = argparse.ArgumentParser(description="Unpack the data into 2D Array represented as JSON.")
parser.add_argument("datafile", help="The file you want to unpack.", metavar="ID")
parser.add_argument("x", help="x", metavar="X")
parser.add_argument("y", help="y", metavar="Y")
parser.add_argument("w", help="w", metavar="W")
parser.add_argument("h", help="h", metavar="H")
parser.add_argument("r", help="resolution", metavar="R")
parser.add_argument("relative", help="Use relative height", metavar="REL")
args = parser.parse_args()

INTLENGTH = 4    # Constant
ROWWIDTH  = 1201 # Constant - Usually 1201
minValue  = 900  # Set by readrow to determine the lowest elevation in the set

with open("../files/db.json", "r") as jsonfile:
    datagrid = json.load(jsonfile)["data"]

targetX = int(float(args.x))
targetY = int(float(args.y))
targetW = int(float(args.h))
targetH = int(float(args.w))
targetR = int(float(args.r))

# Left joins keep breaking with an unknown relationship between
# This fix seems to work at sizes below 1124 px width
targetX = targetX - targetX % targetR
targetX += 1

# Fix some issues caused by seeking too far due to remainders
targetW = targetW - targetW % targetR
targetH = targetH - targetH % targetR

differenceW = ROWWIDTH - targetX
remainderW  = targetX + targetW - ROWWIDTH
differenceH = ROWWIDTH - targetY
remainderH  = targetY + targetH - ROWWIDTH

def getRegionId(name):
    for y in range(len(datagrid)):
        for x in range(len(datagrid[0])):
            if datagrid[y][x] != None and datagrid[y][x] + ".data"  == name:
                return {"x": x, "y": y}

def readrow(f, x, width):
    global minValue
    row = list()
    f.seek(f.tell() + INTLENGTH * x)
    modelWidth = width / targetR
    relativeHeight = 1
    while len(row) < modelWidth:
        row.append((struct.unpack("i", f.read(INTLENGTH))[0] * relativeHeight)+1)
        f.seek(f.tell() + INTLENGTH * (targetR-1))
    minValue = min(minValue, min(row))
    return row

def readFile(name, x, y, width, height):
    with open("../files/db/{0}".format(name), "r") as f:
        result = list()
        f.seek(INTLENGTH * ROWWIDTH * y)
        while len(result) < height / targetR:
            result.append(readrow(f, x, width))
            f.seek(f.tell() + INTLENGTH * ROWWIDTH * (targetR-1))
            f.seek(f.tell() + INTLENGTH * (ROWWIDTH - x - width))
        if False and args.relative == "yes":
            for row in result:
                for key in range(len(row)):
                    row[key] = row[key] - (minValue - 2)
        return result

region = getRegionId(args.datafile)

if targetX + targetW > ROWWIDTH and targetY + targetH < ROWWIDTH:
    # Require a horizontal join
    leftArray   = readFile(datagrid[region["y"]][region["x"]]     + ".data", targetX, targetY, differenceW, targetH)
    rightArray  = readFile(datagrid[region["y"]][region["x"] + 1] + ".data", 0, targetY, remainderW, targetH)
    returnArray = [list()] * len(leftArray)
    for i in range(len(leftArray)):
        returnArray[i] = leftArray[i] + rightArray[i]
elif targetX + targetW < ROWWIDTH and targetY + targetH > ROWWIDTH:
    # Require a vertical join
    topArray    = readFile(datagrid[region["y"]][region["x"]]     + ".data", targetX, targetY, targetW, differenceH)
    bottomArray = readFile(datagrid[region["y"] + 1][region["x"]] + ".data", targetX, 0, targetW, remainderH)
    returnArray = topArray + bottomArray # Wow, Python does make that easy
elif targetX + targetW > ROWWIDTH and targetY + targetH > ROWWIDTH:
    # Require a four-way join
    topleft     = readFile(datagrid[region["y"]][region["x"]]         + ".data", targetX, targetY, differenceW, differenceH)
    bottomleft  = readFile(datagrid[region["y"] + 1][region["x"]]     + ".data", targetX, 0, differenceW, remainderH)
    topright    = readFile(datagrid[region["y"]][region["x"] + 1]     + ".data", 0, targetY, remainderW, differenceH)
    bottomright = readFile(datagrid[region["y"] + 1][region["x"] + 1] + ".data", 0, 0, remainderW, remainderH)
    top     = [list()] * len(topleft)
    bottom  = [list()] * len(bottomright)
    for i in range(len(top)):
        top[i] = topleft[i] + topright[i]
    for i in range(len(bottom)):
        bottom[i] = bottomleft[i] + bottomright[i]
    returnArray = top + bottom
else:
    # proceed as normal
    returnArray = readFile(datagrid[region["y"]][region["x"]] + ".data", targetX, targetY, targetW, targetH)

print( json.dumps(returnArray) )
