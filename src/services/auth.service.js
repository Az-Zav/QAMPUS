// QAMPUS Auth Service
// Mock authentication service supporting Google sign-in, guest flow, and profile management.

import { ERROR_CODE, USER_ROLE } from '@/constants/domain';
import { MOCK_USER_STUDENT } from '@/data/mock';
import { createStore } from './createStore';

// Initial state starts with mock student for seamless development
const store = createStore({
  user: MOCK_USER_STUDENT,
});

export const authService = {
  subscribe: store.subscribe,
  getState: store.getState,
  getCurrentUser: () => store.getState().user,

  /**
   * Simulates Google OAuth Sign-in.
   *
   * @param {string} [simulatedDomain] - Test hook to simulate non-institutional domain
   * @returns {Promise<import('@/types').ActionResult<import('@/types').User>>}
   */
  signInWithGoogle: async (simulatedDomain) => {
    if (simulatedDomain && !simulatedDomain.endsWith('.edu')) {
      return {
        ok: false,
        code: ERROR_CODE.INVALID_DOMAIN,
        message: 'Only official university email accounts (@university.edu) are permitted.',
      };
    }

    const user = { ...MOCK_USER_STUDENT };
    store.setState({ user });
    return { ok: true, data: user };
  },

  /**
   * Initializes a guest session with uncompleted profile.
   *
   * @returns {Promise<import('@/types').ActionResult<import('@/types').User>>}
   */
  continueAsGuest: async () => {
    const guestUser = {
      id: `usr_gst_${Date.now().toString().slice(-4)}`,
      role: USER_ROLE.GUEST,
      name: 'Guest Visitor',
      email: null,
      institutionalId: null,
      program: null,
      guestType: null,
    };

    store.setState({ user: guestUser });
    return { ok: true, data: guestUser };
  },

  /**
   * Completes initial profile setup for students or guests.
   *
   * @param {{
   *   institutionalId?: string,
   *   program?: string,
   *   name?: string,
   *   email?: string,
   *   guestType?: string
   * }} params
   * @returns {Promise<import('@/types').ActionResult<import('@/types').User>>}
   */
  completeProfile: async (params) => {
    const current = store.getState().user;
    if (!current) {
      return {
        ok: false,
        code: ERROR_CODE.UNAUTHENTICATED,
        message: 'No active session found.',
      };
    }

    // Student profile completion
    if (current.role === USER_ROLE.STUDENT) {
      const studentId = params.institutionalId?.trim();
      // Simulate duplicate ID rejection
      if (studentId === '9999999') {
        return {
          ok: false,
          code: ERROR_CODE.STUDENT_ID_TAKEN,
          message: 'This Student ID is already linked to another account.',
        };
      }

      const updated = {
        ...current,
        institutionalId: studentId || current.institutionalId,
        program: params.program?.trim() || current.program,
      };

      store.setState({ user: updated });
      return { ok: true, data: updated };
    }

    // Guest profile completion (issues auto-generated guest institutional ID)
    const generatedGuestId = `G${Math.floor(100000 + Math.random() * 900000)}`;
    const updatedGuest = {
      ...current,
      name: params.name?.trim() || current.name,
      email: params.email?.trim() || null,
      guestType: params.guestType || current.guestType,
      institutionalId: generatedGuestId,
    };

    store.setState({ user: updatedGuest });
    return { ok: true, data: updatedGuest };
  },

  /**
   * Updates existing profile fields.
   *
   * @param {{ program?: string, name?: string, email?: string, guestType?: string }} params
   * @returns {Promise<import('@/types').ActionResult<import('@/types').User>>}
   */
  updateProfile: async (params) => {
    const current = store.getState().user;
    if (!current) {
      return {
        ok: false,
        code: ERROR_CODE.UNAUTHENTICATED,
        message: 'No active session found.',
      };
    }

    const updated = {
      ...current,
      ...(params.program !== undefined && { program: params.program }),
      ...(params.name !== undefined && { name: params.name }),
      ...(params.email !== undefined && { email: params.email }),
      ...(params.guestType !== undefined && { guestType: params.guestType }),
    };

    store.setState({ user: updated });
    return { ok: true, data: updated };
  },

  /**
   * Signs out the current user and clears session state.
   *
   * @returns {Promise<import('@/types').ActionResult<null>>}
   */
  signOut: async () => {
    store.setState({ user: null });
    return { ok: true, data: null };
  },
};
