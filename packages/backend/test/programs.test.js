import assert from 'node:assert/strict';
import { test } from 'node:test';
import { COLLEGES, PROGRAMS, collegeOf } from '@qampus/core/programs';

test('every program is a clean, non-empty name and appears once', () => {
  assert.ok(PROGRAMS.length > 0);
  for (const program of PROGRAMS) assert.equal(program, program.trim());
  assert.ok(PROGRAMS.every((program) => program.length > 0));
  assert.equal(new Set(PROGRAMS).size, PROGRAMS.length);
});

test('every college has a name and at least one program', () => {
  for (const college of COLLEGES) {
    assert.ok(college.name.trim());
    assert.ok(college.programs.length > 0);
  }
  assert.equal(new Set(COLLEGES.map((college) => college.name)).size, COLLEGES.length);
});

test('the flat list is the colleges in order', () => {
  assert.deepEqual(PROGRAMS, COLLEGES.flatMap((college) => college.programs));
});

test('a program maps back to its college, an unknown name to null', () => {
  assert.equal(collegeOf('BS Information Technology'), 'College of Computer Studies');
  assert.equal(collegeOf('BS Business Administration major in Marketing Management'), 'College of Business Education');
  assert.equal(collegeOf('Bachelor of Arts major in Political Science'), 'College of Arts');
  assert.equal(collegeOf('BS Psychology'), null);
});
