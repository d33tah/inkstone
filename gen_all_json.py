#!/usr/bin/env python

import pathlib
import json

print('[')
first = True
for dirname in sorted(pathlib.Path('lists').glob('*')):
    for fname in sorted(pathlib.Path(dirname).glob('*')):
        if not first:
            print(',', end='')
        else:
            first = False
        print(json.dumps({
            'category': str(fname.name).split('.')[0], 'name': fname.name, 'ts': 1519082589
        }))
print(']')
