/*
 *  Copyright 2016 Shaunak Kishore (kshaunak "at" gmail.com)
 *
 *  This file is part of Inkstone.
 *
 *  Inkstone is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  Inkstone is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with Inkstone.  If not, see <http://www.gnu.org/licenses/>.
 */

import {readCharacter} from '/client/assets';
import {getAnimationData} from '/lib/animation';
import {Decomposition} from '/lib/decomposition';

const kUnknown = '(unknown)';

const character = new ReactiveVar();
const metadata = new ReactiveVar();
const stroke_order = new ReactiveVar();
const transform = new ReactiveVar();
const tree = new ReactiveVar();

const augmentTreeWithLabels = (node, dependencies) => {
  const value = node.value;
  if (node.type === 'compound') {
    node.class = 'ids';
    node.label = lower(Decomposition.ids_data[value].label);
    node.children.map((child) => augmentTreeWithLabels(child, dependencies));
  } else {
    node.label = dependencies[node.value] || kUnknown;
    if (dependencies[node.value]) {
      node.codepoint = node.value.charCodeAt(0);
    }
  }
}

const constructTree = (row) => {
  const tree = Decomposition.convertDecompositionToTree(row.decomposition);
  augmentTreeWithLabels(tree, row.dependencies);
  return tree;
}

const formatEtymology = (etymology) => {
  const result = [etymology.type];
  if (etymology.type === 'ideographic' ||
      etymology.type === 'pictographic') {
    if (etymology.hint) {
      result.push(`- ${lower(etymology.hint)}`);
    }
  } else {
    result.push('-');
    result.push(etymology.semantic || '?');
    if (etymology.hint) {
      result.push(`(${lower(etymology.hint)})`);
    }
    result.push('provides the meaning while');
    result.push(etymology.phonetic || '?');
    result.push('provides the pronunciation.');
  }
  return result.join(' ');
}

const flushNonReactiveUIState = () => {
  // Blaze tracks a virtual DOM and reuses as many nodes as possible when
  // template variables change (for example, when the user changes character).
  // However, these nodes carry some non-reactive state that should not be
  // preserved across details pages, which we clear in this function.

  // Clear the "how far has the user scrolled" state on the body.
  $('#answer > .body').scrollTop(0);

  // Clear the "how long have CSS animations run for" state on the animation.
  resetAnimation();
}

const linkify = (value) => {
  const result = [];
  for (let character of value) {
    if (character.match(/[\u2E80-\u2EFF]/) ||
        character.match(/[\u3400-\u9FBF]/)) {
      result.push(`<a data-codepoint="${character.charCodeAt(0)}" ` +
                     `class="link">${character}</a>`);
    } else {
      result.push(character);
    }
  }
  return result.join('');
}

const hide = () => {
  character.set();
  stroke_order.set();
  transform.set();
}

const lower = (string) => {
  if (string.length === 0) return string;
  return string[0].toLowerCase() + string.substr(1);
}

const resetAnimation = () => {
  const animation = $('#answer > .body > .animation');
  animation.children().detach().appendTo(animation);
}

const show = (row) => {
  const value = [
    {label: 'Def:', value: row.definition || kUnknown},
    {label: 'Pin:', value: row.pinyin.join(', ') || kUnknown},
    {label: 'Rad:', value: row.radical || kUnknown},
  ];
  if (row.etymology) {
    value.push({
      label: 'For:',
      value: formatEtymology(row.etymology),
    });
  }
  if (row.etymology.wiktionary) {
    value.push({label: 'Wiki:', value: row.etymology.wiktionary});
  }
  character.set(row.character);
  metadata.set(value);
  stroke_order.set(getAnimationData(row.strokes, row.medians));
  transform.set('translateY(0)');
  tree.set(constructTree(row));
  flushNonReactiveUIState();
}

// Meteor template bindings and the onhashchange event handler follow.

const onHashChange = () => {
  const hash = window.location.hash.substr(1);
  const next = String.fromCharCode(hash);
  if (hash.length === 0 || next.length === 0) {
    hide();
  } else if (next !== character.get()) {
    // HACK: We clear the SVG animation when the user changes character to
    // make the transition smoother. The Meteor render loop is a bit slow.
    stroke_order.set();
    readCharacter(next).then(show);
  }
}

window.onhashchange = onHashChange;

Meteor.startup(onHashChange);

Template.answer.events({
  'click .animation': resetAnimation,
  'click .header .back': (event) => {
    Meteor.defer(() => window.location.hash = '');
  },
  'click .link': (event) => {
    const codepoint = $(event.currentTarget).attr('data-codepoint');
    window.location.hash = codepoint;
  },
});

Template.answer.helpers({
  linkify: linkify,
  character: () => character.get(),
  metadata: () => metadata.get(),
  stroke_order: () => stroke_order.get(),
  transform: () => transform.get(),
  tree: () => tree.get(),
});
