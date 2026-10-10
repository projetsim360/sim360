import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getRoleLabel, getUserDisplayName, getUserInitials } from '../../src/lib/user-display';

test('shows the signed-in user name, not a hardcoded placeholder', () => {
  const user = { firstName: 'Marie', lastName: 'Tremblay', email: 'marie@exemple.ca', role: 'MEMBER' };
  assert.equal(getUserDisplayName(user), 'Marie Tremblay');
  assert.equal(getUserInitials(user), 'MT');
  assert.equal(getRoleLabel(user.role), 'Apprenant');
});

test('falls back to the e-mail when names are missing', () => {
  assert.equal(getUserDisplayName({ firstName: '', lastName: '  ', email: 'jean.roy@exemple.ca' }), 'jean.roy');
  assert.equal(getUserInitials({ email: 'jean.roy@exemple.ca' }), 'J');
});

test('handles a missing user', () => {
  assert.equal(getUserDisplayName(null), 'Utilisateur');
  assert.equal(getUserInitials(undefined), '?');
  assert.equal(getRoleLabel(undefined), '');
});

test('role labels are French', () => {
  assert.equal(getRoleLabel('MENTOR'), 'Mentor');
  assert.equal(getRoleLabel('ADMIN'), 'Administrateur');
  assert.equal(getRoleLabel('UNKNOWN_ROLE'), 'UNKNOWN_ROLE');
});
