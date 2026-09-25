import { describe, it, expect, beforeEach } from 'vitest';
import { useModuleStore } from './moduleStore';

describe('useModuleStore', () => {
  beforeEach(() => {
    useModuleStore.setState({ activeModule: 'IELTS_GT' });
  });

  it('default module aktif adalah IELTS_GT', () => {
    expect(useModuleStore.getState().activeModule).toBe('IELTS_GT');
  });

  it('setActiveModule mengganti module aktif', () => {
    useModuleStore.getState().setActiveModule('BASIC');

    expect(useModuleStore.getState().activeModule).toBe('BASIC');
  });

  it('modulePath memetakan key ke rute', () => {
    expect(useModuleStore.getState().modulePath('BASIC')).toBe('/basic');
    expect(useModuleStore.getState().modulePath('IELTS_GT')).toBe('/ielts');
  });
});
