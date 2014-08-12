#!/bin/sh

for filename in ../files/dem/*.dem; do
    name=${filename##*/}
    base=${name%.dem}
    ./flatten-dem.py ${base}
done
