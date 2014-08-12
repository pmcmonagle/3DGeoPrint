#!/usr/bin/env python

"""
This program will generate a binary STL file with
a variable number of facets.
"""

from random import getrandbits

from cdedtools import demparser
from stltools  import stlgenerator

import argparse

# Command Line Options
parser = argparse.ArgumentParser(description="Generate an STL from a DEM file.")
parser.add_argument("map_id", help="The map id.", metavar="ID")
parser.add_argument("x", help="x", metavar="X")
parser.add_argument("y", help="y", metavar="Y")
parser.add_argument("w", help="w", metavar="W")
parser.add_argument("h", help="h", metavar="H")
args = parser.parse_args()

with open("../files/dem/{0}.dem".format(args.map_id), "r") as f:
    targetY = int(args.x) # TODO: The x and y in dem are swapped!
    targetX = int(args.y)
    targetW = int(args.h)
    targetH = int(args.w)
    if targetW < 600 or targetH < 600:
        default_quality = 1
    else:
        default_quality = 2
    heightmap  = demparser.read_data(f)
    resolution = int(default_quality)**2
    # Slice the array by the specified width and height
    heightmap = heightmap[targetY:targetY+targetH]
    for y in range(len(heightmap)):
        heightmap[y] = heightmap[y][::-1]
        heightmap[y] = heightmap[y][targetX:targetX+targetW]
    # Further slice the array by resolution.
    heightmap  = heightmap[::resolution]
    for y in range(len(heightmap)):
        heightmap[y] = heightmap[y][::resolution]
        for x in range(len(heightmap[y])):
            heightmap[y][x] = heightmap[y][x] / 4 / float(resolution)
            if heightmap[y][x] < 1:
                heightmap[y][x] = 1
    output = "../files/temp/{0}-{1:02X}.stl".format(args.map_id, getrandbits(64))
    stlgenerator.generate_from_heightmap_array(heightmap, output)
    print(output)
