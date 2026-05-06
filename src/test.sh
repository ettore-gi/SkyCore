#!/bin/bash
if [ "$1" == "clean" ]; then
    rm *.o
    rm *.a
    rm main
    exit 0
fi

mkdir -p build

gcc -c -g src/trip.c
gcc -c -g src/item.c
gcc -c -g src/category.c
gcc -c -g src/utils.c

ar -g main.a trip.o item.o category.o utils.o

gcc -g main.c -L. -lmain -o main
