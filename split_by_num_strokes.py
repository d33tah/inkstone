#!/usr/bin/env python3

import argparse
import json
import pathlib
import csv
import sys

import requests

GRAPHICS_URL = (
    'https://raw.githubusercontent.com/'
    'skishore/makemeahanzi/master/graphics.txt'
)


def try_load_graphics():
    try:
        with open('graphics.txt') as f:
            return f.read()
    except FileNotFoundError:
        with open('graphics.txt', 'w') as f:
            t = requests.get(GRAPHICS_URL).text
            f.write(t)
        return t


def handle_fname(c, fpath, outpath):
    r = csv.reader(open(fpath), delimiter='\t')
    h = next(r)
    rows = list(r)

    def policz_kreski(s): return sum([c[x] for x in s[0]])
    rows.sort(key=policz_kreski)

    newrows = []
    for row in rows:
        newrows.append([row[0], row[1], row[2], f'/{row[4]}/'])

    pliki = {}
    for row in newrows:
        k = policz_kreski(row)
        if k < 5:
            k = 5
        elif k > 20:
            k = 20
        name = fpath.name.replace('.', '-')
        dirname = f"{outpath}/{name.split('-')[0][1:]}"
        fn = f'{dirname}/{name}-{k:02d}.list'
        if fn not in pliki:
            try:
                pathlib.Path(dirname).mkdir()
            except FileExistsError:
                pass
            f = open(fn, 'w', newline='\r\n')
            pliki[fn] = csv.writer(f, delimiter='\t', lineterminator='\n')
        pliki[fn].writerow(row)


def main(fpath, outpath):
    l = [json.loads(x) for x in try_load_graphics().split('\n') if x]
    c = {x['character']: len(x['strokes']) for x in l}
    handle_fname(c, fpath, outpath)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--fpath', required=True, type=pathlib.Path)
    parser.add_argument('--outpath', required=True, type=pathlib.Path)
    main(**parser.parse_args().__dict__)
