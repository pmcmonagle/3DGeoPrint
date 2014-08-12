#!/usr/bin/env python

"""
This program will generate a binary STL file with
a variable number of facets.
"""

import struct
import argparse
from cdedtools import demparser

parser = argparse.ArgumentParser(description="Unpack the data into 2D Array represented as JSON.")
parser.add_argument("datafile", help="The file you want to unpack.", metavar="ID")
args = parser.parse_args()

filename = args.datafile

with open("../files/dem/{0}.dem".format(filename), "r") as f:
    heightmap = demparser.read_data(f)
    temp = list()
    for x in range(len(heightmap[0])):
        temp.append(list())
        for y in range(len(heightmap)):
            temp[x].append(heightmap[y][x])
    heightmap = temp[::-1]

with open("../files/db/{0}.data".format(filename), "w") as f:
    for y in range(len(heightmap)):
        for x in range(len(heightmap[y])):
            value = max(1, heightmap[y][x])
            f.write(struct.pack("i", value));
