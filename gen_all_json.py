#!/usr/bin/env python

import pathlib
import json

print('[')
first = True
t = 1519082589
for dirname in sorted(pathlib.Path('lists').glob('*')):
    for fname in sorted(pathlib.Path(dirname).glob('*')):
        t += 1
        if not first:
            print(',', end='')
        else:
            first = False
        fn = fname.name[:-5]
        category = str(dirname.name)
        print(json.dumps({'category': category, 'name': fn, 'ts': t}))
print(']')
